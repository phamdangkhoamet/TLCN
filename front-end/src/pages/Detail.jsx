import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { API_BASE } from "../lib/api";
import { isFavorite, toggleFavorite, ensureFavoriteMapLoaded } from "../utils/favorites";

// ========= LocalStorage report helpers (mock gửi admin) =========
const loadUserReports = () => {
  try {
    return JSON.parse(localStorage.getItem("userReports") || "[]");
  } catch {
    return [];
  }
};
const saveUserReports = (arr) =>
  localStorage.setItem("userReports", JSON.stringify(arr));

// ========= click outside hook cho menu ba chấm =========
function useClickOutside(ref, onClose) {
  useEffect(() => {
    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [ref, onClose]);
}

export default function Detail() {
  const { id } = useParams();              // id: _id của novel (string)
  const navigate = useNavigate();

  // ---- state chính ----
  const [book, setBook] = useState(null);  // novel từ API
  const [genreName, setGenreName] = useState(""); // lưu lại genre để lấy gợi ý
  const [suggestions, setSuggestions] = useState([]); // gợi ý theo thể loại

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Yêu thích
  const [fav, setFav] = useState(false);

  // Bình luận (demo: lưu localStorage theo novelId)
  const [commentsState, setCommentsState] = useState([]);
  const [newComment, setNewComment] = useState("");

  // ================== MENU BA CHẤM ==================
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useClickOutside(menuRef, () => setMenuOpen(false));

  // ================== REPORT NOVEL (modal) ==================
  const [openReportNovel, setOpenReportNovel] = useState(false);
  const [novelReportType, setNovelReportType] = useState("Nội dung không phù hợp");
  const [novelReportText, setNovelReportText] = useState("");
  const [novelReportFiles, setNovelReportFiles] = useState([]);
  const [sendingNovel, setSendingNovel] = useState(false);
  const [novelErrors, setNovelErrors] = useState({});

  const resetNovelForm = () => {
    setNovelReportType("Nội dung không phù hợp");
    setNovelReportText("");
    setNovelReportFiles([]);
    setNovelErrors({});
  };
  const onPickNovelFiles = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () =>
        setNovelReportFiles((prev) => [...prev, { name: file.name, url: reader.result }]);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };
  const removeNovelFile = (name) =>
    setNovelReportFiles((prev) => prev.filter((f) => f.name !== name));
  const validateNovelReport = () => {
    const err = {};
    if (!novelReportText.trim() || novelReportText.trim().length < 10) {
      err.text = "Vui lòng mô tả tối thiểu 10 ký tự.";
    }
    setNovelErrors(err);
    return Object.keys(err).length === 0;
  };
  const submitNovelReport = async () => {
    if (!validateNovelReport()) return;
    setSendingNovel(true);
    try {
      const payload = {
        id: `UR-${Date.now()}`,
        type: "Nội dung truyện",
        target: `"${book?.title}" (ID: ${id})`,
        reason: `${novelReportType} – ${novelReportText.trim()}`,
        attachments: novelReportFiles,
        createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
        status: "pending",
      };
      const list = loadUserReports();
      list.unshift(payload);
      saveUserReports(list);
      alert("Đã gửi báo cáo truyện tới admin (demo). Cảm ơn bạn!");
      setOpenReportNovel(false);
      resetNovelForm();
    } catch (e) {
      console.error(e);
      alert("Gửi báo cáo thất bại. Vui lòng thử lại.");
    } finally {
      setSendingNovel(false);
    }
  };

  // ================== FETCH DATA ==================
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr("");

    // Tải chi tiết novel
    const url = new URL(`/api/novels/${id}`, API_BASE || window.location.origin);
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(async (n) => {
        if (!mounted) return;

        // Chuẩn hoá
        const norm = {
          id: n._id || n.id || id,
          title: n.title || "",
          cover: n.cover || n.image || "",
          genre: n.genre || n.genreName || "",
          authorName:
            n.authorName ||
            (typeof n.author === "string" ? n.author : n?.author?.name) ||
            "",
          description: n.description || "",
          chaptersCount: n.chaptersCount || 0,
        };
        setBook(norm);
        setGenreName(norm.genre);

        // comments: ưu tiên localStorage (giữ như cũ)
        const local = localStorage.getItem(`comments-${norm.id}`);
        setCommentsState(local ? JSON.parse(local) : []);

        // yêu thích: đồng bộ từ API (utils)
        try {
          await ensureFavoriteMapLoaded(); // cache các id yêu thích
          setFav(isFavorite(norm.id));
        } catch (e) {
          console.warn("ensureFavoriteMapLoaded fail:", e);
        }

        // gợi ý theo thể loại
        if (norm.genre) {
          const sUrl = new URL(`/api/novels`, API_BASE || window.location.origin);
          sUrl.searchParams.set("genre", norm.genre);
          sUrl.searchParams.set("limit", "8");
          const sRes = await fetch(sUrl).then((r) => r.json()).catch(() => []);
          const sArr = Array.isArray(sRes) ? sRes : (Array.isArray(sRes?.items) ? sRes.items : []);
          const sug = sArr
            .map((x) => ({
              id: x._id || x.id,
              title: x.title || "",
              cover: x.cover || x.image || "",
              authorName:
                x.authorName ||
                (typeof x.author === "string" ? x.author : x?.author?.name) ||
                "",
            }))
            .filter((x) => String(x.id) !== String(norm.id));
          setSuggestions(sug.slice(0, 8));
        } else {
          setSuggestions([]);
        }
      })
      .catch((e) => {
        if (!mounted) return;
        console.error(e);
        setErr("Không tải được dữ liệu truyện.");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [id]);

  // ================== HANDLERS ==================
  const handleReadNow = () => navigate(`/novel/${id}/chuong/1`);

  const handleToggleFav = async () => {
    try {
      const next = await toggleFavorite(id); // utils trả về trạng thái mới (true/false)
      setFav(next);
    } catch (e) {
      alert(e.message || "Không thể cập nhật yêu thích.");
    }
  };

  // ================== RENDER ==================
  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="h-6 w-40 bg-purple-100 rounded mb-4 animate-pulse" />
          <div className="grid md:grid-cols-3 gap-8 bg-white rounded-2xl shadow-lg p-6">
            <div className="h-80 bg-purple-100/60 rounded-xl animate-pulse" />
            <div className="md:col-span-2 space-y-3">
              <div className="h-5 bg-purple-100/60 rounded w-1/2" />
              <div className="h-4 bg-purple-100/60 rounded w-1/3" />
              <div className="h-24 bg-purple-100/60 rounded" />
              <div className="h-10 bg-purple-100/60 rounded w-1/2" />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (err || !book) {
    return (
      <>
        <Header />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{err || "Truyện không tồn tại"}</h1>
          <Link
            to="/home"
            className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 
                       font-medium hover:font-bold transition"
          >
            ← Quay lại trang chủ
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="max-w-5xl mx-auto px-6 py-12 animate-fadeIn">
        <div className="grid md:grid-cols-3 gap-8 bg-white rounded-2xl shadow-lg p-6 relative">
          {/* Nút 3 chấm góc phải trên */}
          <div ref={menuRef} className="absolute right-4 top-4">
            <div className="relative">
              <button
                aria-label="More options"
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex items-center justify-center rounded-lg border border-purple-200 bg-white px-2 py-1.5 text-gray-700 hover:bg-purple-50"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <circle cx="5" cy="12" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+8px)] z-20 w-56 rounded-xl border border-purple-100 bg-white shadow-xl overflow-hidden">
                  {/* mũi tên nhỏ */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-0 w-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white drop-shadow" />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setOpenReportNovel(true);
                    }}
                    className="w-full text-center px-4 py-4 text-sm hover:bg-purple-50"
                  >
                    🚩 Báo cáo truyện
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Ảnh bìa */}
          <div className="md:col-span-1 flex justify-center">
            <img
              src={book.cover}
              alt={book.title}
              className="w-64 h-auto rounded-xl shadow-md transform hover:scale-105 transition"
            />
          </div>

          {/* Nội dung chi tiết */}
          <div className="md:col-span-2 flex flex-col justify-center">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent leading-relaxed">
              {book.title}
            </h1>

            <p className="text-gray-700 text-sm mb-2 mt-2">
              <span className="font-medium">Tác giả:</span> {book.authorName}
            </p>

            <p className="text-gray-700 text-sm mb-4">
              <span className="font-medium">Thể loại:</span>{" "}
              <Link
                to={`/category/${encodeURIComponent(genreName || "")}`}
                className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 font-semibold hover:underline"
              >
                {genreName || "Khác"}
              </Link>
            </p>

            <p className="text-gray-600 leading-relaxed mb-6">
              {book.description}
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow hover:font-bold hover:scale-105 transition"
                onClick={handleReadNow}
              >
                Đọc ngay
              </button>

              <button
                onClick={handleToggleFav}
                aria-pressed={fav}
                title={fav ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
                className={`px-6 py-2 rounded-xl border transition ${
                  fav
                    ? "border-pink-300 bg-pink-50 text-pink-600 hover:bg-pink-100"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {fav ? "Đang yêu thích ❤️" : "Thêm vào yêu thích 🤍"}
              </button>

              <Link
                to="/home"
                className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 hover:font-bold hover:bg-gray-50 transition"
              >
                ← Quay lại
              </Link>
            </div>
          </div>
        </div>

        {/* Gợi ý truyện cùng thể loại */}
        {suggestions.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">
              Gợi ý truyện cùng thể loại
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {suggestions.slice(0, 4).map((s) => (
                <Link
                  key={s.id}
                  to={`/novel/${s.id}`}
                  className="bg-white rounded-lg p-2 shadow-md cursor-pointer 
                            transform transition duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <img
                    src={s.cover}
                    alt={s.title}
                    className="w-full h-52 object-cover rounded-lg"
                  />
                  <p className="mt-2 text-sm font-semibold">{s.title}</p>
                  <p className="text-xs text-gray-500">{s.authorName || ""}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ================== COMMENTS (demo local) ================== */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Bình luận</h2>

          {commentsState.length === 0 ? (
            <div className="rounded-2xl border border-purple-200 p-6 text-gray-600">
              Chưa có bình luận nào. Hãy là người đầu tiên!
            </div>
          ) : (
            <ul className="space-y-4">
              {commentsState.map((c) => (
                <li
                  key={c.id}
                  className="rounded-2xl border border-purple-200 bg-white p-4 flex items-start gap-3"
                >
                  <img
                    src={c.avatar}
                    alt={c.user}
                    className="h-10 w-10 rounded-lg ring-1 ring-purple-100 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-gray-900">{c.user}</div>
                        <div className="text-xs text-gray-500">{c.createdAt}</div>
                      </div>
                    </div>
                    <div className="mt-1 text-gray-800 whitespace-pre-wrap">
                      {c.content}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* --- FORM THÊM BÌNH LUẬN --- */}
          <div className="mt-6 border-t border-purple-100 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Thêm bình luận
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newComment.trim()) {
                  alert("Vui lòng nhập nội dung bình luận.");
                  return;
                }
                const now = new Date();
                const newData = {
                  id: "cmt-" + now.getTime(),
                  user: "Người dùng ẩn danh",
                  avatar:
                    "https://api.dicebear.com/7.x/thumbs/svg?seed=" +
                    Math.random().toString(36).substring(7),
                  content: newComment.trim(),
                  createdAt: now.toISOString().slice(0, 16).replace("T", " "),
                };
                const updated = [...commentsState, newData];
                setCommentsState(updated);
                setNewComment("");
                localStorage.setItem(`comments-${id}`, JSON.stringify(updated));
              }}
              className="space-y-3"
            >
              <textarea
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Chia sẻ cảm nghĩ của bạn về truyện này..."
                className="w-full rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-pink-500 px-3 py-2 text-sm"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                >
                  Gửi bình luận
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />

      {/* ================== MODAL: BÁO CÁO TRUYỆN ================== */}
      <div className={`fixed inset-0 z-50 ${openReportNovel ? "" : "pointer-events-none"}`}>
        {/* backdrop */}
        <div
          onClick={() => setOpenReportNovel(false)}
          className={
            "absolute inset-0 bg-black/40 transition-opacity " +
            (openReportNovel ? "opacity-100" : "opacity-0")
          }
        />
        {/* panel */}
        <div
          className={
            "absolute left-1/2 top-1/2 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 transform rounded-2xl border border-purple-200 bg-white shadow-2xl transition " +
            (openReportNovel ? "scale-100 opacity-100" : "scale-95 opacity-0")
          }
          role="dialog"
          aria-modal="true"
        >
          <div className="p-5 border-b border-purple-100">
            <h3 className="text-xl font-semibold text-gray-900"> 🚩 Báo cáo truyện</h3>
            <p className="text-sm text-gray-600">
              Đối tượng: <span className="font-medium text-gray-900">"{book?.title}"</span>
            </p>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Loại báo cáo</label>
              <select
                className="w-full rounded-xl border border-purple-300 bg-white focus:border-purple-500 focus:ring-pink-500"
                value={novelReportType}
                onChange={(e) => setNovelReportType(e.target.value)}
              >
                <option>Nội dung không phù hợp</option>
                <option>Vi phạm bản quyền</option>
                <option>Spam / quảng cáo</option>
                <option>Khác…</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Mô tả chi tiết</label>
              <textarea
                rows={5}
                placeholder="Mô tả vấn đề, dẫn chứng… (tối thiểu 10 ký tự)"
                className={
                  "w-full rounded-xl border px-3 py-2 focus:border-purple-500 focus:ring-pink-500 " +
                  (novelErrors.text ? "border-pink-400" : "border-purple-300")
                }
                value={novelReportText}
                onChange={(e) => setNovelReportText(e.target.value)}
              />
              {novelErrors.text && (
                <div className="text-sm text-pink-600 mt-1">{novelErrors.text}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Ảnh minh chứng (tuỳ chọn)</label>
              <div className="flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm hover:bg-purple-50">
                  <input type="file" accept="image/*" multiple className="hidden" onChange={onPickNovelFiles} />
                  Tải ảnh lên
                </label>
                <span className="text-xs text-gray-500">Có thể chọn nhiều ảnh.</span>
              </div>

              {novelReportFiles.length > 0 && (
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {novelReportFiles.map((f) => (
                    <div key={f.name} className="relative group">
                      <img src={f.url} alt={f.name} className="h-24 w-full object-cover rounded-lg border border-purple-100" />
                      <button
                        type="button"
                        onClick={() => removeNovelFile(f.name)}
                        className="absolute right-1 top-1 hidden group-hover:inline-flex rounded-md bg-white/90 px-2 py-1 text-xs border border-purple-200 hover:bg-white"
                        title="Xóa ảnh"
                      >
                        ×
                      </button>
                      <div className="mt-1 text-[11px] text-gray-600 line-clamp-1" title={f.name}>
                        {f.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-5 border-t border-purple-100">
            <button
              onClick={() => {
                setOpenReportNovel(false);
                resetNovelForm();
              }}
              className="rounded-xl px-4 py-2 border border-purple-300 hover:bg-purple-50"
              disabled={sendingNovel}
            >
              Hủy bỏ
            </button>
            <button
              onClick={submitNovelReport}
              disabled={sendingNovel}
              className={
                "rounded-xl px-4 py-2 text-white bg-gradient-to-r from-purple-500 to-pink-500 " +
                (sendingNovel ? "opacity-70 cursor-not-allowed" : "hover:opacity-90")
              }
            >
              {sendingNovel ? "Đang gửi..." : "Gửi báo cáo"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
