// src/pages/EditProfile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { API_BASE, api } from "../lib/api";

export default function EditProfile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // form state
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [password, setPassword] = useState(""); // optional

  // ============ helpers ============
  const authHeader = () => {
    const tk = api.auth.getToken();
    return tk ? { Authorization: `Bearer ${tk}` } : {};
  };
  const fullUrl = (p) => new URL(p, API_BASE || window.location.origin).toString();

  // ============ load current profile ============
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr("");

    const tk = api.auth.getToken();
    if (!tk) {
      navigate("/login");
      return;
    }

    fetch(fullUrl("/api/users/me"), { headers: { "Content-Type": "application/json", ...authHeader() } })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data?.message || "Không tải được hồ sơ.");
        return data;
      })
      .then((u) => {
        if (!mounted) return;
        // backend /users/me trả: { id, name, email, avatar, role }
        setUserId(u.id);
        setName(u.name || "");
        setEmail(u.email || "");
        setAvatar(u.avatar || "");
      })
      .catch((e) => {
        if (!mounted) return;
        setErr(e.message || "Lỗi tải hồ sơ");
        if (String(e.message || "").toLowerCase().includes("token")) {
          navigate("/login");
        }
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [navigate]);

  // ============ submit ============
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    setErr("");

    // Chỉ gửi field có thay đổi/không rỗng
    const body = {};
    if (name?.trim()) body.name = name.trim();
    if (email?.trim()) body.email = email.trim();
    if (avatar?.trim()) body.avatar = avatar.trim();
    if (password?.trim()) body.password = password.trim();

    try {
      const r = await fetch(fullUrl(`/api/users/${userId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(body),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.message || "Cập nhật thất bại");

      // Cập nhật bản cache “sessionUser” để các trang khác hiển thị đúng
      const cached = {
        id: data._id || data.id || userId,
        name: data.name || name,
        email: data.email || email,
        avatar: data.avatar || avatar,
        role: data.role,
      };
      localStorage.setItem("sessionUser", JSON.stringify(cached));

      alert("Đã cập nhật hồ sơ!");
      navigate("/profile");
    } catch (e2) {
      setErr(e2.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Chỉnh sửa hồ sơ
            </h1>
            <Link
              to="/profile"
              className="rounded-xl px-3 py-2 border border-purple-200 text-gray-700 hover:bg-purple-50 text-sm"
            >
              ← Quay lại hồ sơ
            </Link>
          </div>

          {err && (
            <div className="mb-4 rounded-xl border border-pink-200 bg-pink-50 text-pink-700 px-4 py-3">
              {err}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-purple-200 p-8 animate-pulse">
              <div className="h-6 w-48 bg-purple-100 rounded mb-4" />
              <div className="space-y-3">
                <div className="h-10 bg-purple-100 rounded" />
                <div className="h-10 bg-purple-100 rounded" />
                <div className="h-10 bg-purple-100 rounded" />
                <div className="h-10 bg-purple-100 rounded" />
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-purple-200 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Tên hiển thị</label>
                <input
                  className="w-full rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-pink-500 px-3 py-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tên của bạn"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-pink-500 px-3 py-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Avatar URL</label>
                <input
                  className="w-full rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-pink-500 px-3 py-2"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                />
                {avatar?.trim() ? (
                  <div className="mt-3">
                    <img
                      src={avatar}
                      alt="avatar preview"
                      className="h-20 w-20 rounded-full ring-2 ring-purple-100 object-cover"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  </div>
                ) : null}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Link
                  to="/profile"
                  className="rounded-xl px-4 py-2 border border-purple-200 text-gray-700 hover:bg-purple-50"
                >
                  Hủy
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className={`rounded-xl px-4 py-2 text-white bg-gradient-to-r from-purple-500 to-pink-500 ${
                    saving ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"
                  }`}
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
