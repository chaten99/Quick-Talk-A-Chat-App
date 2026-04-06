import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { env } from "../config/env.js";
import jwt from "jsonwebtoken";
import * as userRepository from "../repositories/user.repository.js";

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

        await userRepository.setOnlineStatus(socket.userId, true);

        const friendIds = await userRepository.getFriendsIds(socket.userId);
        friendIds.forEach((friendId) => {
            io.to(`user:${friendId}`).emit("friend:online", { userId: socket.userId });
        });

        socket.on("disconnect", async () => {
            socket.leave(`user:${socket.userId}`);

            await userRepository.setOnlineStatus(socket.userId, false);

            friendIds.forEach((friendId) => {
                io.to(`user:${friendId}`).emit("friend:offline", { userId: socket.userId });
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
