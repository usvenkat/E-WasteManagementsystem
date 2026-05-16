export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: 'user';
  rewardPoints: number;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

export interface PickupRequest {
  _id: string;
  user: User | string;
  itemType: 'laptop' | 'desktop' | 'mobile' | 'tablet' | 'printer' | 'monitor' | 'keyboard' | 'mouse' | 'other';
  quantity: number;
  condition: 'working' | 'not_working' | 'partially_working';
  pickupAddress: string;
  preferredDate: string;
  status: 'pending' | 'assigned' | 'collected';
  assignedTo?: Admin | string | null;
  collectedDate?: string | null;
  notes?: string;
  rewardPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user?: User;
  admin?: Admin;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalRequests: number;
  pendingRequests: number;
  assignedRequests: number;
  collectedRequests: number;
  totalRewardPoints: number;
}
