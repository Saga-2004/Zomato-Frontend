import { useEffect, useState } from "react";
import API from "../../api/axios";

const STAT_CARDS = [
  {
    key: "totalOrders",
    label: "Total Orders",
    color: "text-gray-900",
    bg: "bg-white",
    icon: "📦",
  },
  {
    key: "deliveredOrders",
    label: "Delivered",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    icon: "✅",
  },
  {
    key: "cancelledOrders",
    label: "Cancelled",
    color: "text-red-500",
    bg: "bg-red-50",
    icon: "❌",
  },
  {
    key: "returnedOrders",
    label: "Returned",
    color: "text-amber-600",
    bg: "bg-amber-50",
    icon: "↩️",
  },
  {
    key: "totalRevenue",
    label: "Revenue",
    color: "text-gray-900",
    bg: "bg-white",
    icon: "💰",
    prefix: "₹",
  },
  {
    key: "totalRefunds",
    label: "Refunds",
    color: "text-gray-500",
    bg: "bg-gray-50",
    icon: "🔄",
    prefix: "₹",
  },
];

function StatSkeleton() {
  return Array.from({ length: 6 }).map((_, i) => (
    <div
      key={i}
      className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
    >
      <div className="h-3 bg-gray-100 rounded-full w-2/3 mb-3" />
      <div className="h-7 bg-gray-100 rounded-full w-1/2" />
    </div>
  ));
}

function DaySkeleton() {
  return Array.from({ length: 7 }).map((_, i) => (
    <div
      key={i}
      className="bg-gray-50 rounded-xl border border-gray-100 p-3 animate-pulse space-y-2"
    >
      <div className="h-3 bg-gray-100 rounded-full w-3/4" />
      <div className="h-2.5 bg-gray-100 rounded-full w-1/2" />
      <div className="h-2.5 bg-gray-100 rounded-full w-2/3" />
    </div>
  ));
}

function OwnerDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/orders/restaurant/analytics")
      .then((res) => setAnalytics(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
          Owner Dashboard
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Your restaurant's performance at a glance.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {loading ? (
          <StatSkeleton />
        ) : analytics ? (
          STAT_CARDS.map(({ key, label, color, bg, icon, prefix }, idx) => (
            <div
              key={key}
              className={`${bg} rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-[fadeUp_0.4s_ease_both]`}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10.5px] font-bold uppercase tracking-widest text-gray-400">
                  {label}
                </p>
                <span className="text-base">{icon}</span>
              </div>
              <p
                className={`text-2xl font-black tracking-tight ${color}`}
                style={{ fontFamily: "Georgia, serif" }}
              >
                {prefix ?? ""}
                {analytics[key] ?? 0}
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white border-2 border-dashed border-gray-100 rounded-2xl py-12 text-center">
            <div className="text-4xl mb-3">📊</div>
            <p
              className="font-black text-gray-700 text-base mb-1"
              style={{ fontFamily: "Georgia, serif" }}
            >
              No analytics yet
            </p>
            <p className="text-sm text-gray-400">
              Data will appear once orders start coming in.
            </p>
          </div>
        )}
      </div>

      {/* Daily summary */}
      {(loading || analytics?.dailySummary?.length > 0) && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2
              className="font-black text-gray-900 tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Last 7 Days
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Daily order and revenue summary
            </p>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {loading ? (
                <DaySkeleton />
              ) : (
                analytics.dailySummary.map((d, idx) => {
                  const dateObj = new Date(d.date);
                  const dayName = dateObj.toLocaleDateString("en-IN", {
                    weekday: "short",
                  });
                  const dayDate = dateObj.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  });
                  const isToday =
                    new Date().toDateString() === dateObj.toDateString();
                  return (
                    <div
                      key={d.date}
                      className={`rounded-xl border p-3 animate-[fadeUp_0.4s_ease_both]
                        ${
                          isToday
                            ? "bg-red-50 border-red-200"
                            : "bg-gray-50 border-gray-100"
                        }`}
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <p
                        className={`text-[11px] font-bold uppercase tracking-wider mb-0.5 ${isToday ? "text-red-500" : "text-gray-400"}`}
                      >
                        {dayName}
                      </p>
                      <p
                        className={`text-xs font-semibold mb-2 ${isToday ? "text-red-400" : "text-gray-400"}`}
                      >
                        {dayDate}
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] text-gray-400">
                            Orders
                          </span>
                          <span
                            className="text-xs font-black text-gray-800"
                            style={{ fontFamily: "Georgia, serif" }}
                          >
                            {d.totalOrders}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] text-gray-400">
                            Revenue
                          </span>
                          <span
                            className="text-xs font-black text-emerald-600"
                            style={{ fontFamily: "Georgia, serif" }}
                          >
                            ₹{d.totalRevenue}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
