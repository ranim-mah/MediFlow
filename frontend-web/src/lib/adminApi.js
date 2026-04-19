import api from './api';

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  listAppointments: ({
    q = '',
    status = '',
    branchId = '',
    dateFrom = '',
    dateTo = '',
    page = 1,
    limit = 20,
  } = {}) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    if (branchId) params.set('branchId', branchId);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    if (page) params.set('page', String(page));
    if (limit) params.set('limit', String(limit));
    return api.get(`/admin/appointments?${params.toString()}`);
  },
  listPatients: ({ q = '', page = 1, limit = 20, risk = '' } = {}) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (page) params.set('page', String(page));
    if (limit) params.set('limit', String(limit));
    if (risk) params.set('risk', risk);
    return api.get(`/admin/patients?${params.toString()}`);
  },
  getPatientDetails: (id) => api.get(`/admin/patients/${id}`),
  getCalendar: ({ start, end, branchId } = {}) => {
    const params = new URLSearchParams();
    if (start) params.set('start', start);
    if (end) params.set('end', end);
    if (branchId) params.set('branchId', branchId);
    return api.get(`/admin/appointments/calendar?${params.toString()}`);
  },
  updateAppointmentStatus: ({ id, status, reason }) =>
    api.patch(`/admin/appointments/${id}/status`, { status, reason }),
};