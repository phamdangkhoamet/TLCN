export default function Logo({ className = "" }) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">ST</div>
        <div className="leading-tight">
          <div className="font-semibold">Sáng Tác</div>
          <div className="text-xs text-slate-500 -mt-1">& Đọc Truyện</div>
        </div>
      </div>
    );
  }
  