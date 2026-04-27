import React, { useEffect, useState } from "react";
import { productTypeApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const ProductTypes = () => {
  const { isAdmin } = useAuth();

  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    loadTypes();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const loadTypes = async () => {
    try {
      setLoading(true);
      const res = await productTypeApi.getAll();
      setTypes(res.data || []);
    } catch (err) {
      console.log("Load failed", err);
    } finally {
      setLoading(false);
    }
  };

  // FILTER
  const filtered = types.filter((t) =>
    t.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const paginatedData = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // MODAL
  const openModal = (t = null) => {
    if (t) {
      setEditing(t);
      setForm({
        name: t.name,
        description: t.description || "",
      });
    } else {
      setEditing(null);
      setForm({
        name: "",
        description: "",
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
        await productTypeApi.update(editing.id, {
          id: editing.id,
          ...form,
        });
      } else {
        await productTypeApi.create(form);
      }

      closeModal();
      loadTypes();
    } catch {
      alert("Lỗi khi lưu");
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Xoá loại sản phẩm?")) return;

    try {
      await productTypeApi.delete(id);
      loadTypes();
    } catch {
      alert("Không thể xoá (đang được sử dụng)");
    }
  };

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <h1 className="ml-3">Quản lý loại sản phẩm</h1>
      </div>

      <section className="content">
        <div className="container-fluid">
          {/* FILTER */}
          <div className="card p-3 mb-3 d-flex flex-row">
            <input
              className="form-control mr-2"
              placeholder="Tìm loại sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            
              <button className="btn btn-success" onClick={() => openModal()}>
                <i className="fas fa-plus"></i> Thêm
              </button>
           
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
                      <th>Mô tả</th>
                      {isAdmin() && <th>Action</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center">
                          Không có dữ liệu
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((t) => (
                        <tr key={t.id}>
                          <td>{t.id}</td>
                          <td>{t.name}</td>
                          <td>{t.description}</td>

                          {isAdmin() && (
                            <td>
                              <button
                                className="btn btn-sm btn-info mr-1"
                                onClick={() => openModal(t)}
                              >
                                <i className="fas fa-edit"></i>
                              </button>

                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(t.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          )}
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
            {/* LEFT: TOTAL */}
            <div>Total: {filtered.length} loại</div>

            {/* RIGHT: PAGINATION */}
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
                  <h5>
                    {editing ? "Sửa loại sản phẩm" : "Thêm loại sản phẩm"}
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

                    <textarea
                      className="form-control"
                      placeholder="Mô tả"
                      value={form.description}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closeModal}
                    >
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

export default ProductTypes;
