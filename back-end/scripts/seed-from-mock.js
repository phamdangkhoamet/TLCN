// back-end/scripts/seed-from-mock.js
// Seed MongoDB từ front-end/src/data/mockData.js của bạn
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

// ====== Kết nối DB ======
import { connectDB } from "../config/db.js";

// ====== Models (đồng bộ với phần back-end/models của bạn) ======
import User from "../models/User.js";
import Author from "../models/Author.js";
import Novel from "../models/Novel.js";
import Chapter from "../models/Chapter.js";
import Follow from "../models/Follow.js";
import Favorite from "../models/Favorite.js";
import Notification from "../models/Notification.js";
import Comment from "../models/Comment.js";
import Poster from "../models/Poster.js";

// ====== Load mockData từ front-end ======
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn từ back-end/scripts -> front-end/src/data/mockData.js
const mockPath = path.resolve(__dirname, "../../front-end/src/data/mockData.js");
const mockFileUrl = pathToFileURL(mockPath).href;
const {
  genres,
  novels,
  chaptersById,
  authors: mockAuthors,
  notificationsByUser,
  commentsByNovel,
} = await import(mockFileUrl);

// ====== Helpers ======
const GENRES = genres;
const AVATAR = (seed) =>
  `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;
const COVER = (id) => `https://picsum.photos/seed/novel_${id}/300/400`;

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pickOne(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickMany(arr, n) {
  const a = [...arr];
  const out = [];
  while (a.length && out.length < n) {
    out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]);
  }
  return out;
}
function fallbackChapters(count = 3, titlePrefix = "Chương") {
  return Array.from({ length: count }, (_, i) => ({
    no: i + 1,
    title: `${titlePrefix} ${i + 1}`,
    content: `Nội dung ${titlePrefix.toLowerCase()} ${i + 1} (tạo tự động cho seed).`,
  }));
}

// Gộp tất cả novels (object theo thể loại) → array phẳng
function flattenNovels(novelsByGenre) {
  const out = [];
  Object.keys(novelsByGenre).forEach((g) => {
    (novelsByGenre[g] || []).forEach((b) => out.push({ ...b, genre: g }));
  });
  return out;
}

async function clearAll() {
  await Promise.all([
    User.deleteMany({}),
    Author.deleteMany({}),
    Novel.deleteMany({}),
    Chapter.deleteMany({}),
    Follow.deleteMany({}),
    Favorite.deleteMany({}),
    Notification.deleteMany({}),
    Comment.deleteMany({}),
    Poster.deleteMany({}),
  ]);
}

