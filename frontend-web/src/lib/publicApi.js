import api from './api';

export const publicApi = {
  listServices: () => api.get('/public/services'),
  listBranches: () => api.get('/public/branches'),
  quickBook: (payload) => api.post('/public/quick-book', payload),
};
