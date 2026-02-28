import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await API.get("/orders/my-orders");
      setOrders(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const statusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "delivered") return "bg-green-100 text-green-800";
    if (s === "cancelled") return "bg-red-100 text-red-800";
    if (s === "pending" || s === "placed") return "bg-amber-100 text-amber-800";
    return "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-500">
          Loading orders…
        </div>
      </div>
    );
  }

  if (!loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl border border-gray-200 p-12 shadow-sm">
            <p className="text-4xl mb-4">📋</p>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No orders yet
            </h2>
            <p className="text-gray-500 mb-6">
              Your order history will appear here.
            </p>
            <Link
              to="/"
              className="inline-block bg-red-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-red-700 transition"
            >
              Order food
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8 pb-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

        <ul className="space-y-4">
          {orders.map((order) => (
            <li
              key={order._id}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {order.restaurant?.name ?? "Restaurant"}
                  </h3>
                  <p className="text-gray-500 text-sm mt-0.5">
                    ₹{order.totalAmount}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-sm font-medium px-3 py-1 rounded-full ${statusColor(order.status)}`}
                >
                  {order.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default MyOrders;
