import { Router } from "express";
import authRoutes from "./auth.routes.js"
import friendRoutes from "./friend.routes.js"
import notificationRoutes from "./notification.routes.js"

const router = Router();

router.get("/", (req, res) => {
    res.json({ message: "Welcome to Quick Talk API" });
})
router.use("/auth", authRoutes);
router.use("/friends", friendRoutes);
router.use("/notifications", notificationRoutes);

export default router;