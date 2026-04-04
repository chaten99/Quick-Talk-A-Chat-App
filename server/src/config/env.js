import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("3000"),
  MONGO_URI: z.string(),
  REDIS_URL: z.string(),
  JWT_SECRET: z.string(),
  FRONTEND_URL: z.string(),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  EMAIL_USER: z.string(),
  EMAIL_PASS: z.string()
});

export const env = envSchema.parse(process.env);