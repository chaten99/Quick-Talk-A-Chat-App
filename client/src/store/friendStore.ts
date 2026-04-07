import { create } from "zustand";
import type { FriendStore } from "../types/friendTypes";
import { friendApi } from "../api/friendApi";
import type { AxiosError } from "axios";
import { useChatStore } from "./chatStore";

const handleError = (err: unknown) => {
    const error = err as AxiosError<{ message: string }>;
    return {
        message: error.response?.data?.message || "Something went wrong",
        success: false,
    };
};

export const useFriendStore = create<FriendStore>((set, get) => ({
    friends: [],
    searchResults: [],
    pendingRequests: [],
    loading: false,
    searching: false,
    searchPage: 1,
    searchHasMore: false,
    friendsPage: 1,
    friendsHasMore: false,

    getFriends: async () => {
        try {
            set({ loading: true, friendsPage: 1 });
            const res = await friendApi.getFriends(1);
            set({
                friends: res.data.data.friends,
                friendsHasMore: res.data.data.hasMore,
                friendsPage: 1,
            });
        } catch {
            set({ friends: [] });
        } finally {
            set({ loading: false });
        }
    },

    loadMoreFriends: async () => {
        const { friendsPage, friendsHasMore, loading } = get();
        if (!friendsHasMore || loading) return;
        try {
            set({ loading: true });
            const nextPage = friendsPage + 1;
            const res = await friendApi.getFriends(nextPage);
            set((state) => ({
                friends: [...state.friends, ...res.data.data.friends],
                friendsHasMore: res.data.data.hasMore,
                friendsPage: nextPage,
            }));
        } catch {
            return;
        } finally {
            set({ loading: false });
        }
    },

    searchUsers: async (query: string) => {
        try {
            set({ searching: true, searchPage: 1 });
            const res = await friendApi.searchUsers(query, 1);
            set({
                searchResults: res.data.data.users,
                searchHasMore: res.data.data.hasMore,
                searchPage: 1,
            });
        } catch {
            set({ searchResults: [] });
        } finally {
            set({ searching: false });
        }
    },

    loadMoreSearch: async (query: string) => {
        const { searchPage, searchHasMore, searching } = get();
        if (!searchHasMore || searching) return;
        try {
            set({ searching: true });
            const nextPage = searchPage + 1;
            const res = await friendApi.searchUsers(query, nextPage);
            set((state) => ({
                searchResults: [...state.searchResults, ...res.data.data.users],
                searchHasMore: res.data.data.hasMore,
                searchPage: nextPage,
            }));
        } catch {
            return;
        } finally {
            set({ searching: false });
        }
    },

    sendRequest: async (receiverId: string) => {
        try {
            const res = await friendApi.sendRequest(receiverId);
            return { message: res.data.message, success: true };
        } catch (err) {
            return handleError(err);
        }
    },

    acceptRequest: async (requestId: string) => {
        try {
            const pendingRequest = get().pendingRequests.find((request) => request._id === requestId);
            const res = await friendApi.acceptRequest(requestId);
            set((state) => ({
                pendingRequests: state.pendingRequests.filter((r) => r._id !== requestId),
            }));

            if (pendingRequest) {
                get().addFriend({
                    _id: pendingRequest.sender_id._id,
                    username: pendingRequest.sender_id.username,
                    email: pendingRequest.sender_id.email,
                    avatar: pendingRequest.sender_id.avatar,
                });
                useChatStore.getState().updateConversationMessagingPermission(pendingRequest.sender_id._id, true);
            }

            return { message: res.data.message, success: true };
        } catch (err) {
            return handleError(err);
        }
    },

    rejectRequest: async (requestId: string) => {
        try {
            const res = await friendApi.rejectRequest(requestId);
            set((state) => ({
                pendingRequests: state.pendingRequests.filter((r) => r._id !== requestId),
            }));
            return { message: res.data.message, success: true };
        } catch (err) {
            return handleError(err);
        }
    },

    cancelRequest: async (requestId: string) => {
        try {
            const res = await friendApi.cancelRequest(requestId);
            return { message: res.data.message, success: true };
        } catch (err) {
            return handleError(err);
        }
    },

    removeFriend: async (friendId: string) => {
        try {
            const res = await friendApi.removeFriend(friendId);
            set((state) => ({
                friends: state.friends.filter((f) => f._id !== friendId),
            }));
            useChatStore.getState().updateConversationMessagingPermission(friendId, false);
            return { message: res.data.message, success: true };
        } catch (err) {
            return handleError(err);
        }
    },

    getPendingRequests: async () => {
        try {
            set({ loading: true });
            const res = await friendApi.getPendingRequests();
            set({ pendingRequests: res.data.data });
        } catch {
            set({ pendingRequests: [] });
        } finally {
            set({ loading: false });
        }
    },

    clearSearch: () => set({ searchResults: [], searchPage: 1, searchHasMore: false }),

    addFriend: (friend) => set((state) => ({
        friends: [
            friend,
            ...state.friends.filter((existingFriend) => existingFriend._id !== friend._id),
        ],
    })),

    removeFriendFromList: (friendId) => set((state) => ({
        friends: state.friends.filter((f) => f._id !== friendId),
    })),

    removeFromPending: (requestId) => set((state) => ({
        pendingRequests: state.pendingRequests.filter((r) => r._id !== requestId),
    })),

    addToPending: (request) => set((state) => ({
        pendingRequests: [request, ...state.pendingRequests],
    })),

    updateFriendOnlineStatus: (friendId, isOnline, lastSeen) => set((state) => ({
        friends: state.friends.map((f) =>
            f._id === friendId
                ? { ...f, is_online: isOnline, last_seen: lastSeen || f.last_seen }
                : f
        ),
    })),
}));
