import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post("/users/forgot-password", { email });
      setSent(true);
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message:
              err.response?.data?.message || "Something went wrong. Try again.",
            type: "error",
          },
        }),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back */}
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors mb-5"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to login
        </Link>

        {/* Brand */}
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span
            className="font-black text-2xl text-[#1A1208] tracking-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Tomato
          </span>
        </Link>

        {/* Card */}
        <div className="bg-white border border-[#EDE8DF] rounded-2xl p-7 sm:p-9 shadow-lg shadow-black/5">
          {/* ── Success state ── */}
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-5">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.1 1.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
              </div>
              <h2
                className="text-2xl font-black text-[#1A1208] tracking-tight mb-2"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Check your email
              </h2>
              <p className="text-sm text-[#9C9088] leading-relaxed mb-1">
                We sent a password reset link to
              </p>
              <p className="text-sm font-bold text-[#1A1208] mb-6">{email}</p>
              <p className="text-xs text-[#9C9088] leading-relaxed mb-6">
                The link expires in{" "}
                <span className="font-semibold text-[#4A3F34]">15 minutes</span>
                . Check your spam folder if you don't see it.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-sm text-red-500 font-bold hover:underline"
              >
                Try a different email
              </button>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <div className="mb-7">
                <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <h1
                  className="text-3xl font-black text-[#1A1208] tracking-tight mb-1"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Forgot password?
                </h1>
                <p className="text-sm text-[#9C9088]">
                  No worries — we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-[#4A3F34] mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full bg-[#FBF7F0] border border-[#EDE8DF] rounded-xl px-4 py-3 text-sm font-medium text-[#1A1208] placeholder-[#9C9088] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 focus:bg-white transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl shadow-md shadow-red-200 hover:shadow-lg hover:shadow-red-300/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-200"
                >
                  {submitting && (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {submitting ? "Sending link…" : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="mt-5 text-center text-sm text-[#9C9088]">
          Remembered your password?{" "}
          <Link to="/login" className="text-red-500 font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
