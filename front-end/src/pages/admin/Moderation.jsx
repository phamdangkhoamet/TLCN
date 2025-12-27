// src/pages/admin/Moderation.jsx
import React, { useMemo, useState } from "react";
import AdminHeader from "../../components/admin/AdminHeader";

// ===== Seed data cục bộ cho trang =====
const SEED_PENDING = [
  { id: 101, title: "Thiên Hạ Kiếm", author: "A. Võ", genre: "Huyền huyễn", submittedAt: "2025-03-01" },
  { id: 102, title: "Phồn Hoa", author: "B. Lâm", genre: "Ngôn tình", submittedAt: "2025-03-02" },
];
const SEED_APPROVED = [
  { id: 91, title: "Bình Minh", author: "C. Trần", genre: "Đô thị", submittedAt: "2025-02-25" },
];
const SEED_REJECTED = [
  { id: 77, title: "Phiêu Lưu Ký", author: "D. Nguyễn", genre: "Phiêu lưu", submittedAt: "2025-02-20" },
];

// ===== Thông tin chi tiết + CHƯƠNG (tạo ngay trong trang) =====
const DETAILS_BY_ID = {
  101: {
    cover: "https://picsum.photos/seed/thien-ha-kiem/480/640",
    synopsis: "Thiếu niên nhặt được bảo kiếm cổ, bị cuốn vào vòng tranh đoạt giữa các môn phái.",
    wordCount: 1250,
    chapters: 5,
    tags: ["Huyền huyễn", "Hành động", "Tu luyện"],
    note: "Đã rà soát ngôn từ, nội dung an toàn.",
  },
  102: {
    cover: "https://picsum.photos/seed/phon-hoa/480/640",
    synopsis: "Tình yêu trưởng thành giữa phố phồn hoa, mỗi người đều có bí mật riêng.",
    wordCount: 980,
    chapters: 4,
    tags: ["Ngôn tình", "Đô thị", "Chữa lành"],
    note: "Ngôn ngữ nhẹ nhàng, không có nội dung nhạy cảm.",
  },
  91: {
    cover: "https://picsum.photos/seed/binh-minh/480/640",
    synopsis: "Nhiếp ảnh gia rời phố thị về quê, tìm lại bình minh thật sự của cuộc đời.",
    wordCount: 760,
    chapters: 3,
    tags: ["Đô thị", "Tình cảm", "Đời thường"],
    note: "Đã duyệt trước đó — cập nhật chương mới.",
  },
  77: {
    cover: "https://picsum.photos/seed/phieu-luu-ky/480/640",
    synopsis: "Những người bạn nhỏ giải mã bản đồ cổ dẫn tới kho báu giữa quần đảo xa.",
    wordCount: 540,
    chapters: 3,
    tags: ["Phiêu lưu", "Thiếu nhi", "Hài hước"],
    note: "Bổ sung minh hoạ đầy đủ.",
  },
};

