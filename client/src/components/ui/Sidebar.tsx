import { MessageSquare, Users, Bell, UserPlus, LogOut } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Sidebar = () => {
    const { logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out successfully");
        navigate("/login");
    };

    const navItems = [
        { icon: MessageSquare, label: "Messages", active: true },
        { icon: Users, label: "Contacts", active: false },
        { icon: Bell, label: "Notifications", active: false },
        { icon: UserPlus, label: "Add Friends", active: false },
    ];

    return (
        <aside className="w-[72px] h-screen bg-[#080c14] border-r border-white/[0.06] flex flex-col items-center py-6 shrink-0">
            <div className="mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 cursor-pointer transition-transform duration-200 hover:scale-105">
                    <span className="text-white font-extrabold text-sm tracking-tighter">QT</span>
                </div>
            </div>

            <nav className="flex flex-col items-center gap-2 flex-1">
                {navItems.map((item) => (
                    <button
                        key={item.label}
                        className={`group relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                            item.active
                                ? "bg-indigo-500/15 text-indigo-400"
                                : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
                        }`}
                    >
                        {item.active && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[16px] w-[3px] h-5 bg-indigo-500 rounded-r-full"></div>
                        )}
                        <item.icon className="w-[20px] h-[20px]" strokeWidth={item.active ? 2.2 : 1.8} />
                        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 shadow-xl border border-white/10">
                            {item.label}
                        </div>
                    </button>
                ))}
            </nav>

            <div className="mt-auto">
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