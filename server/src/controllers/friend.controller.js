import * as friendService from "../services/friend.service.js";
import responseHelper from "../utils/response.helper.js";

export const searchUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await friendService.searchUsers(req.query.q, req.userId, page, limit);
        return responseHelper.success(res, "Users found", result);
    } catch (error) {
        next(error);
    }
};

export const sendRequest = async (req, res, next) => {
    try {
        const request = await friendService.sendRequest(req.userId, req.body.receiverId);
        return responseHelper.success(res, "Friend request sent", request, 201);
    } catch (error) {
        next(error);
    }
};

export const acceptRequest = async (req, res, next) => {
    try {
        await friendService.acceptRequest(req.params.requestId, req.userId);
        return responseHelper.success(res, "Friend request accepted");
    } catch (error) {
        next(error);
    }
};

export const rejectRequest = async (req, res, next) => {
    try {
        await friendService.rejectRequest(req.params.requestId, req.userId);
        return responseHelper.success(res, "Friend request rejected");
    } catch (error) {
        next(error);
    }
};

export const cancelRequest = async (req, res, next) => {
    try {
        await friendService.cancelRequest(req.params.requestId, req.userId);
        return responseHelper.success(res, "Friend request cancelled");
    } catch (error) {
        next(error);
    }
};

export const getFriends = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await friendService.getFriends(req.userId, page, limit);
        return responseHelper.success(res, "Friends retrieved", result);
    } catch (error) {
        next(error);
    }
};

export const removeFriend = async (req, res, next) => {
    try {
        await friendService.removeFriend(req.userId, req.params.friendId);
        return responseHelper.success(res, "Friend removed");
    } catch (error) {
        next(error);
    }
};

export const getPendingRequests = async (req, res, next) => {
    try {
        const requests = await friendService.getPendingRequests(req.userId);
        return responseHelper.success(res, "Pending requests retrieved", requests);
    } catch (error) {
        next(error);
    }
};
