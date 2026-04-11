import User from "../models/user.model.js";
import {
    getUsersPresence as getRedisUsersPresence,
    markUserOffline,
    markUserOnline,
    refreshUserOnline
} from "../config/redis.js";

const profileSelect = "username email phone avatar authProvider googleId friends createdAt updatedAt last_seen is_online";

const toPlainUser = (user) => {
    if (!user) {
        return null;
    }

    return typeof user.toObject === "function" ? user.toObject() : user;
};

const applyPresence = (user, presence) => {
    const source = toPlainUser(user);

    if (!source) {
        return null;
    }

    return {
        ...source,
        is_online: presence?.is_online ?? Boolean(source.is_online),
        last_seen: presence?.last_seen || source.last_seen || null
    };
};

export const findByEmail = (email) => {
    return User.findOne({ email });
};

export const createUser = async (userData) => {
    const user = new User(userData);
    return user.save();
};

export const findById = (id) => {
    return User.findById(id);
};

export const findProfileById = async (id) => {
    const user = await User.findById(id).select(profileSelect).lean();

    if (!user) {
        return null;
    }

    const fallbackLastSeenMap = new Map();
    fallbackLastSeenMap.set(user._id.toString(), user.last_seen || null);

    const presenceMap = await getRedisUsersPresence([user._id.toString()], fallbackLastSeenMap);
    return applyPresence(user, presenceMap.get(user._id.toString()));
};

export const updatePassword = (email, hashedPassword) => {
    return User.findOneAndUpdate({ email }, { password: hashedPassword }, { returnDocument: "after" });
};

export const findByGoogleId = (googleId) => {
    return User.findOne({ googleId });
};

export const findOrCreateGoogleUser = async ({ googleId, email, username, avatar }) => {
    const existingUser = await User.findOne({ googleId });

    if (existingUser) {
        return existingUser;
    }

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
        existingEmail.googleId = googleId;
        existingEmail.authProvider = "google";

        if (!existingEmail.avatar && avatar) {
            existingEmail.avatar = avatar;
        }

        return existingEmail.save();
    }

    const user = new User({
        googleId,
        email,
        username,
        avatar,
        authProvider: "google",
    });

    return user.save();
};

export const searchUsers = (query, currentUserId, page = 1, limit = 20) => {
    const regex = new RegExp(query, "i");

    return User.find({
        _id: { $ne: currentUserId },
        $or: [
            { username: regex },
            { email: regex },
            { phone: regex }
        ]
    }).select("username email avatar phone")
        .skip((page - 1) * limit)
        .limit(limit + 1);
};

export const setOnlineStatus = (userId, isOnline, lastSeen = new Date()) => {
    const update = { is_online: isOnline, last_seen: lastSeen };
    return User.findByIdAndUpdate(userId, update, { returnDocument: "after" });
};

export const markPresenceOnline = async (userId) => {
    return markUserOnline(userId);
};

export const refreshPresenceOnline = async (userId) => {
    await refreshUserOnline(userId);
};

export const markPresenceOffline = async (userId) => {
    const presence = await markUserOffline(userId);
    await setOnlineStatus(userId, false, presence.last_seen);
    return presence;
};

export const getUsersPresence = async (userIds = [], fallbackLastSeenMap = new Map()) => {
    return getRedisUsersPresence(userIds, fallbackLastSeenMap);
};

export const hydrateUserPresence = async (user) => {
    const source = toPlainUser(user);

    if (!source?._id) {
        return source;
    }

    const fallbackLastSeenMap = new Map();
    fallbackLastSeenMap.set(source._id.toString(), source.last_seen || null);

    const presenceMap = await getRedisUsersPresence([source._id.toString()], fallbackLastSeenMap);
    return applyPresence(source, presenceMap.get(source._id.toString()));
};

export const hydrateUsersPresence = async (users = []) => {
    const plainUsers = users
        .map((user) => toPlainUser(user))
        .filter((user) => user?._id);

    if (plainUsers.length === 0) {
        return [];
    }

    const fallbackLastSeenMap = new Map(
        plainUsers.map((user) => [user._id.toString(), user.last_seen || null])
    );
    const presenceMap = await getRedisUsersPresence(
        plainUsers.map((user) => user._id.toString()),
        fallbackLastSeenMap
    );

    return plainUsers.map((user) => applyPresence(user, presenceMap.get(user._id.toString())));
};

export const getFriendsIds = async (userId) => {
    const user = await User.findById(userId).select("friends").lean();
    return user?.friends?.map((friendId) => friendId.toString()) || [];
};

export const updateProfile = async (userId, data) => {
    return User.findByIdAndUpdate(userId, data, { returnDocument: "after" });
};
