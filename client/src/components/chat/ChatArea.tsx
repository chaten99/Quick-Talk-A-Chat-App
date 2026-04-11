import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
    type FormEvent,
    type KeyboardEvent,
    type ReactNode
} from "react";
import {
    ArrowLeft,
    Check,
    CheckCheck,
    FileText,
    Info,
    Loader2,
    MoreHorizontal,
    Paperclip,
    Pencil,
    Send,
    SmilePlus,
    Trash2,
    Users,
    X
} from "lucide-react";
import EmojiPicker, { EmojiStyle, Theme, type EmojiClickData } from "emoji-picker-react";
import { useAuthStore } from "../../store/authStore";
import { useChatStore } from "../../store/chatStore";
import { useSocketStore } from "../../store/socketStore";
import type { ChatUser, Message, MessageAttachment, MessageStatus } from "../../types/chatTypes";
import ConversationInfoDialog from "./ConversationInfoDialog";
import ConfirmDialog from "../ui/ConfirmDialog";

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

const getSelectedFileKind = (file: File) => {
    if (file.type.startsWith("image/")) {
        return "image";
    }

    if (file.type.startsWith("video/")) {
        return "video";
    }

    return "pdf";
};

const formatFileSize = (size: number) => {
    if (size < 1024 * 1024) {
        return `${Math.max(1, Math.round(size / 1024))} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const getMessageAttachmentUrl = (attachment: MessageAttachment) => {
    if (attachment.kind === "pdf" && attachment.url.includes("/image/upload/")) {
        return attachment.url.replace("/image/upload/", "/raw/upload/");
    }

    return attachment.url;
};

const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDateDivider = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return "Today";
    }

    if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    }

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

const renderMessageStatus = (status: MessageStatus) => {
    if (status === "sent") {
        return <Check className="w-3.5 h-3.5 text-slate-400" />;
    }

    if (status === "delivered") {
        return <CheckCheck className="w-3.5 h-3.5 text-slate-400" />;
    }

    if (status === "read") {
        return <CheckCheck className="w-3.5 h-3.5 text-blue-400" />;
    }

    return <Check className="w-3.5 h-3.5 text-slate-500" />;
};

type AttachmentPreviewProps = {
    attachment: MessageAttachment;
    isMine: boolean;
};

const MessageAttachmentPreview = ({ attachment, isMine }: AttachmentPreviewProps) => {
    const attachmentUrl = getMessageAttachmentUrl(attachment);
    const sharedCardClasses = isMine
        ? "border-white/15 bg-white/10"
        : "border-white/[0.06] bg-[#12192b]";
    const metaTextClasses = isMine ? "text-indigo-100/80" : "text-slate-400";

    if (attachment.kind === "image") {
        return (
            <a
                href={attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-2xl border border-white/10 bg-black/20"
            >
                <img
                    src={attachmentUrl}
                    alt={attachment.file_name}
                    className="max-h-[320px] w-full object-cover"
                />
            </a>
        );
    }

    if (attachment.kind === "video") {
        return (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                <video
                    controls
                    preload="metadata"
                    src={attachmentUrl}
                    className="max-h-[320px] w-full"
                />
            </div>
        );
    }

    return (
        <a
            href={attachmentUrl}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all duration-200 hover:border-red-400/40 hover:bg-white/[0.08] ${sharedCardClasses}`}
        >
            <div className="w-11 h-11 rounded-2xl bg-red-500/10 text-red-300 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{attachment.file_name}</p>
                <p className={`mt-0.5 text-xs ${metaTextClasses}`}>
                    PDF - {formatFileSize(attachment.size)}
                </p>
            </div>
        </a>
    );
};

type SelectedAttachmentPreviewProps = {
    file: File;
    previewUrl: string;
    onRemove: () => void;
};

