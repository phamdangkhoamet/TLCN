// src/pages/admin/Reports.jsx
import React, { useEffect, useState } from "react";
import AdminHeader from "../../components/admin/AdminHeader";
import { api } from "../../lib/api";

const STATUS_LABELS = {
  pending: "Chờ xử lý",
  reviewing: "Đang xem xét",
  resolved: "Đã xử lý",
  rejected: "Đã từ chối",
};

const TYPE_LABELS = {
  novel: "Truyện",
  chapter: "Chương",
  comment: "Bình luận",
  other: "Khác",
};

const DECISIONS = [
  {
    key: "warn",
    label: "Mức 1: Gửi cảnh báo",
    desc: "Khi người dùng vi phạm và bị báo cáo lần 1 và 2.Gửi thông báo nhắc nhở đến tài khoản vi phạm.",
  },
  {
    key: "deleteContent",
    label: "Mức 2: Xoá nội dung vi phạm",
    desc: "Khi người dùng vi phạm lần 3. Gỡ truyện / chương / bình luận bị báo cáo khỏi hệ thống.",
  },
  {
    key: "deleteUser",
    label: "Mức 3: Khoá tài khoản vi phạm",
    desc: "Khi người dùng vi phạm hơn 3 lần. Xóa tài khoản vi phạm.",
  },
  {
    key: "reject",
    label: "Từ chối báo cáo",
    desc: "Đánh dấu báo cáo là không hợp lệ, không đủ để thực hiện các mức cảnh cáo.",
  },
];

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [selectedReportId, setSelectedReportId] = useState(null);
  const [selectedReportDetail, setSelectedReportDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [decision, setDecision] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [processing, setProcessing] = useState(false);

  // tải danh sách báo cáo
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await api.admin.reports.list();
        const list = Array.isArray(res.items)
          ? res.items
          : Array.isArray(res.data?.items)
          ? res.data.items
          : [];
        if (mounted) {
          setReports(list);
        }
      } catch (e) {
        console.error("[AdminReports] load list error:", e);
        if (mounted) {
          setErr(e.message || "Không thể tải danh sách báo cáo.");
        }
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // load chi tiết khi chọn 1 report
  useEffect(() => {
    if (!selectedReportId) {
      setSelectedReportDetail(null);
      setDecision("");
      setAdminNote("");
      setDetailLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      setDetailLoading(true);
      try {
        const res = await api.admin.reports.detail(selectedReportId);
        if (mounted) {
          setSelectedReportDetail(res.report || res.data?.report || null);
        }
      } catch (e) {
        console.error("[AdminReports] load detail error:", e);
      } finally {
        mounted && setDetailLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedReportId]);

  function formatDate(d) {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleString();
  }

  async function handleActionSubmit(e) {
    e.preventDefault();
    if (!selectedReportId) return;
    if (!decision) {
      alert("Vui lòng chọn 1 hình thức xử lý.");
      return;
    }

    try {
      setProcessing(true);
      await api.admin.reports.action(selectedReportId, {
        decision,
        adminNote: adminNote.trim() || undefined,
      });

      // Cập nhật lại report trong danh sách
      setReports((prev) =>
        prev.map((r) =>
          String(r._id) === String(selectedReportId)
            ? {
                ...r,
                status:
                  decision === "reject"
                    ? "rejected"
                    : "resolved",
                lastAction:
                  decision === "deleteContent"
                    ? "delete"
                    : decision === "deleteUser"
                    ? "lock"
                    : null,
                adminNote: adminNote.trim() || r.adminNote,
                resolvedAt: new Date().toISOString(),
              }
            : r
        )
      );

      alert("Đã xử lý báo cáo.");
      // reset decision & note nhưng giữ chi tiết để xem
      setDecision("");
      setAdminNote("");
      // reload detail để đồng bộ (optional)
      try {
        const res = await api.admin.reports.detail(selectedReportId);
        setSelectedReportDetail(res.report || res.data?.report || null);
      } catch {
        /* ignore */
      }
    } catch (e) {
      console.error("[AdminReports] action error:", e);
      alert(e.message || "Có lỗi xảy ra khi xử lý báo cáo.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Quản lý báo cáo vi phạm" />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {err && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
            {err}
          </div>
        )}

        {/* Danh sách báo cáo */}
        <div className="bg-white border rounded-md shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h2 className="font-semibold text-lg">Danh sách báo cáo</h2>
            {loading && (
              <span className="text-xs text-gray-500">Đang tải...</span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">ID</th>
                  <th className="px-3 py-2 text-left font-medium">Loại</th>
                  <th className="px-3 py-2 text-left font-medium">Lý do</th>
                  <th className="px-3 py-2 text-left font-medium">Trạng thái</th>
                  <th className="px-3 py-2 text-left font-medium">Ngày tạo</th>
                  <th className="px-3 py-2 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {!loading && reports.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-4 text-center text-gray-500"
                    >
                      Chưa có báo cáo nào.
                    </td>
                  </tr>
                )}

                {reports.map((r) => {
                  const isSelected =
                    selectedReportId &&
                    String(selectedReportId) === String(r._id);
                  return (
                    <tr
                      key={r._id}
                      className={
                        "border-t hover:bg-gray-50 " +
                        (isSelected ? "bg-blue-50" : "")
                      }
                    >
                      <td className="px-3 py-2 align-top text-xs break-all">
                        {r._id}
                      </td>
                      <td className="px-3 py-2 align-top">
                        {TYPE_LABELS[r.type] || r.type}
                      </td>
                      <td className="px-3 py-2 align-top max-w-xs">
                        <div className="line-clamp-2">
                          {r.reason || <span className="text-gray-400">—</span>}
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border">
                          {STATUS_LABELS[r.status] || r.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-top">
                        {formatDate(r.createdAt)}
                      </td>
                      <td className="px-3 py-2 align-top text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedReportId(
                              String(selectedReportId) === String(r._id)
                                ? null
                                : r._id
                            )
                          }
                          className="text-xs px-3 py-1 rounded border bg-white hover:bg-gray-100"
                        >
                          {isSelected ? "Đóng" : "Xử lý"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel chi tiết & xử lý */}
        {selectedReportId && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Chi tiết báo cáo */}
            <div className="bg-white border rounded-md shadow-sm p-4">
              <h3 className="font-semibold mb-3">Chi tiết báo cáo</h3>
              {detailLoading && (
                <p className="text-sm text-gray-500">Đang tải chi tiết...</p>
              )}
              {!detailLoading && selectedReportDetail && (
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">ID: </span>
                    <span className="break-all">{selectedReportDetail._id}</span>
                  </div>
                  <div>
                    <span className="font-medium">Loại: </span>
                    {TYPE_LABELS[selectedReportDetail.type] ||
                      selectedReportDetail.type}
                  </div>
                  {selectedReportDetail.novelId && (
                    <div>
                      <span className="font-medium">Truyện: </span>
                      {typeof selectedReportDetail.novelId === "object"
                        ? selectedReportDetail.novelId.title ||
                          selectedReportDetail.novelId._id
                        : selectedReportDetail.novelId}
                    </div>
                  )}
                  {selectedReportDetail.chapterNo != null &&
                    selectedReportDetail.type === "chapter" && (
                      <div>
                        <span className="font-medium">Chương: </span>
                        {selectedReportDetail.chapterNo}
                      </div>
                    )}
                  {selectedReportDetail.commentId &&
                    selectedReportDetail.type === "comment" && (
                      <div>
                        <span className="font-medium">Bình luận ID: </span>
                        {typeof selectedReportDetail.commentId === "object"
                          ? selectedReportDetail.commentId._id
                          : selectedReportDetail.commentId}
                      </div>
                    )}
                  <div>
                    <span className="font-medium">Người báo cáo: </span>
                    {selectedReportDetail.userId
                      ? selectedReportDetail.userId.name ||
                        selectedReportDetail.userId.email ||
                        selectedReportDetail.userId._id
                      : "Ẩn danh / không xác định"}
                  </div>
                  <div>
                    <span className="font-medium">Lý do: </span>
                    {selectedReportDetail.reason || "—"}
                  </div>
                  <div>
                    <span className="font-medium">Mô tả: </span>
                    <p className="whitespace-pre-line">
                      {selectedReportDetail.description || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Trạng thái: </span>
                    {STATUS_LABELS[selectedReportDetail.status] ||
                      selectedReportDetail.status}
                  </div>
                  {selectedReportDetail.adminNote && (
                    <div>
                      <span className="font-medium">Ghi chú admin: </span>
                      <p className="whitespace-pre-line">
                        {selectedReportDetail.adminNote}
                      </p>
                    </div>
                  )}
                  {selectedReportDetail.resolvedAt && (
                    <div>
                      <span className="font-medium">Thời gian xử lý: </span>
                      {formatDate(selectedReportDetail.resolvedAt)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Form xử lý */}
            <div className="bg-white border rounded-md shadow-sm p-4">
              <h3 className="font-semibold mb-3">Xử lý báo cáo</h3>
              <form onSubmit={handleActionSubmit} className="space-y-3">
                <div className="space-y-2">
                  {DECISIONS.map((d) => (
                    <label
                      key={d.key}
                      className={
                        "flex items-start gap-2 border rounded px-3 py-2 cursor-pointer hover:bg-gray-50 " +
                        (decision === d.key
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200")
                      }
                    >
                      <input
                        type="radio"
                        className="mt-1"
                        name="decision"
                        value={d.key}
                        checked={decision === d.key}
                        onChange={() => setDecision(d.key)}
                      />
                      <div>
                        <div className="font-medium text-sm">{d.label}</div>
                        <div className="text-xs text-gray-500">{d.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ghi chú (tuỳ chọn)
                  </label>
                  <textarea
                    rows={3}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Ví dụ: Đã xoá bình luận vi phạm, người dùng đã được cảnh báo..."
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    className="text-xs text-red-600 underline hover:font-bold"
                    onClick={() => setSelectedReportId(null)}
                    disabled={processing}
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={processing || !decision}
                    className="px-4 py-2 text-m bg-blue-600 text-white rounded disabled:opacity-60 hover:font-bold"
                  >
                    {processing ? "Đang xử lý..." : "Xác nhận xử lý"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
