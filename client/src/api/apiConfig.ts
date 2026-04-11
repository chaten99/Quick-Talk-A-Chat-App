export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            SIGNUP: '/auth/signup',
            SEND_OTP: '/auth/send-otp',
            VERIFY_OTP: '/auth/verify-otp',
            LOGOUT: '/auth/logout',
            FORGOT_PASSWORD: '/auth/forgot-password',
            RESET_PASSWORD: '/auth/reset-password',
            GOOGLE: '/auth/google',
            SESSION: '/auth/session',
        },
        FRIENDS: {
            LIST: '/friends',
            SEARCH: '/friends/search',
            REQUESTS: '/friends/requests',
            SEND_REQUEST: '/friends/request',
            ACCEPT_REQUEST: (id: string) => `/friends/request/${id}/accept`,
            REJECT_REQUEST: (id: string) => `/friends/request/${id}/reject`,
            CANCEL_REQUEST: (id: string) => `/friends/request/${id}`,
            REMOVE: (id: string) => `/friends/${id}`,
        },
        NOTIFICATIONS: {
            LIST: '/notifications',
            UNREAD_COUNT: '/notifications/unread-count',
            MARK_READ: (id: string) => `/notifications/${id}/read`,
            MARK_ALL_READ: '/notifications/read-all',
            CLEAR_ALL: '/notifications/clear-all',
        },
        PROFILE: {
            UPDATE: '/profile',
            AVATAR: '/profile/avatar',
        },
        CONVERSATIONS: {
            LIST: '/conversations',
            CREATE: '/conversations',
            CREATE_GROUP: '/conversations/group',
            RESET_UNREAD: (id: string) => `/conversations/${id}/read`,
            ADD_MEMBERS: (id: string) => `/conversations/${id}/members`,
            REMOVE_MEMBER: (conversationId: string, userId: string) => `/conversations/${conversationId}/members/${userId}`,
        },
        MESSAGES: {
            LIST: (conversationId: string) => `/messages/${conversationId}`,
            SEND: (conversationId: string) => `/messages/${conversationId}`,
            UPDATE: (conversationId: string, messageId: string) => `/messages/${conversationId}/${messageId}`,
            DELETE: (conversationId: string, messageId: string) => `/messages/${conversationId}/${messageId}`,
            MARK_READ: (conversationId: string) => `/messages/${conversationId}/read`,
        }
    }
}
