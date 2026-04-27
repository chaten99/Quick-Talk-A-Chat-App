import * as messageService from "../services/message.service.js";
import responseHelper from "../utils/response.helper.js";
import AppError from "../utils/AppError.js";

export const getMessages = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;

        const result = await messageService.getMessages(conversationId, req.userId, page, limit);

        return responseHelper.success(res, "Messages retrieved", result);
    } catch (error) {
        next(error);
    }
};

export const sendMessage = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const { content } = req.body;

        if ((!content || content.trim() === "") && !req.file) {
            throw new AppError("Message text or file is required", 400);
        }

        const message = await messageService.sendMessage(
            conversationId,
            req.userId,
            content,
            req.file
        );

        return responseHelper.success(res, "Message sent", message, 201);
    } catch (error) {
        next(error);
    }
};

export const updateMessage = async (req, res, next) => {
    try {
        const { conversationId, messageId } = req.params;
        const { content } = req.body;

        const message = await messageService.updateMessage(
            conversationId,
            messageId,
            req.userId,
            content
        );

        return responseHelper.success(res, "Message updated", message);
    } catch (error) {
        next(error);
    }
};

export const deleteMessage = async (req, res, next) => {
    try {
        const { conversationId, messageId } = req.params;

        const result = await messageService.deleteMessage(
            conversationId,
            messageId,
            req.userId
        );

        return responseHelper.success(res, "Message deleted", result);
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req, res, next) => {
    try {
        const { conversationId } = req.params;

        await messageService.markAsRead(conversationId, req.userId);

        return responseHelper.success(res, "Messages marked as read");
    } catch (error) {
        next(error);
    }
};

export const toggleReaction = async (req, res, next) => {
    try {
        const { conversationId, messageId } = req.params;
        const { emoji } = req.body;

        if (!emoji || typeof emoji !== "string" || emoji.trim() === "") {
            throw new AppError("Emoji is required", 400);
        }

        const message = await messageService.toggleReaction(
            conversationId,
            messageId,
            req.userId,
            emoji
        );

        return responseHelper.success(res, "Reaction updated", message);
    } catch (error) {
        next(error);
    }
};

export const removeReaction = async (req, res, next) => {
    try {
        const { conversationId, messageId } = req.params;

        const message = await messageService.removeReaction(
            conversationId,
            messageId,
            req.userId
        );

        return responseHelper.success(res, "Reaction removed", message);
    } catch (error) {
        next(error);
    }
};

export const getReactions = async (req, res, next) => {
    try {
        const { conversationId, messageId } = req.params;

        const reactions = await messageService.getMessageReactions(
            conversationId,
            messageId,
            req.userId
        );

        return responseHelper.success(res, "Reactions retrieved", reactions);
    } catch (error) {
        next(error);
    }
};
