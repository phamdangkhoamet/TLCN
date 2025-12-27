import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { api, API_BASE } from "../lib/api";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";

export default function Home() {
  // từ khóa nhận từ Header (lọc TẠI CHỖ toàn trang)
  const [query, setQuery] = useState("");

  //chatbot
  useEffect(() => {
    const s1 = document.createElement("script");
    s1.src = "https://cdn.botpress.cloud/webchat/v3.4/inject.js";
    s1.async = true;
    document.body.appendChild(s1);
  
    const s2 = document.createElement("script");
    s2.src = "https://files.bpcontent.cloud/2025/12/06/04/20251206044628-DXDO91RJ.js";
    s2.defer = true;
    document.body.appendChild(s2);
  
    return () => {
      document.body.removeChild(s1);
      document.body.removeChild(s2);
    };
  }, []);

  // data từ API
  const [genres, setGenres] = useState([]);       // danh sách thể loại (nếu API có)
  const [posters, setPosters] = useState([]);     // slider
  const [allNovels, setAllNovels] = useState([]); // toàn bộ truyện

  const [loading, setLoading] = useState(true);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [loadingNovels, setLoadingNovels] = useState(true);
  const [err, setErr] = useState("");

  // Helpers -------------------------------------------------
  const pickArray = (res) => {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.items)) return res.items;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  };

  // 1) tải genres + posters (song song) khi mount
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr("");

    Promise.all([api.getGenres(), api.getPosters()])
      .then(([genresRes, postersRes]) => {
        if (!mounted) return;

        // Genres có thể là array string hoặc object {name}
        const rawGenres = pickArray(genresRes);
        const normGenres = rawGenres
          .map((g) => (typeof g === "string" ? g : g?.name || g?.title || ""))
          .filter(Boolean);

        const rawPosters = pickArray(postersRes);
        const normPosters = rawPosters
          .map((p) => ({
            id: p._id || p.id || String(Math.random()),
            title: p.title || "",
            image: p.image || p.url || "",
            link: p.link || "/",
            order: p.order ?? 0,
          }))
          .sort((a, b) => a.order - b.order);

        setGenres(normGenres);
        setPosters(normPosters);
        setLoadingGenres(false);
      })
      .catch((e) => {
        if (!mounted) return;
        setErr(e.message || "Lỗi tải dữ liệu");
        setLoadingGenres(false);
      })
      .finally(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  // 2) tải toàn bộ novels một lần từ /api/novels
  useEffect(() => {
    let mounted = true;
    setLoadingNovels(true);
    setErr("");

    fetch(new URL("/api/novels", API_BASE || window.location.origin))
      .then((r) => r.json())
      .then((res) => {
        if (!mounted) return;
        const rows = pickArray(res);

        // Chuẩn hoá các trường cần cho UI
        const norm = rows.map((n) => ({
          id: n._id || n.id,
          title: n.title || "",
          cover: n.cover || n.image || "",
          genre: n.genre || n.genreName || "",
          authorName:
            n.authorName ||
            (typeof n.author === "string" ? n.author : n?.author?.name) ||
            "",
        }));
        setAllNovels(norm);

        // Nếu API /genres rỗng, tự sinh danh sách thể loại từ novels
        setGenres((prev) => {
          if (prev && prev.length) return prev;
          const s = Array.from(new Set(norm.map((x) => x.genre).filter(Boolean)));
          return s.sort((a, b) => a.localeCompare(b, "vi"));
        });
      })
      .catch((e) => {
        if (!mounted) return;
        setErr(e.message || "Lỗi tải truyện");
      })
      .finally(() => setLoadingNovels(false));

    return () => {
      mounted = false;
    };
  }, []);

  // 3) Lọc theo từ khoá & nhóm theo thể loại, giới hạn 5 truyện/nhóm nếu không có query
  const byGenre = useMemo(() => {
    const q = query.trim().toLowerCase();
    const src = q
      ? allNovels.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.authorName.toLowerCase().includes(q) ||
            n.genre.toLowerCase().includes(q)
        )
      : allNovels;

    const grouped = src.reduce((m, n) => {
      const g = n.genre || "Khác";
      if (!m[g]) m[g] = [];
      m[g].push(n);
      return m;
    }, {});

    // đảm bảo thứ tự section theo mảng genres (nếu có)
    const ordered = {};
    (genres.length ? genres : Object.keys(grouped)).forEach((g) => {
      const list = grouped[g] || [];
      ordered[g] = q ? list : list.slice(0, 5); // không query -> chỉ 5
    });

    return ordered;
  }, [allNovels, genres, query]);

  const totalFound = useMemo(
    () => Object.values(byGenre).reduce((acc, arr) => acc + (arr?.length || 0), 0),
    [byGenre]
  );

  // UI ------------------------------------------------------
  return (
    <>
      {/* Header gọi onSearch để lọc tại chỗ, KHÔNG chuyển trang */}
      <Header onSearch={(kw) => setQuery(kw || "")} />

      {/* Slider Poster */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <Swiper
          spaceBetween={20}
          slidesPerView={1}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop
          modules={[Autoplay]}
          className="rounded-2xl overflow-hidden shadow-lg"
        >
          {(posters || []).map((poster) => (
            <SwiperSlide key={poster.id}>
              <Link to={poster.link || "/"} className="block relative">
                <img
                  src={poster.image}
                  alt={poster.title}
                  className="w-full h-72 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center px-6">
                  <h2 className="text-white text-xl font-bold drop-shadow-lg">
                    {poster.title}
                  </h2>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <main className="bg-white min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between gap-3 mb-8">
            <h2 className="text-3xl font-bold">Thư viện tiểu thuyết</h2>
            {query.trim() ? (
              <div className="text-sm text-gray-600">
                Từ khóa: <span className="font-medium text-gray-900">“{query}”</span> ·
                Tìm thấy <span className="font-semibold text-gray-900">{totalFound}</span> truyện
                <button
                  onClick={() => setQuery("")}
                  className="ml-3 rounded-lg px-2 py-1 border border-purple-200 hover:bg-purple-50"
                >
                  Xóa lọc
                </button>
              </div>
            ) : null}
          </div>

          {/* Lỗi tổng quát */}
          {err && (
            <div className="mb-6 rounded-xl border border-pink-200 bg-pink-50 text-pink-700 px-4 py-3">
              {err}
            </div>
          )}

          {/* Loading skeleton thể loại (lần đầu) */}
          {loadingGenres && (
            <div className="grid grid-cols-1 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-6 w-48 bg-purple-100 rounded mb-3" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="rounded-xl border border-purple-100 p-2">
                        <div className="h-48 bg-purple-100/60 rounded" />
                        <div className="h-4 bg-purple-100/60 rounded mt-2 w-3/4" />
                        <div className="h-3 bg-purple-100/60 rounded mt-1 w-1/2" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Danh mục theo thể loại (giống UI cũ) */}
          {!loadingGenres &&
            (genres.length ? genres : Object.keys(byGenre)).map((genre) => {
              const list = byGenre[genre] || [];
              if (query.trim() && list.length === 0) return null;

              return (
                <section key={genre} className="mb-10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">
                      {genre}
                      <span className="ml-2 text-sm font-normal text-gray-600">
                        ({list.length})
                      </span>
                    </h3>

                    {!query.trim() && (
                      <Link
                        to={`/category/${encodeURIComponent(genre)}`}
                        className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 
                                   font-medium hover:font-bold hover:scale-105 transition inline-flex items-center gap-1"
                      >
                        Xem tất cả
                        <span className="text-lg">→</span>
                      </Link>
                    )}
                  </div>

                  {/* loading novels theo thể loại */}
                  {loadingNovels && !query.trim() && (!list || list.length === 0) ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 animate-pulse">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div key={j} className="rounded-xl border border-purple-100 p-2">
                          <div className="h-48 bg-purple-100/60 rounded" />
                          <div className="h-4 bg-purple-100/60 rounded mt-2 w-3/4" />
                          <div className="h-3 bg-purple-100/60 rounded mt-1 w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : list.length === 0 ? (
                    <div className="rounded-xl border border-purple-200 p-6 text-gray-600">
                      Không có truyện phù hợp trong “{genre}”.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {list.map((novel) => (
                        <Link
                          key={novel.id}
                          to={`/novel/${novel.id}`}
                          className="card p-2 cursor-pointer hover:scale-110 hover:shadow-xl transition transform duration-300 block"
                        >
                          <img
                            src={novel.cover}
                            alt={novel.title}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <p className="mt-2 text-sm font-medium">{novel.title}</p>
                          <p className="text-xs text-gray-500">{novel.authorName || ""}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}

          {/* Nếu lọc toàn trang mà không có gì */}
          {query.trim() && totalFound === 0 && !loadingNovels && (
            <div className="rounded-2xl border border-purple-200 p-8 text-center text-gray-600">
              Không tìm thấy kết quả cho từ khóa “{query}”.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
