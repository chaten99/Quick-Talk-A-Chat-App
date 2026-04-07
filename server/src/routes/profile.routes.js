import { Router } from "express";
import { updateProfile, updateAvatar } from "../controllers/profile.controller.js";
import { updateProfileValidator } from "../validators/profile.validator.js";
import { validate } from "../middlewares/validation.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";

const router = Router();

router.put("/", protect, updateProfileValidator, validate, updateProfile);
router.put("/avatar", protect, uploadAvatar, updateAvatar);

export default router;
