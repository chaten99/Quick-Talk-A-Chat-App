export type NotificationUser = {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
}

export type Notification = {
    _id: string;
    user_id: string;
    from_user: NotificationUser;
    type: "friend_request" | "friend_accepted" | "friend_rejected" | "message" | "conversation";
    content: string;
    reference_id?: string;
    is_read: boolean;
    createdAt: string;
}

export type NotificationStore = {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    page: number;
    hasMore: boolean;
    fetchNotifications: () => Promise<void>;
    loadMore: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    addNotification: (notification: Notification) => void;
    decrementUnread: () => void;
    clearAll: () => Promise<void>;
}
