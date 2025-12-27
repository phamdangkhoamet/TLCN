// back-end/config/db.js
import mongoose from "mongoose";

export async function connectDB(uriOverride) {
  const uri = uriOverride || process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI in environment variables.");
  }

  // Che thông tin user:pass khi log
  const masked = uri.replace(/\/\/.*@/, "//***:***@");
  console.log("[DB] Connecting:", masked);

  await mongoose.connect(uri, {
    // Tối ưu khi dev / seed
    serverSelectionTimeoutMS: 8000,
    maxPoolSize: 10,
  });

  console.log("[DB] Connected");

  // Gợi ý log lỗi runtime (không ảnh hưởng chức năng cũ)
  mongoose.connection.on("error", (err) => {
    console.error("[DB] Runtime error:", err?.message || err);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("[DB] Disconnected");
  });
}

// Giữ default export để tương thích import connectDB from "./config/db.js"
export default connectDB;
