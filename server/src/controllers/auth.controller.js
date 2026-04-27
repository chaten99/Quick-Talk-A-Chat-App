import { env } from "../config/env.js";
import * as authService from "../services/auth.service.js";
import responseHelper from "../utils/response.helper.js";
import { generateToken } from "../utils/token.js";

const cookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
};

const getRequestBaseUrl = (req) => {
    const forwardedProto = req.headers["x-forwarded-proto"];
    const forwardedHost = req.headers["x-forwarded-host"];
    const protocol = typeof forwardedProto === "string"
        ? forwardedProto.split(",")[0].trim()
        : req.protocol;
    const host = typeof forwardedHost === "string"
        ? forwardedHost.split(",")[0].trim()
        : req.get("host");

    if (!host) {
        return env.BACKEND_URL || `http://localhost:${env.PORT}`;
    }

    return `${protocol}://${host}`;
};

const buildAuthUser = (user) => ({
    id: user._id,
    email: user.email,
    username: user.username,
    avatar: user.avatar,
    phone: user.phone || "",
    authProvider: user.authProvider,
    friendsCount: user.friends?.length || 0,
    createdAt: user.createdAt,
});

export const signup = async (req, res, next) => {
    try {
        const user = await authService.signup(req.body);
        const token = generateTokenm({ id: user._id });

        res.cookie("token", token, cookieOptions);
        return responseHelper.success(res, "Signup successful", buildAuthUser(user), 201);
    } catch (error) {
        next(error);
    }
};

export const verifyOtp = async (req, res, next) => {
    try {
        await authService.verifyOtp(req.body);
        return responseHelper.success(res, "OTP verified successfully");
    } catch (error) {
        next(error);
    }
};

export const sendOTP = async (req, res, next) => {
    try {
        const email = await authService.sendOTP(req.body.email);
        return responseHelper.success(res, "OTP sent successfully", { email });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const user = await authService.login(req.body);
        const token = generateToken({ id: user._id });

        res.cookie("token", token, cookieOptions);
        return responseHelper.success(res, "Login successful", buildAuthUser(user));
    } catch (error) {
        next(error);
    }
};

export const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "lax"
    });
    return responseHelper.success(res, "Logout successful");
};

export const forgotPassword = async (req, res, next) => {
    try {
        const email = await authService.forgotPassword(req.body.email);
        return responseHelper.success(res, "Password reset OTP sent", { email });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        await authService.resetPassword(req.body);
        return responseHelper.success(res, "Password reset successful");
    } catch (error) {
        next(error);
    }
};

export const googleAuth = (req, res) => {
    const url = authService.getGoogleAuthUrl(getRequestBaseUrl(req));
    res.redirect(url);
};

export const googleCallback = async (req, res, next) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.redirect(`${env.FRONTEND_URL}/auth/google/callback?success=false&message=No+authorization+code`);
        }

        const user = await authService.handleGoogleCallback(code, getRequestBaseUrl(req));
        const token = generateToken({ id: user._id });

        res.cookie("token", token, cookieOptions);
        return res.redirect(`${env.FRONTEND_URL}/auth/google/callback?success=true`);
    } catch (error) {
        return res.redirect(`${env.FRONTEND_URL}/auth/google/callback?success=false&message=${encodeURIComponent(error.message)}`);
    }
};

export const getMe = async (req, res) => {
    const userId = req.userId;
    const user = await authService.getMe(userId);
    return responseHelper.success(res, "User retrieved successfully", buildAuthUser(user));
};
