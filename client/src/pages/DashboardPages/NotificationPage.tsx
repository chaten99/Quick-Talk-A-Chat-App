import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useNotificationStore } from "../../store/notificationStore";
import { useFriendStore } from "../../store/friendStore";
import { useEffect, useRef, useCallback, useState } from "react";
import { UserCheck, UserX } from "lucide-react";
import { toast } from "react-toastify";

const NotificationPage = () => {
    const { notifications, loading, hasMore, fetchNotifications, loadMore, markAsRead, markAllAsRead, clearAll, unreadCount } = useNotificationStore();
    const { acceptRequest, rejectRequest } = useFriendStore();
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

    const handleAccept = async (requestId: string, notificationId: string) => {
        const res = await acceptRequest(requestId);
        if (res.success) {
            toast.success("Friend request accepted");
            markAsRead(notificationId);
            setActedRequestIds((prev) => new Set(prev).add(requestId));
        } else {
            toast.error(res.message);
        }
    };

    const handleReject = async (requestId: string, notificationId: string) => {
        const res = await rejectRequest(requestId);
        if (res.success) {
            toast.success("Friend request rejected");
            markAsRead(notificationId);
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
        <div className="flex-1 flex flex-col bg-[#0a0e1a] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-indigo-600/[0.04] blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-purple-600/[0.03] blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col h-full">
                <div className="px-8 pt-8 pb-6 border-b border-white/[0.06] flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Notifications</h1>
                        <p className="text-slate-500 text-sm">
                            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up"}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {notifications.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-colors duration-200 cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" strokeWidth={2} />
                                Clear all
                            </button>
                        )}
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 text-sm font-semibold hover:bg-indigo-500/25 transition-colors duration-200 cursor-pointer"
                            >
                                <CheckCheck className="w-4 h-4" strokeWidth={2} />
                                Mark all read
                            </button>
                        )}
                    </div>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin">
                    {loading && notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="relative w-32 h-32 mb-8">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-indigo-500/15 blur-xl"></div>
                                <div className="relative w-full h-full rounded-full border border-white/[0.06] bg-[#0c1020] flex items-center justify-center">
                                    <Bell className="w-12 h-12 text-indigo-300/60" strokeWidth={1.2} />
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm font-medium mb-1">No notifications yet</p>
                            <p className="text-slate-600 text-xs">When you get notifications, they'll show up here</p>
                        </div>
                    ) : (
                        <div className="max-w-2xl space-y-2">
                            {notifications.map((notification) => {
                                const showActions = notification.type === "friend_request"
                                    && notification.reference_id
                                    && !notification.is_read
                                    && !actedRequestIds.has(notification.reference_id);

                                return (
                                    <div
                                        key={notification._id}
                                        onClick={() => !notification.is_read && markAsRead(notification._id)}
                                        className={`flex items-start gap-4 px-5 py-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                                            notification.is_read
                                                ? "bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.03]"
                                                : "bg-indigo-500/[0.06] border-indigo-500/[0.12] hover:bg-indigo-500/[0.1]"
                                        }`}
                                    >
                                        {notification.from_user?.avatar ? (
                                            <img
                                                src={notification.from_user.avatar}
                                                alt={notification.from_user.username}
                                                className="w-11 h-11 rounded-full object-cover ring-2 ring-white/10 shrink-0"
                                            />
                                        ) : (
                                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-white/10 shrink-0">
                                                <span className="text-white font-semibold text-sm">
                                                    {notification.from_user?.username?.charAt(0).toUpperCase() || "?"}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm leading-relaxed ${notification.is_read ? "text-slate-400" : "text-white"}`}>
                                                {notification.content}
                                            </p>
                                            <p className="text-slate-600 text-xs mt-1.5">{timeAgo(notification.createdAt)}</p>

                                            {showActions && (
                                                <div className="flex items-center gap-2 mt-3">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAccept(notification.reference_id!, notification._id);
                                                        }}
                                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-semibold hover:bg-indigo-500/30 transition-colors duration-200 cursor-pointer"
                                                    >
                                                        <UserCheck className="w-3.5 h-3.5" strokeWidth={2} />
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleReject(notification.reference_id!, notification._id);
                                                        }}
                                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.05] text-slate-400 text-xs font-semibold hover:bg-red-500/15 hover:text-red-400 transition-colors duration-200 cursor-pointer"
                                                    >
                                                        <UserX className="w-3.5 h-3.5" strokeWidth={2} />
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {!notification.is_read && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 mt-1.5 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                                        )}
                                    </div>
                                );
                            })}
                            {loading && (
                                <div className="flex justify-center py-6">
                                    <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                                </div>
                            )}
                            {!hasMore && notifications.length > 0 && (
                                <div className="text-center py-6">
                                    <p className="text-slate-600 text-xs">You've seen all notifications</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationPage;
