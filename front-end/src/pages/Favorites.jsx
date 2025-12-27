// src/pages/Favorites.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api, API_BASE } from "../lib/api";
import {
  getFavoriteIds,
  removeFavorite as removeFavUtil,
  ensureFavoriteMapLoaded,
} from "../utils/favorites";

// lấy user hiện tại từ localStorage (đã được set khi login)
function getSessionUser() {
  try {
    return JSON.parse(localStorage.getItem("sessionUser") || "null");
  } catch {
    return null;
  }
}
const getUserId = () => {
  const u = getSessionUser();
  return (u && (u._id || u.id)) || null;
};

// Chuẩn hoá novel về format UI cũ
const normalizeNovel = (n) => ({
  id: String(n?._id || n?.id || ""),
  title: n?.title || "",
  cover: n?.cover || n?.image || "",
  author:
    n?.authorName ||
    (typeof n?.author === "string" ? n?.author : n?.author?.name) ||
    "",
  description: n?.description || "",
});

export default function Favorites() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [allNovels, setAllNovels] = useState([]); // novels từ API (đã chuẩn hoá)
  const [favIds, setFavIds] = useState([]); // string[]

  // ---- 1) Tải toàn bộ novels từ API (1 lần) ----
  useEffect(() => {
    let mounted = true;
    (async () => {
      setErr("");
      try {
        const url = new URL("/api/novels", API_BASE || window.location.origin);
        const res = await fetch(url.toString());
        const raw = await res.json().catch(() => []);
        const arr = Array.isArray(raw) ? raw : raw?.items || raw?.data || [];
        if (mounted) setAllNovels(arr.map(normalizeNovel).filter((x) => x.id));
      } catch (e) {
        if (mounted) setErr(e?.message || "Lỗi tải truyện.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ---- 2) Lấy danh sách yêu thích từ API (ưu tiên), fallback local ----
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const uid = getUserId();
        let favList = [];
        try {
          // Nếu đã đăng nhập (có token) thì GET /api/favorites
          // Nếu chưa, fallback thêm ?userId= để backend dev-friendly
          const url = new URL("/api/favorites", API_BASE || window.location.origin);
          if (uid) url.searchParams.set("userId", uid);
          const res = await fetch(url.toString(), {
            headers: { "Content-Type": "application/json" },
          });
          const data = await res.json().catch(() => []);
          favList = Array.isArray(data) ? data : data?.items || data?.data || [];
        } catch {
          favList = [];
        }
        if (favList.length > 0) {
          const ids = favList
            .map((f) => String(f.novelId || f.novel?._id || f.novel?.id || ""))
            .filter(Boolean);
          if (mounted) setFavIds(ids);
        } else {
          // fallback localStorage
          if (mounted) setFavIds(getFavoriteIds().map(String));
        }
      } catch {
        if (mounted) setFavIds(getFavoriteIds().map(String));
      }
    })();
    // đồng bộ map để có thể xoá theo favoriteId nếu server cần
    ensureFavoriteMapLoaded();
    return () => {
      mounted = false;
    };
  }, []);

  // ---- 3) lắng nghe thay đổi localStorage (key theo user) ----
  useEffect(() => {
    const onStorage = (e) => {
      if (!e.key) return;
      if (e.key.startsWith("dkstory_favorites_v1")) {
        setFavIds(getFavoriteIds().map(String));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ---- 4) map id -> novel ----
  const novelMap = useMemo(() => {
    const m = new Map();
    allNovels.forEach((n) => m.set(String(n.id), n));
    return m;
  }, [allNovels]);

  const items = useMemo(() => {
    const set = new Set(favIds.map(String));
    return Array.from(set).map((id) => novelMap.get(id)).filter(Boolean);
  }, [favIds, novelMap]);

  // ---- 5) Bỏ ❤️ ----
  const handleRemove = async (id) => {
    const sId = String(id);
    // Optimistic UI
    setFavIds((prev) => prev.filter((x) => x !== sId));
    try {
      await removeFavUtil(sId); // utils đã lo API + fallback
    } finally {
      // đồng bộ lại từ local sau khi utils cập nhật
      setFavIds(getFavoriteIds().map(String));
    }
  };

  return (
    <>
      <Header favCount={favIds.length} />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Truyện yêu thích
          </h1>
          <div className="text-sm text-gray-500 font-extrabold">
            Tổng: <span className="font-extrabold">{items.length}</span> truyện
          </div>
        </div>

        {err && (
          <div className="mb-4 rounded-xl border border-pink-200 bg-pink-50 text-pink-700 px-4 py-3">
            {err}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-2 animate-pulse"
              >
                <div className="w-full h-56 bg-purple-100/60 rounded-lg" />
                <div className="p-2 space-y-2">
                  <div className="h-4 bg-purple-100/60 rounded w-4/5" />
                  <div className="h-3 bg-purple-100/60 rounded w-2/5" />
                  <div className="h-3 bg-purple-100/60 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <div className="text-4xl mb-2">💜</div>
            <h2 className="text-lg font-semibold mb-1">Chưa có truyện nào trong danh sách yêu thích</h2>
            <p className="text-gray-600 mb-4">
              Hãy vào trang chi tiết truyện và bấm <span className="font-medium">“Thêm vào yêu thích”</span>.
            </p>
            <Link
              to="/home"
              className="inline-block px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow hover:shadow-md transition"
            >
              Khám phá truyện
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
              >
                {/* Giữ nguyên đường dẫn UI cũ */}
                <Link to={`/detail/${b.id}`} className="block">
                  <img
                    src={b.cover}
                    alt={b.title}
                    className="w-full h-56 object-cover"
                  />
                </Link>
                <div className="p-4 flex-1 flex flex-col">
                  <Link to={`/detail/${b.id}`} className="font-semibold hover:underline line-clamp-2">
                    {b.title}
                  </Link>
                  <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {b.author}
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                    {b.description}
                  </p>
                  <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                    <Link
                      to={`/novel/${b.id}/chuong/1`}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:shadow transition"
                    >
                      Đọc ngay
                    </Link>
                    <button
                      onClick={() => handleRemove(b.id)}
                      className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50 transition"
                      title="Bỏ khỏi yêu thích"
                    >
                      Bỏ ❤️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
