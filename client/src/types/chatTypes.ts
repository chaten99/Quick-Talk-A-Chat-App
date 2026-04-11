export type MessageStatus = "sent" | "delivered" | "read";
export type MessageAttachmentKind = "image" | "video" | "pdf";

export interface ChatUser {
    _id: string;
    username: string;
    avatar?: string;
    email?: string;
    is_online?: boolean;
    last_seen?: string;
}

export interface MessageSeen {
    user_id: ChatUser | string;
    seen_at: string;
}

export interface MessageAttachment {
    url: string;
    public_id?: string;
    file_name: string;
    mime_type: string;
    size: number;
    kind: MessageAttachmentKind;
    resource_type?: "image" | "video" | "raw";
}

export interface Message {
    _id: string;
    conversation_id: string;
    sender_id: ChatUser | string;
    content: string;
    message_type: "text" | "file";
    status: MessageStatus;
    is_edited?: boolean;
    attachment?: MessageAttachment | null;
    seen_by?: MessageSeen[];
    createdAt: string;
    updatedAt: string;
}

export interface Conversation {
    _id: string;
    is_group: boolean;
    is_direct: boolean;
    group_name?: string;
    group_avatar?: string;
    unread_count: number;
    can_message?: boolean;
    last_message?: Message | null;
    friend?: ChatUser;
    members?: ChatUser[];
    member_count?: number;
    updatedAt: string;
}

export interface PaginatedConversations {
    conversations: Conversation[];
    hasMore: boolean;
    page: number;
}

export interface PaginatedMessages {
    messages: Message[];
    hasMore: boolean;
    page: number;
}
