import React, { useEffect, useState } from "react";
import { couponApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const Coupons = () => {
  const { isAdmin } = useAuth();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState("");

  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState(emptyForm());

  function emptyForm() {
    return {
      code: "",
      description: "",
      discountType: "Percent",
      discountValue: "",
      minOrderValue: "0",
      maxUses: "0",
      startDate: "",
      endDate: "",
      isActive: true,
    };
  }

  // ── load ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await couponApi.getAll({
          search: search || undefined,
          isActive: filterActive !== "" ? filterActive === "true" : undefined,
          page: currentPage,
          pageSize,
        });
        if (cancelled) return;
        setCoupons(res.data.items || []);
        setTotal(res.data.totalCount || 0);
      } catch (err) {
        if (cancelled) return;
        console.error("Load coupons lỗi:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 400);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [currentPage, search, filterActive]);

  // ── modal ─────────────────────────────────────────────────────────────
  const openModal = (c = null) => {
    if (c) {
      setEditing(c);
      setForm({
        code: c.code,
        description: c.description || "",
        discountType: c.discountType,
        discountValue: c.discountValue,
        minOrderValue: c.minOrderValue,
        maxUses: c.maxUses,
        startDate: c.startDate ? c.startDate.substring(0, 10) : "",
        endDate: c.endDate ? c.endDate.substring(0, 10) : "",
        isActive: c.isActive,
      });
    } else {
      setEditing(null);
      setForm(emptyForm());
    }
    setError("");
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); setError(""); };

  // ── save ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderValue: Number(form.minOrderValue),
        maxUses: Number(form.maxUses),
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };
      if (editing) {
        await couponApi.update(editing.id, payload);
      } else {
        await couponApi.create(payload);
      }
      closeModal();
      setSearch(s => s); // trigger reload
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi lưu");
    }
  };

  // ── delete ────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Xoá mã khuyến mãi này?")) return;
    try {
      await couponApi.delete(id);
      setSearch(s => s);
    } catch (err) {
      alert(err.response?.data?.message || "Xoá thất bại");
    }
  };

  // ── helpers ───────────────────────────────────────────────────────────
  const formatMoney = (v) => Number(v || 0).toLocaleString("vi-VN") + " đ";
  const formatDate  = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "—";
  const totalPages  = Math.ceil(total / pageSize) || 1;

  const isExpired = (c) => c.endDate && new Date(c.endDate) < new Date();
  const isOutOfUses = (c) => c.maxUses > 0 && c.usedCount >= c.maxUses;

  const statusBadge = (c) => {
    if (!c.isActive) return <span className="badge badge-secondary">Tắt</span>;
    if (isExpired(c)) return <span className="badge badge-danger">Hết hạn</span>;
    if (isOutOfUses(c)) return <span className="badge badge-warning">Hết lượt</span>;
    return <span className="badge badge-success">Đang hoạt động</span>;
  };

  // ── render ────────────────────────────────────────────────────────────
  return (
    <div className="content-wrapper">
      <div className="content-header">
        <h1 className="ml-3">Quản lý mã khuyến mãi</h1>
      </div>

      <style>{`
        .coupons-table {
          min-width: 1390px;
          table-layout: fixed;
        }

        .coupons-table th,
        .coupons-table td {
          vertical-align: middle !important;
        }

        .coupons-table th {
          font-weight: 700;
          white-space: nowrap;
        }

        .coupons-table td {
          padding: 0.85rem 0.75rem;
        }

        .coupons-table .coupon-description {
          white-space: normal;
          line-height: 1.45;
        }

        .coupons-table .badge {
          white-space: nowrap;
        }

        .coupon-action-btn {
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      <section className="content">
        <div className="container-fluid">

          {/* FILTER */}
          <div className="card p-3 mb-3 d-flex flex-row" style={{ gap: 8 }}>
            <input
              className="form-control"
              style={{ maxWidth: 260 }}
              placeholder="Tìm mã khuyến mãi..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
            <select
              className="form-control"
              style={{ maxWidth: 160 }}
              value={filterActive}
              onChange={(e) => { setFilterActive(e.target.value); setCurrentPage(1); }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Đã tắt</option>
            </select>
            {isAdmin() && (
              <button className="btn btn-success ml-auto" onClick={() => openModal()}>
                <i className="fas fa-plus"></i> Thêm
              </button>
            )}
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
                  <table className="table table-bordered table-striped table-hover mb-0 coupons-table">
                    <colgroup>
                      <col style={{ width: "55px" }} />
                      <col style={{ width: "135px" }} />
                      <col style={{ width: "260px" }} />
                      <col style={{ width: "105px" }} />
                      <col style={{ width: "105px" }} />
                      <col style={{ width: "130px" }} />
                      <col style={{ width: "90px" }} />
                      <col style={{ width: "140px" }} />
                      <col style={{ width: "125px" }} />
                      <col style={{ width: "125px" }} />
                      <col style={{ width: "145px" }} />
                      {isAdmin() && <col style={{ width: "95px" }} />}
                    </colgroup>

                    <thead className="thead-light">
                      <tr>
                        <th className="text-center align-middle">ID</th>
                        <th className="text-center align-middle">Mã</th>
                        <th className="align-middle">Mô tả</th>
                        <th className="text-center align-middle">Loại giảm</th>
                        <th className="text-center align-middle">Giá trị</th>
                        <th className="text-center align-middle">Đơn tối thiểu</th>
                        <th className="text-center align-middle">Đã dùng</th>
                        <th className="text-center align-middle">Tổng lượt dùng</th>
                        <th className="text-center align-middle">Ngày bắt đầu</th>
                        <th className="text-center align-middle">Ngày kết thúc</th>
                        <th className="text-center align-middle">Trạng thái</th>
                        {isAdmin() && <th className="text-center align-middle">Thao tác</th>}
                      </tr>
                    </thead>

                    <tbody>
                      {coupons.length === 0 ? (
                        <tr>
                          <td colSpan={isAdmin() ? 11 : 10} className="text-center py-4">
                            Không có dữ liệu
                          </td>
                        </tr>
                      ) : (
                        coupons.map((c) => (
                          <tr key={c.id}>
                            <td className="text-center align-middle">{c.id}</td>

                            <td className="align-middle text-nowrap">
                              <strong className="text-primary">{c.code}</strong>
                            </td>

                            <td className="align-middle coupon-description">
                              {c.description || "—"}
                            </td>

                            <td className="text-center align-middle">
                              {c.discountType === "Percent" ? "Phần trăm" : "Cố định"}
                            </td>

                            <td className="text-center align-middle text-nowrap">
                              {c.discountType === "Percent"
                                ? `${c.discountValue}%`
                                : formatMoney(c.discountValue)}
                            </td>

                            <td className="text-right align-middle text-nowrap">
                              {formatMoney(c.minOrderValue)}
                            </td>

                            <td className="text-center align-middle">
                              {c.usedCount}
                            </td>

                            <td className="text-center align-middle">
                              {c.maxUses === 0 ? "∞" : c.maxUses}
                            </td>

                            <td className="text-center align-middle text-nowrap">
                              {c.startDate ? formatDate(c.startDate) : "—"}
                            </td>

                            <td className="text-center align-middle text-nowrap">
                              {c.endDate ? formatDate(c.endDate) : "—"}
                            </td>

                            <td className="text-center align-middle">
                              {statusBadge(c)}
                            </td>

                            {isAdmin() && (
                              <td className="text-center align-middle">
                                <div
                                  className="d-flex justify-content-center align-items-center"
                                  style={{ gap: 6 }}
                                >
                                  <button
                                    className="btn btn-sm btn-info coupon-action-btn"
                                    onClick={() => openModal(c)}
                                    title="Sửa"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger coupon-action-btn"
                                    onClick={() => handleDelete(c.id)}
                                    title="Xoá"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </td>
                            )}
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
            <div>Tổng: <strong>{total}</strong> mã khuyến mãi</div>
            <div className="d-flex align-items-center" style={{ gap: 8 }}>
              <button className="btn btn-secondary btn-sm" disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}>← Trước</button>
              <span>Trang <strong>{currentPage}</strong> / {totalPages}</span>
              <button className="btn btn-secondary btn-sm" disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}>Sau →</button>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL */}
      {showModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5>{editing ? "Sửa mã khuyến mãi" : "Thêm mã khuyến mãi"}</h5>
                  <button className="close" onClick={closeModal}><span>&times;</span></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Mã khuyến mãi <span className="text-danger">*</span></label>
                          <input
                            className="form-control"
                            placeholder="VD: SALE10"
                            value={form.code}
                            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Mô tả</label>
                          <input
                            className="form-control"
                            placeholder="Mô tả mã..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label>Loại giảm <span className="text-danger">*</span></label>
                          <select
                            className="form-control"
                            value={form.discountType}
                            onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                          >
                            <option value="Percent">Phần trăm (%)</option>
                            <option value="Fixed">Cố định (đ)</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label>
                            Giá trị giảm <span className="text-danger">*</span>
                            <small className="text-muted ml-1">
                              {form.discountType === "Percent" ? "(1-100%)" : "(đ)"}
                            </small>
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="0"
                            value={form.discountValue}
                            onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                            required min="1"
                            max={form.discountType === "Percent" ? 100 : undefined}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label>Đơn hàng tối thiểu (đ)</label>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="0"
                            value={form.minOrderValue}
                            onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                            min="0"
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label>Số lượt dùng tối đa <small className="text-muted">(0 = không giới hạn)</small></label>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="0"
                            value={form.maxUses}
                            onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                            min="0"
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label>Ngày bắt đầu</label>
                          <input
                            type="date"
                            className="form-control"
                            value={form.startDate}
                            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label>Ngày kết thúc</label>
                          <input
                            type="date"
                            className="form-control"
                            value={form.endDate}
                            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label>Trạng thái</label>
                          <select
                            className="form-control"
                            value={form.isActive}
                            onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}
                          >
                            <option value="true">Đang hoạt động</option>
                            <option value="false">Tắt</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>Huỷ</button>
                    <button type="submit" className="btn btn-primary">Lưu</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default Coupons;
