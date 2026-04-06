import * as notificationRepository from "../repositories/notification.repository.js";
import AppError from "../utils/AppError.js";

export const getNotifications = async (userId, page = 1, limit = 20) => {
    const notifications = await notificationRepository.getByUserId(userId, page, limit);
    const total = await notificationRepository.getTotalCount(userId);
    return {
        notifications,
        total,
        page,
        hasMore: page * limit < total,
    };
};

export const markAsRead = async (notificationId, userId) => {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification) {
        throw new AppError("Notification not found", 404);
    }
    if (notification.user_id.toString() !== userId) {
        throw new AppError("Not authorized", 403);
    }
    return await notificationRepository.markAsRead(notificationId);
};

export const markAllAsRead = async (userId) => {
    return await notificationRepository.markAllAsRead(userId);
};

export const getUnreadCount = async (userId) => {
    return await notificationRepository.getUnreadCount(userId);
};

export const clearAll = async (userId) => {
    return await notificationRepository.clearAll(userId);
};
