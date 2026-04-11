import { createClient } from "redis";
import { env } from "./env.js";

export const redisClient = createClient({
  url: env.REDIS_URL
});

const USER_ONLINE_TTL = 60;
const userOnlineKey = (userId) => `presence:online:${userId}`;
const userLastSeenKey = (userId) => `presence:last-seen:${userId}`;
const toIdString = (value) => value?.toString?.() ?? value;

export const connectRedis = async () => {
  await redisClient.connect();
  console.log("Redis connected");
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
