import * as conversationRepo from "../repositories/conversation.repository.js";
import * as userRepository from "../repositories/user.repository.js";
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

export const resetUnreadCount = async (conversationId, userId) => {
    const member = await conversationRepo.findConversationMember(conversationId, userId);

    if (!member) {
        throw new AppError("Conversation not found", 404);
    }

    return conversationRepo.resetUnreadCount(conversationId, userId);
};
