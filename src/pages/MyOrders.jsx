import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log(orders);

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
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm 
  hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <Link
                    to={`http://localhost:5173/restaurant/${order.restaurant?._id}`}
                    className="text-lg font-semibold hover:text-gray-800 cursor-pointer text-red-600 transition"
                  >
                    {order.restaurant?.restaurant_name ?? "Restaurant"}
                  </Link>

                  <p className="text-xs text-gray-400">
                    Order #{order._id.slice(-6).toUpperCase()}
                  </p>
                </div>

                {/* Status */}
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full 
      ${statusColor(order.status)}`}
                >
                  {order.status}
                </span>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-4"></div>

              {/* Items */}
              <div className="flex flex-wrap gap-2">
                {order.items.map((item) => (
                  <span
                    key={item._id}
                    className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full"
                  >
                    {item.name} × {item.quantity}
                  </span>
                ))}
              </div>

              {/* Info Section */}
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Total</p>
                  <p className="font-semibold text-lg text-gray-800">
                    ₹{order.totalAmount}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-xs">Payment</p>
                  <span
                    className={`font-semibold ${
                      order.paymentStatus === "Paid"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Customer */}
              <div className="mt-4 bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-800">
                  {order.user?.name}
                </p>

                <p className="text-xs text-gray-500">{order.user?.phone}</p>

                <p className="text-xs text-gray-400 mt-1">
                  {order.user?.address}
                </p>
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-2">
                <p className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleString()}
                </p>

                {/* Action Buttons */}
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default MyOrders;
