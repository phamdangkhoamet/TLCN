// back-end/routes/notifications.js
import { Router } from "express";
import { requireAuth } from "../utils/auth.js"; // dùng middleware auth bạn đang xài
import Notification from "../models/Notification.js";

const r = Router();

/**
 * GET /api/notifications
 * -> danh sách thông báo của user hiện tại
 */
r.get("/", requireAuth, async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    const userId = req.userId;
    const items = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ items });
  } catch (err) {
    console.error("GET /api/notifications error:", err);
    res.status(500).json({ message: "Lỗi tải thông báo." });
  }
});

/**
 * GET /api/notifications/unread-count
 * -> số lượng thông báo chưa đọc
 */
r.get("/unread-count", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const count = await Notification.countDocuments({ userId, read: false });
    res.json({ count });
  } catch (err) {
    console.error("GET /api/notifications/unread-count error:", err);
    res.status(500).json({ message: "Lỗi đếm thông báo chưa đọc." });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * -> đánh dấu 1 thông báo là đã đọc
 */
r.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const n = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );

    if (!n) {
      return res.status(404).json({ message: "Không tìm thấy thông báo." });
    }

    res.json({ message: "Đã đánh dấu đã đọc.", notification: n });
  } catch (err) {
    console.error("PATCH /api/notifications/:id/read error:", err);
    res.status(500).json({ message: "Lỗi cập nhật thông báo." });
  }
});

/**
 * PATCH /api/notifications/read-all
 * -> đánh dấu tất cả thông báo của user là đã đọc
 */
r.patch("/read-all", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );
    res.json({
      message: "Đã đánh dấu tất cả thông báo là đã đọc.",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("PATCH /api/notifications/read-all error:", err);
    res.status(500).json({ message: "Lỗi cập nhật thông báo." });
  }
});

export default r;
