// back-end/utils/auth.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

/** Lấy userId từ header Authorization: Bearer <token> */
export function getUserId(req) {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) return null;
    const token = header.split(" ")[1];
    const payload = jwt.verify(token, JWT_SECRET);
    return payload?.id || payload?._id || null;
  } catch {
    return null;
  }
}

/** Middleware bắt buộc đăng nhập: gán req.userId */
export function requireAuth(req, res, next) {
  const uid = getUserId(req);
  if (!uid) return res.status(401).json({ message: "Unauthorized" });
  req.userId = uid;
  next();
}
