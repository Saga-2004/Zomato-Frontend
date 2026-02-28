import { useEffect, useState } from "react";

export default function FullPageLoader() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const start = () => setShow(true);
    const end = () => setShow(false);
    window.addEventListener("loadingStart", start);
    window.addEventListener("loadingEnd", end);
    return () => {
      window.removeEventListener("loadingStart", start);
      window.removeEventListener("loadingEnd", end);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <svg
        className="animate-spin h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
    </div>
  );
}
