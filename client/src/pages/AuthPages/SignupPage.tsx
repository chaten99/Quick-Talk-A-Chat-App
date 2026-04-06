import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../../store/authStore";
import { signupSchema, type SignupFormData } from "../../schemas/authSchemas";
import AuthLayout from "../../components/auth/AuthLayout";
import OtpDialog from "../../components/auth/OtpDialog";
import { toast } from "react-toastify";
import { API_CONFIG } from "../../api/apiConfig";

const SignupPage = () => {
    const navigate = useNavigate();
    const { sendOtp, verifyOtp, signup, loading } = useAuthStore();

    const [emailVerified, setEmailVerified] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        getValues,
        setError,
        clearErrors,
        formState: { errors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: { username: "", email: "", phone: "", password: "" },
    });

    const watchedEmail = watch("email");
    const watchedPassword = watch("password");

    const handleSendOtp = async () => {
        const email = getValues("email");
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError("email", { message: "Enter a valid email first" });
            return;
        }
        clearErrors("email");
        setSendingOtp(true);
        const res = await sendOtp({ email });
        setSendingOtp(false);
        if (res.success) {
            toast.success(res.message);
            setShowOtp(true);
        } else {
            toast.error(res.message);
            setError("root", { message: res.message });
        }
    };

    const handleVerifyOtp = async (otp: string) => {
        const email = getValues("email");
        const res = await verifyOtp({ email, otp });
        if (res.success) {
            setEmailVerified(true);
            setShowOtp(false);
            toast.success(res.message);
            return true;
        } else {
            toast.error(res.message);
        }
        return false;
    };

    const onSubmit = async (data: SignupFormData) => {
        if (!emailVerified) {
            setError("root", { message: "Verify your email first" });
            return;
        }
        const res = await signup(data);
        if (res.success) {
            toast.success(res.message);
            navigate("/");
        } else {
            toast.error(res.message);
            setError("root", { message: res.message });
        }
    };

    const isFormValid = emailVerified && watchedPassword.length >= 6;

    const handleGoogleSignup = () => {
        window.location.href = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.GOOGLE}`;
    };

    return (
        <AuthLayout>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 sm:p-10 animate-slide-up">
                <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Create account</h1>
                <p className="text-slate-400 text-sm mb-8">Start messaging in seconds</p>

                {errors.root && (
                    <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-shake">
                        {errors.root.message}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                        <input
                            {...register("username")}
                            placeholder="johndoe"
                            className="w-full px-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.username && (
                            <p className="text-red-400 text-xs mt-2 font-medium">{errors.username.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <input
                                    {...register("email", {
                                        onChange: () => {
                                            if (emailVerified) setEmailVerified(false);
                                        },
                                    })}
                                    type="email"
                                    disabled={emailVerified}
                                    placeholder="john@example.com"
                                    className={`w-full px-4 py-3.5 rounded-xl bg-black/20 border text-white placeholder:text-slate-500 outline-none transition-all duration-200 
                                        ${emailVerified
                                            ? "border-emerald-500/50 bg-emerald-500/5 pr-10"
                                            : "border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                        }
                                        disabled:opacity-70 disabled:cursor-not-allowed`}
                                />
                                {emailVerified && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            {!emailVerified && (
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={sendingOtp || !watchedEmail}
                                    className="px-5 py-3.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-semibold text-sm whitespace-nowrap transition-all duration-200 hover:bg-indigo-500/30 hover:border-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {sendingOtp ? (
                                        <span className="inline-block w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                                    ) : (
                                        "Verify"
                                    )}
                                </button>
                            )}
                        </div>
                        {errors.email && (
                            <p className="text-red-400 text-xs mt-2 font-medium">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                        <input
                            {...register("phone")}
                            type="tel"
                            placeholder="+91 98765 43210"
                            className="w-full px-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.phone && (
                            <p className="text-red-400 text-xs mt-2 font-medium">{errors.phone.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                        <input
                            {...register("password")}
                            type="password"
                            placeholder="Min 6 characters"
                            className="w-full px-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.password && (
                            <p className="text-red-400 text-xs mt-2 font-medium">{errors.password.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={!isFormValid || loading}
                        className="w-full py-4 mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                        {loading ? (
                            <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            "Create account"
                        )}
                    </button>
                </form>

                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">or</span>
                    <div className="flex-1 h-px bg-white/10" />
                </div>

                <button
                    onClick={handleGoogleSignup}
                    className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm flex items-center justify-center gap-3 transition-all duration-200 hover:bg-white/10 hover:border-white/20 cursor-pointer"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                <p className="text-center text-sm text-slate-400 mt-8">
                    Already have an account?{" "}
                    <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>

            {showOtp && (
                <OtpDialog
                    email={getValues("email")}
                    onVerify={handleVerifyOtp}
                    onClose={() => setShowOtp(false)}
                    onResend={handleSendOtp}
                />
            )}
        </AuthLayout>
    );
};

export default SignupPage;