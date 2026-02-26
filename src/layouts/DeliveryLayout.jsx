import { Link, useNavigate } from "react-router-dom";
import ProfileIcon from "../components/ProfileIcon";

function DeliveryLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-56 bg-white border-r border-gray-200 shadow-sm flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900">Delivery Partner</h3>
        </div>
        <nav className="p-3 flex flex-col gap-1 flex-1">
          <Link
            to="/delivery/dashboard"
            className="px-3 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 font-medium transition"
          >
            Dashboard
          </Link>
          <Link
            to="/delivery/orders"
            className="px-3 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 font-medium transition"
          >
            Orders
          </Link>
        </nav>
        <div className="p-3 border-t border-gray-200 space-y-1">
          <Link
            to="/profile"
            className="w-full px-3 py-2 rounded-lg text-left text-gray-700 hover:bg-red-50 hover:text-red-600 font-medium transition flex items-center gap-2"
          >
            <ProfileIcon className="w-5 h-5 shrink-0" />
            Profile
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded-lg text-left text-red-600 hover:bg-red-50 font-medium transition"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}

export default DeliveryLayout;
