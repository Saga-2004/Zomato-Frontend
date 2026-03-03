import { useEffect, useState } from "react";
import API from "../../api/axios";

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

      // console.log(orders);
    } catch (err) {
      console.error(err);
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

  const statusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "delivered") return "bg-green-100 text-green-800";
    if (s === "cancelled" || s === "returned") return "bg-red-100 text-red-800";
    if (s === "out for delivery") return "bg-blue-100 text-blue-800";
    if (s === "ready for pickup") return "bg-amber-100 text-amber-800";
    return "bg-amber-100 text-amber-800";
  };

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

  const claimOrder = async (orderId) => {
    setUpdatingId(orderId);
    try {
      const res = await API.put(`/orders/${orderId}/claim`);
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
              "Failed to claim order",
            type: "error",
          },
        }),
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const renderActions = (order) => {
    const isAssigned = Boolean(order.deliveryPartner);

    // Unassigned, ready for pickup -> show claim button
    if (
      !isAssigned &&
      (order.status || "").toLowerCase() === "ready for pickup"
    ) {
      return (
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            type="button"
            onClick={() => claimOrder(order._id)}
            disabled={updatingId === order._id}
            className="px-3 py-1 text-xs font-medium rounded-full border border-blue-500 text-blue-700 hover:bg-blue-50"
          >
            Claim order
          </button>
        </div>
      );
    }

    // Assigned orders -> normal status flow
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        <button
          type="button"
          onClick={() => updateStatus(order._id, "Out for Delivery")}
          disabled={updatingId === order._id}
          className="px-3 py-1 text-xs font-medium rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Picked up
        </button>
        <button
          type="button"
          onClick={() => updateStatus(order._id, "Delivered")}
          disabled={updatingId === order._id}
          className="px-3 py-1 text-xs font-medium rounded-full border border-green-500 text-green-700 hover:bg-green-50"
        >
          Delivered
        </button>
        <button
          type="button"
          onClick={() => updateStatus(order._id, "Returned")}
          disabled={updatingId === order._id}
          className="px-3 py-1 text-xs font-medium rounded-full border border-red-500 text-red-700 hover:bg-red-50"
        >
          Returned to restaurant
        </button>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Delivery Dashboard
      </h1>
      <p className="text-gray-600 mb-6">
        View your assigned orders and update their status.
      </p>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          Loading assigned orders…
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
          No assigned orders right now.
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li
              key={order._id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2 shadow-sm"
            >
              <li
                key={order._id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold text-gray-900 text-lg">
                      {order.restaurant?.restaurant_name ?? "Restaurant"}
                    </h2>

                    <p className="text-xs text-gray-500">
                      {order.restaurant?.restaurant_address}
                    </p>
                    {order.createdAt && (
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Items */}

                <div className="mt-3 text-sm text-gray-600">
                  <p className="font-medium text-gray-700 mb-1">Items</p>

                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                    {order.items?.map((item) => (
                      <span key={item._id} className="text-gray-600">
                        {item.name} ×{item.quantity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Order Info */}

                <div className="mt-3 flex justify-between text-sm">
                  <div>
                    <p className="text-gray-600">
                      Customer:{" "}
                      <span className="font-medium text-gray-800">
                        {order.user?.name ?? "Customer"}
                      </span>
                    </p>

                    {order.user?.phone && (
                      <p className="text-xs text-gray-500">
                        {order.user.phone}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ₹{order.totalAmount}
                    </p>
                    <p
                      className={`text-xs ${
                        order.paymentStatus === "Paid"
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {order.paymentStatus}
                    </p>
                  </div>
                </div>

                {/* Address */}
                {order.user?.address && (
                  <p className="mt-2 text-xs text-gray-500">
                    📍 {order.user.address}{" "}
                  </p>
                )}

                {/* Actions */}

                <div className="mt-3">{renderActions(order)}</div>
              </li>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DeliveryDashboard;
