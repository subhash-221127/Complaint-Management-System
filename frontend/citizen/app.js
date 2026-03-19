// ---------------------------
// Citizen Complaint Submission
// ---------------------------

const fabBtn = document.getElementById("fabBtn");
const categorySelect = document.getElementById("categorySelect");
const descBox = document.getElementById("descBox");
const fileInput = document.getElementById("fileInput");
const uploadBox = document.getElementById("uploadBox");
const fileList = document.getElementById("fileList");
const toast = document.getElementById("toast");
let selectedSeverity = "medium";

// Get logged-in user email (stored in localStorage after login)
const userEmail = localStorage.getItem("userEmail") || "guest@example.com";

// ---------------------------
// Severity Buttons
// ---------------------------
document.querySelectorAll(".sev").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll(".sev").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedSeverity = btn.dataset.sev;
  });
});

// ---------------------------
// File Input
// ---------------------------
uploadBox.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", () => {
  fileList.innerHTML = "";
  Array.from(fileInput.files).forEach(file => {
    const li = document.createElement("div");
    li.textContent = file.name;
    fileList.appendChild(li);
  });
});

// ---------------------------
// Submit Complaint
// ---------------------------
fabBtn.addEventListener("click", async () => {
  const category = categorySelect.value.trim();
  const description = descBox.value.trim();
  const title = description.split(".")[0] || "No title";
  const location = document.getElementById("addr").value.trim();
  const department = category;

  if (!category || !description || !location) {
    alert("Please fill all required fields");
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("location", location);
  formData.append("department", department);
  formData.append("severity", selectedSeverity);
  formData.append("contactEmail", userEmail); // Important for My Complaints

  // Add files
  Array.from(fileInput.files).forEach(file => {
    formData.append("evidence", file);
  });

  try {
    const res = await fetch("http://localhost:5000/api/create", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (res.ok) {
      showToast(data.message || "Complaint submitted!");
      resetForm();
    } else {
      alert(data.message || "Error submitting complaint");
    }
          } catch (err) {
            console.error(err);
            alert("Server error. Try again later.");
  }
});

// ---------------------------
// Toast & Reset
// ---------------------------
function showToast(message) {
  toast.style.display = "flex";
  toast.querySelector("strong").textContent = message;
  setTimeout(() => { toast.style.display = "none"; }, 3000);
}

function resetForm() {
  categorySelect.value = "";
  descBox.value = "";
  fileInput.value = "";
  fileList.innerHTML = "";
  document.querySelectorAll(".sev").forEach(b => b.classList.remove("active"));
  document.querySelector(".sev.medium").classList.add("active");
  selectedSeverity = "medium";
  document.getElementById("addr").value = "";
}