import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { env } from "../config/env.js";
import jwt from "jsonwebtoken";
import * as userRepository from "../repositories/user.repository.js";
import * as conversationRepository from "../repositories/conversation.repository.js";

let io;

export const initSocket = async (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: env.FRONTEND_URL,
            credentials: true
        }
    });

    const pubClient = createClient({ url: env.REDIS_URL });
    const subClient = pubClient.duplicate();

    await pubClient.connect();
    await subClient.connect();

    io.adapter(createAdapter(pubClient, subClient));

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.cookie?.split("token=")[1]?.split(";")[0];
        if (!token) {
            return next(new Error("Authentication required"));
        }
        try {
            const decoded = jwt.verify(token, env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch {
            return next(new Error("Invalid token"));
        }
    });

    io.on("connection", async (socket) => {
        socket.join(`user:${socket.userId}`);

        const onlineUser = await userRepository.markPresenceOnline(socket.userId);
        const presenceInterval = setInterval(() => {
            void userRepository.refreshPresenceOnline(socket.userId);
        }, 30000);

        try {
            const { markAsDeliveredWhenOnline } = await import("../services/message.service.js");
            const deliveredUpdates = await markAsDeliveredWhenOnline(socket.userId);

            deliveredUpdates.forEach((update) => {
                io.to(`user:${update.senderId}`).emit("message:status-update", {
                    conversationId: update.conversationId,
                    status: "delivered",
                    deliveredTo: socket.userId
                });
            });
        } catch (error) {
            console.error("Failed to mark messages delivered", error);
        }

        const friendIds = await userRepository.getFriendsIds(socket.userId);
        friendIds.forEach((friendId) => {
            io.to(`user:${friendId}`).emit("friend:online", {
                userId: socket.userId,
                lastSeen: onlineUser?.last_seen
            });
        });

        const emitTypingState = async (event, payload = {}) => {
            const { conversationId, toUserId } = payload;

            if (!conversationId) {
                return;
            }

            if (toUserId) {
                io.to(`user:${toUserId}`).emit(event, { conversationId, userId: socket.userId });
                return;
            }

            const members = await conversationRepository.getConversationMembers(conversationId);

            members.forEach((member) => {
                if (member.user_id.toString() !== socket.userId.toString()) {
                    io.to(`user:${member.user_id.toString()}`).emit(event, {
                        conversationId,
                        userId: socket.userId
                    });
                }
            });
        };

        socket.on("typing:start", (payload) => {
            void emitTypingState("typing:start", payload);
        });

        socket.on("typing:stop", (payload) => {
            void emitTypingState("typing:stop", payload);
        });

        socket.on("disconnect", async () => {
            clearInterval(presenceInterval);
            socket.leave(`user:${socket.userId}`);

            const activeSockets = await io.in(`user:${socket.userId}`).fetchSockets();

            if (activeSockets.length > 0) {
                return;
            }

            const offlineUser = await userRepository.markPresenceOffline(socket.userId);

            friendIds.forEach((friendId) => {
                io.to(`user:${friendId}`).emit("friend:offline", {
                    userId: socket.userId,
                    lastSeen: offlineUser?.last_seen
                });
            });
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }
    return io;
};

export const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};
