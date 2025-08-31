
import express from "express";
import { createRoom, getWhiteboard, saveStrokes } from "../controllers/boardController.js";

const router = express.Router();

router.post("/create", createRoom);       
router.get("/:boardId", getWhiteboard);   
router.post("/:boardId", saveStrokes);    

export default router;

