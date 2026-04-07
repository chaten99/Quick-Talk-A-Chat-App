import { MessageSquare, Users, Bell, UserPlus, LogOut, User } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useNotificationStore } from "../../store/notificationStore";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useEffect } from "react";
import BrandLogo from "./BrandLogo";

const Sidebar = () => {
    const { logout } = useAuthStore();
    const { unreadCount, fetchUnreadCount } = useNotificationStore();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchUnreadCount();
    }, [fetchUnreadCount]);

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out successfully");
        navigate("/login");
    };

    const navItems = [
        { icon: MessageSquare, label: "Messages", path: "/" },
        { icon: Users, label: "Friends", path: "/friends" },
        { icon: Bell, label: "Notifications", path: "/notifications" },
        { icon: UserPlus, label: "Add Friends", path: "/add-friend" },
        { icon: User, label: "Profile", path: "/profile" },
    ];

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <aside className="fixed bottom-0 left-0 w-full h-[60px] md:relative md:w-[72px] md:h-screen bg-[#080c14] border-t md:border-t-0 md:border-r border-white/[0.06] flex flex-row md:flex-col items-center justify-around md:justify-start py-0 md:py-6 shrink-0 z-50">
            <div className="hidden md:block mb-8">
                <BrandLogo mode="icon" onClick={() => navigate("/")} className="transition-transform duration-200 hover:scale-105" />
            </div>

            <nav className="flex flex-row md:flex-col items-center justify-around md:justify-start gap-1 md:gap-2 flex-1 w-full px-2 md:px-0">
                {navItems.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => navigate(item.path)}
                        className={`group relative w-10 md:w-11 h-10 md:h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                            isActive(item.path)
                                ? "bg-indigo-500/15 text-indigo-400"
                                : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
                        }`}
                    >
                        {isActive(item.path) && (
                            <>
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[8px] w-5 h-[3px] bg-indigo-500 rounded-b-full hidden md:hidden"></div>
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[16px] w-[3px] h-5 bg-indigo-500 rounded-r-full hidden md:block"></div>
                            </>
                        )}
                        <item.icon className="w-[20px] h-[20px]" strokeWidth={isActive(item.path) ? 2.2 : 1.8} />
                        {item.label === "Notifications" && unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 md:-top-0.5 md:-right-0.5 min-w-[18px] h-[18px] rounded-full bg-indigo-500 flex items-center justify-center px-1 border-2 border-[#080c14]">
                                <span className="text-white text-[10px] font-bold leading-none">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            </div>
                        )}
                        <div className="hidden md:block absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 shadow-xl border border-white/10">
                            {item.label}
                        </div>
                    </button>
                ))}
            </nav>

            <div className="mt-auto hidden md:block">
                <button
                    onClick={handleLogout}
                    className="group relative w-11 h-11 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
                >
                    <LogOut className="w-[20px] h-[20px]" strokeWidth={1.8} />
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 shadow-xl border border-white/10">
                        Logout
                    </div>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
