import express from "express";
import { sendMessage, allMessages, clearChatMessages } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/:chatId", protect, allMessages);
router.delete("/clear/:chatId", protect, clearChatMessages);


export default router;
