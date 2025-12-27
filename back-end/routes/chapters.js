// back-end/routes/chapters.js
import { Router } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { requireAuth, getUserId } from "../utils/auth.js";

import Chapter from "../models/Chapter.js";
import Novel from "../models/Novel.js";
import User from "../models/User.js";

const router = Router();
const { Types } = mongoose;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const isDev = process.env.NODE_ENV !== "production";

/* ---------- helpers ---------- */
async function getUserFromAuthHeader(req) {
  try {
    const h = req.headers.authorization || "";
    if (!h.startsWith("Bearer ")) return null;
    const token = h.split(" ")[1];
    const payload = jwt.verify(token, JWT_SECRET);
    const u = await User.findById(payload.id);
    return u || null;
  } catch {
    return null;
  }
}
function isVipNow(userDoc) {
  if (!userDoc) return false;
  if (userDoc.isVip) return true;
  if (userDoc.vipUntil && userDoc.vipUntil > new Date()) return true;
  return false;
}
function toObjectIdMaybe(id) {
  return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id;
}

/* ---------- GET /api/chapters?novelId=... ---------- */
router.get("/", async (req, res) => {
  try {
    const { novelId } = req.query;
    const where = {};
    if (novelId) where.novelId = toObjectIdMaybe(novelId);

    if (isDev) console.log("[GET /chapters] where =", where);

    const items = await Chapter.find(where).sort({ no: 1 }).lean();

    // gắn cờ locked cho chương mới nhất nếu user không VIP
    const latest = items.length ? items[items.length - 1] : null;
    if (latest) {
      const user = await getUserFromAuthHeader(req);
      const vip = isVipNow(user);
      if (!vip) {
        const latestNo = Number(latest.no);
        items.forEach((c) => {
          c.locked = Number(c.no) === latestNo;
        });
      }
    }

    res.json(items);
  } catch (e) {
    console.error("GET /chapters error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------- GET /api/chapters/one?novelId=...&no=... ---------- */
router.get("/one", async (req, res) => {
  try {
    const { novelId, no } = req.query;
    if (!novelId || no == null) {
      return res.status(400).json({ message: "novelId & no are required" });
    }

    const where = { novelId: toObjectIdMaybe(novelId), no: Number(no) };
    if (isDev) console.log("[GET /chapters/one] where =", where);

    // kiểm tra VIP nếu đang hỏi chương mới nhất
    const latest = await Chapter
      .findOne({ novelId: toObjectIdMaybe(novelId) })
      .sort({ no: -1 })
      .lean();
    const isLatest = latest && Number(latest.no) === Number(no);

    if (isLatest) {
      const user = await getUserFromAuthHeader(req);
      const vip = isVipNow(user);
      if (!vip) {
        return res.status(403).json({
          code: "VIP_REQUIRED",
          message: "Chương mới nhất chỉ dành cho tài khoản VIP.",
        });
      }
    }

    const ch = await Chapter.findOne(where).lean();
    if (!ch) return res.status(404).json({ message: "Chapter not found" });
    res.json(ch);
  } catch (e) {
    console.error("GET /chapters/one error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/chapters  (chỉ tác giả của novel được thêm)
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.userId || getUserId(req);
    const { novelId, no, title, content } = req.body || {};
    if (!novelId || !no || !title) return res.status(400).json({ message: "Thiếu trường bắt buộc" });

    const novel = await Novel.findById(novelId);
    if (!novel) return res.status(404).json({ message: "Novel not found" });
    if (String(novel.authorId) !== String(userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const ch = await Chapter.create({ novelId, no: Number(no), title, content: content || "" });
    res.json(ch);
  } catch (e) {
    console.error("POST /chapters", e);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
