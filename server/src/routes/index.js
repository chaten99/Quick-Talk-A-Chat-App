import { Router } from "express";
import authRoutes from "./auth.routes.js"

const router = Router();

router.get("/", (req, res) => {
    res.json({ message: "Welcome to Quick Talk API" });
})
router.use("/auth", authRoutes);

export default router;