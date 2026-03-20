const apiBase =window.location.origin+ "/api/departments"; // base endpoint

// ---------------------------
// Elements
// ---------------------------
const departmentsContainer = document.getElementById('departmentsContainer');
const addDeptButton = document.getElementById('addDepartmentButton');

// ---------------------------
// Fetch and render all departments
// ---------------------------
async function fetchDepartments() {
    try {
        const res = await fetch(apiBase);
        const departments = await res.json();

        departmentsContainer.innerHTML = ""; // clear

        departments.forEach(dept => {
            const card = document.createElement('div');
            card.className = 'department-card';
            card.innerHTML = `
                <h3>${dept.name}</h3>
                <button class="view-details" data-id="${dept._id}">View Details</button>
                <button class="delete-dept" data-id="${dept._id}">Delete</button>
            `;
            departmentsContainer.appendChild(card);
        });

        // Add event listeners
        document.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', e => {
                const id = e.target.dataset.id;
                showDepartmentDetails(id);
            });
        });

        document.querySelectorAll('.delete-dept').forEach(btn => {
            btn.addEventListener('click', async e => {
                const id = e.target.dataset.id;
                if (confirm("Are you sure you want to delete this department?")) {
                    await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
                    fetchDepartments(); // refresh list
                }
            });
        });

    } catch (err) {
        console.error("Error fetching departments:", err);
    }
}

// ---------------------------
// Show department details (stats + complaints + officers)
// ---------------------------
async function showDepartmentDetails(id) {
    try {
        const res = await fetch(`${apiBase}/${id}/stats`);
        const data = await res.json();

        // Clear container or show in modal
        const modal = document.getElementById('departmentDetailsModal');
        modal.innerHTML = `
            <h2>${data.department.name}</h2>
            <p>Total Complaints: ${data.stats.totalComplaints}</p>
            <p>Resolved: ${data.stats.resolvedComplaints}</p>
            <p>Pending: ${data.stats.pendingComplaints}</p>
            <p>Total Officers: ${data.stats.totalOfficers}</p>
            <p>Active Officers: ${data.stats.activeOfficers}</p>
            <button onclick="closeModal()">Close</button>
        `;

        modal.style.display = 'block';

    } catch (err) {
        console.error("Error fetching department details:", err);
    }
}

function closeModal() {
    document.getElementById('departmentDetailsModal').style.display = 'none';
}

// ---------------------------
// Add new department
// ---------------------------
addDeptButton.addEventListener('click', async () => {
    const name = prompt("Enter new department name:");
    if (!name) return;

    try {
        const res = await fetch(apiBase, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        const result = await res.json();

        if (res.ok) {
            alert(`Department "${result.name}" added`);
            fetchDepartments(); // refresh
        } else {
            alert(result.error || "Error adding department");
        }
    } catch (err) {
        console.error("Error adding department:", err);
    }
});

// ---------------------------
// Initialize
// ---------------------------
fetchDepartments();
