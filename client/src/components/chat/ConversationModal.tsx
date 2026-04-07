import { Search, X, MessageSquarePlus, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import { chatApi } from "../../api/chatApi";
import { useFriendStore } from "../../store/friendStore";
import { useChatStore } from "../../store/chatStore";

type ConversationModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const ConversationModal = ({ isOpen, onClose }: ConversationModalProps) => {
    const { friends, getFriends, loading } = useFriendStore();
    const { upsertConversation, setActiveConversation } = useChatStore();
    const [filter, setFilter] = useState("");
    const [creatingConversationId, setCreatingConversationId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && friends.length === 0) {
            getFriends();
        }
    }, [isOpen, friends.length, getFriends]);

    if (!isOpen) return null;

    const filtered = friends.filter((friend) =>
        friend.username.toLowerCase().includes(filter.toLowerCase()) ||
        friend.email.toLowerCase().includes(filter.toLowerCase())
    );

    const handleSelectFriend = async (friendId: string) => {
        try {
            setCreatingConversationId(friendId);
            const conversation = await chatApi.getOrCreateConversation(friendId);
            upsertConversation(conversation);
            setActiveConversation(conversation._id);
            onClose();
        } catch (error) {
            const apiError = error as AxiosError<{ message: string }>;
            toast.error(apiError.response?.data?.message || "Failed to start conversation");
        } finally {
            setCreatingConversationId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col h-[500px] max-h-[80vh] overflow-hidden animate-slide-up">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>

                <div className="flex items-center justify-between p-5 border-b border-white/[0.06] relative z-10">
                    <div>
                        <h2 className="text-lg font-bold text-white mb-0.5">New Conversation</h2>
                        <p className="text-slate-400 text-xs">Select a friend to start chatting</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" strokeWidth={2} />
                    </button>
                </div>

                <div className="p-4 border-b border-white/[0.06] relative z-10">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" strokeWidth={2} />
                        <input
                            type="text"
                            placeholder="Search friends..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500/40 focus:bg-white/[0.06]"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 scrollbar-thin relative z-10">
                    {loading && friends.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
                                <MessageSquarePlus className="w-5 h-5 text-slate-500" />
                            </div>
                            <p className="text-slate-400 text-sm font-medium mb-1">No friends found</p>
                            <p className="text-slate-500 text-xs">Try a different search term</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filtered.map((friend) => (
                                <button
                                    key={friend._id}
                                    onClick={() => handleSelectFriend(friend._id)}
                                    disabled={creatingConversationId !== null}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-all duration-200 text-left group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
                                        <p className="text-white text-sm font-semibold truncate group-hover:text-indigo-300 transition-colors">
                                            {friend.username}
                                        </p>
                                        <p className="text-slate-500 text-xs truncate">
                                            {friend.is_online ? "Online" : friend.email}
                                        </p>
                                    </div>
                                    {creatingConversationId === friend._id && (
                                        <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConversationModal;
