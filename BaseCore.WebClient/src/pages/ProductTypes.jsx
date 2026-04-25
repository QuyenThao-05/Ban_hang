import React, { useState, useEffect } from 'react';
import { productTypeApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ProductTypes = () => {
  const { isAdmin } = useAuth();

  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    setLoading(true);
    try {
      const res = await productTypeApi.getAll();
      setTypes(res.data || []);
    } catch (err) {
      console.error('Load product types failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type = null) => {
    if (type) {
      setEditingType(type);
      setFormData({ name: type.name });
    } else {
      setEditingType(null);
      setFormData({ name: '' });
    }
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingType(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingType) {
        await productTypeApi.update(editingType.id, {
          id: editingType.id,
          name: formData.name,
        });
      } else {
        await productTypeApi.create({
          name: formData.name,
        });
      }

      closeModal();
      loadTypes();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xoá loại sản phẩm?')) return;

    try {
      await productTypeApi.delete(id);
      loadTypes();
    } catch {
      alert('Không thể xoá (có thể đang được dùng)');
    }
  };

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <h1>Product Types Management</h1>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="card">

            <div className="card-header d-flex justify-content-between">
              <h3>All Product Types</h3>

              {isAdmin() && (
                <button className="btn btn-success" onClick={() => openModal()}>
                  + Add Type
                </button>
              )}
            </div>

            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border"></div>
                </div>
              ) : (
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      {isAdmin() && <th>Actions</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {types.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center">
                          No data
                        </td>
                      </tr>
                    ) : (
                      types.map((t) => (
                        <tr key={t.id}>
                          <td>{t.id}</td>
                          <td>{t.name}</td>

                          {isAdmin() && (
                            <td>
                              <button
                                className="btn btn-sm btn-info mr-1"
                                onClick={() => openModal(t)}
                              >
                                Edit
                              </button>

                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(t.id)}
                              >
                                Delete
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
        </div>
      </section>

      {/* MODAL */}
      {showModal && (
        <>
          <div className="modal fade show" style={{ display: 'block' }}>
            <div className="modal-dialog">
              <div className="modal-content">

                <div className="modal-header">
                  <h5>{editingType ? 'Edit Type' : 'Add Type'}</h5>
                  <button onClick={closeModal}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    {error && <div className="alert alert-danger">{error}</div>}

                    <input
                      className="form-control"
                      placeholder="Tên loại"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
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