import React, { useEffect, useState } from "react";
import { orderApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const { isAdmin } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getAll();
      setOrders(res.data || []);
    } catch (err) {
      console.log("Load orders failed", err);
    } finally {
      setLoading(false);
    }
  };

  // PAGINATION
  const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));

  const paginatedData = orders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // FORMAT
  const formatMoney = (v) => Number(v || 0).toLocaleString("vi-VN") + " đ";

  const getStatus = (status) => {
    switch (status) {
      case 0:
        return <span className="badge badge-secondary">Mới</span>;
      case 1:
        return <span className="badge badge-info">Đang xử lý</span>;
      case 2:
        return <span className="badge badge-success">Hoàn thành</span>;
      case 3:
        return <span className="badge badge-danger">Đã huỷ</span>;
      default:
        return <span className="badge badge-dark">Không rõ</span>;
    }
  };

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <h1 className="ml-3">Quản lý đơn hàng (Bill)</h1>
      </div>

      <section className="content">
        <div className="container-fluid">
          {/* TABLE */}
          <div className="card">
            <div className="card-body">
              {loading ? (
                <div className="text-center">Loading...</div>
              ) : (
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Khách hàng</th>
                      <th>Tổng tiền</th>
                      <th>Ngày tạo</th>
                      <th>Trạng thái</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center">
                          Không có đơn hàng
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((o) => (
                        <tr key={o.id}>
                          <td>{o.id}</td>
                          <td>{o.userName || "N/A"}</td>
                          <td>{formatMoney(o.totalAmount)}</td>
                          <td>{new Date(o.createdAt).toLocaleString()}</td>
                          <td>{getStatus(o.status)}</td>

                          <td>
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() => setSelectedOrder(o)}
                            >
                              👁 Xem
                            </button>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => navigate(`/orders/${order.id}`)}
                            >
                              👁
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* PAGINATION + TOTAL */}
          <div className="d-flex justify-content-between mt-3">
            <div>Total: {orders.length} đơn hàng</div>

            <div>
              <button
                className="btn btn-secondary mr-2"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                ← Previous
              </button>
              Trang {currentPage} / {totalPages}
              <button
                className="btn btn-secondary ml-2"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL DETAIL */}
      {selectedOrder && (
        <>
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5>Chi tiết đơn #{selectedOrder.id}</h5>
                  <button
                    className="close"
                    onClick={() => setSelectedOrder(null)}
                  >
                    <span>&times;</span>
                  </button>
                </div>

                <div className="modal-body">
                  <p>
                    <b>Khách hàng:</b> {selectedOrder.userName}
                  </p>
                  <p>
                    <b>Tổng tiền:</b> {formatMoney(selectedOrder.totalAmount)}
                  </p>
                  <p>
                    <b>Trạng thái:</b> {getStatus(selectedOrder.status)}
                  </p>

                  <hr />

                  <h6>Sản phẩm:</h6>

                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Tên</th>
                        <th>Giá</th>
                        <th>Số lượng</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedOrder.items || []).map((i, idx) => (
                        <tr key={idx}>
                          <td>{i.productName}</td>
                          <td>{formatMoney(i.price)}</td>
                          <td>{i.quantity}</td>
                          <td>{formatMoney(i.price * i.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default Orders;
