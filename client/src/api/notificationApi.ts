import apiClient from "./apiClient";
import { API_CONFIG } from "./apiConfig";

export const notificationApi = {
    getNotifications: async (page: number = 1, limit: number = 20) =>
        apiClient.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST, { params: { page, limit } }),
    getUnreadCount: async () =>
        apiClient.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT),
    markAsRead: async (notificationId: string) =>
        apiClient.patch(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId)),
    markAllAsRead: async () =>
        apiClient.patch(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ),
    clearAll: async () =>
        apiClient.delete(API_CONFIG.ENDPOINTS.NOTIFICATIONS.CLEAR_ALL),
};
