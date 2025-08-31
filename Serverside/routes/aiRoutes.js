import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { chatWithAI, clearChatHistory, getChatHistory } from '../controllers/aiController.js';

const router = express.Router();

router.post('/',protect,chatWithAI);
router.get('/history', protect, getChatHistory);
router.delete("/history",protect,clearChatHistory)

export default router;