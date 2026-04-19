import api from './api';

export const doctorApi = {
  getFocus: () => api.get('/doctor/focus'),
  listAppointments: ({ status = '', date = '' } = {}) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (date) params.set('date', date);
    return api.get(`/doctor/appointments?${params.toString()}`);
  },
  getAppointmentDetail: (id) => api.get(`/doctor/appointments/${id}`),
  updateAppointmentStatus: ({ id, status }) => api.patch(`/doctor/appointments/${id}/status`, { status }),
  startVisit: (id) => api.post(`/doctor/appointments/${id}/start-visit`),
  saveVisitNotes: ({ visitId, complaint, diagnosis, plan, decision, vitals }) =>
    api.patch(`/doctor/visits/${visitId}`, { complaint, diagnosis, plan, decision, vitals }),
};
