import express from "express";
import {
    deleteMessage,
    getMessages,
    markAsRead,
    sendMessage,
    updateMessage
} from "../controllers/message.controller.js";
import {  protect } from "../middlewares/auth.middleware.js";
import { uploadMessageAttachment } from "../middlewares/upload.middleware.js";

const router = express.Router({ mergeParams: true });

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Message and Chat management
 */

/**
 * @swagger
 * /messages/{conversationId}:
 *   get:
 *     summary: Get messages for a conversation
 *     description: Returns paginated messages for a conversation if the authenticated user is a member of it.
 *     tags: [Messages]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Messages returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageListResponse'
 */
router.get("/:conversationId", getMessages);

/**
 * @swagger
 * /messages/{conversationId}:
 *   post:
 *     summary: Send a message
 *     description: Sends a text message to a direct or group conversation.
 *     tags: [Messages]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageRequest'
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       403:
 *         description: User is not allowed to message this conversation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/:conversationId", uploadMessageAttachment, sendMessage);

router.patch("/:conversationId/:messageId", updateMessage);

router.delete("/:conversationId/:messageId", deleteMessage);

/**
 * @swagger
 * /messages/{conversationId}/read:
 *   put:
 *     summary: Mark conversation messages as read
 *     description: Marks unread messages as read for the authenticated user and updates seen state for group messages.
 *     tags: [Messages]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.put("/:conversationId/read", markAsRead);

export default router;
