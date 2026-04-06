import * as notificationService from "../services/notification.service.js";
import responseHelper from "../utils/response.helper.js";

export const getNotifications = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await notificationService.getNotifications(req.userId, page, limit);
        return responseHelper.success(res, "Notifications retrieved", result);
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req, res, next) => {
    try {
        await notificationService.markAsRead(req.params.notificationId, req.userId);
        return responseHelper.success(res, "Notification marked as read");
    } catch (error) {
        next(error);
    }
};

export const markAllAsRead = async (req, res, next) => {
    try {
        await notificationService.markAllAsRead(req.userId);
        return responseHelper.success(res, "All notifications marked as read");
    } catch (error) {
        next(error);
    }
};

export const getUnreadCount = async (req, res, next) => {
    try {
        const count = await notificationService.getUnreadCount(req.userId);
        return responseHelper.success(res, "Unread count retrieved", { count });
    } catch (error) {
        next(error);
    }
};

export const clearAll = async (req, res, next) => {
    try {
        await notificationService.clearAll(req.userId);
        return responseHelper.success(res, "All notifications cleared");
    } catch (error) {
        next(error);
    }
};
