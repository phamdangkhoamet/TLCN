// src/pages/admin/ProcessGuide.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../components/admin/AdminHeader";
import { adminStats, commentKeywords } from "../../data/mockData";

export default function ProcessGuide() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AdminHeader
        pendingCount={adminStats.pending}
        approvedCount={5}
        reportCount={adminStats.reports}
        keywordCount={commentKeywords.length}
      />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Quy trình xử lý báo cáo vi phạm
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-700">
            Tài liệu này quy định các bước tiếp nhận, thẩm định, phân loại và xử lý
            báo cáo vi phạm trong hệ thống. Mọi quyết định cần dựa trên bằng chứng
            cụ thể, đảm bảo tính công bằng và minh bạch.
          </p>
        </header>

        {/* 1. Thẩm định ban đầu */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            I. Thẩm định ban đầu
          </h2>
          <p className="text-gray-700 mb-3">
            Khi tiếp nhận báo cáo, người kiểm duyệt cần thực hiện các bước sau:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-gray-800">
            <li>Đọc toàn bộ nội dung báo cáo và kiểm tra tệp/bằng chứng đính kèm (nếu có).</li>
            <li>Xác định đối tượng bị báo cáo (truyện, chương, bình luận hoặc tài khoản).</li>
            <li>Đối chiếu với log hệ thống (nếu cần) để xác minh tính xác thực và mức độ lặp lại.</li>
          </ol>

          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-gray-800">
            <div className="font-semibold">Ví dụ minh họa</div>
            <p className="mt-1">
              Người dùng báo cáo một bình luận chứa ngôn từ không phù hợp. Kiểm duyệt viên cần
              trích xuất nội dung bình luận từ hệ thống, so sánh với bằng chứng người báo cáo
              cung cấp để xác nhận.
            </p>
          </div>
        </section>

        {/* 2. Phân loại mức độ vi phạm */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            II. Phân loại mức độ vi phạm
          </h2>
          <p className="text-gray-700 mb-4">
            Sau khi xác minh, báo cáo được phân loại theo ba mức độ để áp dụng biện pháp tương ứng.
          </p>

          <div className="space-y-5">
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
              <h3 className="text-xl font-semibold text-gray-900">1. Mức độ nhẹ</h3>
              <p className="text-gray-800 mt-1">
                Vi phạm nhỏ, ít ảnh hưởng; thường do thiếu sót hoặc vô ý.
              </p>
              <ul className="list-disc list-inside text-gray-800 mt-2 space-y-1">
                <li>Nhắc nhở và yêu cầu chỉnh sửa để đáp ứng quy tắc.</li>
                <li>Không cần gỡ nội dung khi đã khắc phục đạt yêu cầu.</li>
              </ul>
              <div className="mt-3 rounded-xl bg-white border border-yellow-200 p-3 text-gray-800">
                <div className="font-medium">Ví dụ</div>
                <p className="mt-1">
                  Truyện đăng thiếu cảnh báo độ tuổi. Tác giả được yêu cầu bổ sung thông tin
                  cảnh báo phù hợp.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
              <h3 className="text-xl font-semibold text-gray-900">2. Mức độ trung bình</h3>
              <p className="text-gray-800 mt-1">
                Vi phạm rõ ràng quy tắc cộng đồng, nhưng chưa đến mức nghiêm trọng.
              </p>
              <ul className="list-disc list-inside text-gray-800 mt-2 space-y-1">
                <li>Xóa hoặc ẩn nội dung vi phạm.</li>
                <li>Gửi cảnh cáo tới người đăng; yêu cầu cam kết không tái phạm.</li>
              </ul>
              <div className="mt-3 rounded-xl bg-white border border-orange-200 p-3 text-gray-800">
                <div className="font-medium">Ví dụ</div>
                <p className="mt-1">
                  Bình luận có ngôn từ công kích cá nhân. Nội dung bị xóa và tài khoản bị cảnh cáo.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <h3 className="text-xl font-semibold text-gray-900">3. Mức độ nghiêm trọng</h3>
              <p className="text-gray-800 mt-1">
                Nội dung thù ghét, kích động bạo lực, vi phạm pháp luật, hoặc tái phạm nhiều lần.
              </p>
              <ul className="list-disc list-inside text-gray-800 mt-2 space-y-1">
                <li>Khóa tài khoản hoặc cấm tương tác có thời hạn.</li>
                <li>Báo cáo cấp quản trị cao hơn nếu có yếu tố đặc biệt nghiêm trọng.</li>
              </ul>
              <div className="mt-3 rounded-xl bg-white border border-red-200 p-3 text-gray-800">
                <div className="font-medium">Ví dụ</div>
                <p className="mt-1">
                  Truyện đăng nội dung sao chép trái phép nhiều lần. Tài khoản bị khóa và nội dung bị gỡ bỏ.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Biện pháp xử lý */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            III. Biện pháp xử lý
          </h2>
          <p className="text-gray-700 mb-3">
            Biện pháp xử lý được áp dụng tương ứng với mức độ vi phạm đã phân loại.
          </p>
          <ol className="list-decimal list-inside text-gray-800 space-y-3">
            <li>
              <span className="font-semibold">Gỡ bỏ nội dung vi phạm:</span> bao gồm chương, bình luận,
              hình ảnh hoặc toàn bộ truyện tùy mức độ.
              <div className="text-sm text-gray-600 mt-1">
                Ví dụ: “Chương 03” chứa nội dung không phù hợp — ẩn hoặc xóa chương.
              </div>
            </li>
            <li>
              <span className="font-semibold">Cấm tương tác có thời hạn:</span> ngăn tạo nội dung,
              bình luận, hoặc tương tác khác trong thời gian xác định (ví dụ: 7 ngày).
              <div className="text-sm text-gray-600 mt-1">
                Ví dụ: Tài khoản liên tục spam bình luận — cấm tương tác 7 ngày.
              </div>
            </li>
            <li>
              <span className="font-semibold">Khóa tài khoản:</span> áp dụng cho trường hợp nghiêm trọng
              hoặc tái phạm nhiều lần.
              <div className="text-sm text-gray-600 mt-1">
                Ví dụ: Tác giả lặp lại hành vi sao chép trái phép — khóa tài khoản.
              </div>
            </li>
          </ol>
        </section>

        {/* 4. Ghi nhận & thông báo */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            IV. Ghi nhận và thông báo
          </h2>
          <p className="text-gray-700 mb-3">
            Sau khi xử lý, tiến hành ghi nhận kết quả và thông báo cần thiết.
          </p>
          <ul className="list-disc list-inside text-gray-800 space-y-1">
            <li>Đánh dấu báo cáo là “đã xử lý” trên hệ thống.</li>
            <li>Ghi chú tóm tắt biện pháp đã áp dụng và căn cứ kèm theo.</li>
            <li>Thông báo cho người báo cáo và đối tượng bị xử lý (nếu cần).</li>
            <li>Lưu log để phục vụ kiểm tra định kỳ và thống kê.</li>
          </ul>

          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-gray-800">
            <div className="font-semibold">Ví dụ ghi nhận</div>
            <p className="mt-1">
              Báo cáo số R-8897: “Tác giả N.K. đăng nội dung sao chép”. Kết quả: gỡ nội dung vi phạm,
              khóa tài khoản 7 ngày, ghi chú lý do và thời điểm áp dụng biện pháp.
            </p>
          </div>
        </section>

        {/* Nút quay lại */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl px-6 py-3 text-base border border-gray-300 hover:bg-gray-50"
          >
            Quay lại
          </button>
        </div>

        <footer className="mt-10 text-center text-gray-500 text-sm">
          Tài liệu này dùng nội bộ nhằm đảm bảo chuẩn xử lý thống nhất và an toàn nội dung.
        </footer>
      </main>
    </div>
  );
}
