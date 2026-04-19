import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function DoctorHomeScreen({ user, onLogout, onRefresh, loading, error, focus }) {
  const kpis = focus?.kpis;
  const next = focus?.nextAppointments?.[0];

  return (
    <View style={styles.wrap}>
      <Text style={styles.badge}>Doctor Focus Mode</Text>
      <Text style={styles.title}>Bienvenue Dr {user?.fullName}</Text>
      <View style={styles.card}>
        {loading ? <Text style={styles.item}>Chargement focus board...</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.item}>- Total aujourd hui: {kpis?.todayTotal ?? '-'}</Text>
        <Text style={styles.item}>- En attente: {kpis?.waitingCount ?? '-'}</Text>
        <Text style={styles.item}>- En cours: {kpis?.inProgressCount ?? '-'}</Text>
        <Text style={styles.item}>- Termines: {kpis?.doneCount ?? '-'}</Text>

        <Text style={styles.sep}>Prochain patient</Text>
        <Text style={styles.item}>- Nom: {next?.patientId?.fullName || '-'}</Text>
        <Text style={styles.item}>- Service: {next?.serviceId?.name || '-'}</Text>
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
  badge: { color: '#bfe2fe', fontWeight: '700' },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 6, marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14 },
  item: { color: '#1c2340', fontSize: 14, marginBottom: 6 },
  error: { color: '#b91c1c', fontWeight: '700', marginBottom: 8 },
  sep: { color: '#1c2340', fontWeight: '800', marginTop: 4, marginBottom: 6 },
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
