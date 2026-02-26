import { useEffect, useState } from "react";
import API from "../../api/axios";

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

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/coupons/mine");
      setCoupons(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load coupons.",
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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        code: form.code.trim(),
        discountPercent: Number(form.discountPercent),
        maxDiscount: Number(form.maxDiscount),
        validTill: form.validTill,
      };
      await API.post("/coupons", payload);
      setForm({
        code: "",
        discountPercent: "",
        maxDiscount: "",
        validTill: "",
      });
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Offers & Coupons</h1>
      <p className="text-gray-600 mb-6">
        Create coupon codes for your restaurant.
      </p>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm max-w-xl mb-8">
        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coupon code
            </label>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="E.g. SLASH50"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm uppercase"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount %
              </label>
              <input
                type="number"
                name="discountPercent"
                value={form.discountPercent}
                onChange={handleChange}
                min="1"
                max="100"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max discount (₹)
              </label>
              <input
                type="number"
                name="maxDiscount"
                value={form.maxDiscount}
                onChange={handleChange}
                min="1"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valid till
            </label>
            <input
              type="date"
              name="validTill"
              value={form.validTill}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {submitting ? "Creating…" : "Create coupon"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Existing coupons
        </h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading coupons…</p>
        ) : coupons.length === 0 ? (
          <p className="text-sm text-gray-500">
            No coupons yet. Create one above.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {coupons.map((coupon) => (
              <li key={coupon._id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">{coupon.code}</p>
                  <p className="text-xs text-gray-500">
                    {coupon.discountPercent}% off · Max ₹{coupon.maxDiscount}
                  </p>
                  {coupon.validTill && (
                    <p className="text-xs text-gray-400">
                      Valid till{" "}
                      {new Date(coupon.validTill).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default OwnerOffers;

