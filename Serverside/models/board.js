
import mongoose from "mongoose";

const WhiteboardSchema = new mongoose.Schema({
  boardId: { type: String, required: true, unique: true },
  strokes: { type: Array, default: [] }, // each stroke: {x,y,color,size,path[]}
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Whiteboard", WhiteboardSchema);
