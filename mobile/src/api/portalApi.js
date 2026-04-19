import { Platform } from 'react-native';

const LOCALHOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || `http://${LOCALHOST}:5000/api`;

async function request(path, accessToken, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || !json?.success) {
    throw new Error(json?.message || `HTTP ${res.status}`);
  }

  return json.data;
}

export function getPatientDashboard(accessToken) {
  return request('/patient/me', accessToken);
}

export function getDoctorFocusBoard(accessToken) {
  return request('/doctor/focus', accessToken);
}

export function getAdminDashboard(accessToken) {
  return request('/admin/dashboard', accessToken);
}

export async function getPatientAppointments(accessToken) {
  const data = await request('/patient/appointments?scope=upcoming', accessToken);
  return Array.isArray(data) ? data : [];
}

export function cancelPatientAppointment(accessToken, appointmentId, reason) {
  return request(`/patient/appointments/${appointmentId}/cancel`, accessToken, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}

export async function getDoctorAppointments(accessToken) {
  const data = await request('/doctor/appointments', accessToken);
  return Array.isArray(data?.items) ? data.items : [];
}

export async function getAdminAppointments(accessToken) {
  const data = await request('/admin/appointments?limit=30', accessToken);
  return Array.isArray(data?.items) ? data.items : [];
}

export function updateDoctorAppointmentStatus(accessToken, appointmentId, status) {
  return request(`/doctor/appointments/${appointmentId}/status`, accessToken, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function updateAdminAppointmentStatus(accessToken, appointmentId, status) {
  return request(`/admin/appointments/${appointmentId}/status`, accessToken, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function registerDeviceToken(accessToken, token, platform) {
  return request('/auth/device-token', accessToken, {
    method: 'POST',
    body: JSON.stringify({ token, platform }),
  });
}
