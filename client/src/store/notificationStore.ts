import { create } from "zustand";
import type { NotificationStore } from "../types/notificationTypes";
import { notificationApi } from "../api/notificationApi";

export const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    page: 1,
    hasMore: true,

    fetchNotifications: async () => {
        try {
            set({ loading: true, page: 1 });
            const res = await notificationApi.getNotifications(1);
            set({
                notifications: res.data.data.notifications,
                hasMore: res.data.data.hasMore,
                page: 1,
            });
        } catch {
            set({ notifications: [] });
        } finally {
            set({ loading: false });
        }
    },

    loadMore: async () => {
        const { page, hasMore, loading } = get();
        if (!hasMore || loading) return;
        try {
            set({ loading: true });
            const nextPage = page + 1;
            const res = await notificationApi.getNotifications(nextPage);
            set((state) => ({
                notifications: [...state.notifications, ...res.data.data.notifications],
                hasMore: res.data.data.hasMore,
                page: nextPage,
            }));
        } catch {
            return;
        } finally {
            set({ loading: false });
        }
    },

    markAsRead: async (notificationId: string) => {
        try {
            await notificationApi.markAsRead(notificationId);
            set((state) => ({
                notifications: state.notifications.map((n) =>
                    n._id === notificationId ? { ...n, is_read: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            }));
        } catch {
            return;
        }
    },

    markAllAsRead: async () => {
        try {
            await notificationApi.markAllAsRead();
            set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
                unreadCount: 0,
            }));
        } catch {
            return;
        }
    },

    fetchUnreadCount: async () => {
        try {
            const res = await notificationApi.getUnreadCount();
            set({ unreadCount: res.data.data.count });
        } catch {
            set({ unreadCount: 0 });
        }
    },

    addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
    })),

    decrementUnread: () => set((state) => ({
        unreadCount: Math.max(0, state.unreadCount - 1),
    })),

    clearAll: async () => {
        try {
            await notificationApi.clearAll();
            set({ notifications: [], unreadCount: 0, page: 1, hasMore: false });
        } catch {
            return;
        }
    },
}));
