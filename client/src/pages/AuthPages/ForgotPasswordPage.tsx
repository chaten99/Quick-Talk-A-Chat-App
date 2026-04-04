import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../../store/authStore";
import {
    forgotPasswordEmailSchema,
    resetPasswordSchema,
    type ForgotPasswordEmailFormData,
    type ResetPasswordFormData,
} from "../../schemas/authSchemas";
import AuthLayout from "../../components/auth/AuthLayout";
import OtpDialog from "../../components/auth/OtpDialog";
import { toast } from "react-toastify";

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const { forgotPassword, resetPassword, loading } = useAuthStore();

    const [step, setStep] = useState<"email" | "reset">("email");
    const [email, setEmail] = useState("");
    const [showOtp, setShowOtp] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [verifiedOtp, setVerifiedOtp] = useState("");

    const emailForm = useForm<ForgotPasswordEmailFormData>({
        resolver: zodResolver(forgotPasswordEmailSchema),
        defaultValues: { email: "" },
    });

    const resetForm = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { newPassword: "", confirmPassword: "" },
    });

    const handleSendOtp = async (data: ForgotPasswordEmailFormData) => {
        const res = await forgotPassword({ email: data.email });
        if (res.success) {
            setEmail(data.email);
            toast.success(res.message);
            setShowOtp(true);
        } else {
            toast.error(res.message);
            emailForm.setError("root", { message: res.message });
        }
    };

    const handleVerifyOtp = async (otp: string) => {
        setVerifiedOtp(otp);
        setOtpVerified(true);
        setShowOtp(false);
        setStep("reset");
        return true;
    };

    const handleResetPassword = async (data: ResetPasswordFormData) => {
        const res = await resetPassword({ email, otp: verifiedOtp, newPassword: data.newPassword });
        if (res.success) {
            toast.success(res.message);
            setTimeout(() => navigate("/login"), 1500);
        } else {
            toast.error(res.message);
            resetForm.setError("root", { message: res.message });
        }
    };

    return (
        <AuthLayout>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 sm:p-10 animate-slide-up">
                {step === "email" && (
                    <>
                        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Forgot password?</h1>
                        <p className="text-slate-400 text-sm mb-8">Enter your email and we'll send a reset code</p>

                        {emailForm.formState.errors.root && (
                            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-shake">
                                {emailForm.formState.errors.root.message}
                            </div>
                        )}

                        <form onSubmit={emailForm.handleSubmit(handleSendOtp)} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                                <input
                                    {...emailForm.register("email")}
                                    type="email"
                                    placeholder="john@example.com"
                                    className="w-full px-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                                {emailForm.formState.errors.email && (
                                    <p className="text-red-400 text-xs mt-2 font-medium">{emailForm.formState.errors.email.message}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                            >
                                {loading ? (
                                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    "Send reset code"
                                )}
                            </button>
                        </form>

                        <p className="text-center text-sm text-slate-400 mt-8">
                            Remember your password?{" "}
                            <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </>
                )}

                {step === "reset" && otpVerified && (
                    <>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">Set new password</h1>
                        </div>
                        <p className="text-slate-400 text-sm mb-8 ml-[52px]">
                            OTP verified for <span className="text-indigo-400 font-medium">{email}</span>
                        </p>

                        {resetForm.formState.errors.root && (
                            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-shake">
                                {resetForm.formState.errors.root.message}
                            </div>
                        )}

                        <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">New password</label>
                                <input
                                    {...resetForm.register("newPassword")}
                                    type="password"
                                    placeholder="Min 6 characters"
                                    className="w-full px-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                                {resetForm.formState.errors.newPassword && (
                                    <p className="text-red-400 text-xs mt-2 font-medium">{resetForm.formState.errors.newPassword.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm password</label>
                                <input
                                    {...resetForm.register("confirmPassword")}
                                    type="password"
                                    placeholder="Re-enter your password"
                                    className="w-full px-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                                {resetForm.formState.errors.confirmPassword && (
                                    <p className="text-red-400 text-xs mt-2 font-medium">{resetForm.formState.errors.confirmPassword.message}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                            >
                                {loading ? (
                                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    "Reset password"
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>

            {showOtp && (
                <OtpDialog
                    email={email || emailForm.getValues("email")}
                    onVerify={handleVerifyOtp}
                    onClose={() => setShowOtp(false)}
                    onResend={() => emailForm.handleSubmit(handleSendOtp)()}
                />
            )}
        </AuthLayout>
    );
};

export default ForgotPasswordPage;