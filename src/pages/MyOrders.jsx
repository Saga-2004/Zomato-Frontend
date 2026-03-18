import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { loadRazorpay } from "../utils/loadRazorpay";

function statusStyle(status) {
  const s = (status || "").toLowerCase();
  if (s === "delivered")
    return "bg-green-50 text-green-600 border border-green-200";
  if (s === "cancelled") return "bg-red-50 text-red-500 border border-red-200";
  if (s === "pending" || s === "placed")
    return "bg-amber-50 text-amber-600 border border-amber-200";
  return "bg-[#F4EFE6] text-[#9C9088] border border-[#EDE8DF]";
}

function statusDotStyle(status) {
  const s = (status || "").toLowerCase();
  if (s === "delivered") return "bg-green-500";
  if (s === "cancelled") return "bg-red-500";
  if (s === "pending" || s === "placed") return "bg-amber-400 animate-pulse";
  return "bg-[#9C9088]";
}

function OrderSkeleton() {
  return Array.from({ length: 3 }).map((_, i) => (
    <div
      key={i}
      className="bg-white border border-[#EDE8DF] rounded-2xl p-5 mb-3.5 animate-pulse"
    >
      <div className="flex justify-between mb-4">
        <div className="space-y-2">
          <div className="h-4 bg-[#F4EFE6] rounded-full w-48" />
          <div className="h-2.5 bg-[#F4EFE6] rounded-full w-24" />
        </div>
        <div className="h-6 bg-[#F4EFE6] rounded-full w-20" />
      </div>
      <div className="h-px bg-[#EDE8DF] mb-3.5" />
      <div className="flex gap-2 flex-wrap">
        {[80, 110, 70].map((w) => (
          <div
            key={w}
            className="h-7 bg-[#F4EFE6] rounded-full"
            style={{ width: w }}
          />
        ))}
      </div>
    </div>
  ));
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [repayingOrderId, setRepayingOrderId] = useState(null);

  const toast = (message, type = "info") => {
    window.dispatchEvent(
      new CustomEvent("appToast", { detail: { message, type } }),
    );
  };

  const fetchOrders = async () => {
    try {
      const r = await API.get("/orders/my-orders");
      setOrders(r.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const canRetryPayment = (order) => {
    const blockedOrderStatuses = ["Cancelled", "Returned", "Refunded"];
    return (
      order?.paymentStatus === "Pending" &&
      !blockedOrderStatuses.includes(order?.status)
    );
  };

  const handleRepay = async (order) => {
    if (!order?._id || repayingOrderId) return;

    const sdkLoaded = await loadRazorpay();
    if (!sdkLoaded) {
      toast("Razorpay SDK failed to load", "error");
      return;
    }

    setRepayingOrderId(order._id);

    try {
      await API.put(`/orders/${order._id}/payment-pending`);

      const rzpOrder = await API.post("/payment/create-order", {
        amount: order.totalAmount,
      });

      const { id, amount, currency } = rzpOrder.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        order_id: id,
        name: "Zomato Clone",
        handler: async function (response) {
          try {
            const verifyRes = await API.post(
              "/payment/verify-payment",
              response,
            );

            if (!verifyRes.data?.success) {
              await API.put(`/orders/${order._id}/payment-pending`).catch(
                () => {},
              );
              toast(
                "Payment verification failed. Order is still pending.",
                "error",
              );
              return;
            }

            await API.put(`/orders/${order._id}/pay`, {
              paymentId: response.razorpay_payment_id,
            });

            toast("Payment successful", "success");
            await fetchOrders();
          } catch (err) {
            await API.put(`/orders/${order._id}/payment-pending`).catch(
              () => {},
            );
            toast(
              err.response?.data?.message ||
                "Payment failed. You can retry from My Orders.",
              "error",
            );
          } finally {
            setRepayingOrderId(null);
          }
        },
        modal: {
          ondismiss: async function () {
            await API.put(`/orders/${order._id}/payment-pending`).catch(
              () => {},
            );
            setRepayingOrderId(null);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", async () => {
        await API.put(`/orders/${order._id}/payment-pending`).catch(() => {});
        toast("Payment failed. Please retry.", "error");
        setRepayingOrderId(null);
      });

      razorpay.open();
    } catch (err) {
      toast(
        err.response?.data?.message || "Unable to start re-payment",
        "error",
      );
      setRepayingOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-5 py-8 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-7">
          <div>
            <p className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-0.5">
              History
            </p>
            <h1
              className="text-2xl font-black text-[#1A1208] tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              My Orders
            </h1>
          </div>
          {!loading && orders.length > 0 && (
            <span className="bg-[#F4EFE6] border border-[#EDE8DF] text-[#9C9088] text-xs font-bold px-4 py-1.5 rounded-full">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <OrderSkeleton />
        ) : orders.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center gap-4 bg-white border-2 border-dashed border-[#DDD8CE] rounded-2xl py-20 px-6 text-center">
            <span className="text-5xl">📋</span>
            <p
              className="text-lg font-black text-[#1A1208] tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              No orders yet
            </p>
            <p className="text-sm text-[#9C9088] max-w-xs leading-relaxed">
              Your order history will appear here once you place your first
              order.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-full shadow-md shadow-red-200 hover:-translate-y-0.5 transition-all duration-150"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Order food
            </Link>
          </div>
        ) : (
          /* Orders list */
          <ul className="space-y-3.5 p-0 list-none">
            {orders.map((order, idx) => (
              <li
                key={order._id}
                className="bg-white border border-[#EDE8DF] hover:border-[#DDD8CE] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-[fadeUp_0.4s_ease_both]"
                style={{ animationDelay: `${Math.min(idx * 45, 280)}ms` }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <Link
                      to={`/restaurant/${order.restaurant?._id}`}
                      className="font-black text-[#1A1208] hover:text-red-500 text-base tracking-tight block mb-1 transition-colors"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {order.restaurant?.restaurant_name ?? "Restaurant"}
                    </Link>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#9C9088]">
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 ${statusStyle(order.status)}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotStyle(order.status)}`}
                    />
                    {order.status}
                  </span>
                </div>

                <div className="h-px bg-[#EDE8DF] mb-4" />

                {/* Item chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {order.items.map((item) => (
                    <span
                      key={item._id}
                      className="bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full"
                    >
                      {item.name} × {item.quantity}
                    </span>
                  ))}
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-2.5 mb-3">
                  <div className="bg-[#FBF7F0] border border-[#EDE8DF] rounded-xl px-3.5 py-3">
                    <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#9C9088] mb-1">
                      Total
                    </p>
                    <p
                      className="text-base font-black text-[#1A1208] tracking-tight"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      ₹{order.totalAmount}
                    </p>
                  </div>
                  <div className="bg-[#FBF7F0] border border-[#EDE8DF] rounded-xl px-3.5 py-3">
                    <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#9C9088] mb-1">
                      Payment
                    </p>
                    <p
                      className={`text-base font-black tracking-tight ${order.paymentStatus === "Paid" ? "text-green-600" : "text-red-500"}`}
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {order.paymentStatus}
                    </p>
                  </div>
                </div>

                {/* Customer row */}
                {order.user && (
                  <div className="bg-[#FBF7F0] border border-[#EDE8DF] rounded-xl px-3.5 py-3 flex items-center gap-3 mb-3">
                    <div
                      className="w-8 h-8 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center font-black text-sm text-red-500 shrink-0"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {order.user.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1A1208]">
                        {order.user.name}
                      </p>
                      <p className="text-xs text-[#9C9088]">
                        {order.user.phone}
                        {order.user.address && ` · ${order.user.address}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  {canRetryPayment(order) ? (
                    <button
                      onClick={() => handleRepay(order)}
                      disabled={repayingOrderId === order._id}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {repayingOrderId === order._id ? (
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : null}
                      {repayingOrderId === order._id
                        ? "Processing..."
                        : "Re-pay now"}
                    </button>
                  ) : (
                    <span />
                  )}

                  <div className="flex items-center justify-end gap-1.5 text-[11.5px] text-[#9C9088] font-medium">
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {new Date(order.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
