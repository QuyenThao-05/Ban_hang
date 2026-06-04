import React, { useEffect, useState } from "react";
import { feedbackApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const Feedbacks = () => {
  const { isAdmin } = useAuth();

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRating, setFilterRating] = useState("");

  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [reloadKey, setReloadKey] = useState(0);

  // Modal xem chi tiết
  const [viewFeedback, setViewFeedback] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Modal sửa: chỉ sửa trạng thái + phản hồi admin
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [editForm, setEditForm] = useState({
    status: "Pending",
    adminReply: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // ── LOAD ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const res = await feedbackApi.getAll({
          search: search || undefined,
          status: filterStatus || undefined,
          rating: filterRating || undefined,
          page: currentPage,
          pageSize,
        });

        if (cancelled) return;

        const items = Array.isArray(res.data)
          ? res.data
          : res.data?.items || [];

        setFeedbacks(items);
        setTotal(res.data?.totalCount ?? items.length);
      } catch (err) {
        if (cancelled) return;
        console.error("Load feedbacks lỗi:", err);
        alert(err.response?.data?.message || "Không tải được danh sách phản hồi");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [currentPage, search, filterStatus, filterRating, reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);

  // ── HELPERS ───────────────────────────────────────────────────────────
  const formatDate = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "—");

  const totalPages = Math.ceil(total / pageSize) || 1;

  const stars = (n) => {
    const value = Math.max(0, Math.min(5, Number(n || 0)));
    return "★".repeat(value) + "☆".repeat(5 - value);
  };

  const shortText = (text, max = 80) => {
    if (!text) return "—";
    return text.length > max ? text.slice(0, max) + "..." : text;
  };

  const statusBadge = (s) => {
    switch (s) {
      case "Approved":
        return <span className="badge badge-success">Đã duyệt</span>;
      case "Replied":
        return <span className="badge badge-info">Đã phản hồi</span>;
      case "Hidden":
        return <span className="badge badge-secondary">Đã ẩn</span>;
      default:
        return <span className="badge badge-warning">Chờ duyệt</span>;
    }
  };

  const ratingColor = (n) => {
    if (Number(n) >= 4) return "text-success";
    if (Number(n) === 3) return "text-warning";
    return "text-danger";
  };

  // ── VIEW MODAL ────────────────────────────────────────────────────────
  const openView = async (feedback) => {
    setViewFeedback(feedback);

    try {
      setViewLoading(true);
      const res = await feedbackApi.getById(feedback.id);
      setViewFeedback(res.data);
    } catch (err) {
      console.error("Load feedback detail lỗi:", err);
    } finally {
      setViewLoading(false);
    }
  };

  const closeView = () => {
    setViewFeedback(null);
    setViewLoading(false);
  };

  // ── EDIT MODAL ────────────────────────────────────────────────────────
  const openEdit = async (feedback) => {
    setEditingFeedback(feedback);
    setEditForm({
      status: feedback.status || "Pending",
      adminReply: feedback.adminReply || "",
    });
    try {
      setEditLoading(true);
      const res = await feedbackApi.getById(feedback.id);
      const detail = res.data;
      setEditingFeedback(detail);
      setEditForm({
        status: detail.status || "Pending",
        adminReply: detail.adminReply || "",
      });
    } catch (err) {
      console.error("Load feedback edit lỗi:", err);
    } finally {
      setEditLoading(false);
    }
  };
  const closeEdit = () => {
    setEditingFeedback(null);
    setEditForm({
      status: "Pending",
      adminReply: "",
    });
    setEditLoading(false);
    setSavingEdit(false);
  };

  const saveEdit = async () => {
  if (!editingFeedback) return;

  const nextStatus = editForm.status;
  const adminReply = editForm.adminReply.trim();

  if (nextStatus === "Replied" && !adminReply) {
    alert("Muốn chuyển sang trạng thái Đã phản hồi thì cần nhập nội dung phản hồi của admin.");
    return;
  }

  try {
    setSavingEdit(true);

    if (adminReply) {
      await feedbackApi.reply(editingFeedback.id, adminReply);
    }

    await feedbackApi.updateStatus(editingFeedback.id, nextStatus);

    reload();
    closeEdit();
  } catch (err) {
    alert(err.response?.data?.message || "Cập nhật phản hồi thất bại");
  } finally {
    setSavingEdit(false);
  }
};
  // ── DELETE ────────────────────────────────────────────────────────────
  const handleDelete = async (feedback) => {
    if (!window.confirm(`Bạn có chắc muốn xóa phản hồi #${feedback.id} không?`)) return;

    try {
      await feedbackApi.delete(feedback.id);
      reload();

      if (viewFeedback?.id === feedback.id) closeView();
      if (editingFeedback?.id === feedback.id) closeEdit();
    } catch (err) {
      alert(err.response?.data?.message || "Xóa phản hồi thất bại");
    }
  };

  const resetFilter = () => {
    setSearch("");
    setFilterStatus("");
    setFilterRating("");
    setCurrentPage(1);
  };

  const renderActions = (feedback) => {
    return (
      <div className="feedback-actions">
        <button
          type="button"
          className="btn btn-sm btn-info feedback-action-btn"
          title="Xem chi tiết"
          onClick={() => openView(feedback)}
        >
          <i className="fas fa-eye"></i>
        </button>

        {isAdmin() && (
          <>
            <button
              type="button"
              className="btn btn-sm btn-info feedback-action-btn"
              title="Sửa phản hồi"
              onClick={() => openEdit(feedback)}
            >
              <i className="fas fa-edit"></i>
            </button>

            <button
              type="button"
              className="btn btn-sm btn-danger feedback-action-btn"
              title="Xóa phản hồi"
              onClick={() => handleDelete(feedback)}
            >
              <i className="fas fa-trash"></i>
            </button>
          </>
        )}
      </div>
    );
  };

  // ── RENDER ────────────────────────────────────────────────────────────
  return (
    <div className="content-wrapper">
      <style>{`
        .feedback-filter {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: nowrap;
          overflow-x: auto;
        }

        .feedback-filter-search {
          width: 320px;
          min-width: 260px;
          flex: 0 0 320px;
        }

        .feedback-filter-status {
          width: 190px;
          min-width: 170px;
          flex: 0 0 190px;
        }

        .feedback-filter-rating {
          width: 160px;
          min-width: 145px;
          flex: 0 0 160px;
        }

        .feedback-reset-btn {
          margin-left: auto;
          min-width: 78px;
          flex: 0 0 78px;
        }

        .feedback-table {
          min-width: 1320px;
        }

        .feedback-table th,
        .feedback-table td {
          vertical-align: middle !important;
        }

        .feedback-table th {
          text-align: center !important;
          white-space: nowrap;
          font-weight: 700;
        }

        .feedback-table td:nth-child(1),
        .feedback-table td:nth-child(5),
        .feedback-table td:nth-child(7),
        .feedback-table td:nth-child(8),
        .feedback-table td:nth-child(9) {
          text-align: center;
        }

        .feedback-customer-col {
          min-width: 170px;
        }

        .feedback-product-col {
          min-width: 190px;
        }

        .feedback-order-col {
          min-width: 115px;
        }

        .feedback-rating-col {
          min-width: 110px;
          white-space: nowrap;
        }

        .feedback-content-col {
          min-width: 300px;
          max-width: 340px;
        }

        .feedback-content-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .feedback-admin-reply {
          color: #17a2b8;
          font-size: 0.875rem;
          margin-top: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .feedback-date-col {
          min-width: 150px;
        }

        .feedback-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          flex-wrap: nowrap;
        }

        .feedback-action-btn {
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .feedback-modal-content {
          max-height: calc(100vh - 40px);
          display: flex;
          flex-direction: column;
        }

        .feedback-modal-body {
          overflow-y: auto;
          max-height: calc(100vh - 150px);
        }

        .modal-footer {
          flex-shrink: 0;
          background: #fff;
        }
      `}</style>

      <div className="content-header">
        <h1 className="ml-3">Quản lý phản hồi khách hàng</h1>
      </div>

      <section className="content">
        <div className="container-fluid">
          {/* FILTER */}
          <div className="card p-3 mb-3">
            <div className="feedback-filter">
              <input
                className="form-control feedback-filter-search"
                placeholder="Tìm tên, SĐT, sản phẩm, mã đơn..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />

              <select
                className="form-control feedback-filter-status"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Pending">Chờ duyệt</option>
                <option value="Approved">Đã duyệt</option>
                <option value="Replied">Đã phản hồi</option>
                <option value="Hidden">Đã ẩn</option>
              </select>

              <select
                className="form-control feedback-filter-rating"
                value={filterRating}
                onChange={(e) => {
                  setFilterRating(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Tất cả sao</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </select>

              <button
                type="button"
                className="btn btn-secondary feedback-reset-btn"
                onClick={resetFilter}
              >
                Reset
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="card">
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary"></div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-striped table-hover mb-0 feedback-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Khách hàng</th>
                        <th>Sản phẩm</th>
                        <th>Mã đơn</th>
                        <th>Đánh giá</th>
                        <th>Nội dung</th>
                        <th>Trạng thái</th>
                        <th>Ngày gửi</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>

                    <tbody>
                      {feedbacks.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="text-center py-4">
                            Không có dữ liệu
                          </td>
                        </tr>
                      ) : (
                        feedbacks.map((f) => (
                          <tr key={f.id}>
                            <td>{f.id}</td>

                            <td className="feedback-customer-col">
                              <strong>{f.customerName || "N/A"}</strong>
                              {f.phone && <div className="text-muted small">{f.phone}</div>}
                            </td>

                            <td className="feedback-product-col">{f.productName || "—"}</td>

                            <td className="feedback-order-col">{f.orderCode || "—"}</td>

                            <td className="feedback-rating-col">
                              <span className={`font-weight-bold ${ratingColor(f.rating)}`}>
                                {stars(f.rating)}
                              </span>
                            </td>

                            <td className="feedback-content-col">
                              <div className="feedback-content-text">
                                {shortText(f.content, 90)}
                              </div>

                              {f.adminReply && (
                                <div className="feedback-admin-reply">
                                  <i className="fas fa-reply mr-1"></i>
                                  {shortText(f.adminReply, 85)}
                                </div>
                              )}
                            </td>

                            <td>{statusBadge(f.status)}</td>

                            <td className="feedback-date-col">{formatDate(f.createdAt)}</td>

                            <td>{renderActions(f)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* PAGINATION */}
          <div className="d-flex justify-content-between align-items-center mt-3 mb-3">
            <div>
              Tổng: <strong>{total}</strong> phản hồi
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

      {/* MODAL XEM CHI TIẾT */}
      {viewFeedback && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content feedback-modal-content">
                <div className="modal-header">
                  <h5>Chi tiết phản hồi #{viewFeedback.id}</h5>

                  <button className="close" onClick={closeView}>
                    <span>&times;</span>
                  </button>
                </div>

                <div className="modal-body feedback-modal-body">
                  {viewLoading ? (
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
                              <p><strong>Khách hàng:</strong> {viewFeedback.customerName || "N/A"}</p>
                              <p><strong>Số điện thoại:</strong> {viewFeedback.phone || "—"}</p>
                              <p><strong>Email:</strong> {viewFeedback.email || "—"}</p>
                              <p><strong>Ngày gửi:</strong> {formatDate(viewFeedback.createdAt)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-header">
                              <strong>Thông tin phản hồi</strong>
                            </div>
                            <div className="card-body">
                              <p><strong>Sản phẩm:</strong> {viewFeedback.productName || "—"}</p>
                              <p><strong>Mã đơn:</strong> {viewFeedback.orderCode || "—"}</p>
                              <p>
                                <strong>Đánh giá:</strong>{" "}
                                <span className={`font-weight-bold ${ratingColor(viewFeedback.rating)}`}>
                                  {stars(viewFeedback.rating)} ({viewFeedback.rating}/5)
                                </span>
                              </p>
                              <p><strong>Trạng thái:</strong> {statusBadge(viewFeedback.status)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="card">
                        <div className="card-header">
                          <strong>Nội dung khách hàng</strong>
                        </div>
                        <div className="card-body">
                          {viewFeedback.content || "—"}
                        </div>
                      </div>

                      <div className="card">
                        <div className="card-header">
                          <strong>Phản hồi của admin</strong>
                        </div>
                        <div className="card-body">
                          {viewFeedback.adminReply || "Chưa có phản hồi"}
                          {viewFeedback.repliedAt && (
                            <div className="text-muted small mt-2">
                              Đã phản hồi lúc: {formatDate(viewFeedback.repliedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeView}>
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* MODAL SỬA */}
      {editingFeedback && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content feedback-modal-content">
                <div className="modal-header">
                  <h5>Sửa phản hồi #{editingFeedback.id}</h5>

                  <button className="close" onClick={closeEdit}>
                    <span>&times;</span>
                  </button>
                </div>

                <div className="modal-body feedback-modal-body">
                  {editLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary"></div>
                    </div>
                  ) : (
                    <>
                      <div className="alert alert-info">
                        Chỉ cập nhật <strong>trạng thái</strong> và <strong>nội dung phản hồi của admin</strong>.
                        Nội dung khách hàng gửi được giữ nguyên.
                      </div>

                      <div className="card">
                        <div className="card-header">
                          <strong>Thông tin phản hồi</strong>
                        </div>

                        <div className="card-body">
                          <p><strong>Khách hàng:</strong> {editingFeedback.customerName || "N/A"}</p>
                          <p><strong>Sản phẩm:</strong> {editingFeedback.productName || "—"}</p>
                          <p>
                            <strong>Đánh giá:</strong>{" "}
                            <span className={`font-weight-bold ${ratingColor(editingFeedback.rating)}`}>
                              {stars(editingFeedback.rating)} ({editingFeedback.rating}/5)
                            </span>
                          </p>
                          <p><strong>Nội dung khách gửi:</strong></p>
                          <div className="p-3 bg-light rounded">{editingFeedback.content || "—"}</div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Trạng thái phản hồi</label>
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
                          <option value="Pending">Chờ duyệt</option>
                          <option value="Approved">Đã duyệt</option>
                          <option value="Replied">Đã phản hồi</option>
                          <option value="Hidden">Đã ẩn</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Phản hồi của admin</label>
                        <textarea
                          className="form-control"
                          rows="4"
                          placeholder="Nhập nội dung phản hồi cho khách hàng..."
                          value={editForm.adminReply}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              adminReply: e.target.value,
                            }))
                          }
                        />
                        {editingFeedback.repliedAt && (
                          <small className="text-muted">
                            Đã phản hồi lúc: {formatDate(editingFeedback.repliedAt)}
                          </small>
                        )}
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

export default Feedbacks;
