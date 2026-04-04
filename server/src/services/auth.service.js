import { redisClient } from "../config/redis.js";
import * as userRepository from "../repositories/user.repository.js";
import { generateOTP } from "../utils/otp.js";
import { sendOTPEmail } from "./otp.service.js";
import AppError from "../utils/AppError.js";
import bcrypt from "bcrypt";

export const signup = async (userData) => {
    const existingUser = await userRepository.findByEmail(userData.email);

    if (existingUser) {
        throw new AppError("User already exists", 409);
    }

    userData.password = await bcrypt.hash(userData.password, 10);
    return await userRepository.createUser(userData);
};

export const verifyOtp = async ({ email, otp }) => {
    const storedOTP = await redisClient.get(`otp:${email}`);

    if (!storedOTP) {
        throw new AppError("OTP has expired, request a new one", 400);
    }

    if (otp !== storedOTP) {
        throw new AppError("Invalid OTP", 400);
    }

    await redisClient.del(`otp:${email}`);
};

export const sendOTP = async (email) => {
    const generatedOTP = generateOTP();
    await redisClient.setEx(`otp:${email}`, 600, generatedOTP);
    await sendOTPEmail(email, generatedOTP, "signup");

    return email;
};

export const login = async ({ email, password }) => {
    const user = await userRepository.findByEmail(email);

    if (!user) {
        throw new AppError("Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new AppError("Invalid credentials", 401);
    }

    return user;
};

export const forgotPassword = async (email) => {
    const user = await userRepository.findByEmail(email);

    if (!user) {
        throw new AppError("No account found with this email", 404);
    }

    const generatedOTP = generateOTP();
    await redisClient.setEx(`otp:forgot:${email}`, 600, generatedOTP);
    await sendOTPEmail(email, generatedOTP, "forgot");

    return email;
};

export const resetPassword = async ({ email, otp, newPassword }) => {
    const storedOTP = await redisClient.get(`otp:forgot:${email}`);

    if (!storedOTP) {
        throw new AppError("OTP has expired, request a new one", 400);
    }

    if (otp !== storedOTP) {
        throw new AppError("Invalid OTP", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.updatePassword(email, hashedPassword);
    await redisClient.del(`otp:forgot:${email}`);
};