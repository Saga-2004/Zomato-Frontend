import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../../api/axios";

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blocking, setBlocking] = useState(false);

  const fetchUser = async () => {
    try {
      const response = await API.get(`/admin/users/${userId}`);
      setUser(response.data);
    } catch (err) {
      console.error(err);
      setUser(null);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await API.get(`/admin/users/${userId}/orders`);
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
      setOrders([]);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchUser(), fetchOrders()]);
      setLoading(false);
    };
    if (userId) load();
  }, [userId]);

  const handleBlock = async () => {
    if (
      !window.confirm(
        "Are you sure you want to block this user? They will not be able to login again.",
      )
    )
      return;
    setBlocking(true);
    try {
      const res = await API.patch(`/admin/users/${userId}/block`);
      setUser((prev) =>
        prev ? { ...prev, isBlocked: res.data?.user?.isBlocked ?? true } : null,
      );
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message:
              res.data?.message ||
              "User block status has been updated successfully.",
            type: "success",
          },
        }),
      );
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message: err.response?.data?.message || "Failed to block user.",
            type: "error",
          },
        }),
      );
    } finally {
      setBlocking(false);
    }
  };

  const statusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "delivered") return "bg-green-100 text-green-800";
    if (s === "cancelled") return "bg-red-100 text-red-800";
    if (s === "pending" || s === "placed") return "bg-amber-100 text-amber-800";
    return "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          Loading…
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <p className="text-red-600">User not found.</p>
        <Link
          to="/admin/users"
          className="text-red-600 font-medium hover:underline mt-2 inline-block"
        >
          ← Back to users
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1 text-gray-600 hover:text-red-600 font-medium mb-6"
      >
        ← Back to users
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-600 mt-0.5">{user.email}</p>
            <p className="text-gray-500 text-sm mt-1">
              Role:{" "}
              <span className="font-medium text-gray-700">{user.role}</span>
            </p>
            {user.isBlocked && (
              <span className="inline-block mt-2 text-sm font-medium px-3 py-1 rounded-full bg-red-100 text-red-800">
                Blocked
              </span>
            )}
          </div>
          {!user.isBlocked && (
            <button
              type="button"
              onClick={handleBlock}
              disabled={blocking}
              className="shrink-0 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
            >
              {blocking ? "Blocking…" : "Block user"}
            </button>
          )}
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Orders</h2>
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No orders for this user.
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
                </p>
                {order.createdAt && (
                  <p className="text-gray-400 text-xs mt-0.5">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 text-sm font-medium px-3 py-1 rounded-full ${statusColor(order.status)}`}
              >
                {order.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserDetail;
