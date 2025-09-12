// routes/analyticsRoutes.js
import express from "express";
import { getAnalytics, trackAnalytics } from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAnalytics);
router.post("/", protect, trackAnalytics);
export default router;