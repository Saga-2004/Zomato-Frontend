import { Link } from "react-router-dom";

const RESTAURANT_FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f8fafc"/>
          <stop offset="100%" stop-color="#e2e8f0"/>
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#bg)"/>
      <g fill="#64748b" font-family="Arial, sans-serif" text-anchor="middle">
        <text x="200" y="120" font-size="22" font-weight="700">Restaurant</text>
        <text x="200" y="148" font-size="14">Image unavailable</text>
      </g>
    </svg>
  `);

export function RestaurantCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-56 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-100 rounded-full w-2/3" />
        <div className="h-3 bg-gray-100 rounded-full w-5/6" />
        <div className="h-3 bg-gray-100 rounded-full w-1/3 mt-1" />
      </div>
    </div>
  );
}

function RestaurantCard({ restaurant }) {
  const restaurantId = restaurant?._id || restaurant?.id;

  // Simple white card with responsiveness using Tailwind CSS
  const cardContent = (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={restaurant?.image || RESTAURANT_FALLBACK_IMAGE}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = RESTAURANT_FALLBACK_IMAGE;
          }}
          alt={restaurant?.restaurant_name || "Restaurant"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="relative z-10 p-5 sm:p-6 min-h-[220px] flex flex-col justify-end">
        <div className="bg-white/92 backdrop-blur-md border border-white/60 rounded-2xl p-4 transition-all duration-300 group-hover:bg-black/35 group-hover:border-white/20">
          <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight truncate group-hover:text-white">
            {restaurant?.restaurant_name || "Restaurant Name"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate group-hover:text-white/85">
            {restaurant?.restaurant_address || "Address"}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
            {restaurant?.cuisine && (
              <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold group-hover:bg-white/20 group-hover:text-white">
                {restaurant.cuisine}
              </span>
            )}
            {restaurant?.averageRating && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold group-hover:bg-emerald-400/30 group-hover:text-white">
                ★ {Number(restaurant.averageRating).toFixed(1)}
              </span>
            )}
            {restaurant?.preparationTime && (
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold group-hover:bg-amber-400/30 group-hover:text-white">
                {restaurant.preparationTime} min
              </span>
            )}
          </div>
          {Array.isArray(restaurant?.restaurant_deliveryPincodes) &&
            restaurant.restaurant_deliveryPincodes.length > 0 && (
              <p className="text-[11px] text-gray-500 mt-2 group-hover:text-white/70">
                Pincodes: {restaurant.restaurant_deliveryPincodes.join(", ")}
              </p>
            )}
        </div>
      </div>
    </div>
  );

  if (!restaurantId) {
    return cardContent;
  }

  return (
    <Link
      to={`/restaurant/${restaurantId}`}
      state={{ restaurant }}
      className="block"
      aria-label={`Open ${restaurant?.restaurant_name || "restaurant"} details`}
    >
      {cardContent}
    </Link>
  );
}

export default RestaurantCard;
