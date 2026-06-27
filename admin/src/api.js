import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const admin = JSON.parse(localStorage.getItem('adminUser'));
  if (admin && admin.token) {
    config.headers.Authorization = `Bearer ${admin.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('adminUser');
      // Redirect to admin login page
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
