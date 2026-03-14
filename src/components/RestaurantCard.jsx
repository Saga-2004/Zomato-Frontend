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
  // Simple white card with responsiveness using Tailwind CSS
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden max-w-xs w-full mx-auto transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center">
      {/* Small Image with white border */}
      <div className="w-full border-b-4 border-white shadow-md overflow-hidden bg-gray-100 flex items-center justify-center">
        <img
          src={
            restaurant?.image ||
            "https://via.placeholder.com/400x250?text=Restaurant"
          }
          alt={restaurant?.restaurant_name || "Restaurant"}
          className="w-full h-56 object-cover"
        />
      </div>
      {/* Content */}
      <div className="p-4 flex flex-col flex-1 items-start w-full">
        <h2 className="text-lg font-semibold text-gray-900 truncate mb-1 w-full">
          {restaurant?.restaurant_name || "Restaurant Name"}
        </h2>
        <div className="text-gray-600 text-sm w-full mb-2">
          <div>{restaurant?.restaurant_address || "Address"}</div>
          {restaurant?.cuisine && (
            <div className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full mt-1">
              {restaurant.cuisine}
            </div>
          )}
          {restaurant?.averageRating && (
            <div className="inline-block bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full mt-1 ml-2">
              ★ {Number(restaurant.averageRating).toFixed(1)}
            </div>
          )}
          {restaurant?.preparationTime && (
            <div className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full mt-1 ml-2">
              {restaurant.preparationTime} min
            </div>
          )}
          {Array.isArray(restaurant?.restaurant_deliveryPincodes) &&
            restaurant.restaurant_deliveryPincodes.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                Pincodes: {restaurant.restaurant_deliveryPincodes.join(", ")}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default RestaurantCard;
