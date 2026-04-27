import Conversation from "../models/conversation.model.js";
import ConversationMember from "../models/conversation_members.model.js";
import mongoose from "mongoose";

const toObjectId = (value) => new mongoose.Types.ObjectId(value);

const buildConversationPipeline = (matchStage, userId, options = {}) => {
    const pipeline = [
        matchStage,
        {
            $lookup: {
                from: "conversations",
                localField: "conversation_id",
                foreignField: "_id",
                as: "conversation"
            }
        },
        { $unwind: "$conversation" },
        {
            $lookup: {
                from: "messages",
                localField: "conversation.last_message_id",
                foreignField: "_id",
                as: "last_message"
            }
        },
        {
            $unwind: {
                path: "$last_message",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "last_message.sender_id",
                foreignField: "_id",
                as: "last_message_sender"
            }
        },
        {
            $unwind: {
                path: "$last_message_sender",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "conversationmembers",
                let: { convo_id: "$conversation_id", current_user: toObjectId(userId) },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$conversation_id", "$$convo_id"] },
                                    { $ne: ["$user_id", "$$current_user"] }
                                ]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "user_id",
                            foreignField: "_id",
                            as: "user"
                        }
                    },
                    { $unwind: "$user" },
                    {
                        $project: {
                            "user._id": 1,
                            "user.username": 1,
                            "user.email": 1,
                            "user.avatar": 1,
                            "user.is_online": 1,
                            "user.last_seen": 1
                        }
                    }
                ],
                as: "other_members"
            }
        },
        {
            $addFields: {
                member_count: { $add: [{ $size: "$other_members" }, 1] },
                last_message: {
                    $cond: [
                        { $ifNull: ["$last_message._id", false] },
                        {
                            _id: "$last_message._id",
                            conversation_id: "$last_message.conversation_id",
                            sender_id: {
                                _id: "$last_message_sender._id",
                                username: "$last_message_sender.username",
                                avatar: "$last_message_sender.avatar"
                            },
                            content: "$last_message.content",
                            message_type: "$last_message.message_type",
                            status: "$last_message.status",
                            is_edited: "$last_message.is_edited",
                            attachment: "$last_message.attachment",
                            seen_by: "$last_message.seen_by",
                            reactions: "$last_message.reactions",
                            createdAt: "$last_message.createdAt",
                            updatedAt: "$last_message.updatedAt"
                        },
                        "$last_message"
                    ]
                }
            }
        }
    ];

    if (options.sort !== false) {
        pipeline.push({
            $sort: {
                "last_message.createdAt": -1,
                "conversation.updatedAt": -1
            }
        });
    }

    if (typeof options.skip === "number") {
        pipeline.push({ $skip: options.skip });
    }

    if (typeof options.limit === "number") {
        pipeline.push({ $limit: options.limit });
    }

    pipeline.push({
        $project: {
            _id: "$conversation._id",
            is_group: "$conversation.is_group",
            is_direct: "$conversation.is_direct",
            group_name: "$conversation.group_name",
            group_avatar: "$conversation.group_avatar",
            unread_count: 1,
            last_message: 1,
            friend: { $arrayElemAt: ["$other_members.user", 0] },
            members: "$other_members.user",
            member_count: 1,
            updatedAt: "$conversation.updatedAt"
        }
    });

    return pipeline;
};

export const getConversationsByUserId = async (userId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    return ConversationMember.aggregate(
        buildConversationPipeline(
            { $match: { user_id: toObjectId(userId) } },
            userId,
            { skip, limit: limit + 1 }
        )
    );
};

