import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { API_BASE } from "../../lib/api";

const pickArray = (res) => (Array.isArray(res) ? res : (res?.items || res?.data || []));

function getSessionUser() {
  try { return JSON.parse(localStorage.getItem("sessionUser") || "null"); } catch { return null; }
}

export default function AuthorStudio() {
  const [me, setMe] = useState(getSessionUser());
  const [loadingMe, setLoadingMe] = useState(!me);
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [err, setErr] = useState("");

  // Lấy me nếu chưa có
  useEffect(() => {
    if (me) return;
    let mounted = true;
    const base = API_BASE || window.location.origin;
    fetch(new URL("/api/auth/me", base), { headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")||""}` }})
      .then(r => r.ok ? r.json() : null)
      .then(u => mounted && setMe(u))
      .catch(() => {})
      .finally(() => mounted && setLoadingMe(false));
    return () => { mounted = false; };
  }, [me]);

  // Load novels của tôi
  useEffect(() => {
    if (!me) { setBooks([]); setLoadingBooks(false); return; }
    let mounted = true;
    setLoadingBooks(true);
    const base = API_BASE || window.location.origin;
    const url = new URL("/api/novels", base);
    url.searchParams.set("authorId", me._id || me.id);
    fetch(url.toString())
      .then(r => r.ok ? r.json() : [])
      .then(res => {
        if (!mounted) return;
        const arr = pickArray(res);
        const norm = arr.map(n => ({
          id: n._id || n.id,
          title: n.title || "",
          cover: n.cover || n.image || "",
          description: n.description || "",
          genre: n.genre || "",
        }));
        setBooks(norm);
      })
      .catch(e => setErr(e.message || "Lỗi tải tác phẩm"))
      .finally(() => mounted && setLoadingBooks(false));
    return () => { mounted = false; };
  }, [me]);

  const authorName = useMemo(() => me?.name || "Tôi", [me]);

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Studio sáng tác
          </h1>
          <Link
            to="/studio/new"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow hover:opacity-90 transition"
          >
            + Tạo tác phẩm mới
          </Link>
        </div>

        <div className="rounded-2xl border border-purple-200 p-4 bg-white mb-6">
          <div className="text-sm text-gray-600">
            Đăng nhập: <b className="text-gray-900">{authorName}</b>
          </div>
        </div>

        {err && (
          <div className="mb-4 rounded-xl border border-pink-200 bg-pink-50 text-pink-700 px-4 py-3">{err}</div>
        )}

        {loadingBooks ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-purple-100 p-3">
                <div className="h-48 bg-purple-100/60 rounded" />
                <div className="mt-2 h-4 bg-purple-100/60 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="rounded-2xl border border-purple-200 p-10 text-center text-gray-600">
            Chưa có tác phẩm nào. Hãy nhấn <b>“Tạo tác phẩm mới”</b> để bắt đầu.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {books.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <Link to={`/novel/${b.id}`} className="block">
                  <img src={b.cover} alt={b.title} className="w-full h-48 object-cover" />
                </Link>
                <div className="p-4 flex-1 flex flex-col">
                  <Link to={`/novel/${b.id}`} className="font-semibold hover:underline line-clamp-2" title={b.title}>{b.title}</Link>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{b.description}</p>
                  <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                    <Link to={`/studio/novel/${b.id}/chapters/new`} className="px-3 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm hover:bg-gray-50 transition">
                      + Thêm chương
                    </Link>
                    <Link to={`/studio/novel/${b.id}/edit`} className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:shadow transition">
                      Sửa tác phẩm
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
