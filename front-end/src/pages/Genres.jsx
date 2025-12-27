// src/pages/Genres.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api, API_BASE } from "../lib/api";

// =============== Helpers ==================
const BOOKS_PER_PAGE_OPTIONS = [6, 9, 12, 18];

const pickArray = (res) => {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.items)) return res.items;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
};

function BookCard({ book }) {
  return (
    <div className="group rounded-2xl border border-purple-200/70 bg-white p-4 shadow-sm hover:shadow-pink-100 transition-shadow">
      <div className="aspect-[3/4] w-full overflow-hidden rounded-xl ring-1 ring-purple-100">
        <img
          src={book.cover}
          alt={book.title}
          className="h-full w-full object-cover object-center group-hover:scale-[1.02] transition-transform"
          loading="lazy"
        />
      </div>
      <div className="mt-3 min-w-0">
        <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
          <Link to={`/novel/${book.id}`} className="hover:underline">
            {book.title}
          </Link>
        </h3>
        <p className="text-sm text-gray-600 mt-0.5">{book.author}</p>
        <p className="text-sm text-gray-700 mt-2 line-clamp-2">{book.description}</p>
      </div>
      <div className="mt-3">
        <Link
          to={`/novel/${book.id}`}
          className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
        >
          Đọc chi tiết
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
            <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7 7a.75.75 0 010 1.06l-7 7a.75.75 0 01-1.06-1.06l5.72-5.72H3.75a.75.75 0 010-1.5h14.94l-5.72-5.72a.75.75 0 010-1.06z" clipRule="evenodd"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-purple-200/70 p-4 animate-pulse bg-white">
      <div className="aspect-[3/4] w-full rounded-xl bg-purple-100/60" />
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-purple-100/60 rounded w-4/5" />
        <div className="h-3 bg-purple-100/60 rounded w-2/5" />
        <div className="h-3 bg-purple-100/60 rounded w-full" />
      </div>
      <div className="mt-3 h-8 bg-purple-100/60 rounded" />
    </div>
  );
}

