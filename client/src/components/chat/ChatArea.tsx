import { useEffect, useRef, useState } from "react";
import { Send, Check, CheckCheck, Loader2, ArrowLeft, Users, Info } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useChatStore } from "../../store/chatStore";
import { useSocketStore } from "../../store/socketStore";
import type { ChatUser, Message, MessageStatus } from "../../types/chatTypes";
import ConversationInfoDialog from "./ConversationInfoDialog";

const ChatArea = () => {
    const { user } = useAuthStore();
    const { socket } = useSocketStore();
    const {
        activeConversationId,
        conversations,
        messages,
        messagesPage,
        hasMoreMessages,
        loadingMessages,
        sendingMessage,
        typingUsers,
        sendMessage,
        fetchMessages,
        markConversationAsRead,
        setActiveConversation
    } = useChatStore();

    const [input, setInput] = useState("");
    const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const previousScrollHeightRef = useRef(0);

    const activeConvo = conversations.find((conversation) => conversation._id === activeConversationId);
    const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];
    const isLoading = activeConversationId ? loadingMessages[activeConversationId] : false;
    const hasMore = activeConversationId ? hasMoreMessages[activeConversationId] : false;
    const page = activeConversationId ? messagesPage[activeConversationId] || 1 : 1;
    const activeTypers = activeConversationId ? typingUsers[activeConversationId] || [] : [];
    const canMessage = activeConvo?.can_message !== false;
    const isGroupConversation = Boolean(activeConvo?.is_group);

    useEffect(() => {
        if (!isLoading && page === 1 && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "auto" });
        } else if (!isLoading && page > 1 && messagesContainerRef.current) {
            const currentScrollHeight = messagesContainerRef.current.scrollHeight;
            messagesContainerRef.current.scrollTop = currentScrollHeight - previousScrollHeightRef.current;
        }
    }, [activeMessages.length, isLoading, page]);

    useEffect(() => {
        if (activeConversationId) {
            void markConversationAsRead(activeConversationId);
        }
    }, [activeConversationId, activeMessages.length, markConversationAsRead]);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (canMessage) {
            return;
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }

        if (activeConversationId) {
            socket?.emit("typing:stop", {
                conversationId: activeConversationId
            });
        }
    }, [activeConversationId, canMessage, socket]);

    const handleScroll = () => {
        if (!messagesContainerRef.current || isLoading || !hasMore || !activeConversationId) return;

        if (messagesContainerRef.current.scrollTop === 0) {
            previousScrollHeightRef.current = messagesContainerRef.current.scrollHeight;
            void fetchMessages(activeConversationId, page + 1);
        }
    };

    const getMessageSenderId = (message: Message) => {
        return typeof message.sender_id === "object" && message.sender_id !== null
            ? message.sender_id._id
            : message.sender_id;
    };

    const getMessageSenderName = (message: Message) => {
        if (typeof message.sender_id !== "object" || message.sender_id === null) {
            return "";
        }

        return message.sender_id.username;
    };

    const getSeenUser = (seenUser: ChatUser | string) => {
        return typeof seenUser === "object" && seenUser !== null
            ? seenUser
            : null;
    };

    const getSeenSummary = (message: Message) => {
        const seenUsers = (message.seen_by || [])
            .map((entry) => getSeenUser(entry.user_id))
            .filter((entry): entry is ChatUser => Boolean(entry))
            .filter((entry) => entry._id !== user?.id);

        if (seenUsers.length === 0) {
            return "";
        }

        if (seenUsers.length === 1) {
            return `Seen by ${seenUsers[0].username}`;
        }

        if (seenUsers.length === 2) {
            return `Seen by ${seenUsers[0].username}, ${seenUsers[1].username}`;
        }

        return `Seen by ${seenUsers[0].username}, ${seenUsers[1].username} +${seenUsers.length - 2}`;
    };

    const getTypingLabel = () => {
        if (activeTypers.length === 0) {
            return "";
        }

        if (!isGroupConversation) {
            return `${activeConvo?.friend?.username || "Someone"} is typing...`;
        }

        const typingNames = activeTypers
            .map((userId) => activeConvo?.members?.find((member) => member._id === userId)?.username)
            .filter((name): name is string => Boolean(name));

        if (typingNames.length === 0) {
            return "Typing...";
        }

        if (typingNames.length === 1) {
            return `${typingNames[0]} is typing...`;
        }

        if (typingNames.length === 2) {
            return `${typingNames[0]} and ${typingNames[1]} are typing...`;
        }

        return `${typingNames[0]} and ${typingNames.length - 1} others are typing...`;
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || sendingMessage || !activeConversationId || !canMessage) return;

        const content = input;
        setInput("");

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            socket?.emit("typing:stop", {
                conversationId: activeConversationId
            });
            typingTimeoutRef.current = null;
        }

        await sendMessage(content);

        requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        });
    };

    const handleBack = () => {
        setInput("");
        setIsInfoDialogOpen(false);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }

        if (activeConversationId) {
            socket?.emit("typing:stop", {
                conversationId: activeConversationId
            });
        }

        setActiveConversation(null);
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!canMessage) {
            return;
        }

        setInput(e.target.value);
        if (!activeConversationId) return;

        if (e.target.value.trim() === "") {
            socket?.emit("typing:stop", {
                conversationId: activeConversationId
            });
            return;
        }

        socket?.emit("typing:start", {
            conversationId: activeConversationId
        });

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket?.emit("typing:stop", {
                conversationId: activeConversationId
            });
        }, 2000);
    };

    const renderMessageStatus = (status: MessageStatus) => {
        if (status === "sent") return <Check className="w-3.5 h-3.5 text-slate-400" />;
        if (status === "delivered") return <CheckCheck className="w-3.5 h-3.5 text-slate-400" />;
        if (status === "read") return <CheckCheck className="w-3.5 h-3.5 text-blue-400" />;
        return <Check className="w-3.5 h-3.5 text-slate-500" />;
    };

    const formatMessageTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const formatDateDivider = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return "Today";
        if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
        return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    };

    const formatLastSeen = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return `Last seen today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
        }

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === yesterday.toDateString()) {
            return `Last seen yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
        }

        return `Last seen ${date.toLocaleDateString([], { month: "short", day: "numeric" })} at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    };

    const renderMessagesWithDividers = () => {
        const items: React.ReactNode[] = [];
        let lastDateString = "";

        activeMessages.forEach((message) => {
            const currentDateString = new Date(message.createdAt).toDateString();
            if (currentDateString !== lastDateString) {
                items.push(
                    <div key={`date-${currentDateString}`} className="flex justify-center my-4">
                        <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.05] text-[11px] font-medium text-slate-400">
                            {formatDateDivider(message.createdAt)}
                        </span>
                    </div>
                );
                lastDateString = currentDateString;
            }

            const senderId = getMessageSenderId(message);
            const isMine = senderId === user?.id;
            const seenSummary = isMine && isGroupConversation ? getSeenSummary(message) : "";

            items.push(
                <div key={message._id} className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}>
                    <div
                        className={`max-w-[78%] px-4 py-2 rounded-2xl relative ${
                            isMine
                                ? "bg-indigo-600 text-white rounded-br-sm"
                                : "bg-[#1c2235] border border-white/[0.05] text-slate-100 rounded-bl-sm"
                        }`}
                    >
                        {isGroupConversation && !isMine && (
                            <p className="text-[11px] font-semibold text-cyan-300/80 mb-1">
                                {getMessageSenderName(message)}
                            </p>
                        )}
                        <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">{message.content}</p>
                        <div className={`flex items-center gap-1.5 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
                            <span className={`text-[10px] ${isMine ? "text-indigo-200/80" : "text-slate-500"}`}>
                                {formatMessageTime(message.createdAt)}
                            </span>
                            {!isGroupConversation && isMine && renderMessageStatus(message.status)}
                        </div>
                        {seenSummary && (
                            <p className="mt-1 text-[10px] text-indigo-100/70 text-right">
                                {seenSummary}
                            </p>
                        )}
                    </div>
                </div>
            );
        });

        return items;
    };

    if (!activeConversationId || !activeConvo) {
        return (
            <div className="flex-1 hidden md:flex items-center justify-center bg-[#0a0e1a]"></div>
        );
    }

    const typingLabel = getTypingLabel();
    const conversationTitle = isGroupConversation
        ? activeConvo.group_name || "Group Chat"
        : activeConvo.friend?.username || "Conversation";
    const conversationSubtitle = isGroupConversation
        ? `${activeConvo.member_count || ((activeConvo.members?.length || 0) + 1)} members`
        : activeConvo.friend?.is_online
            ? "Online"
            : activeConvo.friend?.last_seen
                ? formatLastSeen(activeConvo.friend.last_seen)
                : "Offline";

    return (
        <div className="flex-1 flex flex-col bg-[#0a0e1a] h-full overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/[0.02] blur-[120px] rounded-full pointer-events-none"></div>

            <div className="h-[73px] shrink-0 border-b border-white/[0.06] bg-[#0c1020]/80 backdrop-blur-md px-5 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/[0.07] transition-all duration-200 cursor-pointer shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5" strokeWidth={2.2} />
                    </button>
                    <div className="relative">
                        {isGroupConversation ? (
                            activeConvo.group_avatar ? (
                                <img
                                    src={activeConvo.group_avatar}
                                    alt={activeConvo.group_name}
                                    className="w-11 h-11 rounded-full object-cover ring-2 ring-white/10"
                                />
                            ) : (
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-500/80 to-indigo-600/80 flex items-center justify-center ring-2 ring-white/10">
                                    {activeConvo.group_name ? (
                                        <span className="text-white font-semibold">
                                            {activeConvo.group_name.charAt(0).toUpperCase()}
                                        </span>
                                    ) : (
                                        <Users className="w-5 h-5 text-white" strokeWidth={2.2} />
                                    )}
                                </div>
                            )
                        ) : activeConvo.friend?.avatar ? (
                            <img
                                src={activeConvo.friend.avatar}
                                alt={activeConvo.friend.username}
                                className="w-11 h-11 rounded-full object-cover ring-2 ring-white/10"
                            />
                        ) : (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500/80 to-purple-600/80 flex items-center justify-center ring-2 ring-white/10">
                                <span className="text-white font-semibold">
                                    {activeConvo.friend?.username?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        {!isGroupConversation && activeConvo.friend?.is_online && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0c1020] shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-[16px] font-bold text-white">{conversationTitle}</h3>
                        <p className="text-[12px] text-slate-400 font-medium">
                            {!isGroupConversation && activeConvo.friend?.is_online ? (
                                <span className="text-emerald-400">Online</span>
                            ) : (
                                conversationSubtitle
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center">
                    <button
                        type="button"
                        onClick={() => setIsInfoDialogOpen(true)}
                        className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/[0.07] transition-all duration-200 cursor-pointer shrink-0"
                    >
                        <Info className="w-5 h-5" strokeWidth={2.2} />
                    </button>
                </div>
            </div>

            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin z-10"
            >
                {isLoading && page > 1 && (
                    <div className="flex justify-center py-2">
                        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                    </div>
                )}

                {isLoading && page === 1 ? (
                    <div className="flex-1 flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    </div>
                ) : (
                    renderMessagesWithDividers()
                )}

                {activeTypers.length > 0 && (
                    <div className="flex justify-start mb-2">
                        <div className="bg-[#1c2235] border border-white/[0.05] rounded-2xl rounded-bl-sm px-4 py-3">
                            <p className="text-[11px] text-slate-400 mb-1">
                                {typingLabel}
                            </p>
                            <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} className="h-px w-full" />
            </div>

            <div className="p-4 bg-[#0c1020] border-t border-white/[0.06] shrink-0 z-10 relative">
                {canMessage ? (
                    <form
                        onSubmit={handleSend}
                        className="flex flex-col gap-2 relative bg-[#080c14] border border-white/[0.05] rounded-2xl p-2 focus-within:border-indigo-500/40 transition-colors shadow-inner"
                    >
                        <div className="flex items-end gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={handleTyping}
                                placeholder={isGroupConversation ? "Message the group..." : "Type a message..."}
                                className="flex-1 bg-transparent text-white placeholder:text-slate-500 text-[15px] p-2 ml-2 outline-none"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || sendingMessage}
                                className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all ${
                                    input.trim() && !sendingMessage
                                        ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/25 cursor-pointer"
                                        : "bg-white/[0.02] text-slate-500 cursor-not-allowed"
                                }`}
                            >
                                {sendingMessage ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4 ml-0.5" strokeWidth={2.5} />
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="rounded-2xl border border-white/[0.06] bg-[#080c14] px-4 py-3 text-center shadow-inner">
                        <p className="text-sm font-semibold text-white">Can&apos;t message</p>
                        <p className="mt-1 text-xs text-slate-400">
                            Add each other as friends again to continue this chat.
                        </p>
                    </div>
                )}
            </div>

            <ConversationInfoDialog
                open={isInfoDialogOpen}
                conversation={activeConvo}
                currentUser={user}
                onClose={() => setIsInfoDialogOpen(false)}
            />
        </div>
    );
};

export default ChatArea;
