import mongoose from "mongoose";

const novelSchema = new mongoose.Schema({
  title: { type: String, index: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "Author" },
  authorName: String,
  genre: { type: String, index: true },
  cover: String,
  description: String,
  chaptersCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Novel", novelSchema);
