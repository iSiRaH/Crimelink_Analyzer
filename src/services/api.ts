import axios from 'axios';

// Navigation callback for unauthorized access
// This will be set by the app to use React Router's navigate
let unauthorizedCallback: (() => void) | null = null;

export const setUnauthorizedCallback = (callback: () => void) => {
  unauthorizedCallback = callback;
};

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api', // This will be proxied to http://localhost:8080/api in development
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Public endpoints that don't require authentication
const publicEndpoints = ['/auth/', '/health', '/test', '/database/'];

// Request interceptor
api.interceptors.request.use(
  (config: import('axios').InternalAxiosRequestConfig) => {
    // Check if this is a public endpoint
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    // Add auth token if available and not a public endpoint
    if (!isPublicEndpoint) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: unknown) => void }> = [];

const processQueue = (error: unknown | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor
api.interceptors.response.use(
  (response: import('axios').AxiosResponse) => {
    return response;
  },
  async (error: unknown) => {
    if (error && typeof error === 'object' && 'config' in error && 'response' in error) {
      const axiosError = error as { 
        config: import('axios').InternalAxiosRequestConfig;
        response?: { status?: number };
      };
      
      const originalRequest = axiosError.config as import('axios').InternalAxiosRequestConfig & { _retry?: boolean };
      
      if (axiosError.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Queue this request while refresh is in progress
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          try {
            const response = await api.post<{ accessToken: string }>('/auth/refresh', { refreshToken });
            const newAccessToken = response.data.accessToken;
            
            localStorage.setItem('accessToken', newAccessToken);
            
            processQueue(null, newAccessToken);
            
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            
            // Clear all auth data
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            
            // Use the callback if available
            if (unauthorizedCallback) {
              unauthorizedCallback();
            } else {
              window.location.href = '/login';
            }
            
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        } else {
          // No refresh token, redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          
          if (unauthorizedCallback) {
            unauthorizedCallback();
          } else {
            window.location.href = '/login';
          }
        }
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
