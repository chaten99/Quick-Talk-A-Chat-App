import express from "express";
import {
  addGroupMembers,
  createGroupConversation,
  getConversations,
  getOrCreateConversation,
  removeGroupMember,
  resetUnread,
} from "../controllers/conversation.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Conversations
 *   description: Conversation and Group Chat management
 */

/**
 * @swagger
 * /conversations:
 *   get:
 *     summary: Get conversations for the authenticated user
 *     description: Returns direct and group conversations with unread counts, last message, friend/group info, and pagination metadata.
 *     tags: [Conversations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for paginated conversation results.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of conversations to return per page.
 *     responses:
 *       200:
 *         description: Conversation list returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConversationListResponse'
 */
router.get("/", getConversations);

/**
 * @swagger
 * /conversations:
 *   post:
 *     summary: Get or create a direct conversation
 *     description: Finds the existing direct chat with the given friend or creates one if it does not exist.
 *     tags: [Conversations]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DirectConversationRequest'
 *     responses:
 *       200:
 *         description: Direct conversation returned or created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConversationResponse'
 *       403:
 *         description: Users are not friends
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", getOrCreateConversation);

/**
 * @swagger
 * /conversations/group:
 *   post:
 *     summary: Create a new group conversation
 *     description: Creates a group chat with a name, optional avatar, and selected friend members.
 *     tags: [Conversations]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - groupName
 *               - memberIds
 *             properties:
 *               groupName:
 *                 type: string
 *                 example: Weekend Plans
 *               memberIds:
 *                 oneOf:
 *                   - type: array
 *                     items:
 *                       type: string
 *                   - type: string
 *                 description: Array of friend IDs or a JSON stringified array of friend IDs.
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConversationResponse'
 */
router.post("/group", uploadAvatar, createGroupConversation);

/**
 * @swagger
 * /conversations/{conversationId}/members:
 *   post:
 *     summary: Add members to a group conversation
 *     description: Adds one or more existing friends to a group conversation.
 *     tags: [Conversations]
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
 *             $ref: '#/components/schemas/AddGroupMembersRequest'
 *     responses:
 *       200:
 *         description: Members added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConversationResponse'
 */
router.post("/:conversationId/members", addGroupMembers);

/**
 * @swagger
 * /conversations/{conversationId}/members/{userId}:
 *   delete:
 *     summary: Remove a member from a group
 *     description: Removes a member from the group. This can also be used by a user to leave a group if allowed by the service rules.
 *     tags: [Conversations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConversationResponse'
 */
router.delete("/:conversationId/members/:userId", removeGroupMember);

/**
 * @swagger
 * /conversations/{conversationId}/read:
 *   put:
 *     summary: Reset unread count for a conversation
 *     description: Sets the unread count for the authenticated user's conversation membership to zero.
 *     tags: [Conversations]
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
 *         description: Unread count reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.put("/:conversationId/read", resetUnread);

export default router;
