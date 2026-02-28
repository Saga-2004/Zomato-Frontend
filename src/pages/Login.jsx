import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Button from "../components/Button";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false); // ✅ moved here

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); // ✅ moved here

    try {
      const response = await API.post("/users/login", {
        email,
        password,
      });

      const user = response.data;
      localStorage.setItem("userInfo", JSON.stringify(user));

      if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "restaurant_owner") navigate("/owner/dashboard");
      else if (user.role === "delivery_partner")
        navigate("/delivery/dashboard");
      else navigate("/");
    } catch (error) {
      const message = error.response?.data?.message || "";
      const isSuspended =
        typeof message === "string" &&
        (message.toLowerCase().includes("suspended") ||
          message.toLowerCase().includes("blocked"));

      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message: isSuspended
              ? "Your account is suspended."
              : message || "Login failed.",
            type: "error",
          },
        }),
      );
    } finally {
      setSubmitting(false); // ✅ important
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
          Log in
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            required
          />

          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            required
          />

          <Button
            type="submit"
            loading={submitting}
            className="w-full text-white py-3 bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {submitting ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-red-600 font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
