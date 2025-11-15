import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api', // This will be proxied to http://localhost:8080/api in development
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
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

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Test endpoint
  test: async () => {
    const response = await api.get('/test');
    return response.data;
  },

  // Example: Get data
  getData: async (endpoint: string) => {
    const response = await api.get(endpoint);
    return response.data;
  },

  // Example: Post data
  postData: async (endpoint: string, data: any) => {
    const response = await api.post(endpoint, data);
    return response.data;
  },

  // Example: Update data
  updateData: async (endpoint: string, data: any) => {
    const response = await api.put(endpoint, data);
    return response.data;
  },

  // Example: Delete data
  deleteData: async (endpoint: string) => {
    const response = await api.delete(endpoint);
    return response.data;
  },
};

export default api;
