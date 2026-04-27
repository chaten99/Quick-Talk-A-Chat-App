import Message from "../models/message.model.js";
import ConversationMember from "../models/conversation_members.model.js";
import mongoose from "mongoose";

const MESSAGE_POPULATE = [
    { path: "sender_id", select: "username avatar" },
    { path: "seen_by.user_id", select: "username avatar" },
    { path: "reactions.user_id", select: "username avatar" }
];

export const getMessagesByConversation = async (conversationId, page = 1, limit = 50) => {
    const skip = (page - 1) * limit;

    return Message.find({ conversation_id: conversationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit + 1)
        .populate(MESSAGE_POPULATE)
        .exec();
};

export const createMessage = async (messageData) => {
    const message = new Message(messageData);
    await message.save();
    return message.populate(MESSAGE_POPULATE);
};

export const updateMessageStatus = async (messageId, status) => {
    return Message.findByIdAndUpdate(messageId, { status }, { returnDocument: "after" })
        .populate(MESSAGE_POPULATE)
        .exec();
};

export const getMessageById = async (messageId) => {
    return Message.findById(messageId)
        .populate(MESSAGE_POPULATE)
        .exec();
};

export const updateMessage = async (messageId, updateData) => {
    return Message.findByIdAndUpdate(
        messageId,
        updateData,
        { returnDocument: "after" }
    )
        .populate(MESSAGE_POPULATE)
        .exec();
};

export const deleteMessageById = async (messageId) => {
    return Message.findByIdAndDelete(messageId).exec();
};

export const getLatestMessageByConversation = async (conversationId) => {
    return Message.findOne({ conversation_id: conversationId })
        .sort({ createdAt: -1 })
        .populate(MESSAGE_POPULATE)
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

export const toggleMessageReaction = async (messageId, userId, emoji) => {
    const messageObjectId = new mongoose.Types.ObjectId(messageId);
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const reactedAt = new Date();

    const removedReaction = await Message.collection.updateOne(
        {
            _id: messageObjectId,
            reactions: {
                $elemMatch: {
                    user_id: userObjectId,
                    emoji
                }
            }
        },
        {
            $pull: {
                reactions: {
                    user_id: userObjectId
                }
            }
        }
    );

    if (removedReaction.modifiedCount > 0) {
        return getMessageById(messageId);
    }

    const replacedReaction = await Message.collection.updateOne(
        {
            _id: messageObjectId,
            "reactions.user_id": userObjectId
        },
        {
            $set: {
                "reactions.$.emoji": emoji,
                "reactions.$.reacted_at": reactedAt
            }
        }
    );

    if (replacedReaction.modifiedCount > 0 || replacedReaction.matchedCount > 0) {
        return getMessageById(messageId);
    }

    await Message.collection.updateOne(
        {
            _id: messageObjectId,
            "reactions.user_id": { $ne: userObjectId }
        },
        {
            $push: {
                reactions: {
                    user_id: userObjectId,
                    emoji,
                    reacted_at: reactedAt
                }
            }
        }
    );

    return getMessageById(messageId);
};

export const removeMessageReaction = async (messageId, userId) => {
    const messageObjectId = new mongoose.Types.ObjectId(messageId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    await Message.collection.updateOne(
        { _id: messageObjectId },
        {
            $pull: {
                reactions: {
                    user_id: userObjectId
                }
            }
        }
    );

    return getMessageById(messageId);
};
