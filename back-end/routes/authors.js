// back-end/routes/authors.js
import { Router } from "express";
import mongoose from "mongoose";
import Author from "../models/Author.js";
import Novel from "../models/Novel.js";
import User from "../models/User.js";
import { getUserId } from "../utils/auth.js"; // nếu bạn đang dùng hàm khác thì đổi lại

const r = Router();
const { Types } = mongoose;

const toObjectId = (id) =>
  Types.ObjectId.isValid(String(id)) ? new Types.ObjectId(String(id)) : null;


// GET /api/authors?q=&country=&genres=a,b&sort=&page=&pageSize=
r.get("/", async (req, res) => {
  try {
    const { q, country, genres, sort } = req.query;
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 12;
    const skip = (page - 1) * pageSize;
    const regex = q && q.trim() ? new RegExp(q.trim(), "i") : null;
    const genreArr = genres
      ? Array.isArray(genres)
        ? genres
        : String(genres).split(",")
      : null;

    // Đếm số tác phẩm theo authorId (có thể là User hoặc Author)
    const worksAgg = await Novel.aggregate([
      { $match: { authorId: { $ne: null } } },
      { $group: { _id: "$authorId", worksCount: { $sum: 1 } } },
    ]);
    const worksMap = new Map(
      worksAgg.map((w) => [String(w._id), w.worksCount || 0])
    );

    // Lấy danh sách Author có trong DB
    const cond = {};

    if (regex) {
      cond.$or = [
        { name: regex },
        { country: regex },
        { genres: { $elemMatch: { $regex: regex } } },
      ];
    }

    if (country) cond.country = country;

    if (genreArr) cond.genres = { $in: genreArr };

    const authorDocs = await Author.find(cond).lean();
    const authorById = new Map(authorDocs.map((a) => [String(a._id), a]));

    // Lấy user có tác phẩm (authorId trỏ tới User) nhưng chưa có trong Author
    const missingUserIds = Array.from(worksMap.keys()).filter(
      (id) => !authorById.has(id) && Types.ObjectId.isValid(id)
    );
    const users = missingUserIds.length
      ? await User.find({ _id: { $in: missingUserIds.map(toObjectId) } })
          .select("name avatar bio country")
          .lean()
      : [];
    const userById = new Map(users.map((u) => [String(u._id), u]));

    // Tổng hợp list
    const allItems = [];

    function pushItem(id, src) {
      const worksCount = worksMap.get(String(id)) || 0;
      if (worksCount === 0) return; // chỉ lấy những người có tác phẩm

      const author = authorById.get(String(id));
      const user = userById.get(String(id));
      const base =
        src === "author" && author
          ? author
          : src === "user" && user
          ? user
          : null;
      if (!base) return;

      allItems.push({
        ...base,
        _id: base._id?.toString(),
        worksCount,
        followersCount: 0, // sẽ điền sau
        source: src,
      });
    }
    authorDocs.forEach((a) => pushItem(a._id, "author"));
    users.forEach((u) => pushItem(u._id, "user"));

    // Áp dụng filter q/country/genres cho user (author đã lọc ở trên)
    const filtered = allItems.filter((item) => {
      if (country && item.country && item.country !== country) return false;
      if (genreArr && item.genres && genreArr.length) {
        const hasGenre = item.genres.some((g) => genreArr.includes(g));
        if (!hasGenre) return false;
      }
      if (regex && !regex.test(item.name || "")) return false;
      return true;
    });

    // Followers count (user.followAuthors chứa userId)
    const candidateIds = filtered
      .map((a) => a._id)
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));
    if (candidateIds.length) {
      const followersAgg = await User.aggregate([
        { $match: { followAuthors: { $in: candidateIds } } },
        { $unwind: "$followAuthors" },
        { $match: { followAuthors: { $in: candidateIds } } },
        {
          $group: {
            _id: "$followAuthors",
            followersCount: { $sum: 1 },
          },
        },
      ]);
      const followerMap = new Map(
        followersAgg.map((f) => [String(f._id), f.followersCount])
      );
      filtered.forEach((item) => {
        item.followersCount = followerMap.get(String(item._id)) || 0;
      });
    }
    // sort
    const sorted = filtered.sort((a, b) => {
      if (sort === "name_asc")
        return (a.name || "").localeCompare(b.name || "", "vi");
      if (sort === "name_desc")
        return (b.name || "").localeCompare(a.name || "", "vi");
      if (sort === "followers_desc")
        return (b.followersCount || 0) - (a.followersCount || 0);
      // default: nhiều tác phẩm hơn lên trước, sau đó theo tên
      const diff = (b.worksCount || 0) - (a.worksCount || 0);
      if (diff !== 0) return diff;
      return (a.name || "").localeCompare(b.name || "", "vi");
    });
    const total = sorted.length;
    const paged = sorted.slice(skip, skip + pageSize);


    res.json({
      items: paged,
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
    let author = await Author.findById(id).lean();
    let targetUserId = null;
    if (author?.userId && Types.ObjectId.isValid(String(author.userId))) {
      targetUserId = author.userId;
    }

    // Nếu không tìm thấy Author -> thử User
    if (!author) {
      if (!Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: "Author not found" });
      }
      const user = await User.findById(id).lean();
      if (!user) return res.status(404).json({ message: "Author not found" });

      author = {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio || "",
        country: user.country || "",
      };
      targetUserId = user._id;
    }

    // Xác định ID dùng cho follow (ưu tiên userId nếu có)
    const followTargetId = targetUserId || author._id;
     // Đếm followers (dựa vào user.followAuthors)
     let followersCount = 0;
     if (Types.ObjectId.isValid(String(followTargetId))) {
       followersCount = await User.countDocuments({
         followAuthors: followTargetId,
       });
     }

    let isFollowing = false;
    if (uid && Types.ObjectId.isValid(String(followTargetId))) {
      const user = await User.findById(uid).select("followAuthors").lean();
      isFollowing = user?.followAuthors?.some(
        (f) => String(f) === String(followTargetId)
      );
    }
    const candidateAuthorIds = [
      followTargetId,
      String(followTargetId),
      author?._id && String(author._id) !== String(followTargetId)
        ? author._id
        : null,
      author?._id && String(author._id) !== String(followTargetId)
        ? String(author._id)
        : null,
    ].filter(Boolean);

    const worksMatch = { authorId: { $in: candidateAuthorIds } };
    const works = await Novel.find(worksMatch)
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
