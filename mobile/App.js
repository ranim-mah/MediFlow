import 'react-native-gesture-handler';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { login } from './src/api/authApi';
import LoginScreen from './src/screens/LoginScreen';
import PatientHomeScreen from './src/screens/PatientHomeScreen';
import PatientAppointmentsScreen from './src/screens/PatientAppointmentsScreen';
import DoctorHomeScreen from './src/screens/DoctorHomeScreen';
import AdminHomeScreen from './src/screens/AdminHomeScreen';
import LiveAppointmentsScreen from './src/screens/common/LiveAppointmentsScreen';
import { clearSession, loadSession, saveSession } from './src/storage/sessionStorage';
import { syncPushToken } from './src/services/pushNotifications';
import {
  getAdminDashboard,
  getAdminAppointments,
  getDoctorFocusBoard,
  getDoctorAppointments,
  getPatientDashboard,
  getPatientAppointments,
  cancelPatientAppointment,
  updateAdminAppointmentStatus,
  updateDoctorAppointmentStatus,
  registerDeviceToken,
} from './src/api/portalApi';

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0f1425',
    card: '#111a31',
    text: '#ffffff',
    border: '#202a4a',
    primary: '#1f62d8',
  },
};

function RoleTabs({ role, session, onLogout }) {
  const [homeData, setHomeData] = useState(null);
  const [homeLoading, setHomeLoading] = useState(true);
  const [homeError, setHomeError] = useState('');

  const fetchRoleHome = async () => {
    try {
      setHomeLoading(true);
      setHomeError('');

      const token = session?.accessToken;
      let data;
      if (role === 'patient') {
        data = await getPatientDashboard(token);
      } else if (role === 'doctor') {
        data = await getDoctorFocusBoard(token);
      } else {
        data = await getAdminDashboard(token);
      }

      setHomeData(data);
    } catch (err) {
      setHomeError(err.message || 'Echec chargement donnees');
      setHomeData(null);
    } finally {
      setHomeLoading(false);
    }
  };

  useEffect(() => {
    fetchRoleHome();
  }, [role, session?.accessToken]);

  const screenOptions = useMemo(
    () => ({
      headerStyle: { backgroundColor: '#111a31' },
      headerTintColor: '#ffffff',
      tabBarStyle: { backgroundColor: '#111a31', borderTopColor: '#202a4a' },
      tabBarActiveTintColor: '#6bb9ff',
      tabBarInactiveTintColor: '#95a5cf',
    }),
    []
  );

  if (role === 'patient') {
    return (
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen name="Accueil">
          {() => (
            <PatientHomeScreen
              user={session.user}
              onLogout={onLogout}
              onRefresh={fetchRoleHome}
              loading={homeLoading}
              error={homeError}
              dashboard={homeData}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Rendez-vous">
          {() => (
            <PatientAppointmentsScreen
              title="Mes rendez-vous"
              fetchAppointments={() => getPatientAppointments(session?.accessToken)}
              onCancelAppointment={(appointmentId, reason) =>
                cancelPatientAppointment(session?.accessToken, appointmentId, reason)
              }
              onLogout={onLogout}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    );
  }

  if (role === 'doctor') {
    return (
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen name="Focus">
          {() => (
            <DoctorHomeScreen
              user={session.user}
              onLogout={onLogout}
              onRefresh={fetchRoleHome}
              loading={homeLoading}
              error={homeError}
              focus={homeData}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Planning">
          {() => (
            <LiveAppointmentsScreen
              title="Planning medecin"
              fetchAppointments={() => getDoctorAppointments(session?.accessToken)}
              statusActions={['confirmed', 'waiting', 'in_progress', 'completed']}
              onUpdateStatus={(appointmentId, status) =>
                updateDoctorAppointmentStatus(session?.accessToken, appointmentId, status)
              }
              onLogout={onLogout}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    );
  }

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Dashboard">
        {() => (
          <AdminHomeScreen
            user={session.user}
            onLogout={onLogout}
            onRefresh={fetchRoleHome}
            loading={homeLoading}
            error={homeError}
            dashboard={homeData}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Calendrier">
        {() => (
          <LiveAppointmentsScreen
            title="Calendrier clinique"
            fetchAppointments={() => getAdminAppointments(session?.accessToken)}
            statusActions={['confirmed', 'waiting', 'in_progress', 'completed', 'cancelled']}
            onUpdateStatus={(appointmentId, status) =>
              updateAdminAppointmentStatus(session?.accessToken, appointmentId, status)
            }
            onLogout={onLogout}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function AuthStack({ onSubmit, loading, error }) {
  return (
    <RootStack.Navigator>
      <RootStack.Screen
        name="Connexion"
        options={{
          headerStyle: { backgroundColor: '#111a31' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        {() => <LoginScreen onSubmit={onSubmit} loading={loading} error={error} />}
      </RootStack.Screen>
    </RootStack.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [pushStatus, setPushStatus] = useState('');

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const savedSession = await loadSession();
        if (mounted && savedSession) {
          setSession(savedSession);
        }
      } finally {
        if (mounted) {
          setBooting(false);
        }
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function attachPushToken() {
      if (!session?.accessToken) {
        return;
      }

      try {
        setPushStatus('');
        const expoPushToken = await syncPushToken(session.accessToken, ({ token, platform, accessToken }) =>
          registerDeviceToken(accessToken, token, platform)
        );

        if (!cancelled) {
          setPushStatus(expoPushToken ? 'Notifications push active' : 'Push non configure');
        }
      } catch (err) {
        if (!cancelled) {
          setPushStatus(err.message || 'Push non configure');
        }
      }
    }

    attachPushToken();

    return () => {
      cancelled = true;
    };
  }, [session?.accessToken]);

  const handleLogin = async ({ identifier, password }) => {
    try {
      setLoading(true);
      setError('');
      const data = await login({ identifier, password });
      setSession(data);
      await saveSession(data);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await clearSession();
    setSession(null);
    setError('');
    setPushStatus('');
  };

  const role = session?.user?.role || null;

  if (booting) {
    return (
      <View style={styles.loadingWrap}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#66b6ff" />
        <Text style={styles.loadingText}>Initialisation Mediflow...</Text>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <NavigationContainer theme={navTheme}>
        {!session ? (
          <AuthStack onSubmit={handleLogin} loading={loading} error={error} />
        ) : (
          <RoleTabs role={role} session={session} onLogout={handleLogout} />
        )}
      </NavigationContainer>

      {session ? <Text style={styles.pushStatus}>{pushStatus || 'Push setup...'}</Text> : null}
      <Text style={styles.footer}>Mediflow mobile - Phase 5 navigation baseline</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f1425',
  },
  loadingWrap: {
    flex: 1,
    backgroundColor: '#0f1425',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#d7e2ff',
    fontSize: 14,
  },
  footer: {
    color: '#7f8aa8',
    textAlign: 'center',
    fontSize: 12,
    paddingVertical: 8,
  },
  pushStatus: {
    color: '#9bc1ff',
    textAlign: 'center',
    fontSize: 11,
    paddingTop: 8,
  },
});

