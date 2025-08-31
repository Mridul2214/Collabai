import express from "express";
import { accessChat, fetchChats, createGroupChat, addMembersToGroup, leaveGroup } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, accessChat);
router.get("/", protect, fetchChats);
router.post("/group", protect, createGroupChat);
router.post("/chat/group/add", protect, addMembersToGroup);
router.post("/chat/group/leave", protect, leaveGroup);

export default router;
