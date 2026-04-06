import { useEffect, useRef, useCallback, useState } from "react";
import { useNotificationStore } from "../../store/notificationStore";
import { useFriendStore } from "../../store/friendStore";
import { useAuthStore } from "../../store/authStore";
import { CheckCheck, UserCheck, UserX, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const NotificationList = () => {
    const { notifications, loading, hasMore, fetchNotifications, loadMore, markAsRead, markAllAsRead, clearAll, unreadCount } = useNotificationStore();
    const { acceptRequest, rejectRequest } = useFriendStore();
    const { user } = useAuthStore();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [actedRequestIds, setActedRequestIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
            loadMore();
        }
    }, [loadMore]);

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            el.addEventListener("scroll", handleScroll);
            return () => el.removeEventListener("scroll", handleScroll);
        }
    }, [handleScroll]);

    const handleAccept = async (requestId: string) => {
        const res = await acceptRequest(requestId);
        if (res.success) {
            toast.success("Friend request accepted");
            setActedRequestIds((prev) => new Set(prev).add(requestId));
        } else {
            toast.error(res.message);
        }
    };

    const handleReject = async (requestId: string) => {
        const res = await rejectRequest(requestId);
        if (res.success) {
            toast.success("Friend request rejected");
            setActedRequestIds((prev) => new Set(prev).add(requestId));
        } else {
            toast.error(res.message);
        }
    };

    const handleClearAll = async () => {
        await clearAll();
        toast.success("All notifications cleared");
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    return (
        <div className="w-[380px] h-screen bg-[#0c1020] border-r border-white/[0.06] flex flex-col shrink-0">
            <div className="px-5 pt-6 pb-4">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-white tracking-tight">Notifications</h2>
                    <div className="flex items-center gap-1.5">
                        {notifications.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors duration-200 cursor-pointer"
                            >
                                <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                                Clear
                            </button>
                        )}
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-400 text-xs font-semibold hover:bg-indigo-500/25 transition-colors duration-200 cursor-pointer"
                            >
                                <CheckCheck className="w-3.5 h-3.5" strokeWidth={2} />
                                Read all
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-2.5 scrollbar-thin">
                {loading && notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                            <svg className="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                            </svg>
                        </div>
                        <p className="text-slate-400 text-sm font-medium mb-1">No notifications</p>
                        <p className="text-slate-600 text-xs">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="space-y-1 pb-2">
                        {notifications.map((notification) => {
                            const showActions = notification.type === "friend_request"
                                && notification.reference_id
                                && !notification.is_read
                                && !actedRequestIds.has(notification.reference_id);

                            return (
                                <div
                                    key={notification._id}
                                    onClick={() => !notification.is_read && markAsRead(notification._id)}
                                    className={`flex items-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                                        notification.is_read ? "hover:bg-white/[0.02]" : "bg-indigo-500/[0.06] hover:bg-indigo-500/[0.1]"
                                    }`}
                                >
                                    {notification.from_user?.avatar ? (
                                        <img
                                            src={notification.from_user.avatar}
                                            alt={notification.from_user.username}
                                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10 shrink-0 mt-0.5"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-white/10 shrink-0 mt-0.5">
                                            <span className="text-white font-semibold text-sm">
                                                {notification.from_user?.username?.charAt(0).toUpperCase() || "?"}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm leading-snug ${notification.is_read ? "text-slate-400" : "text-white"}`}>
                                            {notification.content}
                                        </p>
                                        <p className="text-slate-600 text-xs mt-1">{timeAgo(notification.createdAt)}</p>
                                        {showActions && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAccept(notification.reference_id!);
                                                        markAsRead(notification._id);
                                                    }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-semibold hover:bg-indigo-500/30 transition-colors duration-200 cursor-pointer"
                                                >
                                                    <UserCheck className="w-3.5 h-3.5" strokeWidth={2} />
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleReject(notification.reference_id!);
                                                        markAsRead(notification._id);
                                                    }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] text-slate-400 text-xs font-semibold hover:bg-red-500/15 hover:text-red-400 transition-colors duration-200 cursor-pointer"
                                                >
                                                    <UserX className="w-3.5 h-3.5" strokeWidth={2} />
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {!notification.is_read && (
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-2"></div>
                                    )}
                                </div>
                            );
                        })}
                        {loading && (
                            <div className="flex justify-center py-4">
                                <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                )}
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

export default NotificationList;
