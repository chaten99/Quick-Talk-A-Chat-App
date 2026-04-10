import { Router } from "express";
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount, clearAll } from "../controllers/notification.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Push and in-app notifications
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get notifications for the authenticated user
 *     description: Returns paginated in-app notifications ordered by newest first.
 *     tags: [Notifications]
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
 *         description: Notifications returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationsResponse'
 */
router.get("/", getNotifications);

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     description: Returns the number of unread notifications for the authenticated user.
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Unread count returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CountResponse'
 */
router.get("/unread-count", getUnreadCount);

/**
 * @swagger
 * /notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark a single notification as read
 *     description: Marks one notification as read if it belongs to the authenticated user.
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.patch("/:notificationId/read", markAsRead);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     description: Marks every notification for the authenticated user as read.
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.patch("/read-all", markAllAsRead);

/**
 * @swagger
 * /notifications/clear-all:
 *   delete:
 *     summary: Delete all notifications
 *     description: Permanently clears every notification belonging to the authenticated user.
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: All notifications cleared
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.delete("/clear-all", clearAll);

export default router;
