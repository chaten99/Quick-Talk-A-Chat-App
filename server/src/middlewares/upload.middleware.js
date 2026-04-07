import multer from "multer";
import AppError from "../utils/AppError.js";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError("Only JPG, JPEG, PNG, and WebP images are allowed", 400), false);
    }
};

export const uploadAvatar = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_SIZE },
}).single("avatar");
