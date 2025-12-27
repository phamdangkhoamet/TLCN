// src/pages/WheelSpin.jsx
import React, { useState } from "react";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function WheelSpin() {
  const navigate = useNavigate();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);

  // ⭐ THÊM: đánh dấu đã quay (dù trúng hay không)
  const [hasSpun, setHasSpun] = useState(false);

  const sectors = [
    { label: "Mã VIP 1 ngày", type: "vip1d" },
    { label: "Không trúng thưởng", type: "lose" },
    { label: "Mã VIP 1 tuần", type: "vip1w" },
    { label: "Không trúng thưởng", type: "lose" },
    { label: "Mã VIP 1 tháng", type: "vip1m" },
    { label: "Không trúng thưởng", type: "lose" },
    { label: "Không trúng thưởng", type: "lose" },
    { label: "Không trúng thưởng", type: "lose" },
  ];

  const colors = ["#ffe3f6", "#ffd0f0"];
  const wheelSize = 380;
  const sectorAngle = 360 / sectors.length;

  const getPrizeType = (res) => {
    if (res?.vipCode) {
      if (res.days >= 30) return "vip1m";
      if (res.days >= 7) return "vip1w";
      if (res.days >= 1) return "vip1d";
    }
    return "lose";
  };

  const handleSpin = async () => {
    // ❗ Không cho quay nếu đang xoay hoặc đã quay xong 1 lần
    if (spinning || hasSpun) return;

    setSpinning(true);
    setResult(null);

    let res;
    try {
      // Gọi API trước để biết trúng gì
      res = await api.vip.spin();
    } catch (e) {
      alert("Có lỗi khi quay thưởng. Vui lòng thử lại.");
      setSpinning(false);
      return;
    }

    const prizeType = getPrizeType(res);

    // Tìm index các ô cùng loại
    const candidates = sectors
      .map((s, i) => (s.type === prizeType ? i : -1))
      .filter((i) => i >= 0);
    const targetIndex =
      candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : 0;

    const pointerAngle = -90; // vị trí mũi tên (trên, hướng xuống)
    const centerAngle = -90 + sectorAngle * (targetIndex + 0.5);

    let delta = pointerAngle - centerAngle;
    delta = ((delta % 360) + 360) % 360;

    const extra = 360 * 5 + delta;
    setRotation((prev) => prev + extra);

    setTimeout(() => {
      setResult(res);
      setSpinning(false);
      setHasSpun(true); // ⭐ sau khi quay xong -> đánh dấu đã dùng lượt quay
    }, 4500);
  };

  const isWin = !!result?.vipCode;

  const bgSlices = sectors
    .map((_, i) => {
      const start = sectorAngle * i;
      const end = sectorAngle * (i + 1);
      const color = colors[i % 2];
      return `${color} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 px-4 py-10">
      <h1 className="text-3xl mb-16 sm:text-4xl font-extrabold mb-6 text-purple-700 drop-shadow">
        VÒNG XOAY MAY MẮN
      </h1>

      <div className="relative mb-8">
        {/* Mũi tên + text cố định */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
          <div className="w-7 h-7 rounded-full bg-yellow-300 border border-yellow-500 shadow-md flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
          </div>
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-[18px] border-l-transparent border-r-transparent border-b-yellow-500 drop-shadow" />
    
        </div>

        {/* Vòng ngoài mạ vàng */}
        <div
          className="rounded-full flex items-center justify-center shadow-2xl"
          style={{
            width: wheelSize + 30,
            height: wheelSize + 30,
            background:
              "radial-gradient(circle at 30% 30%, #fff7da, #f6ad55, #b7791f)",
          }}
        >
          <div
            className="relative rounded-full bg-white overflow-hidden"
            style={{
              width: wheelSize,
              height: wheelSize,
              backgroundImage: `conic-gradient(from -90deg, ${bgSlices})`,
              transition: "transform 4.5s cubic-bezier(0.33, 1, 0.68, 1)",
              transform: `rotate(${rotation}deg)`,
            }}
          >
            {/* Text trên từng ô */}
            {sectors.map((s, index) => {
              const angle = sectorAngle * index + sectorAngle / 2;
              const radius = wheelSize * 0.34;
              return (
                <div
                  key={index}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translate(0, -${radius}px) rotate(-${angle}deg)`,
                    transformOrigin: "50% 50%",
                    width: wheelSize * 0.42,
                    textAlign: "center",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#8b1f6a",
                    textShadow: "0 1px 2px rgba(255,255,255,0.9)",
                    pointerEvents: "none",
                  }}
                >
                  {s.label}
                </div>
              );
            })}

      
          </div>
        </div>
      </div>

      {/* ❌ Ẩn nút QUAY nếu đã quay xong 1 lần */}
      {!hasSpun && (
        <button
          onClick={handleSpin}
          disabled={spinning}
          className="px-10 py-3 rounded-2xl text-lg font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg hover:shadow-xl hover:brightness-105 disabled:opacity-60"
        >
          {spinning ? "Đang quay..." : "Quay Ngay"}
        </button>
      )}

      {result && (
        <div className="mt-6 p-5 bg-white rounded-2xl shadow-xl text-center w-full max-w-md">
          <h2 className="text-xl font-bold text-purple-600 mb-1">
            {isWin ? "Chúc mừng bạn đã trúng thưởng!" : "Kết quả quay"}
          </h2>
          <p className="text-xl font-bold text-purple-600 mb-1">{result.prizeLabel}</p>

          {isWin && (
            <>
              <p className="mt-3 font-bold text-sm">Mã VIP:</p>
              <p className="font-mono text-xl font-bold text-purple-800">
                {result.vipCode}
              </p>
              <p className="text-sm text-gray-600">
                Mã có hiệu lực trong {result.days} ngày. Hãy lưu lại và nhập
                ngay vào ô “Nhập mã VIP”.
              </p>
            </>
          )}

          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 rounded-xl bg-pink-500 text-white shadow hover:bg-pink-600"
          >
            Quay lại
          </button>
        </div>
      )}
    </div>
  );
}
