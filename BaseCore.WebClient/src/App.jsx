import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import MainLayout from "./components/MainLayout";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Users from "./pages/Users";
import ProductTypes from "./pages/ProductTypes";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout>
            <Dashboard />
          </MainLayout>
        }
      />

      <Route
        path="/products"
        element={
          <MainLayout>
            <Products />
          </MainLayout>
        }
      />

      <Route
        path="/users"
        element={
          <MainLayout>
            <Users />
          </MainLayout>
        }
      />

      <Route
        path="/product-types"
        element={
          <MainLayout>
            <ProductTypes />
          </MainLayout>
        }
      />

      <Route
        path="/orders"
        element={
          <MainLayout>
            <Orders />
          </MainLayout>
        }
      />

      <Route
        path="/orders/:id"
        element={
          <MainLayout>
            <OrderDetail />
          </MainLayout>
        }
      />

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