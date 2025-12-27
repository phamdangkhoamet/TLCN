// src/pages/admin/AdminNovelDetail.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import AdminHeader from "../../components/admin/AdminHeader";
import { api } from "../../lib/api";

export default function AdminNovelDetail({ mode: propMode }) {
  const { id } = useParams(); // /admin/novels/:id
  const location = useLocation();
  const navigate = useNavigate();

  const isCreate =
    propMode === "create" || location.pathname.endsWith("/new");

  const [loading, setLoading] = useState(!isCreate);
  const [saving, setSaving] = useState(false);

  const [novel, setNovel] = useState({
    title: "",
    authorName: "",
    authorId: "",
    genre: "",
    cover: "",
    description: "",
  });

  const [chapters, setChapters] = useState([]);

  // ===== Danh sách tác giả (từ User) để chọn =====
  const [authors, setAuthors] = useState([]);
  const [loadingAuthors, setLoadingAuthors] = useState(true);

  // ===== Popup thông báo đơn giản =====
  const [toast, setToast] = useState({
    open: false,
    message: "",
  });

  const showToast = (message) => {
    setToast({ open: true, message });
  };

  const closeToast = () => {
    setToast({ open: false, message: "" });
  };

  useEffect(() => {
    loadAuthors();
  }, []);

  async function loadAuthors() {
    try {
      setLoadingAuthors(true);
      const res = await api.admin.authors.list();
      setAuthors(res.items || res.authors || []);
    } catch (err) {
      console.error("Load authors error:", err);
    } finally {
      setLoadingAuthors(false);
    }
  }

  const selectedAuthorName = useMemo(() => {
    if (!novel.authorId) return "";
    const found = authors.find((a) => String(a._id) === String(novel.authorId));
    return found?.name || "";
  }, [authors, novel.authorId]);

  // ===== Load novel + chapters nếu là edit =====
  useEffect(() => {
    if (!isCreate && id) {
      load();
    }
  }, [isCreate, id]);

  async function load() {
    try {
      setLoading(true);
      const res = await api.admin.novels.get(id);

      setNovel({
        title: res.novel.title || "",
        authorName: res.novel.authorName || "",
        authorId: res.novel.authorId || "",
        genre: res.novel.genre || "",
        cover: res.novel.cover || "",
        description: res.novel.description || "",
      });

      setChapters(res.chapters || []);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Lỗi tải tác phẩm");
      navigate("/admin/novels");
    } finally {
      setLoading(false);
    }
  }

  // ===== Lưu / cập nhật novel =====
  async function saveNovel() {
    try {
      if (!novel.title.trim()) {
        showToast("Vui lòng nhập tên tác phẩm.");
        return;
      }
      if (!novel.authorId) {
        showToast("Vui lòng chọn tác giả.");
        return;
      }

      setSaving(true);

      const payload = {
        title: novel.title,
        authorId: novel.authorId,
        genre: novel.genre,
        cover: novel.cover,
        description: novel.description,
      };

      let res;
      if (isCreate) {
        res = await api.admin.novels.create(payload);
        const newId = res.novel._id;
        showToast("Tạo tác phẩm thành công!");
        navigate(`/admin/novels/${newId}`);
      } else {
        res = await api.admin.novels.update(id, payload);
        showToast("Cập nhật tác phẩm thành công!");
        setNovel((prev) => ({
          ...prev,
          title: res.novel.title || prev.title,
          authorName: res.novel.authorName || prev.authorName,
          authorId: res.novel.authorId || prev.authorId,
          genre: res.novel.genre || prev.genre,
          cover: res.novel.cover || prev.cover,
          description: res.novel.description || prev.description,
        }));
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || "Lỗi lưu tác phẩm");
    } finally {
      setSaving(false);
    }
  }

  // ===== Xóa novel =====
  async function deleteNovel() {
    if (isCreate) {
      navigate("/admin/novels");
      return;
    }
    if (!window.confirm("Bạn chắc chắn muốn xóa tác phẩm và toàn bộ chương?"))
      return;
    try {
      await api.admin.novels.remove(id);
      showToast("Đã xóa tác phẩm.");
      navigate("/admin/novels");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Lỗi xóa tác phẩm");
    }
  }

  // ===== Đi tới trang quản lý chương (list/add/edit riêng) =====
  function goManageChapters() {
    if (!id) return;
    navigate(`/admin/chapters?novelId=${id}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <AdminHeader />
        <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
          <p>Đang tải thông tin tác phẩm...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AdminHeader />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top: title + action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {isCreate ? "Thêm tác phẩm mới" : "Chi tiết tác phẩm"}
            </h1>
            {!isCreate && (
              <p className="text-sm text-gray-600 mt-1">
                Quản lý thông tin tác phẩm. Chương truyện được chỉnh sửa ở trang riêng.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {!isCreate && (
              <button
                onClick={deleteNovel}
                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Xóa tác phẩm
              </button>
            )}
            <button
              onClick={saveNovel}
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 disabled:opacity-60"
            >
              {saving
                ? "Đang lưu..."
                : isCreate
                ? "Tạo tác phẩm"
                : "Lưu thay đổi"}
            </button>
          </div>
        </div>

        {/* Form thông tin tác phẩm */}
        <section className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Thông tin tác phẩm
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Tên truyện
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-purple-200 px-3 py-2 text-sm focus:border-purple-500 focus:ring-pink-500"
                  value={novel.title}
                  onChange={(e) =>
                    setNovel((n) => ({ ...n, title: e.target.value }))
                  }
                  placeholder="Tên tác phẩm..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Chọn tác giả từ danh sách có sẵn */}
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Tác giả
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-xl border border-purple-200 px-3 py-2 text-sm bg-white focus:border-purple-500 focus:ring-pink-500"
                      value={novel.authorId}
                      onChange={(e) => {
                        const authorId = e.target.value;
                        const found = authors.find(
                          (a) => String(a._id) === String(authorId)
                        );
                        setNovel((n) => ({
                          ...n,
                          authorId,
                          authorName: found?.name || n.authorName,
                        }));
                      }}
                      disabled={loadingAuthors}
                    >
                      <option value="">
                        {loadingAuthors
                          ? "Đang tải danh sách tác giả..."
                          : "-- Chọn tác giả --"}
                      </option>
                      {authors.map((a) => (
                        <option key={a._id} value={a._id}>
                          {a.name} {a.email ? `(${a.email})` : ""}
                        </option>
                      ))}
                    </select>
                    {/* icon mũi tên xuống để cảm giác dropdown thả xuống */}
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      >
                        <path
                          d="M6 9l6 6 6-6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Tên hiển thị:&nbsp;
                    <span className="font-medium">
                      {selectedAuthorName ||
                        novel.authorName ||
                        "Chưa chọn tác giả"}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Thể loại
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-purple-200 px-3 py-2 text-sm focus:border-purple-500 focus:ring-pink-500"
                    value={novel.genre}
                    onChange={(e) =>
                      setNovel((n) => ({ ...n, genre: e.target.value }))
                    }
                    placeholder="VD: Tiên hiệp, Huyền huyễn..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Mô tả
                </label>
                <textarea
                  className="w-full rounded-xl border border-purple-200 px-3 py-2 text-sm focus:border-purple-500 focus:ring-pink-500"
                  rows={4}
                  value={novel.description}
                  onChange={(e) =>
                    setNovel((n) => ({ ...n, description: e.target.value }))
                  }
                  placeholder="Tóm tắt nội dung truyện..."
                />
              </div>
            </div>

            {/* Cover preview */}
            <div className="space-y-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Ảnh bìa (URL)
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-purple-200 px-3 py-2 text-sm focus:border-purple-500 focus:ring-pink-500"
                value={novel.cover}
                onChange={(e) =>
                  setNovel((n) => ({ ...n, cover: e.target.value }))
                }
                placeholder="https://..."
              />
              <div className="mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                <img
                  src={novel.cover || "https://via.placeholder.com/240x320"}
                  alt="cover preview"
                  className="w-full h-56 object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Quản lý chương: chỉ overview + nút chuyển trang */}
        {!isCreate && (
          <section className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Chương truyện
                </h2>
              </div>
              <button
                onClick={goManageChapters}
                className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Quản lý chương
              </button>
            </div>

            {chapters.length === 0 ? (
              <p className="text-sm text-gray-600">
                Chưa có chương nào cho tác phẩm này.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-3 py-2 text-left w-16">#</th>
                      <th className="px-3 py-2 text-left">Tiêu đề</th>
                      <th className="px-3 py-2 text-left w-40">Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chapters.map((c) => (
                      <tr key={c._id} className="border-t">
                        <td className="px-3 py-2 align-top">{c.no}</td>
                        <td className="px-3 py-2 align-top">
                          <div className="font-medium">
                            {c.title || `Chương ${c.no}`}
                          </div>
                          {c.content && (
                            <div className="mt-1 text-xs text-gray-500 line-clamp-2">
                              {c.content}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 align-top text-xs text-gray-500">
                          {c.createdAt
                            ? new Date(c.createdAt).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Popup thông báo */}
      {toast.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-xl text-center">
            <p className="text-sm text-gray-800 whitespace-pre-line">
              {toast.message}
            </p>
            <button
              onClick={closeToast}
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