const CHAPTERS_BY_ID = {
  101: [
    { no: 1, title: "Bảo kiếm trong mưa", content: "Đêm mưa tầm tã, ánh chớp xé trời, chàng trai nhặt được thanh kiếm cổ trong khe đá..." },
    { no: 2, title: "Môn phái truy lùng", content: "Tin đồn lan đi, các môn phái lần lượt xuất hiện tại thị trấn ven núi..." },
    { no: 3, title: "Kiếm ý sơ hiện", content: "Trong khoảnh khắc sinh tử, kiếm ý bừng nổ phá tan vòng vây..." },
    { no: 4, title: "Lời nguyền phong ấn", content: "Bí ẩn phong ấn nghìn năm dần hé mở cùng gia phả bị lãng quên..." },
    { no: 5, title: "Đường xuống Tàng Lâm", content: "Bước vào Tàng Lâm, mọi âm thanh lặng im, chỉ còn tiếng tim đập và hơi thở..." },
  ],
  102: [
    { no: 1, title: "Quán cà phê góc phố", content: "Chiều muộn, mùi cà phê rang mới quyện vào gió, một ánh nhìn chạm nhau rất khẽ..." },
    { no: 2, title: "Bí mật sau bức ảnh", content: "Bức ảnh cũ trong khung gỗ hé lộ câu chuyện chưa từng kể..." },
    { no: 3, title: "Cơn mưa đêm", content: "Mưa làm phố mờ đi, nhưng những điều chưa nói lại hiện rõ hơn bao giờ hết..." },
    { no: 4, title: "Phồn hoa", content: "Giữa phồn hoa, họ chọn nắm tay nhau đi tiếp, giản dị mà bền bỉ..." },
  ],
  91: [
    { no: 1, title: "Bình minh đầu ngõ", content: "Ánh nắng đầu tiên lùa qua hàng cau, gọi dậy mùi lúa non..." },
    { no: 2, title: "Khung hình cũ", content: "Chiếc máy ảnh film kêu lạch cạch, bắt lấy khoảnh khắc ngày xưa..." },
    { no: 3, title: "Về nhà", content: "Hoàng hôn rơi trên triền đê, anh nhận ra nơi muốn trở về..." },
  ],
  77: [
    { no: 1, title: "Mảnh bản đồ bị rách", content: "Tấm giấy cổ loang ố, những ký hiệu khó hiểu dẫn tới vịnh lặng gió..." },
    { no: 2, title: "Hải đồ sao trời", content: "Dựa theo vì sao, con thuyền lướt qua rặng san hô sắc màu..." },
    { no: 3, title: "Kho báu và lựa chọn", content: "Kho báu không chỉ là vàng bạc, mà là tình bạn giữa những đứa trẻ..." },
  ],
};

// Demo số lượng cho Header
const REPORT_COUNT_DEMO = 5;
const KEYWORD_COUNT_DEMO = 3;

