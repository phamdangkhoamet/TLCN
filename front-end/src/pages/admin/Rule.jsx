import React from "react";
import { Link } from "react-router-dom";
import AdminHeader from "../../components/admin/AdminHeader";
import { adminStats, commentKeywords } from "../../data/mockData";
import { NavLink } from "react-router-dom";


export default function Rule() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AdminHeader
        pendingCount={adminStats.pending}
        approvedCount={5}
        reportCount={adminStats.reports}
        keywordCount={commentKeywords.length}
      />

      <main className="max-w-5xl mx-auto px-6 py-10 leading-relaxed">
        {/* Tiêu đề */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold mb-3 text-gray-900">
            Quy tắc hoạt động & Nội dung bị cấm
          </h1>
          <p className="text-lg text-gray-600">
            Áp dụng cho tất cả người dùng: Tác giả, Độc giả và Quản trị viên của hệ thống.
          </p>
        </header>

        {/* --- PHẦN 1: QUY TẮC CHUNG --- */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-2 text-purple-700">I. Quy tắc chung</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-800">
            <li>Mọi người dùng cần tôn trọng pháp luật Việt Nam và quy định của nền tảng.</li>
            <li>
              Không được lợi dụng trang web để truyền bá thông tin sai lệch, xuyên tạc lịch sử,
              chống phá Nhà nước hoặc xúc phạm tổ chức, cá nhân.
            </li>
            <li>
              Tất cả nội dung đăng tải (truyện, bình luận, hình ảnh, tiêu đề, mô tả...) đều phải
              phù hợp với thuần phong mỹ tục Việt Nam.
            </li>
            <li>
              Hệ thống có quyền tạm khóa tài khoản hoặc xóa nội dung vi phạm mà không cần thông báo
              trước.
            </li>
          </ul>
        </section>

        {/* --- PHẦN 2: QUY TẮC DÀNH CHO TÁC GIẢ --- */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-2 text-purple-700">II. Quy tắc dành cho Tác giả</h2>
          <ul className="list-decimal list-inside space-y-2 text-gray-800">
            <li>
              Chỉ đăng tải các tác phẩm do chính mình sáng tác, biên soạn hoặc đã được cấp phép tái
              bản. Nghiêm cấm sao chép, đạo văn, dịch lại mà không có quyền.
            </li>
            <li>
              Tiêu đề, mô tả và nội dung truyện không được chứa yếu tố khiêu dâm, bạo lực, chính
              trị, phân biệt giới tính, tôn giáo hoặc vùng miền.
            </li>
            <li>
              Không cài cắm quảng cáo trái phép, đường dẫn độc hại hoặc liên kết đến các trang có
              nội dung không phù hợp.
            </li>
            <li>
              Tôn trọng độc giả và bình luận – không sử dụng ngôn từ xúc phạm, mỉa mai hoặc gây thù
              hận.
            </li>
            <li>
              Nếu phát hiện nội dung bị sao chép hoặc vi phạm bản quyền, vui lòng gửi báo cáo qua
              trang “Báo cáo vi phạm”.
            </li>
          </ul>
        </section>

        {/* --- PHẦN 3: QUY TẮC DÀNH CHO ĐỘC GIẢ --- */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-2 text-purple-700">III. Quy tắc dành cho Độc giả</h2>
          <ul className="list-decimal list-inside space-y-2 text-gray-800">
            <li>
              Không đăng tải bình luận có nội dung thô tục, xúc phạm danh dự, nhân phẩm người khác.
            </li>
            <li>
              Không spam bình luận, đăng liên tiếp nội dung không liên quan hoặc sử dụng ký tự vô
              nghĩa.
            </li>
            <li>
              Không tiết lộ thông tin cá nhân của bản thân hoặc người khác trong khu vực công cộng.
            </li>
            <li>
              Nếu phát hiện bình luận vi phạm, hãy dùng nút “Báo cáo” để hệ thống xử lý tự động.
            </li>
          </ul>
        </section>

        {/* --- PHẦN 4: QUY TẮC DÀNH CHO ADMIN / NGƯỜI KIỂM DUYỆT --- */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-2 text-purple-700">
            IV. Quy tắc dành cho Quản trị viên / Kiểm duyệt viên
          </h2>
          <ul className="list-decimal list-inside space-y-2 text-gray-800">
            <li>Giữ thái độ công bằng, khách quan khi xử lý báo cáo hoặc kiểm duyệt truyện.</li>
            <li>
              Không tiết lộ thông tin người báo cáo, người vi phạm hoặc nội dung nội bộ cho bên thứ
              ba.
            </li>
            <li>
              Thực hiện kiểm duyệt theo quy trình ba cấp độ: <b>Xóa nội dung</b>,{" "}
              <b>Cấm tạm thời</b>, và <b>Khóa tài khoản</b> – tùy theo mức độ vi phạm.
            </li>
            <li>
              Báo cáo định kỳ cho Ban Quản lý hệ thống về các trường hợp vi phạm nghiêm trọng hoặc
              có dấu hiệu pháp lý.
            </li>
          </ul>
        </section>

        {/* --- PHẦN 5: TỪ NGỮ & NỘI DUNG BỊ CẤM --- */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-2 text-purple-700">
            V. Từ ngữ & nội dung bị cấm chi tiết
          </h2>
          <p className="text-gray-700 mb-3">
            Hệ thống sẽ tự động kiểm tra và chặn các nội dung chứa những nhóm từ sau:
          </p>

          <div className="grid sm:grid-cols-2 gap-6 text-gray-800">
            <div>
              <h3 className="font-semibold text-pink-700 mb-1">1. Từ ngữ khiêu dâm / nhạy cảm</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>Những từ ngữ mô tả bộ phận cơ thể, hành vi tình dục, ám chỉ dung tục.</li>
                <li>Ngôn từ gợi dục, khêu gợi hoặc liên quan đến nội dung người lớn (18+).</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-pink-700 mb-1">2. Từ ngữ bạo lực / kích động thù hận</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>Kêu gọi, cổ vũ hành vi bạo lực, tự hại hoặc giết người.</li>
                <li>Ngôn từ miệt thị sắc tộc, tôn giáo, giới tính, vùng miền.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-pink-700 mb-1">3. Nội dung chính trị / vi phạm pháp luật</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>Tuyên truyền, xuyên tạc chủ trương, đường lối của Đảng và Nhà nước.</li>
                <li>Phát tán tin giả, tài liệu cấm, hoặc nội dung chống phá Việt Nam.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-pink-700 mb-1">4. Nội dung phản cảm hoặc độc hại</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>Ảnh, video, liên kết có yếu tố máu me, xác chết, kinh dị quá mức.</li>
                <li>Spam link, quảng cáo sản phẩm/website không được cấp phép.</li>
              </ul>
            </div>
          </div>

          <p className="mt-4 text-gray-600 italic">
            * Nếu người dùng cố tình lách luật (viết sai chính tả, dùng ký tự thay thế...), hệ thống vẫn có thể nhận diện và xử lý.
          </p>
        </section>

        {/* --- PHẦN KẾT --- */}
        <section className="mt-10 border-t border-purple-100 pt-6 text-center text-gray-700">
          <p>
            Việc tham gia, đăng truyện hoặc bình luận trên hệ thống đồng nghĩa với việc bạn đã đọc
            và đồng ý tuân thủ các quy tắc trên.
          </p>
          <p className="mt-2 font-medium text-purple-700">
            Hãy cùng xây dựng một cộng đồng sáng tạo – văn minh – tôn trọng!
          </p>
          <div className="mt-6">
            <Link
              to="/admin"
              className="inline-block rounded-xl px-6 py-3 text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
            >
              ← Quay lại Trang quản trị
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
