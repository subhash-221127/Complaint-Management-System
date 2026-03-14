/* ─────────────────────────────────────────
   MY COMPLAINTS — Full Citizen Detail Table
───────────────────────────────────────── */

const complaints = [
  {
    id: 'CMP-2026-101',
    title: 'Street Light Not Working',
    description: 'The street light near the main bus stop has been out for over a week. Very dark at night.',
    category: 'Electricity & Lighting',
    severity: 'medium',
    location: '18, Oak Lane',
    city: 'Springfield',
    district: 'Central District',
    pincode: '500032',
    name: 'Jane Doe',
    mobile: '+91 98765 43210',
    email: 'jane@email.com',
    date: '12 Mar 2026',
    status: 'In Progress',
    attachments: 2,
    officer: 'Priya Nair',
    dept: 'Electricity Dept.'
  },
  {
    id: 'CMP-2026-102',
    title: 'Garbage Not Collected',
    description: 'Garbage collection truck has not come for 5 days. Waste piling up causing bad smell.',
    category: 'Garbage & Sanitation',
    severity: 'medium',
    location: 'Gandhi Nagar, Block C',
    city: 'Greenfield',
    district: 'North District',
    pincode: '500045',
    name: 'Jane Doe',
    mobile: '+91 98765 43210',
    email: 'jane@email.com',
    date: '10 Mar 2026',
    status: 'Pending',
    attachments: 3,
    officer: '—',
    dept: 'Sanitation Dept.'
  },
  {
    id: 'CMP-2026-103',
    title: 'Water Leakage on Main Road',
    description: 'Underground water pipe burst near the park. Water flooding the road for 2 days.',
    category: 'Water & Sewage',
    severity: 'critical',
    location: 'Civil Lines, Near Park',
    city: 'Riverside',
    district: 'East District',
    pincode: '500011',
    name: 'Jane Doe',
    mobile: '+91 98765 43210',
    email: 'jane@email.com',
    date: '05 Mar 2026',
    status: 'Resolved',
    attachments: 4,
    officer: 'Rajan Kumar',
    dept: 'Water Dept.'
  },
  {
    id: 'CMP-2026-104',
    title: 'Water Leakage Near School',
    description: 'Sewage water overflowing near the primary school entrance. Health hazard for children.',
    category: 'Water & Sewage',
    severity: 'high',
    location: '7, School Road',
    city: 'Springfield',
    district: 'Central District',
    pincode: '500032',
    name: 'Jane Doe',
    mobile: '+91 98765 43210',
    email: 'jane@email.com',
    date: '05 Mar 2026',
    status: 'Pending',
    attachments: 1,
    officer: '—',
    dept: 'Water Dept.'
  },
  {
    id: 'CMP-2026-105',
    title: 'Water Leakage at Junction',
    description: 'Pipe leaking at the main junction causing water wastage and slippery road conditions.',
    category: 'Water & Sewage',
    severity: 'medium',
    location: 'MG Road Junction',
    city: 'Lakewood',
    district: 'South District',
    pincode: '500067',
    name: 'Jane Doe',
    mobile: '+91 98765 43210',
    email: 'jane@email.com',
    date: '05 Mar 2026',
    status: 'In Progress',
    attachments: 2,
    officer: 'Suresh Pillai',
    dept: 'Water Dept.'
  },
  {
    id: 'CMP-2026-106',
    title: 'Garbage Not Collected – Sector 4',
    description: 'Garbage bins overflowing in Sector 4. No collection done this week despite complaints.',
    category: 'Garbage & Sanitation',
    severity: 'low',
    location: 'Sector 4, Block B',
    city: 'Greenfield',
    district: 'North District',
    pincode: '500045',
    name: 'Jane Doe',
    mobile: '+91 98765 43210',
    email: 'jane@email.com',
    date: '10 Mar 2026',
    status: 'Resolved',
    attachments: 0,
    officer: 'Anita Sharma',
    dept: 'Sanitation Dept.'
  },
  {
    id: 'CMP-2026-107',
    title: 'Broken Road Near School',
    description: 'Large potholes on the road leading to the school causing accidents and damage to vehicles.',
    category: 'Roads & Potholes',
    severity: 'high',
    location: '12, Station Road',
    city: 'Springfield',
    district: 'Central District',
    pincode: '500032',
    name: 'Jane Doe',
    mobile: '+91 98765 43210',
    email: 'jane@email.com',
    date: '08 Mar 2026',
    status: 'In Progress',
    attachments: 3,
    officer: 'Mohan Reddy',
    dept: 'Roads Dept.'
  },
  {
    id: 'CMP-2026-108',
    title: 'Noise Pollution at Night',
    description: 'Nearby venue plays loud music past midnight every weekend. Disturbing entire neighbourhood.',
    category: 'Noise Pollution',
    severity: 'medium',
    location: 'MG Road, Apt Block D',
    city: 'Riverside',
    district: 'East District',
    pincode: '500011',
    name: 'Jane Doe',
    mobile: '+91 98765 43210',
    email: 'jane@email.com',
    date: '07 Mar 2026',
    status: 'Pending',
    attachments: 1,
    officer: '—',
    dept: '—'
  },
];

