import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";

function RestaurantDetails() {
  const { id } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [addingId, setAddingId] = useState(null);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
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

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Menu</h1>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
            <p className="text-lg">Loading menu…</p>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
            <p className="text-lg">No menu items available.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {menuItems.map((item) => (
              <li
                key={item._id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm hover:shadow-md transition"
              >
                <div>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 rounded-4xl object-cover hover:border hover:border-red-600 hover:shadow-xl transition"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-red-600 font-medium mt-0.5">
                    ₹{item.price}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addToCart(item._id)}
                  disabled={addingId === item._id}
                  className={`shrink-0 text-white font-medium px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ${addingId === item._id ? "bg-red-400 cursor-wait" : "bg-red-600 hover:bg-red-700"}`}
                >
                  {addingId === item._id ? (
                    <span className="inline-flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                      Adding...
                    </span>
                  ) : (
                    "Add to cart"
                  )}
                </button>
              </li>
            ))}
          </ul>
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
