import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;

        setUser(
          parsedUser || { role: localStorage.getItem("role") || "Admin" },
        );
      } catch {
        setUser({ role: "Admin" });
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authApi.login(username, password);
      const userData = response.data;

      localStorage.setItem("token", data.token);

      localStorage.setItem(
        "user",
        JSON.stringify({
          username: username,
          role: data.role,
        }),
      );
      setUser(userData);

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === "Admin";
  };

  const value = {
    user,
    login,
    logout,
    isAdmin,
    isAuthenticated: !!localStorage.getItem("token"),
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
