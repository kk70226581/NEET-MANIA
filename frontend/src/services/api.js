import axios from 'axios';

// Accept either the API root (https://example.onrender.com) or the full
// API URL (https://example.onrender.com/api). This prevents a deployment
// setting without `/api` from sending requests to non-existent routes.
const configuredApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const normalizedApiUrl = configuredApiUrl.replace(/\/+$/, '');
const API_URL = normalizedApiUrl.endsWith('/api')
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
  logout: () => api.post('/auth/logout')
};

// Questions APIs
export const questionsAPI = {
  getQuestions: (params) => api.get('/questions', { params }),
  getQuestion: (id) => api.get(`/questions/${id}`),
  createQuestion: (data) => api.post('/questions', data),
  updateQuestion: (id, data) => api.put(`/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/questions/${id}`),
  publishQuestion: (id) => api.put(`/questions/${id}/publish`),
  aiFixQuestion: (id) => api.post(`/questions/${id}/ai-fix`),
  uploadPDF: (formData) => api.post('/questions/upload-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadImage: (formData) => api.post('/questions/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getStats: () => api.get('/questions/stats'),
  getMetadata: () => api.get('/questions/metadata'),
  getAdminQuestions: (params) => api.get('/questions/admin/review', { params }),
  classifyQuestions: (data) => api.post('/questions/classify', data),
  clearAllQuestions: (params) => api.delete('/questions/admin/clear-all', { params }),
  importPatternQuestions: (data) => api.post('/questions/import-pattern', data),
  reviewQuestions: (data) => api.post('/questions/review-db', data),
  generateQuestions: (data) => api.post('/questions/generate', data)
};

// Tests APIs
export const testsAPI = {
  generateTest: (data) => api.post('/tests/generate', data),
  getTest: (testId) => api.get(`/tests/${testId}`),
  getTestQuestions: (testId) => api.get(`/tests/${testId}/questions`),
  startTest: (testId) => api.post(`/tests/${testId}/start`),
  saveResponse: (attemptId, data) => api.put(`/tests/attempts/${attemptId}/response`, data),
  submitTest: (attemptId) => api.put(`/tests/attempts/${attemptId}/submit`),
  getResults: (attemptId) => api.get(`/tests/attempts/${attemptId}/results`),
  getUserAttempts: (params) => api.get('/tests/attempts', { params })
};

export const mistakesAPI = {
  getMistakes: (params) => api.get('/mistakes', { params }),
  updateMistake: (id, data) => api.patch(`/mistakes/${id}`, data)
};

export const mentorAPI = {
  getConversations: () => api.get('/mentor/conversations'),
  createConversation: () => api.post('/mentor/conversations'),
  getConversation: (conversationId) => api.get(`/mentor/conversations/${conversationId}`),
  chat: (conversationId, message) => api.post('/mentor/chat', { conversationId, message })
};

export const pyqAPI = {
  getMetadata: () => api.get('/pyq/metadata'),
  explore: (params) => api.get('/pyq/explore', { params }),
  getQuestion: (id) => api.get(`/pyq/questions/${id}`),
  submitAttempt: (id, data) => api.post(`/pyq/questions/${id}/attempt`, data),
  setBookmark: (id, bookmarked) => api.put(`/pyq/questions/${id}/bookmark`, { bookmarked }),
  saveNote: (id, note) => api.put(`/pyq/questions/${id}/note`, { note }),
  report: (id, data) => api.post(`/pyq/questions/${id}/report`, data),
  getTrends: (params) => api.get('/pyq/trends', { params }),
  getPapers: () => api.get('/pyq/papers'),
  getPerformance: () => api.get('/pyq/performance'),
  createTest: (data) => api.post('/pyq/tests', data),
  getCurriculum: () => api.get('/pyq/curriculum'),
  validateImport: (questions) => api.post('/pyq/admin/validate-import', { questions }),
  importQuestions: (questions) => api.post('/pyq/admin/import', { questions }),
  getAdminQueue: () => api.get('/pyq/admin/queue'),
  verifyQuestion: (id, legalStatus) => api.put(`/pyq/admin/questions/${id}/verify`, { legalStatus }),
  publishQuestion: (id) => api.put(`/pyq/admin/questions/${id}/publish`),
  getReports: () => api.get('/pyq/admin/reports'),
  resolveReport: (interactionId, reportId, status) => api.put(`/pyq/admin/reports/${interactionId}/${reportId}`, { status })
};

export default api;
