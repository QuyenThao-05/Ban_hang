import React, { useState, useEffect } from "react";
import {
  productApi,
  userApi,
  productTypeApi,
  orderApi,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const { isAdmin } = useAuth();

  const [stats, setStats] = useState({
    products: 0,
    types: 0,
    orders: 0,
    users: 0,
    revenue: 0,
  });

  const [latestOrders, setLatestOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  const [loading, setLoading] = useState(true);

  // ===== HELPER =====
  const getData = (res) => {
    if (!res || !res.data) return [];
    if (Array.isArray(res.data)) return res.data;
    if (res.data.items) return res.data.items;
    return [];
  };

  // ===== LOAD =====
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [productsRes, typesRes] = await Promise.all([
        productApi.getAll(),
        productTypeApi.getAll(),
      ]);

      let ordersRes = { data: [] };
      let usersCount = 0;

      if (isAdmin()) {
        try {
          ordersRes = await orderApi.getAll();

          const usersRes = await userApi.getAll({
            page: 1,
            pageSize: 1,
          });

          usersCount = usersRes.data.totalCount || 0;
        } catch (e) {
          console.log("Admin API lỗi");
        }
      }

      const products = getData(productsRes);
      const orders = getData(ordersRes);

      // ===== REVENUE =====
      const totalRevenue = orders.reduce(
        (sum, o) => sum + (o.totalAmount || 0),
        0
      );

      // ===== LOW STOCK =====
      const lowStockProducts = products.filter(
        (p) => p.quantity !== undefined && p.quantity < 20
      );

      setStats({
        products: products.length,
        types: getData(typesRes).length,
        orders: orders.length,
        users: usersCount,
        revenue: totalRevenue,
      });

      setLatestOrders(orders.slice(0, 5));
      setLowStock(lowStockProducts.slice(0, 5));
    } catch (err) {
      console.error("Dashboard lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  // ===== UI =====
  return (
    <div className="content-wrapper">
      <div className="content-header">
        <div className="container-fluid">
          <h1>Dashboard Admin VPP</h1>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <>
              {/* ===== TOP STATS ===== */}
              <div className="row">
                <Box title="Products" value={stats.products} color="info" icon="box" />
                <Box title="Product Types" value={stats.types} color="success" icon="tags" />
                <Box title="Orders" value={stats.orders} color="danger" icon="shopping-cart" />
                <Box title="Revenue" value={stats.revenue + "đ"} color="primary" icon="money-bill" />

                {isAdmin() && (
                  <Box title="Users" value={stats.users} color="warning" icon="users" />
                )}
              </div>

              {/* ===== ORDERS ===== */}
              <div className="row mt-3">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <h3>Đơn hàng gần đây</h3>
                    </div>
                    <div className="card-body">
                      {latestOrders.length === 0 ? (
                        <p>Không có đơn hàng</p>
                      ) : (
                        <table className="table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Tổng tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {latestOrders.map((o) => (
                              <tr key={o.id}>
                                <td>{o.id}</td>
                                <td>{o.totalAmount}đ</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>

                {/* ===== LOW STOCK ===== */}
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <h3>Sắp hết hàng ⚠️</h3>
                    </div>
                    <div className="card-body">
                      {lowStock.length === 0 ? (
                        <p>Không có</p>
                      ) : (
                        <ul>
                          {lowStock.map((p) => (
                            <li key={p.id}>
                              {p.name} - còn {p.quantity}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ===== INFO ===== */}
              <div className="card mt-3">
                <div className="card-header">
                  <h3>Hệ thống quản lý VPP</h3>
                </div>
                <div className="card-body">
                  <ul>
                    <li>Quản lý sản phẩm</li>
                    <li>Quản lý loại sản phẩm</li>
                    <li>Quản lý đơn hàng (Bill)</li>
                    <li>Quản lý người dùng</li>
                    <li>Theo dõi doanh thu</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

// ===== BOX COMPONENT =====
const Box = ({ title, value, color, icon }) => (
  <div className="col-lg-3 col-6">
    <div className={`small-box bg-${color}`}>
      <div className="inner">
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
      <div className="icon">
        <i className={`fas fa-${icon}`}></i>
      </div>
    </div>
  </div>
);

export default Dashboard;