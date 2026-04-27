import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await login(form.username, form.password);

    if (!res.success) {
      alert(res.message);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#f8f9fa,#e9ecef)",
      }}
    >
      <div
        style={{
          width: 420,
          padding: 40,
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img src="/img/logo1.png" alt="" style={{ width: 180 }} />
        </div>

        <h3 style={{ textAlign: "center", color: "#d10024" }}>Đăng nhập</h3>

        <form onSubmit={handleSubmit}>
          <input
            className="form-control mb-3"
            placeholder="👤 Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />

          <input
            type="password"
            className="form-control mb-3"
            placeholder="🔒 Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 30,
              background: "#d10024",
              color: "#fff",
              border: "none",
              fontWeight: 600,
            }}
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
