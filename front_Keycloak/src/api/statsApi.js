export const getDashboardStats = (axios) =>
  axios.get('/api/stats/dashboard');

export const getGlobalStats = (axios) =>
  axios.get('/api/stats/global');

export const getUsers = (axios) =>
  axios.get('/api/users');

export const createUser = (axios, payload) =>
  axios.post('/api/users', payload);

export const deleteUser = (axios, id) =>
  axios.delete(`/api/users/${id}`);

export const resetPassword = (axios, id, newPassword) =>
  axios.put(`/api/users/${id}/reset-password`, { newPassword });

export const getAuditLogs = (axios, params = {}) =>
  axios.get('/api/audit-logs', { params });
