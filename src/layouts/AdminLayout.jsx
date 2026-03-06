import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ProfileIcon from "../components/ProfileIcon";
import Navbar from "../components/Navbar";

const NAV_ITEMS = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    to: "/admin/users",
    label: "Users",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <circle cx="9" cy="7" r="4" />
        <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
        <path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" />
      </svg>
    ),
  },
  {
    to: "/admin/orders",
    label: "Orders",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    to: "/admin/restaurants",
    label: "Restaurants",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path d="M3 22V11l9-9 9 9v11" />
        <path d="M9 22V16h6v6" />
        <path d="M9 11h6" />
      </svg>
    ),
  },
  {
    to: "/admin/delivery-partners",
    label: "Delivery Partners",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3" />
        <rect x="9" y="11" width="14" height="10" rx="2" />
        <circle cx="12" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
      </svg>
    ),
  },
];

function NavLink({ item, onClick, collapsed }) {
  const location = useLocation();
  const isActive = location.pathname === item.to;

  return (
    <Link
      to={item.to}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`
        group relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
        ${collapsed ? "justify-center" : ""}
        ${
          isActive
            ? "bg-red-500 text-white shadow-md shadow-red-200"
            : "text-gray-600 hover:bg-red-50 hover:text-red-600"
        }
      `}
    >
      <span
        className={`shrink-0 transition-transform duration-200 ${isActive ? "" : "group-hover:scale-110"}`}
      >
        {item.icon}
      </span>
      {!collapsed && <span className="truncate">{item.label}</span>}
      {collapsed && (
        <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-gray-900 text-white text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-lg">
          {item.label}
        </span>
      )}
    </Link>
  );
}

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  // Close sidebar on large screens resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1 relative overflow-hidden">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-gray-100 shadow-xl lg:shadow-sm
            transition-all duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            ${collapsed ? "lg:w-17" : "w-64 lg:w-56 xl:w-64"}
          `}
          style={{ top: "0", paddingTop: "0" }}
        >
          {/* Sidebar Header */}
          <div
            className={`flex items-center border-b border-gray-100 shrink-0 ${
              collapsed
                ? "justify-center px-3 py-4"
                : "justify-between px-4 py-4"
            }`}
          >
            {!collapsed && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-red-500 to-orange-400 flex items-center justify-center shadow-sm">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-none">
                    Admin
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Control Panel</p>
                </div>
              </div>
            )}
            {/* Collapse toggle — desktop only */}
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {/* Mobile close */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
            {!collapsed && (
              <p className="px-3 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                Navigation
              </p>
            )}
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                item={item}
                collapsed={collapsed}
                onClick={() => setSidebarOpen(false)}
              />
            ))}
          </nav>

          {/* Bottom actions */}
          <div
            className={`p-3 border-t border-gray-100 space-y-1 shrink-0 ${collapsed ? "" : ""}`}
          >
            <Link
              to="/profile"
              title={collapsed ? "Profile" : undefined}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 ${collapsed ? "justify-center" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <ProfileIcon className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              {!collapsed && <span>Profile</span>}
              {collapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-gray-900 text-white text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-lg">
                  Profile
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              title={collapsed ? "Logout" : undefined}
              className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 ${collapsed ? "justify-center" : ""}`}
            >
              <svg
                className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!collapsed && <span>Logout</span>}
              {collapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-gray-900 text-white text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-lg">
                  Logout
                </span>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Top Bar */}
          <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
              aria-label="Open menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-linear-to-br from-red-500 to-orange-400 flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900 text-sm">
                Admin Panel
              </span>
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 xl:p-8">
            <div className="max-w-screen-2xl mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
