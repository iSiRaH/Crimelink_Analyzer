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
  (config: import('axios').InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: import('axios').AxiosResponse) => {
    return response;
  },
  (error: unknown) => {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('token');
        // Note: Using window.location for simplicity. In a real app, consider using React Router's navigate
        window.location.href = '/login';
      }
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
  getData: async <T = unknown>(endpoint: string) => {
    const response = await api.get<T>(endpoint);
    return response.data;
  },

  // Example: Post data
  postData: async <T = unknown, D = unknown>(endpoint: string, data: D) => {
    const response = await api.post<T>(endpoint, data);
    return response.data;
  },

  // Example: Update data
  updateData: async <T = unknown, D = unknown>(endpoint: string, data: D) => {
    const response = await api.put<T>(endpoint, data);
    return response.data;
  },

  // Example: Delete data
  deleteData: async <T = unknown>(endpoint: string) => {
    const response = await api.delete<T>(endpoint);
    return response.data;
  },
};

export default api;
