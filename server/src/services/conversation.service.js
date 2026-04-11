export const addGroupMembers = async (conversationId, adminId, memberIds) => {
  const conversation = await conversationRepo.findConversationById(conversationId);
  if (!conversation) throw new AppError("Conversation not found", 404);
  if (!conversation.is_group) throw new AppError("Not a group conversation", 400);

  const adminMember = await conversationRepo.findConversationMember(conversationId, adminId);
  if (!adminMember || adminMember.role !== "admin") {
    throw new AppError("Only admins can add members", 403);
  }

  const existingMembers = await conversationRepo.getConversationMembers(conversationId);
  const existingMemberIds = new Set(existingMembers.map((m) => m.user_id.toString()));

  const membersToAdd = memberIds.filter((id) => id && !existingMemberIds.has(id.toString()));

  if (membersToAdd.length > 0) {
    const newMembers = membersToAdd.map((id) => ({
      conversation_id: conversationId,
      user_id: id,
      role: "member",
    }));
    await conversationRepo.addMembersToGroup(conversationId, newMembers);
  }

  const updatedConversation = await conversationRepo.getConversationByIdAndUserId(
    conversationId,
    adminId
  );
  const hydrated = await hydrateConversationPresence(updatedConversation);

  for (const newMemberId of membersToAdd) {
    const memberConv = await conversationRepo.getConversationByIdAndUserId(
      conversationId,
      newMemberId
    );
    if (memberConv) {
      const hydratedMemberConv = await hydrateConversationPresence(memberConv);
      emitToUser(newMemberId, "conversation:new", {
        conversation: withMessagingState(hydratedMemberConv, new Set()),
      });
    }
  }

  const creatorFriendIds = new Set(await userRepository.getFriendsIds(adminId));
  return withMessagingState(hydrated, creatorFriendIds);
};

export const removeGroupMember = async (conversationId, adminId, userId) => {
  const conversation = await conversationRepo.findConversationById(conversationId);
  if (!conversation) throw new AppError("Conversation not found", 404);
  if (!conversation.is_group) throw new AppError("Not a group conversation", 400);

  const adminMember = await conversationRepo.findConversationMember(conversationId, adminId);
  if (!adminMember || adminMember.role !== "admin") {
    throw new AppError("Only admins can remove members", 403);
  }

  if (adminId.toString() === userId.toString()) {
    throw new AppError("Cannot remove yourself", 400);
  }

  await conversationRepo.removeMemberFromGroup(conversationId, userId);

  const updatedConversation = await conversationRepo.getConversationByIdAndUserId(
    conversationId,
    adminId
  );
  if (!updatedConversation) throw new AppError("Conversation not found", 404);
  const hydrated = await hydrateConversationPresence(updatedConversation);

  const creatorFriendIds = new Set(await userRepository.getFriendsIds(adminId));
  return withMessagingState(hydrated, creatorFriendIds);
};
import cloudinary from "../config/cloudinary.js";
import * as conversationRepo from "../repositories/conversation.repository.js";
import * as userRepository from "../repositories/user.repository.js";
import { emitToUser } from "../sockets/socket.js";
import AppError from "../utils/AppError.js";

const mapUsersById = (users = []) => {
  return new Map(
    users
      .filter((user) => user?._id)
      .map((user) => [user._id.toString(), user]),
  );
};

export const hydrateConversationPresence = async (conversationData) => {
  if (!conversationData) {
    return conversationData;
  }

  const conversations = Array.isArray(conversationData)
    ? conversationData
    : [conversationData];
  const users = [];

  conversations.forEach((conversation) => {
    if (conversation?.friend) {
      users.push(conversation.friend);
    }

    if (Array.isArray(conversation?.members)) {
      users.push(...conversation.members);
    }
  });

  const hydratedUsers = await userRepository.hydrateUsersPresence(users);
  const userMap = mapUsersById(hydratedUsers);
  const applyConversationUsers = (conversation) => ({
    ...conversation,
    friend: conversation.friend
      ? userMap.get(conversation.friend._id.toString()) || conversation.friend
      : conversation.friend,
    members: Array.isArray(conversation.members)
      ? conversation.members.map(
          (member) => userMap.get(member._id.toString()) || member,
        )
      : conversation.members,
  });

  const hydratedConversations = conversations.map(applyConversationUsers);
  return Array.isArray(conversationData)
    ? hydratedConversations
    : hydratedConversations[0];
};

const withMessagingState = (conversation, friendIds) => {
  if (!conversation) {
    return conversation;
  }

  const canMessage =
    conversation.is_direct && conversation.friend?._id
      ? friendIds.has(conversation.friend._id.toString())
      : true;

  return {
    ...conversation,
    can_message: canMessage,
  };
};

