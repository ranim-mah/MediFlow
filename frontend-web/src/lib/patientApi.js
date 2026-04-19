import api from './api';

export const patientApi = {
  getDashboard: () => api.get('/patient/me'),
  listAppointments: (scope = 'all') => api.get(`/patient/appointments?scope=${scope}`),
  createAppointment: (payload) => api.post('/patient/appointments', payload),
  cancelAppointment: (id, reason) => api.patch(`/patient/appointments/${id}/cancel`, { reason }),
  getMedicalFile: () => api.get('/patient/medical-file'),
  getTimeline: () => api.get('/patient/timeline'),
  getQueue: () => api.get('/patient/queue'),
  listNotifications: () => api.get('/patient/notifications'),
  markNotificationRead: (id) => api.patch(`/patient/notifications/${id}/read`),
  markAllNotificationsRead: () => api.patch('/patient/notifications/read-all'),
};
