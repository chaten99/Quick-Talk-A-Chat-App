import { create } from "zustand";
import { chatApi } from "../api/chatApi";
import { useAuthStore } from "./authStore";
import type { ChatUser, Conversation, Message, MessageStatus } from "../types/chatTypes";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";

type SendMessagePayload = {
    content?: string;
    file?: File | null;
};

type UpdateConversationLastMessageOptions = {
    incrementUnread?: boolean;
    syncUpdatedAt?: boolean;
};

interface ChatState {
    conversations: Conversation[];
    messages: Record<string, Message[]>;
    activeConversationId: string | null;
    conversationsPage: number;
    hasMoreConversations: boolean;
    messagesPage: Record<string, number>;
    hasMoreMessages: Record<string, boolean>;
    loadingConversations: boolean;
    loadingMessages: Record<string, boolean>;
    sendingMessage: boolean;
    reactionLoading: Record<string, boolean>;
    typingUsers: Record<string, string[]>;
    fetchConversations: (page?: number) => Promise<void>;
    fetchMessages: (conversationId: string, page?: number) => Promise<void>;
    setActiveConversation: (conversationId: string | null) => void;
    sendMessage: (payload: SendMessagePayload) => Promise<Message | null>;
    toggleReaction: (messageId: string, emoji: string) => Promise<Message | null>;
    editMessage: (messageId: string, content: string) => Promise<Message>;
    deleteMessage: (messageId: string) => Promise<void>;
    addMessage: (conversationId: string, message: Message) => void;
    applyMessageUpdate: (conversationId: string, message: Message) => void;
    applyMessageDelete: (conversationId: string, messageId: string) => void;
    upsertConversation: (conversation: Conversation) => void;
    updateMessageStatus: (conversationId: string, status: MessageStatus) => void;
    updateConversationLastMessage: (
        conversationId: string,
        message: Message | null,
        options?: UpdateConversationLastMessageOptions
    ) => void;
    updateFriendPresence: (userId: string, isOnline: boolean, lastSeen?: string) => void;
    updateConversationMessagingPermission: (friendId: string, canMessage: boolean) => void;
    applyMessageSeenUpdate: (conversationId: string, messageIds: string[], seenBy: ChatUser, seenAt: string) => void;
    setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
    markConversationAsRead: (conversationId: string) => Promise<void>;
    addGroupMembers: (conversationId: string, memberIds: string[]) => Promise<void>;
    removeGroupMember: (conversationId: string, userId: string) => Promise<void>;
}

