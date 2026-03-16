const form = document.getElementById("login-form");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      // Persist user session (used by admin/officer pages)
      const initials = (data.user.name || "").split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "U";
      const sessionUser = {
        id: data.user.id,
        name: data.user.name,
        role: data.user.role,
        email,
        initials
      };
      sessionStorage.setItem("cityfix_user", JSON.stringify(sessionUser));
      localStorage.setItem("userEmail", email);

      // Redirect based on role
      if (data.user.role === "citizen") {
        window.location.href = "citizen/citizen_dash.html";
      } else if (data.user.role === "admin") {
        window.location.href = "admin/departments.html";
      } else if (data.user.role === "officer") {
        window.location.href = "officer/complaints.html";
      } else {
        alert("User role not recognized");
      }
    } else {
      alert(data.message || "Login failed");
    }

  } catch (err) {
    console.error(err);
    alert("Server error. Try again later.");
  }
});