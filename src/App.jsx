import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Toast from "./components/Toast";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RestaurantDetails from "./pages/RestaurantDetails";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";

// Admin
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import UserDetail from "./pages/admin/UserDetail";
import Restaurants from "./pages/admin/Restaurants";
import Orders from "./pages/admin/Orders";
import AddRestaurant from "./pages/admin/AddRestaurant";
import DeliveryPartners from "./pages/admin/DeliveryPartners";

// Owner
import OwnerLayout from "./layouts/OwnerLayout";
import OwnerDashboard from "./pages/owner/Dashboard";
import OwnerOrders from "./pages/owner/Orders";
import OwnerMenu from "./pages/owner/Menu";
import OwnerOffers from "./pages/owner/Offers";

// Delivery
import DeliveryLayout from "./layouts/DeliveryLayout";
import DeliveryDashboard from "./pages/delivery/Dashboard";

function App() {
  return (
    <>
      <Toast />
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />

        <Route path="/restaurant/:id" element={<RestaurantDetails />} />

        {/* ================= CUSTOMER ROUTES ================= */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-orders"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <MyOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
                "customer",
                "restaurant_owner",
                "delivery_partner",
              ]}
            >
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ROUTES ================= */}

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/add-restaurant"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <AddRestaurant />{" "}
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <Users />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:userId"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <UserDetail />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/restaurants"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <Restaurants />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <Orders />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/delivery-partners"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <DeliveryPartners />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* ================= OWNER ROUTES ================= */}
        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute allowedRoles={["restaurant_owner"]}>
              <OwnerLayout>
                <OwnerDashboard />
              </OwnerLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/menu"
          element={
            <ProtectedRoute allowedRoles={["restaurant_owner"]}>
              <OwnerLayout>
                <OwnerMenu />
              </OwnerLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/orders"
          element={
            <ProtectedRoute allowedRoles={["restaurant_owner"]}>
              <OwnerLayout>
                <OwnerOrders />
              </OwnerLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/offers"
          element={
            <ProtectedRoute allowedRoles={["restaurant_owner"]}>
              <OwnerLayout>
                <OwnerOffers />
              </OwnerLayout>
            </ProtectedRoute>
          }
        />

        {/* ================= DELIVERY ROUTES ================= */}
        <Route
          path="/delivery/dashboard"
          element={
            <ProtectedRoute allowedRoles={["delivery_partner"]}>
              <DeliveryLayout>
                <DeliveryDashboard />
              </DeliveryLayout>
            </ProtectedRoute>
          }
        />
        {/* Optional alias so /delivery/orders also works */}
        <Route
          path="/delivery/orders"
          element={
            <ProtectedRoute allowedRoles={["delivery_partner"]}>
              <DeliveryLayout>
                <DeliveryDashboard />
              </DeliveryLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
