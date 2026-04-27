import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const { login } = useAuth();

  const [form, setForm] = useState({
    username: "",
    password: "",
    remember: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await login(form.username, form.password);

    if (!res.success) {
      alert(res.message);
      return;
    }

    // ✅ LƯU USER
    localStorage.setItem(
      "user",
      JSON.stringify({
        username: res.data.username,
        role: res.data.role,
      }),
    );

    // ✅ CHUYỂN TRANG
    if (res.data.role === "admin") {
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/electro-master/index.html";
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* LOGO */}
        <div className="logo">
          <img src="/img/logo1.png" alt="" />
        </div>

        {/* TITLE */}
        <h3 className="login-title">Đăng nhập</h3>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="👤 Username"
            className="input"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />

          <input
            type="password"
            placeholder="🔒 Password"
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {/* REMEMBER */}
          <div className="remember-box">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={(e) => setForm({ ...form, remember: e.target.checked })}
            />
            <span>Remember me</span>
          </div>

          {/* BUTTON */}
          <button className="primary-btn">Đăng nhập</button>
        </form>

        {/* FOOTER */}
        <div className="login-footer">
          <a href="#">Quên mật khẩu?</a>
          <br />
          Chưa có tài khoản? <a href="#">Đăng ký</a>
        </div>
      </div>

      {/* STYLE */}
      <style>{`
        body {
          margin: 0;
          font-family: "Segoe UI", sans-serif;
        }

        .login-container {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
        }

        .login-box {
          width: 420px;
          padding: 40px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .logo {
          text-align: center;
          margin-bottom: 20px;
        }

        .logo img {
          width: 180px;
        }

        .login-title {
          text-align: center;
          margin-bottom: 25px;
          font-weight: 700;
          color: #d10024;
        }

        .input {
          width: 100%;
          padding: 12px 15px;
          margin-bottom: 15px;
          border-radius: 8px;
          border: 1px solid #ddd;
          transition: 0.3s;
        }

        .input:focus {
          border-color: #d10024;
          box-shadow: 0 0 5px rgba(209, 0, 36, 0.3);
          outline: none;
        }

        .primary-btn {
          width: 100%;
          padding: 12px;
          border-radius: 30px;
          background: #d10024;
          color: #fff;
          border: none;
          font-weight: 600;
          transition: 0.3s;
        }

        .primary-btn:hover {
          background: #a8001c;
          transform: translateY(-2px);
        }

        .remember-box {
          margin: 10px 0;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .login-footer {
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
        }

        .login-footer a {
          color: #d10024;
          font-weight: 500;
          text-decoration: none;
        }

        .login-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Login;
