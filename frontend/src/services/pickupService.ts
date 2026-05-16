import api from './api';
import { PickupRequest } from '../types';

export const pickupService = {
  // Create pickup request
  createRequest: async (requestData: {
    itemType: string;
    quantity: number;
    condition: string;
    pickupAddress: string;
    preferredDate: string;
    notes?: string;
  }): Promise<{ message: string; pickupRequest: PickupRequest }> => {
    const response = await api.post('/pickup-requests', requestData);
    return response.data;
  },

  // Get user's pickup requests
  getMyRequests: async (): Promise<{ message: string; pickupRequests: PickupRequest[] }> => {
    const response = await api.get('/pickup-requests/my-requests');
    return response.data;
  },

  // Get specific pickup request
  getRequest: async (id: string): Promise<{ message: string; pickupRequest: PickupRequest }> => {
    const response = await api.get(`/pickup-requests/${id}`);
    return response.data;
  },

  // Update pickup request
  updateRequest: async (id: string, requestData: {
    itemType?: string;
    quantity?: number;
    condition?: string;
    pickupAddress?: string;
    preferredDate?: string;
    notes?: string;
  }): Promise<{ message: string; pickupRequest: PickupRequest }> => {
    const response = await api.put(`/pickup-requests/${id}`, requestData);
    return response.data;
  },

  // Delete pickup request
  deleteRequest: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/pickup-requests/${id}`);
    return response.data;
  },

  // Admin: Get all pickup requests
  getAllRequests: async (status?: string): Promise<{ message: string; pickupRequests: PickupRequest[] }> => {
    const params = status ? { status } : {};
    const response = await api.get('/pickup-requests/admin/all', { params });
    return response.data;
  },

  // Admin: Assign pickup request
  assignRequest: async (id: string): Promise<{ message: string; pickupRequest: PickupRequest }> => {
    const response = await api.put(`/pickup-requests/${id}/assign`);
    return response.data;
  },

  // Admin: Mark as collected
  collectRequest: async (id: string): Promise<{ message: string; pickupRequest: PickupRequest }> => {
    const response = await api.put(`/pickup-requests/${id}/collect`);
    return response.data;
  }
};
