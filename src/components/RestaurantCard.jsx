import { Link } from "react-router-dom";

function RestaurantCard({ restaurant }) {
  // console.log(restaurant);

  const rating = restaurant.averageRating ?? "—";
  return (
    <Link
      to={`/restaurant/${restaurant._id}`}
      className="block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-red-100 transition-all duration-200 group"
    >
      <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400 text-4xl group-hover:scale-105 transition-transform">
          <img
            src={restaurant.image}
            alt="Restaurant Image"
            className="w-full h-full object-cover"
          />
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition">
            {restaurant.restaurant_name}
          </h2>
          <span className="shrink-0 inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-sm font-medium px-2 py-0.5 rounded-full">
            ★ {rating}
          </span>
        </div>
        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
          {restaurant.restaurant_address}
        </p>
        <span className="inline-block mt-3 text-red-600 font-medium text-sm group-hover:underline">
          View menu →
        </span>
      </div>
    </Link>
  );
}

export default RestaurantCard;
