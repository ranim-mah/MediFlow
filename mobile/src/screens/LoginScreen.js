import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function LoginScreen({ onSubmit, loading, error }) {
  const [identifier, setIdentifier] = useState('admin@mediflow.test');
  const [password, setPassword] = useState('admin123');

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Mediflow Mobile</Text>
      <Text style={styles.subtitle}>Connexion - par role</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Email / phone</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          value={identifier}
          onChangeText={setIdentifier}
          placeholder="admin@mediflow.test"
          placeholderTextColor="#8a95b3"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#8a95b3"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.btn, loading && styles.btnDisabled]}
          disabled={loading}
          onPress={() => onSubmit({ identifier, password })}
        >
          <Text style={styles.btnText}>{loading ? 'Connexion...' : 'Se connecter'}</Text>
        </Pressable>

        <Text style={styles.hint}>Test: admin@mediflow.test / admin123</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center' },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#a8b3cc', marginTop: 6, marginBottom: 14 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14 },
  label: { color: '#1c2340', fontWeight: '700', marginTop: 8, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#d7deef',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0f1425',
  },
  btn: {
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: '#1f62d8',
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontWeight: '800' },
  error: { marginTop: 10, color: '#b91c1c', fontWeight: '700' },
  hint: { marginTop: 10, color: '#5d6787', fontSize: 12 },
});
