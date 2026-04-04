import { redisClient } from "../config/redis.js";
import * as userRepository from "../repositories/user.repository.js";
import { generateOTP } from "../utils/otp.js";
import { sendOTPEmail } from "./otp.service.js";
import AppError from "../utils/AppError.js";
import { env } from "../config/env.js";
import bcrypt from "bcrypt";

export const signup = async (userData) => {
    const existingUser = await userRepository.findByEmail(userData.email);

    if (existingUser) {
        throw new AppError("User already exists", 409);
    }

    userData.password = await bcrypt.hash(userData.password, 10);
    userData.authProvider = "local";
    return await userRepository.createUser(userData);
};

export const verifyOtp = async ({ email, otp }) => {
    const key = `otp:${email}`;
    const storedData = await redisClient.get(key);

    if (!storedData) {
        throw new AppError("OTP has expired, request a new one", 400);
    }

    const parsed = JSON.parse(storedData);

    if (otp !== parsed.otp) {
        throw new AppError("Invalid OTP", 400);
    }

    await redisClient.del(key);
};

export const sendOTP = async (email) => {
    const key = `otp:${email}`;
    const existingData = await redisClient.get(key);

    if (existingData) {
        const parsed = JSON.parse(existingData);
        if (Date.now() - parsed.dateCreated < 2 * 60 * 1000) {
            throw new AppError(`OTP already sent, please wait ${Math.ceil((2 * 60 * 1000 - (Date.now() - parsed.dateCreated)) / 1000)} seconds before requesting a new one`, 429);
        }
        await redisClient.del(key);
    }

    const generatedOTP = generateOTP();
    const payload = JSON.stringify({
        otp: generatedOTP,
        dateCreated: Date.now()
    });

    await redisClient.setEx(key, 600, payload);

    await sendOTPEmail(email, generatedOTP, "signup");
    return email;
};


export const login = async ({ email, password }) => {
    const user = await userRepository.findByEmail(email);

    if (!user) {
        throw new AppError("Invalid credentials", 401);
    }

    if (user.authProvider === "google" && !user.password) {
        throw new AppError("This account uses Google sign-in", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new AppError("Invalid credentials", 401);
    }

    return user;
};

export const forgotPassword = async (email) => {
    const key = `otp:forgot:${email}`;
    const existingData = await redisClient.get(key);

    if (existingData) {
        const parsed = JSON.parse(existingData);
        if (Date.now() - parsed.dateCreated < 2 * 60 * 1000) {
            throw new AppError(`OTP already sent, please wait ${Math.ceil((2 * 60 * 1000 - (Date.now() - parsed.dateCreated)) / 1000)} seconds before requesting a new one`, 429);
        }
        await redisClient.del(key);
    }

    const generatedOTP = generateOTP();
    const payload = JSON.stringify({ otp: generatedOTP, dateCreated: Date.now() });

    await redisClient.setEx(key, 600, payload);
    await sendOTPEmail(email, generatedOTP, "forgot");

    return email;
};


export const resetPassword = async ({ email, otp, newPassword }) => {
    const storedData = await redisClient.get(`otp:forgot:${email}`);

    if (!storedData) {
        throw new AppError("OTP has expired, request a new one", 400);
    }

    const parsed = JSON.parse(storedData);

    if (otp !== parsed.otp) {
        throw new AppError("Invalid OTP", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.updatePassword(email, hashedPassword);
    await redisClient.del(`otp:forgot:${email}`);
};

const getGoogleRedirectUri = () => {
    const baseUrl = env.NODE_ENV === "production"
        ? env.FRONTEND_URL.replace(/\/+$/, "")
        : `http://localhost:${env.PORT}`;
    return `${baseUrl}/api/auth/google/callback`;
};

export const getGoogleAuthUrl = () => {
    const params = new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        redirect_uri: getGoogleRedirectUri(),
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        prompt: "consent",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const handleGoogleCallback = async (code) => {
    const redirectUri = getGoogleRedirectUri();

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            code,
            client_id: env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
        }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
        throw new AppError("Google authentication failed", 401);
    }

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await profileRes.json();

    if (!profile.email) {
        throw new AppError("Failed to get Google profile", 401);
    }

    const user = await userRepository.findOrCreateGoogleUser({
        googleId: profile.id,
        email: profile.email,
        username: profile.name || profile.email.split("@")[0],
        avatar: profile.picture || "",
    });

    return user;
};