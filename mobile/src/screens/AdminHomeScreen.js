import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function AdminHomeScreen({ user, onLogout, onRefresh, loading, error, dashboard }) {
  const kpis = dashboard?.kpis;

  return (
    <View style={styles.wrap}>
      <Text style={styles.badge}>Admin portal</Text>
      <Text style={styles.title}>Bienvenue {user?.fullName}</Text>
      <View style={styles.card}>
        {loading ? <Text style={styles.item}>Chargement dashboard...</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.item}>- Patients total: {kpis?.totalPatients ?? '-'}</Text>
        <Text style={styles.item}>- Medecins actifs: {kpis?.totalDoctors ?? '-'}</Text>
        <Text style={styles.item}>- RDV aujourd hui: {kpis?.appointmentsToday ?? '-'}</Text>
        <Text style={styles.item}>- RDV en attente: {kpis?.pendingToday ?? '-'}</Text>
        <Text style={styles.item}>- File active: {kpis?.activeQueueToday ?? '-'}</Text>
        <Text style={styles.item}>- Revenue mensuel: {kpis?.monthlyRevenue ?? '-'}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.btnGhost} onPress={onRefresh}>
          <Text style={styles.btnGhostText}>Actualiser</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={onLogout}>
          <Text style={styles.btnText}>Deconnexion</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center' },
  badge: { color: '#60b4fa', fontWeight: '700' },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 6, marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14 },
  item: { color: '#1c2340', fontSize: 14, marginBottom: 6 },
  error: { color: '#b91c1c', fontWeight: '700', marginBottom: 8 },
  actions: { marginTop: 14, flexDirection: 'row', gap: 8 },
  btnGhost: {
    flex: 1,
    backgroundColor: '#d9e8ff',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  btnGhostText: { color: '#17346d', fontWeight: '700' },
  btn: { flex: 1, backgroundColor: '#0a2758', borderRadius: 12, paddingVertical: 11, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
});
