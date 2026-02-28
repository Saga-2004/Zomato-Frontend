import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function BottomNav() {
  const location = useLocation();
  const [path, setPath] = useState(location.pathname);

  useEffect(() => {
    setPath(location.pathname);
  }, [location.pathname]);

  // hide on larger screens or specific routes
  if (/^(\/login|\/signup|\/admin|\/owner|\/delivery)/.test(path)) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-inner z-40 sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex justify-around py-1">
        <li>
          <Link
            to="/"
            className={`block py-3 text-center text-sm ${path === "/" ? "text-red-600" : "text-gray-600"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6"
              />
            </svg>
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/cart"
            className={`block py-3 text-center text-sm ${path === "/cart" ? "text-red-600" : "text-gray-600"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mx-auto"
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
          </Link>
        </li>
        <li>
          <Link
            to="/my-orders"
            className={`block py-3 text-center text-sm ${path === "/my-orders" ? "text-red-600" : "text-gray-600"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2a4 4 0 00-3-3.87m13 5.87v-2a4 4 0 00-3-3.87M9 7V5a4 4 0 013-3.87m3 16v2a4 4 0 01-3 3.87"
              />
            </svg>
            Orders
          </Link>
        </li>
        <li>
          <Link
            to="/profile"
            className={`block py-3 text-center text-sm ${path === "/profile" ? "text-red-600" : "text-gray-600"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A9 9 0 1118.879 6.196 9 9 0 015.12 17.804z"
              />
            </svg>
            Profile
          </Link>
        </li>
      </ul>
    </nav>
  );
}
