export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            SIGNUP: '/auth/signup',
            SEND_OTP: '/auth/send-otp',
            VERIFY_OTP: '/auth/verify-otp',
            LOGOUT: '/auth/logout',
            FORGOT_PASSWORD: '/auth/forgot-password',
            RESET_PASSWORD: '/auth/reset-password',
            GOOGLE: '/auth/google',
        },
    }
}