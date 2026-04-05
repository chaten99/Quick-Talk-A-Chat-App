import type { Login, ResetPassword, SendOtp, Signup, VerifyOtp } from "../types/authTypes";
import apiClient from "./apiClient";
import { API_CONFIG } from "./apiConfig";

export const authApi = {
    login: async (data: Login) => 
        apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, data),
    logout: async () => 
        apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT),
    sendOtp: async (data: SendOtp) =>
        apiClient.post(API_CONFIG.ENDPOINTS.AUTH.SEND_OTP, data),
    verifyOtp: async (data: VerifyOtp) => 
        apiClient.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP, data),
    signup: async (data: Signup) =>
        apiClient.post(API_CONFIG.ENDPOINTS.AUTH.SIGNUP, data),
    forgotPassword: async (data: SendOtp) =>
        apiClient.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, data),
    resetPassword: async (data: ResetPassword) =>
        apiClient.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, data),
    getSession: async () =>
        apiClient.get(API_CONFIG.ENDPOINTS.AUTH.SESSION),
}