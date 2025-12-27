import mongoose from "mongoose";

const followSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "Author", index: true },
  createdAt: { type: Date, default: Date.now }
});

followSchema.index({ userId: 1, authorId: 1 }, { unique: true });

export default mongoose.model("Follow", followSchema);
