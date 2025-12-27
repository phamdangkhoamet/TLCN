import mongoose from "mongoose";

const authorSchema = new mongoose.Schema({
  name: { type: String, index: true },
  avatar: String,
  country: String,
  genres: [String],
  booksCount: Number,
  rating: Number,
  followers: { type: Number, default: 0 },
  bio: String,
  topBooks: [String],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

export default mongoose.model("Author", authorSchema);
