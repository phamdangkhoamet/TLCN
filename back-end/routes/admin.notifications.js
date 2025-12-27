// back-end/routes/admin.notifications.js
import { Router } from "express";
import { requireAdmin } from "../utils/requireAdmin.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

const r = Router();

/**
 * GET /api/admin/notifications?userId=&page=&pageSize=
 * Xem danh sách thông báo (có thể lọc theo userId)
 */
r.get("/", requireAdmin, async (req, res) => {
  try {
    const { userId } = req.query;
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 20;
    const skip = (page - 1) * pageSize;

    const cond = {};
    if (userId) cond.userId = userId;

    const [items, total] = await Promise.all([
      Notification.find(cond)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate("userId", "name email"),
      Notification.countDocuments(cond),
    ]);

    res.json({
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (err) {
    console.error("GET /api/admin/notifications error:", err);
    res.status(500).json({ message: "Lỗi tải danh sách thông báo." });
  }
});

/**
 * POST /api/admin/notifications
 * body: { userId?, sendToAll?, title, content, type?, link? }
 */
r.post("/", requireAdmin, async (req, res) => {
  try {
    const { userId, sendToAll, title, content, type, link } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Thiếu tiêu đề hoặc nội dung." });
    }

    // Gửi cho tất cả người dùng
    if (sendToAll) {
      const users = await User.find({});
      if (!users.length) {
        return res
          .status(400)
          .json({ message: "Không có người dùng nào để gửi." });
      }

      const docs = users.map((u) => ({
        userId: u._id,
        title,
        content,
        type,
        link,
      }));

      const inserted = await Notification.insertMany(docs);
      return res.status(201).json({
        message: "Đã gửi thông báo đến tất cả người dùng.",
        count: inserted.length,
      });
    }

    // Gửi cho 1 user cụ thể
    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId." });
    }

    const noti = await Notification.create({
      userId,
      title,
      content,
      type,
      link,
    });

    res.status(201).json({
      message: "Đã gửi thông báo.",
      notification: noti,
    });
  } catch (err) {
    console.error("POST /api/admin/notifications error:", err);
    res.status(500).json({ message: "Lỗi gửi thông báo." });
  }
});

/**
 * DELETE /api/admin/notifications/:id
 * Xóa 1 thông báo
 */
r.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.deleteOne({ _id: id });
    res.json({ message: "Đã xóa thông báo." });
  } catch (err) {
    console.error("DELETE /api/admin/notifications/:id error:", err);
    res.status(500).json({ message: "Lỗi xóa thông báo." });
  }
});

export default r;
