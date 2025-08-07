import ApiClient from '../client';
import { API_ENDPOINTS, buildUrl } from '../endpoints';
import { ApiResponse, PaginatedResponse } from '../types';

// User related types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  avatar?: string;
  role: 'admin' | 'user' | 'manager';
  isActive: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  position?: string;
  department?: string;
  role?: 'admin' | 'user' | 'manager';
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  position?: string;
  department?: string;
  role?: 'admin' | 'user' | 'manager';
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: 'active' | 'inactive';
  sortBy?: 'name' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

class UserService {
  constructor(private apiClient: ApiClient) {}

  // Get paginated users list
  async getUsers(params: UserListParams = {}): Promise<PaginatedResponse<User>> {
    const response = await this.apiClient.getPaginated<User>(
      API_ENDPOINTS.USERS.LIST.url,
      params.page,
      params.limit,
      { params }
    );
    return response;
  }

  // Get user by ID
  async getUser(id: string): Promise<ApiResponse<User>> {
    const url = buildUrl(API_ENDPOINTS.USERS.GET.url, { id });
    return this.apiClient.get<User>(url);
  }

  // Create new user
  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    return this.apiClient.post<User>(API_ENDPOINTS.USERS.CREATE.url, userData);
  }

  // Update user
  async updateUser(id: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    const url = buildUrl(API_ENDPOINTS.USERS.UPDATE.url, { id });
    return this.apiClient.put<User>(url, userData);
  }

  // Delete user
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    const url = buildUrl(API_ENDPOINTS.USERS.DELETE.url, { id });
    return this.apiClient.delete(url);
  }

  // Get current user profile
  async getProfile(): Promise<ApiResponse<User>> {
    return this.apiClient.get<User>(API_ENDPOINTS.USERS.PROFILE.url);
  }

  // Update current user profile
  async updateProfile(userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    return this.apiClient.put<User>(API_ENDPOINTS.USERS.UPDATE_PROFILE.url, userData);
  }

  // Upload avatar
  async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    return this.apiClient.uploadFile<{ avatarUrl: string }>(
      API_ENDPOINTS.USERS.UPLOAD_AVATAR.url,
      file,
      'avatar'
    );
  }

  // Search users
  async searchUsers(query: string): Promise<ApiResponse<User[]>> {
    return this.apiClient.get<User[]>(API_ENDPOINTS.USERS.LIST.url, {
      params: { search: query, limit: 10 }
    });
  }
}

export default UserService;
