import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  productApi,
  userApi,
  productTypeApi,
  orderApi,
  manufacturerApi,
  couponApi,
  feedbackApi,
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
    manufacturers: 0,
    coupons: 0,
    feedbacks: 0,
  });

  const [latestOrders, setLatestOrders] = useState([]);
  const [latestFeedbacks, setLatestFeedbacks] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ===== HELPER =====
  const getData = (res) => {
    if (!res || !res.data) return [];
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data.items)) return res.data.items;
    return [];
  };

  const getCount = (res) => {
    if (!res || !res.data) return 0;
    if (res.data.totalCount !== undefined) return res.data.totalCount;
    if (Array.isArray(res.data.items)) return res.data.items.length;
    if (Array.isArray(res.data)) return res.data.length;
    return 0;
  };

  const formatMoney = (v) => Number(v || 0).toLocaleString("vi-VN") + " đ";

  const formatDateTime = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("vi-VN");
  };

  const feedbackStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <span className="badge badge-warning">Chờ duyệt</span>;
      case "Approved":
        return <span className="badge badge-success">Đã hiển thị</span>;
      case "Hidden":
        return <span className="badge badge-secondary">Đã ẩn</span>;
      case "Replied":
        return <span className="badge badge-info">Đã phản hồi</span>;
      default:
        return <span className="badge badge-dark">Không xác định</span>;
    }
  };

  const renderStars = (rating) => {
    const value = Number(rating || 0);

    return (
      <span style={{ color: "#f59e0b", fontWeight: 700, whiteSpace: "nowrap" }}>
        {"★".repeat(value)}
        {"☆".repeat(5 - value)}
      </span>
    );
  };

  // ===== LOAD DASHBOARD =====
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [
        productsRes,
        typesRes,
        manufacturersRes,
        couponsRes,
        feedbackRes,
      ] = await Promise.all([
        productApi.getAll(),
        productTypeApi.getAll(),
        manufacturerApi.getAll(),
        couponApi.getAll(),
        feedbackApi.getAll({ page: 1, pageSize: 5 }),
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
          const ordersRes = await orderApi.getAll({ page: 1, pageSize: 1000 });

          orders = ordersRes.data?.items || [];
          totalOrderCount = ordersRes.data?.totalCount || orders.length;
        } catch (err) {
          console.log("Orders chưa có hoặc lỗi 401 → bỏ qua", err);
        }
      }

      const products = getData(productsRes);
      const totalProducts =
      productsRes.data?.totalCount ??
      products.length;
      const types = getData(typesRes);
      const manufacturersCount = getCount(manufacturersRes);
      const couponsCount = getCount(couponsRes);
      const feedbacks = getData(feedbackRes);
      const feedbackCount = getCount(feedbackRes);

      // ===== REVENUE =====
      // Hiện tại chỉ tính theo 5 đơn hàng gần nhất vì API order đang lấy pageSize = 5.
      // Nếu muốn doanh thu toàn bộ đơn, backend nên có API thống kê riêng.
      const totalRevenue = orders.reduce(
        (sum, o) => sum + Number(o.totalPrice || o.totalAmount || o.finalAmount || 0),
        0
      );

      // ===== LOW STOCK =====
      const lowStockProducts = products.filter(
        (p) => p.quantity !== undefined && Number(p.quantity) < 20
      );

      // ===== SET STATE =====
      setStats({
        products: totalProducts,
        types: types.length,
        orders: totalOrderCount,
        users: usersCount,
        revenue: totalRevenue,
        manufacturers: manufacturersCount,
        coupons: couponsCount,
        feedbacks: feedbackCount,
      });

      setLatestOrders(orders.slice(0, 5));
      setLatestFeedbacks(feedbacks.slice(0, 5));
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
      <style>{`
        .dashboard-table th,
        .dashboard-table td {
          vertical-align: middle !important;
        }

        .dashboard-table th {
          text-align: center;
          white-space: nowrap;
        }

        .dashboard-feedback-content {
          max-width: 260px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bg-purple {
          background-color: #6f42c1 !important;
          color: #fff !important;
        }
      `}</style>

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
                <Box title="Products" value={stats.products} color="info" icon="box" onClick={()=>navigate("/products")} />
                <Box title="Product Types" value={stats.types} color="success" icon="tags" onClick={()=>navigate("/product-types")} />
                <Box title="Orders" value={stats.orders} color="danger" icon="shopping-cart" onClick={()=>navigate("/orders")} />
                <Box title="Revenue" value={formatMoney(stats.revenue)} color="primary" icon="money-bill"  />

                {isAdmin() && (
                  <Box title="Users" value={stats.users} color="warning" icon="users" onClick={()=>navigate("/users")} />
                )}

                <Box title="Manufacturers" value={stats.manufacturers} color="secondary" icon="industry" onClick={()=>navigate("/manufacturers")} />
                <Box title="Coupons" value={stats.coupons} color="purple" icon="ticket-alt" onClick={()=>navigate("/coupons")} />
                <Box title="Feedbacks" value={stats.feedbacks} color="info" icon="comments" onClick={()=>navigate("/feedbacks")} />
              </div>

              <div className="row mt-3">
                {/* ===== ORDERS ===== */}
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">Đơn hàng gần đây</h3>
                    </div>

                    <div className="card-body">
                      {latestOrders.length === 0 ? (
                        <p>Không có đơn hàng</p>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-bordered table-striped dashboard-table">
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
                                  <td className="text-center">{o.id}</td>
                                  <td>{o.customerName || "N/A"}</td>
                                  <td className="text-right">
                                    {formatMoney(o.totalPrice || o.totalAmount || o.finalAmount)}
                                  </td>
                                  <td className="text-center">{o.status || "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ===== LOW STOCK ===== */}
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">Sắp hết hàng ⚠️</h3>
                    </div>

                    <div className="card-body">
                      {lowStock.length === 0 ? (
                        <p>Không có</p>
                      ) : (
                        <ul className="mb-0">
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

              {/* ===== FEEDBACK ===== */}
              <div className="row mt-3">
                <div className="col-md-12">
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">Phản hồi khách hàng gần đây</h3>
                    </div>

                    <div className="card-body">
                      {latestFeedbacks.length === 0 ? (
                        <p>Không có phản hồi</p>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-bordered table-striped dashboard-table">
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Khách hàng</th>
                                <th>Sản phẩm</th>
                                <th>Nội dung</th>
                                <th>Đánh giá</th>
                                <th>Trạng thái</th>
                                <th>Ngày gửi</th>
                              </tr>
                            </thead>

                            <tbody>
                              {latestFeedbacks.map((fb) => (
                                <tr key={fb.id}>
                                  <td className="text-center">{fb.id}</td>
                                  <td>{fb.customerName || "N/A"}</td>
                                  <td>{fb.productName || fb.orderCode || "—"}</td>
                                  <td className="dashboard-feedback-content">
                                    {fb.content || "—"}
                                  </td>
                                  <td className="text-center">{renderStars(fb.rating)}</td>
                                  <td className="text-center">{feedbackStatusBadge(fb.status)}</td>
                                  <td>{formatDateTime(fb.createdAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
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
const Box = ({ title, value, color, icon,onClick }) => (
  <div className="col-lg-3 col-6">
    <div
        className={`small-box bg-${color}`} style={{ cursor: "pointer"}}
        onClick={onClick}
      >
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
