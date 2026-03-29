import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const AuthAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
};

export const UserAPI = {
  me: () => api.get('/user/profile/me'),
  updateProfile: (data: any) => api.put('/user/profile', data),
  getById: (id: string) => api.get(`/user/${id}`),
};

export const DiscoverAPI = {
  nearby: (params: any) => api.get('/discover', { params }),
  stats: () => api.get('/discover/stats'),
  popularInterests: (params: any) => api.get('/discover/popular-interests', { params }),
};
