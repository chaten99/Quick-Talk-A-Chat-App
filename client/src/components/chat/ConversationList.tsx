import { Search, SquarePen, Users, Check, CheckCheck } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useChatStore } from "../../store/chatStore";
import { useState, useEffect, useRef } from "react";
import ConversationModal from "./ConversationModal";
import type { Conversation, Message, MessageStatus } from "../../types/chatTypes";

const ConversationList = () => {
    const { user } = useAuthStore();
    const {
        conversations,
        fetchConversations,
        hasMoreConversations,
        loadingConversations,
        activeConversationId,
        setActiveConversation
    } = useChatStore();

    const [isNewConvoOpen, setIsNewConvoOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"direct" | "group">("direct");
    const [filter, setFilter] = useState("");
    const listRef = useRef<HTMLDivElement>(null);
    const hasRequestedInitialConversationsRef = useRef(false);

    useEffect(() => {
        if (!hasRequestedInitialConversationsRef.current) {
            hasRequestedInitialConversationsRef.current = true;
            void fetchConversations(1);
        }
    }, [fetchConversations]);

    const handleScroll = () => {
        if (!listRef.current || loadingConversations || !hasMoreConversations) return;

        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            const nextPage = useChatStore.getState().conversationsPage + 1;
            void fetchConversations(nextPage);
        }
    };

    const openConversationModal = (mode: "direct" | "group") => {
        setModalMode(mode);
        setIsNewConvoOpen(true);
    };

    const filteredConversations = conversations.filter((conversation: Conversation) =>
        (conversation.friend?.username || "").toLowerCase().includes(filter.toLowerCase()) ||
        (conversation.group_name || "").toLowerCase().includes(filter.toLowerCase())
    );

    const formatTime = (dateString?: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const getMessageSenderId = (message?: Message) => {
        if (!message) return "";

        return typeof message.sender_id === "object" && message.sender_id !== null
            ? message.sender_id._id
            : message.sender_id;
    };

    const getMessageSenderName = (message?: Message) => {
        if (!message || typeof message.sender_id !== "object" || message.sender_id === null) {
            return "";
        }

        return message.sender_id.username;
    };

    const getConversationTitle = (conversation: Conversation) => {
        return conversation.is_group
            ? conversation.group_name || "New Group"
            : conversation.friend?.username || "Conversation";
    };

    const getConversationPreview = (conversation: Conversation, isLastMine: boolean) => {
        if (!conversation.last_message?.content) {
            return conversation.is_group ? "Start the group conversation" : "Say hi!";
        }

        if (!conversation.is_group) {
            return conversation.last_message.content;
        }

        const senderName = isLastMine ? "You" : getMessageSenderName(conversation.last_message);

        if (!senderName) {
            return conversation.last_message.content;
        }

        return `${senderName}: ${conversation.last_message.content}`;
    };

    const renderMessageStatus = (conversation: Conversation, status: MessageStatus | undefined, isMine: boolean) => {
        if (conversation.is_group || !isMine || !status) return null;
        if (status === "sent") return <Check className="w-3.5 h-3.5 text-slate-500" />;
        if (status === "delivered") return <CheckCheck className="w-3.5 h-3.5 text-slate-500" />;
        if (status === "read") return <CheckCheck className="w-3.5 h-3.5 text-blue-400" />;
        return null;
    };

    return (
        <div className="w-full md:w-[380px] h-full bg-[#0c1020] border-r border-white/[0.06] flex flex-col shrink-0">
            <div className="px-5 pt-6 pb-4">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-white tracking-tight">Messages</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => openConversationModal("direct")}
                            className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center hover:bg-indigo-500/20 transition-colors cursor-pointer"
                        >
                            <SquarePen className="w-[18px] h-[18px]" strokeWidth={2} />
                        </button>
                        <button
                            onClick={() => openConversationModal("group")}
                            className="w-9 h-9 rounded-xl bg-white/[0.05] text-slate-300 flex items-center justify-center hover:bg-white/[0.08] transition-colors cursor-pointer"
                        >
                            <Users className="w-[18px] h-[18px]" strokeWidth={2} />
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" strokeWidth={2} />
                    <input
                        type="text"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Search conversations..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080c14] border border-white/[0.06] text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-indigo-500/40 focus:bg-white/[0.04]"
                    />
                </div>
            </div>

            <div
                ref={listRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-thin"
            >
                {conversations.length === 0 && !loadingConversations ? (
                    <div className="flex flex-col items-center justify-center h-[320px] text-center px-6">
                        <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mb-4">
                            <Users className="w-6 h-6 text-slate-600" />
                        </div>
                        <p className="text-slate-400 font-medium mb-1.5">No conversations yet</p>
                        <p className="text-slate-500 text-sm mb-6">Start a direct chat or create a group</p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => openConversationModal("direct")}
                                className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20 cursor-pointer"
                            >
                                New Message
                            </button>
                            <button
                                onClick={() => openConversationModal("group")}
                                className="px-5 py-2.5 rounded-xl bg-white/[0.05] text-white text-sm font-semibold hover:bg-white/[0.08] border border-white/[0.08] transition-colors cursor-pointer"
                            >
                                New Group
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {filteredConversations.map((conversation: Conversation) => {
                            const isSelected = activeConversationId === conversation._id;
                            const isLastMine = getMessageSenderId(conversation.last_message) === user?.id;
                            const preview = getConversationPreview(conversation, isLastMine);

                            return (
                                <button
                                    key={conversation._id}
                                    onClick={() => setActiveConversation(conversation._id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left cursor-pointer group ${
                                        isSelected
                                            ? "bg-indigo-500/10 border border-indigo-500/20"
                                            : "hover:bg-white/[0.04] border border-transparent"
                                    }`}
                                >
                                    <div className="relative shrink-0">
                                        {conversation.is_group ? (
                                            conversation.group_avatar ? (
                                                <img
                                                    src={conversation.group_avatar}
                                                    alt={conversation.group_name}
                                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/80 to-indigo-600/80 flex items-center justify-center ring-2 ring-white/10">
                                                    <span className="text-white font-semibold text-lg">
                                                        {(conversation.group_name || "G").charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )
                                        ) : conversation.friend?.avatar ? (
                                            <img
                                                src={conversation.friend.avatar}
                                                alt={conversation.friend.username}
                                                className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/80 to-purple-600/80 flex items-center justify-center ring-2 ring-white/10">
                                                <span className="text-white font-semibold text-lg">
                                                    {conversation.friend?.username?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        {!conversation.is_group && conversation.friend?.is_online && (
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0c1020] shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className={`text-sm font-semibold truncate ${isSelected ? "text-indigo-300" : "text-white"}`}>
                                                {getConversationTitle(conversation)}
                                            </p>
                                            <span className="text-[11px] text-slate-500 shrink-0">
                                                {formatTime(conversation.last_message?.createdAt || conversation.updatedAt)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {renderMessageStatus(conversation, conversation.last_message?.status, !!isLastMine)}
                                            <p className={`text-xs truncate ${conversation.unread_count > 0 ? "text-white font-medium" : "text-slate-400"}`}>
                                                {preview}
                                            </p>
                                        </div>
                                    </div>

                                    {conversation.unread_count > 0 && (
                                        <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
                                            <span className="text-[10px] font-bold text-white">
                                                {conversation.unread_count > 99 ? "99+" : conversation.unread_count}
                                            </span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                        {loadingConversations && (
                            <div className="flex justify-center p-4">
                                <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="px-4 py-4 border-t border-white/[0.06] hidden md:block shrink-0 bg-[#0c1020] relative z-10">
                <div className="flex items-center gap-3 px-2">
                    {user?.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.username || "User"}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-white/10">
                            <span className="text-white font-semibold text-sm">
                                {user?.username?.charAt(0).toUpperCase() || "U"}
                            </span>
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{user?.username || "User"}</p>
                        <p className="text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Online
                        </p>
                    </div>
                </div>
            </div>

            <ConversationModal
                isOpen={isNewConvoOpen}
                onClose={() => setIsNewConvoOpen(false)}
                defaultMode={modalMode}
            />
        </div>
    );
};

export default ConversationList;
