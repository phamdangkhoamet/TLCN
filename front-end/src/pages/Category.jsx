// src/pages/Category.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api, API_BASE } from "../lib/api";

export default function Category() {
  const { genre } = useParams(); // ví dụ: "Phiêu lưu"
  const [books, setBooks] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // Chuẩn hóa mảng trả về từ API (hỗ trợ cả {items:[]})
  const pickArray = (res) => {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.items)) return res.items;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr("");

    // Cách 1: dùng hàm sẵn có trong api.js (nếu backend hỗ trợ ?genre=)
    const fetchByGenre = async () => {
      try {
        const res = await api.getNovelsByGenre({ genre, q: undefined, limit: undefined });
        const arr = pickArray(res);
        if (arr.length) return arr;
      } catch {}
      return [];
    };

    // Cách 2 (fallback): lấy toàn bộ /api/novels rồi lọc theo genre
    const fetchAllAndFilter = async () => {
      const url = new URL("/api/novels", API_BASE || window.location.origin);
      const res = await fetch(url.toString()).then((r) => r.json());
      const all = pickArray(res);
      return all.filter((n) => (n.genre || "").trim() === (genre || "").trim());
    };

    (async () => {
      try {
        let rows = await fetchByGenre();
        if (!rows.length) rows = await fetchAllAndFilter();

        if (!mounted) return;

        const normalized = rows.map((n) => ({
          id: n._id || n.id,
          title: n.title || "",
          cover: n.cover || n.image || "",
          author:
            n.authorName ||
            (typeof n.author === "string" ? n.author : n?.author?.name) ||
            "",
        }));

        setBooks(normalized);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || "Lỗi tải dữ liệu");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [genre]);

  const title = useMemo(() => genre || "Thể loại", [genre]);

  return (
    <>
      <Header />

      {/* Hiệu ứng fade-in toàn trang */}
      <div className="max-w-7xl mx-auto px-6 py-10 animate-fadeIn">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <Link
          to="/home"
          className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 
                     font-medium hover:font-bold transition inline-flex items-center gap-1"
        >
          ← Quay lại
        </Link>

        {/* Thông báo lỗi */}
        {err && (
          <div className="mt-4 rounded-xl border border-pink-200 bg-pink-50 text-pink-700 px-4 py-3">
            {err}
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mt-6 animate-pulse">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-2 shadow-md">
                <div className="w-full h-56 bg-purple-100/60 rounded-lg" />
                <div className="h-4 bg-purple-100/60 rounded mt-2 w-3/4" />
                <div className="h-3 bg-purple-100/60 rounded mt-1 w-1/2" />
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="mt-6 rounded-xl border border-purple-200 p-6 text-gray-600">
            Không có truyện phù hợp trong “{title}”.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mt-6">
            {books.map((book) => (
              <Link
                key={book.id}
                to={`/novel/${book.id}`}
                className="bg-white rounded-lg p-2 shadow-md cursor-pointer 
                           transform transition duration-300 hover:scale-105 hover:shadow-xl block"
              >
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-56 object-cover rounded-lg"
                />
                <p className="mt-2 text-sm font-semibold">{book.title}</p>
                <p className="text-xs text-gray-500">{book.author}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
