document.addEventListener("DOMContentLoaded", () => {
  loadComplaints();
});

async function loadComplaints() {
  try {
    const res = await fetch("http://localhost:5000/api/complaints");

    console.log("Status:", res.status);

    if (!res.ok) {
      throw new Error("Failed to fetch complaints");
    }

    const data = await res.json();
    console.log("Complaints:", data);

    const tableBody = document.querySelector("#complaints-table tbody");

    if (!tableBody) {
      console.error("❌ Table body not found");
      return;
    }

    if (!data.length) {
      tableBody.innerHTML = `<tr><td colspan="5">No complaints found</td></tr>`;
      return;
    }

    tableBody.innerHTML = data.map(c => `
      <tr>
        <td>${c.complaintId || "-"}</td>
        <td>${c.title}</td>
        <td>${c.department}</td>
        <td>${c.status}</td>
        <td>${c.location || "-"}</td>
      </tr>
    `).join("");

  } catch (err) {
    console.error("❌ Error:", err);
    alert("Failed to load complaints");
  }
}