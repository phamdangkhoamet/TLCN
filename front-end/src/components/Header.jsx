// src/components/Header.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

// (Tuỳ chọn) truyền từ App hoặc lấy từ localStorage
const getCurrentUserName = () =>
  localStorage.getItem("currentUserName") || "Người dùng";

function useClickOutside(ref, onClose) {
  useEffect(() => {
    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [ref, onClose]);
}

export default function Header({
  unreadCount,   // <- bỏ default 0, để biết khi nào parent truyền xuống
  onSearch,
}) {
  const [query, setQuery] = useState("");
  const [openProfile, setOpenProfile] = useState(false);
  const profileRef = useRef(null);
  useClickOutside(profileRef, () => setOpenProfile(false));

  const nav = useNavigate();

  const userName = getCurrentUserName();

  const navItem =
    "relative inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition";
  const active =
    "text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow";
  const inactive = "text-gray-800 hover:bg-purple-50";

  // ==== UNREAD NOTIFICATIONS (auto load nếu không truyền prop) ====
  const [internalUnread, setInternalUnread] = useState(0);

  useEffect(() => {
    // Nếu parent đã truyền unreadCount -> dùng luôn, không tự fetch
    if (typeof unreadCount === "number") return;

    let cancelled = false;

    async function fetchUnread() {
      try {
        const res = await api.notifications.list();
        const list =
          Array.isArray(res) ? res : res.items || res.notifications || [];
        const c = list.filter((n) => !n.read).length;
        if (!cancelled) setInternalUnread(c);
      } catch (err) {
        console.error("Load unread notifications error:", err);
      }
    }

    fetchUnread();

    return () => {
      cancelled = true;
    };
  }, [unreadCount]);

  // Số hiển thị trên badge: ưu tiên prop, fallback internal
  const badgeCount =
    typeof unreadCount === "number" ? unreadCount : internalUnread;

  // ---- Debounce local search  (chỉ lọc trong trang hiện tại) ----
  useEffect(() => {
    const t = setTimeout(() => {
      onSearch?.(query.trim());
    }, 250);
    return () => clearTimeout(t);
  }, [query, onSearch]);

  const submitSearch = (e) => {
    e.preventDefault();
    onSearch?.(query.trim()); // enter vẫn gọi lọc tại chỗ
  };

  // ==== ĐĂNG XUẤT ====
  function handleLogout() {
    api.auth.logout();
    localStorage.removeItem("currentUserName");
    setOpenProfile(false);
    nav("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50/80 backdrop-blur supports-[backdrop-filter]:bg-gradient-to-r supports-[backdrop-filter]:from-purple-50 supports-[backdrop-filter]:to-pink-50/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Brand */}
          <Link to="/home" className="inline-flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow ring-2 ring-white/70" />
            <div className="text-lg font-bold text-gray-900">DKStory</div>
          </Link>

          {/* Center: nav (desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavLink
              to="/home"
              end
              className={({ isActive }) =>
                `${navItem} ${isActive ? active : inactive}`
              }
            >
              Trang chủ
            </NavLink>

            <NavLink
              to="/authors"
              className={({ isActive }) =>
                `${navItem} ${isActive ? active : inactive}`
              }
            >
              Tác giả
            </NavLink>

            <NavLink
              to="/genres"
              className={({ isActive }) =>
                `${navItem} ${isActive ? active : inactive}`
              }
            >
              Thể loại
            </NavLink>

            <NavLink
              to="/library"
              className={({ isActive }) =>
                `${navItem} ${isActive ? active : inactive}`
              }
            >
              Thư viện
            </NavLink>
            <NavLink
              to="/chat"
              className={({ isActive }) =>
                `${navItem} ${isActive ? active : inactive}`
              }
            >
              Chat
            </NavLink>

          </nav>

          {/* Right: search + actions */}
          <div className="flex items-center gap-3">
            {/* Search (desktop) */}
            <form onSubmit={submitSearch} className="hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm trong trang này..."
                  className="w-64 rounded-xl border-purple-200 bg-white/90 pl-10 pr-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-purple-500 focus:ring-pink-500"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="size-4"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-3.5-3.5" />
                  </svg>
                </div>
              </div>
            </form>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-gray-700 ring-1 ring-purple-100 hover:bg-purple-50"
              aria-label="Notifications"
              title="Thông báo"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-5"
              >
                <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
                <path d="M9 21a3 3 0 0 0 6 0" />
              </svg>
              {badgeCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.1rem] items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-semibold text-white">
                  {badgeCount}
                </span>
              )}
            </Link>

            {/* User menu ... (phần còn lại giữ nguyên) */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setOpenProfile((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-2 py-1.5 text-sm text-gray-800 ring-1 ring-purple-100 hover:bg-purple-50"
                title="Tài khoản"
                type="button"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </span>
                <svg
                  className="size-4 text-gray-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {openProfile && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-purple-100 bg-white p-2 shadow-lg">
                  <div className="px-3 py-2 text-xs text-gray-500">
                    Đang đăng nhập: <b className="text-gray-800">{userName}</b>
                  </div>
                  <NavLink
                    to="/profile"
                    onClick={() => setOpenProfile(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-purple-50"
                  >
                    Hồ sơ cá nhân
                  </NavLink>
                  <NavLink
                    to="/notifications"
                    onClick={() => setOpenProfile(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-purple-50"
                  >
                    Thông báo
                  </NavLink>
                  <NavLink
                    to="/favorites"
                    onClick={() => setOpenProfile(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-pink-50"
                  >
                    Danh sách yêu thích
                  </NavLink>
                  <hr className="my-1 border-purple-100" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-pink-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={submitSearch} className="md:hidden pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm trong trang này..."
              className="w-full rounded-xl border-purple-200 bg-white/90 pl-10 pr-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-purple-500 focus:ring-pink-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-4"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-3.5-3.5" />
              </svg>
            </div>
          </div>
        </form>
      </div>
    </header>
  );
}
