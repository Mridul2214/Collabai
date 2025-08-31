import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  isGroup: {
    type: Boolean,
    default: false,
  },
  chatName: {
    type: String,
    trim: true,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, { timestamps: true });

export default mongoose.model("Chat", chatSchema);
