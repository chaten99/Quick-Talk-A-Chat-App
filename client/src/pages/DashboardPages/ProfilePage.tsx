import { Mail, Phone, Users, Calendar, Shield, LogOut, Camera, Loader2, Edit2, Check, X } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { AvatarUploadModal } from "../../components/AvatarUploadModal";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormData } from "../../schemas/profileSchemas";

const ProfilePage = () => {
    const { user, logout, updateProfile, updateAvatar, loading } = useAuthStore();
    const navigate = useNavigate();
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditingUsername, setIsEditingUsername] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            username: user?.username || "",
        },
    });

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out successfully");
        navigate("/login");
    };

    const handleAvatarClick = () => {
        if (loading) return;
        setIsUploadModalOpen(true);
    };

    const handleUploadSubmit = async (file: File) => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Only JPG, PNG, and WebP images are allowed");
            return false;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB");
            return false;
        }

        const res = await updateAvatar(file);
        if (res.success) {
            toast.success("Profile picture updated");
            return true;
        } else {
            toast.error(res.message || "Failed to update profile picture");
            return false;
        }
    };

    const onSaveUsername = async (data: ProfileFormData) => {
        if (data.username === user?.username) {
            setIsEditingUsername(false);
            return;
        }

        const res = await updateProfile({ username: data.username });
        if (res.success) {
            toast.success("Username updated");
            setIsEditingUsername(false);
        } else {
            toast.error(res.message || "Failed to update username");
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const infoItems = [
        {
            icon: Mail,
            label: "Email",
            value: user?.email || "Not set",
        },
        {
            icon: Phone,
            label: "Phone",
            value: user?.phone || "Not set",
            muted: !user?.phone,
        },
        {
            icon: Users,
            label: "Friends",
            value: `${user?.friendsCount || 0} friend${(user?.friendsCount || 0) !== 1 ? "s" : ""}`,
        },
        {
            icon: Shield,
            label: "Auth Provider",
            value: user?.authProvider === "google" ? "Google" : "Email & Password",
        },
        {
            icon: Calendar,
            label: "Joined",
            value: formatDate(user?.createdAt),
        },
    ];

    return (
        <div className="flex-1 flex flex-col bg-[#0a0e1a] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-indigo-600/[0.04] blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-purple-600/[0.03] blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/[0.02] blur-[150px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col h-full overflow-y-auto scrollbar-thin">
                <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:px-6 md:py-12">
                    <div className="w-full max-w-md">
                        <div className="flex flex-col items-center mb-10">
                            <div className="relative mb-6 group cursor-pointer" onClick={handleAvatarClick}>
                                <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-indigo-500/20 blur-xl"></div>
                                
                                {user?.avatar ? (
                                    <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden ring-4 ring-indigo-500/20 shadow-2xl shadow-indigo-500/10">
                                        <img
                                            src={user.avatar}
                                            alt={user.username || "User"}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className={`absolute inset-0 bg-black/50 flex flex-col items-center justify-center transition-opacity duration-200 ${loading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                            {loading ? (
                                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                                            ) : (
                                                <>
                                                    <Camera className="w-8 h-8 text-white/90 mb-1" />
                                                    <span className="text-white/90 text-xs font-semibold">Change</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 ring-4 ring-indigo-500/20 shadow-2xl shadow-indigo-500/10">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-white font-bold text-4xl md:text-5xl">
                                                {user?.username?.charAt(0).toUpperCase() || "U"}
                                            </span>
                                        </div>
                                        <div className={`absolute inset-0 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center transition-opacity duration-200 ${loading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                            {loading ? (
                                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                                            ) : (
                                                <>
                                                    <Camera className="w-8 h-8 text-white/90 mb-1" />
                                                    <span className="text-white/90 text-xs font-semibold">Upload</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div className="absolute bottom-2 right-2 w-5 h-5 md:w-6 md:h-6 rounded-full bg-emerald-500 border-[3px] border-[#0a0e1a] shadow-[0_0_10px_rgba(16,185,129,0.6)] z-10"></div>
                            </div>

                            <div className="w-full">
                                {isEditingUsername ? (
                                    <form onSubmit={handleSubmit(onSaveUsername)} className="flex items-start gap-2 justify-center max-w-[280px] mx-auto">
                                        <div className="flex-1">
                                            <input
                                                {...register("username")}
                                                type="text"
                                                autoFocus
                                                className="w-full px-3 py-1.5 rounded-lg bg-white/[0.05] border border-indigo-500/50 text-white text-center text-lg font-bold outline-none focus:bg-white/[0.08]"
                                            />
                                            {errors.username && (
                                                <span className="text-red-400 text-xs text-center block mt-1">{errors.username.message}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0 pt-0.5">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                                            >
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" strokeWidth={2.5} />}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditingUsername(false);
                                                    reset({ username: user?.username || "" });
                                                }}
                                                disabled={loading}
                                                className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                            >
                                                <X className="w-4 h-4" strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                                            {user?.username || "User"}
                                        </h1>
                                        <button
                                            onClick={() => setIsEditingUsername(true)}
                                            className="w-7 h-7 rounded-md text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 flex items-center justify-center transition-all"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" strokeWidth={2} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {!isEditingUsername && (
                                <p className="text-slate-500 text-sm mt-1">{user?.email || ""}</p>
                            )}
                        </div>

                        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
                            {infoItems.map((item, index) => (
                                <div
                                    key={item.label}
                                    className={`flex items-center gap-4 px-5 py-4 ${
                                        index !== infoItems.length - 1 ? "border-b border-white/[0.06]" : ""
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center shrink-0">
                                        <item.icon className="w-[18px] h-[18px] text-indigo-400" strokeWidth={1.8} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-0.5">
                                            {item.label}
                                        </p>
                                        <p className={`text-sm md:text-base font-medium truncate ${
                                            item.muted ? "text-slate-600 italic" : "text-white"
                                        }`}>
                                            {item.value}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full mt-6 mb-20 md:mb-0 flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-red-500/10 border border-red-500/15 text-red-400 text-sm font-semibold hover:bg-red-500/20 hover:border-red-500/25 transition-all duration-200 cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" strokeWidth={2} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            <AvatarUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUploadSubmit}
            />
        </div>
    );
};

export default ProfilePage;
