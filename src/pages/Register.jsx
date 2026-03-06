import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

const EyeOpen = () => (
  <svg
    width="16"
    height="16"
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
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
  </svg>
);

const inputCls =
  "w-full bg-[#FBF7F0] border border-[#EDE8DF] rounded-xl px-4 py-3 text-sm font-medium text-[#1A1208] placeholder-[#9C9088] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 focus:bg-white transition";
const labelCls =
  "block text-[11px] font-bold uppercase tracking-widest text-[#4A3F34] mb-1.5";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const update = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data: user } = await API.post("/users/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        ...(form.phone && { phone: form.phone }),
      });
      localStorage.setItem("userInfo", JSON.stringify(user));
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: { message: "Account created! Welcome 🎉", type: "success" },
        }),
      );
      if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "restaurant_owner") navigate("/owner/dashboard");
      else if (user.role === "delivery_partner")
        navigate("/delivery/dashboard");
      else navigate("/");
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message: err.response?.data?.message || "Sign up failed",
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
      <div className="w-full max-w-lg">
        {/* Back */}
        <Link
          to="/"
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
          Back to home
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
          <h1
            className="text-3xl font-black text-[#1A1208] tracking-tight mb-1"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Create account
          </h1>
          <p className="text-sm text-[#9C9088] mb-7">
            Join thousands of food lovers today
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name + Phone row */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Full name</label>
                <input
                  className={inputCls}
                  type="text"
                  name="name"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={update}
                  required
                  autoComplete="name"
                />
              </div>
              <div>
                <label className={labelCls}>
                  Phone{" "}
                  <span className="text-[10px] font-normal text-[#9C9088] normal-case tracking-normal">
                    optional
                  </span>
                </label>
                <input
                  className={inputCls}
                  type="tel"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={update}
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={labelCls}>Email address</label>
              <input
                className={inputCls}
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={update}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className={labelCls}>Password</label>
              <div className="relative">
                <input
                  className={inputCls}
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={update}
                  required
                  minLength={8}
                  autoComplete="new-password"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl shadow-md shadow-red-200 hover:shadow-lg hover:shadow-red-300/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-200"
            >
              {submitting && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-[#9C9088] leading-relaxed">
            By signing up you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Footer */}
        <p className="mt-5 text-center text-sm text-[#9C9088]">
          Already have an account?{" "}
          <Link to="/login" className="text-red-500 font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
