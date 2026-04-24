// ===== LOGIN =====
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("http://localhost:5001/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    alert("Đăng nhập thành công!");
    window.location.href = "index.html";
  } else {
    alert("Sai tài khoản!");
  }
}

// ===== LOGOUT =====
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

// ===== CHECK LOGIN =====
function checkLogin() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Bạn chưa đăng nhập!");
    window.location.href = "login.html";
  }
}