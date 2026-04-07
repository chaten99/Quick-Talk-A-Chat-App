import { create } from "zustand";
import { chatApi } from "../api/chatApi";
import { useAuthStore } from "./authStore";
import type { Conversation, Message, MessageStatus } from "../types/chatTypes";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";

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
    typingUsers: Record<string, string[]>;
    fetchConversations: (page?: number) => Promise<void>;
    fetchMessages: (conversationId: string, page?: number) => Promise<void>;
    setActiveConversation: (conversationId: string | null) => void;
    sendMessage: (content: string) => Promise<void>;
    addMessage: (conversationId: string, message: Message) => void;
    upsertConversation: (conversation: Conversation) => void;
    updateMessageStatus: (conversationId: string, status: MessageStatus) => void;
    updateConversationLastMessage: (conversationId: string, message: Message, incrementUnread?: boolean) => void;
    updateFriendPresence: (userId: string, isOnline: boolean, lastSeen?: string) => void;
    updateConversationMessagingPermission: (friendId: string, canMessage: boolean) => void;
    setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
    markConversationAsRead: (conversationId: string) => Promise<void>;
}

const sortConversations = (conversations: Conversation[]) => {
    return conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

const getMessageSenderId = (message: Message) => {
    return typeof message.sender_id === "object" && message.sender_id !== null
        ? message.sender_id._id
        : message.sender_id;
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
                const uniqueMessages = updatedMessages.filter((message) => {
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

    sendMessage: async (content: string) => {
        const { activeConversationId } = get();
        if (!activeConversationId) return;

        try {
            set({ sendingMessage: true });
            const message = await chatApi.sendMessage(activeConversationId, content);

            get().addMessage(activeConversationId, message);
            get().updateConversationLastMessage(activeConversationId, message, false);
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
        } finally {
            set({ sendingMessage: false });
        }
    },

    addMessage: (conversationId: string, message: Message) => {
        set((state) => {
            const currentMessages = state.messages[conversationId] || [];

            if (currentMessages.some((currentMessage) => currentMessage._id === message._id)) {
                return state;
            }

            return {
                messages: {
                    ...state.messages,
                    [conversationId]: [...currentMessages, message]
                }
            };
        });

        if (
            get().activeConversationId === conversationId &&
            getMessageSenderId(message) !== useAuthStore.getState().user?.id
        ) {
            void get().markConversationAsRead(conversationId);
        }
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
                    friend: conversation.friend || existingConversation.friend,
                    last_message: conversation.last_message || existingConversation.last_message,
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

    updateConversationLastMessage: (conversationId: string, message: Message, incrementUnread = false) => {
        set((state) => {
            const index = state.conversations.findIndex((conversation) => conversation._id === conversationId);
            if (index === -1) return state;

            const conversations = [...state.conversations];
            const conversation = { ...conversations[index] };

            conversation.last_message = message;
            conversation.updatedAt = message.createdAt;
            if (incrementUnread) conversation.unread_count += 1;

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
    }
}));
