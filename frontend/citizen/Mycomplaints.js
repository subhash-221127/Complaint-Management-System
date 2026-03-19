// Mycomplaints.js

const tableBody = document.getElementById("tableBody");
const emptyState = document.getElementById("emptyState");
const totalCount = document.getElementById("totalCount");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const categoryFilter = document.getElementById("categoryFilter");

// Fetch complaints from backend
async function loadComplaints() {
  try {
    const res = await fetch("http://localhost:5000/api/mycomplaints");
    const complaints = await res.json();

    if (!Array.isArray(complaints) || complaints.length === 0) {
      tableBody.innerHTML = "";
      emptyState.style.display = "flex";
      totalCount.textContent = "(0)";
      return;
    }

    emptyState.style.display = "none";
    totalCount.textContent = `(${complaints.length})`;

    // Clear table
    tableBody.innerHTML = "";

    // Populate table
    complaints.forEach(c => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${c.complaintId}</td>
        <td>${c.title}</td>
        <td>${c.department}</td>
        <td>${capitalize(c.severity)}</td>
        <td>${c.location}</td>
        <td>—</td>
        <td>${new Date(c.createdAt).toLocaleDateString()}</td>
        <td>${formatStatus(c.status)}</td>
        <td><button class="view-btn" data-id="${c._id}">View</button></td>
      `;

      tableBody.appendChild(tr);
    });

    // Add click events for "View" buttons
    document.querySelectorAll(".view-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        const id = btn.dataset.id;
        showModal(complaints.find(c => c._id === id));
      });
    });

  } catch (err) {
    console.error("Error loading complaints:", err);
    alert("Failed to load complaints. Try again later.");
  }
}

// ---------------------------
// Helpers
// ---------------------------
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatStatus(status) {
  switch (status) {
    case "pending": return "Pending";
    case "in_progress": return "In Progress";
    case "resolved": return "Resolved";
    default: return status;
  }
}

// ---------------------------
// Modal
// ---------------------------
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalId = document.getElementById("modalId");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

function showModal(complaint) {
  if (!complaint) return;
  modalId.textContent = complaint.complaintId;
  modalTitle.textContent = complaint.title;

  modalBody.innerHTML = `
    <p><strong>Category:</strong> ${complaint.department}</p>
    <p><strong>Severity:</strong> ${capitalize(complaint.severity)}</p>
    <p><strong>Location:</strong> ${complaint.location}</p>
    <p><strong>Status:</strong> ${formatStatus(complaint.status)}</p>
    <p><strong>Description:</strong> ${complaint.description}</p>
    ${complaint.evidence ? `<p><strong>Evidence:</strong> <a href="http://localhost:5000/uploads/${complaint.evidence}" target="_blank">View File</a></p>` : ""}
  `;

  modalOverlay.style.display = "flex";
}

modalClose.addEventListener("click", () => {
  modalOverlay.style.display = "none";
});

// ---------------------------
// Filters
// ---------------------------
searchInput.addEventListener("input", filterTable);
statusFilter.addEventListener("change", filterTable);
categoryFilter.addEventListener("change", filterTable);

function filterTable() {
  const search = searchInput.value.toLowerCase();
  const status = statusFilter.value.toLowerCase();
  const category = categoryFilter.value.toLowerCase();

  document.querySelectorAll("#complaintsTable tbody tr").forEach(tr => {
    const tds = tr.querySelectorAll("td");
    const matchSearch = Array.from(tds).some(td => td.textContent.toLowerCase().includes(search));
    const matchStatus = !status || tds[7].textContent.toLowerCase() === status;
    const matchCategory = !category || tds[2].textContent.toLowerCase() === category;

    tr.style.display = (matchSearch && matchStatus && matchCategory) ? "" : "none";
  });
}

// ---------------------------
// Initialize
// ---------------------------
loadComplaints();