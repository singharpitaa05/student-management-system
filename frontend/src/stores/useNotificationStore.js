import { create } from 'zustand';
import { notificationApi } from '../api/notification.api.js';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const response = await notificationApi.getMyNotifications({ limit: 50 });
      const notifications = response.data;
      const unreadCount = notifications.filter(n => !n.isRead).length;
      set({ notifications, unreadCount, loading: false });
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationApi.markAsRead(id);
      const { notifications, unreadCount } = get();
      const updated = notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      );
      set({ 
        notifications: updated,
        unreadCount: Math.max(0, unreadCount - 1)
      });
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationApi.markAllAsRead();
      const { notifications } = get();
      const updated = notifications.map(n => ({ ...n, isRead: true }));
      set({ notifications: updated, unreadCount: 0 });
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  },
  
  // Real-time hook placeholder
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  }
}));