export const getConversationForUser = async (conversationId, userId) => {
  const conversation = await conversationRepo.getConversationByIdAndUserId(
    conversationId,
    userId,
  );

  if (!conversation) {
    return null;
  }

  const hydratedConversation = await hydrateConversationPresence(conversation);
  const friendIds = new Set(await userRepository.getFriendsIds(userId));

  return withMessagingState(hydratedConversation, friendIds);
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
      },
    );

    stream.end(fileBuffer);
  });

  return result.secure_url;
};

export const getConversations = async (userId, page = 1, limit = 20) => {
  const rawConversations = await conversationRepo.getConversationsByUserId(
    userId,
    page,
    limit,
  );
  const conversationsWithPresence =
    await hydrateConversationPresence(rawConversations);
  const friendIds = new Set(await userRepository.getFriendsIds(userId));

  let hasMore = false;
  let conversations = conversationsWithPresence.map((conversation) =>
    withMessagingState(conversation, friendIds),
  );

  if (conversations.length > limit) {
    hasMore = true;
    conversations = conversations.slice(0, limit);
  }

  return {
    conversations,
    hasMore,
    page,
  };
};

export const getOrCreateDirectConversation = async (userId, friendId) => {
  if (userId.toString() === friendId.toString()) {
    throw new AppError("Cannot create a conversation with yourself", 400);
  }

  const user = await userRepository.findProfileById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isFriend = user.friends.some(
    (id) => id.toString() === friendId.toString(),
  );

  if (!isFriend) {
    throw new AppError("You can only message your friends", 403);
  }

  let conversation = await conversationRepo.findDirectConversation(
    userId,
    friendId,
  );

  if (!conversation) {
    conversation = await conversationRepo.createDirectConversation(
      userId,
      friendId,
    );
  }

  const populatedConversation =
    await conversationRepo.getConversationByIdAndUserId(
      conversation._id,
      userId,
    );

  if (!populatedConversation) {
    throw new AppError("Conversation not found", 404);
  }

  const hydratedConversation = await hydrateConversationPresence(
    populatedConversation,
  );

  return withMessagingState(
    hydratedConversation,
    new Set([friendId.toString()]),
  );
};

export const createGroupConversation = async (
  userId,
  groupName,
  memberIds = [],
  avatarBuffer,
) => {
  const creator = await userRepository.findProfileById(userId);

  if (!creator) {
    throw new AppError("User not found", 404);
  }

  if (!groupName || groupName.trim() === "") {
    throw new AppError("Group name is required", 400);
  }

  const uniqueMemberIds = [
    ...new Set(
      memberIds
        .map((memberId) => memberId?.toString())
        .filter((memberId) => memberId && memberId !== userId.toString()),
    ),
  ];

  if (uniqueMemberIds.length < 2) {
    throw new AppError("Select at least 2 friends to create a group", 400);
  }

  const creatorFriendIds = new Set(
    creator.friends.map((friendId) => friendId.toString()),
  );
  const invalidMemberId = uniqueMemberIds.find(
    (memberId) => !creatorFriendIds.has(memberId),
  );

  if (invalidMemberId) {
    throw new AppError("You can only add your friends to a group", 403);
  }

  const groupAvatar = await uploadGroupAvatar(avatarBuffer);
  const conversation = await conversationRepo.createGroupConversation(
    userId,
    groupName.trim(),
    groupAvatar,
    uniqueMemberIds,
  );

  const creatorConversation =
    await conversationRepo.getConversationByIdAndUserId(
      conversation._id,
      userId,
    );

  if (!creatorConversation) {
    throw new AppError("Conversation not found", 404);
  }

  const hydratedCreatorConversation =
    await hydrateConversationPresence(creatorConversation);

  for (const memberId of uniqueMemberIds) {
    const memberConversation =
      await conversationRepo.getConversationByIdAndUserId(
        conversation._id,
        memberId,
      );

    if (memberConversation) {
      const hydratedMemberConversation =
        await hydrateConversationPresence(memberConversation);
      emitToUser(memberId, "conversation:new", {
        conversation: withMessagingState(hydratedMemberConversation, new Set()),
      });
    }
  }

  return withMessagingState(hydratedCreatorConversation, creatorFriendIds);
};

export const resetUnreadCount = async (conversationId, userId) => {
  const member = await conversationRepo.findConversationMember(
    conversationId,
    userId,
  );

  if (!member) {
    throw new AppError("Conversation not found", 404);
  }

  return conversationRepo.resetUnreadCount(conversationId, userId);
};
