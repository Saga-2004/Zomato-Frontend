import { useEffect, useState } from "react";
import API from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { loadRazorpay } from "../utils/loadRazorpay";

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pincode, setPincode] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [applying, setApplying] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/users/profile")
      .then((r) => setUserAddress(r.data?.address || ""))
      .catch(() => {});
  }, []);

  const mergeCartItems = (rawCart) => {
    if (!rawCart || !Array.isArray(rawCart.items)) return rawCart;
    const map = new Map();
    rawCart.items.forEach((item) => {
      // Use menuItem._id + variantIdx as key
      const baseId = item.menuItem?._id || item.menuItemId || item._id;
      const key =
        baseId +
        "_" +
        (item.variantIdx !== undefined && item.variantIdx !== null
          ? item.variantIdx
          : "noVar");
      if (!baseId) return;
      const existing = map.get(key);
      map.set(
        key,
        existing
          ? {
              ...existing,
              quantity: (existing.quantity || 0) + (item.quantity || 1),
            }
          : { ...item },
      );
    });
    return { ...rawCart, items: Array.from(map.values()) };
  };

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get("/cart");
      setCart(mergeCartItems(response.data));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load cart",
      );
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchSummary = async (code = "") => {
    if (!cart?.items?.length) {
      setSummary(null);
      return false;
    }
    try {
      setSummaryError(null);
      const res = await API.post("/cart/summary", { couponCode: code });
      setSummary(res.data);
      return true;
    } catch (err) {
      setSummary(null);
      setSummaryError(
        err.response?.data?.message ||
          err.message ||
          "Failed to calculate summary",
      );
      return false;
    }
  };

  useEffect(() => {
    fetchSummary("");
  }, [cart]);

  const handleApplyCoupon = async () => {
    setApplying(true);
    try {
      const ok = await fetchSummary(couponCode);
      if (ok) {
        setAppliedCoupon(couponCode);
        setSummaryError(null);
      } else setAppliedCoupon("INVALID");
    } finally {
      setApplying(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await API.delete(`/cart/${itemId}`);
      fetchCart();
    } catch (e) {
      console.log(e);
    }
  };

  const updateQuantity = async (menuItemId, delta) => {
    try {
      await API.post("/cart", { menuItemId, quantity: delta });
      fetchCart();
    } catch (e) {
      console.log(e);
    }
  };

  const handlePayment = async () => {
    if (!pincode) {
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: { message: "Please enter a pincode", type: "error" },
        }),
      );
      return;
    }
    const sdkLoaded = await loadRazorpay();
    if (!sdkLoaded) {
      alert("Razorpay SDK failed to load");
      return;
    }
    setCheckingOut(true);
    try {
      const checkoutRes = await API.post("/cart/checkout", {
        pincode,
        couponCode: appliedCoupon || "",
      });
      const { orderId, totalAmount } = checkoutRes.data;
      const rzpOrder = await API.post("/payment/create-order", {
        couponCode: appliedCoupon || "",
        amount: totalAmount,
      });
      const { id, amount, currency } = rzpOrder.data;
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        order_id: id,
        name: "Zomato Clone",
        handler: async function (response) {
          const verifyRes = await API.post("/payment/verify-payment", response);
          if (verifyRes.data.success) {
            await API.put(`/orders/${orderId}/pay`, {
              paymentId: response.razorpay_payment_id,
            });
            alert("Payment Successful 🎉");
            navigate("/my-orders");
          }
        },
        modal: {
          ondismiss: async function () {
            try {
              await API.delete(`/orders/${orderId}/cancel-pending`);
            } catch (err) {
              if (
                err.response?.status &&
                ![404, 401, 403].includes(err.response.status)
              )
                console.warn("Failed to delete pending order:", err.message);
            }
            setCheckingOut(false);
          },
        },
      };
      new window.Razorpay(options).open();
    } catch (error) {
      alert(error.response?.data?.message || "Payment failed");
      setCheckingOut(false);
    }
  };

  const fallbackTotal =
    cart?.items?.reduce(
      (s, i) =>
        s +
        (typeof i.price === "number" ? i.price : i.menuItem.price) *
          (i.quantity || 1),
      0,
    ) ?? 0;

  // ── Loading ──
  if (loading)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center pt-24 flex-col gap-3">
          <div className="w-8 h-8 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading cart…</p>
        </div>
      </div>
    );

  // ── Error ──
  if (error)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto mt-16 px-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-14 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="font-bold text-gray-900 text-lg mb-1">
              Something went wrong
            </p>
            <p className="text-gray-400 text-sm mb-6">{error}</p>
            <button
              onClick={fetchCart}
              className="px-6 py-2.5 bg-red-500 text-white font-semibold text-sm rounded-xl hover:bg-red-600 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );

  // ── Empty ──
  if (!cart?.items?.length)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto mt-16 px-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-14 text-center">
            <div className="text-5xl mb-4">🛒</div>
            <p className="font-bold text-gray-900 text-lg mb-1">
              Your cart is empty
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Add items from a restaurant to get started.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white font-semibold text-sm rounded-xl hover:bg-red-600 transition"
            >
              Browse restaurants
            </Link>
          </div>
        </div>
      </div>
    );

  // ── Cart ──
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-5 py-8 pb-24">
        <p className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-1">
          Order
        </p>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">
          Your Cart
        </h1>

        {/* Cart items */}
        <div className="space-y-3 mb-6">
          {cart.items.map((item) => {
            // Use variant price if present
            const price = item.price ?? item.menuItem.price;
            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex-wrap sm:flex-nowrap"
              >
                {/* Image */}
                <img
                  src={item.menuItem.image}
                  alt={item.menuItem.name}
                  className="w-16 h-16 rounded-xl object-cover border border-gray-100 shrink-0"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {item.menuItem.name}
                    {item.variantName && (
                      <span className="ml-2 text-xs text-gray-500 font-normal">
                        [{item.variantName}]
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    ₹{price} × {item.quantity} ={" "}
                    <span className="font-bold text-gray-700">
                      ₹{price * item.quantity}
                    </span>
                  </p>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() =>
                      item.quantity <= 1
                        ? removeItem(item.menuItem._id)
                        : updateQuantity(item.menuItem._id, -1, item.variantIdx)
                    }
                    className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 text-base font-semibold flex items-center justify-center hover:border-red-300 hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    −
                  </button>
                  <span className="min-w-[20px] text-center text-sm font-bold text-gray-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.menuItem._id, 1, item.variantIdx)
                    }
                    className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 text-base font-semibold flex items-center justify-center hover:border-red-300 hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    +
                  </button>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.menuItem._id)}
                  className="text-xs font-semibold text-gray-400 hover:text-red-500 underline underline-offset-2 transition-colors shrink-0"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>

        {/* Checkout card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-red-500 to-orange-400" />
          <div className="p-5 sm:p-6">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-5">
              Checkout
            </h3>

            {/* Delivery address */}
            {userAddress && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Delivery address
                </label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600 font-medium">
                  {userAddress}
                </div>
              </div>
            )}

            {/* Pincode */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Pincode
              </label>
              <input
                type="text"
                placeholder="Enter delivery pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-50 focus:bg-white transition"
              />
            </div>

            {/* Coupon */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Coupon code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code (optional)"
                  value={couponCode}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setCouponCode(val);
                    if (val === "") {
                      setAppliedCoupon("");
                      setSummaryError(null);
                    }
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-50 focus:bg-white transition"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={applying || !couponCode}
                  className="px-5 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0"
                >
                  {applying ? "…" : "Apply"}
                </button>
              </div>
              {appliedCoupon === "INVALID" ? (
                <p className="text-xs font-semibold text-red-500 mt-1.5">
                  Invalid coupon code
                </p>
              ) : appliedCoupon && !summaryError ? (
                <p className="text-xs font-semibold text-emerald-600 mt-1.5">
                  ✓ Coupon <strong>{appliedCoupon}</strong> applied!
                </p>
              ) : null}
            </div>

            {/* Summary */}
            <div className="border-t border-gray-100 pt-4 space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 font-medium">Items total</span>
                <span className="font-semibold text-gray-700">
                  ₹{summary?.subtotal ?? fallbackTotal}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 font-medium">Discount</span>
                <span className="font-semibold text-emerald-600">
                  −₹{summary?.discountApplied ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 font-medium">
                  Delivery charges
                </span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>
              {summaryError && (
                <p className="text-xs text-red-500 font-medium">
                  {summaryError}
                </p>
              )}
              <div className="flex items-baseline justify-between border-t-2 border-dashed border-gray-200 pt-3 mt-1">
                <span className="font-bold text-gray-900">Total payable</span>
                <span className="text-2xl font-black text-gray-900 tracking-tight">
                  ₹{summary?.totalPayable ?? fallbackTotal}
                </span>
              </div>
            </div>

            {/* Pay button */}
            <button
              onClick={handlePayment}
              disabled={checkingOut}
              className="w-full mt-5 flex items-center justify-center gap-2 py-3.5 bg-red-500 text-white font-bold text-sm rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-lg hover:shadow-red-500/25 hover:-translate-y-0.5 transition-all duration-200"
            >
              {checkingOut && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {checkingOut ? "Placing order…" : "Pay & Place Order"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Cart;
