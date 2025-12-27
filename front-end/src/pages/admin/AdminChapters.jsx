// src/pages/admin/AdminChapters.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminHeader from "../../components/admin/AdminHeader";
import { api } from "../../lib/api";

// hook đọc query ?novelId=
function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function AdminChapters() {
  const query = useQuery();
  const navigate = useNavigate();

  const initialNovelId = query.get("novelId") || "";

  const [novels, setNovels] = useState([]);
  const [loadingNovels, setLoadingNovels] = useState(true);

  const [chapters, setChapters] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(true);

  const [filterNovelId, setFilterNovelId] = useState(initialNovelId);
  const [searchText, setSearchText] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [formSaving, setFormSaving] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);

  const [form, setForm] = useState({
    novelId: "",
    no: "",
    title: "",
    content: "",
  });

  // Popup thông báo đơn giản
  const [toast, setToast] = useState({ open: false, message: "" });
  const showToast = (message) => setToast({ open: true, message });
  const closeToast = () => setToast({ open: false, message: "" });

  // Nhận onSearch từ AdminHeader
  function handleHeaderSearch(q) {
    setSearchText((q || "").toLowerCase());
  }

  // ===== Load novels để lọc & chọn =====
  useEffect(() => {
    loadNovels();
  }, []);

  async function loadNovels() {
    try {
      setLoadingNovels(true);
      const res = await api.admin.novels.list();
      setNovels(res.items || res.novels || []);
    } catch (err) {
      console.error("Load novels error:", err);
      showToast(err.message || "Lỗi tải danh sách tác phẩm");
    } finally {
      setLoadingNovels(false);
    }
  }

  // ===== Load chapters mỗi khi filterNovelId đổi =====
  useEffect(() => {
    loadChapters();
    // sync query trên URL
    const params = new URLSearchParams(window.location.search);
    if (filterNovelId) params.set("novelId", filterNovelId);
    else params.delete("novelId");
    const newUrl =
      window.location.pathname +
      (params.toString() ? "?" + params.toString() : "");
    window.history.replaceState(null, "", newUrl);
  }, [filterNovelId]);

  async function loadChapters() {
    try {
      setLoadingChapters(true);
      const params = {};
      if (filterNovelId) params.novelId = filterNovelId;

      const res = await api.admin.chapters.list(params);
      setChapters(res.items || res.chapters || []);
    } catch (err) {
      console.error("Load chapters error:", err);
      showToast(err.message || "Lỗi tải danh sách chương");
      setChapters([]);
    } finally {
      setLoadingChapters(false);
    }
  }

  // ===== Map novelId -> title để hiển thị nhanh =====
  const novelMap = useMemo(() => {
    const m = {};
    for (const n of novels) {
      m[String(n._id)] = n;
    }
    return m;
  }, [novels]);

  // ===== Lọc theo searchText (tiêu đề / số chương / tên truyện) =====
  const filteredChapters = useMemo(() => {
    const s = searchText.trim();
    if (!s) return chapters;

    return chapters.filter((c) => {
      const novel = novelMap[String(c.novelId)] || {};
      const txt =
        `${c.no || ""} ${c.title || ""} ${novel.title || ""}`.toLowerCase();
      return txt.includes(s);
    });
  }, [chapters, searchText, novelMap]);

  // ===== Bắt đầu thêm chương =====
  function startCreate() {
    if (!filterNovelId && novels.length === 0) {
      showToast("Chưa có tác phẩm nào để thêm chương.");
      return;
    }

    setEditingChapter(null);
    setForm({
      novelId: filterNovelId || (novels[0]?._id || ""),
      no: "",
      title: "",
      content: "",
    });
    setShowForm(true);
  }

  // ===== Bắt đầu sửa chương =====
  function startEdit(ch) {
    setEditingChapter(ch);
    setForm({
      novelId: ch.novelId || "",
      no: ch.no ?? "",
      title: ch.title || "",
      content: ch.content || "",
    });
    setShowForm(true);
  }

  // ===== Lưu (thêm / sửa) chương =====
  async function submitForm(e) {
    e.preventDefault();
    if (!form.novelId) {
      showToast("Vui lòng chọn tác phẩm.");
      return;
    }
    if (!String(form.title || "").trim()) {
      showToast("Vui lòng nhập tiêu đề chương.");
      return;
    }

    try {
      setFormSaving(true);

      const payload = {
        title: form.title,
        content: form.content,
      };
      if (form.no !== "" && form.no !== null) {
        payload.no = Number(form.no);
      }

      if (!editingChapter) {
        // Thêm mới
        await api.admin.chapters.create(form.novelId, payload);
        showToast("Thêm chương mới thành công!");
      } else {
        // Cập nhật
        await api.admin.chapters.update(editingChapter._id, {
          ...payload,
          novelId: form.novelId,
        });
        showToast("Cập nhật chương thành công!");
      }

      setShowForm(false);
      // Reload list
      await loadChapters();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Lỗi lưu chương");
    } finally {
      setFormSaving(false);
    }
  }

  // ===== Xóa chương =====
  async function removeChapter(ch) {
    if (!window.confirm(`Xóa chương ${ch.no} - "${ch.title || ""}" ?`)) return;
    try {
      await api.admin.chapters.remove(ch._id);
      showToast("Đã xóa chương.");
      await loadChapters();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Lỗi xóa chương");
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AdminHeader onSearch={handleHeaderSearch} />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Tiêu đề + action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Quản lý chương truyện
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadChapters}
              className="rounded-xl border border-purple-200 px-4 py-2 text-sm text-gray-800 hover:bg-purple-50"
            >
              Làm mới
            </button>
            <button
              onClick={startCreate}
              className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
            >
              + Thêm chương
            </button>
          </div>
        </div>

        {/* Bộ lọc theo tác phẩm */}
        <section className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Chọn tác phẩm
              </label>
              <div className="relative">
                <select
                  className="w-full appearance-none rounded-xl border border-purple-200 px-3 py-2 text-sm bg-white focus:border-purple-500 focus:ring-pink-500"
                  value={filterNovelId}
                  onChange={(e) => setFilterNovelId(e.target.value)}
                  disabled={loadingNovels}
                >
                  <option value="">
                    {loadingNovels ? "Đang tải tác phẩm..." : "— Tất cả —"}
                  </option>
                  {novels.map((n) => (
                    <option key={n._id} value={n._id}>
                      {n.title}
                    </option>
                  ))}
                </select>
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
            </div>
    
          </div>
        </section>

        {/* Bảng danh sách chương */}
        <section className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm">
          {loadingChapters ? (
            <p className="text-sm text-gray-600">Đang tải danh sách chương…</p>
          ) : filteredChapters.length === 0 ? (
            <p className="text-sm text-gray-600">
              Chưa có chương nào phù hợp điều kiện lọc.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-3 py-2 text-left w-16">STT</th>
                    <th className="px-3 py-2 text-left w-24">Chương</th>
                    <th className="px-3 py-2 text-left">Tiêu đề</th>
                    <th className="px-3 py-2 text-left w-56">Tác phẩm</th>
                    <th className="px-3 py-2 text-left w-44">Ngày đăng</th>
                    <th className="px-3 py-2 text-left w-32"> </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChapters.map((c, idx) => {
                    const novel = novelMap[String(c.novelId)] || {};
                    return (
                      <tr key={c._id} className="border-t">
                        <td className="px-3 py-2 align-top text-xs text-gray-500">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2 align-top font-medium">
                          {c.no}
                        </td>
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
                        <td className="px-3 py-2 align-top">
                          <div className="font-medium text-gray-800 line-clamp-2">
                            {novel.title || "—"}
                          </div>
                        </td>
                        <td className="px-3 py-2 align-top text-xs text-gray-500">
                          {c.createdAt
                            ? new Date(c.createdAt).toLocaleString()
                            : "-"}
                        </td>
                        <td className="px-3 py-2 align-top">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => startEdit(c)}
                              className="text-l font-bold text-blue-600 hover:underline"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => removeChapter(c)}
                              className="text-l font-bold text-red-600 hover:underline"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Modal form thêm / sửa chương */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingChapter ? "Sửa chương" : "Thêm chương mới"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitForm} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Chọn truyện */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Thuộc tác phẩm
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-xl border border-purple-200 px-3 py-2 text-sm bg-white focus:border-purple-500 focus:ring-pink-500"
                      value={form.novelId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, novelId: e.target.value }))
                      }
                    >
                      <option value="">-- Chọn tác phẩm --</option>
                      {novels.map((n) => (
                        <option key={n._id} value={n._id}>
                          {n.title}
                        </option>
                      ))}
                    </select>
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
                </div>

                {/* Số chương */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Số chương
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-purple-200 px-3 py-2 text-sm focus:border-purple-500 focus:ring-pink-500"
                    value={form.no}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, no: e.target.value }))
                    }
                    placeholder="VD: 1, 2, 3..."
                  />
                  <p className="mt-1 text-[11px] text-gray-500">
                    Để trống để tự tăng
                  </p>
                </div>

                {/* Tiêu đề */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Tiêu đề chương
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-purple-200 px-3 py-2 text-sm focus:border-purple-500 focus:ring-pink-500"
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    placeholder="Ví dụ: Chương 1 - Khởi đầu"
                  />
                </div>
              </div>

              {/* Nội dung */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Nội dung chương
                </label>
                <textarea
                  className="w-full rounded-xl border border-purple-200 px-3 py-2 text-sm focus:border-purple-500 focus:ring-pink-500"
                  rows={6}
                  value={form.content}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, content: e.target.value }))
                  }
                  placeholder="Nội dung chương..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-purple-200 px-4 py-2 text-sm text-gray-800 hover:bg-purple-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 disabled:opacity-60"
                >
                  {formSaving
                    ? "Đang lưu..."
                    : editingChapter
                    ? "Lưu thay đổi"
                    : "Thêm chương"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast thông báo */}
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