export const findDirectConversation = async (userId1, userId2) => {

    const pipeline = [
        { $match: { user_id: new mongoose.Types.ObjectId(userId1) } },
        {
            $lookup: {
                from: "conversationmembers",
                localField: "conversation_id",
                foreignField: "conversation_id",
                as: "other_member"
            }
        },
        { $unwind: "$other_member" },
        { 
            $match: { 
                "other_member.user_id": new mongoose.Types.ObjectId(userId2) 
            } 
        },
        {
            $lookup: {
                from: "conversations",
                localField: "conversation_id",
                foreignField: "_id",
                as: "conversation"
            }
        },
        { $unwind: "$conversation" },
        { $match: { "conversation.is_direct": true } }
    ];

    const result = await ConversationMember.aggregate(pipeline);
    
    if (result.length > 0) {
        return result[0].conversation;
    }
    return null;
};

export const createDirectConversation = async (userId1, userId2) => {
    let conversation = null;

    try {
        conversation = new Conversation({
            is_group: false,
            is_direct: true,
        });
        await conversation.save();

        await ConversationMember.insertMany([
            {
                conversation_id: conversation._id,
                user_id: userId1,
            },
            {
                conversation_id: conversation._id,
                user_id: userId2,
            }
        ]);

        return conversation;
    } catch (error) {
        if (conversation?._id) {
            await ConversationMember.deleteMany({ conversation_id: conversation._id });
            await Conversation.findByIdAndDelete(conversation._id);
        }

        throw error;
    }
};

export const createGroupConversation = async (creatorId, groupName, groupAvatar, memberIds) => {
    let conversation = null;

    try {
        conversation = new Conversation({
            is_group: true,
            is_direct: false,
            group_name: groupName,
            group_avatar: groupAvatar,
            created_by: creatorId,
        });
        await conversation.save();

        await ConversationMember.insertMany([
            {
                conversation_id: conversation._id,
                user_id: creatorId,
                role: "admin",
            },
            ...memberIds.map((memberId) => ({
                conversation_id: conversation._id,
                user_id: memberId,
                role: "member",
            }))
        ]);

        return conversation;
    } catch (error) {
        if (conversation?._id) {
            await ConversationMember.deleteMany({ conversation_id: conversation._id });
            await Conversation.findByIdAndDelete(conversation._id);
        }

        throw error;
    }
};

export const getConversationByIdAndUserId = async (conversationId, userId) => {
    const result = await ConversationMember.aggregate(
        buildConversationPipeline(
            { $match: { conversation_id: toObjectId(conversationId), user_id: toObjectId(userId) } },
            userId,
            { sort: false }
        )
    );

    return result[0] || null;
};

export const updateLastMessage = async (conversationId, messageId) => {
    return Conversation.findByIdAndUpdate(
        conversationId,
        { last_message_id: messageId },
        { returnDocument: "after" }
    );
};

export const findConversationById = async (conversationId) => {
    return Conversation.findById(conversationId);
};

export const findConversationMember = async (conversationId, userId) => {
    return ConversationMember.findOne({ conversation_id: conversationId, user_id: userId });
};

export const resetUnreadCount = async (conversationId, userId) => {
    return ConversationMember.findOneAndUpdate(
        { conversation_id: conversationId, user_id: userId },
        { unread_count: 0 },
        { returnDocument: "after" }
    );
};

export const incrementUnreadCount = async (conversationId, memberUserId) => {
    return ConversationMember.findOneAndUpdate(
        { conversation_id: conversationId, user_id: memberUserId },
        { $inc: { unread_count: 1 } },
        { returnDocument: "after" }
    );
};

export const decrementUnreadCount = async (conversationId, memberUserId) => {
    return ConversationMember.findOneAndUpdate(
        {
            conversation_id: conversationId,
            user_id: memberUserId,
            unread_count: { $gt: 0 }
        },
        { $inc: { unread_count: -1 } },
        { returnDocument: "after" }
    );
};

export const getConversationMembers = async (conversationId) => {
    return ConversationMember.find({ conversation_id: conversationId });
};

export const addMembersToGroup = async (conversationId, members) => {
    return ConversationMember.insertMany(members);
};

export const removeMemberFromGroup = async (conversationId, userId) => {
    return ConversationMember.deleteOne({ conversation_id: conversationId, user_id: userId });
};
