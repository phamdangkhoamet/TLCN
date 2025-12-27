import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  novelId: { type: mongoose.Schema.Types.ObjectId, ref: "Novel", index: true },
  createdAt: { type: Date, default: Date.now }
});

favoriteSchema.index({ userId: 1, novelId: 1 }, { unique: true });

export default mongoose.model("Favorite", favoriteSchema);
