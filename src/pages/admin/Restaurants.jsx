import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

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
            message: enable
              ? "Offers enabled for this restaurant."
              : "Offers disabled for this restaurant.",
            type: "success",
          },
        }),
      );
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message:
              err.response?.data?.message ||
              err.message ||
              "Failed to update offers for this restaurant",
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Manage Restaurants
      </h1>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          Loading restaurants…
        </div>
      ) : restaurants.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No restaurants found.
        </div>
      ) : (
        <ul className="space-y-3">
          {restaurants.map((restaurant) => (
            <li
              key={restaurant._id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">
                  {restaurant.restaurant_name}
                </p>
                <p className="text-gray-500 text-sm mt-0.5">
                  {restaurant.restaurant_address ?? "—"}
                </p>
                {restaurant.averageRating != null && (
                  <p className="text-gray-500 text-sm mt-0.5">
                    Rating: {restaurant.averageRating}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to={`/restaurant/${restaurant._id}`}
                  className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
                >
                  View menu
                </Link>
                <button
                  type="button"
                  onClick={() => toggleOffers(restaurant._id, true)}
                  disabled={togglingId === restaurant._id}
                  className="text-xs font-medium text-green-600 hover:text-green-700 hover:underline"
                >
                  Enable offers
                </button>
                <button
                  type="button"
                  onClick={() => toggleOffers(restaurant._id, false)}
                  disabled={togglingId === restaurant._id}
                  className="text-xs font-medium text-amber-600 hover:text-amber-700 hover:underline"
                >
                  Disable offers
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Restaurants;
