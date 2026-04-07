import * as profileService from "../services/profile.service.js";
import responseHelper from "../utils/response.helper.js";
import AppError from "../utils/AppError.js";

export const updateProfile = async (req, res, next) => {
    try {
        const user = await profileService.updateProfile(req.userId, req.body);
        return responseHelper.success(res, "Profile updated successfully", {
            id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            phone: user.phone || "",
            authProvider: user.authProvider,
            friendsCount: user.friends?.length || 0,
            createdAt: user.createdAt,
        });
    } catch (error) {
        next(error);
    }
};

export const updateAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new AppError("No image file provided", 400);
        }

        const user = await profileService.updateAvatar(req.userId, req.file.buffer);
        return responseHelper.success(res, "Avatar updated successfully", {
            id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            phone: user.phone || "",
            authProvider: user.authProvider,
            friendsCount: user.friends?.length || 0,
            createdAt: user.createdAt,
        });
    } catch (error) {
        next(error);
    }
};
