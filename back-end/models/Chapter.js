// back-end/models/Chapter.js
import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema({
  novelId: { type: mongoose.Schema.Types.ObjectId, ref: "Novel", index: true },
  no: { type: Number, index: true },
  title: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});

chapterSchema.index({ novelId: 1, no: 1 }, { unique: true });

export default mongoose.model("Chapter", chapterSchema);
