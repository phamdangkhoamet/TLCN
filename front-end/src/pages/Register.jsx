// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import SocialButton from "../components/SocialButton";
import { api } from "../lib/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!name.trim() || !email.trim() || !pw.trim() || !confirmPw.trim()) {
      setErr("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (pw.length < 6) {
      setErr("Mật khẩu phải từ 6 ký tự trở lên.");
      return;
    }
    if (pw !== confirmPw) {
      setErr("Mật khẩu không trùng khớp.");
      return;
    }

    try {
      setLoading(true);
      // FE đang gọi /api/auth/register (mình đã thêm trong api.js)
      await api.auth.register({ name, email, password: pw });
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login", { replace: true });
    } catch (e) {
      setErr(e?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-r from-blue-500 to-pink-500">
      <div className="bg-white rounded-2xl shadow-lg w-3/4 max-w-xl p-10 flex flex-col items-center">

        <h1 className="text-pink-500 font-bold text-4xl text-center">DKStory</h1>
        <p className="mt-2 text-gray-600 text-center">Nơi câu chuyện bắt đầu</p>
        <h2 className="text-3xl font-bold mt-2">ĐĂNG KÝ</h2>

        <form className="mt-6 w-full space-y-4" onSubmit={handleSubmit}>
          {err && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">
              {err}
            </div>
          )}

          <InputField
            label="Tên tài khoản"
            placeholder="Bút danh"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          <InputField
            label="Email"
            type="email"
            placeholder="email@vd.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <InputField
            label="Mật khẩu"
            type="password"
            placeholder="Ít nhất 6 ký tự"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete="new-password"
          />
          <InputField
            label="Xác nhận mật khẩu"
            type="password"
            placeholder="Nhập lại mật khẩu"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 bg-pink-400 text-white py-2 rounded-full transition ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:bg-pink-500"
            }`}
          >
            {loading ? "ĐANG TẠO TÀI KHOẢN…" : "ĐĂNG KÝ →"}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-500 text-center">
          Đã có tài khoản?
          <Link to="/login" className="text-pink-500 ml-1 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
