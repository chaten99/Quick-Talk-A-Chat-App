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

        if (!content || content.trim() === "") {
            throw new AppError("Content is required", 400);
        }

        const message = await messageService.sendMessage(conversationId, req.userId, content.trim());

        return responseHelper.success(res, "Message sent", message, 201);
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
