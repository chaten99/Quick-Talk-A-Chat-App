import express from "express";
import { getConversations, getOrCreateConversation, resetUnread } from "../controllers/conversation.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getConversations);
router.post("/", getOrCreateConversation);
router.put("/:conversationId/read", resetUnread);

export default router;