export default function Genres() {
  const [sp, setSp] = useSearchParams();

  // --- state (đồng bộ URL như cũ) ---
  const [active, setActive] = useState(sp.get("g") || "");
  const [query, setQuery] = useState(sp.get("q") || "");
  const [sortBy, setSortBy] = useState(sp.get("sort") || "title-asc");
  const [pageSize, setPageSize] = useState(Number(sp.get("ps")) || 12);
  const [page, setPage] = useState(Number(sp.get("p")) || 1);

  // --- dữ liệu từ API ---
  const [genres, setGenres] = useState([]);     // tên thể loại
  const [allNovels, setAllNovels] = useState([]); // toàn bộ truyện
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // tải genres + novels
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr("");

    const loadGenres = async () => {
      try {
        const res = await api.getGenres();
        const arr = pickArray(res).map((g) =>
          typeof g === "string" ? g : g?.name || g?.title || ""
        );
        return arr.filter(Boolean);
      } catch {
        return [];
      }
    };

    const loadNovels = async () => {
      const url = new URL("/api/novels", API_BASE || window.location.origin);
      const res = await fetch(url.toString()).then((r) => r.json());
      const rows = pickArray(res);

      return rows.map((n) => ({
        id: n._id || n.id,
        title: n.title || "",
        cover: n.cover || n.image || "",
        author:
          n.authorName ||
          (typeof n.author === "string" ? n.author : n?.author?.name) ||
          "",
        description: n.description || "",
        genre: n.genre || n.genreName || "",
      }));
    };

    (async () => {
      try {
        const [g, books] = await Promise.all([loadGenres(), loadNovels()]);
        if (!mounted) return;

        setAllNovels(books);

        // nếu API genres rỗng → tự sinh từ novels
        if (g.length) setGenres(g);
        else {
          const derived = Array.from(
            new Set(books.map((b) => b.genre).filter(Boolean))
          ).sort((a, b) => a.localeCompare(b, "vi"));
          setGenres(derived);
        }

        // nếu chưa có active (lần đầu) → chọn thể loại đầu tiên
        setActive((prev) => prev || (g[0] || (books[0]?.genre ?? "")) || "");
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
  }, []);

  // Sync URL khi filter đổi
  useEffect(() => {
    const next = new URLSearchParams(sp);
    if (active) next.set("g", active); else next.delete("g");
    query ? next.set("q", query) : next.delete("q");
    next.set("sort", sortBy);
    next.set("ps", String(pageSize));
    next.set("p", String(page));
    setSp(next, { replace: true });
  }, [active, query, sortBy, pageSize, page]);

  // đếm số truyện theo thể loại
  const counts = useMemo(() => {
    const m = {};
    genres.forEach((g) => (m[g] = 0));
    allNovels.forEach((b) => {
      const g = b.genre || "Khác";
      m[g] = (m[g] || 0) + 1;
    });
    return m;
  }, [genres, allNovels]);

  // danh sách sách theo thể loại đang chọn
  const allBooks = useMemo(() => {
    return allNovels.filter((b) => (active ? b.genre === active : true));
  }, [allNovels, active]);

  // lọc + sắp xếp
  const filtered = useMemo(() => {
    let list = [...allBooks];
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          (b.description || "").toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "title-asc":
        list.sort((a, b) => a.title.localeCompare(b.title, "vi"));
        break;
      case "title-desc":
        list.sort((a, b) => b.title.localeCompare(a.title, "vi"));
        break;
      case "author-asc":
        list.sort((a, b) => a.author.localeCompare(b.author, "vi"));
        break;
      case "author-desc":
        list.sort((a, b) => b.author.localeCompare(a.author, "vi"));
        break;
      default:
        break;
    }

    return list;
  }, [allBooks, query, sortBy]);

  // phân trang
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // handlers
  function handlePickGenre(g) {
    setActive(g);
    setPage(1);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header onSearch={(kw) => { setQuery(kw || ""); setPage(1); }} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pb-16">
        {/* Title & search */}
        <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 mb-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50/80 backdrop-blur supports-[backdrop-filter]:bg-gradient-to-r supports-[backdrop-filter]:from-purple-50 supports-[backdrop-filter]:to-pink-50/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Thể loại</h1>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div>
                  <select
                    className="rounded-xl border-purple-200 focus:border-purple-500 focus:ring-pink-500"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="title-asc">Tên truyện A → Z</option>
                    <option value="title-desc">Tên truyện Z → A</option>
                    <option value="author-asc">Tác giả A → Z</option>
                    <option value="author-desc">Tác giả Z → A</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* layout: sidebar + grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar genres */}
          <aside className="lg:col-span-3">
            <div className="rounded-2xl border border-purple-200/70 bg-gradient-to-br from-purple-50 to-pink-50 p-4">
              <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Danh mục</h2>
              <ul className="mt-3 space-y-1">
                {genres.map((g) => (
                  <li key={g}>
                    <button
                      onClick={() => handlePickGenre(g)}
                      className={
                        "w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm border transition " +
                        (g === active
                          ? "text-white border-transparent bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-95"
                          : "bg-white text-gray-800 border-purple-200 hover:border-pink-300")
                      }
                    >
                      <span className="truncate">{g}</span>
                      <span
                        className={
                          "ml-2 inline-flex items-center justify-center rounded-full px-2 min-w-[2rem] h-6 text-xs " +
                          (g === active ? "bg-white/20" : "bg-purple-50 text-gray-700")
                        }
                      >
                        {counts[g] || 0}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Content grid */}
          <section className="lg:col-span-9">
            <div className="mb-4 text-sm text-gray-600">
              Thể loại: <span className="font-semibold text-gray-900">{active || "—"}</span> ·
              Tìm thấy <span className="font-semibold text-gray-900">{filtered.length}</span> truyện · Trang {page}/{totalPages}
            </div>

            {err && (
              <div className="mb-4 rounded-xl border border-pink-200 bg-pink-50 text-pink-700 px-4 py-3">
                {err}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: pageSize }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {paged.map((b) => (
                  <BookCard key={b.id} book={b} />
                ))}
              </div>
            )}

            {/* pagination */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-gray-600">
                Hiển thị
                <select
                  className="ml-2 rounded-lg border-purple-200 focus:border-purple-500 focus:ring-pink-500"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  {BOOKS_PER_PAGE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}/trang
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 rounded-lg border border-purple-200 hover:bg-purple-50 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Trước
                </button>
                <span className="text-sm text-gray-700">
                  {page}/{totalPages}
                </span>
                <button
                  className="px-3 py-1.5 rounded-lg border border-purple-200 hover:bg-purple-50 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Sau
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
