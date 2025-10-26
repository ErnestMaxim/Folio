// src/services/authService.ts
import axios, {type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

const API_URL = 'http://localhost:8000';

// Types
export interface UserRegistration {
  username: string;
  email: string;
  password: string;
  full_name: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface User {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'librarian' | 'member';
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LoginResponse extends TokenResponse {
  user: User;
}

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Service
const authService = {
  // Register new user
  register: async (userData: UserRegistration): Promise<User> => {
    try {
      const response = await api.post<User>('/register', userData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.detail || 'Registration failed';
    }
  },

  // Login user
  login: async (credentials: UserLogin): Promise<LoginResponse> => {
    try {
      const response = await api.post<TokenResponse>('/login', credentials);
      const { access_token, token_type } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', access_token);
      
      // Get user info
      const userInfo = await authService.getCurrentUser();
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      return { access_token, token_type, user: userInfo };
    } catch (error: any) {
      throw error.response?.data?.detail || 'Login failed';
    }
  },

  // Logout user
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user info
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get<User>('/me');
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.detail || 'Failed to get user info';
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Get stored user
  getStoredUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get token
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },
};

export { api, authService };
export default authService;