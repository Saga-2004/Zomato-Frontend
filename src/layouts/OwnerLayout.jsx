import { Link, useLocation, useNavigate } from "react-router-dom";
import ProfileIcon from "../components/ProfileIcon";

const NAV_ITEMS = [
  {
    to: "/owner/dashboard",
    label: "Dashboard",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: "/owner/menu",
    label: "Menu",
    icon: (
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
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    ),
  },
  {
    to: "/owner/orders",
    label: "Orders",
    icon: (
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
    ),
  },
  {
    to: "/owner/offers",
    label: "Coupons",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
];

function NavLink({ to, label, icon, onClick }) {
  const location = useLocation();
  const active =
    location.pathname === to || location.pathname.startsWith(to + "/");
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150
        ${active ? "bg-red-50 text-red-600 shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
    >
      <span className={active ? "text-red-500" : "text-gray-400"}>{icon}</span>
      {label}
      {active && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500" />
      )}
    </Link>
  );
}

function OwnerLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col bg-white border-r border-gray-100 shadow-sm">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="relative flex shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-50" />
            </span>
            <span
              className="font-black text-lg text-gray-900 tracking-tight group-hover:text-red-500 transition-colors"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Tomato
            </span>
          </Link>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mt-2 ml-0.5">
            Restaurant Owner
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} {...item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-gray-100 space-y-0.5">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150"
          >
            <ProfileIcon className="w-4 h-4 text-gray-400 shrink-0" />
            Profile
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all duration-150 text-left"
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-sm px-4 h-14 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span
            className="font-black text-base text-gray-900"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Tomato
          </span>
        </Link>
        <nav className="flex items-center gap-0.5 overflow-x-auto">
          {NAV_ITEMS.map(({ to, label, icon }) => {
            const active =
              location.pathname === to ||
              location.pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all
                  ${active ? "bg-red-50 text-red-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}
              >
                <span className={active ? "text-red-500" : "text-gray-400"}>
                  {icon}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
          <Link
            to="/profile"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-all shrink-0"
          >
            <ProfileIcon className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition-all shrink-0"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* ── Main ── */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default OwnerLayout;
