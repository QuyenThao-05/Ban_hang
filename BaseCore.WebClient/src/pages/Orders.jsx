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

  // EDIT MODAL: chỉ sửa trạng thái đơn và trạng thái thanh toán
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState({
    status: "Pending",
    paymentStatus: "Unpaid",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const ORDER_STATUS_VALUES = [
    "Pending",
    "Confirmed",
    "Packing",
    "Shipping",
    "Completed",
    "Cancelled",
    "Returned",
  ];

  const PAYMENT_STATUS_VALUES = ["Unpaid", "Paid", "Refunded", "Failed"];

  const DEFAULT_ORDER_STATUS = "Pending";
  const DEFAULT_PAYMENT_STATUS = "Unpaid";

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);

      const res = await orderApi.getAll();

      const items = Array.isArray(res.data) ? res.data : res.data?.items || [];

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

  const getNumberByKeys = (obj, keys) => {
    for (const key of keys) {
      const value = obj?.[key];
      if (value !== undefined && value !== null && value !== "") {
        const numberValue = Number(value);
        if (!Number.isNaN(numberValue)) return numberValue;
      }
    }

    return null;
  };

  const toArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;

    // Một số API .NET trả dạng { $values: [...] }
    if (Array.isArray(value.$values)) return value.$values;

    // Một số API trả dạng { items: [...] } hoặc { data: [...] }
    if (Array.isArray(value.items)) return value.items;
    if (Array.isArray(value.data)) return value.data;

    return [];
  };

  const getOrderItems = (order) => {
    const candidates = [
      order?.items,
      order?.orderItems,
      order?.orderDetails,
      order?.details,
      order?.orderLines,
      order?.orderProducts,
      order?.billDetails,
      order?.invoiceDetails,
      order?.cartItems,
      order?.products,
    ];

    for (const candidate of candidates) {
      const arr = toArray(candidate);
      if (arr.length > 0) return arr;
    }

    return [];
  };

  const calcSubtotal = (order) => {
    const items = getOrderItems(order);

    if (items.length > 0) {
      return items.reduce((sum, item) => {
        const product = item.product || item.productDto || {};
        const unitPrice = Number(
          item.unitPrice ??
            item.price ??
            item.salePrice ??
            item.productPrice ??
            product.price ??
            product.salePrice ??
            0
        );
        const quantity = Number(item.quantity ?? item.qty ?? item.amount ?? 0);
        const lineTotal = Number(
          item.totalPrice ??
            item.lineTotal ??
            item.total ??
            item.amountTotal ??
            unitPrice * quantity
        );

        return sum + lineTotal;
      }, 0);
    }

    // Ưu tiên các field thể hiện tạm tính nếu backend có trả về
    const storedSubtotal = getNumberByKeys(order, [
      "subtotal",
      "subTotal",
      "itemsTotal",
      "productsTotal",
      "productTotal",
      "totalBeforeDiscount",
      "totalPriceBeforeDiscount",
    ]);

    if (storedSubtotal !== null) return storedSubtotal;

    // Fallback để tránh trường hợp bảng sản phẩm chưa trả về nhưng đơn đã có tổng tiền
    return Number(
      order?.totalPrice ?? order?.totalAmount ?? order?.amount ?? order?.finalAmount ?? 0
    );
  };

  const getDiscountAmount = (order) => {
    return Number(
      order?.discountAmount ??
        order?.discountValue ??
        order?.discount ??
        order?.couponDiscount ??
        0
    );
  };

  const getShippingFee = (order) => {
    return Number(order?.shippingFee ?? order?.shipFee ?? order?.deliveryFee ?? 0);
  };

  const hasReliableSubtotal = (order) => {
    if (getOrderItems(order).length > 0) return true;

    return (
      getNumberByKeys(order, [
        "subtotal",
        "subTotal",
        "itemsTotal",
        "productsTotal",
        "productTotal",
        "totalBeforeDiscount",
        "totalPriceBeforeDiscount",
      ]) !== null
    );
  };

  const getFinalAmount = (order) => {
    const backendFinal = getNumberByKeys(order, [
      "finalAmount",
      "finalTotal",
      "grandTotal",
      "payableAmount",
      "amountToPay",
      "totalAmount",
      "totalPrice",
      "amount",
    ]);

    // Nếu có sản phẩm/tạm tính rõ ràng thì tính theo công thức chuẩn
    if (hasReliableSubtotal(order)) {
      const subtotal = calcSubtotal(order);
      const discount = getDiscountAmount(order);
      const shippingFee = getShippingFee(order);

      return Math.max(0, subtotal - discount + shippingFee);
    }

    // Nếu API detail chưa trả sản phẩm, dùng tổng cuối cùng từ backend để không bị 0 sai lệch
    return backendFinal ?? 0;
  };

  const normalizeOrderStatus = (value) => {
    if (value === undefined || value === null || value === "") return null;

    const raw = String(value).trim();
    const lower = raw.toLowerCase();

    const map = {
      pending: "Pending",
      "cho xac nhan": "Pending",
      "chờ xác nhận": "Pending",
      "dang xu ly": "Pending",
      "đang xử lý": "Pending",
      confirmed: "Confirmed",
      "da xac nhan": "Confirmed",
      "đã xác nhận": "Confirmed",
      packing: "Packing",
      processing: "Packing",
      "dang dong goi": "Packing",
      "đang đóng gói": "Packing",
      shipping: "Shipping",
      delivering: "Shipping",
      "dang giao hang": "Shipping",
      "đang giao hàng": "Shipping",
      completed: "Completed",
      complete: "Completed",
      success: "Completed",
      "hoan tat": "Completed",
      "hoàn tất": "Completed",
      "da giao": "Completed",
      "đã giao": "Completed",
      cancelled: "Cancelled",
      canceled: "Cancelled",
      cancel: "Cancelled",
      "da huy": "Cancelled",
      "đã hủy": "Cancelled",
      "da hủy": "Cancelled",
      huy: "Cancelled",
      "hủy": "Cancelled",
      returned: "Returned",
      return: "Returned",
      "da hoan tra": "Returned",
      "đã hoàn trả": "Returned",
      "tra hang": "Returned",
      "trả hàng": "Returned",
      "0": "Pending",
      "1": "Confirmed",
      "2": "Packing",
      "3": "Shipping",
      "4": "Completed",
      "5": "Cancelled",
      "6": "Returned",
    };

    return ORDER_STATUS_VALUES.includes(raw) ? raw : map[lower] || null;
  };

  const normalizePaymentStatus = (value) => {
    if (value === undefined || value === null || value === "") return null;

    const raw = String(value).trim();
    const lower = raw.toLowerCase();

    const map = {
      unpaid: "Unpaid",
      "chua thanh toan": "Unpaid",
      "chưa thanh toán": "Unpaid",
      paid: "Paid",
      "da thanh toan": "Paid",
      "đã thanh toán": "Paid",
      refunded: "Refunded",
      refund: "Refunded",
      "da hoan tien": "Refunded",
      "đã hoàn tiền": "Refunded",
      failed: "Failed",
      fail: "Failed",
      "thanh toan loi": "Failed",
      "thanh toán lỗi": "Failed",
      "0": "Unpaid",
      "1": "Paid",
      "2": "Refunded",
      "3": "Failed",
    };

    return PAYMENT_STATUS_VALUES.includes(raw) ? raw : map[lower] || null;
  };

  const getOrderStatus = (order) => {
    // Ưu tiên các field đúng nghĩa trạng thái đơn hàng.
    const candidates = [
      order?.orderStatus,
      order?.orderState,
      order?.statusOrder,
      order?.deliveryStatus,
      order?.shippingStatus,
      order?.status,
    ];

    for (const candidate of candidates) {
      const normalized = normalizeOrderStatus(candidate);
      if (normalized) return normalized;
    }

    // Nếu backend đang lưu nhầm status = Paid/Unpaid thì không xem nó là trạng thái đơn.
    // Gán tạm Pending để giao diện không bị "Không xác định".
    return DEFAULT_ORDER_STATUS;
  };

  const getPaymentStatus = (order) => {
    const candidates = [
      order?.paymentStatus,
      order?.paymentState,
      order?.paidStatus,
      order?.transactionStatus,
      order?.payment?.status,
      order?.status, // fallback cho dữ liệu cũ nếu status đang chứa Paid/Unpaid
    ];

    for (const candidate of candidates) {
      const normalized = normalizePaymentStatus(candidate);
      if (normalized) return normalized;
    }

    return DEFAULT_PAYMENT_STATUS;
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
    const normalizedStatus = normalizeOrderStatus(status) || DEFAULT_ORDER_STATUS;

    switch (normalizedStatus) {
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
    const normalizedStatus = normalizePaymentStatus(status) || DEFAULT_PAYMENT_STATUS;

    switch (normalizedStatus) {
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

      const matchStatus = !statusFilter || getOrderStatus(o) === statusFilter;

      const matchPayment = !paymentFilter || getPaymentStatus(o) === paymentFilter;

      const createdAt = o.createdAt ? new Date(o.createdAt) : null;

      const matchFromDate =
        !fromDate || (createdAt && createdAt >= new Date(fromDate));

      const matchToDate =
        !toDate || (createdAt && createdAt <= new Date(`${toDate}T23:59:59`));

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
      setSelectedOrder({ ...order, ...(res.data || {}) });
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

  const openEdit = async (order) => {
    setEditingOrder(order);
    setEditForm({
      status: getOrderStatus(order),
      paymentStatus: getPaymentStatus(order),
    });

    if (!orderApi.getById) return;

    try {
      setEditLoading(true);
      const res = await orderApi.getById(order.id);
      const detail = { ...order, ...(res.data || {}) };

      setEditingOrder(detail);
      setEditForm({
        status: getOrderStatus(detail),
        paymentStatus: getPaymentStatus(detail),
      });
    } catch (err) {
      console.log("Load order edit failed", err);
    } finally {
      setEditLoading(false);
    }
  };

  const closeEdit = () => {
    setEditingOrder(null);
    setEditLoading(false);
    setSavingEdit(false);
  };

  const saveEdit = async () => {
    if (!editingOrder) return;

    if (editForm.status === "Completed" && editForm.paymentStatus !== "Paid") {
      alert("Đơn hàng chưa thanh toán thì không thể chuyển sang trạng thái Hoàn tất.");
      return;
    }

    try {
      setSavingEdit(true);

      const currentPaymentStatus = getPaymentStatus(editingOrder);
      const currentOrderStatus = getOrderStatus(editingOrder);

      // Nếu service có API update tổng quát thì dùng một lần để tránh nhầm status thanh toán/status đơn.
      // Backend nên nhận payload: { status, paymentStatus }.
      if (orderApi.update) {
        await orderApi.update(editingOrder.id, {
          status: editForm.status,
          orderStatus: editForm.status,
          paymentStatus: editForm.paymentStatus,
        });
      } else {
        // Không có update tổng quát thì cập nhật thanh toán trước, sau đó cập nhật trạng thái đơn.
        if (editForm.paymentStatus !== currentPaymentStatus) {
          if (!orderApi.updatePayment) {
            alert("Chưa có API updatePayment để cập nhật trạng thái thanh toán.");
            return;
          }

          await orderApi.updatePayment(editingOrder.id, editForm.paymentStatus);
        }

        if (editForm.status !== currentOrderStatus) {
          if (!orderApi.updateStatus) {
            alert("Chưa có API updateStatus để cập nhật trạng thái đơn hàng.");
            return;
          }

          await orderApi.updateStatus(editingOrder.id, editForm.status);
        }
      }

      await loadOrders();
      closeEdit();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Cập nhật đơn hàng thất bại. Kiểm tra lại API updateStatus/updatePayment."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteOrder = async (order) => {
    if (!isAdmin()) return;

    const ok = window.confirm(
      `Bạn có chắc muốn xóa đơn ${formatOrderCode(order.id)} không?`
    );

    if (!ok) return;

    try {
      if (orderApi.delete) {
        await orderApi.delete(order.id);
      } else if (orderApi.remove) {
        await orderApi.remove(order.id);
      } else if (orderApi.cancel) {
        // Fallback nếu backend hiện tại chỉ có API hủy đơn
        await orderApi.cancel(order.id, "Xóa/Hủy đơn từ trang quản trị");
      } else {
        alert("Chưa có API xóa đơn hàng. Cần thêm orderApi.delete hoặc orderApi.remove.");
        return;
      }

      await loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Xóa đơn hàng thất bại.");
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const renderActions = (order) => {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ gap: 6 }}>
      <button
        type="button"
        className="btn btn-sm btn-info order-action-btn"
        title="Xem chi tiết"
        onClick={() => openDetail(order)}
      >
        <i className="fas fa-eye"></i>
      </button>

        {isAdmin() && (
          <>
            <button
                   type="buton"
                   className="btn btn-sm btn-info order-action-btn"
                   title="Sửa đơn hàng" 
                   onClick={() => openEdit(order)} 
                  >
                  <i className="fas fa-edit"></i>
            </button>

            <button
                    type="button"
                    className="btn btn-sm btn-danger order-action-btn"
                    title="Xóa đơn hàng"
                    onClick={() => deleteOrder(order)}
                  >
                   <i className="fas fa-trash"></i>
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="content-wrapper">
      <style>{`
          .orders-filter {
          display: flex !important;
          align-items: center !important;
          gap: 10px;
          flex-wrap: nowrap !important;
          width: 100%;
        }

        .orders-filter-search {
          width: 250px !important;
          flex: 0 0 250px;
        }

        .orders-filter-status {
          width: 200px !important;
          flex: 0 0 200px;
        }

        .orders-filter-payment {
          width: 200px !important;
          flex: 0 0 200px;
        }

        .orders-date-filter {
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px;
          flex: 0 0 auto;
          white-space: nowrap;
        }

        .orders-date-filter label {
          margin: 0 !important;
          font-weight: 700;
          white-space: nowrap;
        }

        .orders-date-input {
          width: 145px !important;
          flex: 0 0 145px;
          min-width: 145px;
        }

        .orders-reset-btn {
          margin-left: auto;
          width: 78px !important;
          flex: 0 0 78px;
        }
        
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
        text-align: center !important;
        vertical-align: middle !important;
      }

        .orders-table .badge {
          font-size: 0.85rem;
          white-space: nowrap;
        }

        .order-code {
          color: #4f46e5;
          font-weight: 700;
        }

        .modal-dialog {
          margin-top: 18px;
        }

        .order-modal-content {
          max-height: calc(100vh - 36px);
          display: flex;
          flex-direction: column;
        }

        .order-modal-body {
          overflow-y: auto;
          max-height: calc(100vh - 150px);
        }

        .modal-footer {
          flex-shrink: 0;
          background: #fff;
        }

        @media print {
          body * {
            visibility: hidden !important;
          }

          .print-area,
          .print-area * {
            visibility: visible !important;
          }

          .print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-height: none !important;
            box-shadow: none !important;
            border: none !important;
          }

          .modal-header .close,
          .modal-footer,
          .modal-backdrop {
            display: none !important;
          }
        }
      `}</style>

      <div className="content-header">
        <h1 className="ml-3">Quản lý đơn hàng</h1>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="card p-3 mb-3">
            <div className="orders-filter">
      <input
        className="form-control orders-filter-search"
        placeholder="Tìm mã đơn, tên khách, SĐT..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
      />

  <select
    className="form-control orders-filter-status"
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

  <select
    className="form-control orders-filter-payment"
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

  <div className="orders-date-filter">
    <label>Từ ngày</label>
    <input
      type="date"
      className="form-control orders-date-input"
      value={fromDate}
      onChange={(e) => {
        setFromDate(e.target.value);
        setCurrentPage(1);
      }}
    />
  </div>

  <div className="orders-date-filter">
    <label>Đến ngày</label>
    <input
      type="date"
      className="form-control orders-date-input"
      value={toDate}
      onChange={(e) => {
        setToDate(e.target.value);
        setCurrentPage(1);
      }}
    />
  </div>

        <button
        type="button"
        className="btn btn-secondary orders-reset-btn"
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
                              <span className="order-code">{formatOrderCode(o.id)}</span>
                            </td>

                            <td>{o.customerName || "N/A"}</td>
                            <td>{getCustomerPhone(o)}</td>

                            <td className="text-right">{formatMoney(getFinalAmount(o))}</td>

                            <td className="text-center">
                              {paymentStatusBadge(getPaymentStatus(o))}
                            </td>

                            <td className="text-center">{orderStatusBadge(getOrderStatus(o))}</td>

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
      </section>

      {selectedOrder && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-xl">
              <div className="modal-content order-modal-content print-area">
                <div className="modal-header">
                  <h5>Chi tiết đơn hàng {formatOrderCode(selectedOrder.id)}</h5>

                  <button className="close" onClick={closeDetail}>
                    <span>&times;</span>
                  </button>
                </div>

                <div className="modal-body order-modal-body">
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
                              <p>
                                <strong>Khách hàng:</strong>{" "}
                                {selectedOrder.customerName || "N/A"}
                              </p>
                              <p>
                                <strong>Số điện thoại:</strong>{" "}
                                {getCustomerPhone(selectedOrder)}
                              </p>
                              <p>
                                <strong>Email:</strong> {getCustomerEmail(selectedOrder)}
                              </p>
                              <p>
                                <strong>Địa chỉ giao hàng:</strong>{" "}
                                {getShippingAddress(selectedOrder)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-header">
                              <strong>Thông tin đơn hàng</strong>
                            </div>
                            <div className="card-body">
                              <p>
                                <strong>Mã đơn:</strong> {formatOrderCode(selectedOrder.id)}
                              </p>
                              <p>
                                <strong>Ngày tạo:</strong>{" "}
                                {formatDateTime(selectedOrder.createdAt)}
                              </p>
                              <p>
                                <strong>Trạng thái đơn:</strong>{" "}
                                {orderStatusBadge(getOrderStatus(selectedOrder))}
                              </p>
                              <p>
                                <strong>Thanh toán:</strong>{" "}
                                {paymentStatusBadge(getPaymentStatus(selectedOrder))}
                              </p>
                              <p>
                                <strong>Phương thức:</strong>{" "}
                                {selectedOrder.paymentMethod || "—"}
                              </p>
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
                                  const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
                                  const quantity = Number(item.quantity ?? 0);
                                  const lineTotal = Number(
                                    item.totalPrice ??
                                      item.lineTotal ??
                                      item.total ??
                                      unitPrice * quantity
                                  );

                                  return (
                                    <tr key={item.id || idx}>
                                      <td>
                                        {item.productName || item.name || "Sản phẩm"}
                                      </td>
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
                              <p>
                                {selectedOrder.note ||
                                  selectedOrder.customerNote ||
                                  "Không có ghi chú"}
                              </p>
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
                                <strong>Tạm tính:</strong> {formatMoney(calcSubtotal(selectedOrder))}
                              </p>
                              <p>
                                <strong>Mã khuyến mãi:</strong>{" "}
                                {selectedOrder.couponCode ||
                                  selectedOrder.promotionCode ||
                                  "Không áp dụng"}
                              </p>
                              <p>
                                <strong>Giảm giá:</strong>{" "}
                                {formatMoney(getDiscountAmount(selectedOrder))}
                              </p>
                              <p>
                                <strong>Phí vận chuyển:</strong>{" "}
                                {formatMoney(getShippingFee(selectedOrder))}
                              </p>
                              <h4>
                                <strong>Khách cần trả:</strong>{" "}
                                {formatMoney(getFinalAmount(selectedOrder))}
                              </h4>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="modal-footer">
                  <button className="btn btn-dark" onClick={printInvoice}>
                    In
                  </button>
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

      {editingOrder && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content order-modal-content">
                <div className="modal-header">
                  <h5>Sửa đơn hàng {formatOrderCode(editingOrder.id)}</h5>

                  <button className="close" onClick={closeEdit}>
                    <span>&times;</span>
                  </button>
                </div>

                <div className="modal-body order-modal-body">
                  {editLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary"></div>
                    </div>
                  ) : (
                    <>
                      <div className="alert alert-info mb-3">
                        Chỉ cho phép cập nhật <strong>trạng thái đơn hàng</strong> và{" "}
                        <strong>trạng thái thanh toán</strong>. Thông tin khách hàng được giữ
                        nguyên.
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-header">
                              <strong>Thông tin khách hàng</strong>
                            </div>
                            <div className="card-body">
                              <p>
                                <strong>Khách hàng:</strong> {editingOrder.customerName || "N/A"}
                              </p>
                              <p>
                                <strong>Số điện thoại:</strong> {getCustomerPhone(editingOrder)}
                              </p>
                              <p>
                                <strong>Email:</strong> {getCustomerEmail(editingOrder)}
                              </p>
                              <p>
                                <strong>Địa chỉ:</strong> {getShippingAddress(editingOrder)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-header">
                              <strong>Cập nhật đơn hàng</strong>
                            </div>
                            <div className="card-body">
                              <div className="form-group">
                                <label>Trạng thái thanh toán</label>
                                <select
                                  className="form-control"
                                  value={editForm.paymentStatus}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      paymentStatus: e.target.value,
                                    }))
                                  }
                                >
                                  <option value="Unpaid">Chưa thanh toán</option>
                                  <option value="Paid">Đã thanh toán</option>
                                  <option value="Refunded">Đã hoàn tiền</option>
                                  <option value="Failed">Thanh toán lỗi</option>
                                </select>
                              </div>

                              <div className="form-group">
                                <label>Trạng thái đơn hàng</label>
                                <select
                                  className="form-control"
                                  value={editForm.status}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      status: e.target.value,
                                    }))
                                  }
                                >
                                  <option value="Pending">Chờ xác nhận</option>
                                  <option value="Confirmed">Đã xác nhận</option>
                                  <option value="Packing">Đang đóng gói</option>
                                  <option value="Shipping">Đang giao hàng</option>
                                  <option value="Completed">Hoàn tất</option>
                                  <option value="Cancelled">Đã hủy</option>
                                  <option value="Returned">Đã hoàn trả</option>
                                </select>
                                {editForm.status === "Completed" &&
                                  editForm.paymentStatus !== "Paid" && (
                                    <small className="text-danger">
                                      Muốn hoàn tất đơn thì thanh toán phải là "Đã thanh toán".
                                    </small>
                                  )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-primary"
                    disabled={savingEdit || editLoading}
                    onClick={saveEdit}
                  >
                    {savingEdit ? "Đang lưu..." : "Lưu cập nhật"}
                  </button>
                  <button className="btn btn-secondary" onClick={closeEdit}>
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
