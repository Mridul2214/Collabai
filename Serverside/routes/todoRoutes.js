import express from "express";
import { createTask, deleteTask, getTasks, updateTask } from "../controllers/todoController.js";
import { protect } from "../middleware/authMiddleware.js";


const router=express.Router();

router.get("/",protect,getTasks);
router.post("/",protect,createTask);
router.put("/:id",protect,updateTask);
router.delete("/:id",protect,deleteTask);

export default router;