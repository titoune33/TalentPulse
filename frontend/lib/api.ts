import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  signup: (data: { email: string; password: string; name?: string }) =>
    api.post('/api/auth/signup', data),
  getMe: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
};

export const employeeApi = {
  getAll: () => api.get('/api/employees'),
  getById: (id: string) => api.get(`/api/employees/${id}`),
  create: (data: any) => api.post('/api/employees', data),
  update: (id: string, data: any) => api.put(`/api/employees/${id}`, data),
  delete: (id: string) => api.delete(`/api/employees/${id}`),
};

export const postApi = {
  getAll: () => api.get('/api/posts'),
  create: (data: any) => api.post('/api/posts', data),
  like: (postId: string) => api.post(`/api/posts/${postId}/like`),
};

export const cvApi = {
  analyze: (cvText: string, jobDescription?: string) =>
    api.post('/api/cv/analyze', { cvText, jobDescription }),
  match: (cvText: string, jobDescription: string) =>
    api.post('/api/cv/match', { cvText, jobDescription }),
};

export default api;