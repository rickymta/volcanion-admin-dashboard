import ApiClient from '../client';
import { API_ENDPOINTS, buildUrl } from '../endpoints';
import { ApiResponse, PaginatedResponse } from '../types';

// Notification related types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  userId: string;
  metadata?: Record<string, any>;
  createdAt: string;
  readAt?: string;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  type?: Notification['type'];
  isRead?: boolean;
  sortBy?: 'createdAt' | 'readAt';
  sortOrder?: 'asc' | 'desc';
}

class NotificationService {
  constructor(private apiClient: ApiClient) {}

  // Get paginated notifications list
  async getNotifications(params: NotificationListParams = {}): Promise<PaginatedResponse<Notification>> {
    return this.apiClient.getPaginated<Notification>(
      API_ENDPOINTS.NOTIFICATIONS.LIST.url,
      params.page,
      params.limit,
      { params }
    );
  }

  // Get notification by ID
  async getNotification(id: string): Promise<ApiResponse<Notification>> {
    const url = buildUrl(API_ENDPOINTS.NOTIFICATIONS.GET.url, { id });
    return this.apiClient.get<Notification>(url);
  }

  // Mark notification as read
  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    const url = buildUrl(API_ENDPOINTS.NOTIFICATIONS.MARK_READ.url, { id });
    return this.apiClient.put<Notification>(url);
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<ApiResponse<void>> {
    return this.apiClient.put<void>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ.url);
  }

  // Delete notification
  async deleteNotification(id: string): Promise<ApiResponse<void>> {
    const url = buildUrl(API_ENDPOINTS.NOTIFICATIONS.DELETE.url, { id });
    return this.apiClient.delete(url);
  }

  // Clear all notifications
  async clearAllNotifications(): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>(API_ENDPOINTS.NOTIFICATIONS.CLEAR_ALL.url);
  }

  // Get unread count
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return this.apiClient.get<{ count: number }>('/notifications/unread-count');
  }

  // Get recent notifications
  async getRecentNotifications(limit: number = 5): Promise<ApiResponse<Notification[]>> {
    return this.apiClient.get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS.LIST.url, {
      params: { limit, sortBy: 'createdAt', sortOrder: 'desc' }
    });
  }
}

export default NotificationService;
