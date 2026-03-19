const form = document.getElementById("login-form");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showError("Please fill all fields");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    // 🔥 FIX: handle invalid JSON / server crash
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error("Invalid response from server");
    }

    if (res.ok && data.user) {

      // ✅ Create session user
      const initials =
        (data.user.name || "")
          .split(" ")
          .filter(Boolean)
          .map(w => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase() || "U";

      const sessionUser = {
        id: data.user._id || data.user.id,
        name: data.user.name,
        role: data.user.role,
        email: data.user.email,
        initials
      };

      // ✅ Store session
      sessionStorage.setItem("cityfix_user", JSON.stringify(sessionUser));
      localStorage.setItem("userEmail", data.user.email);

      // ✅ Redirect based on role
      if (data.user.role === "citizen") {
        window.location.href = "citizen/citizen_dash.html";
      } 
      else if (data.user.role === "admin") {
        window.location.href = "admin/dashboard.html";   // 🔥 FIXED
      } 
      else if (data.user.role === "officer") {
        window.location.href = "officer/complaints.html";
      } 
      else {
        showError("User role not recognized");
      }

    } else {
      showError(data.message || "Invalid email or password");
    }

  } catch (err) {
    console.error("Login Error:", err);
    showError("Server not responding. Please try again.");
  }
});

// 🔥 Better UI error instead of alert
function showError(msg) {
  const box = document.getElementById("error-box");
  const text = document.getElementById("error-text");

  if (box && text) {
    box.style.display = "block";
    text.innerText = msg;
  } else {
    alert(msg);
  }
}