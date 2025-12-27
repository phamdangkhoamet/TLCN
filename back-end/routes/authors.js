// back-end/routes/authors.js
import { Router } from "express";
import Author from "../models/Author.js";
import Novel from "../models/Novel.js";
import Follow from "../models/Follow.js";
import { getUserId } from "../utils/auth.js"; // nếu bạn đang dùng hàm khác thì đổi lại

const r = Router();

// GET /api/authors?q=&country=&genres=a,b&sort=&page=&pageSize=
r.get("/", async (req, res) => {
  try {
    const { q, country, genres, sort } = req.query;
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 12;
    const skip = (page - 1) * pageSize;

    const cond = {};

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), "i");
      cond.$or = [
        { name: regex },
        { country: regex },
        { genres: { $elemMatch: { $regex: regex } } },
      ];
    }

    if (country) cond.country = country;

    if (genres) {
      const arr = Array.isArray(genres) ? genres : String(genres).split(",");
      cond.genres = { $in: arr };
    }

    // Aggregation: LẤY TẤT CẢ tác giả, có thể có hoặc không có tác phẩm
    const pipeline = [
      { $match: cond },
      {
        $lookup: {
          from: "novels",
          localField: "_id",
          foreignField: "author",
          as: "novels",
        },
      },
      {
        $addFields: {
          worksCount: { $size: "$novels" },
        },
      },
      // ❌ BỎ LỌC ÍT NHẤT 1 TÁC PHẨM
      // { $match: { worksCount: { $gt: 0 } } },
      {
        $lookup: {
          from: "follows",
          localField: "_id",
          foreignField: "author",
          as: "followDocs",
        },
      },
      {
        $addFields: {
          followersCount: { $size: "$followDocs" },
        },
      },
      {
        $project: {
          novels: 0,
          followDocs: 0,
        },
      },
    ];

    // sort
    let sortStage = { createdAt: -1 };
    if (sort === "name_asc") sortStage = { name: 1 };
    if (sort === "name_desc") sortStage = { name: -1 };
    if (sort === "followers_desc") sortStage = { followersCount: -1 };
    pipeline.push({ $sort: sortStage });

    // count total
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Author.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // pagination
    pipeline.push({ $skip: skip }, { $limit: pageSize });

    const authors = await Author.aggregate(pipeline);

    res.json({
      items: authors,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (err) {
    console.error("GET /api/authors error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/authors/:id - chi tiết tác giả + followers + works
r.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const uid = getUserId(req); // nếu không có thì luôn là null

    const author = await Author.findById(id);
    if (!author) return res.status(404).json({ message: "Author not found" });

    const followersCount = await Follow.countDocuments({ author: author._id });

    let isFollowing = false;
    if (uid) {
      const f = await Follow.findOne({ author: author._id, user: uid });
      isFollowing = !!f;
    }

    const works = await Novel.find({ author: author._id })
      .select("_id title cover status totalChapters")
      .sort({ createdAt: -1 });

    res.json({
      author,
      followersCount,
      isFollowing,
      works,
    });
  } catch (err) {
    console.error("GET /api/authors/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default r;
