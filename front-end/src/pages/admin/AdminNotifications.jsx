// src/pages/admin/AdminNotifications.jsx
import { useEffect, useState, useMemo } from "react";
import AdminHeader from "../../components/admin/AdminHeader";
import { api } from "../../lib/api";

const TYPE_OPTIONS = ["system", "promotion", "warning", "info", "other"];

export default function AdminNotifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search trong list (dùng với AdminHeader.onSearch)
  const [search, setSearch] = useState("");

  // Form gửi thông báo
  const [mode, setMode] = useState("all"); // "all" | "user"
  const [form, setForm] = useState({
    userId: "",
    title: "",
    content: "",
    type: "system",
    link: "",
  });
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // ===== Popup toast =====
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }

  // ===== Danh sách user để tìm kiếm khi gửi 1 người =====
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    load();
    loadUsers();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const res = await api.admin.notifications.list();
      const list =
        Array.isArray(res) ? res : res.items || res.notifications || [];
      setItems(list);
    } catch (err) {
      console.error("Load admin notifications error:", err);
      showToast(err.message || "Không tải được danh sách thông báo.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    try {
      setLoadingUsers(true);
      const res = await api.admin.listUsers();
      const list = res.users || res.items || res || [];
      setAllUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Load users error:", err);
      // lỗi này không quá nghiêm trọng, nên chỉ log
    } finally {
      setLoadingUsers(false);
    }
  }

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((n) => {
      const title = n.title || "";
      const content = n.content || "";
      const type = n.type || "";
      let targetLabel = "";

      if (n.userId) {
        if (typeof n.userId === "object") {
          const u = n.userId;
          targetLabel = `${u.name || u.fullName || ""} ${u.email || ""}`;
        } else {
          targetLabel = String(n.userId);
        }
      } else {
        targetLabel = "Tất cả";
      }

      return (
        title.toLowerCase().includes(q) ||
        content.toLowerCase().includes(q) ||
        type.toLowerCase().includes(q) ||
        targetLabel.toLowerCase().includes(q)
      );
    });
  }, [items, search]);

  // danh sách user filter theo ô tìm kiếm
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return allUsers.slice(0, 10);
    const q = userSearch.trim().toLowerCase();
    return allUsers
      .filter((u) => {
        const name = (u.name || u.fullName || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        const id = String(u._id || "").toLowerCase();
        return (
          name.includes(q) || email.includes(q) || id.includes(q)
        );
      })
      .slice(0, 10);
  }, [allUsers, userSearch]);

  async function handleSend(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast("Vui lòng nhập tiêu đề thông báo.", "error");
      return;
    }
    if (!form.content.trim()) {
      showToast("Vui lòng nhập nội dung thông báo.", "error");
      return;
    }
    if (mode === "user" && !form.userId.trim()) {
      showToast("Vui lòng chọn người nhận.", "error");
      return;
    }

    const body = {
      title: form.title.trim(),
      content: form.content.trim(),
      type: form.type.trim() || undefined,
      link: form.link.trim() || undefined,
    };

    if (mode === "all") {
      body.sendToAll = true;
    } else {
      body.userId = form.userId.trim();
    }

    try {
      setSending(true);
      await api.admin.notifications.create(body);

      showToast("Gửi thông báo thành công!", "success");

      // Reset form (giữ mode & type)
      setForm((f) => ({
        userId: "",
        title: "",
        content: "",
        type: f.type || "system",
        link: "",
      }));
      setUserSearch("");
      setShowUserDropdown(false);

      // Reload danh sách
      load();
    } catch (err) {
      console.error("Send notification error:", err);
      showToast(err.message || "Không gửi được thông báo.", "error");
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Xóa thông báo này?")) return;
    try {
      setDeletingId(id);
      await api.admin.notifications.remove(id);
      setItems((prev) => prev.filter((n) => n._id !== id));
      showToast("Đã xóa thông báo.", "success");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Không xóa được thông báo.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast popup */}
      {toast && (
        <div className="fixed right-4 top-20 z-50">
          <div
            className={
              "max-w-sm rounded-2xl px-4 py-3 shadow-lg text-sm text-white flex items-center gap-3 " +
              (toast.type === "error"
                ? "bg-gradient-to-r from-red-500 to-pink-500"
                : "bg-gradient-to-r from-emerald-500 to-teal-500")
            }
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/10 text-xs font-bold">
              {toast.type === "error" ? "!" : "✓"}
            </span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <AdminHeader onSearch={setSearch} />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Tiêu đề + mô tả */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Quản lý thông báo
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Gửi thông báo đến người dùng hoặc toàn bộ hệ thống, và xem lịch sử
              thông báo đã gửi.
            </p>
          </div>
        </div>

        {/* Form gửi thông báo */}
        <section className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Gửi thông báo mới
            </h2>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-600">Chế độ gửi:</span>
              <div className="inline-flex rounded-full border border-purple-200 bg-purple-50/60 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("all");
                    setForm((f) => ({ ...f, userId: "" }));
                    setUserSearch("");
                    setShowUserDropdown(false);
                  }}
                  className={
                    "px-3 py-1 rounded-full text-xs font-medium " +
                    (mode === "all"
                      ? "bg-white text-purple-700 shadow-sm"
                      : "text-gray-600")
                  }
                >
                  Tất cả người dùng
                </button>
                <button
                  type="button"
                  onClick={() => setMode("user")}
                  className={
                    "px-3 py-1 rounded-full text-xs font-medium " +
                    (mode === "user"
                      ? "bg-white text-purple-700 shadow-sm"
                      : "text-gray-600")
                  }
                >
                  Một người dùng
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            {mode === "user" && (
              <div className="relative">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Chọn người nhận
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-purple-200 px-3 py-2 text-sm focus:border-purple-500 focus:ring-pink-500"
                  placeholder={
                    loadingUsers
                      ? "Đang tải danh sách người dùng..."
                      : "Nhập tên / email / ID để tìm..."
                  }
                  value={userSearch}
                  onChange={(e) => {
                    const v = e.target.value;
                    setUserSearch(v);
                    setShowUserDropdown(true);
                    // nếu tự sửa text thì bỏ userId cũ
                    setForm((f) => ({ ...f, userId: "" }));
                  }}
                  onFocus={() => setShowUserDropdown(true)}
                />
                {showUserDropdown && filteredUsers.length > 0 && (
                  <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-purple-100 bg-white shadow-lg text-sm">
                    {filteredUsers.map((u) => {
                      const labelName =
                        u.name || u.fullName || "(Không tên)";
                      const labelEmail = u.email || "";
                      return (
                        <button
                          type="button"
                          key={u._id}
                          className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-purple-50"
                          onClick={() => {
                            setForm((f) => ({ ...f, userId: String(u._id) }));
                            setUserSearch(
                              labelName +
                                (labelEmail ? ` - ${labelEmail}` : "")
                            );
                            setShowUserDropdown(false);
                          }}
                        >
                          <span className="font-medium text-gray-900">
                            {labelName}
                          </span>
                          {labelEmail && (
                            <span className="text-xs text-gray-500">
                              {labelEmail}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                {form.userId && (
                  <p className="mt-1 text-xs text-gray-500">
                    <span className="font-medium">Đã chọn ID:</span>{" "}
                    {form.userId}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tiêu đề
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-purple-200 px-3 py-2 text-sm focus:border-purple-500 focus:ring-pink-500"
                placeholder="Thông báo mới..."
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nội dung
              </label>
              <textarea
                className="w-full rounded-xl border border-purple-200 px-3 py-2 text-sm focus:border-purple-500 focus:ring-pink-500"
                rows={4}
                placeholder="Nội dung thông báo gửi đến người dùng..."
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Loại thông báo (type)
                </label>
                <select
                  className="w-full rounded-xl border border-purple-200 px-3 py-2 text-sm bg-white focus:border-purple-500 focus:ring-pink-500"
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value }))
                  }
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Link đính kèm (tùy chọn)
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-purple-200 px-3 py-2 text-sm focus:border-purple-500 focus:ring-pink-500"
                  placeholder="https://... nếu muốn người dùng bấm 'Xem chi tiết'"
                  value={form.link}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, link: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:opacity-90 disabled:opacity-60"
              >
                {sending ? "Đang gửi..." : "Gửi thông báo"}
              </button>
            </div>
          </form>
        </section>

        {/* Danh sách thông báo đã gửi */}
        <section className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Lịch sử thông báo
            </h2>
            <p className="text-xs text-gray-500">
              Tìm kiếm theo tiêu đề, nội dung, loại thông báo hoặc người nhận
              bằng ô tìm kiếm ở thanh trên cùng.
            </p>
          </div>

          {loading ? (
            <p className="text-sm text-gray-600">Đang tải...</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-sm text-gray-600">
              Chưa có thông báo nào phù hợp điều kiện lọc.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-3 py-2 text-left w-56">Tiêu đề</th>
                    <th className="px-3 py-2 text-left">Nội dung</th>
                    <th className="px-3 py-2 text-left w-32">Loại</th>
                    <th className="px-3 py-2 text-left w-40">Người nhận</th>
                    <th className="px-3 py-2 text-left w-40">Thời gian</th>
                    <th className="px-3 py-2 text-left w-24">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((n) => {
                    const created =
                      n.createdAt &&
                      new Date(n.createdAt).toLocaleString("vi-VN");

                    // Hiển thị người nhận
                    let targetLabel = "Tất cả";
                    if (n.userId) {
                      if (typeof n.userId === "object") {
                        const u = n.userId;
                        const name = u.name || u.fullName || "(không tên)";
                        const email = u.email ? ` - ${u.email}` : "";
                        targetLabel = `${name}${email}`;
                      } else {
                        targetLabel = String(n.userId);
                      }
                    }

                    return (
                      <tr key={n._id} className="border-t align-top">
                        <td className="px-3 py-2 font-semibold text-gray-900">
                          {n.title || "—"}
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {n.content?.length > 120
                            ? n.content.slice(0, 120) + "..."
                            : n.content || "—"}
                        </td>
                        <td className="px-3 py-2">
                          {n.type ? (
                            <span className="inline-flex rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700">
                              {n.type}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-700">
                          {targetLabel}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500">
                          {created || "—"}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => handleDelete(n._id)}
                            disabled={deletingId === n._id}
                            className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                          >
                            {deletingId === n._id ? "Đang xóa..." : "Xóa"}
                          </button>
                          {n.link && (
                            <div>
                              <a
                                href={n.link}
                                className="mt-1 inline-flex items-center gap-1 text-[11px] text-purple-600 hover:underline"
                              >
                                Mở link
                                <span aria-hidden="true">↗</span>
                              </a>
                            </div>
                          )}
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
    </div>
  );
}
