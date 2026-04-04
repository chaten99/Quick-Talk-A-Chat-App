import { body } from "express-validator";

export const signupValidator = [
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("phone").isMobilePhone().withMessage("Valid phone number is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
];

export const verifyOtpValidator = [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits")
];

export const sendOtpValidator = [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail()
];

export const loginValidator = [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required")
];

export const forgotPasswordValidator = [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail()
];

export const resetPasswordValidator = [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters")
];