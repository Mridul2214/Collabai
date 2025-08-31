import Whiteboard from "../models/board.js";

// Create a new room (whiteboard)
export const createRoom = async (req, res) => {
  try {
    // Generate a random 6-digit room code
    const roomId = Math.floor(100000 + Math.random() * 900000).toString();

    const board = new Whiteboard({ boardId: roomId });
    await board.save();

    res.json({ roomId });  // frontend gets roomId to share
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get whiteboard by ID
export const getWhiteboard = async (req, res) => {
  try {
    const { boardId } = req.params;
    let board = await Whiteboard.findOne({ boardId });
    if (!board) return res.status(404).json({ message: "Board not found" });

    res.json(board);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Save/update strokes
export const saveStrokes = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { strokes } = req.body;

    const board = await Whiteboard.findOneAndUpdate(
      { boardId },
      { $set: { strokes } },
      { new: true, upsert: true }
    );

    res.json(board);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
