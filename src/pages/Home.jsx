import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import RestaurantCard, {
  RestaurantCardSkeleton,
} from "../components/RestaurantCard";

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [pincode, setPincode] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get("pincode") || localStorage.getItem("pincodeFilter") || "";
  });
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    const url = pincode
      ? `/restaurants?pincode=${encodeURIComponent(pincode)}`
      : "/restaurants";
    API.get(url)
      .then((r) => setRestaurants(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [pincode]);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const pin = p.get("pincode");
    setPincode(pin != null ? pin : localStorage.getItem("pincodeFilter") || "");
  }, [location.search]);

  const filtered = restaurants.filter((r) => {
    const q = search.toLowerCase();
    return (
      (!q ||
        r.restaurant_name?.toLowerCase().includes(q) ||
        r.cuisine?.toLowerCase().includes(q) ||
        r.restaurant_address?.toLowerCase().includes(q)) &&
      (!pincode || (r.restaurant_deliveryPincodes || []).includes(pincode))
    );
  });

  const hasFilters = !!(search || pincode);

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <Navbar />

      {/* ── Hero ── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#FFF9F2] via-[#FFF1F3] to-[#FFF6EC] border-b border-[#EDE8DF] py-14 sm:py-20 px-5 flex items-center justify-center">
        {/* Blobs */}
        <div className="absolute -top-36 -right-28 w-[500px] h-[500px] rounded-full bg-red-200/50 blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-20 w-[400px] h-[400px] rounded-full bg-amber-200/45 blur-[80px] pointer-events-none" />
        <div className="absolute top-1/3 -left-16 w-[280px] h-[280px] rounded-full bg-purple-200/25 blur-[70px] pointer-events-none" />

        {/* Floating emoji — hidden on small screens */}
        <span
          className="absolute top-[10%] left-[5%] text-5xl opacity-20 hidden sm:block animate-bounce"
          style={{ animationDuration: "5.5s" }}
        >
          🍕
        </span>
        <span
          className="absolute top-[14%] right-[6%] text-4xl opacity-20 hidden sm:block animate-bounce"
          style={{ animationDuration: "6.5s" }}
        >
          🌮
        </span>
        <span
          className="absolute bottom-[20%] left-[7%] text-4xl opacity-18 hidden sm:block animate-bounce"
          style={{ animationDuration: "7.5s" }}
        >
          🍜
        </span>
        <span
          className="absolute bottom-[12%] right-[5%] text-5xl opacity-20 hidden sm:block animate-bounce"
          style={{ animationDuration: "6s" }}
        >
          🍣
        </span>

        <div className="relative z-10 max-w-2xl w-full mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-red-200 rounded-full px-4 py-1.5 mb-5 shadow-sm shadow-red-100">
            <span className="relative flex shrink-0">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-60" />
            </span>
            <span className="text-red-500 text-[11px] font-bold uppercase tracking-widest">
              Fresh &amp; fast delivery
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-black text-[#1A1208] tracking-tight leading-[1.03] mb-4">
            Cravings met,
            <br />
            <span className="bg-gradient-to-r from-red-500 via-red-400 to-orange-400 bg-clip-text text-transparent">
              delivered fast
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#8C8075] max-w-md mx-auto mb-8 leading-relaxed">
            Discover restaurants near you and get your favourite meals delivered
            hot and fresh, right to your doorstep.
          </p>

          {/* Search box */}
          <div className="max-w-xl mx-auto">
            <div className="flex items-center bg-white border-2 border-[#EDE8DF] rounded-2xl px-4 py-1.5 gap-3 shadow-lg shadow-black/5 focus-within:border-red-400 focus-within:shadow-red-100 focus-within:shadow-xl transition-all duration-200">
              <svg
                className="w-5 h-5 text-gray-300 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search restaurants or cuisines…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
                className="flex-1 bg-transparent outline-none text-[#1A1208] placeholder-gray-300 text-sm sm:text-base font-medium py-2.5 min-w-0"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-xs font-bold text-gray-400 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors shrink-0"
                >
                  ✕
                </button>
              )}
              <button className="shrink-0 px-5 py-2.5 bg-gradient-to-br from-red-500 to-red-600 text-white text-sm font-bold rounded-xl hover:opacity-90 hover:-translate-y-px hover:shadow-lg hover:shadow-red-400/40 transition-all duration-150">
                Search 🔍
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-5 py-10 pb-24">
        {/* Section header */}
        <div className="flex items-end justify-between flex-wrap gap-4 mb-7">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A1208] tracking-tight">
              {search ? (
                <>
                  Results for <span className="text-red-500">"{search}"</span>
                </>
              ) : pincode ? (
                <>
                  Delivering to <span className="text-red-500">{pincode}</span>
                </>
              ) : (
                "Restaurants near you"
              )}
            </h2>
            {!loading && (
              <p className="text-sm text-gray-400 mt-1">
                {filtered.length} restaurant{filtered.length !== 1 ? "s" : ""}{" "}
                found
              </p>
            )}
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div className="flex gap-2 flex-wrap">
              {search && (
                <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-500 text-xs font-bold px-3 py-1.5 rounded-full">
                  🔍 {search}
                  <button
                    onClick={() => setSearch("")}
                    className="opacity-60 hover:opacity-100 transition-opacity ml-0.5"
                  >
                    ✕
                  </button>
                </span>
              )}
              {pincode && (
                <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-500 text-xs font-bold px-3 py-1.5 rounded-full">
                  📍 {pincode}
                  <button
                    onClick={() => setPincode("")}
                    className="opacity-60 hover:opacity-100 transition-opacity ml-0.5"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <>
            <div className="text-center py-6 pb-8">
              <div className="w-9 h-9 border-[3px] border-red-100 border-t-red-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-medium">
                Finding the best spots near you…
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <RestaurantCardSkeleton key={i} />
              ))}
            </div>
          </>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center gap-4 py-20 px-6 border-2 border-dashed border-gray-200 rounded-3xl bg-white text-center">
            <span className="text-5xl">🍽️</span>
            <p className="text-lg font-bold text-[#1A1208] tracking-tight">
              No restaurants found
            </p>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              {search
                ? `No results for "${search}". Try a different keyword.`
                : pincode
                  ? `No restaurants deliver to ${pincode} right now.`
                  : "No restaurants available right now."}
            </p>
            {hasFilters && (
              <button
                onClick={() => {
                  setSearch("");
                  setPincode("");
                }}
                className="mt-1 px-7 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-full shadow-md shadow-red-200 hover:-translate-y-0.5 transition-all duration-150"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          /* Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((item, idx) => (
              <div
                key={item._id}
                className="animate-[fadeUp_0.4s_ease_both]"
                style={{ animationDelay: `${Math.min(idx * 45, 400)}ms` }}
              >
                <RestaurantCard restaurant={item} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#EDE8DF] bg-white py-6 px-5">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-gray-400 font-medium">
            © {new Date().getFullYear()} Tomato — Delivering happiness, one meal
            at a time 🍜
          </p>
          <div className="flex gap-5">
            {["About", "Help", "Privacy", "Terms"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
