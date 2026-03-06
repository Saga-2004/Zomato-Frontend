import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";

const StatCard = ({
  label,
  value,
  color = "text-gray-900",
  icon,
  delay = 0,
}) => (
  <div
    className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-start justify-between mb-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
        {label}
      </p>
      {icon && (
        <span className="w-8 h-8 rounded-xl bg-gray-50 group-hover:bg-red-50 flex items-center justify-center transition-colors duration-200">
          {icon}
        </span>
      )}
    </div>
    <p className={`text-3xl font-bold tracking-tight ${color}`}>{value}</p>
  </div>
);

const QuickLink = ({ to, title, description, icon }) => (
  <Link
    to={to}
    className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:border-red-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex items-start gap-4 block"
  >
    <div className="w-10 h-10 rounded-xl bg-red-50 group-hover:bg-red-500 flex items-center justify-center shrink-0 transition-colors duration-300">
      <span className="text-red-500 group-hover:text-white transition-colors duration-300">
        {icon}
      </span>
    </div>
    <div>
      <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
        {title}
      </h3>
      <p className="text-gray-400 text-sm mt-0.5">{description}</p>
    </div>
    <svg
      className="w-4 h-4 text-gray-300 group-hover:text-red-400 ml-auto mt-1 transition-all duration-300 group-hover:translate-x-1"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  </Link>
);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">
            Loading dashboard…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-1">
            Admin Panel
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {welcome?.admin?.name
              ? `Welcome back, ${welcome.admin.name}`
              : (welcome?.message ?? "Dashboard")}
          </h1>
          {welcome?.admin?.email && (
            <p className="text-gray-400 text-sm mt-1">
              {welcome.admin.email} · Manage your platform
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          System online
        </div>
      </div>

      {/* Analytics Stats */}
      {analytics && (
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Overview
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard
              label="Total Orders"
              value={analytics.totalOrders ?? 0}
              delay={0}
              icon={
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                </svg>
              }
            />
            <StatCard
              label="Delivered"
              value={analytics.deliveredOrders ?? 0}
              color="text-emerald-600"
              delay={50}
              icon={
                <svg
                  className="w-4 h-4 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              }
            />
            <StatCard
              label="Cancelled"
              value={analytics.cancelledOrders ?? 0}
              color="text-red-600"
              delay={100}
              icon={
                <svg
                  className="w-4 h-4 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
            />
            <StatCard
              label="Returned"
              value={analytics.returnedOrders ?? 0}
              color="text-amber-600"
              delay={150}
              icon={
                <svg
                  className="w-4 h-4 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              }
            />
            <StatCard
              label="Revenue"
              value={`₹${analytics.totalRevenue ?? 0}`}
              color="text-gray-900"
              delay={200}
              icon={
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              }
            />
            <StatCard
              label="Refunds"
              value={`₹${analytics.totalRefunds ?? 0}`}
              color="text-gray-900"
              delay={250}
              icon={
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M9 14l-5-5 5-5M20 20v-7a4 4 0 00-4-4H4" />
                </svg>
              }
            />
          </div>
        </div>
      )}

      {/* Daily Summary */}
      {analytics?.dailySummary?.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Last 7 Days
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 overflow-x-auto">
            <div className="grid grid-cols-7 gap-2 min-w-[480px]">
              {analytics.dailySummary.map((d, i) => {
                const maxOrders = Math.max(
                  ...analytics.dailySummary.map((x) => x.totalOrders || 0),
                );
                const pct =
                  maxOrders > 0 ? ((d.totalOrders || 0) / maxOrders) * 100 : 0;
                return (
                  <div
                    key={d.date}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-full flex flex-col items-center gap-1">
                      <p className="text-xs font-bold text-gray-700">
                        {d.totalOrders}
                      </p>
                      <div
                        className="w-full bg-gray-100 rounded-full overflow-hidden"
                        style={{ height: "48px" }}
                      >
                        <div
                          className="w-full bg-gradient-to-t from-red-500 to-red-300 rounded-full transition-all duration-700"
                          style={{
                            height: `${pct}%`,
                            marginTop: `${100 - pct}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-medium text-gray-500">
                        {d.date?.slice(5)}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        ₹{d.totalRevenue}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickLink
            to="/admin/users"
            title="Users"
            description="View and manage users"
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <circle cx="9" cy="7" r="4" />
                <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
              </svg>
            }
          />
          <QuickLink
            to="/admin/orders"
            title="Orders"
            description="Track all orders"
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
              </svg>
            }
          />
          <QuickLink
            to="/admin/restaurants"
            title="Restaurants"
            description="Manage restaurants"
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path d="M3 22V11l9-9 9 9v11" />
                <path d="M9 22V16h6v6" />
              </svg>
            }
          />
          <QuickLink
            to="/admin/add-restaurant"
            title="Add Restaurant"
            description="Create new restaurant"
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
