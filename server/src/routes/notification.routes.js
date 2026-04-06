import { Router } from "express";
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount, clearAll } from "../controllers/notification.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/:notificationId/read", markAsRead);
router.patch("/read-all", markAllAsRead);
router.delete("/clear-all", clearAll);

export default router;
