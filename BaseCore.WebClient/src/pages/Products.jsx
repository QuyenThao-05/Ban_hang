import React, { useState, useEffect } from "react";
import { productApi, productTypeApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const Products = () => {
  const { isAdmin } = useAuth();

  const [products, setProducts] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [typeId, setTypeId] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    imageUrl: "",
    productTypeId: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    loadTypes();
    loadProducts();
  }, []);

  // ================= LOAD DATA =================

  const loadTypes = async () => {
    try {
      const res = await productTypeApi.getAll();
      setTypes(res.data || []);
    } catch (err) {
      console.error("Load types failed", err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productApi.getAll();

      // API có thể trả nhiều dạng
      const data =
        res.data?.items ||
        res.data?.data ||
        res.data ||
        [];

      setProducts(data);
    } catch (err) {
      console.error("Load products failed", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= SEARCH =================

  const handleSearch = (e) => {
    e.preventDefault();

    let filtered = [...products];

    if (keyword) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    if (typeId) {
      filtered = filtered.filter(
        (p) => p.productTypeId === parseInt(typeId)
      );
    }

    setProducts(filtered);
  };

  // ================= MODAL =================

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        stock: product.stock,
        description: product.description || "",
        imageUrl: product.imageUrl || "",
        productTypeId: product.productTypeId,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        price: "",
        stock: "",
        description: "",
        imageUrl: "",
        productTypeId: types[0]?.id || "",
      });
    }

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  // ================= SUBMIT =================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        description: formData.description,
        imageUrl: formData.imageUrl,
        productTypeId: parseInt(formData.productTypeId),
      };

      if (editingProduct) {
        await productApi.update(editingProduct.id, {
          id: editingProduct.id,
          ...data,
        });
      } else {
        await productApi.create(data);
      }

      closeModal();
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi xử lý");
    }
  };

  // ================= DELETE =================

  const handleDelete = async (id) => {
    if (!window.confirm("Xoá sản phẩm?")) return;

    try {
      await productApi.delete(id);
      loadProducts();
    } catch {
      alert("Xoá thất bại");
    }
  };

  // ================= UI =================

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <h1 className="m-0">Quản lý sản phẩm</h1>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="card">

            {/* SEARCH */}
            <div className="card-header d-flex justify-content-between">
              <form onSubmit={handleSearch} className="form-inline">
                <input
                  className="form-control mr-2"
                  placeholder="Tìm kiếm..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />

                <select
                  className="form-control mr-2"
                  value={typeId}
                  onChange={(e) => setTypeId(e.target.value)}
                >
                  <option value="">Tất cả loại</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>

                <button className="btn btn-primary">Tìm</button>
              </form>

              {isAdmin() && (
                <button className="btn btn-success" onClick={() => openModal()}>
                  + Thêm
                </button>
              )}
            </div>

            {/* TABLE */}
            <div className="card-body">
              {loading ? (
                <div>Loading...</div>
              ) : (
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tên</th>
                      <th>Loại</th>
                      <th>Giá</th>
                      <th>Kho</th>
                      {isAdmin() && <th>Hành động</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.name}</td>
                        <td>{p.productType?.name}</td>
                        <td>{p.price?.toLocaleString()} đ</td>
                        <td>{p.stock}</td>

                        {isAdmin() && (
                          <td>
                            <button
                              className="btn btn-info btn-sm mr-1"
                              onClick={() => openModal(p)}
                            >
                              Sửa
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(p.id)}
                            >
                              Xoá
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
                  <h5>{editingProduct ? "Sửa" : "Thêm"} sản phẩm</h5>
                  <button onClick={closeModal}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    {error && <div className="alert alert-danger">{error}</div>}

                    <input
                      className="form-control mb-2"
                      placeholder="Tên"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />

                    <select
                      className="form-control mb-2"
                      value={formData.productTypeId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          productTypeId: e.target.value,
                        })
                      }
                      required
                    >
                      {types.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      className="form-control mb-2"
                      placeholder="Giá"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                    />

                    <input
                      type="number"
                      className="form-control mb-2"
                      placeholder="Số lượng"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={closeModal}>
                      Huỷ
                    </button>
                    <button className="btn btn-primary">Lưu</button>
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