import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

const OtpDialog = ({
    email,
    onVerify,
    onClose,
    onResend,
}: {
    email: string;
    onVerify: (otp: string) => Promise<boolean>;
    onClose: () => void;
    onResend: () => void;
}) => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendTimer, setResendTimer] = useState(120);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) return;
        if (value && !/^\d$/.test(value)) return;

        const updated = [...otp];
        updated[index] = value;
        setOtp(updated);
        setError("");

        if (value && index < 5) {
            const next = document.getElementById(`otp-${index + 1}`);
            next?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const prev = document.getElementById(`otp-${index - 1}`);
            prev?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(""));
            const last = document.getElementById("otp-5");
            last?.focus();
        }
    };

    const handleSubmit = async () => {
        const code = otp.join("");
        if (code.length !== 6) {
            setError("Enter all 6 digits");
            return;
        }
        setLoading(true);
        const success = await onVerify(code);
        setLoading(false);
        if (success) {
            toast.success("OTP verified successfully");
            onClose();
        } else {
            toast.error("Invalid OTP, try again");
            setError("Invalid OTP, try again");
            setOtp(["", "", "", "", "", ""]);
            document.getElementById("otp-0")?.focus();
        }
    };

    const handleResend = () => {
        if (resendTimer > 0) return;
        onResend();
        setOtp(["", "", "", "", "", ""]);
        setError("");
        setResendTimer(120);
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        document.getElementById("otp-0")?.focus();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-md mx-4 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl p-8 sm:p-10 animate-slide-up relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5 shadow-inner">
                            <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-extrabold text-white tracking-tight">Check your email</h3>
                        <p className="text-sm text-slate-400 mt-2">
                            We sent a 6-digit code to <br className="hidden sm:block" />
                            <span className="text-indigo-400 font-medium">{email}</span>
                        </p>
                    </div>

                    <div className="flex gap-2 sm:gap-3 justify-center mb-2" onPaste={handlePaste}>
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                id={`otp-${i}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold rounded-xl bg-black/40 border transition-all duration-200 outline-none text-white shadow-inner
                                    ${error
                                        ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                        : "border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="h-6 mt-2 mb-4 flex items-center justify-center">
                        {error && (
                            <p className="text-center text-sm text-red-400 font-medium animate-shake bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-lg">
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading || otp.join("").length !== 6}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                        {loading ? (
                            <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            "Verify OTP"
                        )}
                    </button>

                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                        <button
                            onClick={handleResend}
                            disabled={resendTimer > 0}
                            className={`text-sm font-medium transition-colors cursor-pointer ${
                                resendTimer > 0
                                    ? "text-slate-600 cursor-not-allowed"
                                    : "text-indigo-400 hover:text-indigo-300"
                            }`}
                        >
                            {resendTimer > 0 ? `Resend code (${formatTimer(resendTimer)})` : "Resend code"}
                        </button>
                        <button
                            onClick={onClose}
                            className="text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OtpDialog;