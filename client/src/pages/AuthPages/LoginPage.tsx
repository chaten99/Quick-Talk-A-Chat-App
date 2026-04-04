import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../../store/authStore";
import { loginSchema, type LoginFormData } from "../../schemas/authSchemas";
import AuthLayout from "../../components/auth/AuthLayout";
import { toast } from "react-toastify";
import { API_CONFIG } from "../../api/apiConfig";

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, loading } = useAuthStore();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data: LoginFormData) => {
        const res = await login(data);
        if (res.success) {
            toast.success(res.message);
            navigate("/");
        } else {
            toast.error(res.message);
            setError("root", { message: res.message });
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.GOOGLE}`;
    };

    return (
        <AuthLayout>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 sm:p-10 animate-slide-up">
                <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Welcome back</h1>
                <p className="text-slate-400 text-sm mb-8">Sign in to continue chatting</p>

                {errors.root && (
                    <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-shake">
                        {errors.root.message}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                        <input
                            {...register("email")}
                            type="email"
                            placeholder="john@example.com"
                            className="w-full px-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.email && (
                            <p className="text-red-400 text-xs mt-2 font-medium">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-300">Password</label>
                            <Link to="/forgot-password" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            {...register("password")}
                            type="password"
                            placeholder="Enter your password"
                            className="w-full px-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.password && (
                            <p className="text-red-400 text-xs mt-2 font-medium">{errors.password.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                        {loading ? (
                            <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            "Sign in"
                        )}
                    </button>
                </form>

                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">or</span>
                    <div className="flex-1 h-px bg-white/10" />
                </div>

                <button
                    onClick={handleGoogleLogin}
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
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                        Create one
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default LoginPage;