const categoryIcons = {
  'Roads & Potholes':       'fa-road',
  'Electricity & Lighting': 'fa-bolt',
  'Garbage & Sanitation':   'fa-trash',
  'Water & Sewage':         'fa-droplet',
  'Parks & Recreation':     'fa-tree',
  'Noise Pollution':        'fa-volume-high',
  'Public Safety':          'fa-shield-halved',
};

function statusClass(s) {
  if (s === 'In Progress') return 'status-inprogress';
  if (s === 'Pending')     return 'status-pending';
  if (s === 'Resolved')    return 'status-resolved';
  return '';
}

function sevHTML(sev) {
  return `<span class="sev ${sev}"><span class="sev-dot"></span>${sev.charAt(0).toUpperCase()+sev.slice(1)}</span>`;
}

function renderTable() {
  const search   = document.getElementById('searchInput').value.toLowerCase().trim();
  const status   = document.getElementById('statusFilter').value;
  const category = document.getElementById('categoryFilter').value;
  const tbody    = document.getElementById('tableBody');
  const empty    = document.getElementById('emptyState');
  const table    = document.getElementById('complaintsTable');
  const countEl  = document.getElementById('totalCount');

  const filtered = complaints.filter(c => {
    const matchSearch   = !search   || c.id.toLowerCase().includes(search) || c.title.toLowerCase().includes(search) || c.location.toLowerCase().includes(search) || c.city.toLowerCase().includes(search);
    const matchStatus   = !status   || c.status === status;
    const matchCategory = !category || c.category === category;
    return matchSearch && matchStatus && matchCategory;
  });

  countEl.textContent = `${filtered.length} complaint${filtered.length !== 1 ? 's' : ''}`;

  if (!filtered.length) {
    tbody.innerHTML = '';
    empty.style.display  = 'block';
    table.style.display  = 'none';
    return;
  }
  empty.style.display = 'none';
  table.style.display = 'table';

  tbody.innerHTML = filtered.map(c => `
    <tr>
      <td><span class="comp-id">${c.id}</span></td>
      <td>
        <span class="issue-title">${c.title}</span>
        <span class="issue-desc">${c.description}</span>
      </td>
      <td>
        <span class="cat-badge">
          <i class="fa-solid ${categoryIcons[c.category] || 'fa-circle-dot'}"></i>
          ${c.category}
        </span>
      </td>
      <td>${sevHTML(c.severity)}</td>
      <td>
        <span class="loc-text">${c.location}</span>
        <span class="loc-city">${c.city}, ${c.pincode}</span>
      </td>
      <td>
        <span class="contact-name">${c.name}</span>
        <span class="contact-phone">${c.mobile}</span>
      </td>
      <td>${c.date}</td>
      <td><span class="${statusClass(c.status)}">${c.status}</span></td>
      <td>
        <button class="view-btn" data-id="${c.id}">
          <i class="fa-solid fa-eye"></i> View
        </button>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.id));
  });
}

function openModal(id) {
  const c = complaints.find(x => x.id === id);
  if (!c) return;
  document.getElementById('modalId').textContent    = c.id;
  document.getElementById('modalTitle').textContent = c.title;
  document.getElementById('modalBody').innerHTML = `

    <div class="modal-section">
      <div class="modal-section-title">Complaint Details</div>
      <div class="modal-grid">
        <div class="modal-field"><label>Category</label>
          <span><i class="fa-solid ${categoryIcons[c.category]||'fa-circle-dot'}" style="color:var(--lavender);margin-right:5px;"></i>${c.category}</span>
        </div>
        <div class="modal-field"><label>Severity</label><span>${sevHTML(c.severity)}</span></div>
        <div class="modal-field"><label>Date Filed</label><span>${c.date}</span></div>
        <div class="modal-field"><label>Status</label><span class="${statusClass(c.status)}">${c.status}</span></div>
        <div class="modal-field"><label>Attachments</label><span>${c.attachments} file${c.attachments!==1?'s':''}</span></div>
        <div class="modal-field"><label>Department</label><span>${c.dept}</span></div>
        <div class="modal-field" style="grid-column:span 2"><label>Description</label></div>
      </div>
      <div class="modal-desc-box">${c.description}</div>
    </div>

    <div class="modal-section">
      <div class="modal-section-title">Location</div>
      <div class="modal-grid">
        <div class="modal-field"><label>Street Address</label><span>${c.location}</span></div>
        <div class="modal-field"><label>City</label><span>${c.city}</span></div>
        <div class="modal-field"><label>District</label><span>${c.district}</span></div>
        <div class="modal-field"><label>Pincode</label><span>${c.pincode}</span></div>
      </div>
    </div>

    <div class="modal-section">
      <div class="modal-section-title">Citizen Contact</div>
      <div class="modal-grid">
        <div class="modal-field"><label>Full Name</label><span>${c.name}</span></div>
        <div class="modal-field"><label>Mobile</label><span>${c.mobile}</span></div>
        <div class="modal-field"><label>Email</label><span>${c.email}</span></div>
        <div class="modal-field"><label>Assigned Officer</label><span>${c.officer}</span></div>
      </div>
    </div>
  `;
  document.getElementById('modalOverlay').classList.add('show');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('show');
}

document.addEventListener('DOMContentLoaded', () => {
  renderTable();
  document.getElementById('searchInput').addEventListener('input', renderTable);
  document.getElementById('statusFilter').addEventListener('change', renderTable);
  document.getElementById('categoryFilter').addEventListener('change', renderTable);
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target.id === 'modalOverlay') closeModal();
  });
});