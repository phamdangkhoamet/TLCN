// back-end/routes/favorites.js
import { Router } from "express";
import mongoose from "mongoose";
import Favorite from "../models/Favorite.js";
import Novel from "../models/Novel.js";
import User from "../models/User.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const userId =
      req.user?.id ||
      req.headers["x-user-id"] ||
      req.query.userId ||
      null;

    // ❗ Trường hợp chưa đăng nhập / không có userId: trả [] cho an toàn
    if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
      return res.json([]);
    }

    const favs = await Favorite.find({ userId }).lean();
    const novelIds = favs.map((f) => f.novelId).filter(Boolean);

    if (!novelIds.length) {
      return res.json([]);
    }

    const novels = await Novel.find({ _id: { $in: novelIds } }).lean();
    const map = new Map(novels.map((n) => [String(n._id), n]));

    const items = favs
      .map((f) => {
        const n = map.get(String(f.novelId));
        if (!n) return null;
        return {
          id: n._id?.toString(),
          title: n.title,
          cover: n.cover,
          author: n.authorName || n.author,
          genre: n.genre,
          description: n.description,
          favoriteId: f._id?.toString(),
          novelId: n._id?.toString(),
        };
      })
      .filter(Boolean);

    return res.json(items);
  } catch (e) {
    console.error("GET /favorites error:", e);
    res.status(500).json({ message: "Server error" });
  }
});


/**
 * GET /api/favorites/mine
 * Trả về danh sách novel yêu thích của user hiện tại
 * (demo: lấy userId từ header x-user-id hoặc query ?userId=)
 */
router.get("/mine", async (req, res) => {
  try {
    const userId =
      req.user?.id ||
      req.headers["x-user-id"] ||
      req.query.userId ||
      null;

    if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
      return res.status(400).json({ message: "Missing or invalid userId" });
    }

    const favs = await Favorite.find({ userId }).lean();
    const novelIds = favs.map((f) => f.novelId).filter(Boolean);

    const novels = await Novel.find({ _id: { $in: novelIds } }).lean();
    const map = new Map(novels.map((n) => [String(n._id), n]));

    const items = favs
      .map((f) => {
        const n = map.get(String(f.novelId));
        if (!n) return null;
        return {
          id: n._id?.toString(),
          title: n.title,
          cover: n.cover,
          author: n.authorName || n.author,
          genre: n.genre,
          description: n.description,
          favoriteId: f._id?.toString(),
          novelId: n._id?.toString(),
        };
      })
      .filter(Boolean);

    res.json(items);
  } catch (e) {
    console.error("GET /favorites/mine error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/favorites/toggle
 * body: { userId, novelId }
 * -> thêm/bỏ favorite
 */
router.post("/toggle", async (req, res) => {
  try {
    const { userId, novelId } = req.body || {};

    if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    if (!novelId || !mongoose.Types.ObjectId.isValid(String(novelId))) {
      return res.status(400).json({ message: "Invalid novelId" });
    }

    const existing = await Favorite.findOne({ userId, novelId });
    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      return res.json({ ok: true, favored: false });
    }

    await Favorite.create({ userId, novelId });
    return res.json({ ok: true, favored: true });
  } catch (e) {
    console.error("POST /favorites/toggle error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/favorites/:novelId
 * (xóa khỏi yêu thích theo novelId cho user hiện tại)
 */
router.delete("/:novelId", async (req, res) => {
  try {
    const userId =
      req.user?.id ||
      req.headers["x-user-id"] ||
      req.query.userId ||
      null;

    const { novelId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
      return res.status(400).json({ message: "Missing or invalid userId" });
    }
    if (!novelId || !mongoose.Types.ObjectId.isValid(String(novelId))) {
      return res.status(400).json({ message: "Invalid novelId" });
    }

    const del = await Favorite.findOneAndDelete({ userId, novelId });
    if (!del) return res.status(404).json({ message: "Favorite not found" });

    return res.json({ ok: true });
  } catch (e) {
    console.error("DELETE /favorites/:novelId error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
