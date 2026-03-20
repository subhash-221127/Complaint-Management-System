// login.js

const form = document.getElementById("login-form");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showError("Please fill all fields");
    return;
  }

  const btn = form.querySelector(".submit-btn");
  btn.textContent = "Signing in…";
  btn.disabled = true;

  try {
    const res = await fetch("http://localhost:5000/api/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      // Build full session object — includes _id for API calls
      const initials = (data.user.name || "")
        .split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "U";

      const sessionUser = {
        id:         data.user.id,          // MongoDB _id — used as citizenId in complaint submit
        name:       data.user.name,
        email:      data.user.email,
        role:       data.user.role,
        department: data.user.department || "",
        phone:      data.user.phone || "",
        initials,
      };

      // Store in both sessionStorage (preferred) and localStorage (fallback)
      sessionStorage.setItem("cityfix_user", JSON.stringify(sessionUser));
      localStorage.setItem("cityfix_user",   JSON.stringify(sessionUser));
      localStorage.setItem("userEmail",      data.user.email);

      // Redirect based on role
      if (data.user.role === "citizen") {
        window.location.href = "citizen/citizen_dash.html";
      } else if (data.user.role === "admin") {
        window.location.href = "admin/dashboard.html";
      } else if (data.user.role === "officer") {
        window.location.href = "officer/complaints.html";
      } else {
        showError("Unrecognized role. Contact admin.");
        btn.textContent = "Sign In";
        btn.disabled = false;
      }
    } else {
      showError(data.message || "Login failed. Please check your credentials.");
      btn.textContent = "Sign In";
      btn.disabled = false;
    }

  } catch (err) {
    console.error("Login error:", err);
    showError("Cannot connect to server. Is the backend running on port 5000?");
    btn.textContent = "Sign In";
    btn.disabled = false;
  }
});

function showError(msg) {
  let box = document.getElementById("error-box");
  if (!box) {
    box = document.createElement("div");
    box.id = "error-box";
    box.style.cssText = "margin-top:12px;padding:10px 14px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;color:#dc2626;font-size:14px;";
    form.parentElement.appendChild(box);
  }
  box.style.display = "block";
  box.textContent = msg;
}