const SelectedAttachmentPreview = ({ file, previewUrl, onRemove }: SelectedAttachmentPreviewProps) => {
    const kind = getSelectedFileKind(file);

    return (
        <div className="rounded-[24px] border border-white/[0.06] bg-[#0a0f1d] p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{file.name}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                        {kind === "image" ? "Photo" : kind === "video" ? "Video" : "PDF"} - {formatFileSize(file.size)}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onRemove}
                    className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all duration-200 cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {kind === "image" && (
                <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-black/20">
                    <img
                        src={previewUrl}
                        alt={file.name}
                        className="max-h-[240px] w-full object-cover"
                    />
                </div>
            )}

            {kind === "video" && (
                <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-black/30">
                    <video
                        controls
                        preload="metadata"
                        src={previewUrl}
                        className="max-h-[240px] w-full"
                    />
                </div>
            )}

            {kind === "pdf" && (
                <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#11172a] px-3 py-3">
                    <div className="w-11 h-11 rounded-2xl bg-red-500/10 text-red-300 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{file.name}</p>
                        <p className="mt-0.5 text-xs text-slate-400">Ready to send as PDF</p>
                    </div>
                </div>
            )}
        </div>
    );
};

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
        editMessage,
        deleteMessage,
        fetchMessages,
        markConversationAsRead,
        setActiveConversation
    } = useChatStore();

    const [input, setInput] = useState("");
    const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedFilePreviewUrl, setSelectedFilePreviewUrl] = useState("");
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [openActionMenuMessageId, setOpenActionMenuMessageId] = useState<string | null>(null);
    const [deleteDialogMessage, setDeleteDialogMessage] = useState<Message | null>(null);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [isDeletingMessage, setIsDeletingMessage] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const composerRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const previousScrollHeightRef = useRef(0);

    const activeConvo = conversations.find((conversation) => conversation._id === activeConversationId);
    const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];
    const editingMessage = useMemo(
        () => activeMessages.find((message) => message._id === editingMessageId) || null,
        [activeMessages, editingMessageId]
    );
    const isLoading = activeConversationId ? loadingMessages[activeConversationId] : false;
    const hasMore = activeConversationId ? hasMoreMessages[activeConversationId] : false;
    const page = activeConversationId ? messagesPage[activeConversationId] || 1 : 1;
    const activeTypers = activeConversationId ? typingUsers[activeConversationId] || [] : [];
    const canMessage = activeConvo?.can_message !== false;
    const isGroupConversation = Boolean(activeConvo?.is_group);
    const canSubmitEdit = Boolean(editingMessage?.message_type === "file" || input.trim());
    const canSubmitNewMessage = Boolean(input.trim() || selectedFile);

    useEffect(() => {
        if (!selectedFile) {
            setSelectedFilePreviewUrl("");
            return;
        }

        const objectUrl = URL.createObjectURL(selectedFile);
        setSelectedFilePreviewUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [selectedFile]);

    useEffect(() => {
        const composer = composerRef.current;

        if (!composer) {
            return;
        }

        composer.style.height = "0px";
        composer.style.height = `${Math.min(composer.scrollHeight, 160)}px`;
    }, [input]);

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

    useEffect(() => {
        setInput("");
        setSelectedFile(null);
        setEditingMessageId(null);
        setOpenActionMenuMessageId(null);
        setIsEmojiPickerOpen(false);
        setDeleteDialogMessage(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, [activeConversationId]);

    useEffect(() => {
        if (!editingMessageId) {
            return;
        }

        if (!editingMessage) {
            setEditingMessageId(null);
            setInput("");
        }
    }, [editingMessage, editingMessageId]);

    useEffect(() => {
        if (!openActionMenuMessageId) {
            return;
        }

        const handleWindowClick = () => setOpenActionMenuMessageId(null);

        window.addEventListener("click", handleWindowClick);
        return () => window.removeEventListener("click", handleWindowClick);
    }, [openActionMenuMessageId]);

    useEffect(() => {
        if (!isEmojiPickerOpen) {
            return;
        }

        const handlePointerDown = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setIsEmojiPickerOpen(false);
            }
        };

        window.addEventListener("mousedown", handlePointerDown);
        return () => window.removeEventListener("mousedown", handlePointerDown);
    }, [isEmojiPickerOpen]);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const stopTyping = () => {
        if (!activeConversationId) {
            return;
        }

        socket?.emit("typing:stop", {
            conversationId: activeConversationId
        });

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
    };

    const focusComposer = () => {
        requestAnimationFrame(() => {
            composerRef.current?.focus();
        });
    };

    const clearSelectedFile = () => {
        setSelectedFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleScroll = () => {
        if (!messagesContainerRef.current || isLoading || !hasMore || !activeConversationId) {
            return;
        }

        if (messagesContainerRef.current.scrollTop === 0) {
            previousScrollHeightRef.current = messagesContainerRef.current.scrollHeight;
            void fetchMessages(activeConversationId, page + 1);
        }
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

    const handleSend = async () => {
        if (sendingMessage || !activeConversationId || !canMessage) {
            return;
        }

        if (editingMessageId) {
            if (!editingMessage || !canSubmitEdit) {
                return;
            }

            try {
                setIsSavingEdit(true);
                await editMessage(editingMessageId, input);
                stopTyping();
                setInput("");
                setEditingMessageId(null);
                setOpenActionMenuMessageId(null);
            } finally {
                setIsSavingEdit(false);
            }

            return;
        }

        if (!canSubmitNewMessage) {
            return;
        }

        stopTyping();

        const message = await sendMessage({
            content: input,
            file: selectedFile
        });

        if (message) {
            setInput("");
            clearSelectedFile();
            setIsEmojiPickerOpen(false);

            requestAnimationFrame(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            });
        }
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        void handleSend();
    };

    const handleBack = () => {
        setInput("");
        setIsInfoDialogOpen(false);
        setEditingMessageId(null);
        setOpenActionMenuMessageId(null);
        setIsEmojiPickerOpen(false);
        setDeleteDialogMessage(null);
        clearSelectedFile();
        stopTyping();
        setActiveConversation(null);
    };

    const handleTyping = (event: ChangeEvent<HTMLTextAreaElement>) => {
        if (!canMessage) {
            return;
        }

        const nextValue = event.target.value;
        setInput(nextValue);

        if (!activeConversationId) {
            return;
        }

        if (nextValue.trim() === "") {
            stopTyping();
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

    const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void handleSend();
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        const composer = composerRef.current;

        if (!composer) {
            setInput((currentValue) => `${currentValue}${emoji}`);
            return;
        }

        const start = composer.selectionStart ?? input.length;
        const end = composer.selectionEnd ?? input.length;
        const nextValue = `${input.slice(0, start)}${emoji}${input.slice(end)}`;
        const nextCursorPosition = start + emoji.length;

        setInput(nextValue);

        if (activeConversationId && nextValue.trim()) {
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
        }

        requestAnimationFrame(() => {
            composer.focus();
            composer.setSelectionRange(nextCursorPosition, nextCursorPosition);
        });
    };

    const handleFileButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const nextFile = event.target.files?.[0];

        if (!nextFile) {
            return;
        }

        setSelectedFile(nextFile);
        setIsEmojiPickerOpen(false);
    };

    const handleStartEditing = (message: Message) => {
        setEditingMessageId(message._id);
        setInput(message.content || "");
        clearSelectedFile();
        setOpenActionMenuMessageId(null);
        setIsEmojiPickerOpen(false);
        focusComposer();
    };

    const handleCancelEditing = () => {
        setEditingMessageId(null);
        setInput("");
        focusComposer();
    };

    const handleDeleteConfirmation = async () => {
        if (!deleteDialogMessage) {
            return;
        }

        try {
            setIsDeletingMessage(true);
            await deleteMessage(deleteDialogMessage._id);

            if (editingMessageId === deleteDialogMessage._id) {
                setEditingMessageId(null);
                setInput("");
            }

            setDeleteDialogMessage(null);
            setOpenActionMenuMessageId(null);
        } finally {
            setIsDeletingMessage(false);
        }
    };

    const renderMessagesWithDividers = () => {
        const items: ReactNode[] = [];
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
                    {isMine && (
                        <div className="relative mr-2 self-start">
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setOpenActionMenuMessageId((currentId) => currentId === message._id ? null : message._id);
                                }}
                                className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all duration-200 cursor-pointer"
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {openActionMenuMessageId === message._id && (
                                <div
                                    onClick={(event) => event.stopPropagation()}
                                    className="absolute right-0 top-10 z-20 min-w-[152px] rounded-2xl border border-white/[0.08] bg-[#11172a] p-1.5 shadow-[0_18px_40px_rgba(2,8,23,0.45)]"
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleStartEditing(message)}
                                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-200 hover:bg-white/[0.06] transition-all duration-200 cursor-pointer"
                                    >
                                        <Pencil className="w-4 h-4" />
                                        {message.attachment ? "Edit caption" : "Edit message"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDeleteDialogMessage(message);
                                            setOpenActionMenuMessageId(null);
                                        }}
                                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-300 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete message
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div
                        className={`max-w-[min(78%,440px)] px-4 py-3 rounded-[24px] relative ${
                            isMine
                                ? "bg-indigo-600 text-white rounded-br-sm"
                                : "bg-[#1c2235] border border-white/[0.05] text-slate-100 rounded-bl-sm"
                        }`}
                    >
                        {isGroupConversation && !isMine && (
                            <p className="text-[11px] font-semibold text-cyan-300/80 mb-2">
                                {getMessageSenderName(message)}
                            </p>
                        )}

                        {message.attachment && (
                            <div className={`${message.content?.trim() ? "mb-3" : "mb-1"}`}>
                                <MessageAttachmentPreview attachment={message.attachment} isMine={isMine} />
                            </div>
                        )}

                        {message.content?.trim() && (
                            <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">{message.content}</p>
                        )}

                        <div className={`flex items-center gap-1.5 mt-2 ${isMine ? "justify-end" : "justify-start"}`}>
                            <span className={`text-[10px] ${isMine ? "text-indigo-200/80" : "text-slate-500"}`}>
                                {formatMessageTime(message.createdAt)}
                            </span>
                            {message.is_edited && (
                                <span className={`text-[10px] ${isMine ? "text-indigo-200/80" : "text-slate-500"}`}>
                                    edited
                                </span>
                            )}
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
                    <div className="relative">
                        {isEmojiPickerOpen && (
                            <div
                                ref={emojiPickerRef}
                                className="absolute bottom-[calc(100%+12px)] left-0 z-30 overflow-hidden rounded-[28px] border border-white/[0.08] shadow-[0_24px_80px_rgba(2,8,23,0.45)]"
                            >
                                <EmojiPicker
                                    open={isEmojiPickerOpen}
                                    onEmojiClick={(emojiData: EmojiClickData) => handleEmojiSelect(emojiData.emoji)}
                                    theme={Theme.DARK}
                                    emojiStyle={EmojiStyle.NATIVE}
                                    lazyLoadEmojis
                                    autoFocusSearch={false}
                                    skinTonesDisabled
                                    width={336}
                                    height={420}
                                    searchPlaceholder="Search emoji"
                                    previewConfig={{ showPreview: false }}
                                />
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-3 relative bg-[#080c14] border border-white/[0.05] rounded-[28px] p-3 focus-within:border-indigo-500/40 transition-colors shadow-inner"
                        >
                            {editingMessage && (
                                <div className="flex items-start justify-between gap-3 rounded-[22px] border border-amber-400/15 bg-amber-500/10 px-4 py-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-amber-100">
                                            {editingMessage.attachment ? "Editing caption" : "Editing message"}
                                        </p>
                                        <p className="mt-1 truncate text-xs text-amber-200/80">
                                            {editingMessage.content?.trim() || editingMessage.attachment?.file_name || "Update this message"}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCancelEditing}
                                        className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all duration-200 cursor-pointer shrink-0"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {selectedFile && !editingMessage && (
                                <SelectedAttachmentPreview
                                    file={selectedFile}
                                    previewUrl={selectedFilePreviewUrl}
                                    onRemove={clearSelectedFile}
                                />
                            )}

                            <div className="flex items-end gap-2">
                                <div className="flex items-center gap-1 self-end pb-1">
                                    <button
                                        type="button"
                                        onClick={() => setIsEmojiPickerOpen((currentValue) => !currentValue)}
                                        className="w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer"
                                    >
                                        <SmilePlus className="w-5 h-5" strokeWidth={2.1} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleFileButtonClick}
                                        disabled={Boolean(editingMessage)}
                                        className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center transition-all ${
                                            editingMessage
                                                ? "text-slate-600 cursor-not-allowed"
                                                : "text-slate-400 hover:text-white hover:bg-white/[0.05] cursor-pointer"
                                        }`}
                                    >
                                        <Paperclip className="w-5 h-5" strokeWidth={2.1} />
                                    </button>
                                </div>

                                <textarea
                                    ref={composerRef}
                                    rows={1}
                                    value={input}
                                    onChange={handleTyping}
                                    onKeyDown={handleComposerKeyDown}
                                    placeholder={editingMessage
                                        ? (editingMessage.attachment ? "Add or update the caption..." : "Edit your message...")
                                        : isGroupConversation
                                            ? "Message the group..."
                                            : "Type a message..."}
                                    className="flex-1 max-h-40 resize-none bg-transparent text-white placeholder:text-slate-500 text-[15px] leading-6 px-2 pt-2 pb-2 outline-none scrollbar-thin"
                                />

                                <button
                                    type="submit"
                                    disabled={editingMessage ? (!canSubmitEdit || isSavingEdit) : (!canSubmitNewMessage || sendingMessage)}
                                    className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center transition-all ${
                                        editingMessage
                                            ? (canSubmitEdit && !isSavingEdit
                                                ? "bg-amber-500 text-white hover:bg-amber-400 shadow-md shadow-amber-500/20 cursor-pointer"
                                                : "bg-white/[0.02] text-slate-500 cursor-not-allowed")
                                            : (canSubmitNewMessage && !sendingMessage
                                                ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/25 cursor-pointer"
                                                : "bg-white/[0.02] text-slate-500 cursor-not-allowed")
                                    }`}
                                >
                                    {sendingMessage || isSavingEdit ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : editingMessage ? (
                                        <Pencil className="w-4.5 h-4.5" strokeWidth={2.2} />
                                    ) : (
                                        <Send className="w-4 h-4 ml-0.5" strokeWidth={2.5} />
                                    )}
                                </button>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,video/*,application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </form>
                    </div>
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

            <ConfirmDialog
                open={Boolean(deleteDialogMessage)}
                title="Delete Message"
                message="Delete this message for everyone in this conversation?"
                confirmLabel={isDeletingMessage ? "Deleting..." : "Delete"}
                cancelLabel="Cancel"
                onConfirm={() => void handleDeleteConfirmation()}
                onCancel={() => !isDeletingMessage && setDeleteDialogMessage(null)}
                variant="danger"
            />
        </div>
    );
};

export default ChatArea;
