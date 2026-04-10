import { Router } from "express";
import { searchUsers, sendRequest, acceptRequest, rejectRequest, cancelRequest, getFriends, removeFriend, getPendingRequests } from "../controllers/friend.controller.js";
import { sendRequestValidator, searchValidator } from "../validators/friend.validator.js";
import { validate } from "../middlewares/validation.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Friends
 *   description: Friend and Friend Request management
 */

/**
 * @swagger
 * /friends:
 *   get:
 *     summary: Get the authenticated user's friends
 *     description: Returns the current user's friends with pagination and live presence fields.
 *     tags: [Friends]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Friends list returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendsResponse'
 */
router.get("/", getFriends);

/**
 * @swagger
 * /friends/search:
 *   get:
 *     summary: Search users
 *     description: Searches users by username, email, or phone while excluding the current user.
 *     tags: [Friends]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search text for username, email, or phone.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Matching users returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchUsersResponse'
 */
router.get("/search", searchValidator, validate, searchUsers);

/**
 * @swagger
 * /friends/requests:
 *   get:
 *     summary: Get pending friend requests
 *     description: Returns pending friend requests received by the authenticated user.
 *     tags: [Friends]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Pending requests returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendRequestListResponse'
 */
router.get("/requests", getPendingRequests);

/**
 * @swagger
 * /friends/request:
 *   post:
 *     summary: Send a friend request
 *     description: Sends a new friend request to another user if there is no existing friendship or pending request.
 *     tags: [Friends]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendFriendRequestRequest'
 *     responses:
 *       201:
 *         description: Friend request sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendRequestResponse'
 *       400:
 *         description: Invalid request or already friends
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/request", sendRequestValidator, validate, sendRequest);

/**
 * @swagger
 * /friends/request/{requestId}/accept:
 *   post:
 *     summary: Accept a friend request
 *     description: Accepts a pending friend request and adds both users to each other's friend list.
 *     tags: [Friends]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friend request accepted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post("/request/:requestId/accept", acceptRequest);

/**
 * @swagger
 * /friends/request/{requestId}/reject:
 *   post:
 *     summary: Reject a friend request
 *     description: Rejects a pending friend request. The sender may need to wait before sending another request.
 *     tags: [Friends]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friend request rejected
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post("/request/:requestId/reject", rejectRequest);

/**
 * @swagger
 * /friends/request/{requestId}:
 *   delete:
 *     summary: Cancel a sent friend request
 *     description: Cancels a pending friend request sent by the authenticated user.
 *     tags: [Friends]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friend request cancelled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.delete("/request/:requestId", cancelRequest);

/**
 * @swagger
 * /friends/{friendId}:
 *   delete:
 *     summary: Remove a friend
 *     description: Removes the target user from the authenticated user's friend list and vice versa.
 *     tags: [Friends]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friend removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.delete("/:friendId", removeFriend);

export default router;
