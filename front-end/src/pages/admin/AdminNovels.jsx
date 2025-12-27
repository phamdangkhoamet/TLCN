// src/pages/admin/AdminNovels.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../components/admin/AdminHeader";
import { api } from "../../lib/api";

export default function AdminNovels() {
  const navigate = useNavigate();

  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // text search nhận từ AdminHeader (Tìm trong trang này...)
  const [searchText, setSearchText] = useState("");

  // ===== Load novels từ backend =====
  useEffect(() => {
    loadNovels();
  }, []);

  async function loadNovels() {
    try {
      setLoading(true);
      setError("");
      const res = await api.admin.novels.list(); // GET /api/admin/novels
      setNovels(res.items || []);
    } catch (err) {
      console.error("Load novels error:", err);
      setError(err.message || "Lỗi tải danh sách tác phẩm.");
    } finally {
      setLoading(false);
    }
  }

  // ===== Lọc nhẹ theo ô search (title / authorName / genre) =====
  const visibleNovels = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return novels; // không search => hiện TẤT CẢ

    return novels.filter((n) => {
      const title = (n.title || "").toLowerCase();
      const authorName =
        (n.authorName ||
          (typeof n.authorId === "object" ? n.authorId?.name : "") ||
          ""
        ).toLowerCase();
      const genre = (n.genre || "").toLowerCase();

      return (
        title.includes(q) ||
        authorName.includes(q) ||
        genre.includes(q)
      );
    });
  }, [novels, searchText]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Admin header – truyền onSearch để filter cục bộ */}
      <AdminHeader onSearch={setSearchText} />

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Tiêu đề + nút thêm */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Quản lý tác phẩm
            </h1>
          </div>

          <button
            onClick={() => navigate("/admin/novels/new")}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
          >
            + Thêm tác phẩm
          </button>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="mb-4 rounded-2xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm text-pink-800">
            {error}
          </div>
        )}

        {/* Nội dung chính */}
        {loading ? (
          // Skeleton loading
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 animate-pulse">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 bg-white p-3"
              >
                <div className="h-36 rounded-xl bg-gray-100" />
                <div className="mt-3 h-4 w-3/4 rounded bg-gray-100" />
                <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : visibleNovels.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-gray-500">
            Hiện chưa có tác phẩm nào phù hợp với tìm kiếm.
            <br />
            <span className="text-xs text-gray-400">
              (Nếu bạn không nhập gì vào ô tìm kiếm, tất cả tác phẩm sẽ được hiển thị.)
            </span>
          </div>
        ) : (
          // GRID 5 CỘT – CARD NGẮN
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {visibleNovels.map((n) => {
              const authorName =
                n.authorName ||
                (typeof n.authorId === "object" ? n.authorId?.name : "") ||
                "—";

              return (
                <div
                  key={n._id}
                  className="group flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  {/* COVER */}
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/novels/${n._id}`)}
                    className="relative block"
                  >
                    <img
                      src={
                        n.cover ||
                        "https://via.placeholder.com/300x400?text=No+Cover"
                      }
                      alt={n.title}
                      className="h-36 w-full object-cover"
                    />
                  </button>

                  {/* INFO */}
                  <div className="p-2 flex flex-col flex-1">
                    <div
                      className="text-sm font-semibold line-clamp-2 cursor-pointer hover:text-purple-600"
                      onClick={() => navigate(`/admin/novels/${n._id}`)}
                    >
                      {n.title || "—"}
                    </div>

                    <div className="text-[11px] text-gray-500 line-clamp-1 mt-1">
                      {authorName}
                      {n.genre ? ` • ${n.genre}` : ""}
                    </div>

                    <div className="text-[10px] text-gray-400 mt-1 flex justify-between">
                      <span>
                        {typeof n.chaptersCount === "number"
                          ? `${n.chaptersCount} chương`
                          : "— chương"}
                      </span>
                      <span>
                        {n.createdAt
                          ? new Date(n.createdAt).toLocaleDateString("vi-VN")
                          : ""}
                      </span>
                    </div>

                    {/* BUTTON */}
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/novels/${n._id}`)}
                      className="mt-2 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 transition"
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
