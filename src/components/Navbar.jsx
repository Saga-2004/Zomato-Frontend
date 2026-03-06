import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import ProfileIcon from "./ProfileIcon";
import API from "../api/axios";

const NavLink = ({ to, children, className = "" }) => (
  <Link
    to={to}
    className={`text-sm font-medium text-white/85 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all duration-150 whitespace-nowrap ${className}`}
  >
    {children}
  </Link>
);

const MobileLink = ({ to, icon, children }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/90 hover:text-white hover:bg-white/10 text-sm font-medium transition-all duration-150"
  >
    {icon}
    {children}
  </Link>
);

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
  });
  const [cartCount, setCartCount] = useState(0);
  const [pincode, setPincode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const pin = params.get("pincode");
    if (pin) return pin;
    return localStorage.getItem("pincodeFilter") || "";
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);

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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    try {
      const token = user?.token;
      if (token) {
        await API.post(
          "/users/logout",
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
    } catch (err) {
      console.error("Failed to logout on server", err);
    }
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate("/");
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pin = params.get("pincode") || "";
    setPincode(pin);
    if (pin) localStorage.setItem("pincodeFilter", pin);
    else localStorage.removeItem("pincodeFilter");
  }, [location.search]);

  const loadCartCount = async () => {
    try {
      const res = await API.get("/cart");
      const items = res.data?.items || [];
      setCartCount(items.reduce((sum, item) => sum + (item.quantity || 1), 0));
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    const refresh = () => {
      if (isCustomer) loadCartCount();
      else setCartCount(0);
    };
    refresh();
    window.addEventListener("cartUpdated", refresh);
    return () => window.removeEventListener("cartUpdated", refresh);
  }, [isCustomer, location]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handlePincodeSubmit = (e) => {
    e.preventDefault();
    const trimmed = pincode.trim();
    if (trimmed) {
      localStorage.setItem("pincodeFilter", trimmed);
      navigate(`/?pincode=${encodeURIComponent(trimmed)}`);
    } else {
      localStorage.removeItem("pincodeFilter");
      navigate("/");
    }
  };

  return (
    <nav
      ref={menuRef}
      className={`sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? "shadow-xl shadow-red-900/30" : ""}`}
    >
      {/* Main bar */}
      <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="max-w-screen-xl mx-auto px-4 sm:px-5 h-16 flex items-center gap-4 relative">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="font-bold text-lg text-white tracking-tight group-hover:opacity-90 transition-opacity">
              Tomato
            </span>
          </Link>

          {/* Pincode form — desktop */}
          <form
            onSubmit={handlePincodeSubmit}
            className="flex-1 max-w-xs hidden sm:flex"
          >
            <div className="flex items-center w-full bg-white/10 border border-white/20 rounded-xl overflow-hidden focus-within:bg-white/20 focus-within:border-white/40 focus-within:ring-2 focus-within:ring-white/15 transition-all duration-200">
              <span className="pl-3 pr-2 flex items-center shrink-0 opacity-70">
                <svg width="13" height="15" viewBox="0 0 14 16" fill="white">
                  <path d="M7 0C4.24 0 2 2.24 2 5c0 3.75 5 11 5 11s5-7.25 5-11c0-2.76-2.24-5-5-5zm0 6.75A1.75 1.75 0 1 1 7 3.25a1.75 1.75 0 0 1 0 3.5z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Enter pincode…"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                maxLength={10}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/50 text-sm font-medium py-2 min-w-0"
              />
              <button
                type="submit"
                className="px-3 py-2 text-xs font-bold text-white bg-white/15 hover:bg-white/25 border-l border-white/20 transition-colors shrink-0"
              >
                Go
              </button>
            </div>
          </form>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1 ml-auto">
            {!user && <NavLink to="/">Home</NavLink>}

            {user && role !== "customer" && (
              <NavLink to={dashboardPath}>Dashboard</NavLink>
            )}

            {user && isCustomer && (
              <>
                <NavLink to="/">Home</NavLink>

                <Link
                  to="/cart"
                  className="relative flex items-center gap-1.5 text-sm font-medium text-white/85 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all duration-150"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                  </svg>
                  Cart
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-white text-red-600 text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-md">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <NavLink to="/my-orders">Orders</NavLink>
              </>
            )}

            <div className="w-px h-5 bg-white/20 mx-1 shrink-0" />

            {user ? (
              <>
                <Link
                  to="/profile"
                  title="Profile"
                  className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all duration-150 hover:-translate-y-px"
                >
                  <ProfileIcon className="w-[18px] h-[18px]" />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm font-semibold text-white/85 hover:text-white border border-white/35 hover:border-white/60 px-3.5 py-1.5 rounded-lg transition-all duration-150 whitespace-nowrap"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-bold text-red-600 bg-white hover:bg-red-50 px-4 py-1.5 rounded-lg transition-all duration-150 hover:-translate-y-px hover:shadow-md whitespace-nowrap"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-semibold text-white border border-white/50 hover:border-white hover:bg-white/10 px-4 py-1.5 rounded-lg transition-all duration-150 whitespace-nowrap"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Hamburger — mobile */}
          <button
            type="button"
            onClick={() => setMenuOpen((m) => !m)}
            aria-label="Toggle menu"
            className="md:hidden ml-auto w-9 h-9 flex flex-col justify-center gap-[5px] items-center bg-white/10 border border-white/20 rounded-xl p-2 hover:bg-white/20 transition-colors shrink-0"
          >
            <span
              className={`w-full h-0.5 bg-white rounded-full transition-all duration-200 origin-center ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`}
            />
            <span
              className={`w-full h-0.5 bg-white rounded-full transition-all duration-200 ${menuOpen ? "opacity-0 scale-x-0" : ""}`}
            />
            <span
              className={`w-full h-0.5 bg-white rounded-full transition-all duration-200 origin-center ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-gradient-to-b from-red-700 to-red-800 border-t border-white/10">
          <div className="max-w-screen-xl mx-auto px-3 py-3 flex flex-col gap-1">
            {/* Pincode on mobile */}
            <form onSubmit={handlePincodeSubmit} className="mb-2">
              <div className="flex items-center bg-white/10 border border-white/20 rounded-xl overflow-hidden">
                <span className="pl-3 pr-2 opacity-70 flex items-center">
                  <svg width="12" height="14" viewBox="0 0 14 16" fill="white">
                    <path d="M7 0C4.24 0 2 2.24 2 5c0 3.75 5 11 5 11s5-7.25 5-11c0-2.76-2.24-5-5-5zm0 6.75A1.75 1.75 0 1 1 7 3.25a1.75 1.75 0 0 1 0 3.5z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Enter pincode…"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  maxLength={10}
                  className="flex-1 bg-transparent outline-none text-white placeholder-white/50 text-sm font-medium py-2.5 min-w-0"
                />
                <button
                  type="submit"
                  className="px-3 py-2.5 text-xs font-bold text-white bg-white/15 border-l border-white/20"
                >
                  Go
                </button>
              </div>
            </form>

            {!user && (
              <MobileLink
                to="/"
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                }
              >
                Home
              </MobileLink>
            )}

            {user && role !== "customer" && (
              <MobileLink
                to={dashboardPath}
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                  </svg>
                }
              >
                Dashboard
              </MobileLink>
            )}

            {user && isCustomer && (
              <>
                <MobileLink
                  to="/"
                  icon={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  }
                >
                  Home
                </MobileLink>

                <Link
                  to="/cart"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/90 hover:text-white hover:bg-white/10 text-sm font-medium transition-all"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                  </svg>
                  Cart
                  {cartCount > 0 && (
                    <span className="ml-auto bg-white text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <MobileLink
                  to="/my-orders"
                  icon={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  }
                >
                  My Orders
                </MobileLink>
              </>
            )}

            {user && (
              <MobileLink
                to="/profile"
                icon={<ProfileIcon className="w-4 h-4" />}
              >
                Profile
              </MobileLink>
            )}

            <div className="h-px bg-white/10 my-1" />

            <div className="flex gap-2 px-1 pt-1">
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 text-center text-sm font-semibold text-white border border-white/35 bg-white/10 hover:bg-white/15 py-2.5 rounded-xl transition-colors"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex-1 text-center text-sm font-bold text-red-600 bg-white hover:bg-red-50 py-2.5 rounded-xl transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="flex-1 text-center text-sm font-semibold text-white border border-white/50 hover:bg-white/10 py-2.5 rounded-xl transition-colors"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
