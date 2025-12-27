import { Router } from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { requireAdmin } from "../utils/requireAdmin.js"; // cần middleware admin

const router = Router();

/**
 * GET /api/admin/users
 * - Lấy toàn bộ user (có phân trang nếu muốn)
 */
router.get("/", requireAdmin, async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ users });
});

/**
 * POST /api/admin/users
 * - Thêm user mới
 */
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { name, email, password, avatar, role, status, isVip, vipUntil } =
      req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Thiếu name, email, password" });

    const exist = await User.findOne({ email });
    if (exist)
      return res.status(400).json({ message: "Email đã tồn tại" });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hash,
      avatar,
      role: role || "user",
      status: status || "active",
      isVip: !!isVip,
      vipUntil: vipUntil ? new Date(vipUntil) : null,
    });

    res.json({ ok: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * PUT /api/admin/users/:id
 * - Cập nhật user
 */
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const data = { ...req.body };

    // Nếu cập nhật password thì phải hash
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      delete data.password;
    }

    if (data.vipUntil) data.vipUntil = new Date(data.vipUntil);

    const user = await User.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    res.json({ ok: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /api/admin/users/:id
 */
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
