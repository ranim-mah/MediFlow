import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@mediflow_mobile_session';

export async function loadSession() {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveSession(session) {
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage failures for now to keep login flow resilient.
  }
}

export async function clearSession() {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage failures for now to keep logout flow resilient.
  }
}
