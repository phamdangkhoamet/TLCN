// src/pages/admin/ModerationPending.jsx
import React, { useMemo, useState, useCallback } from "react";
import AdminHeader from "../../components/admin/AdminHeader";
import {
  adminStats,
  commentKeywords,
  moderationPending,
  genres,
} from "../../data/mockData";

export default function ModerationPending() {
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("Tất cả");
  const [selected, setSelected] = useState({}); // { [id]: true }

  const list = useMemo(() => {
    let data = moderationPending || [];
    if (genre && genre !== "Tất cả") {
      data = data.filter((n) => (n.genre || "").toLowerCase() === genre.toLowerCase());
    }
    if (q.trim()) {
      const kw = q.trim().toLowerCase();
      data = data.filter(
        (n) =>
          (n.title || "").toLowerCase().includes(kw) ||
          (n.author || "").toLowerCase().includes(kw)
      );
    }
    return data;
  }, [q, genre]);

  const checkedCount = useMemo(
    () => Object.values(selected).filter(Boolean).length,
    [selected]
  );

  const allChecked = useMemo(
    () => list.length > 0 && list.every((n) => selected[n.id]),
    [list, selected]
  );

  const toggleAll = useCallback(() => {
    if (allChecked) {
      setSelected({});
    } else {
      const next = {};
      list.forEach((n) => (next[n.id] = true));
      setSelected(next);
    }
  }, [allChecked, list]);

  const toggleOne = useCallback((id) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const approveOne = (id) => alert(`✅ Duyệt truyện #${id} (demo)`);
  const rejectOne = (id) => alert(`❌ Từ chối truyện #${id} (demo)`);

  const approveSelected = () => {
    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (ids.length === 0) return alert("Chưa chọn truyện nào.");
    alert(`✅ Duyệt ${ids.length} truyện: ${ids.join(", ")} (demo)`);
  };

  const rejectSelected = () => {
    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (ids.length === 0) return alert("Chưa chọn truyện nào.");
    alert(`❌ Từ chối ${ids.length} truyện: ${ids.join(", ")} (demo)`);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AdminHeader
        pendingCount={adminStats.pending}
        approvedCount={5}
        reportCount={adminStats.reports}
        keywordCount={commentKeywords.length}
      />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-4xl font-bold">Hàng chờ kiểm duyệt</h2>
            <p className="text-lg text-gray-600 mt-1">
              Duyệt / từ chối các truyện mới được gửi lên hệ thống.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={approveSelected}
              className="rounded-xl px-4 py-2 text-sm sm:text-base text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
            >
              ✅ Duyệt đã chọn ({checkedCount})
            </button>
            <button
              onClick={rejectSelected}
              className="rounded-xl px-4 py-2 text-sm sm:text-base border border-purple-300 hover:bg-purple-50"
            >
              ❌ Từ chối đã chọn
            </button>
          </div>
        </div>

        {/* Bộ lọc */}
        <div className="rounded-2xl border border-purple-200 bg-white p-4 shadow-sm mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tiêu đề hoặc tác giả..."
              className="rounded-xl border border-purple-300 px-4 py-3 focus:border-purple-500 focus:ring-pink-500"
            />
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="rounded-xl border border-purple-300 px-4 py-3 bg-white focus:border-purple-500 focus:ring-pink-500"
            >
              <option>Tất cả</option>
              {genres.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setQ("");
                  setGenre("Tất cả");
                }}
                className="w-full rounded-xl px-4 py-3 border border-purple-300 hover:bg-purple-50"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Bảng */}
        <div className="overflow-x-auto rounded-2xl border border-purple-200 shadow-sm">
          <table className="min-w-full text-lg">
            <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
              <tr className="text-gray-700">
                <th className="py-3 px-4 text-left w-12">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    aria-label="Chọn tất cả"
                  />
                </th>
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Tiêu đề</th>
                <th className="py-3 px-4 text-left">Tác giả</th>
                <th className="py-3 px-4 text-left">Thể loại</th>
                <th className="py-3 px-4 text-left">Ngày gửi</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {list.map((n) => (
                <tr
                  key={n.id}
                  className="border-t border-purple-100 hover:bg-purple-50/40 transition"
                >
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={!!selected[n.id]}
                      onChange={() => toggleOne(n.id)}
                      aria-label={`Chọn #${n.id}`}
                    />
                  </td>
                  <td className="py-3 px-4 text-gray-700">#{n.id}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">
                    {n.title}
                  </td>
                  <td className="py-3 px-4 text-gray-700">{n.author}</td>
                  <td className="py-3 px-4 text-gray-700">{n.genre}</td>
                  <td className="py-3 px-4 text-gray-600">{n.submittedAt}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => approveOne(n.id)}
                      className="px-4 py-2 mr-2 rounded-lg text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                    >
                      Duyệt
                    </button>
                    <button
                      onClick={() => rejectOne(n.id)}
                      className="px-4 py-2 border border-purple-300 rounded-lg hover:bg-purple-50 text-gray-800"
                    >
                      Từ chối
                    </button>
                  </td>
                </tr>
              ))}

              {list.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="py-10 text-center text-gray-500 text-lg italic"
                  >
                    Không có truyện chờ duyệt phù hợp bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Gợi ý kiểm duyệt */}
        <div className="mt-8 bg-purple-50 rounded-2xl p-6 border border-purple-200">
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            Gợi ý kiểm duyệt
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Đối chiếu tiêu đề, mô tả và thể loại với quy chuẩn cộng đồng.</li>
            <li>Loại bỏ nội dung vi phạm pháp luật, bạo lực, kích động, từ khóa nhạy cảm.</li>
            <li>Ghi rõ lý do khi từ chối để tác giả chỉnh sửa và gửi lại.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
