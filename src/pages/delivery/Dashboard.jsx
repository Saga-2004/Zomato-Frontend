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
  if (s === "cancelled" || s === "returned")
    return {
      cls: "bg-red-50 text-red-600 border border-red-200",
      dot: "bg-red-500",
      bar: "bg-red-400",
    };
  if (s === "out for delivery")
    return {
      cls: "bg-blue-50 text-blue-700 border border-blue-200",
      dot: "bg-blue-500 animate-pulse",
      bar: "bg-blue-400",
    };
  if (s === "ready for pickup")
    return {
      cls: "bg-amber-50 text-amber-700 border border-amber-200",
      dot: "bg-amber-400 animate-pulse",
      bar: "bg-amber-400",
    };
  return {
    cls: "bg-gray-100 text-gray-600 border border-gray-200",
    dot: "bg-gray-400 animate-pulse",
    bar: "bg-gray-200",
  };
}

function OrderSkeleton() {
  return Array.from({ length: 3 }).map((_, i) => (
    <div
      key={i}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
    >
      <div className="h-1 bg-gray-100 w-full" />
      <div className="p-5 space-y-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded-full w-44" />
            <div className="h-3 bg-gray-100 rounded-full w-32" />
          </div>
          <div className="h-6 bg-gray-100 rounded-full w-24" />
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-100 rounded-full w-20" />
          <div className="h-6 bg-gray-100 rounded-full w-28" />
        </div>
      </div>
    </div>
  ));
}

function DeliveryDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/orders/delivery");
      setOrders(res.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load assigned orders",
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
      const res = await API.put(`/orders/${orderId}/delivery-status`, {
        status,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: res.data.status } : o,
        ),
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

  const claimOrder = async (orderId) => {
    setUpdatingId(orderId);
    try {
      const res = await API.put(`/orders/${orderId}/claim`);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, ...res.data } : o)),
      );
    } catch (err) {
      toast(
        err.response?.data?.message || err.message || "Failed to claim order",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const delivered = orders.filter(
    (o) => o.status?.toLowerCase() === "delivered",
  ).length;
  const active = orders.filter(
    (o) =>
      !["delivered", "cancelled", "returned"].includes(
        (o.status || "").toLowerCase(),
      ),
  ).length;

  return (
    <div>
      {/* Page header */}
      <div className="mb-7">
        <p className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-0.5">
          Overview
        </p>
        <h1
          className="text-2xl font-black text-gray-900 tracking-tight"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Delivery Dashboard
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Manage your assigned orders and update statuses.
        </p>
      </div>

      {/* Stat cards */}
      {!loading && !error && (
        <div className="grid grid-cols-3 gap-3 mb-7">
          {[
            {
              label: "Total",
              value: orders.length,
              color: "text-gray-900",
              bg: "bg-white",
            },
            {
              label: "Active",
              value: active,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Delivered",
              value: delivered,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
          ].map(({ label, value, color, bg }) => (
            <div
              key={label}
              className={`${bg} rounded-2xl border border-gray-100 px-4 py-3.5 text-center shadow-sm`}
            >
              <p
                className={`text-2xl font-black tracking-tight ${color}`}
                style={{ fontFamily: "Georgia, serif" }}
              >
                {value}
              </p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                {label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
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
          <div className="text-5xl mb-4">🛵</div>
          <p
            className="font-black text-gray-800 text-lg mb-1"
            style={{ fontFamily: "Georgia, serif" }}
          >
            No orders yet
          </p>
          <p className="text-sm text-gray-400">
            Assigned orders will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, idx) => {
            const { cls, dot, bar } = statusConfig(order.status);
            const isAssigned = Boolean(order.deliveryPartner);
            const isUpdating = updatingId === order._id;
            const isReadyForPickup =
              (order.status || "").toLowerCase() === "ready for pickup";
            const isDone = ["delivered", "cancelled", "returned"].includes(
              (order.status || "").toLowerCase(),
            );

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden animate-[fadeUp_0.4s_ease_both]"
                style={{ animationDelay: `${Math.min(idx * 50, 300)}ms` }}
              >
                {/* Status color bar */}
                <div className={`h-1 w-full ${bar}`} />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <h2
                        className="font-black text-gray-900 text-base tracking-tight truncate"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        {order.restaurant?.restaurant_name ?? "Restaurant"}
                      </h2>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {order.restaurant?.restaurant_address}
                      </p>
                      {order.createdAt && (
                        <p className="text-[11px] text-gray-300 mt-0.5">
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
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`}
                      />
                      {order.status}
                    </span>
                  </div>

                  <div className="h-px bg-gray-100 mb-3" />

                  {/* Items */}
                  <div className="mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                      Items
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {order.items?.map((item) => (
                        <span
                          key={item._id}
                          className="bg-gray-50 border border-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full"
                        >
                          {item.name} × {item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-gray-100 mb-3" />

                  {/* Customer + Amount */}
                  <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center font-black text-sm text-red-500 shrink-0"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        {order.user?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {order.user?.name ?? "Customer"}
                        </p>
                        {order.user?.phone && (
                          <p className="text-xs text-gray-400">
                            {order.user.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className="font-black text-gray-900 text-base"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        ₹{order.totalAmount}
                      </p>
                      <p
                        className={`text-xs font-semibold ${order.paymentStatus === "Paid" ? "text-emerald-600" : "text-red-500"}`}
                      >
                        {order.paymentStatus}
                      </p>
                    </div>
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

                  {/* Action buttons */}
                  {!isDone && (
                    <div className="flex flex-wrap gap-2">
                      {!isAssigned && isReadyForPickup ? (
                        <button
                          type="button"
                          onClick={() => claimOrder(order._id)}
                          disabled={isUpdating}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-200"
                        >
                          {isUpdating ? (
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <span>🙋</span>
                          )}
                          Claim order
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              updateStatus(order._id, "Out for Delivery")
                            }
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdating ? (
                              <span className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                            ) : (
                              <span>🛵</span>
                            )}
                            Picked up
                          </button>
                          <button
                            type="button"
                            onClick={() => updateStatus(order._id, "Delivered")}
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-200"
                          >
                            {isUpdating ? (
                              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <span>✓</span>
                            )}
                            Delivered
                          </button>
                          <button
                            type="button"
                            onClick={() => updateStatus(order._id, "Returned")}
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-red-50 text-red-500 border border-red-200 text-xs font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdating ? (
                              <span className="w-3 h-3 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
                            ) : (
                              <span>↩</span>
                            )}
                            Returned
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {isDone && (
                    <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Order closed
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DeliveryDashboard;
