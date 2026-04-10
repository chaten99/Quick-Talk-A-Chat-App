import { createClient } from "redis";
import { env } from "./env.js";

export const redisClient = createClient({
  url: env.REDIS_URL
});

const USER_PROFILE_TTL = 60 * 60;
const USER_ONLINE_TTL = 60;
const userProfileKey = (userId) => `user:profile:${userId}`;
const userOnlineKey = (userId) => `presence:online:${userId}`;
const userLastSeenKey = (userId) => `presence:last-seen:${userId}`;
const toIdString = (value) => value?.toString?.() ?? value;

const toCachedUserProfile = (user) => {
  if (!user) {
    return null;
  }

  const source = typeof user.toObject === "function" ? user.toObject() : user;
  const userId = toIdString(source._id);

  if (!userId) {
    return null;
  }

  return {
    _id: userId,
    username: source.username || "",
    email: source.email || "",
    phone: source.phone || "",
    avatar: source.avatar || "",
    authProvider: source.authProvider || "local",
    googleId: source.googleId || "",
    last_seen: source.last_seen ? new Date(source.last_seen).toISOString() : null,
    is_online: Boolean(source.is_online),
    friends: Array.isArray(source.friends)
      ? source.friends.map((friendId) => toIdString(friendId))
      : [],
    createdAt: source.createdAt ? new Date(source.createdAt).toISOString() : null,
    updatedAt: source.updatedAt ? new Date(source.updatedAt).toISOString() : null
  };
};

export const connectRedis = async () => {
  await redisClient.connect();
  console.log("Redis connected");
};

export const getCachedUserProfile = async (userId) => {
  const cached = await redisClient.get(userProfileKey(userId));
  return cached ? JSON.parse(cached) : null;
};

export const setCachedUserProfile = async (user) => {
  const payload = toCachedUserProfile(user);

  if (!payload) {
    return null;
  }

  await redisClient.setEx(
    userProfileKey(payload._id),
    USER_PROFILE_TTL,
    JSON.stringify(payload)
  );

  return payload;
};

export const deleteCachedUserProfile = async (userId) => {
  await redisClient.del(userProfileKey(userId));
};

export const markUserOnline = async (userId) => {
  const lastSeen = new Date().toISOString();

  await redisClient.multi()
    .setEx(userOnlineKey(userId), USER_ONLINE_TTL, "1")
    .set(userLastSeenKey(userId), lastSeen)
    .exec();

  return {
    is_online: true,
    last_seen: lastSeen
  };
};

export const refreshUserOnline = async (userId) => {
  await redisClient.setEx(userOnlineKey(userId), USER_ONLINE_TTL, "1");
};

export const markUserOffline = async (userId) => {
  const lastSeen = new Date().toISOString();

  await redisClient.multi()
    .del(userOnlineKey(userId))
    .set(userLastSeenKey(userId), lastSeen)
    .exec();

  return {
    is_online: false,
    last_seen: lastSeen
  };
};

export const getUsersPresence = async (userIds = [], fallbackLastSeenMap = new Map()) => {
  const uniqueUserIds = [...new Set(
    userIds
      .map((userId) => toIdString(userId))
      .filter(Boolean)
  )];

  if (uniqueUserIds.length === 0) {
    return new Map();
  }

  const onlineStates = await redisClient.mGet(
    uniqueUserIds.map((userId) => userOnlineKey(userId))
  );
  const lastSeenValues = await redisClient.mGet(
    uniqueUserIds.map((userId) => userLastSeenKey(userId))
  );

  return new Map(
    uniqueUserIds.map((userId, index) => [
      userId,
      {
        is_online: Boolean(onlineStates[index]),
        last_seen: lastSeenValues[index] || fallbackLastSeenMap.get(userId) || null
      }
    ])
  );
};