async function seed() {
  // Cho phép truyền URI override, nhưng vẫn ưu tiên biến env nếu không truyền
  await connectDB(process.env.MONGODB_URI);

  console.log("🔄 Xoá dữ liệu cũ…");
  await clearAll();

  // Password mặc định cho user/author khi seed
  const DEFAULT_PW = process.env.SEED_DEFAULT_PASSWORD || "123456";
  const pwHash = await bcrypt.hash(DEFAULT_PW, 10);

  // ================== (Tuỳ chọn) ADMIN ==================
  if (process.env.SEED_ADMIN_EMAIL) {
    console.log("👑 Seed admin …");
    const adminEmail = process.env.SEED_ADMIN_EMAIL;
    const adminPw = process.env.SEED_ADMIN_PASSWORD || DEFAULT_PW;
    const adminHash = await bcrypt.hash(adminPw, 10);
    await User.create({
      name: "Admin",
      email: adminEmail,
      password: adminHash,
      avatar: AVATAR("admin"),
      role: "admin",
      status: "active",
    });
    console.log(`   → admin: ${adminEmail} / ${adminPw}`);
  }

  // ================== 1) USERS ==================
  // Tạo 10 users thường (user1..user10) – GIỮ logic cũ, CHỈ THÊM password
  console.log("👤 Tạo 10 users (role=user) …");
  const usersToInsert = [];
  for (let i = 1; i <= 10; i++) {
    usersToInsert.push({
      name: `User ${i}`,
      email: `user${i}@example.com`,
      password: pwHash, // NEW
      avatar: AVATAR(`user_${i}`),
      role: "user",
      status: "active",
    });
  }
  const userDocs = await User.insertMany(usersToInsert);

  // ================== 2) AUTHORS + author-accounts ==================
  // GIỮ nguyên tạo 10 tác giả, CHỈ THÊM password cho account role=author
  console.log("🖋️ Tạo 10 tác giả & account role=author …");
  const authorUserDocs = [];
  for (let i = 0; i < mockAuthors.length; i++) {
    const a = mockAuthors[i];
    const u = await User.create({
      name: a.name,
      email: `author${i + 1}@example.com`,
      password: pwHash, // NEW
      avatar: a.avatar || AVATAR(`author_${i + 1}`),
      role: "author",
      status: "active",
    });
    authorUserDocs.push(u);
  }

  const authorDocs = [];
  for (let i = 0; i < mockAuthors.length; i++) {
    const a = mockAuthors[i];
    const u = authorUserDocs[i];

    const doc = await Author.create({
      userId: u._id,
      name: a.name,
      avatar: a.avatar || u.avatar,
      country: a.country || "Việt Nam",
      genres: Array.isArray(a.genres) ? a.genres : [],
      booksCount: Number(a.booksCount) || 0,
      rating: Number(a.rating) || 4.2,
      followers: 0, // sẽ sync theo Follow
      bio: a.bio || `Giới thiệu ngắn về ${a.name}.`,
      topBooks: Array.isArray(a.topBooks) ? a.topBooks : [],
    });
    authorDocs.push(doc);
  }

  // Map nhanh: name -> authorDoc
  const authorByName = new Map(authorDocs.map((a) => [a.name, a]));

  // ================== 3) NOVELS + CHAPTERS ==================
  console.log("📚 Nạp novels từ mock + chương…");
  const flatNovels = flattenNovels(novels);
  const novelDocs = [];
  const chaptersBulk = [];

  for (const b of flatNovels) {
    // Tìm tác giả theo tên; nếu không có → chọn 1 tác giả có genres phù hợp (hoặc ngẫu nhiên)
    let authorDoc = authorByName.get(b.author);
    if (!authorDoc) {
      const sameGenreAuthors = authorDocs.filter((ad) => (ad.genres || []).includes(b.genre));
      authorDoc = sameGenreAuthors.length ? pickOne(sameGenreAuthors) : pickOne(authorDocs);
    }

    const novel = await Novel.create({
      legacyId: b.id, // lưu lại id cũ
      title: b.title,
      authorId: authorDoc._id,
      authorName: authorDoc.name,
      genre: b.genre,
      cover: b.cover || COVER(b.id),
      description: b.description || "",
      chaptersCount: 0, // cập nhật sau khi insert chapters
    });
    novelDocs.push(novel);

    const chapSrc =
      chaptersById[b.id] && chaptersById[b.id].length
        ? chaptersById[b.id]
        : fallbackChapters(3);

    chapSrc.forEach((c, idx) => {
      chaptersBulk.push({
        novelId: novel._id,
        no: Number(c.no) || idx + 1,
        title: c.title || `Chương ${idx + 1}`,
        content: c.content || `Nội dung chương ${idx + 1}.`,
      });
    });
  }

  const chapterDocs = await Chapter.insertMany(chaptersBulk);

  // Cập nhật chaptersCount cho mỗi novel
  const chaptersByNovel = chapterDocs.reduce((m, c) => {
    m.set(c.novelId.toString(), (m.get(c.novelId.toString()) || 0) + 1);
    return m;
  }, new Map());

  for (const n of novelDocs) {
    await Novel.findByIdAndUpdate(n._id, {
      chaptersCount: chaptersByNovel.get(n._id.toString()) || 0,
    });
  }

  // Cập nhật booksCount + topBooks lại cho 10 tác giả (dựa vào novelDocs đã gán)
  for (const a of authorDocs) {
    const myNovels = novelDocs.filter((n) => String(n.authorId) === String(a._id));
    await Author.findByIdAndUpdate(a._id, {
      booksCount: myNovels.length,
      topBooks: myNovels.slice(0, 3).map((n) => n.title),
    });
  }

  // ================== 4) FOLLOWS & FAVORITES ==================
  console.log("👥 Tạo follow (mỗi user theo dõi 3 tác giả) & favorite (mỗi user thích 5 truyện) …");
  const followBulk = [];
  const favoriteBulk = [];

  for (const u of userDocs) {
    const pickedAuthors = pickMany(authorDocs, Math.min(3, authorDocs.length));
    for (const a of pickedAuthors) {
      followBulk.push({ userId: u._id, authorId: a._id });
    }

    const pickedNovels = pickMany(novelDocs, Math.min(5, novelDocs.length));
    for (const n of pickedNovels) {
      favoriteBulk.push({ userId: u._id, novelId: n._id });
    }
  }

  await Follow.insertMany(followBulk);
  await Favorite.insertMany(favoriteBulk);

  // Đồng bộ followers count cho 10 tác giả
  for (const a of authorDocs) {
    const count = await Follow.countDocuments({ authorId: a._id });
    await Author.findByIdAndUpdate(a._id, { followers: count });
  }

  // ================== 5) NOTIFICATIONS (theo notificationsByUser) ==================
  console.log("🔔 Nạp notificationsByUser …");
  const notiBulk = [];
  const userByIdx = new Map(userDocs.map((u, i) => [i + 1, u])); // user 1..10

  Object.keys(notificationsByUser || {}).forEach((k) => {
    const idx = Number(k); // 1, 2, ...
    const user = userByIdx.get(idx);
    if (!user) return;
    (notificationsByUser[k] || []).forEach((n) => {
      notiBulk.push({
        userId: user._id,
        title: n.title,
        content: n.content || "",
        type: n.type || "Hệ thống",
        link: n.link || null,
        createdAt: n.createdAt ? new Date(n.createdAt.replace(" ", "T")) : new Date(),
        read: false,
      });
    });
  });

  if (notiBulk.length) await Notification.insertMany(notiBulk);

  // ================== 6) COMMENTS (theo commentsByNovel) ==================
  console.log("💬 Nạp commentsByNovel …");
  const novelByLegacy = new Map(novelDocs.map((n) => [String(n.legacyId), n]));
  const cmtBulk = [];

  Object.keys(commentsByNovel || {}).forEach((legacyId) => {
    const n = novelByLegacy.get(String(legacyId));
    if (!n) return;
    (commentsByNovel[legacyId] || []).forEach((c) => {
      cmtBulk.push({
        novelId: n._id,
        userName: c.user || "Ẩn danh",
        userAvatar: c.avatar || AVATAR(c.user || "anon"),
        content: c.content || "",
        createdAt: c.createdAt ? new Date(c.createdAt.replace(" ", "T")) : new Date(),
      });
    });
  });

  if (cmtBulk.length) await Comment.insertMany(cmtBulk);

  // ================== 7) POSTERS ==================
  console.log("🖼️  Nạp posters demo …");
  await Poster.insertMany([
    {
      title: "Khám phá thế giới tiểu thuyết kỳ ảo",
      image:
        "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1600&q=80",
      link: "/category/Tiểu thuyết",
      order: 1,
    },
    {
      title: "Ngôn tình & cảm xúc trong từng trang viết",
      image:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80",
      link: "/category/Tình cảm",
      order: 2,
    },
    {
      title: "Trinh thám – Nơi logic gặp cảm xúc",
      image:
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1600&q=80",
      link: "/category/Trinh thám",
      order: 3,
    },
    {
      title: "Phiêu lưu cùng những hành trình bất tận",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
      link: "/category/Phiêu lưu",
      order: 4,
    },
    {
      title: "Thế giới tương lai – Khoa học & công nghệ",
      image:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80",
      link: "/category/Khoa học viễn tưởng",
      order: 5,
    },
  ]);

  // ================== TỔNG KẾT ==================
  const totals = await Promise.all([
    User.countDocuments(),
    Author.countDocuments(),
    Novel.countDocuments(),
    Chapter.countDocuments(),
    Follow.countDocuments(),
    Favorite.countDocuments(),
    Notification.countDocuments(),
    Comment.countDocuments(),
    Poster.countDocuments(),
  ]);

  console.table([
    { collection: "users", count: totals[0] },
    { collection: "authors", count: totals[1] },
    { collection: "novels", count: totals[2] },
    { collection: "chapters", count: totals[3] },
    { collection: "follows", count: totals[4] },
    { collection: "favorites", count: totals[5] },
    { collection: "notifications", count: totals[6] },
    { collection: "comments", count: totals[7] },
    { collection: "posters", count: totals[8] },
  ]);

  console.log("✅ Seed hoàn tất!");
}

seed()
  .then(() => mongoose.connection.close())
  .catch((err) => {
    console.error(err);
    mongoose.connection.close();
    process.exit(1);
  });
