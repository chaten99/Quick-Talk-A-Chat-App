import { Search, UserMinus, MoreVertical } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useFriendStore } from "../../store/friendStore";
import { useAuthStore } from "../../store/authStore";
import { useChatStore } from "../../store/chatStore";
import { chatApi } from "../../api/chatApi";
import { toast } from "react-toastify";
import ConfirmDialog from "../ui/ConfirmDialog";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";

const FriendsList = () => {
    const { friends, loading, getFriends, loadMoreFriends, friendsHasMore, removeFriend } = useFriendStore();
    const { user } = useAuthStore();
    const { upsertConversation, setActiveConversation } = useChatStore();
    const navigate = useNavigate();
    const [filter, setFilter] = useState("");
    const [confirmTarget, setConfirmTarget] = useState<{ id: string; name: string } | null>(null);
    const [openingFriendId, setOpeningFriendId] = useState<string | null>(null);
    const [actionMenuFriendId, setActionMenuFriendId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getFriends();
    }, [getFriends]);

    const filtered = friends.filter((f) =>
        f.username.toLowerCase().includes(filter.toLowerCase()) ||
        f.email.toLowerCase().includes(filter.toLowerCase())
    );

    const handleRemove = async () => {
        if (!confirmTarget) return;
        const res = await removeFriend(confirmTarget.id);
        if (res.success) {
            toast.success(`Removed ${confirmTarget.name} from friends`);
        } else {
            toast.error(res.message);
        }
        setConfirmTarget(null);
    };

    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
            loadMoreFriends();
        }
    }, [loadMoreFriends]);

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            el.addEventListener("scroll", handleScroll);
            return () => el.removeEventListener("scroll", handleScroll);
        }
    }, [handleScroll]);

    useEffect(() => {
        if (!actionMenuFriendId) return;

        const handleWindowClick = () => setActionMenuFriendId(null);

        window.addEventListener("click", handleWindowClick);
        return () => window.removeEventListener("click", handleWindowClick);
    }, [actionMenuFriendId]);

    const handleOpenConversation = async (friendId: string) => {
        try {
            setOpeningFriendId(friendId);
            setActionMenuFriendId(null);
            const conversation = await chatApi.getOrCreateConversation(friendId);
            upsertConversation(conversation);
            setActiveConversation(conversation._id);
            navigate("/");
        } catch (error) {
            const apiError = error as AxiosError<{ message: string }>;
            toast.error(apiError.response?.data?.message || "Failed to open conversation");
        } finally {
            setOpeningFriendId(null);
        }
    };

    return (
        <div className="w-full md:w-[380px] h-full bg-[#0c1020] border-r border-white/[0.06] flex flex-col shrink-0">
            <div className="px-5 pt-6 pb-4">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-white tracking-tight">Friends</h2>
                    <div className="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-400 text-xs font-semibold">
                        {friends.length}
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" strokeWidth={2} />
                    <input
                        type="text"
                        placeholder="Filter friends..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500/40 focus:bg-white/[0.06]"
                    />
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-2.5 scrollbar-thin">
                {loading && friends.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                            <svg className="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                            </svg>
                        </div>
                        <p className="text-slate-400 text-sm font-medium mb-1">
                            {filter ? "No friends match your filter" : "No friends yet"}
                        </p>
                        <p className="text-slate-600 text-xs">
                            {filter ? "Try a different search term" : "Add friends to start chatting"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1 pb-2">
                        {filtered.map((friend) => (
                            <div
                                key={friend._id}
                                onClick={() => handleOpenConversation(friend._id)}
                                className="relative flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.04] transition-all duration-200 group cursor-pointer"
                            >
                                <div className="relative">
                                    {friend.avatar ? (
                                        <img
                                            src={friend.avatar}
                                            alt={friend.username}
                                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-white/10">
                                            <span className="text-white font-semibold text-sm">
                                                {friend.username.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0c1020] ${
                                        friend.is_online
                                            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                                            : "bg-slate-600"
                                    }`}></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-semibold truncate">{friend.username}</p>
                                    <p className="text-slate-500 text-xs truncate">
                                        {friend.is_online ? "Online" : friend.email}
                                    </p>
                                </div>
                                {openingFriendId === friend._id && (
                                    <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin shrink-0"></div>
                                )}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActionMenuFriendId((currentId) => currentId === friend._id ? null : friend._id);
                                    }}
                                    className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200 cursor-pointer shrink-0"
                                >
                                    <MoreVertical className="w-4 h-4" strokeWidth={2} />
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActionMenuFriendId(null);
                                        setConfirmTarget({ id: friend._id, name: friend.username });
                                    }}
                                    className="hidden md:flex w-8 h-8 rounded-lg items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
                                >
                                    <UserMinus className="w-4 h-4" strokeWidth={1.8} />
                                </button>
                                {actionMenuFriendId === friend._id && (
                                    <div
                                        onClick={(e) => e.stopPropagation()}
                                        className="md:hidden absolute right-3 top-[52px] z-20 min-w-[152px] rounded-2xl border border-white/[0.08] bg-[#11172a] p-1.5 shadow-[0_18px_40px_rgba(2,8,23,0.45)]"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActionMenuFriendId(null);
                                                setConfirmTarget({ id: friend._id, name: friend.username });
                                            }}
                                            className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-300 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
                                        >
                                            <UserMinus className="w-4 h-4" strokeWidth={1.8} />
                                            Remove Friend
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-center py-4">
                                <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                            </div>
                        )}
                        {!friendsHasMore && friends.length > 0 && !filter && (
                            <div className="text-center py-4">
                                <p className="text-slate-600 text-xs">All friends loaded</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="px-4 py-4 border-t border-white/[0.06] hidden md:block">
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

            <ConfirmDialog
                open={!!confirmTarget}
                title="Remove Friend"
                message={`Are you sure you want to remove ${confirmTarget?.name || ""} from your friends? This action cannot be undone.`}
                confirmLabel="Remove"
                cancelLabel="Cancel"
                onConfirm={handleRemove}
                onCancel={() => setConfirmTarget(null)}
                variant="danger"
            />
        </div>
    );
};

export default FriendsList;
