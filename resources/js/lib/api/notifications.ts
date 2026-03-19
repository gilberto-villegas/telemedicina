import { api } from '../api';

export interface Notification {
  id: string;
  user_id: number;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels: string[];
  sent_at: string | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: number;
  user_id: number;
  channels: string[];
  categories: string[] | null;
  quiet_hours: {
    start: string;
    end: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const notificationService = {
  async list(params?: {
    page?: number;
    per_page?: number;
    unread?: boolean;
    type?: string;
  }): Promise<PaginatedResponse<Notification>> {
    const response = await api.get<PaginatedResponse<Notification>>('/notifications', { params });
    return response.data;
  },

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await api.get<{ count: number }>('/notifications/unread-count');
    return response.data;
  },

  async getById(id: string): Promise<Notification> {
    const response = await api.get<Notification>(`/notifications/${id}`);
    return response.data;
  },

  async markAsRead(id: string): Promise<Notification> {
    const response = await api.put<{ notification: Notification }>(`/notifications/${id}/read`);
    return response.data.notification;
  },

  async markAllAsRead(): Promise<{ count: number }> {
    const response = await api.put<{ count: number }>('/notifications/read-all');
    return response.data;
  },

  async getPreferences(): Promise<NotificationPreferences> {
    const response = await api.get<NotificationPreferences>('/notification-preferences');
    return response.data;
  },

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await api.put<{ preferences: NotificationPreferences }>(
      '/notification-preferences',
      preferences
    );
    return response.data.preferences;
  },

  async sendTest(type: string, channels?: string[]): Promise<Notification> {
    const response = await api.post<{ notification: Notification }>('/notifications/test', {
      type,
      channels,
    });
    return response.data.notification;
  },
};