const sortConversations = (conversations: Conversation[]) => {
    return conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

const sortMessages = (messages: Message[]) => {
    return messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

const getMessageSenderId = (message: Message) => {
    return typeof message.sender_id === "object" && message.sender_id !== null
        ? message.sender_id._id
        : message.sender_id;
};

const getSeenUserId = (user: ChatUser | string) => {
    return typeof user === "object" && user !== null
        ? user._id
        : user;
};

const getReactionUserId = (user: ChatUser | string) => {
    return typeof user === "object" && user !== null
        ? user._id
        : user;
};

const getOptimisticReactionMessage = (message: Message, userId: string, emoji: string) => {
    const reactions = message.reactions || [];
    const existingReaction = reactions.find((reaction) => getReactionUserId(reaction.user_id) === userId);
    const reactionsWithoutCurrentUser = reactions.filter(
        (reaction) => getReactionUserId(reaction.user_id) !== userId
    );

    const nextReactions = existingReaction?.emoji === emoji
        ? reactionsWithoutCurrentUser
        : [
            ...reactionsWithoutCurrentUser,
            {
                user_id: userId,
                emoji,
                reacted_at: new Date().toISOString()
            }
        ];

    return {
        ...message,
        reactions: nextReactions,
        updatedAt: new Date().toISOString()
    };
};

const upsertMessageList = (messages: Message[], message: Message) => {
    const existingIndex = messages.findIndex((currentMessage) => currentMessage._id === message._id);

    if (existingIndex === -1) {
        return sortMessages([...messages, message]);
    }

    const nextMessages = [...messages];
    nextMessages[existingIndex] = message;

    return sortMessages(nextMessages);
};

export const useChatStore = create<ChatState>((set, get) => ({
    conversations: [],
    messages: {},
    activeConversationId: null,
    conversationsPage: 1,
    hasMoreConversations: true,
    messagesPage: {},
    hasMoreMessages: {},
    loadingConversations: false,
    loadingMessages: {},
    sendingMessage: false,
    reactionLoading: {},
    typingUsers: {},

    fetchConversations: async (page = 1) => {
        try {
            set({ loadingConversations: true });
            const data = await chatApi.getConversations(page, 20);

            set((state) => {
                const existing = page === 1 ? [] : state.conversations;
                const newConversations = data.conversations.filter(
                    (conversation) => !existing.some((existingConversation) => existingConversation._id === conversation._id)
                );

                return {
                    conversations: sortConversations([...existing, ...newConversations]),
                    conversationsPage: data.page,
                    hasMoreConversations: data.hasMore,
                };
            });
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        } finally {
            set({ loadingConversations: false });
        }
    },

    fetchMessages: async (conversationId: string, page = 1) => {
        try {
            set((state) => ({
                loadingMessages: { ...state.loadingMessages, [conversationId]: true }
            }));

            const data = await chatApi.getMessages(conversationId, page, 50);
            const sortedMessages = [...data.messages].reverse();

            set((state) => {
                const existing = page === 1 ? [] : (state.messages[conversationId] || []);
                const updatedMessages = page === 1
                    ? sortedMessages
                    : [...sortedMessages, ...existing];

                const seenIds = new Set<string>();
                const uniqueMessages = sortMessages(updatedMessages).filter((message) => {
                    if (seenIds.has(message._id)) {
                        return false;
                    }

                    seenIds.add(message._id);
                    return true;
                });

                return {
                    messages: {
                        ...state.messages,
                        [conversationId]: uniqueMessages
                    },
                    messagesPage: {
                        ...state.messagesPage,
                        [conversationId]: data.page
                    },
                    hasMoreMessages: {
                        ...state.hasMoreMessages,
                        [conversationId]: data.hasMore
                    }
                };
            });

            if (page === 1) {
                await get().markConversationAsRead(conversationId);
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        } finally {
            set((state) => ({
                loadingMessages: { ...state.loadingMessages, [conversationId]: false }
            }));
        }
    },

    setActiveConversation: (conversationId: string | null) => {
        set({ activeConversationId: conversationId });

        if (conversationId) {
            const currentMessages = get().messages[conversationId];
            const hasLoadedMessages = typeof get().messagesPage[conversationId] === "number";

            if (!hasLoadedMessages || !currentMessages || currentMessages.length === 0) {
                void get().fetchMessages(conversationId, 1);
            } else {
                void get().markConversationAsRead(conversationId);
            }
        }
    },

    sendMessage: async (payload: SendMessagePayload) => {
        const { activeConversationId } = get();

        if (!activeConversationId) {
            return null;
        }

        try {
            set({ sendingMessage: true });
            const message = await chatApi.sendMessage(activeConversationId, payload);

            get().addMessage(activeConversationId, message);
            get().updateConversationLastMessage(activeConversationId, message, {
                syncUpdatedAt: true
            });

            return message;
        } catch (error) {
            const apiError = error as AxiosError<{ message: string }>;
            const errorMessage = apiError.response?.data?.message || "Failed to send message";

            if (apiError.response?.status === 403) {
                const activeConversation = get().conversations.find(
                    (conversation) => conversation._id === activeConversationId
                );

                if (activeConversation?.friend?._id) {
                    get().updateConversationMessagingPermission(activeConversation.friend._id, false);
                }
            }

            toast.error(errorMessage);
            return null;
        } finally {
            set({ sendingMessage: false });
        }
    },

    toggleReaction: async (messageId: string, emoji: string) => {
        const { activeConversationId } = get();
        const currentUserId = useAuthStore.getState().user?.id;

        if (!activeConversationId || !currentUserId) {
            return null;
        }

        const messageSnapshot = (get().messages[activeConversationId] || []).find(
            (message) => message._id === messageId
        );

        if (!messageSnapshot) {
            return null;
        }

        const optimisticMessage = getOptimisticReactionMessage(messageSnapshot, currentUserId, emoji);
        get().applyMessageUpdate(activeConversationId, optimisticMessage);

        set((state) => ({
            reactionLoading: {
                ...state.reactionLoading,
                [messageId]: true
            }
        }));

        try {
            const message = await chatApi.toggleReaction(activeConversationId, messageId, emoji);
            get().applyMessageUpdate(activeConversationId, message);
            return message;
        } catch {
            const messageStillExists = (get().messages[activeConversationId] || []).some(
                (message) => message._id === messageId
            );

            if (messageStillExists) {
                get().applyMessageUpdate(activeConversationId, messageSnapshot);
            }

            return null;
        } finally {
            set((state) => ({
                reactionLoading: {
                    ...state.reactionLoading,
                    [messageId]: false
                }
            }));
        }
    },

    editMessage: async (messageId: string, content: string) => {
        const { activeConversationId } = get();

        if (!activeConversationId) {
            throw new Error("No active conversation selected");
        }

        try {
            const message = await chatApi.updateMessage(activeConversationId, messageId, content);
            get().applyMessageUpdate(activeConversationId, message);
            return message;
        } catch (error) {
            const apiError = error as AxiosError<{ message: string }>;
            toast.error(apiError.response?.data?.message || "Failed to update message");
            throw error;
        }
    },

    deleteMessage: async (messageId: string) => {
        const { activeConversationId } = get();

        if (!activeConversationId) {
            throw new Error("No active conversation selected");
        }

        try {
            await chatApi.deleteMessage(activeConversationId, messageId);
            get().applyMessageDelete(activeConversationId, messageId);
        } catch (error) {
            const apiError = error as AxiosError<{ message: string }>;
            toast.error(apiError.response?.data?.message || "Failed to delete message");
            throw error;
        }
    },

    addMessage: (conversationId: string, message: Message) => {
        set((state) => ({
            messages: {
                ...state.messages,
                [conversationId]: upsertMessageList(state.messages[conversationId] || [], message)
            }
        }));

        if (
            get().activeConversationId === conversationId &&
            getMessageSenderId(message) !== useAuthStore.getState().user?.id
        ) {
            void get().markConversationAsRead(conversationId);
        }
    },

    applyMessageUpdate: (conversationId: string, message: Message) => {
        set((state) => ({
            messages: {
                ...state.messages,
                [conversationId]: upsertMessageList(state.messages[conversationId] || [], message)
            },
            conversations: state.conversations.map((conversation) => {
                if (conversation._id !== conversationId || conversation.last_message?._id !== message._id) {
                    return conversation;
                }

                return {
                    ...conversation,
                    last_message: message
                };
            })
        }));
    },

    applyMessageDelete: (conversationId: string, messageId: string) => {
        set((state) => {
            const nextMessages = (state.messages[conversationId] || []).filter((message) => message._id !== messageId);

            return {
                messages: {
                    ...state.messages,
                    [conversationId]: nextMessages
                },
                conversations: state.conversations.map((conversation) => {
                    if (conversation._id !== conversationId || conversation.last_message?._id !== messageId) {
                        return conversation;
                    }

                    return {
                        ...conversation,
                        last_message: nextMessages.at(-1) || null
                    };
                })
            };
        });
    },

    upsertConversation: (conversation: Conversation) => {
        set((state) => {
            const existingConversation = state.conversations.find(
                (currentConversation) => currentConversation._id === conversation._id
            );

            const nextConversation = existingConversation
                ? {
                    ...existingConversation,
                    ...conversation,
                    can_message: conversation.can_message ?? existingConversation.can_message ?? true,
                    friend: conversation.friend ?? existingConversation.friend,
                    members: conversation.members ?? existingConversation.members,
                    member_count: conversation.member_count ?? existingConversation.member_count,
                    last_message: conversation.last_message !== undefined
                        ? conversation.last_message
                        : existingConversation.last_message,
                }
                : { ...conversation, can_message: conversation.can_message ?? true };

            return {
                conversations: sortConversations([
                    nextConversation,
                    ...state.conversations.filter((currentConversation) => currentConversation._id !== conversation._id)
                ])
            };
        });
    },

    updateMessageStatus: (conversationId: string, status: MessageStatus) => {
        const currentUserId = useAuthStore.getState().user?.id;

        if (!currentUserId) {
            return;
        }

        set((state) => {
            const targetConversation = state.conversations.find((conversation) => conversation._id === conversationId);

            if (targetConversation?.is_group) {
                return state;
            }

            const currentMessages = state.messages[conversationId] || [];

            return {
                conversations: state.conversations.map((conversation) => {
                    if (
                        conversation._id !== conversationId ||
                        !conversation.last_message ||
                        getMessageSenderId(conversation.last_message) !== currentUserId ||
                        conversation.last_message.status === "read"
                    ) {
                        return conversation;
                    }

                    return {
                        ...conversation,
                        last_message: {
                            ...conversation.last_message,
                            status
                        }
                    };
                }),
                messages: {
                    ...state.messages,
                    [conversationId]: currentMessages.map((message) => {
                        if (getMessageSenderId(message) !== currentUserId || message.status === "read") {
                            return message;
                        }

                        return { ...message, status };
                    })
                }
            };
        });
    },

    applyMessageSeenUpdate: (conversationId: string, messageIds: string[], seenBy: ChatUser, seenAt: string) => {
        const targetMessageIds = new Set(messageIds);

        set((state) => {
            const currentMessages = state.messages[conversationId];

            if (!currentMessages || currentMessages.length === 0) {
                return state;
            }

            const applySeenBy = (message: Message) => {
                if (!targetMessageIds.has(message._id)) {
                    return message;
                }

                const existingSeenBy = message.seen_by || [];

                if (existingSeenBy.some((entry) => getSeenUserId(entry.user_id) === seenBy._id)) {
                    return message;
                }

                return {
                    ...message,
                    seen_by: [
                        ...existingSeenBy,
                        {
                            user_id: seenBy,
                            seen_at: seenAt
                        }
                    ]
                };
            };

            return {
                messages: {
                    ...state.messages,
                    [conversationId]: currentMessages.map(applySeenBy)
                },
                conversations: state.conversations.map((conversation) => {
                    if (
                        conversation._id !== conversationId ||
                        !conversation.last_message ||
                        !targetMessageIds.has(conversation.last_message._id)
                    ) {
                        return conversation;
                    }

                    return {
                        ...conversation,
                        last_message: applySeenBy(conversation.last_message)
                    };
                })
            };
        });
    },

    updateConversationLastMessage: (
        conversationId: string,
        message: Message | null,
        options: UpdateConversationLastMessageOptions = {}
    ) => {
        const { incrementUnread = false, syncUpdatedAt = false } = options;

        set((state) => {
            const index = state.conversations.findIndex((conversation) => conversation._id === conversationId);

            if (index === -1) {
                return state;
            }

            const conversations = [...state.conversations];
            const conversation = { ...conversations[index] };

            conversation.last_message = message;

            if (syncUpdatedAt && message) {
                conversation.updatedAt = message.createdAt;
            }

            if (incrementUnread) {
                conversation.unread_count += 1;
            }

            conversations[index] = conversation;

            return { conversations: sortConversations(conversations) };
        });
    },

    updateFriendPresence: (userId: string, isOnline: boolean, lastSeen?: string) => {
        set((state) => ({
            conversations: state.conversations.map((conversation) => {
                if (conversation.friend?._id !== userId) {
                    return conversation;
                }

                return {
                    ...conversation,
                    friend: {
                        ...conversation.friend,
                        is_online: isOnline,
                        last_seen: lastSeen || conversation.friend.last_seen
                    }
                };
            })
        }));
    },

    updateConversationMessagingPermission: (friendId: string, canMessage: boolean) => {
        set((state) => {
            const nextTypingUsers = { ...state.typingUsers };

            const conversations = state.conversations.map((conversation) => {
                if (conversation.friend?._id !== friendId) {
                    return conversation;
                }

                if (!canMessage) {
                    nextTypingUsers[conversation._id] = [];
                }

                return {
                    ...conversation,
                    can_message: canMessage
                };
            });

            return {
                conversations,
                typingUsers: nextTypingUsers
            };
        });
    },

    setTyping: (conversationId: string, userId: string, isTyping: boolean) => {
        set((state) => {
            const currentTypers = state.typingUsers[conversationId] || [];
            let newTypers = currentTypers;

            if (isTyping && !currentTypers.includes(userId)) {
                newTypers = [...currentTypers, userId];
            } else if (!isTyping && currentTypers.includes(userId)) {
                newTypers = currentTypers.filter((id) => id !== userId);
            }

            return {
                typingUsers: {
                    ...state.typingUsers,
                    [conversationId]: newTypers
                }
            };
        });
    },

    markConversationAsRead: async (conversationId: string) => {
        const conversation = get().conversations.find((currentConversation) => currentConversation._id === conversationId);

        if (conversation && conversation.unread_count > 0) {
            set((state) => ({
                conversations: state.conversations.map((currentConversation) =>
                    currentConversation._id === conversationId
                        ? { ...currentConversation, unread_count: 0 }
                        : currentConversation
                )
            }));

            await chatApi.markAsRead(conversationId);
        }
    },

    addGroupMembers: async (conversationId: string, memberIds: string[]) => {
        try {
            const updatedConversation = await chatApi.addGroupMembers(conversationId, memberIds);
            get().upsertConversation(updatedConversation);
            toast.success("Members added successfully");
        } catch (error) {
            const apiError = error as AxiosError<{ message: string }>;
            toast.error(apiError.response?.data?.message || "Failed to add members");
            throw error;
        }
    },

    removeGroupMember: async (conversationId: string, userId: string) => {
        try {
            const updatedConversation = await chatApi.removeGroupMember(conversationId, userId);
            get().upsertConversation(updatedConversation);
            toast.success("Member removed successfully");
        } catch (error) {
            const apiError = error as AxiosError<{ message: string }>;
            toast.error(apiError.response?.data?.message || "Failed to remove member");
            throw error;
        }
    }
}));
