import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";

function StarRating({ value }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(value) ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs font-semibold text-gray-500 ml-0.5">
        {Number(value).toFixed(1)}
      </span>
    </div>
  );
}

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [search, setSearch] = useState("");

  const fetchRestaurants = async () => {
    try {
      const response = await API.get("/restaurants");
      setRestaurants(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOffers = async (restaurantId, enable) => {
    setTogglingId(restaurantId);
    try {
      await API.put(`/admin/restaurants/${restaurantId}/offers`, {
        isActive: enable,
      });
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message: enable ? "Offers enabled." : "Offers disabled.",
            type: "success",
          },
        }),
      );
      setRestaurants((prev) =>
        prev.map((r) =>
          r._id === restaurantId ? { ...r, offersActive: enable } : r,
        ),
      );
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message: err.response?.data?.message || "Failed to update offers",
            type: "error",
          },
        }),
      );
    } finally {
      setTogglingId(null);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const filtered = restaurants.filter(
    (r) =>
      !search ||
      r.restaurant_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.restaurant_address?.toLowerCase().includes(search.toLowerCase()),
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
            Restaurants
          </h1>
        </div>
        <Link
          to="/admin/add-restaurant"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Restaurant
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
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
          placeholder="Search restaurants…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-700 placeholder-gray-300 shadow-sm focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-50 transition"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 bg-gray-100 rounded-full w-40" />
                  <div className="h-3 bg-gray-100 rounded-full w-60" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-gray-300"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path d="M3 22V11l9-9 9 9v11" />
            </svg>
          </div>
          <p className="text-gray-400 font-medium">No restaurants found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((restaurant) => {
            const isToggling = togglingId === restaurant._id;
            return (
              <div
                key={restaurant._id}
                className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:border-gray-200 transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl bg-linear-to-br from-orange-100 to-red-100 flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 22V11l9-9 9 9v11" />
                      <path d="M9 22V16h6v6" />
                    </svg>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {restaurant.restaurant_name}
                    </p>
                    {restaurant.restaurant_address && (
                      <p className="text-gray-400 text-sm mt-0.5 truncate flex items-center gap-1">
                        <svg
                          className="w-3 h-3 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <circle cx="12" cy="11" r="3" />
                        </svg>
                        {restaurant.restaurant_address}
                      </p>
                    )}
                    {restaurant.averageRating != null && (
                      <div className="mt-1.5">
                        <StarRating value={restaurant.averageRating} />
                      </div>
                    )}
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                    <Link
                      to={`/restaurant/${restaurant._id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                        <rect x="9" y="3" width="6" height="4" rx="1" />
                      </svg>
                      View menu
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleOffers(restaurant._id, true)}
                      disabled={isToggling}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition disabled:opacity-50"
                    >
                      {isToggling ? (
                        <span className="w-3 h-3 border border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path d="M9 12l2 2 4-4" />
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      )}
                      Enable offers
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleOffers(restaurant._id, false)}
                      disabled={isToggling}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition disabled:opacity-50"
                    >
                      {isToggling ? (
                        <span className="w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M4.93 4.93l14.14 14.14" />
                        </svg>
                      )}
                      Disable offers
                    </button>
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

export default Restaurants;
