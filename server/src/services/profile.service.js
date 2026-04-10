import * as userRepository from "../repositories/user.repository.js";
import cloudinary from "../config/cloudinary.js";
import AppError from "../utils/AppError.js";

export const updateProfile = async (userId, { username }) => {
    const user = await userRepository.findProfileById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    const updated = await userRepository.updateProfile(userId, { username });
    return updated;
};

export const updateAvatar = async (userId, fileBuffer) => {
    const user = await userRepository.findProfileById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "quicktalk/avatars",
                resource_type: "image",
                transformation: [
                    { width: 400, height: 400, crop: "fill", gravity: "face" },
                    { quality: "auto", fetch_format: "auto" },
                ],
            },
            (error, result) => {
                if (error) reject(new AppError("Failed to upload image", 500));
                else resolve(result);
            }
        );
        stream.end(fileBuffer);
    });

    const updated = await userRepository.updateProfile(userId, { avatar: result.secure_url });
    return updated;
};
