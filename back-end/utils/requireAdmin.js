// utils/requireAdmin.js
import User from "../models/User.js";
import { getUserId } from "./auth.js";

export async function requireAdmin(req, res, next) {
  try {
    const uid = getUserId(req);

    if (!uid) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const user = await User.findById(uid);

    if (!user) {
      return res.status(401).json({ message: "Không tìm thấy user" });
    }

    // Gắn user vào request để dùng sau
    req.user = user;
    req.userId = user._id;         


    if (user.role !== "admin") {
      return res.status(403).json({ message: "Không có quyền admin" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
