import api from './api';
import type { Notification } from '../types';

const BASE = '/notifications';

export const notificationService = {
  /** Fetch the most recent N notifications (default 20) */
  getRecent: async (limit = 20): Promise<Notification[]> => {
    const { data } = await api.get<Notification[]>(`${BASE}/recent`, { params: { limit } });
    return data;
  },

  /** Fetch only unread notifications */
  getUnread: async (): Promise<Notification[]> => {
    const { data } = await api.get<Notification[]>(`${BASE}/unread`);
    return data;
  },

  /** Get the count of unread notifications */
  getUnreadCount: async (): Promise<number> => {
    const { data } = await api.get<number>(`${BASE}/count`);
    return data;
  },

  /** Mark a single notification as read */
  markAsRead: async (id: number): Promise<void> => {
    await api.patch(`${BASE}/${id}/read`);
  },

  /** Mark all notifications as read */
  markAllAsRead: async (): Promise<void> => {
    await api.patch(`${BASE}/read-all`);
  },
};
