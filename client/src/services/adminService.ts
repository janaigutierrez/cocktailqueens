import api from './api';

export const adminService = {
  login: async (password: string) => {
    const { data } = await api.post<{ token: string }>('/admin/login', { password });
    localStorage.setItem('admin-token', data.token);
    return data;
  },
  verify: () => api.get('/admin/verify').then((r) => r.data),
  logout: () => localStorage.removeItem('admin-token'),
  isLoggedIn: () => !!localStorage.getItem('admin-token'),
};
