import express from "express";
import {
  createDocument,
  deleteDocument,
  getDocumentById,
  getDocuments,
  updateDocument,
  getDocumentVersions,
  restoreVersion
} from "../controllers/documentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Order matters - specific routes should come before parameterized routes
router.post("/", protect, createDocument);
router.get("/", protect, getDocuments);

// Versioning Routes
router.get("/:id/versions", protect, getDocumentVersions);
router.post("/:id/restore/:versionIndex", protect, restoreVersion);

// Standard CRUD routes
router.get("/:id", protect, getDocumentById);
router.put("/:id", protect, updateDocument);
router.delete("/:id", protect, deleteDocument);

export default router;