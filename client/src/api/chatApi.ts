import apiClient from "./apiClient";
import { API_CONFIG } from "./apiConfig";
import type { Conversation, Message, PaginatedConversations, PaginatedMessages } from "../types/chatTypes";

type CreateGroupConversationPayload = {
    groupName: string;
    memberIds: string[];
    avatar?: File | null;
};

export const chatApi = {
    getConversations: async (page = 1, limit = 20) => {
        const response = await apiClient.get<{ success: boolean; data: PaginatedConversations }>(
            `${API_CONFIG.ENDPOINTS.CONVERSATIONS.LIST}?page=${page}&limit=${limit}`
        );
        return response.data.data;
    },

    getOrCreateConversation: async (friendId: string) => {
        const response = await apiClient.post<{ success: boolean; data: Conversation }>(
            API_CONFIG.ENDPOINTS.CONVERSATIONS.CREATE,
            { friendId }
        );
        return response.data.data;
    },

    createGroupConversation: async ({ groupName, memberIds, avatar }: CreateGroupConversationPayload) => {
        const formData = new FormData();
        formData.append("groupName", groupName);
        formData.append("memberIds", JSON.stringify(memberIds));

        if (avatar) {
            formData.append("avatar", avatar);
        }

        const response = await apiClient.post<{ success: boolean; data: Conversation }>(
            API_CONFIG.ENDPOINTS.CONVERSATIONS.CREATE_GROUP,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" }
            }
        );

        return response.data.data;
    },

    addGroupMembers: async (conversationId: string, memberIds: string[]) => {
        const response = await apiClient.post<{ success: boolean; data: Conversation }>(
            API_CONFIG.ENDPOINTS.CONVERSATIONS.ADD_MEMBERS(conversationId),
            { memberIds }
        );
        return response.data.data;
    },

    removeGroupMember: async (conversationId: string, userId: string) => {
        const response = await apiClient.delete<{ success: boolean; data: Conversation }>(
            API_CONFIG.ENDPOINTS.CONVERSATIONS.REMOVE_MEMBER(conversationId, userId)
        );
        return response.data.data;
    },

    resetUnreadCount: async (conversationId: string) => {
        const response = await apiClient.put<{ success: boolean; message: string }>(
            API_CONFIG.ENDPOINTS.CONVERSATIONS.RESET_UNREAD(conversationId)
        );
        return response.data;
    },

    getMessages: async (conversationId: string, page = 1, limit = 50) => {
        const response = await apiClient.get<{ success: boolean; data: PaginatedMessages }>(
            `${API_CONFIG.ENDPOINTS.MESSAGES.LIST(conversationId)}?page=${page}&limit=${limit}`
        );
        return response.data.data;
    },

    sendMessage: async (conversationId: string, content: string) => {
        const response = await apiClient.post<{ success: boolean; data: Message }>(
            API_CONFIG.ENDPOINTS.MESSAGES.SEND(conversationId),
            { content }
        );
        return response.data.data;
    },

    markAsRead: async (conversationId: string) => {
        const response = await apiClient.put<{ success: boolean; message: string }>(
            API_CONFIG.ENDPOINTS.MESSAGES.MARK_READ(conversationId)
        );
        return response.data;
    }
};
