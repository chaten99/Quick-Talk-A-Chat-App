import * as messageRepository from "../repositories/message.repository.js";
import * as conversationRepository from "../repositories/conversation.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import { emitToUser } from "../sockets/socket.js";
import AppError from "../utils/AppError.js";

const ensureConversationMember = async (conversationId, userId) => {
    const member = await conversationRepository.findConversationMember(conversationId, userId);

    if (!member) {
        throw new AppError("Conversation not found", 404);
    }
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

export const sendMessage = async (conversationId, senderId, content) => {
    await ensureConversationMember(conversationId, senderId);

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

    let message = await messageRepository.createMessage({
        conversation_id: conversationId,
        sender_id: senderId,
        content
    });

    const recipientMembers = members.filter((member) => member.user_id.toString() !== senderId.toString());

    const onlineRecipients = await Promise.all(
        recipientMembers.map(async (member) => {
            const user = await userRepository.findById(member.user_id);

            return {
                member,
                isOnline: Boolean(user?.is_online)
            };
        })
    );

    if (onlineRecipients.some((recipient) => recipient.isOnline)) {
        message = await messageRepository.updateMessageStatus(message._id, "delivered");
    }

    await conversationRepository.updateLastMessage(conversationId, message._id);

    for (const member of members) {
        if (member.user_id.toString() !== senderId.toString()) {
            await conversationRepository.incrementUnreadCount(conversationId, member.user_id);

            const memberConversation = await conversationRepository.getConversationByIdAndUserId(conversationId, member.user_id);

            emitToUser(member.user_id.toString(), "message:new", {
                message,
                conversationId,
                conversation: memberConversation ? { ...memberConversation, can_message: true } : memberConversation
            });
        }
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

    const seenUser = await userRepository.findById(userId);

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
