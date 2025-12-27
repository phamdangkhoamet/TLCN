// front-end/src/pages/Authors.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Authors() {
  const [authors, setAuthors] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAuthors();
  }, []);

  async function loadAuthors(page = 1) {
    try {
      setLoading(true);
      const data = await api.authors.list({ page });
      setAuthors(data.items || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error("Load authors error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          {/* Title block */}
          <div className="bg-white shadow-sm rounded-2xl px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Danh sách tác giả
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Khám phá những tác giả và tác phẩm đang được yêu thích trên DKStory.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500">
              {pagination && (
                <>
                  <span>
                    Trang{" "}
                    <span className="font-semibold text-gray-800">
                      {pagination.page}
                    </span>{" "}
                    / {pagination.totalPages}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">
                    Tổng{" "}
                    <span className="font-semibold text-gray-800">
                      {pagination.total}
                    </span>{" "}
                    tác giả
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Loading / empty state */}
          {loading && (
            <div className="bg-white shadow-sm rounded-2xl px-6 py-10 flex justify-center">
              <div className="flex items-center gap-3 text-gray-600">
                <span className="inline-block h-4 w-4 rounded-full border-2 border-purple-300 border-t-transparent animate-spin" />
                <span>Đang tải danh sách tác giả...</span>
              </div>
            </div>
          )}

          {!loading && authors.length === 0 && (
            <div className="bg-white shadow-sm rounded-2xl px-6 py-10 text-center text-gray-500 text-sm">
              Hiện chưa có tác giả nào.
            </div>
          )}

          {/* Grid tác giả */}
          {authors.length > 0 && (
            <div className="bg-white shadow-sm rounded-2xl px-4 py-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {authors.map((a) => (
                  <div
                    key={a._id}
                    className="border border-gray-200 rounded-2xl p-4 flex flex-col items-center bg-white hover:shadow-md hover:border-purple-200 transition"
                  >
                    <div className="relative mb-3">
                      <img
                        src={a.avatar || "https://via.placeholder.com/120"}
                        alt={a.name}
                        className="w-24 h-24 rounded-full object-cover ring-2 ring-purple-100"
                      />
                      <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-purple-600 text-[11px] text-white shadow">
                        {a.worksCount || 0} TP
                      </div>
                    </div>

                    <h2 className="font-semibold text-base md:text-lg text-center text-gray-800 line-clamp-2">
                      {a.name}
                    </h2>

                    {a.country && (
                      <p className="text-xs text-gray-500 mt-1">
                        {a.country}
                      </p>
                    )}

                    {a.bio && (
                      <p className="text-xs text-gray-600 mt-2 text-center line-clamp-3">
                        {a.bio}
                      </p>
                    )}

                    <div className="flex gap-3 text-[11px] text-gray-500 mt-3">
                      <span>
                        {a.worksCount || 0} tác phẩm
                      </span>
                      <span>•</span>
                      <span>
                        {a.followersCount || 0} người theo dõi
                      </span>
                    </div>

                    <Link
                      to={`/author/${a._id}`}
                      className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 text-xs md:text-sm rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 font-medium transition"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-2">
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => loadAuthors(p)}
                  className={`px-3 py-1.5 rounded-full text-sm border text-gray-700 transition ${
                    p === pagination.page
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-sm"
                      : "bg-white hover:bg-gray-50 border-gray-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
