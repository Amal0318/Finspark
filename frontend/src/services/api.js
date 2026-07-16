import axios from 'axios';

// Create Axios client targeting proxy or absolute address
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to append JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cybersense_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: async (email, password) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    const response = await api.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
  register: async (email, password, fullName) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Banking Transactions endpoints
export const transactionAPI = {
  list: async (skip = 0, limit = 100) => {
    const response = await api.get(`/transactions?skip=${skip}&limit=${limit}`);
    return response.data;
  },
  create: async (txData) => {
    const response = await api.post('/transactions', txData);
    return response.data;
  },
  get: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },
};

// Telemetry logs endpoints
export const telemetryAPI = {
  list: async (skip = 0, limit = 100) => {
    const response = await api.get(`/telemetry?skip=${skip}&limit=${limit}`);
    return response.data;
  },
  create: async (logData) => {
    const response = await api.post('/telemetry', logData);
    return response.data;
  },
};

// Alerts & Correlation endpoints
export const alertAPI = {
  list: async (skip = 0, limit = 100) => {
    const response = await api.get(`/alerts?skip=${skip}&limit=${limit}`);
    return response.data;
  },
  update: async (id, alertData) => {
    const response = await api.put(`/alerts/${id}`, alertData);
    return response.data;
  },
  getMLStatus: async () => {
    const response = await api.get('/alerts/ml/status');
    return response.data;
  },
  triggerMLRetrain: async () => {
    const response = await api.post('/alerts/ml/retrain');
    return response.data;
  },
};

// --- NEW EXPANDED ENDPOINTS ---

// Dashboard Analytics endpoints
export const dashboardAPI = {
  getSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },
};

// Dataset CSV uploads
export const datasetAPI = {
  uploadTransactions: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/datasets/upload/transactions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  uploadTelemetry: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/datasets/upload/telemetry', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// ML custom predictions endpoints
export const predictionAPI = {
  classify: async (transaction, concurrentLogs) => {
    const response = await api.post('/predictions/classify', {
      transaction,
      concurrent_logs: concurrentLogs,
    });
    return response.data;
  },
  getHistory: async (limit = 50) => {
    const response = await api.get(`/predictions/history?limit=${limit}`);
    return response.data;
  },
};

// Analytics reports
export const analyticsAPI = {
  getTrends: async () => {
    const response = await api.get('/analytics/trends');
    return response.data;
  },
};

// Entity risk calculations
export const riskAPI = {
  evaluate: async (entityType, entityId) => {
    const response = await api.post(`/risk-scores/evaluate?entity_type=${entityType}&entity_id=${entityId}`);
    return response.data;
  },
  getHistory: async (entityType, entityId, limit = 10) => {
    const response = await api.get(`/risk-scores/history?entity_type=${entityType}&entity_id=${entityId}&limit=${limit}`);
    return response.data;
  },
};

// LLM Security incident summaries
export const llmAPI = {
  narrate: async (alertId) => {
    const response = await api.get(`/llm/narrate/${alertId}`);
    return response.data;
  },
};

// Core ML Platform bindings (CyberSense Core)
export const mlAPI = {
  uploadDataset: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/ml/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  train: async () => {
    const response = await api.post('/ml/train');
    return response.data;
  },
  predict: async (transaction, concurrentLogs) => {
    const response = await api.post('/ml/predict', {
      transaction,
      concurrent_logs: concurrentLogs,
    });
    return response.data;
  },
  evaluateRisk: async (features) => {
    const response = await api.post('/ml/risk-score', { features });
    return response.data;
  },
  generateReport: async (reportData) => {
    const response = await api.post('/llm/generate-report', reportData);
    return response.data;
  },
  getDashboard: async () => {
    const response = await api.get('/ml/dashboard');
    return response.data;
  },
  getAnalytics: async () => {
    const response = await api.get('/ml/analytics');
    return response.data;
  },
  getIncidents: async () => {
    const response = await api.get('/ml/incidents');
    return response.data;
  },
  getModels: async () => {
    const response = await api.get('/ml/models');
    return response.data;
  },
  getMetrics: async () => {
    const response = await api.get('/ml/metrics');
    return response.data;
  },
  getBehaviour: async (query) => {
    const response = await api.get(`/ml/behaviour?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  getQuantum: async () => {
    const response = await api.get('/ml/quantum');
    return response.data;
  }
};

export default api;
