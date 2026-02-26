import { useEffect, useState } from "react";
import API from "../../api/axios";

function OwnerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

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
      console.error(err);
      setError(
        err.response?.data?.message || err.message || "Failed to load orders",
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const statusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "delivered") return "bg-green-100 text-green-800";
    if (s === "cancelled") return "bg-red-100 text-red-800";
    if (s === "pending" || s === "placed") return "bg-amber-100 text-amber-800";
    return "bg-gray-100 text-gray-800";
  };

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      const res = await API.put(`/orders/${orderId}/status`, { status });
      const updated = res.data;
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, ...updated } : o)),
      );
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message:
              err.response?.data?.message ||
              err.message ||
              "Failed to update order status",
            type: "error",
          },
        }),
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const renderActions = (order) => {
    // Accept / Reject + preparation flow
    if (order.status === "Placed") {
      return (
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            type="button"
            onClick={() => updateStatus(order._id, "Accepted")}
            disabled={updatingId === order._id}
            className="px-3 py-1 text-xs font-medium rounded-full border border-green-500 text-green-700 hover:bg-green-50"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => updateStatus(order._id, "Cancelled")}
            disabled={updatingId === order._id}
            className="px-3 py-1 text-xs font-medium rounded-full border border-red-500 text-red-700 hover:bg-red-50"
          >
            Reject
          </button>
        </div>
      );
    }

    if (order.status === "Accepted" || order.status === "Preparing") {
      return (
        <div className="flex flex-wrap gap-2 mt-2">
          {order.status !== "Preparing" && (
            <button
              type="button"
              onClick={() => updateStatus(order._id, "Preparing")}
              disabled={updatingId === order._id}
              className="px-3 py-1 text-xs font-medium rounded-full border border-amber-500 text-amber-700 hover:bg-amber-50"
            >
              Mark preparing
            </button>
          )}
          <button
            type="button"
            onClick={() => updateStatus(order._id, "Ready for Pickup")}
            disabled={updatingId === order._id}
            className="px-3 py-1 text-xs font-medium rounded-full border border-blue-500 text-blue-700 hover:bg-blue-50"
          >
            Ready for pickup
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Incoming Orders</h1>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          Loading orders…
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            type="button"
            onClick={fetchOrders}
            className="bg-red-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No incoming orders yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li
              key={order._id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">
                    {order.user?.name ?? "Customer"}
                  </p>
                  <p className="text-gray-500 text-sm mt-0.5">
                    ₹{order.totalAmount}
                    {order.restaurant?.name && ` · ${order.restaurant.name}`}
                  </p>
                  {order.createdAt && (
                    <p className="text-gray-400 text-xs mt-0.5">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 text-sm font-medium px-3 py-1 rounded-full ${statusColor(
                    order.status,
                  )}`}
                >
                  {order.status}
                </span>
              </div>
              {renderActions(order)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default OwnerOrders;
