import { Router } from "express";
import { updateProfile, updateAvatar } from "../controllers/profile.controller.js";
import { updateProfileValidator } from "../validators/profile.validator.js";
import { validate } from "../middlewares/validation.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management
 */

/**
 * @swagger
 * /profile:
 *   put:
 *     summary: Update profile
 *     description: Updates the authenticated user's profile fields that are currently editable.
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
router.put("/", protect, updateProfileValidator, validate, updateProfile);

/**
 * @swagger
 * /profile/avatar:
 *   put:
 *     summary: Update avatar
 *     description: Uploads and replaces the authenticated user's avatar image.
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
router.put("/avatar", protect, uploadAvatar, updateAvatar);

export default router;
