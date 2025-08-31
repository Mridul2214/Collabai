import mongoose from "mongoose";

const versionSchema = new mongoose.Schema({
  title: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
});

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // 🆕 Versions array
    versions: [versionSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);
