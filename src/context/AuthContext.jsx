import { createContext, useContext, useState } from "react";
import { loginAPI, signupAPI, logoutAPI } from "../api/authAPI";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("userInfo");
    return stored ? JSON.parse(stored) : null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Signup ──────────────────────────────────────────────
  const signup = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await signupAPI(formData);
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Signup failed";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // ── Login ───────────────────────────────────────────────
  const login = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await loginAPI(formData);

      if (data.isBlocked) {
        const msg = "Your account has been blocked. Contact support.";
        setError(msg);
        return { success: false, message: msg };
      }

      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      return { success: true, role: data.role };
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ──────────────────────────────────────────────
  const logout = async () => {
    try {
      await logoutAPI();
    } catch (_) {
      // even if API fails, clear local state
    } finally {
      setUser(null);
      localStorage.removeItem("userInfo");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signup, login, logout, setError }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);
