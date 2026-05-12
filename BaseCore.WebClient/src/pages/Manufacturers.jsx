import React, { useEffect, useState } from "react";
import { manufacturerApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const Manufacturers = () => {
  const { isAdmin } = useAuth();

  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState(0);


  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    loadManufacturers();
  }, [currentPage]);
  useEffect(() => {
  const timer = setTimeout(() => {
    setCurrentPage(1);
    loadManufacturers();
  }, 400);

  return () => clearTimeout(timer);
}, [search]);
 

  // ================= LOAD =================
  const loadManufacturers = async () => {
  try {
    setLoading(true);

    const res = await manufacturerApi.getAll({
      page: currentPage,
      pageSize,
      search: search || undefined,
    });

    setManufacturers(res.data?.items || []);
    setTotalCount(res.data?.totalCount || 0);
  } catch (err) {
    console.log("Load failed", err);
    setManufacturers([]);
    setTotalCount(0);
  } finally {
    setLoading(false);
  }
};

  // ================= FILTER =================
  //const filtered = Array.isArray(manufacturers)
   // ? manufacturers.filter((m) =>
   //     m.name?.toLowerCase().includes(search.toLowerCase()) ||
   //     m.phone?.toLowerCase().includes(search.toLowerCase())
   //   )
   // : [];

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  //const paginatedData = filtered.slice(
    //(currentPage - 1) * pageSize,
    //currentPage * pageSize
 // );

  // ================= MODAL =================
  const openModal = (m = null) => {
    if (m) {
      setEditing(m);
      setForm({ name: m.name, address: m.address || "", phone: m.phone || "" });
    } else {
      setEditing(null);
      setForm({ name: "", address: "", phone: "" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  // ================= SAVE =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await manufacturerApi.update(editing.id, form);
      } else {
        await manufacturerApi.create(form);
      }
      closeModal();
      loadManufacturers();
    } catch {
      alert("Lỗi khi lưu");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Xoá nhà sản xuất này?")) return;
    try {
      await manufacturerApi.delete(id);
      loadManufacturers();
    } catch {
      alert("Không thể xoá (đang được sử dụng)");
    }
  };

  // ================= UI =================
  return (
    <div className="content-wrapper">
      <div className="content-header">
        <h1 className="ml-3">Quản lý nhà sản xuất</h1>
      </div>

      <section className="content">
        <div className="container-fluid">
          {/* FILTER */}
          <div className="card p-3 mb-3 d-flex flex-row">
            <input
              className="form-control mr-2"
              placeholder="Tìm nhà sản xuất..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
                      <th>Địa chỉ</th>
                      <th>Điện thoại</th>
                      {isAdmin() && <th>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {manufacturers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center">
                          Không có dữ liệu
                        </td>
                      </tr>
                    ) : (
                      manufacturers.map((m) => (
                        <tr key={m.id}>
                          <td>{m.id}</td>
                          <td>{m.name}</td>
                          <td>{m.address || "—"}</td>
                          <td>{m.phone || "—"}</td>
                          {isAdmin() && (
                            <td>
                              <button
                                className="btn btn-sm btn-info mr-1"
                                onClick={() => openModal(m)}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(m.id)}
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
            <div>Total: {totalCount} nhà sản xuất</div>
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
                  <h5>{editing ? "Sửa nhà sản xuất" : "Thêm nhà sản xuất"}</h5>
                  <button className="close" onClick={closeModal}>
                    <span>&times;</span>
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <input
                      className="form-control mb-2"
                      placeholder="Tên nhà sản xuất"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                    <input
                      className="form-control mb-2"
                      placeholder="Địa chỉ"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                    <input
                      className="form-control mb-2"
                      placeholder="Điện thoại"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
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

export default Manufacturers;
