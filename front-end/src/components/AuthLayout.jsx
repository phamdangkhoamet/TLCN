import Logo from "./Logo";

export default function AuthLayout({ title, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-purple-100">
      <div className="card p-8 w-full max-w-md">
        <Logo className="mb-6" />
        <h1 className="auth-title mb-6">{title}</h1>
        {children}
        {footer && <div className="mt-4 text-center text-sm">{footer}</div>}
        <p className="muted mt-6 text-center">© {new Date().getFullYear()} Sáng Tác & Đọc Truyện</p>
      </div>
    </div>
  );
}
