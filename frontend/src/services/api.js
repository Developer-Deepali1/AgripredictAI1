import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60-second timeout for AI processing
});

const isDev = process.env.NODE_ENV !== 'production';

// Retry a request function with exponential backoff
const retryRequest = async (fn, retries = 3, delay = 1000) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isNetworkError = !err.response;
      const isServerError = err.response && err.response.status >= 500;
      const isLastAttempt = attempt === retries - 1;

      if ((!isNetworkError && !isServerError) || isLastAttempt) {
        throw err;
      }

      if (isDev) {
        console.warn(`[API] Retry attempt ${attempt + 1}/${retries - 1} after ${delay}ms`, err.message);
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // exponential backoff
    }
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (isDev) {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data || '');
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isDev) {
      if (error.response) {
        // Server responded with a non-2xx status
        console.error(
          `[API] Error ${error.response.status} on ${error.config?.method?.toUpperCase()} ${error.config?.url}:`,
          error.response.data
        );
      } else if (error.request) {
        // Request sent but no response received (network error / timeout / CORS)
        console.error(
          `[API] No response for ${error.config?.method?.toUpperCase()} ${error.config?.url}:`,
          error.message
        );
      } else {
        // Error setting up the request
        console.error('[API] Request setup error:', error.message);
      }
    }
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authService = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  refresh: () => api.post('/api/auth/refresh'),
};

// Profile
export const profileService = {
  create: (data) => api.post('/api/profile', data),
  get: () => api.get('/api/profile'),
  update: (data) => api.put('/api/profile', data),
  delete: () => api.delete('/api/profile'),
};

// Data
export const dataService = {
  getMandiPrices: (params) => api.get('/api/data/mandi-prices', { params }),
  getWeather: (params) => api.get('/api/data/weather', { params }),
  getCropPatterns: (params) => api.get('/api/data/crop-patterns', { params }),
};

// Prediction
export const predictionService = {
  getPrices: (crop, params) => api.get(`/api/prediction/prices/${crop}`, { params }),
  getSeasonality: (crop, params) => api.get(`/api/prediction/seasonality/${crop}`, { params }),
};

// Feasibility
export const feasibilityService = {
  check: (data) => api.post('/api/feasibility/check', data),
  getCrops: (params) => api.get('/api/feasibility/crops', { params }),
};

// Profit
export const profitService = {
  calculate: (data) => api.post('/api/profit/calculate', data),
  getComparison: (params) => api.get('/api/profit/comparison', { params }),
};

// Risk
export const riskService = {
  assess: (data) => api.post('/api/risk/assess', data),
  getFactors: (params) => api.get('/api/risk/factors', { params }),
  getMitigation: (params) => api.get('/api/risk/mitigation', { params }),
};

// Recommendation
export const recommendationService = {
  getSmart: (params) => api.get('/api/recommendation/smart', { params }),
  explain: (params) => api.get('/api/recommendation/explain', { params }),
};

// Simulation
export const simulationService = {
  run: (data) => api.post('/api/simulation/run', data),
  compare: (data) => api.post('/api/simulation/compare', data),
};

// Alerts
export const alertsService = {
  get: (params) => api.get('/api/alert/', { params }),
  updateSettings: (data) => api.put('/api/alert/settings', data),
  getHistory: (params) => api.get('/api/alert/history', { params }),
};

// Dashboard
export const dashboardService = {
  getSummary: () => api.get('/api/dashboard/summary'),
};

// Chatbot
export const chatbotService = {
  chat: (data) => retryRequest(() => api.post('/api/chat/', data)),
  getHistory: (sessionId) => api.get(`/api/chat/history/${sessionId}`),
  clearHistory: (sessionId) => api.delete(`/api/chat/history/${sessionId}`),
  voiceChat: (formData) => api.post('/api/chat/voice', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  testConnection: () => api.post('/api/chat/test', { message: 'ping' }),
};

// Health
export const healthService = {
  check: () => api.get('/health'),
};

export default api;
