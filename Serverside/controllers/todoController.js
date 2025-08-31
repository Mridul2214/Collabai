import Todo from "../models/Todo.js";

export const getTasks=async(req,res)=>{
    try {
const tasks = await Todo.find({ userId: req.user._id }).sort({ createdAt: -1 })
        .sort({createdAt:-1});
        res.json(tasks);
    } catch (error) {
        res.status(500).json({message:error.message});
    }
};



export const createTask = async (req, res) => {
  try {
    const { title } = req.body;
    const task = new Todo({ title, userId: req.user._id });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Todo.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      req.body, 
      { new: true }
    );
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await Todo.findOneAndDelete({ _id: id, userId: req.user._id });
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};