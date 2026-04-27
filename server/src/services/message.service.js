import cloudinary from "../config/cloudinary.js";
import * as messageRepository from "../repositories/message.repository.js";
import * as conversationRepository from "../repositories/conversation.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import { getConversationForUser } from "./conversation.service.js";
import { emitToUser } from "../sockets/socket.js";
import AppError from "../utils/AppError.js";

const normalizeMessageContent = (content) => {
    return typeof content === "string" ? content.trim() : "";
};

const normalizeReactionEmoji = (emoji) => {
    return typeof emoji === "string" ? emoji.trim() : "";
};

const getMessageSenderId = (message) => {
    if (!message?.sender_id) {
        return "";
    }

    return typeof message.sender_id === "object"
        ? message.sender_id._id.toString()
        : message.sender_id.toString();
};

const getSeenUserId = (seenUser) => {
    if (!seenUser) {
        return "";
    }

    return typeof seenUser === "object"
        ? seenUser._id.toString()
        : seenUser.toString();
};

const getAttachmentKind = (mimetype = "") => {
    if (mimetype.startsWith("image/")) {
        return "image";
    }

    if (mimetype.startsWith("video/")) {
        return "video";
    }

    if (mimetype === "application/pdf") {
        return "pdf";
    }

    throw new AppError("Unsupported file type", 400);
};

const getAttachmentResourceType = (kind) => {
    if (kind === "pdf") {
        return "raw";
    }

    return kind;
};

const uploadMessageAttachment = async (file) => {
    if (!file) {
        return null;
    }

    const kind = getAttachmentKind(file.mimetype);
    const resourceType = getAttachmentResourceType(kind);
    const uploadedFile = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "quicktalk/messages",
                resource_type: resourceType,
                use_filename: true,
                unique_filename: true,
                overwrite: false
            },
            (error, result) => {
                if (error || !result) {
                    reject(new AppError("Failed to upload file", 500));
                    return;
                }

                resolve(result);
            }
        );

        stream.end(file.buffer);
    });

    return {
        url: uploadedFile.secure_url,
        public_id: uploadedFile.public_id,
        file_name: file.originalname,
        mime_type: file.mimetype,
        size: file.size,
        kind,
        resource_type: resourceType
    };
};

const deleteMessageAttachment = async (attachment) => {
    if (!attachment?.public_id) {
        return;
    }

    const resourceType = attachment.resource_type || getAttachmentResourceType(attachment.kind);

    await cloudinary.uploader.destroy(attachment.public_id, {
        resource_type: resourceType,
        invalidate: true
    });
};

const ensureConversationMember = async (conversationId, userId) => {
    const member = await conversationRepository.findConversationMember(conversationId, userId);

    if (!member) {
        throw new AppError("Conversation not found", 404);
    }
};

const getOwnedMessage = async (conversationId, messageId, userId) => {
    const message = await getConversationMessage(conversationId, messageId);

    if (getMessageSenderId(message) !== userId.toString()) {
        throw new AppError("You can only manage your own messages", 403);
    }

    return message;
};

const getConversationMessage = async (conversationId, messageId) => {
    const message = await messageRepository.getMessageById(messageId);

    if (!message || message.conversation_id.toString() !== conversationId.toString()) {
        throw new AppError("Message not found", 404);
    }

    return message;
};

const emitMessageEventToMembers = async (conversationId, event, payloadFactory) => {
    const members = await conversationRepository.getConversationMembers(conversationId);

    for (const member of members) {
        const memberConversation = await getConversationForUser(
            conversationId,
            member.user_id.toString()
        );

        emitToUser(
            member.user_id.toString(),
            event,
            payloadFactory(member.user_id.toString(), memberConversation)
        );
    }
};

const decrementUnreadCountsForDeletedMessage = async (conversation, members, message) => {
    const seenUserIds = new Set((message.seen_by || []).map((entry) => getSeenUserId(entry.user_id)));
    const shouldDecrementForMember = (member) => {
        if (member.user_id.toString() === getMessageSenderId(message)) {
            return false;
        }

        if (conversation?.is_direct) {
            return message.status !== "read";
        }

        return !seenUserIds.has(member.user_id.toString());
    };

    await Promise.all(
        members
            .filter(shouldDecrementForMember)
            .map((member) => conversationRepository.decrementUnreadCount(conversation._id, member.user_id))
    );
};

