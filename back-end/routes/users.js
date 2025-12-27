// back-end/routes/users.js
import { Router } from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOtpMail } from "../utils/mailer.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const isDev = process.env.NODE_ENV !== "production";
function dlog(...args) { if (isDev) console.log("[USERS]", ...args); }

// helper tạo OTP 6 số
function genOTP() {
  return String(Math.floor(100000 + Math.random() * 900000)); // "123456"
}

/* =================== USERS LIST (giữ nguyên) =================== */
router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      User.find().skip(skip).limit(limit).lean(),
      User.countDocuments(),
    ]);
    res.json({ page, limit, total, items });
  } catch (err) {
    console.error("GET /users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =================== LOGIN ALIAS (giữ nguyên) =================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = (req.body || {});
    if (!email || !password) return res.status(400).json({ message: "Thiếu email hoặc mật khẩu" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email chưa đăng ký" });
    if (user.status === "suspended") return res.status(403).json({ message: "Tài khoản đã bị tạm khóa" });

    const ok = await bcrypt.compare(password, user.password || "");
    if (!ok) return res.status(400).json({ message: "Sai mật khẩu" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role },
    });
  } catch (err) {
    console.error("POST /users/login error:", err);
    return res.status(500).json({ message: "Server error", detail: isDev ? String(err?.message || err) : undefined });
  }
});

/* =================== ME ALIAS (giữ nguyên) =================== */
router.get("/me", async (req, res) => {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) return res.status(401).json({ message: "Missing token" });
    const token = header.split(" ")[1];
    const payload = jwt.verify(token, JWT_SECRET);
    const u = await User.findById(payload.id).lean();
    if (!u) return res.status(404).json({ message: "User not found" });
    res.json({ id: u._id, name: u.name, email: u.email, avatar: u.avatar, role: u.role });
  } catch (err) {
    console.error("GET /users/me error:", err);
    return res.status(401).json({ message: "Token không hợp lệ", detail: isDev ? String(err?.message || err) : undefined });
  }
});

/* =================== DEBUG (giữ nguyên) =================== */
router.get("/debug/check", async (req, res) => {
  if (!isDev) return res.status(404).end();
  const email = req.query.email;
  if (!email) return res.status(400).json({ message: "Missing email query" });
  const u = await User.findOne({ email }).lean();
  if (!u) return res.status(404).json({ message: "Not found" });
  res.json({ _id: u._id, email: u.email, hasPassword: !!u.password, role: u.role, status: u.status });
});

router.get("/debug/counts", async (_req, res) => {
  if (!isDev) return res.status(404).end();
  const [users, authors, withoutPw] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "author" }),
    User.countDocuments({ $or: [{ password: { $exists: false } }, { password: null }] }),
  ]);
  res.json({ users, authors, usersWithoutPassword: withoutPw });
});

/* =================== UPDATE PROFILE (giữ nguyên) =================== */
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, avatar, password } = req.body;
    const update = {};
    if (name) update.name = name;
    if (email) update.email = email;
    if (avatar) update.avatar = avatar;
    if (password) update.password = await bcrypt.hash(password, 10);

    const user = await User.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role });
  } catch (err) {
    console.error("PUT /users/:id error:", err);
    res.status(500).json({ message: "Server error", detail: String(err.message || err) });
  }
});

/* =================== FORGOT PASSWORD FLOW (đã fix) =================== */

// POST /api/users/forgot — nhận email, tạo OTP, gửi mail
router.post("/forgot", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "Thiếu email" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email không tồn tại" });

    const otp = genOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    user.resetOtpHash = otpHash;
    user.resetOtpExpires = expires;
    await user.save();

    await sendOtpMail(email, otp);            // <— quan trọng: 'to' là email người dùng
    if (isDev) dlog("FORGOT OTP:", otp, "sent->", email);

    return res.json({ message: "Đã gửi OTP. Vui lòng kiểm tra email." });
  } catch (err) {
    console.error("POST /users/forgot Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/users/forgot/verify — nhận email + otp, trả resetToken
router.post("/forgot/verify", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const otp = String(req.body?.otp || "").trim();
    if (!email || !otp) return res.status(400).json({ message: "Thiếu email hoặc OTP" });

    const user = await User.findOne({ email });
    if (!user || !user.resetOtpHash || !user.resetOtpExpires) {
      return res.status(400).json({ message: "OTP không hợp lệ" });
    }
    if (user.resetOtpExpires < new Date()) {
      return res.status(400).json({ message: "OTP đã hết hạn" });
    }

    const ok = await bcrypt.compare(otp, user.resetOtpHash || "");
    if (!ok) return res.status(400).json({ message: "OTP không đúng" });

    const resetToken = jwt.sign({ id: user._id, email }, JWT_SECRET, { expiresIn: "15m" });
    return res.json({ resetToken });
  } catch (err) {
    console.error("POST /users/forgot/verify Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/users/forgot/reset — nhận resetToken + newPassword
router.post("/forgot/reset", async (req, res) => {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) return res.status(400).json({ message: "Thiếu token hoặc mật khẩu mới" });

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(400).json({ message: "Token đặt lại không hợp lệ/hết hạn" });
    }

    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtpHash = null;
    user.resetOtpExpires = null;
    await user.save();

    return res.json({ message: "Đặt lại mật khẩu thành công" });
  } catch (err) {
    console.error("POST /users/forgot/reset Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* Ping route để bạn test nhanh */
router.get("/forgot/ping", (_req, res) => res.json({ ok: true }));

export default router;
