import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";

function RestaurantDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [restaurant, setRestaurant] = useState(
    location.state?.restaurant || null,
  );
  const [menuItems, setMenuItems] = useState([]);
  const [addingId, setAddingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restaurantLoading, setRestaurantLoading] = useState(!restaurant);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("");
  const [ratingValue, setRatingValue] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);

  const userInfo =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("userInfo") || "null")
      : null;

  const toast = (message, type = "success") =>
    window.dispatchEvent(
      new CustomEvent("appToast", { detail: { message, type } }),
    );

  useEffect(() => {
    setLoading(true);
    API.get(`/menu/${id}`)
      .then((r) => {
        setMenuItems(r.data);
        setSelectedCategory("All");
        setSortOrder("");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (restaurant) {
      setRestaurantLoading(false);
      return;
    }
    setRestaurantLoading(true);
    API.get(`/restaurants/${id}`)
      .then((r) => setRestaurant(r.data))
      .catch(console.error)
      .finally(() => setRestaurantLoading(false));
  }, [id, restaurant]);

  // Variant selection state
  const [selectedVariants, setSelectedVariants] = useState({});

  const addToCart = async (menuItemId, variantIdx = null) => {
    if (!userInfo) {
      toast("Please login to add items to cart", "error");
      return;
    }
    if (userInfo.role !== "customer") {
      toast("Only customers can add items to cart", "error");
      return;
    }
    setAddingId(menuItemId);
    try {
      let payload = { menuItemId, quantity: 1 };
      if (variantIdx !== null) {
        payload.variantIdx = variantIdx;
      }
      await API.post("/cart", payload);
      window.dispatchEvent(new Event("cartUpdated"));
      toast("Added to cart ✓");
    } catch (err) {
      toast(err.response?.data?.message || "Failed to add item", "error");
    } finally {
      setAddingId(null);
    }
  };

  const handleSubmitRating = async () => {
    if (!userInfo) {
      toast("Please login to rate this restaurant", "error");
      return;
    }
    if (userInfo.role !== "customer") {
      toast("Only customers can submit ratings", "error");
      return;
    }
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      toast("Please select a rating", "error");
      return;
    }
    setSubmittingRating(true);
    try {
      await API.post("/ratings", { restaurantId: id, rating: ratingValue });
      toast("Thanks for your rating! 🌟");
      const res = await API.get(`/restaurants/${id}`);
      setRestaurant(res.data);
      setRatingValue(0);
    } catch (err) {
      toast(err.response?.data?.message || "Failed to submit rating", "error");
    } finally {
      setSubmittingRating(false);
    }
  };

  const avgRating =
    restaurant && typeof restaurant.averageRating === "number"
      ? restaurant.averageRating.toFixed(1)
      : "—";
  const prepMinutes = restaurant?.preparationTime || 30;
  const pins = restaurant?.restaurant_deliveryPincodes || [];

  const filteredItems = menuItems
    .filter(
      (i) => selectedCategory === "All" || i.category === selectedCategory,
    )
    .slice()
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.price - b.price
        : sortOrder === "desc"
          ? b.price - a.price
          : 0,
    );

  const categories = Array.from(new Set(filteredItems.map((i) => i.category)));

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-5 py-8 pb-24">
        {/* Back nav */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back
          </Link>
          {userInfo?.role === "admin" && (
            <Link
              to="/admin/restaurants"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Admin restaurants
            </Link>
          )}
        </div>

        {/* Restaurant hero */}
        {!restaurantLoading && restaurant && (
          <div className="relative overflow-hidden bg-gradient-to-br from-[#FFF9F2] via-[#FFF1F3] to-[#FFF5E8] border border-[#EDE8DF] rounded-2xl p-6 mb-6 shadow-sm">
            {/* Blobs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-red-200/55 blur-[60px] pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-amber-200/40 blur-[50px] pointer-events-none" />

            {/* Top row */}
            <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1
                  className="text-2xl sm:text-3xl font-black text-[#1A1208] tracking-tight mb-2"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {restaurant.restaurant_name}
                </h1>

                <div className="flex items-start gap-1.5 text-sm text-gray-400 max-w-md">
                  <svg
                    className="w-3.5 h-3.5 mt-0.5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  <span>{restaurant.restaurant_address}</span>
                </div>

                {pins.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-3 text-xs text-gray-400">
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    </svg>
                    <span>Delivers to:</span>
                    {pins.slice(0, 5).map((p) => (
                      <span
                        key={p}
                        className="bg-white border border-[#EDE8DF] text-[#4A3F34] text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                      >
                        {p}
                      </span>
                    ))}
                    {pins.length > 5 && (
                      <span className="bg-white border border-[#EDE8DF] text-[#4A3F34] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                        +{pins.length - 5}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span
                  className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-600 text-sm font-black px-4 py-1.5 rounded-full"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  ★ {avgRating}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Est. {prepMinutes} min
                </span>
              </div>
            </div>

            {/* Rating row */}
            <div className="relative z-10 border-t border-[#EDE8DF] mt-5 pt-5 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">
                  Rate this restaurant
                </p>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setRatingValue(ratingValue === star ? 0 : star)
                      }
                      aria-label={`${star} star${star > 1 ? "s" : ""}`}
                      className={`w-9 h-9 rounded-xl border text-sm flex items-center justify-center transition-all duration-150
                        ${
                          ratingValue >= star
                            ? "bg-amber-50 border-amber-300 text-amber-500 scale-105"
                            : "bg-[#FBF7F0] border-[#EDE8DF] text-gray-400 hover:border-amber-300 hover:scale-110"
                        }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleSubmitRating}
                disabled={submittingRating || !ratingValue}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl shadow-sm shadow-red-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-150"
              >
                {submittingRating && (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {submittingRating ? "Submitting…" : "Submit rating"}
              </button>
            </div>
          </div>
        )}

        {/* Menu header + filters */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2
            className="text-xl font-black text-[#1A1208] tracking-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Menu
          </h2>
        </div>

        {!loading && menuItems.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap mb-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Filter:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-[#EDE8DF] rounded-xl px-3 py-2 text-sm font-semibold text-[#4A3F34] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 cursor-pointer shadow-sm transition appearance-none pr-7"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239C9088' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
              }}
            >
              <option value="All">All items</option>
              <option value="veg">Veg</option>
              <option value="non-veg">Non-veg</option>
            </select>

            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Sort:
            </span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-white border border-[#EDE8DF] rounded-xl px-3 py-2 text-sm font-semibold text-[#4A3F34] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 cursor-pointer shadow-sm transition appearance-none pr-7"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239C9088' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
              }}
            >
              <option value="">Default</option>
              <option value="asc">Price: low → high</option>
              <option value="desc">Price: high → low</option>
            </select>
          </div>
        )}

        {/* Loading skeletons */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-[#EDE8DF] rounded-2xl p-4 flex items-center gap-4 shadow-sm animate-pulse"
              >
                <div className="w-[76px] h-[76px] rounded-xl bg-[#F4EFE6] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-[#F4EFE6] rounded-full w-1/2" />
                  <div className="h-4 bg-[#F4EFE6] rounded-full w-1/4" />
                </div>
                <div className="w-20 h-9 bg-[#F4EFE6] rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty state */
          <div className="bg-white border-2 border-dashed border-[#DDD8CE] rounded-2xl py-16 px-6 text-center">
            <div className="text-4xl mb-3">🍽️</div>
            <p
              className="font-black text-[#1A1208] text-base mb-1"
              style={{ fontFamily: "Georgia, serif" }}
            >
              No items found
            </p>
            <p className="text-sm text-gray-400">
              {selectedCategory !== "All"
                ? `No ${selectedCategory} items available.`
                : "No menu items available."}
            </p>
          </div>
        ) : (
          /* Menu categories */
          categories.map((cat) => (
            <div key={cat} className="mb-6">
              {/* Category header */}
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="font-black text-[#4A3F34] text-base"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {cat === "veg" ? "🥗" : cat === "non-veg" ? "🍗" : "🍴"}{" "}
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </span>
                <div className="flex-1 h-px bg-[#EDE8DF]" />
              </div>

              {/* Items */}
              <div className="space-y-2.5">
                {filteredItems
                  .filter((i) => i.category === cat)
                  .map((item, idx) => (
                    <div
                      key={item._id}
                      className="bg-white border border-[#EDE8DF] hover:border-[#DDD8CE] rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-[fadeUp_0.35s_ease_both] flex-wrap sm:flex-nowrap"
                      style={{ animationDelay: `${Math.min(idx * 40, 250)}ms` }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="w-[76px] h-[76px] sm:w-20 sm:h-20 rounded-xl object-cover border border-[#EDE8DF] shrink-0 group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.currentTarget.style.opacity = "0.4";
                          e.currentTarget.style.filter = "grayscale(1)";
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        {/* Veg/non-veg dot + name */}
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="w-4 h-4 rounded-sm flex items-center justify-center shrink-0"
                            style={{
                              background:
                                item.category === "veg"
                                  ? "rgba(22,163,74,0.1)"
                                  : "rgba(232,57,74,0.08)",
                              border: `1.5px solid ${item.category === "veg" ? "rgba(22,163,74,0.45)" : "rgba(232,57,74,0.35)"}`,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                background:
                                  item.category === "veg"
                                    ? "#16A34A"
                                    : "#E8394A",
                              }}
                            />
                          </span>
                          <p className="font-bold text-sm text-[#1A1208] truncate">
                            {item.name}
                          </p>
                        </div>
                        {/* Variants display */}
                        {Array.isArray(item.variants) &&
                        item.variants.length > 0 ? (
                          <div className="mb-2">
                            <label className="text-xs text-gray-500 mb-1 block">
                              Choose variant:
                            </label>
                            <select
                              value={selectedVariants[item._id] ?? 0}
                              onChange={(e) =>
                                setSelectedVariants({
                                  ...selectedVariants,
                                  [item._id]: Number(e.target.value),
                                })
                              }
                              className="border border-gray-300 rounded px-2 py-1 text-sm"
                            >
                              {item.variants.map((v, vIdx) => (
                                <option key={vIdx} value={vIdx}>
                                  {v.name} - ₹{v.price}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <p
                            className="text-base font-black text-red-500 tracking-tight"
                            style={{ fontFamily: "Georgia, serif" }}
                          >
                            ₹{item.price}
                          </p>
                        )}
                      </div>

                      {/* Add button */}
                      {Array.isArray(item.variants) &&
                      item.variants.length > 0 ? (
                        <button
                          onClick={() =>
                            addToCart(item._id, selectedVariants[item._id] ?? 0)
                          }
                          disabled={addingId === item._id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-red-200 text-red-500 text-sm font-bold rounded-xl hover:bg-red-500 hover:border-red-500 hover:text-white hover:shadow-md hover:shadow-red-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shrink-0"
                        >
                          {addingId === item._id ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              Adding…
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-3.5 h-3.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                              Add
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => addToCart(item._id)}
                          disabled={addingId === item._id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-red-200 text-red-500 text-sm font-bold rounded-xl hover:bg-red-500 hover:border-red-500 hover:text-white hover:shadow-md hover:shadow-red-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shrink-0"
                        >
                          {addingId === item._id ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              Adding…
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-3.5 h-3.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                              Add
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default RestaurantDetails;
