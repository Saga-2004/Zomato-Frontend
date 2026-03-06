import { useEffect, useState } from "react";

export default function FullPageLoader() {
  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const start = () => {
      setShow(true);
      requestAnimationFrame(() => setVisible(true));
    };
    const end = () => {
      setVisible(false);
      setTimeout(() => setShow(false), 320);
    };
    window.addEventListener("loadingStart", start);
    window.addEventListener("loadingEnd", end);
    return () => {
      window.removeEventListener("loadingStart", start);
      window.removeEventListener("loadingEnd", end);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-7 bg-black/80 backdrop-blur-md transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* Top shimmer bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-red-500 to-transparent animate-[shimmer_1.4s_linear_infinite] bg-[length:200%_100%]" />

      {/* Spinner ring */}
      <div className="relative w-16 h-16">
        <svg
          className="w-full h-full animate-spin"
          viewBox="0 0 62 62"
          fill="none"
        >
          <circle
            cx="31"
            cy="31"
            r="27"
            strokeWidth="4"
            stroke="rgba(255,255,255,0.07)"
          />
          <circle
            cx="31"
            cy="31"
            r="27"
            strokeWidth="4"
            stroke="#E23744"
            strokeLinecap="round"
            strokeDasharray="120"
            strokeDashoffset="30"
            style={{ filter: "drop-shadow(0 0 6px rgba(226,55,68,0.7))" }}
          />
        </svg>
        {/* Center dot */}
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/80" />
      </div>

      {/* Wordmark */}
      <span className="text-white/20 text-sm font-bold uppercase tracking-[0.22em] animate-pulse">
        Tomato
      </span>
    </div>
  );
}
