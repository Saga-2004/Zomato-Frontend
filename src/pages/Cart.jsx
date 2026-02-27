import { useEffect, useState } from "react";
import API from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { loadRazorpay } from "../utils/loadRazorpay";
import Login from "./Login";

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
  const navigate = useNavigate();

  const mergeCartItems = (rawCart) => {
    if (!rawCart || !Array.isArray(rawCart.items)) return rawCart;

    const map = new Map();

    rawCart.items.forEach((item) => {
      const key = item.menuItem?._id || item.menuItemId || item._id;
      if (!key) return;

      const existing = map.get(key);
      if (!existing) {
        map.set(key, { ...item });
      } else {
        map.set(key, {
          ...existing,
          quantity: (existing.quantity || 0) + (item.quantity || 0 || 1),
        });
      }
    });

    return {
      ...rawCart,
      items: Array.from(map.values()),
    };
  };

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get("/cart");
      const merged = mergeCartItems(response.data);
      setCart(merged);
      // notify other components (navbar) about the new cart count
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(err);
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

  const fetchSummary = async (codeForSummary = "") => {
    if (!cart || !cart.items || cart.items.length === 0) {
      setSummary(null);
      return false;
    }
    try {
      setSummaryError(null);
      const res = await API.post("/cart/summary", {
        couponCode: codeForSummary,
      });
      setSummary(res.data);
      return true;
    } catch (err) {
      console.error(err);
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
    // initial summary without coupon
    fetchSummary("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  const handleApplyCoupon = async () => {
    setApplying(true);
    try {
      const ok = await fetchSummary(couponCode);
      if (ok) {
        setAppliedCoupon(couponCode);
        setSummaryError(null);
      } else {
        // invalid / expired coupon
        setAppliedCoupon("");
      }
    } finally {
      setApplying(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await API.delete(`/cart/${itemId}`);
      fetchCart();
    } catch (error) {
      console.log(error);
    }
  };

  const updateQuantity = async (menuItemId, delta) => {
    try {
      await API.post("/cart", { menuItemId, quantity: delta });
      fetchCart();
    } catch (error) {
      console.log(error);
    }
  };

  const incrementItem = (menuItemId) => {
    updateQuantity(menuItemId, 1);
  };

  const decrementItem = (menuItemId, currentQty) => {
    if (currentQty <= 1) {
      removeItem(menuItemId);
      return;
    }
    updateQuantity(menuItemId, -1);
  };

  const handleCheckout = async () => {
    if (!pincode) {
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: { message: "Please enter a pincode", type: "error" },
        }),
      );
      return;
    }

    setCheckingOut(true);
    try {
      await API.post("/cart/checkout", {
        pincode,
        couponCode: appliedCoupon || "",
      });
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: { message: "Order placed successfully!", type: "success" },
        }),
      );
      navigate("/");
    } catch (error) {
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message:
              error.response?.data?.message ||
              error.message ||
              "Checkout failed",
            type: "error",
          },
        }),
      );
    } finally {
      setCheckingOut(false);
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

    // 🔥 LOAD RAZORPAY SDK FIRST
    const sdkLoaded = await loadRazorpay();

    if (!sdkLoaded) {
      alert("Razorpay SDK failed to load");
      return;
    }

    setCheckingOut(true);
    console.log(appliedCoupon);

    try {
      // 1️⃣ Create order in DB
      const checkoutRes = await API.post("/cart/checkout", {
        pincode,
        couponCode: appliedCoupon || "",
      });

      const { orderId, totalAmount } = checkoutRes.data;

      // 2️⃣ Create Razorpay order
      const rzpOrder = await API.post("/payment/create-order", {
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
              console.log("Failed to delete pending order", err);
            }

            setCheckingOut(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Payment failed");
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center text-gray-500">
          Loading cart…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => fetchCart()}
              className="bg-red-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl border border-gray-200 p-12 shadow-sm">
            <p className="text-4xl mb-4">🛒</p>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Add items from a restaurant to get started.
            </p>
            <Link
              to="/"
              className="inline-block bg-red-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-red-700 transition"
            >
              Browse restaurants
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Cart</h1>

        <ul className="space-y-3 mb-8">
          {cart.items.map((item) => (
            <li
              key={item._id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div>
                  <img
                    className="h-20 w-20 rounded-xl object-cover"
                    src={item.menuItem.image}
                    alt="Image"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {item.menuItem.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    ₹{item.menuItem.price} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      decrementItem(item.menuItem._id, item.quantity)
                    }
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="min-w-8 text-center text-sm font-medium text-gray-900">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => incrementItem(item.menuItem._id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.menuItem._id)}
                className="text-red-600 font-medium text-sm hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Checkout</h3>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode
              </label>
              <input
                placeholder="Enter pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coupon code
              </label>
              <div className="flex gap-2">
                <input
                  placeholder="Coupon code (optional)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  // disabled={applying || !couponCode}
                  className="px-4 py-2 rounded-lg border border-red-500 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                >
                  {applying ? "Applying…" : "Apply"}
                </button>
              </div>
              {appliedCoupon && !summaryError && (
                <p className="text-xs text-emerald-700 mt-1">
                  Coupon <span className="font-semibold">{appliedCoupon}</span>{" "}
                  applied.
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mb-4 text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Items total</span>
              <span className="font-medium text-gray-900">
                ₹
                {summary?.subtotal ??
                  cart.items.reduce(
                    (sum, item) =>
                      sum + item.menuItem.price * (item.quantity || 1),
                    0,
                  )}
              </span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Discount</span>
              <span className="font-medium text-emerald-700">
                -₹{summary?.discountApplied ?? 0}
              </span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Delivery Charges</span>
              <span className="font-medium text-gray-900">₹0</span>
            </div>
            <div className="flex justify-between mt-2 pt-2 border-t border-dashed border-gray-200">
              <span className="text-gray-900 font-semibold">Total payable</span>
              <span className="text-lg font-bold text-gray-900">
                ₹
                {summary?.totalPayable ??
                  cart.items.reduce(
                    (sum, item) =>
                      sum + item.menuItem.price * (item.quantity || 1),
                    0,
                  )}
              </span>
            </div>
            {summaryError && (
              <p className="text-xs text-red-600 mt-1">{summaryError}</p>
            )}
          </div>

          <button
            type="button"
            onClick={handlePayment}
            disabled={checkingOut}
            className={`w-full text-white font-semibold py-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ${checkingOut ? "bg-red-400 cursor-wait" : "bg-red-600 hover:bg-red-700"}`}
          >
            {checkingOut ? (
              <span className="inline-flex items-center gap-2 justify-center">
                <svg
                  className="animate-spin h-4 w-4 text-white"
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
                Placing order...
              </span>
            ) : (
              "Pay & Place Order"
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

export default Cart;
