import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";

const EyeOpen = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosed = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
  </svg>
);

export default function ResetPassword() {
  const { token } = useParams(); // grabs token from URL
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const inputCls =
    "w-full bg-[#FBF7F0] border border-[#EDE8DF] rounded-xl px-4 py-3 text-sm font-medium text-[#1A1208] placeholder-[#9C9088] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 focus:bg-white transition";

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (form.password.length < 8) {
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message: "Password must be at least 8 characters.",
            type: "error",
          },
        }),
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message: "Passwords do not match.",
            type: "error",
          },
        }),
      );
      return;
    }

    setSubmitting(true);
    try {
      await API.post(`/users/reset-password/${token}`, {
        password: form.password,
      });
      setDone(true);
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message:
              err.response?.data?.message ||
              "Link expired or invalid. Please request a new one.",
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
          {done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-5">
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2
                className="text-2xl font-black text-[#1A1208] tracking-tight mb-2"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Password reset!
              </h2>
              <p className="text-sm text-[#9C9088] leading-relaxed mb-7">
                Your password has been updated successfully.
                <br />
                You can now sign in with your new password.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl shadow-md shadow-red-200 hover:shadow-lg hover:shadow-red-300/50 hover:-translate-y-0.5 transition-all duration-200"
              >
                Go to Login
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
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h1
                  className="text-3xl font-black text-[#1A1208] tracking-tight mb-1"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Set new password
                </h1>
                <p className="text-sm text-[#9C9088]">
                  Must be at least 8 characters long.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New password */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-[#4A3F34] mb-1.5">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, password: e.target.value }))
                      }
                      required
                      autoComplete="new-password"
                      className={inputCls}
                      style={{ paddingRight: 42 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9C9088] hover:text-[#1A1208] transition-colors"
                    >
                      {showPass ? <EyeClosed /> : <EyeOpen />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-[#4A3F34] mb-1.5">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter new password"
                      value={form.confirmPassword}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          confirmPassword: e.target.value,
                        }))
                      }
                      required
                      autoComplete="new-password"
                      className={inputCls}
                      style={{ paddingRight: 42 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9C9088] hover:text-[#1A1208] transition-colors"
                    >
                      {showConfirm ? <EyeClosed /> : <EyeOpen />}
                    </button>
                  </div>

                  {/* Live mismatch warning */}
                  {form.confirmPassword.length > 0 &&
                    form.password !== form.confirmPassword && (
                      <p className="mt-1.5 text-xs font-semibold text-red-400">
                        Passwords don't match
                      </p>
                    )}
                </div>

                {/* Strength hint */}
                {form.password.length > 0 && (
                  <div className="flex gap-1.5 items-center">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          form.password.length >= 12 && i < 4
                            ? "bg-green-400"
                            : form.password.length >= 10 && i < 3
                              ? "bg-yellow-400"
                              : form.password.length >= 8 && i < 2
                                ? "bg-orange-400"
                                : i < 1
                                  ? "bg-red-400"
                                  : "bg-gray-100"
                        }`}
                      />
                    ))}
                    <span className="text-[11px] font-semibold text-[#9C9088] ml-1">
                      {form.password.length >= 12
                        ? "Strong"
                        : form.password.length >= 10
                          ? "Good"
                          : form.password.length >= 8
                            ? "Fair"
                            : "Weak"}
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl shadow-md shadow-red-200 hover:shadow-lg hover:shadow-red-300/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-200"
                >
                  {submitting && (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {submitting ? "Resetting…" : "Reset password"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        {!done && (
          <p className="mt-5 text-center text-sm text-[#9C9088]">
            Didn't request this?{" "}
            <Link
              to="/login"
              className="text-red-500 font-bold hover:underline"
            >
              Back to login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
