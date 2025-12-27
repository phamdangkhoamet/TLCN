// routes/followAuthors.js
import express from "express";
import User from "../models/User.js";
import Author from "../models/Author.js";
// 🔹 THÊM DÒNG NÀY:
import { requireAuth } from "../utils/auth.js";

const router = express.Router();

/**
 * GET /api/authors/following/list
 * → trả về danh sách tác giả user đang follow
 */
// 🔹 THÊM requireAuth
router.get("/following/list", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });

    const user = await User.findById(userId).populate(
      "followAuthors",
      "name avatar bio"
    );
    res.json({ followAuthors: user.followAuthors || [] });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/**
 * POST /api/authors/:id/follow
 */
// 🔹 THÊM requireAuth
router.post("/:id/follow", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const authorId = req.params.id;

    if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });

    const user = await User.findById(userId);
    if (!user.followAuthors.includes(authorId)) {
      user.followAuthors.push(authorId);
      await user.save();
    }

    const followersCount = await User.countDocuments({
      followAuthors: authorId,
    });

    res.json({
      message: "Đã theo dõi",
      isFollowing: true,
      followersCount,
      followAuthors: user.followAuthors,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/**
 * POST /api/authors/:id/unfollow
 */
// 🔹 THÊM requireAuth
router.post("/:id/unfollow", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const authorId = req.params.id;

    if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });

    const user = await User.findById(userId);
    user.followAuthors = user.followAuthors.filter(
      (x) => x.toString() !== authorId
    );
    await user.save();

    const followersCount = await User.countDocuments({
      followAuthors: authorId,
    });

    res.json({
      message: "Đã bỏ theo dõi",
      isFollowing: false,
      followersCount,
      followAuthors: user.followAuthors,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/**
 * 🔥 NEW: POST /api/authors/:id/toggle
 * → Nếu đã follow → unfollow
 * → Nếu chưa follow → follow
 * → Trả về followersCount + trạng thái mới
 */
// 🔹 THÊM requireAuth
router.post("/:id/toggle", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const authorId = req.params.id;

    if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });

    // Kiểm tra tác giả có tồn tại không
    const author = await Author.findById(authorId);
    if (!author)
      return res.status(404).json({ message: "Không tìm thấy tác giả" });

    const user = await User.findById(userId);

    const isFollowing = user.followAuthors.includes(authorId);

    if (isFollowing) {
      // Unfollow
      user.followAuthors = user.followAuthors.filter(
        (x) => x.toString() !== authorId
      );
      await user.save();
    } else {
      // Follow
      user.followAuthors.push(authorId);
      await user.save();
    }

    // Tính lại tổng số người theo dõi
    const followersCount = await User.countDocuments({
      followAuthors: authorId,
    });

    res.json({
      message: isFollowing ? "Đã bỏ theo dõi" : "Đã theo dõi",
      isFollowing: !isFollowing,
      followersCount,
      followAuthors: user.followAuthors,
    });
  } catch (e) {
    console.error("toggle follow error:", e);
    res.status(500).json({ message: e.message });
  }
});

export default router;
