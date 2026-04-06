import { Mail, Phone, Users, Calendar, Shield, LogOut } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProfilePage = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out successfully");
        navigate("/login");
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
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                    <div className="w-full max-w-md">
                        <div className="flex flex-col items-center mb-10">
                            <div className="relative mb-6">
                                <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-indigo-500/20 blur-xl"></div>
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.username || "User"}
                                        className="relative w-28 h-28 rounded-full object-cover ring-4 ring-indigo-500/20 shadow-2xl shadow-indigo-500/10"
                                    />
                                ) : (
                                    <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-4 ring-indigo-500/20 shadow-2xl shadow-indigo-500/10">
                                        <span className="text-white font-bold text-4xl">
                                            {user?.username?.charAt(0).toUpperCase() || "U"}
                                        </span>
                                    </div>
                                )}
                                <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-[3px] border-[#0a0e1a] shadow-[0_0_10px_rgba(16,185,129,0.6)]"></div>
                            </div>

                            <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
                                {user?.username || "User"}
                            </h1>
                            <p className="text-slate-500 text-sm">{user?.email || ""}</p>
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
                                        <p className={`text-sm font-medium truncate ${
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
                            className="w-full mt-6 flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-red-500/10 border border-red-500/15 text-red-400 text-sm font-semibold hover:bg-red-500/20 hover:border-red-500/25 transition-all duration-200 cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" strokeWidth={2} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
