// models/analyticsModel.js
import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  activityType: {
    type: String,
    required: true,
    enum: ["ai_chat", "document_edit", "todo_update", "whiteboard_edit", "site_visit"]
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
activitySchema.index({ userId: 1, timestamp: 1 });
activitySchema.index({ activityType: 1, timestamp: 1 });

export default mongoose.model("Analytics", activitySchema);