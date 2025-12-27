// src/pages/UpgradeVipSandbox.jsx
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ⬅️ THÊM useNavigate
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from "../lib/api";

// 💳 QR thanh toán
const QR_5K = "/5k.jpg";
const QR_99K = "/99k.jpg";

export default function UpgradeVipSandbox() {
  const navigate = useNavigate(); // ⬅️ DÙNG ĐỂ QUAY LẠI TRANG TRƯỚC

  const [plan, setPlan] = useState(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // trạng thái chờ ngân hàng + popup
  const [waitingBank, setWaitingBank] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPhase, setPopupPhase] = useState("checking"); // "checking" | "success" | "error"
  const [popupErr, setPopupErr] = useState("");

  const sessionUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("sessionUser") || "null");
    } catch {
      return null;
    }
  }, []);

  const qrSrc = plan === "vip1m" ? QR_99K : plan === "vip1d" ? QR_5K : "";
  const planMeta =
    plan === "vip1d"
      ? { title: "VIP 1 ngày", price: "5,000đ" }
      : plan === "vip1m"
      ? { title: "VIP 1 tháng", price: "99,000đ" }
      : null;

  // 🧾 Xử lý “Tôi đã chuyển tiền”
  async function onConfirmPaid() {
    setErr("");
    setMsg("");
    setPopupErr("");

    if (!sessionUser) {
      setErr("Bạn cần đăng nhập trước khi nâng cấp VIP.");
      return;
    }
    if (!plan) {
      setErr("Vui lòng chọn gói trước khi xác nhận.");
      return;
    }

    // Bật trạng thái chờ và mở popup
    setWaitingBank(true);
    setShowPopup(true);
    setPopupPhase("checking");
    setPopupErr("");

    // ⏳ Mô phỏng ngân hàng kiểm tra giao dịch 5 giây
    setTimeout(async () => {
      try {
        const res = await api.vip.buy(plan);

        const updated = {
          ...(sessionUser || {}),
          isVip: true,
          vipUntil: res?.user?.vipUntil || sessionUser?.vipUntil,
        };
        localStorage.setItem("sessionUser", JSON.stringify(updated));

        setMsg(
          "🎉 Thanh toán thành công! Tài khoản của bạn đã được nâng cấp VIP."
        );
        setPopupPhase("success");
      } catch (e) {
        const m = e.message || "Có lỗi khi nâng cấp VIP.";
        setErr(m);
        setPopupErr(m);
        setPopupPhase("error");
      } finally {
        setWaitingBank(false);
      }
    }, 5000);
  }

  // ⬅️ SỬA: Sau khi thành công, đóng popup + quay lại trang trước đó
  const handleClosePopup = () => {
    setShowPopup(false);
    setPopupErr("");

    if (popupPhase === "success") {
      // Đóng luôn trang thanh toán, quay lại trang trước
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 flex flex-col items-center px-4 py-10">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-6">
          Nâng cấp VIP
        </h1>

        {err && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
            {err}
          </div>
        )}
        {msg && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 text-green-700 px-4 py-3">
            {msg}
          </div>
        )}

        {/* KHỐI CHỌN GÓI */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <PlanCard
            active={plan === "vip1d"}
            title="VIP 1 ngày"
            price="5,000đ"
            desc="Đọc mọi chương trong 24 giờ."
            onClick={() => setPlan("vip1d")}
          />
          <PlanCard
            active={plan === "vip1m"}
            title="VIP 1 tháng"
            price="99,000đ"
            desc="Đọc mọi chương trong 30 ngày."
            onClick={() => setPlan("vip1m")}
          />
        </div>

        {/* QR + NÚT THANH TOÁN */}
        {plan && (
          <div className="flex flex-col items-center mt-10">
            <div className="text-center">
              <h3 className="text-xl font-semibold">Quét QR để thanh toán</h3>
              <p className="text-sm font-semibold text-gray-600 mt-1">
                Gói: {planMeta.title} —{" "}
                <span className="font-medium text-purple-600">
                  {planMeta.price}
                </span>
              </p>
            </div>

            <div className="mt-6 p-4 bg-white rounded-2xl shadow-lg border border-purple-100">
              <img
                src={qrSrc}
                alt="QR Thanh toán"
                className="w-64 h-64 sm:w-80 sm:h-80 object-contain"
              />
            </div>

            {/* Nút Xác Nhận Thanh Toán */}
            <button
              onClick={onConfirmPaid}
              disabled={waitingBank}
              className={`mt-8 px-8 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-500 to-pink-500 ${
                waitingBank
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:opacity-90 shadow-lg"
              }`}
            >
              {waitingBank
                ? "Đang chờ ngân hàng kiểm tra..."
                : "Đã thanh toán"}
            </button>

            <Link
              to="/home"
              className="mt-3 text-sm text-gray-500 hover:underline"
            >
              ← Về trang chủ
            </Link>
          </div>
        )}
      </main>

      <Footer />

      {/* 🔔 POPUP KIỂM TRA GIAO DỊCH */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center relative">
            {/* nút X góc phải */}
            <button
              onClick={handleClosePopup}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            {popupPhase === "checking" && (
              <>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-50">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-400 border-t-transparent" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Đang kiểm tra giao dịch
                </h2>
                <p className="text-sm text-gray-600">
                  Ngân hàng đang xác nhận thanh toán của bạn...
                  <br />
                  Vui lòng đợi trong giây lát.
                </p>
              </>
            )}

            {popupPhase === "success" && (
              <>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-2xl">
                  ✅
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Thanh toán thành công!
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Tài khoản của bạn đã được nâng cấp{" "}
                  <span className="font-semibold text-purple-600">VIP</span>.
                  <br />
                </p>
                <button
                  onClick={handleClosePopup}
                  className="mt-1 w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold hover:opacity-90"
                >
                  Đóng
                </button>
              </>
            )}

            {popupPhase === "error" && (
              <>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
                  ⚠️
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Có lỗi xảy ra
                </h2>
                <p className="text-sm text-red-600 mb-4">
                  {popupErr || "Thanh toán thất bại. Vui lòng thử lại."}
                </p>
                <button
                  onClick={handleClosePopup}
                  className="mt-1 w-full px-4 py-2.5 rounded-xl bg-gray-200 text-gray-800 text-sm font-semibold hover:bg-gray-300"
                >
                  Đóng
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* Component Card chọn gói */
function PlanCard({ active, title, price, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-64 sm:w-72 text-left rounded-2xl border p-5 transition shadow-sm hover:shadow-md ${
        active ? "border-purple-400 bg-purple-50" : "border-gray-200 bg-white"
      }`}
    >
      <div className="text-sm text-gray-600">Gói</div>
      <div className="text-xl font-bold text-gray-900 mt-1">{title}</div>
      <div className="mt-2 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        {price}
      </div>
      <div className="mt-2 text-sm text-gray-600">{desc}</div>
      {active && (
        <div className="mt-3 text-xs inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700">
          ✓ Đã chọn
        </div>
      )}
    </button>
  );
}
