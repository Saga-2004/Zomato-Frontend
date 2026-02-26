import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import ProfileIcon from "./ProfileIcon";
import API from "../api/axios"; // used to fetch cart count

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
  });
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  const role = user?.role;
  const isCustomer = role === "customer";
  const dashboardPath =
    role === "admin"
      ? "/admin/dashboard"
      : role === "restaurant_owner"
        ? "/owner/dashboard"
        : role === "delivery_partner"
          ? "/delivery/dashboard"
          : "/";

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate("/");
  };

  // fetch cart count for customer
  const loadCartCount = async () => {
    try {
      const res = await API.get("/cart");
      const items = res.data?.items || [];
      const count = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      setCartCount(count);
    } catch (err) {
      console.error("Failed to load cart count", err);
      setCartCount(0);
    }
  };

  // update badge whenever user/route changes or external cart update event occurs
  useEffect(() => {
    const refresh = () => {
      if (isCustomer) {
        loadCartCount();
      } else {
        setCartCount(0);
      }
    };

    refresh();

    window.addEventListener("cartUpdated", refresh);
    return () => {
      window.removeEventListener("cartUpdated", refresh);
    };
  }, [isCustomer, location]);

  return (
    <nav className="bg-red-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          to="/"
          className="text-xl font-bold tracking-tight hover:opacity-90 transition"
        >
          Zomato
        </Link>

        <div className="flex items-center gap-6">
          {!user && (
            <Link
              to="/"
              className="font-medium hover:underline underline-offset-4 decoration-2"
            >
              Home
            </Link>
          )}

          {user && role !== "customer" && (
            <Link
              to={dashboardPath}
              className="font-medium hover:underline underline-offset-4 decoration-2"
            >
              Dashboard
            </Link>
          )}

          {user && isCustomer && (
            <>
              <Link
                to="/"
                className="font-medium hover:underline underline-offset-4 decoration-2"
              >
                Home
              </Link>
              <Link
                to="/cart"
                className="relative font-medium hover:underline underline-offset-4 decoration-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 inline-block mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.3 5.2a1 1 0 00.98 1.2h12.7a1 1 0 00.98-1.2L17 13M7 13h10"
                  />
                </svg>
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-red-600 bg-white rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                to="/my-orders"
                className="font-medium hover:underline underline-offset-4 decoration-2"
              >
                My Orders
              </Link>
            </>
          )}
          {user ? (
            <>
              <Link
                to="/profile"
                className="p-2 rounded-lg hover:bg-white/20 transition inline-flex items-center justify-center"
                title="Profile"
              >
                <ProfileIcon className="w-5 h-5 text-white" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="font-medium border border-white px-4 py-2 rounded-lg hover:bg-white hover:text-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="font-medium bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="font-medium border border-white px-4 py-2 rounded-lg hover:bg-white hover:text-red-600 transition"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
