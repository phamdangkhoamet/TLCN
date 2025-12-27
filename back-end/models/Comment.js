import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  novelId: { type: mongoose.Schema.Types.ObjectId, ref: "Novel", index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: String,
  userAvatar: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Comment", commentSchema);
