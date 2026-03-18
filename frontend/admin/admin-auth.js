/* ============================================================
   admin-auth.js - Shared auth guard + dynamic user info
   Include this BEFORE other scripts on every admin page.
   ============================================================ */

(function adminAuthGuard() {
  'use strict';

  const raw = sessionStorage.getItem('cityfix_user');
  if (!raw) { window.location.replace('../login.html'); return; }

  let user;
  try { user = JSON.parse(raw); } catch (e) { window.location.replace('../login.html'); return; }
  if (user.role !== 'admin') { window.location.replace('../login.html'); return; }

  document.addEventListener('DOMContentLoaded', function () {
    const nameEl = document.getElementById('admin-name');
    const avatarEl = document.getElementById('admin-avatar');
    if (nameEl) nameEl.textContent = user.name || 'Admin User';
    if (avatarEl) avatarEl.textContent = user.initials || 'AD';
    refreshComplaintBadges();
  });
})();

async function refreshComplaintBadges() {
  try {
    const res = await fetch('http://localhost:5000/api/complaints');
    if (!res.ok) return;

    const data = await res.json();
    const total = Array.isArray(data) ? data.length : 0;

    document.querySelectorAll('.complaints-count-badge').forEach((el) => {
      el.textContent = String(total);
    });
  } catch (err) {
    console.error('Failed to refresh complaints badge:', err);
  }
}

function doLogout(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  sessionStorage.removeItem('cityfix_user');
  window.location.href = '../login.html';
}
