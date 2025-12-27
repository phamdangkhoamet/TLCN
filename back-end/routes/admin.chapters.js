// back-end/routes/admin.chapters.js
import { Router } from "express";
import { requireAdmin } from "../utils/requireAdmin.js";
import Chapter from "../models/Chapter.js";
import Novel from "../models/Novel.js";

const r = Router();

/**
 * GET /api/admin/chapters?novelId=&page=&pageSize=
 * - Nếu có novelId: chỉ lấy chương của 1 truyện
 * - Nếu không có: lấy tất cả chương (dùng cho admin tổng quát)
 */
r.get("/", requireAdmin, async (req, res) => {
  try {
    const { novelId } = req.query;
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 50;
    const skip = (page - 1) * pageSize;

    const cond = {};
    if (novelId) cond.novelId = novelId;

    const [items, total] = await Promise.all([
      Chapter.find(cond)
        .sort({ novelId: 1, no: 1 })
        .skip(skip)
        .limit(pageSize),
      Chapter.countDocuments(cond),
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
    console.error("GET /api/admin/chapters error:", err);
    res.status(500).json({ message: "Lỗi tải danh sách chương" });
  }
});

/**
 * POST /api/admin/chapters
 * body: { novelId, no?, title, content }
 * - Nếu no trống hoặc trùng → tự động set no = max(no) + 1
 */
r.post("/", requireAdmin, async (req, res) => {
  try {
    const { novelId, no, title, content } = req.body;
    if (!novelId) {
      return res.status(400).json({ message: "Thiếu novelId." });
    }

    let chapterNo = parseInt(no, 10);
    if (!chapterNo || Number.isNaN(chapterNo) || chapterNo <= 0) {
      chapterNo = null;
    }

    // Nếu không truyền no hoặc no bị trùng → lấy max(no) + 1
    if (!chapterNo) {
      const last = await Chapter.findOne({ novelId }).sort({ no: -1 });
      chapterNo = last ? last.no + 1 : 1;
    } else {
      const dup = await Chapter.findOne({ novelId, no: chapterNo });
      if (dup) {
        const last = await Chapter.findOne({ novelId }).sort({ no: -1 });
        chapterNo = last ? last.no + 1 : chapterNo + 1;
      }
    }

    const chapter = await Chapter.create({
      novelId,
      no: chapterNo,
      title: title || `Chương ${chapterNo}`,
      content: content || "",
    });

    // Cập nhật lại chaptersCount của Novel
    await Novel.updateOne(
      { _id: novelId },
      { $max: { chaptersCount: chapterNo } }
    );

    res.status(201).json({
      message: "Tạo chương mới thành công.",
      chapter,
    });
  } catch (err) {
    if (err.code === 11000) {
      // Phòng khi vẫn còn đụng unique index
      return res
        .status(400)
        .json({ message: "Số chương đã tồn tại cho truyện này." });
    }
    console.error("POST /api/admin/chapters error:", err);
    res.status(500).json({ message: "Lỗi tạo chương mới." });
  }
});

/**
 * PUT /api/admin/chapters/:id
 * body: { no?, title?, content? }
 */
r.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { no, title, content } = req.body;

    const chapter = await Chapter.findById(id);
    if (!chapter) {
      return res.status(404).json({ message: "Không tìm thấy chương." });
    }

    let newNo = chapter.no;
    if (no !== undefined && no !== null && no !== "") {
      const parsed = parseInt(no, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        newNo = parsed;
      }
    }

    // Nếu đổi số chương, kiểm tra trùng
    if (newNo !== chapter.no) {
      const dup = await Chapter.findOne({
        novelId: chapter.novelId,
        no: newNo,
        _id: { $ne: chapter._id },
      });
      if (dup) {
        return res
          .status(400)
          .json({ message: "Số chương đã tồn tại cho truyện này." });
      }
    }

    if (title !== undefined) chapter.title = title;
    if (content !== undefined) chapter.content = content;
    chapter.no = newNo;

    await chapter.save();

    // Cập nhật lại chaptersCount
    const last = await Chapter.findOne({ novelId: chapter.novelId }).sort({
      no: -1,
    });
    await Novel.updateOne(
      { _id: chapter.novelId },
      { chaptersCount: last ? last.no : 0 }
    );

    res.json({
      message: "Cập nhật chương thành công.",
      chapter,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Số chương đã tồn tại cho truyện này." });
    }
    console.error("PUT /api/admin/chapters/:id error:", err);
    res.status(500).json({ message: "Lỗi cập nhật chương." });
  }
});

/**
 * DELETE /api/admin/chapters/:id
 */
r.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findById(id);
    if (!chapter) {
      return res.status(404).json({ message: "Không tìm thấy chương." });
    }

    const novelId = chapter.novelId;
    await Chapter.deleteOne({ _id: id });

    // Cập nhật lại chaptersCount
    const last = await Chapter.findOne({ novelId }).sort({ no: -1 });
    await Novel.updateOne(
      { _id: novelId },
      { chaptersCount: last ? last.no : 0 }
    );

    res.json({ message: "Đã xóa chương." });
  } catch (err) {
    console.error("DELETE /api/admin/chapters/:id error:", err);
    res.status(500).json({ message: "Lỗi xóa chương." });
  }
});

export default r;
