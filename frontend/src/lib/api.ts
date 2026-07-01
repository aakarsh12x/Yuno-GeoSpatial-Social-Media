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

    // If we get a 401, the token is expired/invalid — clear it and redirect to login
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.match(/^\/(login|register)?$/)) {
        window.location.href = '/';
      }
    }

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
  me: () => api.get('/users/profile/me'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getById: (id: string) => api.get(`/users/${id}`),
};

export const DiscoverAPI = {
  nearby: (params: any) => api.get('/discover', { params }),
  stats: () => api.get('/discover/stats'),
  popularInterests: (params: any) => api.get('/discover/popular-interests', { params }),
};

export const ActivitiesAPI = {
  getLocal: (city?: string) => api.get('/activities', { params: city ? { city } : {} }),
};

export const EventsAPI = {
  getNearby: (lat: number, lng: number, radius = 15) =>
    api.get('/events/nearby', { params: { lat, lng, radius } }),
};

export const PlacesAPI = {
  getNearby: (lat: number, lng: number, radius = 10) =>
    api.get('/events/places', { params: { lat, lng, radius } }),
};

export const SparksAPI = {
  send: (receiverId: number, message?: string) =>
    api.post('/sparks/send', { receiverId, message }),
  accept: (sparkId: number) => api.post(`/sparks/${sparkId}/accept`),
  reject: (sparkId: number) => api.post(`/sparks/${sparkId}/reject`),
  getPending: () => api.get('/sparks/pending'),
  getAll: () => api.get('/sparks'),
  getStats: () => api.get('/sparks/stats'),
};

export const ChatAPI = {
  getUserChats: () => api.get('/chat/user/chats'),
  getChatMessages: (chatId: number, limit = 50, offset = 0) =>
    api.get(`/chat/chats/${chatId}`, { params: { limit, offset } }),
  markRead: (chatId: number) => api.post(`/chat/chats/${chatId}/read`),
};

export const VibeAPI = {
  getWeather: (lat: number, lng: number, city?: string) =>
    api.get('/vibe/weather', { params: { lat, lng, city } }),
  getLandmarkQuest: (lat: number, lng: number, city?: string) =>
    api.get('/vibe/landmark-quest', { params: { lat, lng, city } }),
};
