import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { useNotificationStore } from "./notificationStore";
import { useFriendStore } from "./friendStore";
import { useChatStore } from "./chatStore";
import type { Notification } from "../types/notificationTypes";
import type { FriendRequest, Friend } from "../types/friendTypes";
import type { ChatUser, Conversation, Message, MessageStatus } from "../types/chatTypes";
import { toast } from "react-toastify";

type SocketStore = {
    socket: Socket | null;
    connected: boolean;
    connect: () => void;
    disconnect: () => void;
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

export const useSocketStore = create<SocketStore>((set, get) => ({
    socket: null,
    connected: false,

    connect: () => {
        const existing = get().socket;
        if (existing) return;

        const socket = io(SOCKET_URL, {
            withCredentials: true,
        });

        socket.on("connect", () => {
            set({ connected: true });
        });

        socket.on("disconnect", () => {
            set({ connected: false });
        });

        socket.on("notification:new", (notification: Notification) => {
            useNotificationStore.getState().addNotification(notification);
        });

        socket.on("friend:request-received", (request: FriendRequest) => {
            useFriendStore.getState().addToPending(request);
        });

        socket.on("friend:request-accepted", (data: { requestId: string; friend: Friend }) => {
            useFriendStore.getState().addFriend(data.friend);
            useChatStore.getState().updateConversationMessagingPermission(data.friend._id, true);
        });

        socket.on("friend:request-rejected", (data: { requestId: string; rejectedBy: { _id: string; username: string } }) => {
            toast.info(`${data.rejectedBy.username} rejected your friend request`);
        });

        socket.on("friend:removed", (data: { userId: string }) => {
            useFriendStore.getState().removeFriendFromList(data.userId);
            useChatStore.getState().updateConversationMessagingPermission(data.userId, false);
        });

        socket.on("friend:online", (data: { userId: string; lastSeen?: string }) => {
            useFriendStore.getState().updateFriendOnlineStatus(data.userId, true, data.lastSeen);
            useChatStore.getState().updateFriendPresence(data.userId, true, data.lastSeen);
        });

        socket.on("friend:offline", (data: { userId: string; lastSeen?: string }) => {
            useFriendStore.getState().updateFriendOnlineStatus(data.userId, false, data.lastSeen);
            useChatStore.getState().updateFriendPresence(data.userId, false, data.lastSeen);
        });

        socket.on("conversation:new", (data: { conversation: Conversation }) => {
            useChatStore.getState().upsertConversation(data.conversation);
        });

        socket.on("message:new", (data: { message: Message; conversationId: string; conversation?: Conversation }) => {
            const { message, conversationId, conversation } = data;
            const chatStore = useChatStore.getState();

            if (conversation) {
                chatStore.upsertConversation(conversation);
            }

            chatStore.addMessage(conversationId, message);

            if (!conversation) {
                const incrementUnread = chatStore.activeConversationId !== conversationId;
                chatStore.updateConversationLastMessage(conversationId, message, incrementUnread);
            }
        });

        socket.on("message:status-update", (data: { conversationId?: string; status: MessageStatus; readBy?: string; deliveredTo?: string }) => {
            const chatStore = useChatStore.getState();
            if (data.conversationId) {
                chatStore.updateMessageStatus(data.conversationId, data.status);
            } else if (data.deliveredTo) {
                Object.keys(chatStore.messages).forEach((conversationId) => {
                    chatStore.updateMessageStatus(conversationId, data.status);
                });
            }
        });

        socket.on("message:seen-update", (data: { conversationId: string; messageIds: string[]; seenBy: ChatUser; seenAt: string }) => {
            useChatStore.getState().applyMessageSeenUpdate(
                data.conversationId,
                data.messageIds,
                data.seenBy,
                data.seenAt
            );
        });

        socket.on("typing:start", (data: { conversationId: string; userId: string }) => {
            useChatStore.getState().setTyping(data.conversationId, data.userId, true);
        });

        socket.on("typing:stop", (data: { conversationId: string; userId: string }) => {
            useChatStore.getState().setTyping(data.conversationId, data.userId, false);
        });

        set({ socket });
    },

    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null, connected: false });
        }
    },
}));