export const getMessages = async (conversationId, userId, page = 1, limit = 50) => {
    await ensureConversationMember(conversationId, userId);

    const rawMessages = await messageRepository.getMessagesByConversation(conversationId, page, limit);

    let hasMore = false;
    let messages = rawMessages;

    if (rawMessages.length > limit) {
        hasMore = true;
        messages = rawMessages.slice(0, limit);
    }

    return {
        messages,
        hasMore,
        page
    };
};

export const sendMessage = async (conversationId, senderId, content, file) => {
    await ensureConversationMember(conversationId, senderId);

    const normalizedContent = normalizeMessageContent(content);

    if (!normalizedContent && !file) {
        throw new AppError("Message text or file is required", 400);
    }

    const conversation = await conversationRepository.findConversationById(conversationId);
    const members = await conversationRepository.getConversationMembers(conversationId);

    if (conversation?.is_direct) {
        const recipientMember = members.find((member) => member.user_id.toString() !== senderId.toString());

        if (!recipientMember) {
            throw new AppError("Conversation not found", 404);
        }

        const friendIds = await userRepository.getFriendsIds(senderId);
        const canMessage = friendIds.includes(recipientMember.user_id.toString());

        if (!canMessage) {
            throw new AppError("You can only message your friends", 403);
        }
    }

    const attachment = await uploadMessageAttachment(file);

    let message = await messageRepository.createMessage({
        conversation_id: conversationId,
        sender_id: senderId,
        content: normalizedContent,
        message_type: attachment ? "file" : "text",
        attachment
    });

    const recipientMembers = members.filter((member) => member.user_id.toString() !== senderId.toString());
    const recipientPresenceMap = await userRepository.getUsersPresence(
        recipientMembers.map((member) => member.user_id.toString())
    );
    const onlineRecipients = recipientMembers.map((member) => ({
        member,
        isOnline: Boolean(
            recipientPresenceMap.get(member.user_id.toString())?.is_online
        )
    }));

    if (onlineRecipients.some((recipient) => recipient.isOnline)) {
        message = await messageRepository.updateMessageStatus(message._id, "delivered");
    }

    await conversationRepository.updateLastMessage(conversationId, message._id);

    for (const member of recipientMembers) {
        await conversationRepository.incrementUnreadCount(conversationId, member.user_id);

        const memberConversation = await getConversationForUser(
            conversationId,
            member.user_id.toString()
        );

        emitToUser(member.user_id.toString(), "message:new", {
            message,
            conversationId,
            conversation: memberConversation
        });
    }

    for (const recipient of onlineRecipients) {
        if (recipient.isOnline) {
            emitToUser(senderId.toString(), "message:status-update", {
                conversationId,
                status: "delivered",
                deliveredTo: recipient.member.user_id.toString()
            });
        }
    }

    return message;
};

export const updateMessage = async (conversationId, messageId, userId, content) => {
    await ensureConversationMember(conversationId, userId);

    const message = await getOwnedMessage(conversationId, messageId, userId);
    const normalizedContent = normalizeMessageContent(content);

    if (message.message_type === "text" && !normalizedContent) {
        throw new AppError("Content is required", 400);
    }

    if (message.content === normalizedContent) {
        return message;
    }

    const updatedMessage = await messageRepository.updateMessage(messageId, {
        content: normalizedContent,
        is_edited: true
    });

    await emitMessageEventToMembers(conversationId, "message:updated", (targetUserId, conversation) => ({
        conversationId,
        message: updatedMessage,
        conversation
    }));

    return updatedMessage;
};

