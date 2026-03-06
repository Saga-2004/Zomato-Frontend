import { useEffect, useState } from "react";
import API from "../../api/axios";

const STATUS_OPTIONS = [
  "Placed",
  "Accepted",
  "Preparing",
  "Ready for Pickup",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Returned",
  "Refunded",
];

const statusMeta = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "delivered")
    return {
      cls: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      dot: "bg-emerald-500",
    };
  if (s === "cancelled")
    return {
      cls: "bg-red-100 text-red-700 border border-red-200",
      dot: "bg-red-500",
    };
  if (s === "refunded")
    return {
      cls: "bg-purple-100 text-purple-700 border border-purple-200",
      dot: "bg-purple-500",
    };
  if (s === "returned")
    return {
      cls: "bg-orange-100 text-orange-700 border border-orange-200",
      dot: "bg-orange-500",
    };
  if (s === "out for delivery")
    return {
      cls: "bg-blue-100 text-blue-700 border border-blue-200",
      dot: "bg-blue-500",
    };
  if (s === "pending" || s === "placed")
    return {
      cls: "bg-amber-100 text-amber-700 border border-amber-200",
      dot: "bg-amber-500",
    };
  return {
    cls: "bg-gray-100 text-gray-600 border border-gray-200",
    dot: "bg-gray-400",
  };
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get("/admin/orders");
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
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!newStatus) return;
    setUpdatingId(orderId);
    try {
      await API.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)),
      );
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message: err.response?.data?.message || "Failed to update status",
            type: "error",
          },
        }),
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRefund = async (orderId) => {
    if (!window.confirm("Process refund for this order?")) return;
    setUpdatingId(orderId);
    try {
      const res = await API.put(`/admin/orders/${orderId}/refund`);
      const updated = res.data?.order;
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, ...updated } : o)),
      );
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message: err.response?.data?.message || "Failed to process refund",
            type: "error",
          },
        }),
      );
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders
    .filter(
      (o) =>
        statusFilter === "all" ||
        o.status?.toLowerCase() === statusFilter.toLowerCase(),
    )
    .filter(
      (o) =>
        !search ||
        o.restaurant?.restaurant_name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.email?.toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-0.5">
            Management
          </p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            All Orders
          </h1>
        </div>
        <button
          type="button"
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-100 text-sm text-gray-500 hover:text-red-500 hover:border-red-200 shadow-sm transition-all"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg
            className="w-4 h-4 text-gray-300 absolute left-3.5 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search restaurant or customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-700 placeholder-gray-300 shadow-sm focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-50 transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-600 shadow-sm focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-50 transition"
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Summary chips */}
      {!loading && !error && (
        <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
          <span className="font-semibold text-gray-700">{filtered.length}</span>{" "}
          orders shown
          {statusFilter !== "all" && (
            <button
              onClick={() => setStatusFilter("all")}
              className="text-red-400 hover:text-red-600 hover:underline"
            >
              × Clear filter
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 bg-gray-100 rounded-full w-40" />
                  <div className="h-3 bg-gray-100 rounded-full w-64" />
                  <div className="h-3 bg-gray-100 rounded-full w-32" />
                </div>
                <div className="h-7 w-24 bg-gray-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-red-300"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
          </div>
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button
            type="button"
            onClick={fetchOrders}
            className="px-4 py-2 bg-red-500 text-white font-medium text-sm rounded-xl hover:bg-red-600 transition"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <p className="text-gray-400 font-medium">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => {
            const meta = statusMeta(order.status);
            const isUpdating = updatingId === order._id;
            const canRefund =
              (order.status === "Cancelled" || order.status === "Returned") &&
              order.paymentStatus !== "Refunded";

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:border-gray-200 transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                        <svg
                          className="w-4 h-4 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path d="M3 22V11l9-9 9 9v11" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {order.restaurant?.restaurant_name ?? "Restaurant"}
                        </p>
                        <p className="text-gray-500 text-sm mt-0.5">
                          <span className="font-semibold text-gray-700">
                            ₹{order.totalAmount}
                          </span>
                          {order.user?.name && (
                            <span className="text-gray-400">
                              {" "}
                              · {order.user.name}
                            </span>
                          )}
                        </p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                          {order.user?.phone && (
                            <span className="text-gray-400 text-xs">
                              {order.user.phone}
                            </span>
                          )}
                          {order.createdAt && (
                            <span className="text-gray-300 text-xs">
                              {new Date(order.createdAt).toLocaleString()}
                            </span>
                          )}
                          {order.paymentStatus && (
                            <span className="text-xs text-gray-400">
                              Payment:{" "}
                              <span
                                className={
                                  order.paymentStatus === "Paid"
                                    ? "text-emerald-600 font-medium"
                                    : "text-gray-500"
                                }
                              >
                                {order.paymentStatus}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${meta.cls}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${meta.dot}`}
                      />
                      {order.status}
                    </span>
                    <div className="relative">
                      <select
                        className="appearance-none pl-3 pr-7 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-50 transition cursor-pointer disabled:opacity-50"
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        disabled={isUpdating}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {isUpdating ? (
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg
                          className="w-3 h-3 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          viewBox="0 0 24 24"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      )}
                    </div>
                    {canRefund && (
                      <button
                        type="button"
                        onClick={() => handleRefund(order._id)}
                        disabled={isUpdating}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition disabled:opacity-50"
                      >
                        Refund
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Orders;
