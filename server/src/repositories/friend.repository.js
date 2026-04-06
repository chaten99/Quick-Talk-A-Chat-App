import FriendRequest from "../models/friend_request.model.js";
import User from "../models/user.model.js";

export const createRequest = (senderId, receiverId) => {
    return FriendRequest.create({ sender_id: senderId, receiver_id: receiverId });
};

export const findPendingRequest = (senderId, receiverId) => {
    return FriendRequest.findOne({
        sender_id: senderId,
        receiver_id: receiverId,
        status: "pending"
    });
};

export const findPendingBetween = (userA, userB) => {
    return FriendRequest.findOne({
        $or: [
            { sender_id: userA, receiver_id: userB },
            { sender_id: userB, receiver_id: userA }
        ],
        status: "pending"
    });
};

export const findRecentRejection = (senderId, receiverId) => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return FriendRequest.findOne({
        sender_id: senderId,
        receiver_id: receiverId,
        status: "rejected",
        rejected_at: { $gte: twentyFourHoursAgo }
    });
};

export const findRequestById = (id) => {
    return FriendRequest.findById(id).populate("sender_id", "username email avatar").populate("receiver_id", "username email avatar");
};

export const updateRequestStatus = (id, status) => {
    const update = { status };
    if (status === "rejected") {
        update.rejected_at = new Date();
    }
    return FriendRequest.findByIdAndUpdate(id, update, { returnDocument: "after" });
};

export const deleteRequest = (id) => {
    return FriendRequest.findByIdAndDelete(id);
};

export const getPendingRequestsForUser = (userId) => {
    return FriendRequest.find({ receiver_id: userId, status: "pending" })
        .populate("sender_id", "username email avatar phone")
        .sort({ createdAt: -1 });
};

export const getSentRequestsForUser = (userId) => {
    return FriendRequest.find({ sender_id: userId, status: "pending" })
        .populate("receiver_id", "username email avatar phone")
        .sort({ createdAt: -1 });
};

export const addFriend = async (userId, friendId) => {
    await User.findByIdAndUpdate(userId, { $addToSet: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $addToSet: { friends: userId } });
};

export const removeFriend = async (userId, friendId) => {
    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });
};

export const getFriendsByUserId = (userId, page = 1, limit = 20) => {
    return User.findById(userId)
        .select("friends")
        .populate({
            path: "friends",
            select: "username email avatar phone is_online last_seen",
            options: {
                skip: (page - 1) * limit,
                limit: limit
            }
        });
};

export const getFriendsCount = async (userId) => {
    const user = await User.findById(userId).select("friends");
    return user?.friends?.length || 0;
};
