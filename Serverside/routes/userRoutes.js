import express from "express";
import { getAllUsers, getFriends, getProfile,    searchUsers,    updateProfile } from "../controllers/userController.js";
import multer from "multer";
import path from "path";
import {protect} from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.get("/search", protect, searchUsers);

router.put("/profile", protect, upload.single("profilePic"), updateProfile);
router.get("/profile", protect, getProfile);

router.get("/all", protect, getAllUsers);
router.get("/:id/friends", getFriends);


export default router