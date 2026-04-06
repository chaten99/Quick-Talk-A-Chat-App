import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { useNotificationStore } from "./notificationStore";
import { useFriendStore } from "./friendStore";
import type { Notification } from "../types/notificationTypes";
import type { FriendRequest, Friend } from "../types/friendTypes";
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
        if (existing?.connected) return;

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
        });

        socket.on("friend:request-rejected", (data: { requestId: string; rejectedBy: { _id: string; username: string } }) => {
            toast.info(`${data.rejectedBy.username} rejected your friend request`);
        });

        socket.on("friend:removed", (data: { userId: string }) => {
            useFriendStore.getState().removeFriendFromList(data.userId);
        });

        socket.on("friend:online", (data: { userId: string }) => {
            useFriendStore.getState().updateFriendOnlineStatus(data.userId, true);
        });

        socket.on("friend:offline", (data: { userId: string }) => {
            useFriendStore.getState().updateFriendOnlineStatus(data.userId, false);
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
