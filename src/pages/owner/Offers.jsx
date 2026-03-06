import { useEffect, useState } from "react";
import API from "../../api/axios";

const inputCls =
  "w-full bg-[#FBF7F0] border border-[#EDE8DF] rounded-xl px-4 py-3 text-sm font-medium text-[#1A1208] placeholder-[#9C9088] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 focus:bg-white transition";
const labelCls =
  "block text-[11px] font-bold uppercase tracking-widest text-[#4A3F34] mb-1.5";

function CouponSkeleton() {
  return Array.from({ length: 3 }).map((_, i) => (
    <div
      key={i}
      className="flex items-center justify-between py-4 animate-pulse"
    >
      <div className="space-y-2">
        <div className="h-4 bg-gray-100 rounded-full w-28" />
        <div className="h-3 bg-gray-100 rounded-full w-44" />
        <div className="h-3 bg-gray-100 rounded-full w-32" />
      </div>
    </div>
  ));
}

function isExpired(validTill) {
  if (!validTill) return false;
  return new Date(validTill) < new Date();
}

function OwnerOffers() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    code: "",
    discountPercent: "",
    maxDiscount: "",
    validTill: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/coupons/mine");
      setCoupons(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load coupons.",
      );
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "code" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await API.post("/coupons", {
        code: form.code.trim(),
        discountPercent: Number(form.discountPercent),
        maxDiscount: Number(form.maxDiscount),
        validTill: form.validTill,
      });
      setForm({
        code: "",
        discountPercent: "",
        maxDiscount: "",
        validTill: "",
      });
      setSuccess("Coupon created successfully!");
      await fetchCoupons();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create coupon.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const activeCoupons = coupons.filter((c) => !isExpired(c.validTill));
  const expiredCoupons = coupons.filter((c) => isExpired(c.validTill));

  return (
    <div>
      {/* Page header */}
      <div className="mb-7">
        <p className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-0.5">
          Promotions
        </p>
        <h1
          className="text-2xl font-black text-gray-900 tracking-tight"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Offers & Coupons
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Create discount codes to attract more customers.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6 items-start">
        {/* ── Create coupon form ── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2
              className="font-black text-gray-900 tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Create Coupon
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Fill in the details to launch a new offer
            </p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                <svg
                  className="w-4 h-4 mt-0.5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-5 flex items-start gap-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-xl px-4 py-3">
                <svg
                  className="w-4 h-4 mt-0.5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Code */}
              <div>
                <label className={labelCls}>Coupon Code</label>
                <div className="relative">
                  <input
                    type="text"
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="e.g. SLASH50"
                    required
                    className={`${inputCls} font-mono tracking-widest`}
                  />
                  {form.code && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                      {form.code.length} chars
                    </span>
                  )}
                </div>
              </div>

              {/* Discount % + Max */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Discount %</label>
                  <input
                    type="number"
                    name="discountPercent"
                    value={form.discountPercent}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    placeholder="e.g. 20"
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Max Discount (₹)</label>
                  <input
                    type="number"
                    name="maxDiscount"
                    value={form.maxDiscount}
                    onChange={handleChange}
                    min="1"
                    placeholder="e.g. 100"
                    required
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Preview pill */}
              {form.code && form.discountPercent && form.maxDiscount && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <span className="text-xl">🏷️</span>
                  <div>
                    <p className="text-sm font-black text-red-600 font-mono tracking-widest">
                      {form.code}
                    </p>
                    <p className="text-xs text-red-400">
                      {form.discountPercent}% off · Max ₹{form.maxDiscount}
                    </p>
                  </div>
                </div>
              )}

              {/* Valid till */}
              <div>
                <label className={labelCls}>Valid Till</label>
                <input
                  type="date"
                  name="validTill"
                  value={form.validTill}
                  onChange={handleChange}
                  required
                  className={inputCls}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl shadow-sm shadow-red-200 hover:shadow-md hover:shadow-red-300/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-200"
              >
                {submitting && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {submitting ? "Creating…" : "Create coupon"}
              </button>
            </form>
          </div>
        </div>

        {/* ── Coupons list ── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2
                className="font-black text-gray-900 tracking-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Your Coupons
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {loading
                  ? "Loading…"
                  : `${activeCoupons.length} active · ${expiredCoupons.length} expired`}
              </p>
            </div>
            <button
              type="button"
              onClick={fetchCoupons}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition"
              title="Refresh"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
            </button>
          </div>

          <div className="px-6">
            {loading ? (
              <div className="divide-y divide-gray-50">
                <CouponSkeleton />
              </div>
            ) : coupons.length === 0 ? (
              <div className="py-16 text-center">
                <div className="text-4xl mb-3">🏷️</div>
                <p
                  className="font-black text-gray-700 text-base mb-1"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  No coupons yet
                </p>
                <p className="text-sm text-gray-400">
                  Create your first coupon using the form.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {/* Active */}
                {activeCoupons.map((coupon, idx) => (
                  <div
                    key={coupon._id}
                    className="py-4 flex items-center justify-between gap-4 group animate-[fadeUp_0.35s_ease_both]"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-base shrink-0">
                        🏷️
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-gray-900 font-mono tracking-widest text-sm">
                          {coupon.code}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {coupon.discountPercent}% off · Max ₹
                          {coupon.maxDiscount}
                        </p>
                        {coupon.validTill && (
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Valid till{" "}
                            {new Date(coupon.validTill).toLocaleDateString(
                              "en-IN",
                              { dateStyle: "medium" },
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                      Active
                    </span>
                  </div>
                ))}

                {/* Expired */}
                {expiredCoupons.map((coupon, idx) => (
                  <div
                    key={coupon._id}
                    className="py-4 flex items-center justify-between gap-4 opacity-50 animate-[fadeUp_0.35s_ease_both]"
                    style={{
                      animationDelay: `${(activeCoupons.length + idx) * 50}ms`,
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-base shrink-0">
                        🏷️
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-gray-700 font-mono tracking-widest text-sm line-through">
                          {coupon.code}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {coupon.discountPercent}% off · Max ₹
                          {coupon.maxDiscount}
                        </p>
                        {coupon.validTill && (
                          <p className="text-[11px] text-red-400 mt-0.5">
                            Expired{" "}
                            {new Date(coupon.validTill).toLocaleDateString(
                              "en-IN",
                              { dateStyle: "medium" },
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-400">
                      Expired
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerOffers;
