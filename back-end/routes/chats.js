
import { Router } from "express";
import mongoose from "mongoose";
import ChatMessage from "../models/ChatMessage.js";
import User from "../models/User.js";
import { requireAuth } from "../utils/auth.js";

const router = Router();
const { Types } = mongoose;

function toObjectId(id) {
  try {
    return new Types.ObjectId(id);
  } catch {
    return null;
  }
}

function normalizeUser(u) {
  if (!u) return null;
  return {
    _id: u._id,
    name: u.name,
    email: u.email,
    avatar: u.avatar,
  };
}

// GET /api/chats/search?q=abc – tìm user để bắt đầu hội thoại
router.get("/search", requireAuth, async (req, res) => {
  try {
    const meId = toObjectId(req.userId);
    const q = String(req.query.q || "").trim();
    if (!meId) return res.status(400).json({ message: "Token không hợp lệ" });
    if (!q) return res.json({ items: [] });

    const regex = new RegExp(q.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "i");
    const items = await User.find({
      _id: { $ne: meId },
      $or: [{ name: regex }, { email: regex }],
    })
      .select("_id name email avatar")
      .limit(10)
      .lean();

    res.json({ items: items.map(normalizeUser) });
  } catch (err) {
    console.error("GET /api/chats/search error:", err);
    res.status(500).json({ message: "Lỗi tìm người dùng." });
  }
});

// GET /api/chats/partners – danh sách hội thoại của user hiện tại
router.get("/partners", requireAuth, async (req, res) => {
  try {
    const userId = toObjectId(req.userId);
    if (!userId) return res.status(400).json({ message: "Token không hợp lệ" });

    const limit = Math.min(parseInt(req.query.limit) || 30, 100);

    const items = await ChatMessage.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
        },
      },
      {
        $addFields: {
          otherUser: {
            $cond: [{ $eq: ["$senderId", userId] }, "$receiverId", "$senderId"],
          },
          isIncoming: { $eq: ["$receiverId", userId] },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$otherUser",
          lastMessage: { $first: "$$ROOT" },
          unread: {
            $sum: {
              $cond: [
                { $and: ["$isIncoming", { $eq: ["$readAt", null] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          user: {
            _id: "$user._id",
            name: "$user.name",
            email: "$user.email",
            avatar: "$user.avatar",
          },
          lastMessage: {
            _id: "$lastMessage._id",
            senderId: "$lastMessage.senderId",
            receiverId: "$lastMessage.receiverId",
            content: "$lastMessage.content",
            createdAt: "$lastMessage.createdAt",
            readAt: "$lastMessage.readAt",
          },
          unread: 1,
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
      { $limit: limit },
    ]);

    res.json({ items });
  } catch (err) {
    console.error("GET /api/chats/partners error:", err);
    res.status(500).json({ message: "Lỗi tải hội thoại." });
  }
});

// GET /api/chats/:userId – lấy lịch sử chat với 1 người
router.get("/:userId", requireAuth, async (req, res) => {
  try {
    const meId = toObjectId(req.userId);
    const otherId = toObjectId(req.params.userId);
    if (!meId || !otherId) return res.status(400).json({ message: "Thiếu hoặc sai userId" });
    if (meId.equals(otherId)) return res.status(400).json({ message: "Không thể chat với chính mình" });

    const conversationKey = ChatMessage.buildConversationKey(meId, otherId);
    const limit = Math.min(parseInt(req.query.limit) || 100, 300);

    const [user, messages] = await Promise.all([
      User.findById(otherId).select("_id name email avatar"),
      ChatMessage.find({ conversationKey })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
    ]);

    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    // Đánh dấu đã đọc các tin nhắn đến
    await ChatMessage.updateMany(
      { conversationKey, receiverId: meId, readAt: null },
      { readAt: new Date() }
    );

    res.json({
      user: normalizeUser(user),
      messages: messages.reverse(),
    });
  } catch (err) {
    console.error("GET /api/chats/:userId error:", err);
    res.status(500).json({ message: "Lỗi tải hội thoại." });
  }
});

// POST /api/chats/:userId – gửi tin nhắn
router.post("/:userId", requireAuth, async (req, res) => {
  try {
    const senderId = toObjectId(req.userId);
    const receiverId = toObjectId(req.params.userId);
    if (!senderId || !receiverId) return res.status(400).json({ message: "Thiếu hoặc sai userId" });
    if (senderId.equals(receiverId)) return res.status(400).json({ message: "Không thể tự nhắn cho mình" });

    const content = String(req.body?.content || "").trim();
    if (!content) return res.status(400).json({ message: "Nội dung tin nhắn trống" });

    const receiver = await User.findById(receiverId).select("_id name email avatar");
    if (!receiver) return res.status(404).json({ message: "Người nhận không tồn tại" });

    const message = await ChatMessage.create({
      senderId,
      receiverId,
      content,
    });

    res.status(201).json({
      message,
    });
  } catch (err) {
    console.error("POST /api/chats/:userId error:", err);
    res.status(500).json({ message: "Gửi tin nhắn thất bại." });
  }
});

export default router;