import { create } from "zustand";
import type { AuthResponse, AuthStore, Login, SendOtp, VerifyOtp, Signup, ResetPassword } from "../types/authTypes";
import { authApi } from "../api/authApi";
import type { AxiosError } from "axios";

const handleError = (err: unknown): AuthResponse => {
    const error = err as AxiosError<{ message: string }>;
    return {
        message: error.response?.data?.message || "Something went wrong",
        success: false,
    };
};

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    loading: false,
    setUser: (user) => set({ user }),

    login: async (data: Login) => {
        try {
            set({ loading: true });
            const res = await authApi.login(data);
            set({ user: res.data.data });
            return { message: res.data.message, success: true };
        } catch (err) {
            return handleError(err);
        } finally {
            set({ loading: false });
        }
    },

    logout: async () => {
        try {
            await authApi.logout();
            set({ user: null });
        } catch {
            set({ user: null });
        }
    },

    sendOtp: async (data: SendOtp) => {
        try {
            set({ loading: true });
            const res = await authApi.sendOtp(data);
            return { message: res.data.message, success: true };
        } catch (err) {
            return handleError(err);
        } finally {
            set({ loading: false });
        }
    },

    verifyOtp: async (data: VerifyOtp) => {
        try {
            set({ loading: true });
            const res = await authApi.verifyOtp(data);
            return { message: res.data.message, success: true };
        } catch (err) {
            return handleError(err);
        } finally {
            set({ loading: false });
        }
    },

    signup: async (data: Signup) => {
        try {
            set({ loading: true });
            const res = await authApi.signup(data);
            set({ user: res.data.data });
            return { message: res.data.message, success: true };
        } catch (err) {
            return handleError(err);
        } finally {
            set({ loading: false });
        }
    },

    forgotPassword: async (data: SendOtp) => {
        try {
            set({ loading: true });
            const res = await authApi.forgotPassword(data);
            return { message: res.data.message, success: true };
        } catch (err) {
            return handleError(err);
        } finally {
            set({ loading: false });
        }
    },

    resetPassword: async (data: ResetPassword) => {
        try {
            set({ loading: true });
            const res = await authApi.resetPassword(data);
            return { message: res.data.message, success: true };
        } catch (err) {
            return handleError(err);
        } finally {
            set({ loading: false });
        }
    },
}));