import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

export const tasksAPI = {
  getMySentTasks: (params) => api.get('/tasks/my-sent', { params }),
  getMyReceivedTasks: (params) => api.get('/tasks/my-received', { params }),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  createTask: (taskData) => api.post('/tasks', taskData),
  updateTask: (id, taskData) => api.patch(`/tasks/${id}`, taskData),
  addComment: (id, commentData) => api.post(`/tasks/${id}/comments`, commentData),
  markComplete: (id) => api.post(`/tasks/${id}/mark-complete`),
  sendReminder: (id) => api.post(`/tasks/${id}/reminder`),
  getRelatedTasks: (id) => api.get(`/tasks/${id}/related`),
};

export const alertsAPI = {
  getAlerts: () => api.get('/alerts'),
  markAlertRead: (alertId) => api.patch(`/alerts/${alertId}/read`),
};

export default api;
