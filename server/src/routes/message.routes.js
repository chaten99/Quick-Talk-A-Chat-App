import express from "express";
import { getMessages, sendMessage, markAsRead } from "../controllers/message.controller.js";
import {  protect } from "../middlewares/auth.middleware.js";

const router = express.Router({ mergeParams: true });

router.use(protect);

router.get("/:conversationId", getMessages);
router.post("/:conversationId", sendMessage);
router.put("/:conversationId/read", markAsRead);

export default router;
