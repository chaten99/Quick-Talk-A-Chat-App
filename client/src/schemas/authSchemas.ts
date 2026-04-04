import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Enter a valid email"),
    password: z
        .string()
        .min(1, "Password is required"),
});

export const signupSchema = z.object({
    username: z
        .string()
        .min(1, "Username is required")
        .min(3, "Username must be at least 3 characters"),
    email: z
        .string()
        .min(1, "Email is required")
        .email("Enter a valid email"),
    phone: z
        .string()
        .min(1, "Phone number is required"),
    password: z
        .string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters"),
});

export const forgotPasswordEmailSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Enter a valid email"),
});

export const resetPasswordSchema = z.object({
    newPassword: z
        .string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters"),
    confirmPassword: z
        .string()
        .min(1, "Confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ForgotPasswordEmailFormData = z.infer<typeof forgotPasswordEmailSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
