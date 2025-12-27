// back-end/utils/requireAuth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ message: "Bạn chưa đăng nhập." });
    }

    const secret = process.env.JWT_SECRET || "secret-key";
    const payload = jwt.verify(token, secret);

    // Chuẩn hoá userId trong req
    const userId = payload.id || payload._id || payload.userId;
    if (!userId) {
      return res.status(401).json({ message: "Token không hợp lệ." });
    }

    req.userId = userId;

    // (Tuỳ chọn) load luôn user để dùng phía sau
    const user = await User.findById(userId).select("_id name email role");
    if (!user) {
      return res.status(401).json({ message: "Tài khoản không tồn tại." });
    }
    req.user = user;

    next();
  } catch (err) {
    console.error("requireAuth error:", err);
    return res.status(401).json({ message: "Xác thực thất bại." });
  }
}
