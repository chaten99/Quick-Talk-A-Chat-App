import * as conversationRepo from "../repositories/conversation.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import cloudinary from "../config/cloudinary.js";
import { emitToUser } from "../sockets/socket.js";
import AppError from "../utils/AppError.js";

const withMessagingState = (conversation, friendIds) => {
    if (!conversation) {
        return conversation;
    }

    const canMessage = conversation.is_direct && conversation.friend?._id
        ? friendIds.has(conversation.friend._id.toString())
        : true;

    return {
        ...conversation,
        can_message: canMessage
    };
};

const uploadGroupAvatar = async (fileBuffer) => {
    if (!fileBuffer) {
        return "";
    }

    const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "quicktalk/group-avatars",
                resource_type: "image",
                transformation: [
                    { width: 500, height: 500, crop: "fill", gravity: "center" },
                    { quality: "auto", fetch_format: "auto" },
                ],
            },
            (error, uploadedImage) => {
                if (error) reject(new AppError("Failed to upload image", 500));
                else resolve(uploadedImage);
            }
        );

        stream.end(fileBuffer);
    });

    return result.secure_url;
};

export const getConversations = async (userId, page = 1, limit = 20) => {
    const rawConversations = await conversationRepo.getConversationsByUserId(userId, page, limit);
    const friendIds = new Set(await userRepository.getFriendsIds(userId));
    
    let hasMore = false;
    let conversations = rawConversations.map((conversation) => withMessagingState(conversation, friendIds));

    if (conversations.length > limit) {
        hasMore = true;
        conversations = conversations.slice(0, limit);
    }

    return {
        conversations,
        hasMore,
        page
    };
};

export const getOrCreateDirectConversation = async (userId, friendId) => {
    if (userId.toString() === friendId.toString()) {
        throw new AppError("Cannot create a conversation with yourself", 400);
    }

    const user = await userRepository.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    const isFriend = user.friends.some((id) => id.toString() === friendId.toString());
    
    if (!isFriend) {
        throw new AppError("You can only message your friends", 403);
    }

    let conversation = await conversationRepo.findDirectConversation(userId, friendId);

    if (!conversation) {
        conversation = await conversationRepo.createDirectConversation(userId, friendId);
    }

    const populatedConversation = await conversationRepo.getConversationByIdAndUserId(conversation._id, userId);

    if (!populatedConversation) {
        throw new AppError("Conversation not found", 404);
    }

    return withMessagingState(populatedConversation, new Set([friendId.toString()]));
};

export const createGroupConversation = async (userId, groupName, memberIds = [], avatarBuffer) => {
    const creator = await userRepository.findById(userId);

    if (!creator) {
        throw new AppError("User not found", 404);
    }

    if (!groupName || groupName.trim() === "") {
        throw new AppError("Group name is required", 400);
    }

    const uniqueMemberIds = [...new Set(
        memberIds
            .map((memberId) => memberId?.toString())
            .filter((memberId) => memberId && memberId !== userId.toString())
    )];

    if (uniqueMemberIds.length < 2) {
        throw new AppError("Select at least 2 friends to create a group", 400);
    }

    const creatorFriendIds = new Set(creator.friends.map((friendId) => friendId.toString()));
    const invalidMemberId = uniqueMemberIds.find((memberId) => !creatorFriendIds.has(memberId));

    if (invalidMemberId) {
        throw new AppError("You can only add your friends to a group", 403);
    }

    const groupAvatar = await uploadGroupAvatar(avatarBuffer);
    const conversation = await conversationRepo.createGroupConversation(
        userId,
        groupName.trim(),
        groupAvatar,
        uniqueMemberIds
    );

    const creatorConversation = await conversationRepo.getConversationByIdAndUserId(conversation._id, userId);

    if (!creatorConversation) {
        throw new AppError("Conversation not found", 404);
    }

    for (const memberId of uniqueMemberIds) {
        const memberConversation = await conversationRepo.getConversationByIdAndUserId(conversation._id, memberId);

        if (memberConversation) {
            emitToUser(memberId, "conversation:new", {
                conversation: withMessagingState(memberConversation, new Set())
            });
        }
    }

    return withMessagingState(creatorConversation, creatorFriendIds);
};

export const resetUnreadCount = async (conversationId, userId) => {
    const member = await conversationRepo.findConversationMember(conversationId, userId);

    if (!member) {
        throw new AppError("Conversation not found", 404);
    }

    return conversationRepo.resetUnreadCount(conversationId, userId);
};
