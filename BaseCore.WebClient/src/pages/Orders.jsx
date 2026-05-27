import React, { useEffect, useMemo, useState } from "react";
import { orderApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const Orders = () => {
  const { isAdmin } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // FILTER
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // DETAIL MODAL
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);

      const res = await orderApi.getAll();

      const items = Array.isArray(res.data)
        ? res.data
        : res.data?.items || [];

      setOrders(items);
    } catch (err) {
      console.log("Load orders failed", err);
      alert("Không tải được danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (v) => Number(v || 0).toLocaleString("vi-VN") + " đ";

  const formatOrderCode = (id) => `ORD${String(id).padStart(5, "0")}`;

  const formatDateTime = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("vi-VN");
  };

  const getOrderItems = (order) => {
    return order?.items || order?.orderDetails || order?.details || [];
  };

  const getOrderTotal = (order) => {
    return (
      order?.finalAmount ??
      order?.totalPrice ??
      order?.totalAmount ??
      order?.amount ??
      0
    );
  };

  const getPaymentStatus = (order) => {
    return order?.paymentStatus || "Unpaid";
  };

  const getCustomerPhone = (order) => {
    return order?.customerPhone || order?.phone || order?.shippingPhone || "—";
  };

  const getCustomerEmail = (order) => {
    return order?.customerEmail || order?.email || "—";
  };

  const getShippingAddress = (order) => {
    return order?.shippingAddress || order?.address || "—";
  };

  const orderStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <span className="badge badge-warning">Chờ xác nhận</span>;
      case "Confirmed":
        return <span className="badge badge-info">Đã xác nhận</span>;
      case "Packing":
        return <span className="badge badge-primary">Đang đóng gói</span>;
      case "Shipping":
        return <span className="badge badge-secondary">Đang giao hàng</span>;
      case "Completed":
        return <span className="badge badge-success">Hoàn tất</span>;
      case "Cancelled":
        return <span className="badge badge-danger">Đã hủy</span>;
      case "Returned":
        return <span className="badge badge-dark">Đã hoàn trả</span>;
      default:
        return <span className="badge badge-dark">Không xác định</span>;
    }
  };

  const paymentStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return <span className="badge badge-success">Đã thanh toán</span>;
      case "Unpaid":
        return <span className="badge badge-warning">Chưa thanh toán</span>;
      case "Refunded":
        return <span className="badge badge-info">Đã hoàn tiền</span>;
      case "Failed":
        return <span className="badge badge-danger">Thanh toán lỗi</span>;
      default:
        return <span className="badge badge-secondary">Chưa thanh toán</span>;
    }
  };

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return orders.filter((o) => {
      const orderCode = formatOrderCode(o.id).toLowerCase();
      const customerName = (o.customerName || "").toLowerCase();
      const phone = getCustomerPhone(o).toLowerCase();

      const matchSearch =
        !keyword ||
        orderCode.includes(keyword) ||
        customerName.includes(keyword) ||
        phone.includes(keyword);

      const matchStatus = !statusFilter || o.status === statusFilter;

      const matchPayment =
        !paymentFilter || getPaymentStatus(o) === paymentFilter;

      const createdAt = o.createdAt ? new Date(o.createdAt) : null;

      const matchFromDate =
        !fromDate || (createdAt && createdAt >= new Date(fromDate));

      const matchToDate =
        !toDate ||
        (createdAt && createdAt <= new Date(`${toDate}T23:59:59`));

      return (
        matchSearch &&
        matchStatus &&
        matchPayment &&
        matchFromDate &&
        matchToDate
      );
    });
  }, [orders, search, statusFilter, paymentFilter, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));

  const paginatedData = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const openDetail = async (order) => {
    setSelectedOrder(order);

    if (!orderApi.getById) return;

    try {
      setDetailLoading(true);
      const res = await orderApi.getById(order.id);
      setSelectedOrder(res.data);
    } catch (err) {
      console.log("Load order detail failed", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedOrder(null);
    setDetailLoading(false);
  };

  const updateOrderStatus = async (id, nextStatus) => {
    const confirmText = {
      Confirmed: "Xác nhận đơn hàng này?",
      Packing: "Chuyển đơn sang trạng thái đang đóng gói?",
      Shipping: "Chuyển đơn sang trạng thái đang giao hàng?",
      Completed: "Hoàn tất đơn hàng này?",
    };

    if (!window.confirm(confirmText[nextStatus] || "Cập nhật trạng thái đơn hàng?")) {
      return;
    }

    try {
      await orderApi.updateStatus(id, nextStatus);
      await loadOrders();

      if (selectedOrder?.id === id) {
        closeDetail();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Cập nhật trạng thái thất bại. Kiểm tra lại API updateStatus.");
    }
  };

  const cancelOrder = async (id) => {
    const reason = window.prompt("Nhập lý do hủy đơn:");

    if (reason === null) return;

    if (!reason.trim()) {
      alert("Vui lòng nhập lý do hủy đơn");
      return;
    }

    try {
      await orderApi.cancel(id, reason);
      await loadOrders();

      if (selectedOrder?.id === id) {
        closeDetail();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Hủy đơn thất bại. Kiểm tra lại API cancel.");
    }
  };

  const markAsPaid = async (id) => {
    if (!window.confirm("Xác nhận đơn hàng đã thanh toán?")) return;

    try {
      await orderApi.updatePayment(id, "Paid");
      await loadOrders();

      if (selectedOrder?.id === id) {
        closeDetail();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Cập nhật thanh toán thất bại. Kiểm tra lại API updatePayment.");
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const renderActions = (order) => {
    return (
      <div className="d-flex flex-wrap align-items-center" style={{ gap: 6 }}>
        <button
          className="btn btn-sm btn-info"
          onClick={() => openDetail(order)}
        >
          Xem
        </button>

        {isAdmin() && order.status === "Pending" && (
          <>
            <button
              className="btn btn-sm btn-success"
              onClick={() => updateOrderStatus(order.id, "Confirmed")}
            >
              Xác nhận
            </button>

            <button
              className="btn btn-sm btn-danger"
              onClick={() => cancelOrder(order.id)}
            >
              Hủy
            </button>
          </>
        )}

        {isAdmin() && order.status === "Confirmed" && (
          <>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => updateOrderStatus(order.id, "Packing")}
            >
              Đóng gói
            </button>

            <button
              className="btn btn-sm btn-danger"
              onClick={() => cancelOrder(order.id)}
            >
              Hủy
            </button>
          </>
        )}

        {isAdmin() && order.status === "Packing" && (
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => updateOrderStatus(order.id, "Shipping")}
          >
            Giao hàng
          </button>
        )}

        {isAdmin() && order.status === "Shipping" && (
          <button
            className="btn btn-sm btn-success"
            onClick={() => updateOrderStatus(order.id, "Completed")}
          >
            Hoàn tất
          </button>
        )}

        {order.status === "Completed" && (
          <button className="btn btn-sm btn-dark" onClick={printInvoice}>
            In
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="content-wrapper">
      <style>{`
        .orders-table {
          min-width: 1180px;
        }

        .orders-table th,
        .orders-table td {
          vertical-align: middle !important;
        }

        .orders-table th {
          white-space: nowrap;
          font-weight: 700;
        }

        .orders-table .badge {
          font-size: 0.85rem;
          white-space: nowrap;
        }

        .order-code {
          color: #4f46e5;
          font-weight: 700;
        }
      `}</style>

      <div className="content-header">
        <h1 className="ml-3">Quản lý đơn hàng</h1>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="card p-3 mb-3">
            <div className="row" style={{ rowGap: 10 }}>
              <div className="col-md-3">
                <input
                  className="form-control"
                  placeholder="Tìm mã đơn, tên khách, SĐT..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="col-md-2">
                <select
                  className="form-control"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="Pending">Chờ xác nhận</option>
                  <option value="Confirmed">Đã xác nhận</option>
                  <option value="Packing">Đang đóng gói</option>
                  <option value="Shipping">Đang giao hàng</option>
                  <option value="Completed">Hoàn tất</option>
                  <option value="Cancelled">Đã hủy</option>
                  <option value="Returned">Đã hoàn trả</option>
                </select>
              </div>

              <div className="col-md-2">
                <select
                  className="form-control"
                  value={paymentFilter}
                  onChange={(e) => {
                    setPaymentFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Tất cả thanh toán</option>
                  <option value="Unpaid">Chưa thanh toán</option>
                  <option value="Paid">Đã thanh toán</option>
                  <option value="Refunded">Đã hoàn tiền</option>
                  <option value="Failed">Thanh toán lỗi</option>
                </select>
              </div>

              <div className="col-md-2">
                <input
                  type="date"
                  className="form-control"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="col-md-2">
                <input
                  type="date"
                  className="form-control"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="col-md-1">
                <button
                  className="btn btn-secondary btn-block"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("");
                    setPaymentFilter("");
                    setFromDate("");
                    setToDate("");
                    setCurrentPage(1);
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary"></div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-striped table-hover mb-0 orders-table">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Số điện thoại</th>
                        <th>Tổng tiền</th>
                        <th>Thanh toán</th>
                        <th>Trạng thái đơn</th>
                        <th>Ngày tạo</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedData.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center py-4">
                            Không có đơn hàng
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map((o) => (
                          <tr key={o.id}>
                            <td>
                              <span className="order-code">
                                {formatOrderCode(o.id)}
                              </span>
                            </td>

                            <td>{o.customerName || "N/A"}</td>
                            <td>{getCustomerPhone(o)}</td>

                            <td className="text-right">
                              {formatMoney(getOrderTotal(o))}
                            </td>

                            <td className="text-center">
                              {paymentStatusBadge(getPaymentStatus(o))}
                            </td>

                            <td className="text-center">
                              {orderStatusBadge(o.status)}
                            </td>

                            <td>{formatDateTime(o.createdAt)}</td>

                            <td>{renderActions(o)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3 mb-3">
            <div>
              Tổng: <strong>{filteredOrders.length}</strong> đơn hàng
            </div>

            <div className="d-flex align-items-center" style={{ gap: 8 }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                ← Trước
              </button>

              <span>
                Trang <strong>{currentPage}</strong> / {totalPages}
              </span>

              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Sau →
              </button>
            </div>
          </div>
        </div>
      </section>

      {selectedOrder && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5>
                    Chi tiết đơn hàng {formatOrderCode(selectedOrder.id)}
                  </h5>

                  <button className="close" onClick={closeDetail}>
                    <span>&times;</span>
                  </button>
                </div>

                <div className="modal-body">
                  {detailLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary"></div>
                    </div>
                  ) : (
                    <>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-header">
                              <strong>Thông tin khách hàng</strong>
                            </div>
                            <div className="card-body">
                              <p><strong>Khách hàng:</strong> {selectedOrder.customerName || "N/A"}</p>
                              <p><strong>Số điện thoại:</strong> {getCustomerPhone(selectedOrder)}</p>
                              <p><strong>Email:</strong> {getCustomerEmail(selectedOrder)}</p>
                              <p><strong>Địa chỉ giao hàng:</strong> {getShippingAddress(selectedOrder)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-header">
                              <strong>Thông tin đơn hàng</strong>
                            </div>
                            <div className="card-body">
                              <p><strong>Mã đơn:</strong> {formatOrderCode(selectedOrder.id)}</p>
                              <p><strong>Ngày tạo:</strong> {formatDateTime(selectedOrder.createdAt)}</p>
                              <p><strong>Trạng thái đơn:</strong> {orderStatusBadge(selectedOrder.status)}</p>
                              <p><strong>Thanh toán:</strong> {paymentStatusBadge(getPaymentStatus(selectedOrder))}</p>
                              <p><strong>Phương thức:</strong> {selectedOrder.paymentMethod || "—"}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="card">
                        <div className="card-header">
                          <strong>Sản phẩm trong đơn</strong>
                        </div>

                        <div className="card-body p-0">
                          <table className="table table-bordered mb-0">
                            <thead>
                              <tr>
                                <th>Sản phẩm</th>
                                <th className="text-center">Số lượng</th>
                                <th className="text-right">Đơn giá</th>
                                <th className="text-right">Thành tiền</th>
                              </tr>
                            </thead>

                            <tbody>
                              {getOrderItems(selectedOrder).length === 0 ? (
                                <tr>
                                  <td colSpan="4" className="text-center py-3">
                                    Chưa có dữ liệu sản phẩm
                                  </td>
                                </tr>
                              ) : (
                                getOrderItems(selectedOrder).map((item, idx) => {
                                  const unitPrice = item.unitPrice ?? item.price ?? 0;
                                  const quantity = item.quantity ?? 0;
                                  const lineTotal =
                                    item.totalPrice ?? item.total ?? unitPrice * quantity;

                                  return (
                                    <tr key={item.id || idx}>
                                      <td>{item.productName || item.name || "Sản phẩm"}</td>
                                      <td className="text-center">{quantity}</td>
                                      <td className="text-right">{formatMoney(unitPrice)}</td>
                                      <td className="text-right">{formatMoney(lineTotal)}</td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-header">
                              <strong>Ghi chú</strong>
                            </div>
                            <div className="card-body">
                              <p>{selectedOrder.note || selectedOrder.customerNote || "Không có ghi chú"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-header">
                              <strong>Tổng thanh toán</strong>
                            </div>
                            <div className="card-body text-right">
                              <p>
                                <strong>Tạm tính:</strong>{" "}
                                {formatMoney(selectedOrder.totalPrice || selectedOrder.totalAmount)}
                              </p>
                              <p>
                                <strong>Giảm giá:</strong>{" "}
                                {formatMoney(selectedOrder.discountAmount)}
                              </p>
                              <p>
                                <strong>Phí vận chuyển:</strong>{" "}
                                {formatMoney(selectedOrder.shippingFee)}
                              </p>
                              <h4>
                                <strong>Khách cần trả:</strong>{" "}
                                {formatMoney(getOrderTotal(selectedOrder))}
                              </h4>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="modal-footer">
                  {isAdmin() && getPaymentStatus(selectedOrder) !== "Paid" && (
                    <button
                      className="btn btn-success"
                      onClick={() => markAsPaid(selectedOrder.id)}
                    >
                      Xác nhận đã thanh toán
                    </button>
                  )}

                  {renderActions(selectedOrder)}

                  <button className="btn btn-secondary" onClick={closeDetail}>
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