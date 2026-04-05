import { Router } from "express";
import { login, logout, sendOTP, signup, verifyOtp, forgotPassword, resetPassword, googleAuth, googleCallback, getMe } from "../controllers/auth.controller.js";
import { loginValidator, sendOtpValidator, signupValidator, verifyOtpValidator, forgotPasswordValidator, resetPasswordValidator } from "../validators/auth.validator.js";
import { validate } from "../middlewares/validation.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/signup", signupValidator, validate, signup);
router.post("/verify-otp", verifyOtpValidator, validate, verifyOtp);
router.post("/send-otp", sendOtpValidator, validate, sendOTP);
router.post("/login", loginValidator, validate, login);
router.post("/logout", logout);
router.get("/session", protect ,getMe);

router.post("/forgot-password", forgotPasswordValidator, validate, forgotPassword);
router.post("/reset-password", resetPasswordValidator, validate, resetPassword);

router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

export default router;