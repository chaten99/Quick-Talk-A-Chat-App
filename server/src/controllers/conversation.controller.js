import * as conversationService from "../services/conversation.service.js";
import responseHelper from "../utils/response.helper.js";
import AppError from "../utils/AppError.js";

export const getConversations = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const result = await conversationService.getConversations(req.userId, page, limit);

        return responseHelper.success(res, "Conversations retrieved", result);
    } catch (error) {
        next(error);
    }
};

export const getOrCreateConversation = async (req, res, next) => {
    try {
        const { friendId } = req.body;
        
        if (!friendId) {
            throw new AppError("Friend ID is required", 400);
        }

        const conversation = await conversationService.getOrCreateDirectConversation(req.userId, friendId);

        return responseHelper.success(res, "Conversation retrieved or created", conversation);
    } catch (error) {
        next(error);
    }
};

export const createGroupConversation = async (req, res, next) => {
    try {
        const { groupName, memberIds } = req.body;

        if (!groupName) {
            throw new AppError("Group name is required", 400);
        }

        let parsedMemberIds = memberIds;

        if (typeof parsedMemberIds === "string") {
            try {
                parsedMemberIds = JSON.parse(parsedMemberIds);
            } catch {
                parsedMemberIds = parsedMemberIds.split(",").map((memberId) => memberId.trim()).filter(Boolean);
            }
        }

        if (!Array.isArray(parsedMemberIds)) {
            throw new AppError("Member IDs are required", 400);
        }

        const conversation = await conversationService.createGroupConversation(
            req.userId,
            groupName,
            parsedMemberIds,
            req.file?.buffer
        );

        return responseHelper.success(res, "Group created successfully", conversation, 201);
    } catch (error) {
        next(error);
    }
};

export const resetUnread = async (req, res, next) => {
    try {
        const { conversationId } = req.params;

        await conversationService.resetUnreadCount(conversationId, req.userId);

        return responseHelper.success(res, "Unread count reset successfully");
    } catch (error) {
        next(error);
    }
};
