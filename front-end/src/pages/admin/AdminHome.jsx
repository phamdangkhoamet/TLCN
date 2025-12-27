// src/pages/admin/AdminHome.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AdminHeader from "../../components/admin/AdminHeader";
import { api } from "../../lib/api";

function Section({ title, note, children }) {
  return (
    <section className="min-h-[60vh] flex flex-col justify-center px-6 sm:px-10 py-10 border-b border-purple-100">
      <div className="max-w-6xl mx-auto w-full">
        <header className="mb-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {title}
          </h2>
          {note && <p className="text-lg text-gray-600 mt-2">{note}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}

function StatCard({ label, value, sub, to }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => to && navigate(to)}
      className="w-full text-left rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-8 shadow hover:shadow-lg transition outline-none border border-transparent hover:border-pink-200 cursor-pointer"
      aria-label={`Đi tới ${label}`}
    >
      <div className="text-5xl font-extrabold text-gray-900 mb-2">
        {value?.toLocaleString?.() ?? value}
      </div>
      <div className="text-xl font-semibold text-gray-800">{label}</div>
      {sub && <p className="text-gray-600 mt-1">{sub}</p>}
    </button>
  );
}

// Helper bóc mảng items từ nhiều dạng response khác nhau
function extractItems(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.data)) return res.data;
  if (res.data && Array.isArray(res.data.items)) return res.data.items;

  if (Array.isArray(res.users)) return res.users;
  if (Array.isArray(res.novels)) return res.novels;
  if (Array.isArray(res.chapters)) return res.chapters;
  if (Array.isArray(res.reports)) return res.reports;
  if (Array.isArray(res.notifications)) return res.notifications;

  return [];
}

