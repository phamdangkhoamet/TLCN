// back-end/routes/admin.reports.js
import { Router } from "express";
import Report from "../models/Report.js";
import Novel from "../models/Novel.js";
import Chapter from "../models/Chapter.js";
import User from "../models/User.js";
import Author from "../models/Author.js";
import Notification from "../models/Notification.js";

import { requireAdmin } from "../utils/requireAdmin.js";

const router = Router();

/**
 * Helper: Tìm user vi phạm (target user) từ 1 report
 * - type = "novel" | "chapter" => Novel.authorId -> Author.userId (tuỳ schema Author)
 * - type = "other" => không suy ra được user vi phạm => null
 */
async function findTargetUserId(report) {
  try {
    if (
      (report.type === "novel" || report.type === "chapter") &&
      report.novelId
    ) {
      const novel = await Novel.findById(report.novelId)
        .select("authorId")
        .lean();

      if (!novel?.authorId) return null;

      // Nếu Novel.authorId đang trỏ trực tiếp User thì trả thẳng
      // (để an toàn theo nhiều schema khác nhau)
      const maybeUser = await User.findById(novel.authorId).select("_id").lean();
      if (maybeUser?._id) return maybeUser._id;

      // Nếu Novel.authorId trỏ Author, thì lấy Author.userId
      const author = await Author.findById(novel.authorId)
        .select("userId")
        .lean();

      if (author?.userId) return author.userId;

      return null;
    }

    return null;
  } catch (err) {
    console.error("[findTargetUserId] error:", err);
    return null;
  }
}

/**
 * Helper: Gửi cảnh báo (tạo Notification theo schema bạn đưa)
 */
async function sendWarningNotification(userId, report) {
  if (!userId) return;

  try {
    const title = "Cảnh báo vi phạm nội quy";

    const summaryType =
      report.type === "novel"
        ? "tác phẩm"
        : report.type === "chapter"
        ? "chương truyện"
        : "nội dung";

    const contentLines = [
      `Tài khoản của bạn đã bị báo cáo do nghi ngờ vi phạm ở ${summaryType}.`,
      report.reason ? `Lý do: ${report.reason}` : null,
      report.description ? `Mô tả: ${report.description}` : null,
      "Vui lòng rà soát lại nội dung và tuân thủ quy định của hệ thống.",
    ].filter(Boolean);

    await Notification.create({
      userId,
      title,
      content: contentLines.join("\n"),
      type: "warning",
      link: report.novelId ? `/novel/${report.novelId}` : "",
      // createdAt mặc định, read mặc định false theo schema Notification
    });

    console.log(
      "[WARN_USER_NOTIFICATION] created for",
      userId.toString(),
      "reportId=",
      report._id.toString()
    );
  } catch (err) {
    console.error("[sendWarningNotification] error:", err);
  }
}

/**
 * GET /api/admin/reports
 * Query:
 *   - status?: "pending" | "reviewing" | "resolved" | "rejected"
 *   - type?: "novel" | "chapter" | "other"
 */
router.get("/", requireAdmin, async (req, res) => {
  try {
    const { status, type } = req.query;
    const cond = {};

    if (status) cond.status = status;
    if (type) cond.type = type;

    const list = await Report.find(cond).sort({ createdAt: -1 }).lean();
    return res.json({ items: list });
  } catch (err) {
    console.error("[GET /api/admin/reports] error:", err);
    return res.status(500).json({ message: "Không thể tải danh sách báo cáo." });
  }
});

/**
 * GET /api/admin/reports/:id
 */
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id)
      .populate("novelId")
      .populate("userId")      // user báo cáo (nếu có)
      .populate("reviewedBy")
      .lean();

    if (!report) {
      return res.status(404).json({ message: "Không tìm thấy báo cáo." });
    }

    return res.json({ report });
  } catch (err) {
    console.error("[GET /api/admin/reports/:id] error:", err);
    return res.status(500).json({ message: "Không thể tải chi tiết báo cáo." });
  }
});

/**
 * POST /api/admin/reports/:id/action
 * Body: { decision: "warn"|"deleteContent"|"deleteUser"|"reject", adminNote?: string }
 */
router.post("/:id/action", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, adminNote } = req.body || {};

    const allowed = ["warn", "deleteContent", "deleteUser", "reject"];
    if (!decision || !allowed.includes(decision)) {
      return res.status(400).json({ message: "Quyết định xử lý không hợp lệ." });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Không tìm thấy báo cáo." });
    }

    const targetUserId = await findTargetUserId(report);

    let status = "resolved";
    let lastAction = null;

    // ===== MỨC 1: CẢNH BÁO =====
    if (decision === "warn") {
      if (targetUserId) {
        await sendWarningNotification(targetUserId, report);
      }
      // lastAction giữ null theo enum
    }

    // ===== MỨC 2: XOÁ NỘI DUNG VI PHẠM =====
    else if (decision === "deleteContent") {
      lastAction = "delete";

      if (report.type === "novel" && report.novelId) {
        await Chapter.deleteMany({ novelId: report.novelId });
        await Novel.deleteOne({ _id: report.novelId });
      } else if (
        report.type === "chapter" &&
        report.novelId &&
        report.chapterNo != null
      ) {
        await Chapter.deleteOne({
          novelId: report.novelId,
          no: report.chapterNo,
        });
      }
      // type=other: không có content gắn id => chỉ đánh dấu resolved
    }

    // ===== MỨC 3: KHOÁ TÀI KHOẢN =====
    else if (decision === "deleteUser") {
      if (!targetUserId) {
        return res.status(400).json({
          message: "Không tìm được tài khoản vi phạm để khoá.",
        });
      }

      await User.updateOne({ _id: targetUserId }, { status: "suspended" });
      lastAction = "lock";
    }

    // ===== TỪ CHỐI =====
    else if (decision === "reject") {
      status = "rejected";
      lastAction = null;
    }

    report.status = status;
    report.lastAction = lastAction;
    report.adminNote = (adminNote || "").trim();
    report.resolvedAt = new Date();

    // reviewedBy: tuỳ middleware set req.userId hay req.user
    if (req.userId) report.reviewedBy = req.userId;
    else if (req.user?._id) report.reviewedBy = req.user._id;

    await report.save();

    return res.json({ message: "Đã xử lý báo cáo.", report });
  } catch (err) {
    console.error("[POST /api/admin/reports/:id/action] error:", err);
    return res
      .status(500)
      .json({ message: "Có lỗi xảy ra khi xử lý báo cáo." });
  }
});

export default router;
