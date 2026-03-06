import { useEffect, useState } from "react";
import API from "../../api/axios";

function statusConfig(status) {
  const s = (status || "").toLowerCase();
  if (s === "delivered")
    return {
      cls: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      dot: "bg-emerald-500",
      bar: "bg-emerald-400",
    };
  if (s === "cancelled")
    return {
      cls: "bg-red-50 text-red-600 border border-red-200",
      dot: "bg-red-500",
      bar: "bg-red-400",
    };
  if (s === "placed")
    return {
      cls: "bg-amber-50 text-amber-700 border border-amber-200",
      dot: "bg-amber-400 animate-pulse",
      bar: "bg-amber-400",
    };
  if (s === "accepted")
    return {
      cls: "bg-blue-50 text-blue-700 border border-blue-200",
      dot: "bg-blue-500 animate-pulse",
      bar: "bg-blue-400",
    };
  if (s === "preparing")
    return {
      cls: "bg-orange-50 text-orange-700 border border-orange-200",
      dot: "bg-orange-400 animate-pulse",
      bar: "bg-orange-400",
    };
  if (s === "ready for pickup")
    return {
      cls: "bg-purple-50 text-purple-700 border border-purple-200",
      dot: "bg-purple-500 animate-pulse",
      bar: "bg-purple-400",
    };
  return {
    cls: "bg-gray-100 text-gray-600 border border-gray-200",
    dot: "bg-gray-400",
    bar: "bg-gray-200",
  };
}

function OrderSkeleton() {
  return Array.from({ length: 3 }).map((_, i) => (
    <div
      key={i}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
    >
      <div className="h-1 bg-gray-100" />
      <div className="p-5 space-y-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded-full w-36" />
            <div className="h-3 bg-gray-100 rounded-full w-24" />
          </div>
          <div className="h-6 bg-gray-100 rounded-full w-20" />
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex gap-2">
          <div className="h-8 bg-gray-100 rounded-xl w-20" />
          <div className="h-8 bg-gray-100 rounded-xl w-20" />
        </div>
      </div>
    </div>
  ));
}

const FILTERS = [
  { key: "all", label: "All", dot: "bg-gray-400" },
  { key: "placed", label: "New", dot: "bg-amber-400" },
  { key: "accepted", label: "Accepted", dot: "bg-blue-500" },
  { key: "preparing", label: "Preparing", dot: "bg-orange-400" },
  { key: "ready for pickup", label: "Ready", dot: "bg-purple-500" },
  { key: "delivered", label: "Delivered", dot: "bg-emerald-500" },
  { key: "cancelled", label: "Cancelled", dot: "bg-red-500" },
  { key: "returned", label: "Returned", dot: "bg-rose-400" },
];

function OwnerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get("/orders/restaurant");
      const data = response.data;
      setOrders(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.orders)
            ? data.orders
            : [],
      );
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load orders",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toast = (message, type = "error") =>
    window.dispatchEvent(
      new CustomEvent("appToast", { detail: { message, type } }),
    );

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await API.put(`/orders/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o)),
      );
    } catch (err) {
      toast(
        err.response?.data?.message ||
          err.message ||
          "Failed to update order status",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const activeOrders = orders.filter(
    (o) =>
      !["delivered", "cancelled", "returned"].includes(
        (o.status || "").toLowerCase(),
      ),
  );

  const filteredOrders =
    activeFilter === "all"
      ? orders
      : orders.filter((o) => (o.status || "").toLowerCase() === activeFilter);

  const countOf = (key) =>
    key === "all"
      ? orders.length
      : orders.filter((o) => (o.status || "").toLowerCase() === key).length;

  const renderActions = (order) => {
    const isUpdating = updatingId === order._id;
    const spinner = (
      <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
    );

    if (order.status === "Placed") {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateStatus(order._id, "Accepted")}
            disabled={isUpdating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? spinner : "✓"} Accept
          </button>
          <button
            type="button"
            onClick={() => updateStatus(order._id, "Cancelled")}
            disabled={isUpdating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-red-50 text-red-500 border border-red-200 text-xs font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? spinner : "✕"} Reject
          </button>
        </div>
      );
    }

    if (order.status === "Accepted" || order.status === "Preparing") {
      return (
        <div className="flex flex-wrap gap-2">
          {order.status !== "Preparing" && (
            <button
              type="button"
              onClick={() => updateStatus(order._id, "Preparing")}
              disabled={isUpdating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-orange-50 text-orange-600 border border-orange-200 text-xs font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? spinner : "🍳"} Mark preparing
            </button>
          )}
          <button
            type="button"
            onClick={() => updateStatus(order._id, "Ready for Pickup")}
            disabled={isUpdating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold rounded-xl shadow-sm shadow-purple-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? spinner : "🛍️"} Ready for pickup
          </button>
        </div>
      );
    }
    return null;
  };

  const OrderCard = ({ order, idx }) => {
    const { cls, dot, bar } = statusConfig(order.status);
    const isDone = ["delivered", "cancelled", "returned"].includes(
      (order.status || "").toLowerCase(),
    );
    return (
      <div
        className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden animate-[fadeUp_0.4s_ease_both]"
        style={{ animationDelay: `${Math.min(idx * 50, 300)}ms` }}
      >
        <div className={`h-1 w-full ${bar}`} />
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <div
                  className="w-7 h-7 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center font-black text-xs text-red-500 shrink-0"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {order.user?.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <p
                  className="font-black text-gray-900 text-sm tracking-tight truncate"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {order.user?.name ?? "Customer"}
                </p>
              </div>
              {order.user?.phone && (
                <p className="text-xs text-gray-400 ml-9">{order.user.phone}</p>
              )}
              {order.createdAt && (
                <p className="text-[11px] text-gray-300 ml-9 mt-0.5">
                  {new Date(order.createdAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              )}
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 ${cls}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
              {order.status}
            </span>
          </div>

          <div className="h-px bg-gray-100 mb-3" />

          {/* Items */}
          {order.items?.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Items
              </p>
              <div className="flex flex-wrap gap-1.5">
                {order.items.map((item) => (
                  <span
                    key={item._id}
                    className="bg-gray-50 border border-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    {item.name} × {item.quantity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Amount + payment */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                Order total
              </p>
              <p
                className="text-lg font-black text-gray-900 tracking-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                ₹{order.totalAmount}
              </p>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${order.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
            >
              {order.paymentStatus}
            </span>
          </div>

          {/* Delivery address */}
          {order.user?.address && (
            <div className="flex items-start gap-1.5 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 mb-4">
              <svg
                className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              <p className="text-xs text-gray-500 leading-snug">
                {order.user.address}
              </p>
            </div>
          )}

          {/* Actions */}
          {!isDone ? (
            renderActions(order)
          ) : (
            <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Order closed
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-0.5">
            Restaurant
          </p>
          <h1
            className="text-2xl font-black text-gray-900 tracking-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Incoming Orders
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Accept, prepare, and mark orders ready for pickup.
          </p>
        </div>
        {!loading && !error && (
          <div className="flex items-center gap-2">
            <span className="bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full">
              {activeOrders.length} active
            </span>
            <button
              type="button"
              onClick={fetchOrders}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
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
        )}
      </div>

      {/* ── Filter bar ── */}
      {!loading && !error && orders.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {FILTERS.map(({ key, label, dot }) => {
            const count = countOf(key);
            const isActive = activeFilter === key;
            // Hide filters with 0 orders (except "All")
            if (key !== "all" && count === 0) return null;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveFilter(key)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 border
                  ${
                    isActive
                      ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-white" : dot}`}
                />
                {label}
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center
                  ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          <OrderSkeleton />
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="font-bold text-gray-800 mb-1">Something went wrong</p>
          <p className="text-sm text-gray-400 mb-5">{error}</p>
          <button
            type="button"
            onClick={fetchOrders}
            className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition"
          >
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
          <div className="text-5xl mb-4">🍽️</div>
          <p
            className="font-black text-gray-800 text-lg mb-1"
            style={{ fontFamily: "Georgia, serif" }}
          >
            No orders yet
          </p>
          <p className="text-sm text-gray-400">
            Incoming orders will appear here in real time.
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-14 px-6 text-center shadow-sm">
          <div className="text-4xl mb-3">🔍</div>
          <p
            className="font-black text-gray-700 text-base mb-1"
            style={{ fontFamily: "Georgia, serif" }}
          >
            No orders found
          </p>
          <p className="text-sm text-gray-400 mb-4">
            No orders match the selected filter.
          </p>
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order, idx) => (
            <OrderCard key={order._id} order={order} idx={idx} />
          ))}
        </div>
      )}
    </div>
  );
}

export default OwnerOrders;
