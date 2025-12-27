// src/components/admin/AdminHeader.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

function useClickOutside(ref, onClose) {
  useEffect(() => {
    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [ref, onClose]);
}

export default function AdminHeader({
  pendingCount = 0,   // vẫn nhận prop nhưng không dùng nữa
  approvedCount = 0,  // để tránh phá chỗ khác
  reportCount = 0,
  keywordCount = 0,
  onSearch, // callback tìm kiếm cục bộ từng trang
}) {
  const navigate = useNavigate();
  const [openMobile, setOpenMobile] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const profileRef = useRef(null);
  useClickOutside(profileRef, () => setOpenProfile(false));

  // --- Search state ---
  const [query, setQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      onSearch?.(query.trim());
    }, 250);
    return () => clearTimeout(t);
  }, [query, onSearch]);

  const submitSearch = (e) => {
    e.preventDefault();
    onSearch?.(query.trim());
  };

  function handleLogout() {
    try {
      api?.auth?.logout?.();
    } catch {}
    localStorage.removeItem("sessionUser");
    navigate("/login");
  }

  const navLinkCls = ({ isActive }) =>
    "relative inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition " +
    (isActive
      ? "text-white bg-gradient-to-r from-purple-500 to-pink-500"
      : "text-gray-800 hover:bg-purple-50");

  return (
    <header className="sticky top-0 z-40 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50/80 backdrop-blur supports-[backdrop-filter]:bg-gradient-to-r supports-[backdrop-filter]:from-purple-50 supports-[backdrop-filter]:to-pink-50/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hàng trên: logo + nav + profile */}
        <div className="flex h-16 items-center justify-between">
          {/* Left: brand + mobile toggle */}
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-purple-100 lg:hidden"
              onClick={() => setOpenMobile((v) => !v)}
              aria-label="Toggle Menu"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-6"
              >
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            </button>
            <Link to="/admin" className="inline-flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow ring-2 ring-white/70" />
              <div className="text-lg font-bold text-gray-900">
                DKStory Admin
              </div>
            </Link>
          </div>

          {/* Center: nav (desktop) */}
          <nav className="hidden lg:flex items-center gap-2">
            {/* Người dùng */}
            <NavLink to="/admin/users" className={navLinkCls}>
              Người dùng
            </NavLink>

            {/* Tác phẩm (từ đây đi vào quản lý chương) */}
            <NavLink to="/admin/novels" className={navLinkCls}>
              Tác phẩm
            </NavLink>

            {/* Bình luận */}
            <NavLink to="/admin/comments" className={navLinkCls}>
              Bình luận
            </NavLink>

            {/* Thông báo */}
            <NavLink to="/admin/notifications" className={navLinkCls}>
              Thông báo
            </NavLink>


            {/* Báo cáo vi phạm */}
            <NavLink to="/admin/reports" className={navLinkCls}>
              Báo cáo vi phạm
              {reportCount ? (
                <span className="ml-1 inline-flex min-w-[1.25rem] h-5 items-center justify-center rounded-full bg-pink-500/90 px-1 text-[11px] font-semibold text-white">
                  {reportCount}
                </span>
              ) : null}
            </NavLink>
          </nav>

          {/* Right: search + profile */}
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

            {/* Nút nhanh báo cáo (chuông) */}
            <Link
              to="/admin/reports"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-gray-700 ring-1 ring-purple-100 hover:bg-purple-50"
              aria-label="Reports"
              title="Báo cáo vi phạm"
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
              {reportCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.1rem] items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-semibold text-white">
                  {reportCount}
                </span>
              )}
            </Link>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setOpenProfile((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-2 py-1.5 text-sm text-gray-800 ring-1 ring-purple-100 hover:bg-purple-50"
                type="button"
              >
                <img
                  src={`https://api.dicebear.com/7.x/thumbs/svg?seed=admin`}
                  alt="avatar"
                  className="h-6 w-6 rounded-lg ring-1 ring-purple-100"
                />
                <span className="hidden sm:inline">Admin</span>
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
                  <Link
                    to="/"
                    className="block rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-purple-50"
                  >
                    Xem trang người dùng
                  </Link>
                  <button
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-800 hover:bg-purple-50"
                    onClick={handleLogout}
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

        {/* Mobile nav */}
        {openMobile && (
          <div className="pb-4 lg:hidden">
            <div className="space-y-1 rounded-2xl border border-purple-100 bg-white p-2">
              <NavLink
                to="/admin/users"
                className={navLinkCls}
                onClick={() => setOpenMobile(false)}
              >
                Người dùng
              </NavLink>

              <NavLink
                to="/admin/novels"
                className={navLinkCls}
                onClick={() => setOpenMobile(false)}
              >
                Tác phẩm
              </NavLink>

              <NavLink
                to="/admin/comments"
                className={navLinkCls}
                onClick={() => setOpenMobile(false)}
              >
                Bình luận
              </NavLink>

              <NavLink
                to="/admin/notifications"
                className={navLinkCls}
                onClick={() => setOpenMobile(false)}
              >
                Thông báo
              </NavLink>

              <NavLink
                to="/admin/rules"
                className={navLinkCls}
                onClick={() => setOpenMobile(false)}
              >
                Quy tắc & bộ lọc
              </NavLink>

              <NavLink
                to="/admin/reports"
                className={navLinkCls}
                onClick={() => setOpenMobile(false)}
              >
                Báo cáo vi phạm
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
