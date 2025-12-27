// src/pages/Report.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

const REASON_OPTIONS = [
  "Nội dung phản cảm / 18+ không phù hợp",
  "Ngôn từ thù hận, phân biệt đối xử",
  "Spam, quảng cáo, lừa đảo",
  "Bản quyền / sao chép không phép",
  "Khác (mô tả chi tiết ở phía dưới)",
];

function useQuery() {
  const location = useLocation();
  return new URLSearchParams(location.search);
}

export default function Report() {
  const navigate = useNavigate();
  const query = useQuery();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    type: "other",       // "novel" | "chapter" | "comment" | "other"
    novelId: "",
    chapterNo: "",
    commentId: "",
    reason: "",
    description: "",
  });

  // Prefill từ query string (nếu có)
  useEffect(() => {
    const type = query.get("type");
    const novelId = query.get("novelId");
    const chapterNo = query.get("chapterNo");
    const commentId = query.get("commentId");

    setForm((prev) => ({
      ...prev,
      type: type && ["novel", "chapter", "comment", "other"].includes(type)
        ? type
        : prev.type,
      novelId: novelId || prev.novelId,
      chapterNo: chapterNo || prev.chapterNo,
      commentId: commentId || prev.commentId,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.reason.trim()) {
      setError("Vui lòng chọn hoặc nhập lý do báo cáo.");
      return;
    }

    const body = {
      type: form.type,
      reason: form.reason.trim(),
      description: form.description.trim(),
    };

    if (form.type === "novel" || form.type === "chapter") {
      if (form.novelId) body.novelId = form.novelId;
      if (form.type === "chapter" && form.chapterNo) {
        body.chapterNo = Number(form.chapterNo);
      }
    }

    if (form.type === "comment" && form.commentId) {
      body.commentId = form.commentId;
    }

    try {
      setSubmitting(true);
      await api.reports.create(body);
      alert("Đã gửi báo cáo vi phạm. Cảm ơn bạn đã đóng góp!");
      // reset nhẹ và quay lại trang trước
      setForm((prev) => ({
        ...prev,
        reason: "",
        description: "",
      }));
      navigate(-1);
    } catch (err) {
      console.error("Send report error:", err);
      setError(err.message || "Không gửi được báo cáo. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Báo cáo vi phạm</h1>
      <p className="text-sm text-gray-600 mb-4">
        Vui lòng cung cấp thông tin chính xác. Ban quản trị sẽ xem xét và xử lý trong thời gian sớm nhất.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 border rounded-md p-4 bg-white shadow-sm">
        {/* Loại đối tượng báo cáo */}
        <div>
          <label className="block text-sm font-medium mb-1">Bạn muốn báo cáo</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="novel">Truyện</option>
            <option value="chapter">Chương</option>
            <option value="comment">Bình luận</option>
            <option value="other">Khác</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Tuỳ theo loại bạn chọn, hãy nhập đúng mã truyện / chương / bình luận nếu có.
          </p>
        </div>

        {/* Thông tin truyện / chương / bình luận tương ứng */}
        {form.type === "novel" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Mã truyện (novelId)
            </label>
            <input
              type="text"
              name="novelId"
              value={form.novelId}
              onChange={handleChange}
              placeholder="Nhập ID truyện (nếu bạn được điền sẵn thì không cần sửa)"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        )}

        {form.type === "chapter" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                Mã truyện (novelId)
              </label>
              <input
                type="text"
                name="novelId"
                value={form.novelId}
                onChange={handleChange}
                placeholder="Nhập ID truyện"
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Số chương (chapterNo)
              </label>
              <input
                type="number"
                name="chapterNo"
                value={form.chapterNo}
                onChange={handleChange}
                placeholder="Ví dụ: 1, 2, 3..."
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </>
        )}

        {form.type === "comment" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Mã bình luận (commentId)
            </label>
            <input
              type="text"
              name="commentId"
              value={form.commentId}
              onChange={handleChange}
              placeholder="Nhập ID bình luận (thường được hệ thống gắn sẵn khi bạn bấm Báo cáo)"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        )}

        {/* Lý do báo cáo */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Lý do báo cáo <span className="text-red-500">*</span>
          </label>
          <select
            name="reason"
            value={form.reason}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm mb-2"
          >
            <option value="">-- Chọn lý do --</option>
            {REASON_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <textarea
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            placeholder="Mô tả chi tiết nội dung vi phạm (nếu có thêm thông tin, hãy ghi rõ ở đây)."
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            className="px-3 py-2 text-sm border rounded"
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-red-600 text-white rounded disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Đang gửi..." : "Gửi báo cáo"}
          </button>
        </div>
      </form>
    </div>
  );
}
