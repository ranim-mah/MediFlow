import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ComingSoonScreen({ title, points, onLogout }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.badge}>Phase 5 en cours</Text>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.card}>
        {points.map((point) => (
          <Text key={point} style={styles.item}>
            - {point}
          </Text>
        ))}
      </View>

      <Pressable style={styles.btn} onPress={onLogout}>
        <Text style={styles.btnText}>Deconnexion</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', padding: 16 },
  badge: { color: '#97d4ff', fontWeight: '700' },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 6, marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14 },
  item: { color: '#1c2340', fontSize: 14, marginBottom: 6 },
  btn: {
    marginTop: 14,
    backgroundColor: '#0a2758',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700' },
});
