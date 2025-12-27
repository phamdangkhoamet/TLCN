import { Router } from "express";
import mongoose from "mongoose";
import Novel from "../models/Novel.js";
import { requireAuth, getUserId } from "../utils/auth.js";

const router = Router();
const { Types } = mongoose;

/**
 * 🔹 GET /api/novels
 *   - Trả danh sách truyện (lọc theo genre, q, limit)
 */
router.get("/", async (req, res) => {
  try {
    const { genre, q, limit } = req.query;
    const where = {};

    // Lọc theo thể loại
    if (genre) where.genre = genre;

    // Tìm kiếm
    if (q && q.trim()) {
      const rx = new RegExp(q.trim(), "i");
      where.$or = [{ title: rx }, { authorName: rx }, { description: rx }];
    }

    // Giới hạn số lượng
    const lim = limit ? Number(limit) : 0;

    const rows = await Novel.find(where)
      .sort({ createdAt: -1 })
      .limit(lim)
      .lean();

    // Chuẩn hoá cho frontend
    const mapped = rows.map((n) => ({
      ...n,
      author: n.author || n.authorName,
      id: n._id?.toString(),
    }));

    res.json(mapped);
  } catch (e) {
    console.error("GET /api/novels error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * 🔹 GET /api/novels/:id
 *   - Trả về chi tiết 1 truyện
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    let novel = null;

    // Nếu id hợp lệ ObjectId -> tìm theo _id
    if (mongoose.Types.ObjectId.isValid(id)) {
      novel = await Novel.findById(id).lean();
    }

    // Nếu không tìm được hoặc id không phải ObjectId, thử theo id custom
    if (!novel) {
      novel = await Novel.findOne({ id }).lean();
    }

    if (!novel) {
      return res.status(404).json({ message: "Novel not found" });
    }

    // Chuẩn hoá cho frontend
    novel.id = novel._id?.toString() || novel.id;
    novel.author = novel.author || novel.authorName;

    res.json(novel);
  } catch (e) {
    console.error("GET /api/novels/:id error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/novels  (chỉ tác giả đã đăng nhập)
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.userId || getUserId(req); // dự phòng
    const { title, description, genre, cover } = req.body || {};

    if (!title) return res.status(400).json({ message: "Thiếu tiêu đề" });

    const doc = await Novel.create({
      title,
      description: description || "",
      genre: genre || "",
      cover: cover || "",
      authorId: userId,
    });

    res.json(doc);
  } catch (e) {
    console.error("POST /novels error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/novels/:id  (chỉ chính tác giả được sửa)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.userId || getUserId(req);
    const id = req.params.id;

    const novel = await Novel.findById(id);
    if (!novel) return res.status(404).json({ message: "Novel not found" });
    if (String(novel.authorId) !== String(userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { title, description, genre, cover } = req.body || {};
    if (title != null) novel.title = title;
    if (description != null) novel.description = description;
    if (genre != null) novel.genre = genre;
    if (cover != null) novel.cover = cover;

    await novel.save();
    res.json(novel);
  } catch (e) {
    console.error("PUT /novels/:id error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
