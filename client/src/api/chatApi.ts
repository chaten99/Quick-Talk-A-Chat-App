import apiClient from "./apiClient";
import type { Conversation, Message, PaginatedConversations, PaginatedMessages } from "../types/chatTypes";

export const chatApi = {
    getConversations: async (page = 1, limit = 20) => {
        const response = await apiClient.get<{ success: boolean; data: PaginatedConversations }>(
            `/conversations?page=${page}&limit=${limit}`
        );
        return response.data.data;
    },

    getOrCreateConversation: async (friendId: string) => {
        const response = await apiClient.post<{ success: boolean; data: Conversation }>(
            "/conversations",
            { friendId }
        );
        return response.data.data;
    },

    resetUnreadCount: async (conversationId: string) => {
        const response = await apiClient.put<{ success: boolean; message: string }>(
            `/conversations/${conversationId}/read`
        );
        return response.data;
    },

    getMessages: async (conversationId: string, page = 1, limit = 50) => {
        const response = await apiClient.get<{ success: boolean; data: PaginatedMessages }>(
            `/messages/${conversationId}?page=${page}&limit=${limit}`
        );
        return response.data.data;
    },

    sendMessage: async (conversationId: string, content: string) => {
        const response = await apiClient.post<{ success: boolean; data: Message }>(
            `/messages/${conversationId}`,
            { content }
        );
        return response.data.data;
    },

    markAsRead: async (conversationId: string) => {
        const response = await apiClient.put<{ success: boolean; message: string }>(
            `/messages/${conversationId}/read`
        );
        return response.data;
    }
};
