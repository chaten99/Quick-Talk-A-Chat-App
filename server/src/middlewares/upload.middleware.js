import multer from "multer";
import AppError from "../utils/AppError.js";

const AVATAR_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MESSAGE_FILE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "application/pdf"
];
const AVATAR_MAX_SIZE = 5 * 1024 * 1024;
const MESSAGE_MAX_SIZE = 25 * 1024 * 1024;

const storage = multer.memoryStorage();

const createFileFilter = (allowedTypes, errorMessage) => (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError(errorMessage, 400), false);
    }
};

export const uploadAvatar = multer({
    storage,
    fileFilter: createFileFilter(
        AVATAR_TYPES,
        "Only JPG, JPEG, PNG, and WebP images are allowed"
    ),
    limits: { fileSize: AVATAR_MAX_SIZE },
}).single("avatar");

export const uploadMessageAttachment = multer({
    storage,
    fileFilter: createFileFilter(
        MESSAGE_FILE_TYPES,
        "Only images, MP4, WebM, MOV videos, and PDF files are allowed"
    ),
    limits: { fileSize: MESSAGE_MAX_SIZE },
}).single("file");