export default function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [stats, setStats] = useState({
    admins: 0,
    users: 0,
    novels: 0,
    chapters: 0,
    notifications: 0,
    pendingNovels: 0,
    pendingReports: 0,
  });

  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setErr("");

        const [userRes, novelRes, chapterRes, reportRes, notifyRes] =
          await Promise.all([
            api.admin.listUsers(),
            api.admin.novels.list({}),
            api.admin.chapters.list({}),
            api.admin.reports.list({}),
            api.admin.notifications.list({}),
          ]);

        if (!mounted) return;

        const users = extractItems(userRes);
        const novels = extractItems(novelRes);
        const chapters = extractItems(chapterRes);
        const reports = extractItems(reportRes);
        const notifications = extractItems(notifyRes);

        const adminsCount = users.filter((u) => u.role === "admin").length;
        // Người dùng = tất cả account không phải admin (bao gồm user, author,…)
        const usersCount = users.filter((u) => u.role !== "admin").length;

        const pendingNovelsCount = novels.filter(
          (n) => n.status === "pending"
        ).length;

        const pendingReportsCount = reports.filter(
          (r) => r.status === "pending"
        ).length;

        setStats({
          admins: adminsCount,
          users: usersCount,
          novels: novels.length,
          chapters: chapters.length,
          notifications: notifications.length,
          pendingNovels: pendingNovelsCount,
          pendingReports: pendingReportsCount,
        });

        setRecentReports(reports.slice(0, 5));
      } catch (e) {
        console.error("[AdminHome] loadData error:", e);
        setErr(e.message || "Không thể tải dữ liệu.");
      } finally {
        mounted && setLoading(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const approvedCount = useMemo(
    () => Math.max(stats.novels - stats.pendingNovels, 0),
    [stats.novels, stats.pendingNovels]
  );

  return (
    <div className="bg-white text-gray-900">
      <AdminHeader
        pendingCount={stats.pendingNovels}     // vẫn dùng cho header (truyện chờ duyệt)
        approvedCount={approvedCount}
        reportCount={stats.pendingReports}
        keywordCount={0}
      />

      {/* --- SECTION: TỔNG QUAN --- */}
      <Section
        title="Tổng quan hệ thống"
        note={
          loading
            ? "Đang tải dữ liệu..."
            : "Các chỉ số chính của hệ thống quản lý truyện và người dùng."
        }
      >
        {err && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
            {err}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* 1. Admin */}
          <StatCard
            label="Admin"
            value={stats.admins}
            sub="Tài khoản quản trị"
            to="/admin/users?role=admin"
          />

          {/* 2. Người dùng */}
          <StatCard
            label="Người dùng"
            value={stats.users}
            sub="Tài khoản người dùng"
            to="/admin/users"
          />

          {/* 3. Truyện */}
          <StatCard
            label="Truyện"
            value={stats.novels}
            sub="Trong hệ thống"
            to="/admin/moderation"
          />

          {/* 4. Chương */}
          <StatCard
            label="Chương"
            value={stats.chapters}
            sub="Đã xuất bản"
            to="/admin/moderation"
          />

          {/* 5. Thông báo */}
          <StatCard
            label="Thông báo"
            value={stats.notifications}
            sub="Đã gửi đến người dùng"
            to="/admin/notifications"
          />

          {/* 6. Báo cáo vi phạm */}
          <StatCard
            label="Báo cáo vi phạm"
            value={stats.pendingReports}
            sub="Chưa xử lý"
            to="/admin/reports"
          />
        </div>
      </Section>

      {/* --- SECTION: BÁO CÁO VI PHẠM GẦN ĐÂY --- */}
      <Section
        title="Báo cáo vi phạm"
        note="Một số báo cáo gần đây do người dùng gửi lên."
      >
        <div className="bg-white rounded-2xl border border-purple-200">
          {recentReports.length === 0 && !loading && (
            <div className="p-6 text-gray-500 text-sm">
              Hiện chưa có báo cáo nào.
            </div>
          )}

          <ul className="divide-y divide-purple-100">
            {recentReports.map((r) => (
              <li
                key={r._id}
                className="p-6 flex items-center justify-between hover:bg-purple-50/40"
              >
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {r.type === "novel"
                      ? "Báo cáo truyện"
                      : r.type === "chapter"
                      ? "Báo cáo chương"
                      : r.type === "comment"
                      ? "Báo cáo bình luận"
                      : "Báo cáo khác"}
                  </h4>
                  <p className="text-sm text-gray-700 mt-1">
                    {r.reason || "Không có lý do chi tiết."}
                  </p>
                  <span className="text-xs text-gray-500 block mt-1">
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleString()
                      : ""}
                  </span>
                  <span className="inline-flex items-center mt-1 text-xs px-2 py-0.5 rounded-full border border-purple-200 text-purple-700 bg-purple-50">
                    Trạng thái: {r.status || "pending"}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <Link
                    to="/admin/reports"
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 text-sm text-center"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* --- SECTION: TÁC VỤ NHANH --- */}
      <Section title="Tác vụ nhanh" note="Các thao tác quản lý thường dùng.">
        <div className="flex flex-col gap-4">
          <Link
            to="/admin/users"
            className="rounded-xl px-6 py-4 text-xl text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 hover:text-white hover:font-bold hover:opacity-90 transition text-center"
          >
            Quản lý người dùng
          </Link>
          <Link
            to="/admin/novels"
            className="rounded-xl px-6 py-4 text-xl text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 hover:text-white hover:font-bold hover:opacity-90 transition text-center"
          >
            Quản lý tác phẩm
          </Link>
          <Link
            to="/admin/notifications"
            className="rounded-xl px-6 py-4 text-xl text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 hover:text-white hover:font-bold hover:opacity-90 transition text-center"
          >
            Quản lý thông báo
          </Link>
          <Link
            to="/admin/reports"
            className="rounded-xl px-6 py-4 text-xl text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 hover:text-white hover:font-bold hover:opacity-90 transition text-center"
          >
            Quản lý vi phạm
          </Link>
        </div>
      </Section>
    </div>
  );
}
