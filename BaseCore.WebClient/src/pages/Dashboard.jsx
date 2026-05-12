import React, { useState, useEffect } from "react";
import { productApi, userApi, productTypeApi, orderApi, manufacturerApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const { isAdmin } = useAuth();

  const [stats, setStats] = useState({
    products: 0,
    types: 0,
    orders: 0,
    users: 0,
    revenue: 0,
    manufacturers: 0,
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

  // ===== LOAD DASHBOARD =====
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [productsRes, typesRes, manufacturersRes] = await Promise.all([
        productApi.getAll(),
        productTypeApi.getAll(),
        manufacturerApi.getAll(),
      ]);

      let orders = [];
      let totalOrderCount = 0;
      let usersCount = 0;

      // ===== ADMIN ONLY =====
      if (isAdmin()) {
        // USERS
        try {
          const usersRes = await userApi.getAll({ page: 1, pageSize: 1000 });
          const usersData = usersRes.data;
          usersCount =
            usersData.totalCount ??
            usersData.items?.length ??
            (Array.isArray(usersData) ? usersData.length : 0);
        } catch (err) {
          console.log("Lỗi load users:", err);
        }

        // ORDERS
        try {
          const ordersRes = await orderApi.getAll({ page: 1, pageSize: 5 });
          orders = ordersRes.data?.items || [];
          // ✅ dùng totalCount từ backend thay vì đếm array
          totalOrderCount = ordersRes.data?.totalCount || 0;
        } catch (err) {
          console.log("Orders chưa có hoặc lỗi 401 → bỏ qua");
        }
      }

      const products = getData(productsRes);
      const types = getData(typesRes);

      // ===== REVENUE =====
      // ✅ field đúng là totalPrice, không phải totalAmount
      const totalRevenue = orders.reduce(
        (sum, o) => sum + (o.totalPrice || 0),
        0
      );

      // ===== LOW STOCK =====
      const lowStockProducts = products.filter(
        (p) => p.quantity !== undefined && p.quantity < 20
      );

      // ===== SET STATE =====
      const manufacturersData = manufacturersRes.data?.items || manufacturersRes.data || [];
      const manufacturersCount = manufacturersRes.data?.totalCount || (Array.isArray(manufacturersData) ? manufacturersData.length : 0);

      setStats({
        products: products.length,
        types: types.length,
        orders: totalOrderCount,
        users: usersCount,
        revenue: totalRevenue,
        manufacturers: manufacturersCount,
      });

      setLatestOrders(orders.slice(0, 5));
      setLowStock(lowStockProducts.slice(0, 5));
    } catch (err) {
      console.error("Dashboard lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (v) => Number(v || 0).toLocaleString("vi-VN") + " đ";

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
                {/* ✅ format tiền đúng */}
                <Box title="Revenue" value={formatMoney(stats.revenue)} color="primary" icon="money-bill" />

                {isAdmin() && (
                  <Box title="Users" value={stats.users} color="warning" icon="users" />
                )}
                <Box title="Manufacturers" value={stats.manufacturers} color="secondary" icon="industry" />
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
                              <th>Khách hàng</th>
                              <th>Tổng tiền</th>
                              <th>Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {latestOrders.map((o) => (
                              <tr key={o.id}>
                                <td>{o.id}</td>
                                <td>{o.customerName || "N/A"}</td>
                                {/* ✅ totalPrice thay vì totalAmount */}
                                <td>{formatMoney(o.totalPrice)}</td>
                                <td>{o.status}</td>
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
            </>
          )}
        </div>
      </section>
    </div>
  );
};

// ===== BOX =====
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
