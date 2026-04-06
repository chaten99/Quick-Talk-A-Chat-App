import apiClient from "./apiClient";
import { API_CONFIG } from "./apiConfig";

export const friendApi = {
    getFriends: async (page: number = 1, limit: number = 20) =>
        apiClient.get(API_CONFIG.ENDPOINTS.FRIENDS.LIST, { params: { page, limit } }),
    searchUsers: async (query: string, page: number = 1, limit: number = 20) =>
        apiClient.get(API_CONFIG.ENDPOINTS.FRIENDS.SEARCH, { params: { q: query, page, limit } }),
    getPendingRequests: async () =>
        apiClient.get(API_CONFIG.ENDPOINTS.FRIENDS.REQUESTS),
    sendRequest: async (receiverId: string) =>
        apiClient.post(API_CONFIG.ENDPOINTS.FRIENDS.SEND_REQUEST, { receiverId }),
    acceptRequest: async (requestId: string) =>
        apiClient.post(API_CONFIG.ENDPOINTS.FRIENDS.ACCEPT_REQUEST(requestId)),
    rejectRequest: async (requestId: string) =>
        apiClient.post(API_CONFIG.ENDPOINTS.FRIENDS.REJECT_REQUEST(requestId)),
    cancelRequest: async (requestId: string) =>
        apiClient.delete(API_CONFIG.ENDPOINTS.FRIENDS.CANCEL_REQUEST(requestId)),
    removeFriend: async (friendId: string) =>
        apiClient.delete(API_CONFIG.ENDPOINTS.FRIENDS.REMOVE(friendId)),
};
