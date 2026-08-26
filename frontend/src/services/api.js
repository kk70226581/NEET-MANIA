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
  adminLogin: (data) => api.post('/auth/admin/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
  logout: () => api.post('/auth/logout')
};

export const adminAPI = {
  getOverview: () => api.get('/admin/overview')
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
  getMetadata: (params) => api.get('/questions/metadata', { params }),
  getAdminQuestions: (params) => api.get('/questions/admin/review', { params }),
  classifyQuestions: (data) => api.post('/questions/classify', data),
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
  getUserAttempts: (params) => api.get('/tests/attempts', { params }),
  explainQuestion: (attemptId, questionId) => api.post(`/tests/attempts/${attemptId}/explain-question`, { questionId })
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

export const retentionAPI = {
  getDue: () => api.get('/retention'),
  start: (chapter) => api.post('/retention/start', chapter ? { chapter } : {}),
  submit: (challengeId, answers) => api.post('/retention/submit', { challengeId, answers })
};

export const nursingAPI = {
  getCatalog: () => api.get('/nursing/content/catalog'),
  getSubjects: () => api.get('/nursing/syllabus/subjects'),
  getChapters: (subjectSlug) => api.get('/nursing/syllabus/chapters', { params: { subjectSlug } }),
  getChapterPractice: (chapterId, params) => api.get(`/nursing/practice/chapter/${chapterId}`, { params }),
  getQuestions: (params) => api.get('/nursing/content/questions', { params }),
  getQuestion: (id) => api.get(`/nursing/content/questions/${id}`),
  answerQuestion: (id, data) => api.post(`/nursing/content/questions/${id}/answer`, data),
  getAnalytics: () => api.get('/nursing/content/analytics'),
  getExams: () => api.get('/nursing/exams'),
  getAttempts: () => api.get('/nursing/tests/attempts'),
  getExamEvents: (examId) => api.get(`/nursing/exams/${examId}/events`),
  getMockTests: (examId) => api.get('/nursing/tests', { params: { examId } }),
  generateTest: (data) => api.post('/nursing/tests/generate', data),
  getTestQuestions: (testId) => api.get(`/nursing/tests/${testId}/questions`),
  startTest: (testId) => api.post(`/nursing/tests/${testId}/start`),
  saveTestResponse: (attemptId, data) => api.put(`/nursing/tests/attempts/${attemptId}/response`, data),
  submitTest: (attemptId) => api.put(`/nursing/tests/attempts/${attemptId}/submit`),
  getTestResults: (attemptId) => api.get(`/nursing/tests/attempts/${attemptId}/results`),
  getBookmarks: (params) => api.get('/nursing/practice/bookmarks', { params }),
  toggleBookmark: (questionId) => api.post('/nursing/practice/bookmarks/toggle', { questionId }),
  getMistakes: (params) => api.get('/nursing/practice/mistakes', { params }),
  updateMistake: (id, data) => api.patch(`/nursing/practice/mistakes/${id}`, data),
  startExplainer: (chapterId) => api.post('/nursing/practice/explainer/start', { chapterId }),
  continueExplainer: (data) => api.post('/nursing/practice/explainer/continue', data),
  getOperationalOverview: () => api.get('/nursing/admin/overview'),
  resolveReport: (id) => api.post(`/nursing/admin/reports/${id}/resolve`),
  getAdminStats: () => api.get('/nursing/content/admin/stats'),
  getAdminQuestions: (params) => api.get('/nursing/content/admin/questions', { params }),
  createQuestion: (data) => api.post('/nursing/content/admin/questions', data),
  updateQuestion: (id, data) => api.put(`/nursing/content/admin/questions/${id}`, data),
  archiveQuestion: (id) => api.delete(`/nursing/content/admin/questions/${id}`),
  reviewQuestions: (ids, action) => api.post('/nursing/content/admin/questions/review', { ids, action }),
  validateQuestion: (data) => api.post('/nursing/content/admin/questions/validate', data),
  improveQuestion: (id, operation) => api.post(`/nursing/content/admin/questions/${id}/improve`, { operation }),
  getVersions: (id) => api.get(`/nursing/content/admin/questions/${id}/versions`),
  restoreVersion: (id, version) => api.post(`/nursing/content/admin/questions/${id}/versions/${version}/restore`),
  previewImport: (data) => api.post('/nursing/content/admin/imports/preview', data),
  commitImport: (data) => api.post('/nursing/content/admin/imports/commit', data),
  getSources: () => api.get('/nursing/content/admin/sources'),
  createSource: (data) => api.post('/nursing/content/admin/sources', data),
  updateSource: (id, data) => api.put(`/nursing/content/admin/sources/${id}`, data),
  getCoverage: () => api.get('/nursing/content/admin/coverage'),
  fillCoverageGap: (chapterId) => api.post(`/nursing/content/admin/coverage/${chapterId}/fill`),
  getGenerationJobs: () => api.get('/nursing/content/admin/generation-jobs'),
  createGenerationJob: (data) => api.post('/nursing/content/admin/generation-jobs', data),
  processGenerationJob: (id) => api.post(`/nursing/content/admin/generation-jobs/${id}/process`),
  retryGenerationJob: (id) => api.post(`/nursing/content/admin/generation-jobs/${id}/retry`),
  cancelGenerationJob: (id) => api.post(`/nursing/content/admin/generation-jobs/${id}/cancel`)
};

export default api;
