import Notification from "../models/notification.model.js";

export const create = (data) => {
    return Notification.create(data);
};

export const getByUserId = (userId, page = 1, limit = 20) => {
    return Notification.find({ user_id: userId })
        .populate("from_user", "username email avatar")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
};

export const getTotalCount = (userId) => {
    return Notification.countDocuments({ user_id: userId });
};

export const markAsRead = (notificationId) => {
    return Notification.findByIdAndUpdate(notificationId, { is_read: true }, { returnDocument: "after" });
};

export const markAllAsRead = (userId) => {
    return Notification.updateMany({ user_id: userId, is_read: false }, { is_read: true });
};

export const getUnreadCount = (userId) => {
    return Notification.countDocuments({ user_id: userId, is_read: false });
};

export const findById = (id) => {
    return Notification.findById(id);
};

export const clearAll = (userId) => {
    return Notification.deleteMany({ user_id: userId });
};
