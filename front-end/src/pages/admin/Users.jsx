import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import AdminHeader from "../../components/admin/AdminHeader";
import Footer from "../../components/Footer";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({});
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await api.request("/api/admin/users", { auth: true });
    setUsers(res.users);
    setLoading(false);
  }

  function startCreate() {
    setForm({
      name: "",
      email: "",
      password: "",
      avatar: "",
      role: "user",
      status: "active",
      isVip: false,
      vipUntil: "",
    });
    setEditingUser(null);
    setShowForm(true);
  }

  function startEdit(u) {
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      avatar: u.avatar || "",
      role: u.role,
      status: u.status,
      isVip: u.isVip,
      vipUntil: u.vipUntil ? u.vipUntil.slice(0, 10) : "",
    });
    setEditingUser(u);
    setShowForm(true);
  }

  async function save() {
    try {
      if (!editingUser) {
        await api.request("/api/admin/users", {
          method: "POST",
          auth: true,
          body: form,
        });
      } else {
        await api.request(`/api/admin/users/${editingUser._id}`, {
          method: "PUT",
          auth: true,
          body: form,
        });
      }
      setShowForm(false);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function remove(id) {
    if (!window.confirm("Xóa người dùng này?")) return;
    await api.request(`/api/admin/users/${id}`, {
      method: "DELETE",
      auth: true,
    });
    load();
  }

  return (
    <>
      <AdminHeader />

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
            <button
              onClick={startCreate}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
            >
              + Thêm người dùng
            </button>
          </div>

          {loading ? (
            <p>Đang tải...</p>
          ) : (
            <table className="w-full bg-white shadow rounded-xl overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 text-sm">
                <tr>
                  <th className="p-3 text-left">Tên</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">VIP</th>
                  <th className="p-3 text-left">Trạng thái</th>
                  <th className="p-3 text-left">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t">
                    <td className="p-3">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.role}</td>
                    <td className="p-3">
                      {u.isVip || (u.vipUntil && new Date(u.vipUntil) > new Date())
                        ? "⭐ VIP"
                        : "—"}
                    </td>
                    <td className="p-3">{u.status}</td>
                    <td className="p-3 flex gap-3">
                      <button
                        onClick={() => startEdit(u)}
                        className="text-blue-600 hover:underline"
                      >
                        Sửa
                      </button>

                      <button
                        onClick={() => remove(u._id)}
                        className="text-red-600 hover:underline"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ===========================
                FORM THÊM / SỬA NGƯỜI DÙNG
          ============================ */}
          {showForm && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white w-full max-w-2xl p-8 rounded-2xl shadow-lg overflow-y-auto max-h-[90vh]">
                <h2 className="text-2xl font-bold mb-6">
                  {editingUser ? "Sửa người dùng" : "Thêm người dùng"}
                </h2>

                {/* FORM GRID 2 CỘT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Họ tên */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Họ và tên</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="border rounded-lg p-3 focus:ring focus:ring-purple-300"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Email</label>
                    <input
                      type="email"
                      placeholder="abc@gmail.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="border rounded-lg p-3 focus:ring focus:ring-purple-300"
                    />
                  </div>

                  {/* Mật khẩu */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Mật khẩu</label>
                    <input
                      type="password"
                      placeholder="Để trống nếu không đổi"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="border rounded-lg p-3 focus:ring focus:ring-purple-300"
                    />
                  </div>

                  {/* Avatar */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Avatar URL</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={form.avatar}
                      onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                      className="border rounded-lg p-3 focus:ring focus:ring-purple-300"
                    />
                  </div>

                  {/* Vai trò */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Vai trò</label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="border rounded-lg p-3 bg-white"
                    >
                      <option value="user">Người dùng</option>
                      <option value="author">Tác giả</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </div>

                  {/* Trạng thái */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Trạng thái</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="border rounded-lg p-3 bg-white"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="suspended">Bị khóa</option>
                    </select>
                  </div>

                  {/* VIP mãi mãi */}
                  <div className="flex items-center gap-2 md:col-span-2">
                    <input
                      type="checkbox"
                      checked={form.isVip}
                      onChange={(e) => setForm({ ...form, isVip: e.target.checked })}
                    />
                    <label className="text-sm">Tài khoản VIP </label>
                  </div>

                  {/* VIP Until */}
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-sm font-medium">VIP đến ngày</label>
                    <input
                      type="date"
                      value={form.vipUntil}
                      onChange={(e) => setForm({ ...form, vipUntil: e.target.value })}
                      className="border rounded-lg p-3"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={save}
                    className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </>
  );
}
