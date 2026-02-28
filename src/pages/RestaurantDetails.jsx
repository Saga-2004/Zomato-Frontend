import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Button from "../components/Button";

function RestaurantDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [restaurant, setRestaurant] = useState(
    location.state?.restaurant || null,
  );
  const [menuItems, setMenuItems] = useState([]);
  const [addingId, setAddingId] = useState(null);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [loading, setLoading] = useState(true);
  const [restaurantLoading, setRestaurantLoading] = useState(!restaurant);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState(""); // "asc" or "desc"
  const [ratingValue, setRatingValue] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);

  const userInfo =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("userInfo") || "null")
      : null;

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const response = await API.get(`/menu/${id}`);
        setMenuItems(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [id]);

  useEffect(() => {
    if (restaurant) {
      setRestaurantLoading(false);
      return;
    }

    const fetchRestaurant = async () => {
      setRestaurantLoading(true);
      try {
        const res = await API.get(`/restaurants/${id}`);
        setRestaurant(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setRestaurantLoading(false);
      }
    };
    fetchRestaurant();
  }, [id, restaurant]);

  // whenever menu items update, clear filter back to all and reset sort
  useEffect(() => {
    setSelectedCategory("All");
    setSortOrder("");
  }, [menuItems]);

  // auto-hide toast after a short delay
  useEffect(() => {
    if (!toast.visible) return;
    const t = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
    return () => clearTimeout(t);
  }, [toast.visible]);

  const addToCart = async (menuItemId) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo) {
      setToast({
        visible: true,
        message: "Please login/signup first to add items to cart.",
        type: "error",
      });
      return;
    }
    if (userInfo.role !== "customer") {
      setToast({
        visible: true,
        message: "Please login as a customer to add items to cart.",
        type: "error",
      });
      return;
    }

    setAddingId(menuItemId);
    try {
      await API.post("/cart", { menuItemId, quantity: 1 });
      // notify navbar / other components that cart changed
      window.dispatchEvent(new Event("cartUpdated"));
      setToast({
        visible: true,
        message: "Item added to cart",
        type: "success",
      });
    } catch (error) {
      setToast({
        visible: true,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to add item to cart",
        type: "error",
      });
    } finally {
      setAddingId(null);
    }
  };

  const handleSubmitRating = async () => {
    if (!userInfo) {
      setToast({
        visible: true,
        message: "Please login as a customer to rate this restaurant.",
        type: "error",
      });
      return;
    }
    if (userInfo.role !== "customer") {
      setToast({
        visible: true,
        message: "Only customers can submit ratings.",
        type: "error",
      });
      return;
    }
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      setToast({
        visible: true,
        message: "Please select a rating between 1 and 5 stars.",
        type: "error",
      });
      return;
    }

    try {
      setSubmittingRating(true);
      await API.post("/ratings", {
        restaurantId: id,
        rating: ratingValue,
      });
      setToast({
        visible: true,
        message: "Thanks for your rating!",
        type: "success",
      });
      // refresh restaurant to update average rating
      const res = await API.get(`/restaurants/${id}`);
      setRestaurant(res.data);
    } catch (err) {
      setToast({
        visible: true,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to submit rating.",
        type: "error",
      });
    } finally {
      setSubmittingRating(false);
    }
  };

  const averageRating =
    restaurant && typeof restaurant.averageRating === "number"
      ? restaurant.averageRating.toFixed(1)
      : "—";
  const prepMinutes = restaurant?.preparationTime || 30;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8 pb-16">
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-gray-600 hover:text-red-600 font-medium"
          >
            ← Back to home
          </Link>
          {userInfo?.role === "admin" && (
            <Link
              to="/admin/restaurants"
              className="inline-flex items-center gap-1 text-gray-600 hover:text-red-600 font-medium"
            >
              ← Back to admin restaurants
            </Link>
          )}
        </div>

        <section className="mb-6">
          {restaurantLoading && !restaurant ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-4 text-gray-500 text-sm">
              Loading restaurant details…
            </div>
          ) : restaurant ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {restaurant.restaurant_name}
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">
                    {restaurant.restaurant_address}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-sm font-medium px-3 py-1 rounded-full">
                    ★ {averageRating}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                    <span className="text-red-500">⏱</span>
                    <span>Est. {prepMinutes} min</span>
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-1">Rate this restaurant</p>
                    <div className="inline-flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingValue(star)}
                          className={`w-7 h-7 flex items-center justify-center rounded-full border text-sm ${
                            ratingValue >= star
                              ? "bg-yellow-400 border-yellow-500 text-white"
                              : "bg-white border-gray-300 text-gray-600"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleSubmitRating}
                    loading={submittingRating}
                    className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:ring-red-500"
                  >
                    {submittingRating ? "Submitting..." : "Submit rating"}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
          Menu
        </h2>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
            <p className="text-lg">Loading menu…</p>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
            <p className="text-lg">No menu items available.</p>
          </div>
        ) : (
          <>
            {/* category filter */}
            <div className="mb-4 flex flex-col sm:flex-row flex-wrap gap-4 items-center">
              <div>
                <label htmlFor="category" className="mr-2 font-medium">
                  Filter:
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="All">All</option>
                  <option value="veg">Veg</option>
                  <option value="non-veg">Non-veg</option>
                </select>
              </div>
              <div>
                <label htmlFor="sort" className="mr-2 font-medium">
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="">None</option>
                  <option value="asc">Price: low to high</option>
                  <option value="desc">Price: high to low</option>
                </select>
              </div>
            </div>

            {/* grouped menu items */}
            {Array.from(
              new Set(
                // apply filtering before grouping
                menuItems
                  .filter(
                    (i) =>
                      selectedCategory === "All" ||
                      i.category === selectedCategory,
                  )
                  .map((i) => i.category),
              ),
            ).map((cat) => (
              <div key={cat} className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {cat}
                </h3>
                <ul className="space-y-3">
                  {menuItems
                    .filter(
                      (i) =>
                        i.category === cat &&
                        (selectedCategory === "All" ||
                          selectedCategory === cat),
                    )
                    .slice() // create shallow copy to sort
                    .sort((a, b) => {
                      if (sortOrder === "asc") return a.price - b.price;
                      if (sortOrder === "desc") return b.price - a.price;
                      return 0;
                    })
                    .map((item) => (
                      <li
                        key={item._id}
                        className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm hover:shadow-md transition"
                      >
                        <div>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-16 w-16 sm:h-20 sm:w-20 rounded-4xl object-cover hover:border hover:border-red-600 hover:shadow-xl transition"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {item.name}
                          </h4>
                          <p className="text-red-600 font-medium mt-0.5">
                            ₹{item.price}
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => addToCart(item._id)}
                          loading={addingId === item._id}
                          className="shrink-0 text-white px-4 py-2 bg-red-600 hover:bg-red-700 focus:ring-red-500"
                        >
                          {addingId === item._id ? "Adding..." : "Add to cart"}
                        </Button>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </>
        )}
        {/* toast toggle */}
        {toast.visible && (
          <div className="fixed top-20 right-4 z-50">
            <div
              className={`px-4 py-2 rounded-lg shadow-md text-sm ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}
            >
              {toast.message}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default RestaurantDetails;
