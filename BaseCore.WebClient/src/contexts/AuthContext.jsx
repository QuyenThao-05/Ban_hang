import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/api";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  // LOAD USER KHI MỞ APP
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      navigate("/login");
    } else if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error("Parse user error:", err);
        navigate("/login");
      }
    }

    setLoading(false);
  }, []);

  // LOGIN
  const login = async (username, password) => {
    try {
      const response = await authApi.login(username, password);
      const data = response.data;

      localStorage.setItem("token", data.token);

      const userData = data.user
        ? data.user
        : {
            username: username,
            role: data.role || "user",
          };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      // 🔥 PHÂN LUỒNG NGAY TẠI ĐÂY
      if (userData.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/"); // web thường
      }

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      return { success: false, message };
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.clear();

    navigate("/login");
  };

  // CHECK ADMIN
  const isAdmin = () => {
    return user?.role?.toLowerCase() === "admin";
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
