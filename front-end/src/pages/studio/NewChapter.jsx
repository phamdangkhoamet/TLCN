import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { api, API_BASE } from "../../lib/api";

export default function NewChapter() {
  const { id: novelId } = useParams();
  const navigate = useNavigate();

  const [novel, setNovel] = useState(null);
  const [form, setForm] = useState({ no: "", title: "", content: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Load novel để hiển thị tiêu đề (giữ nguyên)
  useEffect(() => {
    let mounted = true;
    const base = API_BASE || window.location.origin;
    fetch(new URL(`/api/novels/${novelId}`, base))
      .then((r) => (r.ok ? r.json() : null))
      .then((n) => mounted && setNovel(n))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [novelId]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Submit (giữ nguyên logic)
  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      await api.studio.createChapter({
        novelId,
        no: Number(form.no),
        title: form.title,
        content: form.content,
      });
      alert("Đã thêm chương!");
      navigate(`/novel/${novelId}/chuong/${form.no}`);
    } catch (error) {
      setErr(error.message || "Lỗi thêm chương");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header />

      {/* Hero */}
      <div className="relative bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Thêm chương mới
                </span>
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Tác phẩm:&nbsp;
                <b className="text-gray-900">{novel?.title || "Đang tải…"}</b>
              </p>
            </div>

            <Link
              to="/studio"
              className="inline-flex items-center gap-2 rounded-xl border border-purple-200 px-4 py-2 text-sm text-gray-700 bg-white hover:bg-purple-50 transition"
              title="Về Studio"
            >
              ← Về Studio
            </Link>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="mx-auto max-w-5xl px-6 -mt-6 pb-12">
        <div className="rounded-2xl border border-purple-100 bg-white shadow-sm">
          <div className="border-b border-purple-100 p-5">
            <h2 className="text-lg font-semibold text-gray-900">Thông tin chương</h2>
            <p className="text-sm text-gray-500 mt-1">
              Điền số chương, tiêu đề và nội dung. Bạn có thể chỉnh sửa sau.
            </p>
          </div>

          {err && (
            <div className="mx-5 mt-5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3">
              {err}
            </div>
          )}

          <form onSubmit={onSubmit} className="p-5 md:p-6 space-y-5">
            {/* Số chương + Tiêu đề */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Số chương
                </label>
                <div className="relative">
                  <input
                    name="no"
                    type="number"
                    min="1"
                    value={form.no}
                    onChange={onChange}
                    required
                    className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 pr-10 text-sm focus:border-purple-500 focus:ring-pink-500"
                    placeholder="VD: 1"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-gray-400">
                    #no
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Nên tăng dần: 1, 2, 3…
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Tiêu đề chương
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={onChange}
                  required
                  className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:ring-pink-500"
                  placeholder="VD: Khởi đầu"
                />
              </div>
            </div>

            {/* Nội dung */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Nội dung
                </label>
              </div>
              <textarea
                name="content"
                rows={14}
                value={form.content}
                onChange={onChange}
                required
                className="w-full rounded-2xl border border-purple-200 bg-white px-4 py-3 text-sm leading-relaxed focus:border-purple-500 focus:ring-pink-500"
                placeholder="Viết nội dung chương…"
              />
            </div>

            {/* Action bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className={`inline-flex justify-center rounded-xl px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm ${
                  saving ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"
                }`}
              >
                {saving ? "Đang lưu…" : "Lưu chương"}
              </button>

              <Link
                to="/studio"
                className="inline-flex justify-center rounded-xl px-5 py-2.5 text-sm font-medium border border-purple-200 text-gray-700 hover:bg-purple-50 transition"
              >
                Hủy
              </Link>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}
