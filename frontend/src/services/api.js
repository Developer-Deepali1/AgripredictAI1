import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
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
  get: (params) => api.get('/api/alerts/get', { params }),
  updateSettings: (data) => api.put('/api/alerts/settings', data),
  getHistory: (params) => api.get('/api/alerts/history', { params }),
};

// Dashboard
export const dashboardService = {
  getSummary: () => api.get('/api/dashboard/summary'),
};

export default api;
