import { useEffect, useState } from "react";
import API from "../../api/axios";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

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
      console.error(err);
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
            message:
              err.response?.data?.message ||
              err.message ||
              "Failed to process refund",
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

  const statusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "delivered") return "bg-green-100 text-green-800";
    if (s === "cancelled") return "bg-red-100 text-red-800";
    if (s === "pending" || s === "placed") return "bg-amber-100 text-amber-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All Orders</h1>

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
          No orders found.
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li
              key={order._id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">
                  {order.restaurant?.name ?? "Restaurant"}
                </p>
                <p className="text-gray-500 text-sm mt-0.5">
                  ₹{order.totalAmount}
                  {order.user?.name && ` · ${order.user.name}`}
                  {order.user?.email && ` (${order.user.email})`}
                </p>
                {order.createdAt && (
                  <p className="text-gray-400 text-xs mt-0.5">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                )}
                {order.paymentStatus && (
                  <p className="text-gray-400 text-xs mt-0.5">
                    Payment: {order.paymentStatus}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`shrink-0 text-sm font-medium px-3 py-1 rounded-full ${statusColor(order.status)}`}
                >
                  {order.status}
                </span>
                <select
                  className="text-sm border rounded-lg px-2 py-1"
                  value={order.status}
                  onChange={(e) =>
                    handleStatusChange(order._id, e.target.value)
                  }
                  disabled={updatingId === order._id}
                >
                  <option value="Placed">Placed</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready for Pickup">Ready for Pickup</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Returned">Returned</option>
                  <option value="Refunded">Refunded</option>
                </select>
                {(order.status === "Cancelled" ||
                  order.status === "Returned") &&
                  order.paymentStatus !== "Refunded" && (
                    <button
                      type="button"
                      onClick={() => handleRefund(order._id)}
                      disabled={updatingId === order._id}
                      className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline"
                    >
                      Refund
                    </button>
                  )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Orders;