export default function Moderation() {
  const [status, setStatus] = useState("pending"); // pending | approved | rejected

  // Nạp sẵn seed (không cache)
  const [lists, setLists] = useState({
    pending: SEED_PENDING,
    approved: SEED_APPROVED,
    rejected: SEED_REJECTED,
  });

  // Modal chi tiết
  const [detailFor, setDetailFor] = useState(null);

  // Di chuyển item giữa các danh sách
  function moveItem(id, fromKey, toKey) {
    setLists((prev) => {
      const from = [...prev[fromKey]];
      const idx = from.findIndex((x) => String(x.id) === String(id));
      if (idx === -1) return prev;
      const item = from.splice(idx, 1)[0];
      const to = [item, ...prev[toKey]];
      return { ...prev, [fromKey]: from, [toKey]: to };
    });
  }

  const handleApprove = (id) => {
    moveItem(id, "pending", "approved");
    alert("Duyệt truyện thành công");
    if (detailFor?.id === id) setStatus("approved");
  };

  const handleReject = (id) => {
    moveItem(id, "pending", "rejected");
    alert("Đã từ chối truyện");
    if (detailFor?.id === id) setStatus("rejected");
  };

  const handleView = (id) => {
    const item =
      lists.pending.find((x) => x.id === id) ||
      lists.approved.find((x) => x.id === id) ||
      lists.rejected.find((x) => x.id === id);
    if (!item) return;
    setDetailFor(item);
  };

  const handleBackToPending = (id, from) => {
    moveItem(id, from, "pending");
    alert("Đã chuyển truyện về Chờ duyệt");
    if (detailFor?.id === id) setStatus("pending");
  };

  const closeDetail = () => setDetailFor(null);

  const currentData = useMemo(() => {
    switch (status) {
      case "approved":
        return lists.approved || [];
      case "rejected":
        return lists.rejected || [];
      default:
        return lists.pending || [];
    }
  }, [status, lists]);

  const pendingCount = (lists.pending || []).length;
  const approvedCount = (lists.approved || []).length;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AdminHeader
        pendingCount={pendingCount}
        approvedCount={approvedCount}
        reportCount={REPORT_COUNT_DEMO}
        keywordCount={KEYWORD_COUNT_DEMO}
      />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-4xl font-bold mb-2">Kiểm duyệt truyện</h2>
            <p className="text-lg text-gray-600 mb-6">
              Quản lý các truyện do tác giả gửi lên hệ thống.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { key: "pending", label: `Chờ duyệt (${pendingCount})` },
            { key: "approved", label: `Đã duyệt (${approvedCount})` },
            { key: "rejected", label: `Từ chối (${(lists.rejected || []).length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setStatus(t.key)}
              className={`px-6 py-3 rounded-xl text-lg font-medium transition-all duration-200
                ${
                  status === t.key
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "bg-purple-50 hover:bg-pink-50 text-gray-700 border border-purple-200"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-purple-200 shadow-sm">
          <table className="min-w-full text-lg">
            <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
              <tr className="text-gray-700">
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Tiêu đề</th>
                <th className="py-3 px-4 text-left">Tác giả</th>
                <th className="py-3 px-4 text-left">Thể loại</th>
                <th className="py-3 px-4 text-left">Ngày gửi</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {(currentData || []).map((n) => (
                <tr
                  key={n.id}
                  className="border-t border-purple-100 hover:bg-purple-50/40 transition"
                >
                  <td className="py-3 px-4 text-gray-700">#{n.id}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{n.title}</td>
                  <td className="py-3 px-4 text-gray-700">{n.author}</td>
                  <td className="py-3 px-4 text-gray-700">{n.genre}</td>
                  <td className="py-3 px-4 text-gray-600">{n.submittedAt}</td>
                  <td className="py-3 px-4 text-center">
                    {status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(n.id)}
                          className="px-4 py-2 mr-2 rounded-lg text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleReject(n.id)}
                          className="px-4 py-2 border border-purple-300 rounded-lg hover:bg-purple-50 text-gray-800"
                        >
                          Từ chối
                        </button>
                        <button
                          onClick={() => handleView(n.id)}
                          className="ml-2 px-4 py-2 rounded-lg bg-white border border-purple-300 hover:bg-purple-50"
                        >
                          Xem chi tiết
                        </button>
                      </>
                    )}

                    {status === "approved" && (
                      <>
                        <button
                          onClick={() => handleView(n.id)}
                          className="px-4 py-2 mr-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
                        >
                          Xem chi tiết
                        </button>
                        <button
                          onClick={() => handleBackToPending(n.id, "approved")}
                          className="px-4 py-2 rounded-lg border border-purple-300 hover:bg-purple-50 text-gray-800"
                        >
                          Chuyển về chờ duyệt
                        </button>
                      </>
                    )}

                    {status === "rejected" && (
                      <>
                        <button
                          onClick={() => handleView(n.id)}
                          className="px-4 py-2 mr-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
                        >
                          Xem chi tiết
                        </button>
                        <button
                          onClick={() => handleBackToPending(n.id, "rejected")}
                          className="px-4 py-2 rounded-lg border border-purple-300 hover:bg-purple-50 text-gray-800"
                        >
                          Chuyển về chờ duyệt
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}

              {(currentData || []).length === 0 && (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-gray-500 text-lg italic">
                    Không có truyện nào trong danh sách này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ===== Modal XEM CHI TIẾT ===== */}
      {detailFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30" onClick={closeDetail} />
          <div className="relative z-10 w-[min(980px,94vw)] max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-purple-200 p-6">
            <header className="mb-4">
              <h3 className="text-2xl font-bold text-gray-900">{detailFor.title}</h3>
              <p className="text-gray-600">
                Tác giả: <b>{detailFor.author}</b> • Thể loại: <i>{detailFor.genre}</i> • Gửi ngày: {detailFor.submittedAt}
              </p>
            </header>

            <div className="grid md:grid-cols-[220px,1fr] gap-5">
              <div>
                <img
                  src={DETAILS_BY_ID[detailFor.id]?.cover || "https://picsum.photos/seed/cover/400/600"}
                  alt={detailFor.title}
                  className="w-full rounded-xl border border-purple-200 object-cover"
                />
              </div>

              <div className="space-y-4 text-gray-800">
                <div>
                  <div className="text-sm text-gray-500">Tóm tắt</div>
                  <p className="mt-1 leading-relaxed">
                    {DETAILS_BY_ID[detailFor.id]?.synopsis || "Chưa có mô tả chi tiết."}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl bg-purple-50 border border-purple-200 p-3 text-center">
                    <div className="text-xs text-gray-500">Số chữ</div>
                    <div className="text-lg font-semibold">
                      {DETAILS_BY_ID[detailFor.id]?.wordCount?.toLocaleString?.() || "—"}
                    </div>
                  </div>
                  <div className="rounded-xl bg-purple-50 border border-purple-200 p-3 text-center">
                    <div className="text-xs text-gray-500">Số chương</div>
                    <div className="text-lg font-semibold">
                      {CHAPTERS_BY_ID[detailFor.id]?.length || DETAILS_BY_ID[detailFor.id]?.chapters || 0}
                    </div>
                  </div>
                  <div className="rounded-xl bg-purple-50 border border-purple-200 p-3 text-center">
                    <div className="text-xs text-gray-500">Trạng thái</div>
                    <div className="text-lg font-semibold capitalize">
                      {status === "pending" ? "Chờ duyệt" : status === "approved" ? "Đã duyệt" : "Từ chối"}
                    </div>
                  </div>
                  <div className="rounded-xl bg-purple-50 border border-purple-200 p-3 text-center">
                    <div className="text-xs text-gray-500">Ghi chú</div>
                    <div className="text-sm">{DETAILS_BY_ID[detailFor.id]?.note || "—"}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Từ khóa</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(DETAILS_BY_ID[detailFor.id]?.tags || []).map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm"
                      >
                        {t}
                      </span>
                    ))}
                    {(!DETAILS_BY_ID[detailFor.id]?.tags ||
                      DETAILS_BY_ID[detailFor.id]?.tags.length === 0) && (
                      <span className="text-sm text-gray-500">—</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Danh sách chương + nội dung */}
            <section className="mt-6">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Danh sách chương</h4>
              <div className="rounded-2xl border border-purple-200">
                {(CHAPTERS_BY_ID[detailFor.id] || []).map((ch) => (
                  <div key={ch.no} className="p-4 border-b last:border-b-0 border-purple-100">
                    <div className="font-semibold text-gray-900">
                      Chương {ch.no}: {ch.title}
                    </div>
                    <p className="mt-1 text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {ch.content}
                    </p>
                  </div>
                ))}
                {(CHAPTERS_BY_ID[detailFor.id] || []).length === 0 && (
                  <div className="p-4 text-gray-500 italic">Chưa có nội dung chương.</div>
                )}
              </div>
            </section>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                onClick={closeDetail}
                className="rounded-xl px-5 py-2 border border-purple-300 hover:bg-purple-50"
              >
                Đóng
              </button>

              {status === "pending" && (
                <>
                  <button
                    onClick={() => handleApprove(detailFor.id)}
                    className="rounded-xl px-5 py-2 text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                  >
                    Duyệt
                  </button>
                  <button
                    onClick={() => handleReject(detailFor.id)}
                    className="rounded-xl px-5 py-2 border border-purple-300 hover:bg-purple-50"
                  >
                    Từ chối
                  </button>
                </>
              )}

              {status === "approved" && (
                <button
                  onClick={() => handleBackToPending(detailFor.id, "approved")}
                  className="rounded-xl px-5 py-2 border border-purple-300 hover:bg-purple-50"
                >
                  Chuyển về chờ duyệt
                </button>
              )}

              {status === "rejected" && (
                <button
                  onClick={() => handleBackToPending(detailFor.id, "rejected")}
                  className="rounded-xl px-5 py-2 border border-purple-300 hover:bg-purple-50"
                >
                  Chuyển về chờ duyệt
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
