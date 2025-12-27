import { Router } from "express";
import Comment from "../models/Comment.js";
const r = Router();

// GET /api/comments?novelId=...
r.get("/", async (req, res) => {
  const { novelId } = req.query;
  const list = await Comment.find({ novelId }).sort({ createdAt: -1 });
  res.json(list);
});

// POST /api/comments
r.post("/", async (req, res) => {
  const { novelId, userId, userName, userAvatar, content } = req.body;
  if (!novelId || !content) return res.status(400).json({ message: "Missing novelId/content" });
  const c = await Comment.create({ novelId, userId, userName, userAvatar, content });
  res.status(201).json(c);
});

export default r;
