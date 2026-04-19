import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString();
}

function AppointmentCard({ item, reason, onReasonChange, onCancel, busy }) {
  const canCancel = !['cancelled', 'completed'].includes(String(item?.status || '').toLowerCase());

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{item?.serviceId?.name || 'Rendez-vous'}</Text>
      <Text style={styles.row}>- Date: {formatDate(item?.scheduledAt)}</Text>
      <Text style={styles.row}>- Statut: {item?.status || '-'}</Text>
      <Text style={styles.row}>- Medecin: {item?.doctorId?.userId?.fullName || '-'}</Text>
      <Text style={styles.row}>- Branche: {item?.branchId?.name || '-'}</Text>

      {canCancel ? (
        <View style={styles.cancelBox}>
          <Text style={styles.cancelLabel}>Raison d annulation</Text>
          <TextInput
            value={reason}
            onChangeText={onReasonChange}
            placeholder="Ex: urgence, indisponibilite..."
            placeholderTextColor="#8a95b3"
            style={styles.input}
            multiline
          />
          <Pressable style={[styles.cancelBtn, busy && styles.cancelBtnDisabled]} disabled={busy} onPress={onCancel}>
            <Text style={styles.cancelBtnText}>{busy ? 'Annulation...' : 'Annuler ce rendez-vous'}</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.closed}>Annulation non disponible</Text>
      )}
    </View>
  );
}

export default function PatientAppointmentsScreen({ title, fetchAppointments, onLogout, onCancelAppointment }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [reasons, setReasons] = useState({});

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

  const handleReasonChange = useCallback((appointmentId, value) => {
    setReasons((current) => ({ ...current, [appointmentId]: value }));
  }, []);

  const handleCancel = useCallback(
    async (appointmentId) => {
      if (!onCancelAppointment || !appointmentId) return;

      try {
        setBusyId(appointmentId);
        setError('');
        const reason = String(reasons[appointmentId] || '').trim();
        await onCancelAppointment(appointmentId, reason);
        setReasons((current) => {
          const next = { ...current };
          delete next[appointmentId];
          return next;
        });
        await load();
      } catch (err) {
        setError(err.message || 'Annulation impossible');
      } finally {
        setBusyId('');
      }
    },
    [load, onCancelAppointment, reasons]
  );

  const canRefresh = useMemo(() => !loading, [loading]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.badge}>Mes rendez-vous</Text>
      <Text style={styles.headline}>{title}</Text>

      {loading ? <Text style={styles.state}>Chargement...</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(item, index) => item?._id || String(index)}
        renderItem={({ item }) => (
          <AppointmentCard
            item={item}
            reason={reasons[item?._id] || ''}
            onReasonChange={(value) => handleReasonChange(item?._id, value)}
            onCancel={() => handleCancel(item?._id)}
            busy={busyId === item?._id}
          />
        )}
        ListEmptyComponent={!loading ? <Text style={styles.state}>Aucun rendez-vous a venir.</Text> : null}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.actions}>
        <Pressable style={[styles.btnGhost, !canRefresh && styles.btnDisabled]} disabled={!canRefresh} onPress={load}>
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
  cancelBox: {
    marginTop: 10,
    backgroundColor: '#f4f7ff',
    borderRadius: 12,
    padding: 10,
  },
  cancelLabel: { color: '#17346d', fontWeight: '800', marginBottom: 6 },
  input: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: '#d6def0',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: '#0f1425',
    textAlignVertical: 'top',
  },
  cancelBtn: {
    marginTop: 10,
    backgroundColor: '#c62828',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnDisabled: { opacity: 0.7 },
  cancelBtnText: { color: '#fff', fontWeight: '800' },
  closed: { marginTop: 10, color: '#6d7895', fontStyle: 'italic' },
  actions: { marginTop: 12, flexDirection: 'row', gap: 8 },
  btnGhost: {
    flex: 1,
    backgroundColor: '#d9e8ff',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.7 },
  btnGhostText: { color: '#17346d', fontWeight: '700' },
  btn: { flex: 1, backgroundColor: '#0a2758', borderRadius: 12, paddingVertical: 11, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
});
