import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../../api/axios";

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

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm font-medium text-gray-800">{value || "—"}</span>
    </div>
  );
}

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blocking, setBlocking] = useState(false);

  console.log(orders);

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
      setOrders([]);
      console.log(err);
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
        `Are you sure you want to ${user.isBlocked ? "unblock" : "block"} this user?`,
      )
    )
      return;
    setBlocking(true);
    try {
      const res = await API.patch(`/admin/users/${userId}/block`);
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message: res.data?.message || "User status updated.",
            type: "success",
          },
        }),
      );
      await fetchUser();
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message: err.response?.data?.message || "Failed to update user.",
            type: "error",
          },
        }),
      );
    } finally {
      setBlocking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading user…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 font-medium transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Back to users
        </Link>
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <p className="text-red-500 font-medium">User not found.</p>
        </div>
      </div>
    );
  }

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const deliveredCount = orders.filter(
    (o) => o.status?.toLowerCase() === "delivered",
  ).length;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 font-medium transition-colors group"
      >
        <svg
          className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Back to users
      </Link>

      {/* User Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header bar */}
        <div className="h-2 bg-linear-to-r from-red-500 to-orange-400" />
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-red-400 to-orange-400 flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0">
              {initials}
            </div>
            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-xl font-bold text-gray-900">
                      {user.name}
                    </h1>
                    {user.isBlocked && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200 uppercase tracking-wide">
                        Blocked
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-0.5">{user.email}</p>
                  <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    {user.role?.replace("_", " ")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleBlock}
                  disabled={blocking}
                  className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
                    user.isBlocked
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                      : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                  }`}
                >
                  {blocking ? (
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : user.isBlocked ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M4.93 4.93l14.14 14.14" />
                    </svg>
                  )}
                  {blocking
                    ? "Updating…"
                    : user.isBlocked
                      ? "Unblock user"
                      : "Block user"}
                </button>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-50">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">
                    {orders.length}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Total Orders</p>
                </div>
                <div className="text-center border-x border-gray-100">
                  <p className="text-xl font-bold text-emerald-600">
                    {deliveredCount}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Delivered</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">
                    ₹{totalSpent}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Total Spent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Order History
          </h2>
          <span className="text-xs text-gray-400">{orders.length} orders</span>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-gray-300"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
              </svg>
            </div>
            <p className="text-gray-400 font-medium">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => {
              const meta = statusMeta(order.status);
              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-gray-200 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">
                      {order.restaurant?.restaurant_name ?? "Restaurant"},{" "}
                      <span>{order.restaurant.restaurant_address}</span>
                    </p>
                    <p>
                      Items: {order.items.map((item) => item.name).join(", ")}
                    </p>
                    <p className="text-gray-400 text-sm font-medium mt-0.5">
                      ₹{order.totalAmount}
                    </p>
                    {order.createdAt && (
                      <p className="text-gray-300 text-xs mt-1">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 self-start sm:self-center inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${meta.cls}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                    {order.status}
                  </span>
                  <span
                    className={`shrink-0 self-start sm:self-center inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${meta.cls}`}
                  >
                    Payment({order.paymentStatus})
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDetail;
