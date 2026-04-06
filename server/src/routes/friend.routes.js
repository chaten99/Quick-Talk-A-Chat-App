import { Router } from "express";
import { searchUsers, sendRequest, acceptRequest, rejectRequest, cancelRequest, getFriends, removeFriend, getPendingRequests } from "../controllers/friend.controller.js";
import { sendRequestValidator, searchValidator } from "../validators/friend.validator.js";
import { validate } from "../middlewares/validation.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/", getFriends);
router.get("/search", searchValidator, validate, searchUsers);
router.get("/requests", getPendingRequests);
router.post("/request", sendRequestValidator, validate, sendRequest);
router.post("/request/:requestId/accept", acceptRequest);
router.post("/request/:requestId/reject", rejectRequest);
router.delete("/request/:requestId", cancelRequest);
router.delete("/:friendId", removeFriend);

export default router;
