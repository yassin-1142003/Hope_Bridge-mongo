import api from './api';

export const chatAPI = {
  getUsers: () => api.get('/chat/users'),
  getMessages: (userId) => api.get(`/chat/${userId}`),
  sendMessage: (userId, message) => api.post(`/chat/${userId}`, { message }),
  markTyping: (userId, isTyping) => api.post(`/chat/${userId}/typing`, { isTyping }),
  getTypingStatus: (userId) => api.get(`/chat/${userId}/typing`),
  markAsRead: (userId) => api.post(`/chat/${userId}/read`),
  getUnreadCounts: () => api.get('/chat/unread/counts'),
};
