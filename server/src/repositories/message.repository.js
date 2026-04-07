import Message from "../models/message.model.js";
import ConversationMember from "../models/conversation_members.model.js";

export const getMessagesByConversation = async (conversationId, page = 1, limit = 50) => {
    const skip = (page - 1) * limit;

    return Message.find({ conversation_id: conversationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit + 1)
        .populate("sender_id", "username avatar")
        .exec();
};

export const createMessage = async (messageData) => {
    const message = new Message(messageData);
    await message.save();
    return message.populate("sender_id", "username avatar");
};

export const updateMessageStatus = async (messageId, status) => {
    return Message.findByIdAndUpdate(messageId, { status }, { returnDocument: "after" })
        .populate("sender_id", "username avatar")
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