export const deleteMessage = async (conversationId, messageId, userId) => {
    await ensureConversationMember(conversationId, userId);

    const message = await getOwnedMessage(conversationId, messageId, userId);
    const conversation = await conversationRepository.findConversationById(conversationId);
    const members = await conversationRepository.getConversationMembers(conversationId);

    if (!conversation) {
        throw new AppError("Conversation not found", 404);
    }

    await decrementUnreadCountsForDeletedMessage(conversation, members, message);
    await deleteMessageAttachment(message.attachment);
    await messageRepository.deleteMessageById(messageId);

    if (conversation.last_message_id?.toString() === messageId.toString()) {
        const latestMessage = await messageRepository.getLatestMessageByConversation(conversationId);
        await conversationRepository.updateLastMessage(
            conversationId,
            latestMessage?._id || null
        );
    }

    await emitMessageEventToMembers(conversationId, "message:deleted", (targetUserId, memberConversation) => ({
        conversationId,
        messageId,
        conversation: memberConversation
    }));

    return {
        messageId
    };
};

export const toggleReaction = async (conversationId, messageId, userId, emoji) => {
    await ensureConversationMember(conversationId, userId);

    const normalizedEmoji = normalizeReactionEmoji(emoji);

    if (!normalizedEmoji) {
        throw new AppError("Emoji is required", 400);
    }

    await getConversationMessage(conversationId, messageId);

    const message = await messageRepository.toggleMessageReaction(
        messageId,
        userId,
        normalizedEmoji
    );

    if (!message) {
        throw new AppError("Message not found", 404);
    }

    await emitMessageEventToMembers(conversationId, "message:reaction-updated", (targetUserId, conversation) => ({
        conversationId,
        message,
        conversation
    }));

    return message;
};

export const removeReaction = async (conversationId, messageId, userId) => {
    await ensureConversationMember(conversationId, userId);
    await getConversationMessage(conversationId, messageId);

    const message = await messageRepository.removeMessageReaction(messageId, userId);

    if (!message) {
        throw new AppError("Message not found", 404);
    }

    await emitMessageEventToMembers(conversationId, "message:reaction-updated", (targetUserId, conversation) => ({
        conversationId,
        message,
        conversation
    }));

    return message;
};

export const getMessageReactions = async (conversationId, messageId, userId) => {
    await ensureConversationMember(conversationId, userId);

    const message = await getConversationMessage(conversationId, messageId);

    return {
        messageId: message._id.toString(),
        reactions: message.reactions || []
    };
};

export const markAsRead = async (conversationId, userId) => {
    await ensureConversationMember(conversationId, userId);

    const conversation = await conversationRepository.findConversationById(conversationId);

    if (!conversation) {
        throw new AppError("Conversation not found", 404);
    }

    await conversationRepository.resetUnreadCount(conversationId, userId);
    const seenUpdate = await messageRepository.addSeenByUserToConversation(conversationId, userId);
    const members = await conversationRepository.getConversationMembers(conversationId);

    if (conversation.is_direct) {
        await messageRepository.updateMessagesStatusInConversation(
            conversationId,
            userId,
            ["sent", "delivered"],
            "read"
        );

        for (const member of members) {
            if (member.user_id.toString() !== userId.toString()) {
                emitToUser(member.user_id.toString(), "message:status-update", {
                    conversationId,
                    status: "read",
                    readBy: userId
                });
            }
        }

        return;
    }

    if (seenUpdate.messageIds.length === 0) {
        return;
    }

    const seenUser = await userRepository.findProfileById(userId);

    for (const member of members) {
        if (member.user_id.toString() !== userId.toString()) {
            emitToUser(member.user_id.toString(), "message:seen-update", {
                conversationId,
                messageIds: seenUpdate.messageIds,
                seenBy: {
                    _id: seenUser._id.toString(),
                    username: seenUser.username,
                    avatar: seenUser.avatar
                },
                seenAt: seenUpdate.seenAt.toISOString()
            });
        }
    }
};

export const markAsDeliveredWhenOnline = async (userId) => {
    const deliveredMessages = await messageRepository.markUndeliveredAsDeliveredForUser(userId);
    const deliveredUpdates = new Map();

    deliveredMessages.forEach((message) => {
        const key = `${message.sender_id.toString()}:${message.conversation_id.toString()}`;

        if (!deliveredUpdates.has(key)) {
            deliveredUpdates.set(key, {
                senderId: message.sender_id.toString(),
                conversationId: message.conversation_id.toString()
            });
        }
    });

    return Array.from(deliveredUpdates.values());
};
