// back-end/routes/reports.js
import { Router } from "express";
import Report from "../models/Report.js";
import Novel from "../models/Novel.js";
import Chapter from "../models/Chapter.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";

import requireAuth from "../utils/requireAuth.js";

const router = Router();

/**
 * POST /api/reports
 * User gửi báo cáo vi phạm:
 *  - type: "novel" | "chapter" | "comment" | "other"
 *  - novelId?: when type = "novel" | "chapter"
 *  - chapterNo?: when type = "chapter"
 *  - commentId?: when type = "comment"
 *  - reason: string (bắt buộc)
 *  - description?: string
 *  - attachments?: [{ name, url }]
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      type,
      novelId,
      chapterNo,
      commentId,
      reason,
      description,
      attachments = [],
    } = req.body || {};

    // 1. Validate type
    const allowedTypes = ["novel", "chapter", "comment", "other"];
    if (!type || !allowedTypes.includes(type)) {
      return res
        .status(400)
        .json({ message: "Loại báo cáo không hợp lệ." });
    }

    // 2. Validate reason
    if (!reason || !reason.trim()) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập lý do báo cáo." });
    }

    // 3. Kiểm tra mục tiêu tuỳ theo type
    if (type === "novel") {
      if (!novelId) {
        return res
          .status(400)
          .json({ message: "Thiếu mã truyện (novelId) cho báo cáo truyện." });
      }
      const novel = await Novel.findById(novelId).lean();
      if (!novel) {
        return res.status(404).json({ message: "Không tìm thấy truyện." });
      }
    }

    if (type === "chapter") {
      if (!novelId || chapterNo == null) {
        return res.status(400).json({
          message: "Thiếu novelId hoặc chapterNo cho báo cáo chương.",
        });
      }

      const chapter = await Chapter.findOne({
        novelId,
        no: Number(chapterNo),
      }).lean();
      if (!chapter) {
        return res.status(404).json({ message: "Không tìm thấy chương." });
      }
    }

    if (type === "comment") {
      if (!commentId) {
        return res
          .status(400)
          .json({ message: "Thiếu commentId cho báo cáo bình luận." });
      }
      const cmt = await Comment.findById(commentId).lean();
      if (!cmt) {
        return res.status(404).json({ message: "Không tìm thấy bình luận." });
      }
    }

    // 4. Ghi nhận báo cáo
    const report = await Report.create({
      type,
      novelId: novelId || undefined,
      chapterNo:
        type === "chapter" && chapterNo != null
          ? Number(chapterNo)
          : undefined,
      commentId: type === "comment" ? commentId : undefined,
      reason: reason.trim(),
      description: description?.trim() || "",
      attachments: Array.isArray(attachments) ? attachments : [],
      userId: req.user?._id || req.userId || null, // tuỳ middleware set gì
      status: "pending",
    });

    return res.status(201).json({
      message: "Đã gửi báo cáo vi phạm. Cảm ơn bạn đã đóng góp.",
      report,
    });
  } catch (err) {
    console.error("[POST /api/reports] error:", err);
    return res.status(500).json({
      message: "Có lỗi xảy ra khi gửi báo cáo.",
    });
  }
});

/**
 * GET /api/reports
 * User xem lịch sử các báo cáo mình đã gửi
 * Query:
 *  - status?: "pending" | "reviewing" | "resolved" | "rejected" | "all"
 *  - type?: "novel" | "chapter" | "comment" | "other" | "all"
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const { status, type } = req.query;

    const cond = {
      userId: req.user?._id || req.userId,
    };

    if (!cond.userId) {
      return res.status(401).json({ message: "Không xác định được tài khoản." });
    }

    if (status && status !== "all") {
      cond.status = status;
    }

    if (type && type !== "all") {
      cond.type = type;
    }

    const list = await Report.find(cond)
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ items: list });
  } catch (err) {
    console.error("[GET /api/reports] error:", err);
    return res.status(500).json({
      message: "Không thể tải danh sách báo cáo.",
    });
  }
});

export default router;
