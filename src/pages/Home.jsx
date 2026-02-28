import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import RestaurantCard from "../components/RestaurantCard";

function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pincode, setPincode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("pincode") || localStorage.getItem("pincodeFilter") || "";
  });
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const url = pincode
          ? `/restaurants?pincode=${encodeURIComponent(pincode)}`
          : "/restaurants";
        const response = await API.get(url);
        setRestaurants(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, [pincode]);

  // read pincode from query string whenever location changes, fallback to stored value
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pin = params.get("pincode");
    if (pin != null) {
      setPincode(pin);
    } else {
      setPincode(localStorage.getItem("pincodeFilter") || "");
    }
  }, [location.search]);

  // Filter restaurants based on search query and pincode
  const filteredRestaurants = restaurants
    .filter((restaurant) => {
      const query = searchQuery.toLowerCase();
      return (
        restaurant.restaurant_name?.toLowerCase().includes(query) ||
        restaurant.cuisine?.toLowerCase().includes(query) ||
        restaurant.description?.toLowerCase().includes(query) ||
        restaurant.restaurant_address?.toLowerCase().includes(query)
      );
    })
    .filter((restaurant) => {
      if (!pincode) return true;
      const pins = restaurant.restaurant_deliveryPincodes || [];
      return pins.includes(pincode);
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <header className="bg-linear-to-r from-red-600 to-red-700 text-white py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Order food you love
            </h1>
            <p className="mt-2 text-red-100 text-base sm:text-lg">
              Discover restaurants and get your favourite food delivered.
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex justify-center ">
            <div className="w-full max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search restaurants....."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white w-full px-6 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
                />
                <svg
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {searchQuery
            ? `Search results for "${searchQuery}"`
            : pincode
              ? `Restaurants delivering to ${pincode}`
              : "Restaurants near you"}
        </h2>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
            <p className="text-lg">Loading restaurants...</p>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
            <p className="text-lg">
              {searchQuery
                ? "No restaurants found matching your search."
                : pincode
                  ? `No restaurants deliver to ${pincode}.`
                  : "No restaurants to show yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((item) => (
              <RestaurantCard key={item._id} restaurant={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;
