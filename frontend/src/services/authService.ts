import api from './api';
import { AuthResponse, User, Admin } from '../types';

export const authService = {
  // User Registration
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // User Login
  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Admin Registration
  adminRegister: async (adminData: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/admin/register', adminData);
    return response.data;
  },

  // Admin Login
  adminLogin: async (credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/admin/login', credentials);
    return response.data;
  },

  // Store auth data in localStorage
  storeAuthData: (token: string, user: User | Admin, role: 'user' | 'admin') => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('role', role);
  },

  // Get stored auth data
  getAuthData: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const role = localStorage.getItem('role') as 'user' | 'admin' | null;

    if (token && user && role) {
      return {
        token,
        user: JSON.parse(user),
        role
      };
    }
    return null;
  },

  // Clear auth data
  clearAuthData: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get user role
  getUserRole: () => {
    return localStorage.getItem('role') as 'user' | 'admin' | null;
  }
};
