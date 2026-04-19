import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString();
}

export default function PatientHomeScreen({ user, onLogout, onRefresh, loading, error, dashboard }) {
  const stats = dashboard?.stats;
  const next = dashboard?.nextAppointment;

  return (
    <View style={styles.wrap}>
      <Text style={styles.badge}>Patient portal</Text>
      <Text style={styles.title}>Bienvenue {user?.fullName}</Text>

      <View style={styles.card}>
        {loading ? <Text style={styles.item}>Chargement dashboard...</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.item}>- RDV a venir: {stats?.upcoming ?? '-'}</Text>
        <Text style={styles.item}>- RDV passes: {stats?.past ?? '-'}</Text>
        <Text style={styles.item}>- Notifications non lues: {stats?.unreadNotifications ?? '-'}</Text>
        <Text style={styles.item}>- Dossiers medicaux: {stats?.totalFiles ?? '-'}</Text>

        <Text style={styles.sep}>Prochain rendez-vous</Text>
        <Text style={styles.item}>- Date: {formatDate(next?.scheduledAt)}</Text>
        <Text style={styles.item}>- Service: {next?.serviceId?.name || '-'}</Text>
        <Text style={styles.item}>- Medecin: {next?.doctorId?.userId?.fullName || '-'}</Text>
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
  badge: { color: '#93d0fd', fontWeight: '700' },
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
