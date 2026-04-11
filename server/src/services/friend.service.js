import * as friendRepository from "../repositories/friend.repository.js";
import * as notificationRepository from "../repositories/notification.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import { emitToUser } from "../sockets/socket.js";
import AppError from "../utils/AppError.js";

export const sendRequest = async (senderId, receiverId) => {
    if (senderId === receiverId) {
        throw new AppError("Cannot send friend request to yourself", 400);
    }

    const receiver = await userRepository.findProfileById(receiverId);
    if (!receiver) {
        throw new AppError("User not found", 404);
    }

    const sender = await userRepository.findProfileById(senderId);
    if (!sender) {
        throw new AppError("User not found", 404);
    }

    const isAlreadyFriend = sender.friends.some((friendId) => friendId.toString() === receiverId.toString());

    if (isAlreadyFriend) {
        throw new AppError("Already friends", 400);
    }

    const existingRequest = await friendRepository.findPendingBetween(senderId, receiverId);
    if (existingRequest) {
        throw new AppError("Friend request already pending", 400);
    }

    const recentRejection = await friendRepository.findRecentRejection(senderId, receiverId);
    if (recentRejection) {
        const remainingMs = 24 * 60 * 60 * 1000 - (Date.now() - new Date(recentRejection.rejected_at).getTime());
        const remainingHrs = Math.ceil(remainingMs / (60 * 60 * 1000));
        throw new AppError(`You can send a new request after ${remainingHrs} hour${remainingHrs > 1 ? "s" : ""}`, 429);
    }

    const request = await friendRepository.createRequest(senderId, receiverId);
    const populatedRequest = await friendRepository.findRequestById(request._id);

    const notification = await notificationRepository.create({
        user_id: receiverId,
        from_user: senderId,
        type: "friend_request",
        content: `${sender.username} sent you a friend request`,
        reference_id: request._id,
    });

    const populatedNotification = await notificationRepository.findById(notification._id);
    const fullNotification = await populatedNotification.populate("from_user", "username email avatar");

    emitToUser(receiverId, "notification:new", fullNotification);
    emitToUser(receiverId, "friend:request-received", populatedRequest);

    return populatedRequest;
};

export const acceptRequest = async (requestId, userId) => {
    const request = await friendRepository.findRequestById(requestId);
    if (!request) {
        throw new AppError("Friend request not found", 404);
    }

    if (request.receiver_id._id.toString() !== userId) {
        throw new AppError("Not authorized to accept this request", 403);
    }

    if (request.status !== "pending") {
        throw new AppError("Request is no longer pending", 400);
    }

    await friendRepository.updateRequestStatus(requestId, "accepted");
    await friendRepository.addFriend(request.sender_id._id, request.receiver_id._id);

    const receiver = await userRepository.findProfileById(userId);

    const notification = await notificationRepository.create({
        user_id: request.sender_id._id,
        from_user: userId,
        type: "friend_accepted",
        content: `${receiver.username} accepted your friend request`,
        reference_id: requestId,
    });

    const fullNotification = await (await notificationRepository.findById(notification._id)).populate("from_user", "username email avatar");

    emitToUser(request.sender_id._id.toString(), "notification:new", fullNotification);
    emitToUser(request.sender_id._id.toString(), "friend:request-accepted", {
        requestId,
        friend: {
            _id: receiver._id,
            username: receiver.username,
            email: receiver.email,
            avatar: receiver.avatar,
            is_online: receiver.is_online,
        }
    });

    return request;
};

export const rejectRequest = async (requestId, userId) => {
    const request = await friendRepository.findRequestById(requestId);
    if (!request) {
        throw new AppError("Friend request not found", 404);
    }

    if (request.receiver_id._id.toString() !== userId) {
        throw new AppError("Not authorized to reject this request", 403);
    }

    if (request.status !== "pending") {
        throw new AppError("Request is no longer pending", 400);
    }

    await friendRepository.updateRequestStatus(requestId, "rejected");

    const receiver = await userRepository.findProfileById(userId);

    const notification = await notificationRepository.create({
        user_id: request.sender_id._id,
        from_user: userId,
        type: "friend_rejected",
        content: `${receiver.username} rejected your friend request`,
        reference_id: requestId,
    });

    const fullNotification = await (await notificationRepository.findById(notification._id)).populate("from_user", "username email avatar");

    emitToUser(request.sender_id._id.toString(), "notification:new", fullNotification);
    emitToUser(request.sender_id._id.toString(), "friend:request-rejected", {
        requestId,
        rejectedBy: {
            _id: receiver._id,
            username: receiver.username,
        }
    });

    return request;
};

export const cancelRequest = async (requestId, userId) => {
    const request = await friendRepository.findRequestById(requestId);
    if (!request) {
        throw new AppError("Friend request not found", 404);
    }

    if (request.sender_id._id.toString() !== userId) {
        throw new AppError("Not authorized to cancel this request", 403);
    }

    if (request.status !== "pending") {
        throw new AppError("Request is no longer pending", 400);
    }

    await friendRepository.deleteRequest(requestId);
    return request;
};

export const getFriends = async (userId, page = 1, limit = 20) => {
    const user = await friendRepository.getFriendsByUserId(userId, page, limit);
    const total = await friendRepository.getFriendsCount(userId);
    const friends = await userRepository.hydrateUsersPresence(user?.friends || []);
    return {
        friends,
        total,
        page,
        hasMore: page * limit < total,
    };
};

export const removeFriend = async (userId, friendId) => {
    const user = await userRepository.findProfileById(userId);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const isFriend = user.friends.some((existingFriendId) => existingFriendId.toString() === friendId.toString());

    if (!isFriend) {
        throw new AppError("Not friends with this user", 400);
    }

    await friendRepository.removeFriend(userId, friendId);
    emitToUser(friendId, "friend:removed", { userId });

    return { removed: true };
};

export const getPendingRequests = async (userId) => {
    return await friendRepository.getPendingRequestsForUser(userId);
};

export const searchUsers = async (query, currentUserId, page = 1, limit = 20) => {
    if (!query || query.trim().length === 0) {
        return { users: [], hasMore: false };
    }
    const results = await userRepository.searchUsers(query.trim(), currentUserId, page, limit);
    const hasMore = results.length > limit;
    const users = hasMore ? results.slice(0, limit) : results;
    return { users, hasMore };
};
