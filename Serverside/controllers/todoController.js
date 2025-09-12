// import Todo from "../models/Todo.js";

// export const getTasks=async(req,res)=>{
//     try {
// const tasks = await Todo.find({ userId: req.user._id }).sort({ createdAt: -1 })
//         .sort({createdAt:-1});
//         res.json(tasks);
//     } catch (error) {
//         res.status(500).json({message:error.message});
//     }
// };



// export const createTask = async (req, res) => {
//   try {
//     const { title } = req.body;
//     const task = new Todo({ title, userId: req.user._id });
//     await task.save();
//     res.status(201).json(task);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };



// export const updateTask = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const task = await Todo.findOneAndUpdate(
//       { _id: id, userId: req.user._id },
//       req.body, 
//       { new: true }
//     );
//     res.json(task);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };



// export const deleteTask = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Todo.findOneAndDelete({ _id: id, userId: req.user._id });
//     res.json({ message: "Task deleted" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
import Todo from "../models/Todo.js";
import { trackActivity } from "../utils/analyticstracker.js"; // make sure this exists

// 📌 Get all tasks
export const getTasks = async (req, res) => {
  try {
    // Track user visiting the todo list
    await trackActivity(req.user._id, "site_visit", {
      section: "todo_list",
    });

    const tasks = await Todo.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error("Error in getTasks:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📌 Create new task
export const createTask = async (req, res) => {
  try {
    const { title } = req.body;
    const task = new Todo({ title, userId: req.user._id });
    await task.save();

    // Track creation
    await trackActivity(req.user._id, "todo_update", {
      action: "create",
      todoId: task._id,
      title: task.title,
      status: task.status,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Error in createTask:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📌 Update task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const oldTask = await Todo.findById(id);
    if (!oldTask) return res.status(404).json({ message: "Task not found" });

    const task = await Todo.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      req.body,
      { new: true }
    );

    // Track update
    await trackActivity(req.user._id, "todo_update", {
      action: "update",
      todoId: task._id,
      title: task.title,
      previousStatus: oldTask.status,
      newStatus: task.status,
    });

    res.json(task);
  } catch (error) {
    console.error("Error in updateTask:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📌 Delete task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Todo.findOne({ _id: id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Track deletion
    await trackActivity(req.user._id, "todo_update", {
      action: "delete",
      todoId: task._id,
      title: task.title,
      status: task.status,
    });

    await task.deleteOne();

    res.json({ message: "Task deleted" });
  } catch (error) {
    console.error("Error in deleteTask:", error);
    res.status(500).json({ message: error.message });
  }
};
