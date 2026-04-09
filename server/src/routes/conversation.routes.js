import express from "express";
import { getConversations, getOrCreateConversation, createGroupConversation, resetUnread } from "../controllers/conversation.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getConversations);
router.post("/", getOrCreateConversation);
router.post("/group", uploadAvatar, createGroupConversation);
router.put("/:conversationId/read", resetUnread);

export default router;
