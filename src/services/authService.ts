import api from './api';
import type { LoginRequest, LoginResponse, TokenRefreshRequest, TokenRefreshResponse, User } from '../types/auth';

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', { email, password } as LoginRequest);
    
    // Store tokens and minimal user data (security: avoid storing sensitive info in localStorage)
    localStorage.setItem(TOKEN_KEY, response.data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
    // Only store userId and role for routing, fetch full details from backend when needed
    const minimalUser = {
      userId: response.data.user.userId,
      name: response.data.user.name,
      role: response.data.user.role
    };
    localStorage.setItem(USER_KEY, JSON.stringify(minimalUser));
    
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      // Always clear local storage, even if API call fails
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<TokenRefreshResponse>('/auth/refresh', { 
      refreshToken 
    } as TokenRefreshRequest);
    
    // Update access token
    localStorage.setItem(TOKEN_KEY, response.data.accessToken);
    
    return response.data.accessToken;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    
    // Update stored user data
    localStorage.setItem(USER_KEY, JSON.stringify(response.data));
    
    return response.data;
  },

  getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getStoredToken() && !!this.getStoredUser();
  }
};
