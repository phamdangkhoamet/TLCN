// routes/followAuthors.js
import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Author from "../models/Author.js";
import { requireAuth } from "../utils/auth.js";

const router = express.Router();
const { Types } = mongoose;

const toObjectId = (id) =>
  Types.ObjectId.isValid(String(id)) ? new Types.ObjectId(String(id)) : null;

async function resolveTargetUser(authorId) {
  const oid = toObjectId(authorId);
  if (!oid) return null;

  // Trường hợp authorId chính là userId
  const user = await User.findById(oid).select("_id name avatar");
  if (user) return { targetId: user._id, targetUser: user };

  // Nếu là Author, lấy userId liên kết
  const author = await Author.findById(oid).select("userId");
  if (!author?.userId) return null;
  if (!Types.ObjectId.isValid(String(author.userId))) return null;

  const mappedUser = await User.findById(author.userId).select(
    "_id name avatar"
  );
  if (!mappedUser) return null;

  return { targetId: mappedUser._id, targetUser: mappedUser };
}

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
    const resolved = await resolveTargetUser(authorId);
    if (!resolved)
      return res.status(404).json({ message: "Không tìm thấy người cần theo dõi" });

    if (String(resolved.targetId) === String(userId)) {
      return res.status(400).json({ message: "Không thể tự theo dõi chính mình" });
    }

    if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });

    const user = await User.findById(userId);
    if (!user.followAuthors.some((x) => String(x) === String(resolved.targetId))) {
      user.followAuthors.push(resolved.targetId);
      await user.save();
    }

    const followersCount = await User.countDocuments({
      followAuthors: resolved.targetId,
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
    const resolved = await resolveTargetUser(authorId);
    if (!resolved)
      return res.status(404).json({ message: "Không tìm thấy người cần bỏ theo dõi" });

    if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });

    const user = await User.findById(userId);
    user.followAuthors = user.followAuthors.filter(
      (x) => x.toString() !== String(resolved.targetId)
    );
    await user.save();

    const followersCount = await User.countDocuments({
      followAuthors: resolved.targetId,
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
    const resolved = await resolveTargetUser(authorId);
    if (!resolved)
      return res.status(404).json({ message: "Không tìm thấy người cần theo dõi" });

    if (String(resolved.targetId) === String(userId)) {
      return res.status(400).json({ message: "Không thể tự theo dõi chính mình" });
    }

    const user = await User.findById(userId);

    const isFollowing = user.followAuthors.some(
      (x) => String(x) === String(resolved.targetId)
    );

    if (isFollowing) {
      // Unfollow
      user.followAuthors = user.followAuthors.filter(
        (x) => x.toString() !== String(resolved.targetId)
          );
      await user.save();
    } else {
      // Follow
      user.followAuthors.push(resolved.targetId);
      await user.save();
    }

    // Tính lại tổng số người theo dõi
    const followersCount = await User.countDocuments({
      followAuthors: resolved.targetId,
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
