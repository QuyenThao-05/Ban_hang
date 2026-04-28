import React, { useState, useEffect } from "react";
import { userApi } from "../services/api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    role: "user",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    loadUsers();
  }, [page, keyword]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAll({ keyword, page, pageSize });

      const data = res.data;

      setUsers(data.items || []);
      setTotalCount(data.totalCount || 0);

      // 👉 tự tính totalPages
      setTotalPages(Math.ceil((data.totalCount || 0) / pageSize));
    } catch (err) {
      console.error("Load users error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  // ================= CRUD =================

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: "",
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        role: user.role || "user",
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: "",
        password: "",
        fullName: "",
        email: "",
        phone: "",
        address: "",
        role: "user",
      });
    }
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingUser) {
        const updateData = {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          role: formData.role,
        };

        if (formData.password) {
          updateData.password = formData.password;
        }

        await userApi.update(editingUser.id, updateData);
      } else {
        if (!formData.password) {
          setError("Password is required");
          return;
        }

        await userApi.create({
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          role: formData.role,
        });
      }

      closeModal();
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (user) => {
    if (user.role === "admin") {
      alert("Không thể xóa admin");
      return;
    }

    if (!window.confirm("Xóa user này?")) return;

    try {
      await userApi.delete(user.id);
      loadUsers();
    } catch {
      alert("Delete failed");
    }
  };

  // ================= UI =================

  return (
    <div className="content-wrapper p-3">
      <h2>Users Management</h2>

      {/* SEARCH + ADD */}
      <div className="d-flex justify-content-between mb-3">
        <form onSubmit={handleSearch} className="d-flex">
          <input
            className="form-control mr-2"
            placeholder="Search username, email..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button className="btn btn-primary">Search</button>
        </form>

        <button className="btn btn-success" onClick={() => openModal()}>
          + Add User
        </button>
      </div>

      {/* TABLE */}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Username</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Role</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="8" className="text-center">
                Loading...
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                No users found
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>{u.address}</td>

                <td>
                  <span
                    className={`badge ${u.role === "admin" ? "badge-danger" : "badge-info"}`}
                  >
                    {u.role}
                  </span>
                </td>

                <td>
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString()
                    : ""}
                </td>

                <td>
                  <button
                    className="btn btn-sm btn-info mr-2"
                    onClick={() => openModal(u)}
                  >
                    ✏️
                  </button>

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(u)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* PAGINATION + TOTAL */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>Total: {totalCount} users</div>

        <div className="d-flex align-items-center">
          <button
            className="btn btn-secondary mr-2"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ← Previous
          </button>

          <span>
            Trang {page} / {totalPages || 1}
          </span>

          <button
            className="btn btn-secondary ml-2"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal fade show d-block">
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5>{editingUser ? "Edit User" : "Add User"}</h5>
                </div>

                <div className="modal-body">
                  {error && <div className="alert alert-danger">{error}</div>}

                  <input
                    className="form-control mb-2"
                    placeholder="Username"
                    value={formData.username}
                    disabled={!!editingUser}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                  />

                  <input
                    type="password"
                    className="form-control mb-2"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />

                  <input
                    className="form-control mb-2"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />

                  <input
                    className="form-control mb-2"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />

                  <input
                    className="form-control mb-2"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />

                  <input
                    className="form-control mb-2"
                    placeholder="Address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />

                  <select
                    className="form-control"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>

                  <button className="btn btn-primary">
                    {editingUser ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
