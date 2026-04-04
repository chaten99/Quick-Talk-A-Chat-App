import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import AuthLayout from "../../components/auth/AuthLayout";

const GoogleCallbackPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const success = searchParams.get("success");
        const message = searchParams.get("message");

        if (success === "true") {
            toast.success("Login successful");
            navigate("/", { replace: true });
        } else {
            toast.error(message || "Google login failed");
            navigate("/login", { replace: true });
        }
    }, [searchParams, navigate]);

    return (
        <AuthLayout>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 sm:p-10 text-center">
                <div className="flex flex-col items-center gap-4">
                    <span className="inline-block w-8 h-8 border-3 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                    <p className="text-slate-300 text-sm font-medium">Completing sign in...</p>
                </div>
            </div>
        </AuthLayout>
    );
};

export default GoogleCallbackPage;
