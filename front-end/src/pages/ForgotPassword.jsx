import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { API_BASE } from "../lib/api";

const SKEY_EMAIL = "fp_email";
const SKEY_TOKEN = "fp_token";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);       // 1: email, 2: OTP, 3: đặt lại
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const base = API_BASE || window.location.origin;

  // --- hydrate từ sessionStorage nếu đã verify OTP trước đó
  useEffect(() => {
    const savedEmail = sessionStorage.getItem(SKEY_EMAIL) || "";
    const savedToken = sessionStorage.getItem(SKEY_TOKEN) || "";
    if (savedEmail) setEmail(savedEmail);
    if (savedToken) {
      setResetToken(savedToken);
      setStep(3); // cho phép tiếp tục đặt mật khẩu sau reload
      setMsg("Đã xác thực OTP. Vui lòng đặt lại mật khẩu.");
    }
  }, []);

  function clearSession() {
    sessionStorage.removeItem(SKEY_EMAIL);
    sessionStorage.removeItem(SKEY_TOKEN);
  }

  async function handleSendOTP(e) {
    e.preventDefault();
    setErr(""); setMsg("");
    if (!email.trim()) {
      setErr("Vui lòng nhập email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(new URL("/api/users/forgot", base), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Gửi OTP thất bại");
      setMsg(data.message || "OTP đã được gửi (kiểm tra email).");
      setStep(2);
      // lưu email để dùng lại ở bước sau
      sessionStorage.setItem(SKEY_EMAIL, email.trim().toLowerCase());
    } catch (e) {
      setErr(e.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e) {
    e.preventDefault();
    setErr(""); setMsg("");
    if (!otp.trim()) {
      setErr("Vui lòng nhập mã OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(new URL("/api/users/forgot/verify", base), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok || !data?.resetToken) {
        throw new Error(data?.message || "Xác thực OTP thất bại");
      }
      setResetToken(data.resetToken);
      sessionStorage.setItem(SKEY_TOKEN, data.resetToken);
      setMsg("OTP hợp lệ, vui lòng đặt lại mật khẩu.");
      setStep(3);
    } catch (e) {
      setErr(e.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setErr(""); setMsg("");
    const token = resetToken || sessionStorage.getItem(SKEY_TOKEN) || "";
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setErr("Vui lòng nhập đầy đủ mật khẩu");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErr("Mật khẩu không khớp");
      return;
    }
    if (!token) {
      setErr("Thiếu token đặt lại mật khẩu. Vui lòng làm lại từ đầu.");
      setStep(1);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(new URL("/api/users/forgot/reset", base), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Đặt lại mật khẩu thất bại");

      setMsg("Đặt lại mật khẩu thành công! Bạn có thể đăng nhập.");
      // reset state & storage
      setStep(1);
      setEmail(""); setOtp(""); setNewPassword(""); setConfirmPassword("");
      setResetToken("");
      clearSession();
    } catch (e) {
      setErr(e.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  const backToEmail = () => {
    // quay lại sửa email → clear token
    clearSession();
    setResetToken("");
    setStep(1);
    setMsg("");
    setErr("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-10">
      <div className="w-full max-w-md bg-white/95 rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Khôi phục mật khẩu
        </h1>
        <p className="text-center text-sm text-gray-500 mb-4">
          Làm theo 3 bước đơn giản để đặt lại mật khẩu của bạn.
        </p>

        {err && (
          <div className="mb-4 rounded-xl border border-pink-200 bg-pink-50 text-pink-700 px-4 py-3 text-sm">
            {err}
          </div>
        )}
        {msg && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 text-green-700 px-4 py-3 text-sm">
            {msg}
          </div>
        )}

        {step === 1 && (
          <form className="space-y-4" onSubmit={handleSendOTP}>
            <div className="text-sm text-gray-600">
              Nhập email đã đăng ký. Chúng tôi sẽ gửi mã OTP để xác thực.
            </div>
            <InputField
              label="Email"
              type="email"
              placeholder="email@vidu.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang gửi..." : "Gửi mã OTP"}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form className="space-y-4" onSubmit={handleVerifyOTP}>
            <div className="text-sm text-gray-600">
              Nhập mã OTP được gửi tới email: <b>{email}</b>
            </div>
            <InputField
              label="Mã OTP"
              type="text"
              placeholder="Nhập mã 6 chữ số"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <div className="flex justify-between text-sm">
              <button
                type="button"
                className="text-purple-600 hover:underline"
                onClick={handleSendOTP}
                disabled={loading}
              >
                Gửi lại OTP
              </button>
              <button
                type="button"
                className="text-gray-500 hover:underline"
                onClick={backToEmail}
              >
                Sửa email
              </button>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang xác thực..." : "Xác nhận OTP"}
            </Button>
          </form>
        )}

        {step === 3 && (
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <div className="text-sm text-gray-600">
              Đặt mật khẩu mới cho tài khoản: <b>{email}</b>
            </div>
            <InputField
              label="Mật khẩu mới"
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <InputField
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang lưu..." : "Đặt lại mật khẩu"}
            </Button>
            <div className="text-center">
              <button type="button" className="text-sm text-gray-500 hover:underline mt-2" onClick={backToEmail}>
                ← Quay lại nhập email / OTP
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-6">
          <Link to="/login" className="text-sm font-semibold text-purple-600 hover:underline">
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
