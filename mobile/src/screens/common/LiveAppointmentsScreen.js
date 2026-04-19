import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString();
}

function AppointmentCard({ item, statusActions, onUpdateStatus, busyId }) {
  const patientName = item?.patientId?.fullName || '-';
  const doctorName = item?.doctorId?.userId?.fullName || item?.doctor || '-';
  const serviceName = item?.serviceId?.name || item?.service?.name || '-';
  const branchName = item?.branchId?.name || item?.branch?.name || '-';
  const canUpdate = Boolean(onUpdateStatus && Array.isArray(statusActions) && statusActions.length > 0);
  const isBusy = busyId && busyId === item?._id;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{patientName}</Text>
      <Text style={styles.row}>- Date: {formatDate(item?.scheduledAt)}</Text>
      <Text style={styles.row}>- Statut: {item?.status || '-'}</Text>
      <Text style={styles.row}>- Medecin: {doctorName}</Text>
      <Text style={styles.row}>- Service: {serviceName}</Text>
      <Text style={styles.row}>- Branche: {branchName}</Text>

      {canUpdate ? (
        <View style={styles.statusRow}>
          {statusActions.map((status) => (
            <Pressable
              key={status}
              style={[styles.statusBtn, isBusy && styles.statusBtnDisabled]}
              disabled={Boolean(isBusy)}
              onPress={() => onUpdateStatus(item?._id, status)}
            >
              <Text style={styles.statusBtnText}>{isBusy ? '...' : status}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function LiveAppointmentsScreen({
  title,
  fetchAppointments,
  onLogout,
  statusActions,
  onUpdateStatus,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchAppointments();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Echec de chargement');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [fetchAppointments]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpdateStatus = async (appointmentId, status) => {
    if (!onUpdateStatus || !appointmentId) return;

    try {
      setBusyId(appointmentId);
      await onUpdateStatus(appointmentId, status);
      await load();
    } catch (err) {
      setError(err.message || 'Mise a jour impossible');
    } finally {
      setBusyId('');
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.badge}>Rendez-vous live</Text>
      <Text style={styles.headline}>{title}</Text>

      {loading ? <Text style={styles.state}>Chargement...</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(item, index) => item?._id || String(index)}
        renderItem={({ item }) => (
          <AppointmentCard
            item={item}
            statusActions={statusActions}
            onUpdateStatus={handleUpdateStatus}
            busyId={busyId}
          />
        )}
        ListEmptyComponent={!loading ? <Text style={styles.state}>Aucun rendez-vous.</Text> : null}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.actions}>
        <Pressable style={styles.btnGhost} onPress={load}>
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
  wrap: { flex: 1, padding: 16 },
  badge: { color: '#97d4ff', fontWeight: '700' },
  headline: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 6, marginBottom: 10 },
  state: { color: '#d3dcf4', marginBottom: 8 },
  error: { color: '#fecaca', marginBottom: 8, fontWeight: '700' },
  listContent: { paddingBottom: 10, gap: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
  },
  title: { color: '#111a31', fontWeight: '800', marginBottom: 6 },
  row: { color: '#1c2340', fontSize: 13, marginBottom: 3 },
  statusRow: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  statusBtn: {
    backgroundColor: '#edf3ff',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  statusBtnDisabled: { opacity: 0.6 },
  statusBtnText: { color: '#17346d', fontSize: 12, fontWeight: '700' },
  actions: { marginTop: 12, flexDirection: 'row', gap: 8 },
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
