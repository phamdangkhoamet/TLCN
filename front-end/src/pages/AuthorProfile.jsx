// front-end/src/pages/AuthorProfile.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function AuthorProfile() {
  const { id } = useParams();

  const [author, setAuthor] = useState(null);
  const [works, setWorks] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState("");

  // ===== Load thông tin tác giả =====
  useEffect(() => {
    if (id) {
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const data = await api.authors.detail(id);
      console.log("Author detail API response:", data);

      const authorData = data.author || data.item || data;
      if (!authorData || !authorData._id) {
        setAuthor(null);
        setWorks([]);
        setFollowersCount(0);
        setIsFollowing(false);
        setError("Không tìm thấy tác giả.");
        return;
      }
      setAuthor(authorData);

      if (Array.isArray(data.works)) {
        setWorks(data.works);
      } else if (Array.isArray(data.novels)) {
        setWorks(data.novels);
      } else {
        setWorks([]);
      }

      const followers =
        data.followersCount ??
        data.followers ??
        data.followerCount ??
        authorData.followersCount ??
        0;
      setFollowersCount(followers);

      const followingFlag =
        data.isFollowing ??
        data.is_following ??
        authorData.isFollowing ??
        false;
      setIsFollowing(!!followingFlag);
    } catch (err) {
      console.error("Load author profile error:", err);
      setError(err.message || "Lỗi khi tải thông tin tác giả.");
      setAuthor(null);
    } finally {
      setLoading(false);
    }
  }

  // ===== Follow / Unfollow =====
  async function handleToggleFollow() {
    try {
      if (!id) return;
      setFollowLoading(true);

      let res;
      if (isFollowing) {
        res = await api.authors.unfollow(id);
      } else {
        res = await api.authors.follow(id);
      }

      if (typeof res.isFollowing !== "undefined") {
        setIsFollowing(res.isFollowing);
      } else {
        setIsFollowing(!isFollowing);
      }

      if (typeof res.followersCount !== "undefined") {
        setFollowersCount(res.followersCount);
      }
    } catch (err) {
      console.error("Toggle follow error:", err);
      if (err.message && err.message.includes("Chưa đăng nhập")) {
        alert("Bạn cần đăng nhập để theo dõi tác giả.");
      }
    } finally {
      setFollowLoading(false);
    }
  }

  // ===== Render =====
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-6">
          <div className="max-w-5xl mx-auto px-4">
            <div className="bg-white shadow-sm rounded-2xl px-6 py-10 text-center text-gray-600">
              Đang tải thông tin tác giả...
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!loading && !author) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-6">
          <div className="max-w-5xl mx-auto px-4">
            <div className="bg-white shadow-sm rounded-2xl px-6 py-10 text-center text-gray-600">
              {error || "Không tìm thấy thông tin tác giả."}
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-5xl mx-auto px-4 space-y-6">
          {/* Card thông tin tác giả */}
          <div className="bg-white shadow-sm rounded-2xl p-6 flex flex-col md:flex-row gap-6">
            <img
              src={author.avatar || "https://via.placeholder.com/160"}
              alt={author.name}
              className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover ring-2 ring-purple-200"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {author.name}
                  </h1>
                  {author.country && (
                    <p className="text-sm text-gray-500 mt-1">
                      {author.country}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                    <span>
                      <span className="font-semibold text-gray-800">
                        {followersCount}
                      </span>{" "}
                      người theo dõi
                    </span>
                    <span>
                      <span className="font-semibold text-gray-800">
                        {works.length}
                      </span>{" "}
                      tác phẩm
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleToggleFollow}
                  disabled={followLoading}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition whitespace-nowrap ${
                    isFollowing
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-sm"
                      : "border-purple-200 text-purple-700 hover:bg-purple-50"
                  }`}
                >
                  {isFollowing ? "Bỏ theo dõi" : "Theo dõi"}
                </button>
              </div>

              {/* dẫn về trang authors */}
              <div className="mt-3 text-xs text-gray-500">
                <Link
                  to="/authors"
                  className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700"
                >
                  ← Quay lại danh sách tác giả
                </Link>
              </div>
            </div>
          </div>

          {/* Giới thiệu */}
          {author.bio && (
            <div className="bg-white shadow-sm rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Giới thiệu
              </h2>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {author.bio}
              </p>
            </div>
          )}

          {/* Danh sách tác phẩm */}
          <div className="bg-white shadow-sm rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Danh sách tác phẩm
              </h2>
              <span className="text-sm text-gray-500">
                Tổng:{" "}
                <span className="font-medium text-gray-800">
                  {works.length}
                </span>{" "}
                truyện
              </span>
            </div>

            {works.length === 0 ? (
              <p className="text-sm text-gray-600">
                Tác giả chưa có tác phẩm nào.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {works.map((n) => (
                  <div
                    key={n._id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
                  >
                    <div className="w-full h-40 bg-gray-100 overflow-hidden">
                      <img
                        src={n.cover || "https://via.placeholder.com/200x280"}
                        alt={n.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <h3
                        className="font-semibold text-sm text-gray-800 line-clamp-2"
                        title={n.title}
                      >
                        {n.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {n.totalChapters || 0} chương •{" "}
                        {n.status || "updating"}
                      </p>

                      <div className="mt-auto pt-3 flex justify-end">
                        <Link
                          to={`/novel/${n._id || n.id}`}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 hover:bg-gray-50 transition"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
