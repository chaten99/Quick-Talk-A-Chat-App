import { createClient } from "redis";
import { env } from "./env.js";

export const redisClient = createClient({
  url: env.REDIS_URL
});

export const connectRedis = async () => {
  await redisClient.connect();
  console.log("Redis connected");
};