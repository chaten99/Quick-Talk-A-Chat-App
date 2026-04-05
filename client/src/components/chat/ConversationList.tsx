import { Search, SquarePen } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

const ConversationList = () => {
    const { user } = useAuthStore();

    return (
        <div className="w-[380px] h-screen bg-[#0c1020] border-r border-white/[0.06] flex flex-col shrink-0">
            <div className="px-5 pt-6 pb-4">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-white tracking-tight">Messages</h2>
                    <button className="w-9 h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400 hover:bg-indigo-500/25 transition-colors duration-200 cursor-pointer">
                        <SquarePen className="w-[18px] h-[18px]" strokeWidth={2} />
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" strokeWidth={2} />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500/40 focus:bg-white/[0.06]"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2.5 scrollbar-thin">
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                        <svg className="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <p className="text-slate-400 text-sm font-medium mb-1">No conversations yet</p>
                    <p className="text-slate-600 text-xs">Start a new conversation to begin chatting</p>
                </div>
            </div>

            <div className="px-4 py-4 border-t border-white/[0.06]">
                <div className="flex items-center gap-3 px-2">
                    {user?.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.username || "User"}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-white/10"
                        />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-white/10">
                            <span className="text-white font-semibold text-sm">
                                {user?.username?.charAt(0).toUpperCase() || "U"}
                            </span>
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{user?.username || "User"}</p>
                        <p className="text-slate-500 text-xs truncate">{user?.email || ""}</p>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                </div>
            </div>
        </div>
    );
};

export default ConversationList;
