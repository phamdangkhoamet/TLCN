// back-end/routes/admin.authors.js
import { Router } from "express";
import User from "../models/User.js";

const r = Router();

/**
 * GET /api/admin/authors
 * → Trả về danh sách người dùng để chọn làm "tác giả"
 *   (lấy tất cả user, không lọc role)
 */
r.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ name: 1 }); // có thể .find({ status: "active" }) nếu muốn

    res.json({
      items: users,
      total: users.length,
    });
  } catch (err) {
    console.error("GET /api/admin/authors error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default r;
