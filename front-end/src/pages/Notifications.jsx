// src/pages/Notifications.jsx
import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from "../lib/api";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const res = await api.notifications.list();
      const list =
        Array.isArray(res) ? res : res.items || res.notifications || [];
      setItems(list);
    } catch (err) {
      console.error("Load notifications error:", err);
      alert(err.message || "Không tải được thông báo.");
    } finally {
      setLoading(false);
    }
  }

  const unreadCount = items.filter((n) => !n.read).length;

  async function handleMarkAllRead() {
    if (!items.length) return;
    try {
      setMarkingAll(true);
      await api.notifications.markAllRead();
      // Cập nhật local cho nhanh
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
      alert(err.message || "Không thể đánh dấu tất cả đã đọc.");
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleMarkRead(id) {
    try {
      setMarkingId(id);
      await api.notifications.markRead(id);
      setItems((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
      alert(err.message || "Không thể đánh dấu đã đọc.");
    } finally {
      setMarkingId(null);
    }
  }

  return (
    <>
      {/* Truyền unreadCount để badge cập nhật realtime khi đọc/xoá */}
      <Header unreadCount={unreadCount} />

      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Thông báo của bạn
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Bạn có{" "}
                <span className="font-semibold">
                  {unreadCount} thông báo chưa đọc
                </span>
                .
              </p>
            </div>

            <button
              onClick={handleMarkAllRead}
              disabled={markingAll || !items.length}
              className="inline-flex items-center rounded-xl border border-purple-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-purple-50 disabled:opacity-60"
            >
              {markingAll ? "Đang xử lý..." : "Đánh dấu tất cả đã đọc"}
            </button>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-purple-100">
              <p className="text-sm text-gray-600">Đang tải thông báo...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-purple-100 text-center">
              <p className="text-gray-600">
                Hiện bạn chưa có thông báo nào. ✨
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((n) => {
                const created =
                  n.createdAt && new Date(n.createdAt).toLocaleString();
                const isUnread = !n.read;

                return (
                  <div
                    key={n._id}
                    className={`rounded-2xl border p-4 shadow-sm transition ${
                      isUnread
                        ? "border-purple-200 bg-purple-50/60"
                        : "border-gray-100 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Dot trạng thái */}
                      <div className="mt-1">
                        <span
                          className={`inline-block h-2.5 w-2.5 rounded-full ${
                            isUnread ? "bg-purple-500" : "bg-gray-300"
                          }`}
                        />
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                            {n.title || "Thông báo"}
                          </h2>
                          {n.type && (
                            <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700 uppercase tracking-wide">
                              {n.type}
                            </span>
                          )}
                        </div>

                        {n.content && (
                          <p className="text-sm text-gray-700 whitespace-pre-line">
                            {n.content}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                          {created && <span>{created}</span>}
                          {n.link && (
                            <a
                              href={n.link}
                              className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:underline"
                            >
                              Xem chi tiết
                              <span aria-hidden="true">↗</span>
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 ml-2">
                        {isUnread && (
                          <button
                            onClick={() => handleMarkRead(n._id)}
                            disabled={markingId === n._id}
                            className="text-xs font-medium text-purple-600 hover:underline disabled:opacity-60"
                          >
                            {markingId === n._id
                              ? "Đang đánh dấu..."
                              : "Đánh dấu đã đọc"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
