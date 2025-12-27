import { Router } from "express";
import Poster from "../models/Poster.js"; 
const router = Router();

router.get("/", async (_, res) => {
  try {
    const rows = await Poster.find({}).sort({ id: 1 }).lean();
    res.json(rows);
  } catch (e) {
    console.error("GET /posters", e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
