import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";

function OwnerDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get("/orders/restaurant/analytics");
        setAnalytics(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Owner Dashboard</h1>
      <p className="text-gray-600 mb-6">Manage your restaurant.</p>

      {loading ? (
        <p className="text-gray-500 mb-6">Loading analytics…</p>
      ) : analytics ? (
        <>
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
                Revenue
              </p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                ₹{analytics.totalRevenue ?? 0}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Refunds
              </p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                ₹{analytics.totalRefunds ?? 0}
              </p>
            </div>
          </div>

          {analytics.dailySummary?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                Last 7 days
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-7 gap-2 text-xs">
                {analytics.dailySummary.map((d) => (
                  <div
                    key={d.date}
                    className="rounded-lg border border-gray-100 p-2 bg-gray-50"
                  >
                    <p className="font-medium text-gray-800">{d.date}</p>
                    <p className="text-gray-600">
                      Orders:{" "}
                      <span className="font-semibold">{d.totalOrders}</span>
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
        </>
      ) : (
        <p className="text-gray-500 mb-6">
          No analytics available for your restaurant yet.
        </p>
      )}
    </div>
  );
}

export default OwnerDashboard;
