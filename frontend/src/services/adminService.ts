import api from './api';
import { DashboardStats, User, PickupRequest } from '../types';

export const adminService = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<{
    message: string;
    statistics: DashboardStats;
    recentRequests: PickupRequest[];
  }> => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Get all users
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    message: string;
    users: User[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      limit: number;
    };
  }> => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: string): Promise<{
    message: string;
    user: User;
    pickupRequests: PickupRequest[];
  }> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // Get analytics data
  getAnalytics: async (): Promise<{
    message: string;
    analytics: {
      monthlyStats: any[];
      itemTypeStats: any[];
      statusStats: any[];
      topUsers: User[];
    };
  }> => {
    const response = await api.get('/admin/analytics');
    return response.data;
  }
};
