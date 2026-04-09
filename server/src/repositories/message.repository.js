import Message from "../models/message.model.js";
import ConversationMember from "../models/conversation_members.model.js";

export const getMessagesByConversation = async (conversationId, page = 1, limit = 50) => {
    const skip = (page - 1) * limit;

    return Message.find({ conversation_id: conversationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit + 1)
        .populate("sender_id", "username avatar")
        .populate("seen_by.user_id", "username avatar")
        .exec();
};

export const createMessage = async (messageData) => {
    const message = new Message(messageData);
    await message.save();
    return message.populate([
        { path: "sender_id", select: "username avatar" },
        { path: "seen_by.user_id", select: "username avatar" }
    ]);
};

export const updateMessageStatus = async (messageId, status) => {
    return Message.findByIdAndUpdate(messageId, { status }, { returnDocument: "after" })
        .populate("sender_id", "username avatar")
        .populate("seen_by.user_id", "username avatar")
        .exec();
};

export const updateMessagesStatusInConversation = async (conversationId, excludeSenderId, oldStatuses, newStatus) => {
    return Message.updateMany(
        { 
            conversation_id: conversationId, 
            sender_id: { $ne: excludeSenderId },
            status: { $in: oldStatuses } 
        },
        { $set: { status: newStatus } }
    );
};

export const addSeenByUserToConversation = async (conversationId, userId) => {
    const seenAt = new Date();
    const messages = await Message.find({
        conversation_id: conversationId,
        sender_id: { $ne: userId },
        seen_by: {
            $not: {
                $elemMatch: {
                    user_id: userId
                }
            }
        }
    }).select("_id");

    if (messages.length === 0) {
        return {
            messageIds: [],
            seenAt
        };
    }

    const messageIds = messages.map((message) => message._id);

    await Message.updateMany(
        {
            _id: { $in: messageIds }
        },
        {
            $push: {
                seen_by: {
                    user_id: userId,
                    seen_at: seenAt
                }
            }
        }
    );

    return {
        messageIds: messageIds.map((messageId) => messageId.toString()),
        seenAt
    };
};

export const markUndeliveredAsDeliveredForUser = async (userId) => {
    const memberships = await ConversationMember.find({ user_id: userId }).select("conversation_id");
    const conversationIds = memberships.map((membership) => membership.conversation_id);

    if (conversationIds.length === 0) {
        return [];
    }

    const messages = await Message.find(
        {
            conversation_id: { $in: conversationIds },
            sender_id: { $ne: userId },
            status: "sent"
        }
    ).select("conversation_id sender_id");

    if (messages.length === 0) {
        return [];
    }

    await Message.updateMany(
        {
            _id: { $in: messages.map((message) => message._id) }
        },
        { $set: { status: "delivered" } }
    );

    return messages;
};
