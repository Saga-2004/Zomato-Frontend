import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Button from "../components/Button";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.post("/users/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        ...(formData.phone && { phone: formData.phone }),
      });
      const user = res.data;
      localStorage.setItem("userInfo", JSON.stringify(user));
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: { message: "Sign up successful!", type: "success" },
        }),
      );
      if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "restaurant_owner") navigate("/owner/dashboard");
      else if (user.role === "delivery_partner")
        navigate("/delivery/dashboard");
      else navigate("/");
    } catch (error) {
      const message = error.response?.data?.message || "Sign up failed";
      window.dispatchEvent(
        new CustomEvent("appToast", { detail: { message, type: "error" } }),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <Link
        to="/"
        className="text-red-600 font-bold text-xl mb-6 hover:underline"
      >
        ← Zomato
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Sign up
        </h1>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
              required
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              placeholder="Phone number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
            />
          </div>
          <Button
            type="submit"
            loading={submitting}
            className="w-full text-white py-3 bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {submitting ? "Signing up..." : "Sign up"}
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-red-600 font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
