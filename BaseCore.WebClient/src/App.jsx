import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import React from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import MainLayout from "./components/MainLayout";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Users from "./pages/Users";
import ProductTypes from "./pages/ProductTypes";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Login from "./pages/Login";

// 🔥 ROUTE ADMIN
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" />;

  if (user.role !== "admin") return <Navigate to="/" />;

  return children;
};

// 🔥 ROUTE USER
const UserRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" />;

  return children;
};

// 🔥 HOME PHÂN LUỒNG
const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" />;

  // ADMIN → dashboard
  if (user.role === "admin") {
    return <Navigate to="/dashboard" />;
  }

  // USER → HTML electro
  window.location.href = "/electro-master/index.html";
  return null;
};

function AppRoutes() {
  return (
    <Routes>
      {/* LOGIN */}
      <Route path="/login" element={<Login />} />

      {/* HOME */}
      <Route path="/" element={<HomeRedirect />} />

      {/* ADMIN */}
      <Route
        path="/dashboard"
        element={
          <AdminRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/products"
        element={
          <AdminRoute>
            <MainLayout>
              <Products />
            </MainLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/users"
        element={
          <AdminRoute>
            <MainLayout>
              <Users />
            </MainLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/product-types"
        element={
          <AdminRoute>
            <MainLayout>
              <ProductTypes />
            </MainLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <AdminRoute>
            <MainLayout>
              <Orders />
            </MainLayout>
          </AdminRoute>
        }
      />

      <Route
        path="/orders/:id"
        element={
          <AdminRoute>
            <MainLayout>
              <OrderDetail />
            </MainLayout>
          </AdminRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;