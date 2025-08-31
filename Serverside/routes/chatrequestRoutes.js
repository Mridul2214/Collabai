import express from "express";
import { fetchRequests, sendRequest, respondRequest } from "../controllers/chatrequestController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, fetchRequests);
router.post("/send", protect, sendRequest);
router.post("/respond", protect, respondRequest);

export default router;
