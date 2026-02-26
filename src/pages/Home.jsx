import { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import RestaurantCard from "../components/RestaurantCard";

function Home() {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await API.get("/restaurants");
        setRestaurants(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchRestaurants();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight">Order food you love</h1>
          <p className="mt-2 text-red-100 text-lg max-w-xl mx-auto">
            Discover restaurants and get your favourite food delivered.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Restaurants near you</h2>

        {restaurants.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
            <p className="text-lg">No restaurants to show yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((item) => (
              <RestaurantCard key={item._id} restaurant={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;
