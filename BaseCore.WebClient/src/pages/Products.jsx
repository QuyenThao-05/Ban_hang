import React, { useEffect, useState } from "react";
import { productApi, productTypeApi, manufacturerApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const Products = () => {
  const { isAdmin } = useAuth();

  const [products, setProducts]       = useState([]);
  const [types, setTypes]             = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading]         = useState(true);

  // ── filters ───────────────────────────────────────────────────────────
  const [keyword, setKeyword]         = useState("");
  const [filterType, setFilterType]   = useState("");
  const [priceMin, setPriceMin]       = useState("");
  const [priceMax, setPriceMax]       = useState("");
  const [stockMin, setStockMin]       = useState("");
  const [stockMax, setStockMax]       = useState("");

  // ── pagination ────────────────────────────────────────────────────────
  const [total, setTotal]             = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize                      = 10;

  // ── modal ─────────────────────────────────────────────────────────────
  const [showModal, setShowModal]     = useState(false);
  const [editing, setEditing]         = useState(null);
  const [form, setForm]               = useState(emptyForm());

  function emptyForm() {
    return {
      name:           "",
      price:          "",
      quantity:       "",
      productTypeId:  "",
      manufacturerId: "",
      description:    "",
    };
  }

  // ── load ──────────────────────────────────────────────────────────────
  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [currentPage, keyword, filterType, priceMin, priceMax, stockMin, stockMax]);

  const loadMeta = async () => {
    try {
      const [tRes, mRes] = await Promise.all([
        productTypeApi.getAll(),
        manufacturerApi.getAll(),
      ]);
      const typesData = Array.isArray(tRes.data)
        ? tRes.data
        : tRes.data?.data || tRes.data?.items || [];
      const mfData = Array.isArray(mRes.data)
        ? mRes.data
        : mRes.data?.data || mRes.data?.items || [];
      setTypes(typesData);
      setManufacturers(mfData);
    } catch (err) {
      console.error("Load meta lỗi:", err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productApi.getAll({
  page: currentPage,
  pageSize,
  search: keyword || undefined,
  productTypeId: filterType ? Number(filterType) : undefined,
  minPrice: priceMin ? Number(priceMin) : undefined,
  maxPrice: priceMax ? Number(priceMax) : undefined,
  stockMin: stockMin !== "" ? parseInt(stockMin, 10) : undefined,
  stockMax: stockMax !== "" ? parseInt(stockMax, 10) : undefined,
});
      const data = res.data;
      setProducts(data.items || []);
      setTotal(data.totalCount || 0);
    } catch (err) {
      console.error("Load products lỗi:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts();
  };

  const handleReset = () => {
    setKeyword("");
    setFilterType("");
    setPriceMin("");
    setPriceMax("");
    setStockMin("");
    setStockMax("");
    setCurrentPage(1);
  };

  // ── modal ─────────────────────────────────────────────────────────────
  const openModal = (p = null) => {
    if (p) {
      setEditing(p);
      setForm({
        name:           p.name           || "",
        price:          p.price          || "",
        quantity:       p.quantity       || "",
        productTypeId:  p.productTypeId  || "",
        manufacturerId: p.manufacturerId || "",
        description:    p.description    || "",
      });
    } else {
      setEditing(null);
      setForm(emptyForm());
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  // ── save ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        price:          Number(form.price),
        quantity:       Number(form.quantity),
        productTypeId:  Number(form.productTypeId),
        manufacturerId: form.manufacturerId ? Number(form.manufacturerId) : null,
      };
      if (editing) {
        await productApi.update(editing.id, { id: editing.id, ...payload });
      } else {
        await productApi.create(payload);
      }
      closeModal();
      loadProducts();
    } catch {
      alert("Lỗi khi lưu");
    }
  };

  // ── delete ────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá?")) return;
    try {
      await productApi.delete(id);
      loadProducts();
    } catch {
      alert("Xoá thất bại");
    }
  };

  // ── helpers ───────────────────────────────────────────────────────────
  const formatMoney   = (v) => Number(v || 0).toLocaleString("vi-VN") + " đ";
  const getTypeName   = (id) => types.find((t) => t.id === id)?.name || "—";
  const getMfName     = (id) => manufacturers.find((m) => m.id === id)?.name || "—";
  const totalPages    = Math.ceil(total / pageSize) || 1;

  const stockBadge = (q) => {
    if (q === 0)   return <span className="badge badge-danger">Hết hàng</span>;
    if (q < 20)    return <span className="badge badge-warning">Sắp hết</span>;
    return              <span className="badge badge-success">Còn hàng</span>;
  };

  // ── render ────────────────────────────────────────────────────────────
  return (
    <div className="content-wrapper">
      <div className="content-header">
        <h1 className="ml-3">Quản lý sản phẩm</h1>
      </div>

      <section className="content">
        <div className="container-fluid">

          {/* FILTER */}
          <form onSubmit={handleSearch}>
            <div className="card p-3 mb-3">
              {/* Row 1: keyword + type + add button */}
              <div className="d-flex flex-wrap mb-2" style={{ gap: 8 }}>
                <input
                  className="form-control"
                  style={{ maxWidth: 260 }}
                  placeholder="Tìm sản phẩm..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
                <select
                  className="form-control"
                  style={{ maxWidth: 180 }}
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">Tất cả loại</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {isAdmin() && (
                  <button
                    type="button"
                    className="btn btn-success ml-auto"
                    onClick={() => openModal()}
                  >
                    <i className="fas fa-plus"></i> Thêm
                  </button>
                )}
              </div>

              {/* Row 2: price range + stock range + buttons */}
              <div className="d-flex flex-wrap align-items-center" style={{ gap: 8 }}>
                <span className="text-muted small font-weight-bold">Giá (đ):</span>
                <input
                  type="number"
                  className="form-control"
                  style={{ maxWidth: 130 }}
                  placeholder="Từ"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  min="0"
                />
                <span className="text-muted">—</span>
                <input
                  type="number"
                  className="form-control"
                  style={{ maxWidth: 130 }}
                  placeholder="Đến"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  min="0"
                />

                <span className="text-muted small font-weight-bold ml-3">Tồn kho:</span>
                <input
                  type="number"
                  className="form-control"
                  style={{ maxWidth: 100 }}
                  placeholder="Từ"
                  value={stockMin}
                  onChange={(e) => setStockMin(e.target.value)}
                  min="0"
                />
                <span className="text-muted">—</span>
                <input
                  type="number"
                  className="form-control"
                  style={{ maxWidth: 100 }}
                  placeholder="Đến"
                  value={stockMax}
                  onChange={(e) => setStockMax(e.target.value)}
                  min="0"
                />

                <button type="submit" className="btn btn-danger ml-2">
                  <i className="fas fa-search mr-1"></i> Tìm
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleReset}
                >
                  <i className="fas fa-redo mr-1"></i> Đặt lại
                </button>
              </div>
            </div>
          </form>

          {/* TABLE */}
          <div className="card">
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Đang tải...</span>
                  </div>
                </div>
              ) : (
                <table className="table table-bordered table-striped mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tên</th>
                      <th>Loại</th>
                      <th>Nhà sản xuất</th>
                      <th>Giá</th>
                      <th>Tồn kho</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          Không có dữ liệu
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => (
                        <tr key={p.id}>
                          <td>{p.id}</td>
                          <td><strong>{p.name}</strong></td>
                          <td>{getTypeName(p.productTypeId)}</td>
                          <td>{getMfName(p.manufacturerId)}</td>
                          <td>{formatMoney(p.price)}</td>
                          <td className="text-center">{p.quantity}</td>
                          <td>{stockBadge(p.quantity)}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-info mr-1"
                              title="Chỉnh sửa"
                              onClick={() => openModal(p)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              title="Xóa"
                              onClick={() => handleDelete(p.id)}
                            >
                              <i className="fas fa-trash"></i>
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

          {/* PAGINATION */}
          <div className="d-flex justify-content-between align-items-center mt-3 mb-3">
            <div>Tổng: <strong>{total}</strong> sản phẩm</div>
            <div className="d-flex align-items-center" style={{ gap: 8 }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >← Trước</button>
              <span>Trang <strong>{currentPage}</strong> / {totalPages}</span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >Sau →</button>
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
                  <h5>{editing ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h5>
                  <button className="close" onClick={closeModal}>
                    <span>&times;</span>
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Tên sản phẩm <span className="text-danger">*</span></label>
                          <input
                            className="form-control"
                            placeholder="Nhập tên..."
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Loại sản phẩm <span className="text-danger">*</span></label>
                          <select
                            className="form-control"
                            value={form.productTypeId}
                            onChange={(e) => setForm({ ...form, productTypeId: e.target.value })}
                            required
                          >
                            <option value="">Chọn loại</option>
                            {types.map((t) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Nhà sản xuất</label>
                          <select
                            className="form-control"
                            value={form.manufacturerId}
                            onChange={(e) => setForm({ ...form, manufacturerId: e.target.value })}
                          >
                            <option value="">-- Chọn nhà sản xuất --</option>
                            {manufacturers.map((m) => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Giá (đ) <span className="text-danger">*</span></label>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="0"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                            required
                            min="0"
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Tồn kho <span className="text-danger">*</span></label>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="0"
                            value={form.quantity}
                            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                            required
                            min="0"
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-group">
                          <label>Mô tả</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            placeholder="Nhập mô tả..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                          />
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

export default Products;
