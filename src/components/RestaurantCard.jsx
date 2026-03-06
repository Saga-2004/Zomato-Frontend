import { Link } from "react-router-dom";

export function RestaurantCardSkeleton() {
  return (
    <div className="bg-[#141010] rounded-2xl border border-white/5 overflow-hidden animate-pulse">
      <div className="h-48 bg-gradient-to-r from-[#1e1818] via-[#251d1d] to-[#1e1818]" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-[#1e1818] rounded-full w-2/3" />
        <div className="h-3 bg-[#1e1818] rounded-full w-5/6" />
        <div className="h-3 bg-[#1e1818] rounded-full w-1/3 mt-1" />
      </div>
    </div>
  );
}

function RestaurantCard({ restaurant }) {
  const rating =
    restaurant.averageRating != null
      ? Number(restaurant.averageRating).toFixed(1)
      : null;
  const prepMinutes = restaurant.preparationTime || 30;
  const pins = restaurant.restaurant_deliveryPincodes || [];
  const pinsDisplay =
    pins.slice(0, 3).join(", ") + (pins.length > 3 ? "…" : "");
  const isClosed = restaurant.isClosed;

  return (
    <Link
      to={`/restaurant/${restaurant._id}`}
      state={{ restaurant }}
      aria-label={`${restaurant.restaurant_name}${isClosed ? " — Currently closed" : ""}`}
      className="group block bg-[#141010] rounded-2xl border border-white/5 overflow-hidden hover:border-red-500/30 hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-[#0d0909]">
        <img
          src={restaurant.image}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.style.opacity = "0.3";
            e.currentTarget.style.filter = "grayscale(1)";
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0808]/95 via-[#0c0808]/40 to-transparent pointer-events-none" />

        {/* Cuisine tag */}
        {restaurant.cuisine && (
          <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white/85 text-[10.5px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/10">
            {restaurant.cuisine}
          </span>
        )}

        {/* Rating badge */}
        {rating && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-red-500/40">
            <span className="text-[10px]">★</span>
            {rating}
          </span>
        )}

        {/* Closed overlay */}
        {isClosed && (
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-black/90 text-white/60 text-[11px] font-bold uppercase tracking-widest px-5 py-2 rounded-full border border-white/12">
              Currently Closed
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 relative">
        <p className="font-bold text-[17px] text-[#f2ece8] group-hover:text-red-400 transition-colors truncate tracking-tight leading-snug mb-2">
          {restaurant.restaurant_name}
        </p>

        <div className="flex items-start gap-1.5 text-white/30 text-[12.5px] mb-4">
          <svg
            className="w-3 h-3 mt-0.5 shrink-0 text-white/20"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          <span className="line-clamp-2 leading-snug">
            {restaurant.restaurant_address}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] gap-2">
          <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/15 text-xs font-semibold px-3 py-1.5 rounded-full">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {prepMinutes} min
          </span>

          {pinsDisplay && (
            <span
              className="text-white text-[11px] font-medium flex items-center gap-1 truncate max-w-[55%]"
              title={pins.join(", ")}
            >
              <svg
                className="w-2.5 h-2.5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              <span className="truncate">{pinsDisplay}</span>
            </span>
          )}
        </div>

        {/* Hover arrow */}
        <span className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-red-500/10 border border-red-500/25 text-red-500 flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

export default RestaurantCard;
