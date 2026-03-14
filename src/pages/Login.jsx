import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

const FEATURES = [
  ["🚀", "30-min delivery", "Lightning fast to your door"],
  ["🍽️", "200+ restaurants", "Curated local favourites"],
  ["💳", "Secure payments", "Razorpay powered checkout"],
  ["⭐", "Top-rated picks", "Loved by thousands"],
];

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

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data: user } = await API.post("/users/login", {
        email,
        password,
      });
      localStorage.setItem("userInfo", JSON.stringify(user));
      if (user.isBlocked) {
        localStorage.removeItem("userInfo");
        window.dispatchEvent(
          new CustomEvent("appToast", {
            detail: { message: "Your account is blocked.", type: "error" },
          }),
        );
        return;
      }
      if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "restaurant_owner") navigate("/owner/dashboard");
      else if (user.role === "delivery_partner")
        navigate("/delivery/dashboard");
      else navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "";
      const blocked =
        msg.toLowerCase().includes("suspended") ||
        msg.toLowerCase().includes("blocked");
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message: blocked
              ? "Your account is suspended."
              : msg || "Login failed.",
            type: "error",
          },
        }),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#FFFDF9]">
      {/* ── Left panel (desktop only) ── */}
      <div className="hidden md:flex flex-col items-center justify-center relative overflow-hidden bg-linear-to-br from-[#FFF9F2] via-[#FFF1F3] to-[#FFF5E8] border-r border-[#EDE8DF] px-12 py-16">
        {/* Blobs */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-red-200/55 blur-[70px] pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-amber-200/45 blur-[65px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-sm">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-3">
            <span className="relative flex shrink-0">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-50" />
            </span>
            <span
              className="font-black text-3xl text-[#1A1208] tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Tomato
            </span>
          </div>

          <p className="text-sm text-[#9C9088] leading-relaxed mb-9">
            Discover the best food near you, delivered hot and fresh to your
            door.
          </p>

          {/* Feature cards */}
          <div className="flex flex-col gap-3">
            {FEATURES.map(([icon, title, sub]) => (
              <div
                key={title}
                className="bg-white border border-[#EDE8DF] rounded-2xl px-4 py-3.5 flex items-center gap-4 shadow-sm hover:translate-x-1 hover:shadow-md transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-lg shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1208]">
                    {title}
                  </p>
                  <p className="text-xs text-[#9C9088] mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form ── */}
      <div className="flex items-center justify-center bg-white px-6 py-12 min-h-screen">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <Link to="/" className="md:hidden flex items-center gap-2 mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span
              className="font-black text-2xl text-[#1A1208] tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Tomato
            </span>
          </Link>

          <h1
            className="text-3xl font-black text-[#1A1208] tracking-tight mb-1"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Welcome back 👋
          </h1>
          <p className="text-sm text-[#9C9088] mb-8">
            Sign in to continue ordering
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
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

            {/* Password */}
            <div>
              {/* <label className="block text-[11px] font-bold uppercase tracking-widest text-[#4A3F34] mb-1.5">
                Password
              </label> */}
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#4A3F34]">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-bold text-red-500 hover:underline uppercase tracking-widest"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full bg-[#FBF7F0] border border-[#EDE8DF] rounded-xl px-4 py-3 pr-11 text-sm font-medium text-[#1A1208] placeholder-[#9C9088] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 focus:bg-white transition"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl shadow-md shadow-red-200 hover:shadow-lg hover:shadow-red-300/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-200"
            >
              {submitting && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#9C9088]">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-red-500 font-bold hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
