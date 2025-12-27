export default function Button({ children, type = "button", variant = "primary", className = "" }) {
    const base = "w-full py-3 rounded-xl font-semibold transition focus:outline-none focus:ring-2";
    const styles = {
      primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-400",
      secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-300",
      ghost: "bg-transparent text-slate-700 hover:bg-slate-50 focus:ring-slate-300",
    };
    return (
      <button type={type} className={`${base} ${styles[variant]} ${className}`}>
        {children}
      </button>
    );
  }
  