import { Router } from "express";
import authRoutes from "./auth.routes.js"
import friendRoutes from "./friend.routes.js"
import notificationRoutes from "./notification.routes.js"
import profileRoutes from "./profile.routes.js"
import conversationRoutes from "./conversation.routes.js"
import messageRoutes from "./message.routes.js"

const router = Router();

router.get("/health", (req, res) => {
    res.json({ message: "Welcome to Quick Talk API", status: "OK", uptime: process.uptime() });
})
router.use("/auth", authRoutes);
router.use("/friends", friendRoutes);
router.use("/notifications", notificationRoutes);
router.use("/profile", profileRoutes);
router.use("/conversations", conversationRoutes);
router.use("/messages", messageRoutes);

export default router;