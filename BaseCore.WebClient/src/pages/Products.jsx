import React, { useEffect, useState } from "react";
import { productApi, productTypeApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const Products = () => {
  const { isAdmin } = useAuth();

  const [products, setProducts] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [filterType, setFilterType] = useState("");

  const [total, setTotal] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    quantity: "",
    productTypeId: "",
  });

  // LOAD DATA
  useEffect(() => {
    loadData();
  }, [currentPage, keyword, filterType]);

  const loadData = async () => {
    setLoading(true);

    try {
      const res = await productApi.getAll({
        page: currentPage,
        pageSize,
        keyword,
        typeId: filterType,
      });

      const data = res.data;

      setProducts(data.items || []);
      setTotal(data.totalCount || 0);
    } catch (err) {
      console.error("Load products lỗi:", err);
    }

    try {
      const tRes = await productTypeApi.getAll();
      setTypes(tRes.data || []);
    } catch {
      setTypes([]); // tránh crash
    }

    setLoading(false);
  };

  // MODAL
  const openModal = (p = null) => {
    if (p) {
      setEditing(p);
      setForm({
        name: p.name,
        price: p.price,
        quantity: p.quantity,
        productTypeId: p.productTypeId,
      });
    } else {
      setEditing(null);
      setForm({
        name: "",
        price: "",
        quantity: "",
        productTypeId: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  // SAVE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editing) {
        await productApi.update(editing.id, {
          id: editing.id,
          ...form,
        });
      } else {
        await productApi.create(form);
      }

      closeModal();
      loadData();
    } catch {
      alert("Lỗi khi lưu");
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá?")) return;

    try {
      await productApi.delete(id);
      loadData();
    } catch {
      alert("Xoá thất bại");
    }
  };

  // FORMAT
  const formatMoney = (v) => Number(v).toLocaleString("vi-VN") + " đ";

  const getTypeName = (id) =>
    types.find((t) => t.id === id)?.name || "Không rõ";

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <h1 className="ml-3">Quản lý sản phẩm</h1>
      </div>

      <section className="content">
        <div className="container-fluid">
          {/* FILTER */}
          <div className="card p-3 mb-3 d-flex flex-row">
            <input
              className="form-control mr-2"
              placeholder="Tìm sản phẩm..."
              value={keyword}
              onChange={(e) => {
                setCurrentPage(1);
                setKeyword(e.target.value);
              }}
            />

            <select
              className="form-control mr-2"
              value={filterType}
              onChange={(e) => {
                setCurrentPage(1);
                setFilterType(e.target.value);
              }}
            >
              <option value="">Tất cả loại</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            {isAdmin() && (
              <button className="btn btn-success" onClick={() => openModal()}>
                <i className="fas fa-plus"></i> Thêm
              </button>
            )}
          </div>

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
                      <th>Tên</th>
                      <th>Loại</th>
                      <th>Giá</th>
                      <th>Tồn</th>
                      <th>Trạng thái</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center">
                          Không có dữ liệu
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => (
                        <tr key={p.id}>
                          <td>{p.id}</td>
                          <td>{p.name}</td>
                          <td>{getTypeName(p.productTypeId)}</td>
                          <td>{formatMoney(p.price)}</td>
                          <td>{p.quantity}</td>

                          <td>
                            {p.quantity === 0 ? (
                              <span className="badge badge-danger">
                                Hết hàng
                              </span>
                            ) : p.quantity < 20 ? (
                              <span className="badge badge-warning">
                                Sắp hết
                              </span>
                            ) : (
                              <span className="badge badge-success">
                                Còn hàng
                              </span>
                            )}
                          </td>

                          <td>
                            <button
                              className="btn btn-sm btn-info mr-1"
                              onClick={() => openModal(p)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>

                            <button
                              className="btn btn-sm btn-danger"
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
          <div className="d-flex justify-content-between mt-3">
            <div>Total: {total} sản phẩm</div>

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

      {/* MODAL */}
      {showModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editing ? "Sửa sản phẩm" : "Thêm sản phẩm"}
                  </h5>
                  <button className="close" onClick={closeModal}>
                    <span>&times;</span>
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <input
                      className="form-control mb-2"
                      placeholder="Tên"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      required
                    />

                    <input
                      type="number"
                      className="form-control mb-2"
                      placeholder="Giá"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      required
                    />

                    <input
                      type="number"
                      className="form-control mb-2"
                      placeholder="Số lượng"
                      value={form.quantity}
                      onChange={(e) =>
                        setForm({ ...form, quantity: e.target.value })
                      }
                      required
                    />

                    <select
                      className="form-control"
                      value={form.productTypeId}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          productTypeId: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Chọn loại</option>
                      {types.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={closeModal}>
                      Huỷ
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Lưu
                    </button>
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
