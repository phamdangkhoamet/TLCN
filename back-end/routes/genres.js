// back-end/routes/genres.js
import { Router } from "express";
import Novel from "../models/Novel.js";

const router = Router();

// Lấy danh sách thể loại (distinct từ Novel.genre)
router.get("/", async (_, res) => {
  try {
    const genres = await Novel.distinct("genre");
    res.json(genres.sort());
  } catch (err) {
    console.error("GET /genres error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
