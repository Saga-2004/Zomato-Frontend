import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";

function AdminDashboard() {
  const [welcome, setWelcome] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, analyticsRes] = await Promise.all([
          API.get("/admin/dashboard"),
          API.get("/admin/analytics"),
        ]);
        setWelcome(dashboardRes.data);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {loading ? (
        <p className="text-gray-500 mb-6">Loading…</p>
      ) : (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {welcome?.admin?.name
              ? `Welcome, ${welcome.admin.name}`
              : (welcome?.message ?? "Admin Dashboard")}
          </h1>
          <p className="text-gray-600">
            {welcome?.admin?.email ? `${welcome.admin.email}` : ""}
            {welcome?.admin?.email ? " · " : ""}
            Manage your platform from here.
          </p>
        </div>
      )}

      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Total orders
            </p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {analytics.totalOrders ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Delivered
            </p>
            <p className="text-2xl font-semibold text-emerald-700 mt-1">
              {analytics.deliveredOrders ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Cancelled
            </p>
            <p className="text-2xl font-semibold text-red-600 mt-1">
              {analytics.cancelledOrders ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Returned
            </p>
            <p className="text-2xl font-semibold text-amber-600 mt-1">
              {analytics.returnedOrders ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Total revenue
            </p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              ₹{analytics.totalRevenue ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Total refunds
            </p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              ₹{analytics.totalRefunds ?? 0}
            </p>
          </div>
        </div>
      )}

      {analytics?.dailySummary?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">
            Last 7 days (orders & revenue)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-7 gap-2 text-xs">
            {analytics.dailySummary.map((d) => (
              <div
                key={d.date}
                className="rounded-lg border border-gray-100 p-2 bg-gray-50"
              >
                <p className="font-medium text-gray-800">{d.date}</p>
                <p className="text-gray-600">
                  Orders: <span className="font-semibold">{d.totalOrders}</span>
                </p>
                <p className="text-gray-600">
                  Revenue:{" "}
                  <span className="font-semibold">₹{d.totalRevenue}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/admin/users"
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-red-200 hover:shadow-md transition block"
          >
            <h3 className="font-semibold text-gray-900">Users</h3>
            <p className="text-gray-500 text-sm mt-1">View and manage users</p>
          </Link>
          <Link
            to="/admin/orders"
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-red-200 hover:shadow-md transition block"
          >
            <h3 className="font-semibold text-gray-900">Orders</h3>
            <p className="text-gray-500 text-sm mt-1">Track all orders</p>
          </Link>
          <Link
            to="/admin/restaurants"
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-red-200 hover:shadow-md transition block"
          >
            <h3 className="font-semibold text-gray-900">Restaurants</h3>
            <p className="text-gray-500 text-sm mt-1">Manage restaurants</p>
          </Link>
          <Link
            to="/admin/add-restaurant"
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-red-200 hover:shadow-md transition block"
          >
            <h3 className="font-semibold text-gray-900">Add Restaurant</h3>
            <p className="text-gray-500 text-sm mt-1">
              Aad new restaurants with Id
            </p>
          </Link>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
