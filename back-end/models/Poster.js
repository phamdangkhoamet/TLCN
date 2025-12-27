import mongoose from "mongoose";

const PosterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      default: "/home",
      trim: true,
    },
    order: {
      type: Number,
      default: 0, // dùng để sắp xếp hiển thị
    },
  },
  {
    timestamps: true, // tự động thêm createdAt, updatedAt
    collection: "posters", // tên collection trong MongoDB
  }
);

export default mongoose.model("Poster", PosterSchema);
