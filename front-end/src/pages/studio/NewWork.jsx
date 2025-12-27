import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { api, API_BASE } from "../../lib/api";

export default function NewWork() {
  const { id } = useParams(); // optional
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    genre: "",
    cover: "",
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Load novel khi edit (giữ nguyên logic)
  useEffect(() => {
    if (!isEdit) return;
    let mounted = true;
    setLoading(true);
    const base = API_BASE || window.location.origin;
    fetch(new URL(`/api/novels/${id}`, base))
      .then((r) => (r.ok ? r.json() : null))
      .then((n) => {
        if (!mounted) return;
        if (!n) {
          setErr("Không tìm thấy tác phẩm");
          return;
        }
        setForm({
          title: n.title || "",
          description: n.description || "",
          genre: n.genre || "",
          cover: n.cover || n.image || "",
        });
      })
      .catch((e) => setErr(e.message || "Lỗi tải tác phẩm"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id, isEdit]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Submit (giữ nguyên logic)
  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      if (isEdit) {
        await api.studio.updateNovel(id, form);
        alert("Đã cập nhật tác phẩm!");
      } else {
        const created = await api.studio.createNovel(form);
        alert("Đã tạo tác phẩm mới!");
        const newId = created?._id || created?.id;
        if (newId) return navigate(`/studio/novel/${newId}/chapters/new`);
      }
      navigate("/studio");
    } catch (error) {
      setErr(error.message || "Lỗi lưu tác phẩm");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header />

      {/* Hero */}
      <div className="relative bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {isEdit ? "Sửa tác phẩm" : "Tạo tác phẩm mới"}
                </span>
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Nhập thông tin cơ bản, bạn có thể thêm chương sau khi lưu.
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

      {/* Form + Preview */}
      <div className="mx-auto max-w-6xl px-6 -mt-6 pb-12">
        {err && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3">
            {err}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl border border-purple-100 bg-white p-6 animate-pulse">
              <div className="h-6 w-1/3 bg-purple-100/60 rounded mb-4" />
              <div className="h-11 bg-purple-100/60 rounded mb-3" />
              <div className="h-28 bg-purple-100/60 rounded mb-3" />
              <div className="h-11 bg-purple-100/60 rounded mb-3" />
              <div className="h-11 bg-purple-100/60 rounded" />
            </div>
            <div className="rounded-2xl border border-purple-100 bg-white p-6 animate-pulse">
              <div className="aspect-[3/4] w-full bg-purple-100/60 rounded-xl" />
              <div className="mt-3 h-4 w-3/4 bg-purple-100/60 rounded" />
              <div className="mt-2 h-3 w-2/5 bg-purple-100/60 rounded" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form card */}
            <form
              onSubmit={onSubmit}
              className="lg:col-span-2 rounded-2xl border border-purple-100 bg-white shadow-sm"
            >
              <div className="border-b border-purple-100 p-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Thông tin tác phẩm
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Điền tiêu đề, mô tả ngắn, thể loại và ảnh bìa (URL).
                </p>
              </div>

              <div className="p-5 md:p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800">
                    Tiêu đề
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={onChange}
                    className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:ring-pink-500"
                    placeholder="Tên tác phẩm"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium mb-1 text-gray-800">
                      Mô tả
                    </label>
                    <span className="text-xs text-gray-400">
                      Gợi ý: 1–2 đoạn ngắn, 200–300 ký tự.
                    </span>
                  </div>
                  <textarea
                    name="description"
                    rows={5}
                    value={form.description}
                    onChange={onChange}
                    className="w-full rounded-2xl border border-purple-200 bg-white px-4 py-3 text-sm leading-relaxed focus:border-purple-500 focus:ring-pink-500"
                    placeholder="Giới thiệu ngắn…"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-800">
                      Thể loại
                    </label>
                    <input
                      name="genre"
                      value={form.genre}
                      onChange={onChange}
                      className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:ring-pink-500"
                      placeholder="VD: Huyền huyễn"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-800">
                      Ảnh bìa (URL)
                    </label>
                    <input
                      name="cover"
                      value={form.cover}
                      onChange={onChange}
                      className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:ring-pink-500"
                      placeholder="https://…"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-5 md:p-6 border-t border-purple-100">
                <button
                  type="submit"
                  disabled={saving}
                  className={`inline-flex justify-center rounded-xl px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm ${
                    saving ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"
                  }`}
                >
                  {isEdit ? "Lưu thay đổi" : "Tạo tác phẩm"}
                </button>
                <Link
                  to="/studio"
                  className="inline-flex justify-center rounded-xl px-5 py-2.5 text-sm font-medium border border-purple-200 text-gray-700 hover:bg-purple-50 transition"
                >
                  Hủy
                </Link>
                <div className="text-xs text-gray-500 ml-auto">
                  {isEdit
                    ? "Bạn có thể thêm/đổi chương sau khi lưu."
                    : "Sau khi tạo, bạn sẽ được gợi ý thêm chương đầu tiên."}
                </div>
              </div>
            </form>

            {/* Live preview */}
            <aside className="rounded-2xl border border-purple-100 bg-white shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Xem trước
              </h3>
              <div className="aspect-[3/4] w-full overflow-hidden rounded-xl ring-1 ring-purple-100">
                {form.cover ? (
                  <img
                    src={form.cover}
                    alt="cover"
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-xs text-gray-500">
                    Chưa có ảnh bìa
                  </div>
                )}
              </div>

              <div className="mt-3">
                <div className="text-base font-semibold text-gray-900 line-clamp-2">
                  {form.title || "Tên tác phẩm"}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {form.genre || "Thể loại"}
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-4">
                  {form.description || "Mô tả ngắn về tác phẩm sẽ hiển thị ở đây…"}
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
