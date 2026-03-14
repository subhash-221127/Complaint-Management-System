/* ─────────────────────────────────────────
   TRACK STATUS — track-status.js
───────────────────────────────────────── */

const complaints = {
  'CMP-2026-101': {
    id: 'CMP-2026-101', title: 'Street Light Not Working',
    category: 'Electricity & Lighting', severity: 'medium',
    location: '18, Oak Lane, Springfield', date: '12 Mar 2026',
    officer: 'Priya Nair', dept: 'Electricity Dept.',
    status: 'inprogress',
    timeline: [
      { step:'Submitted',  icon:'fa-paper-plane', state:'done',   date:'12 Mar 2026, 10:32 AM', desc:'Complaint received and ID assigned.',           note:'' },
      { step:'Verified',   icon:'fa-shield-check',state:'done',   date:'12 Mar 2026, 02:15 PM', desc:'Complaint verified by civic officer.',           note:'' },
      { step:'Assigned',   icon:'fa-user-tie',    state:'done',   date:'13 Mar 2026, 09:00 AM', desc:'Assigned to Priya Nair, Electricity Dept.',      note:'' },
      { step:'In Progress',icon:'fa-screwdriver-wrench',state:'active',date:'13 Mar 2026, 11:45 AM', desc:'Field team dispatched to location.',        note:'Estimated fix: 15 Mar 2026' },
      { step:'Resolved',   icon:'fa-circle-check',state:'pending',date:'—',                    desc:'Awaiting resolution confirmation.',               note:'' },
      { step:'Closed',     icon:'fa-lock',        state:'pending',date:'—',                    desc:'Pending citizen confirmation.',                   note:'' },
    ]
  },
  'CMP-2026-102': {
    id: 'CMP-2026-102', title: 'Garbage Not Collected',
    category: 'Garbage & Sanitation', severity: 'medium',
    location: 'Gandhi Nagar, Block C, Greenfield', date: '10 Mar 2026',
    officer: '—', dept: 'Sanitation Dept.',
    status: 'pending',
    timeline: [
      { step:'Submitted',  icon:'fa-paper-plane', state:'done',   date:'10 Mar 2026, 08:20 AM', desc:'Complaint received and ID assigned.',           note:'' },
      { step:'Verified',   icon:'fa-shield-check',state:'done',   date:'10 Mar 2026, 12:00 PM', desc:'Complaint verified by civic officer.',           note:'' },
      { step:'Assigned',   icon:'fa-user-tie',    state:'active', date:'Pending',               desc:'Waiting to be assigned to an officer.',          note:'Expected assignment: 14 Mar 2026' },
      { step:'In Progress',icon:'fa-screwdriver-wrench',state:'pending',date:'—',               desc:'Not yet started.',                               note:'' },
      { step:'Resolved',   icon:'fa-circle-check',state:'pending',date:'—',                    desc:'Awaiting resolution.',                            note:'' },
      { step:'Closed',     icon:'fa-lock',        state:'pending',date:'—',                    desc:'Pending closure.',                                note:'' },
    ]
  },
  'CMP-2026-103': {
    id: 'CMP-2026-103', title: 'Water Leakage on Main Road',
    category: 'Water & Sewage', severity: 'critical',
    location: 'Civil Lines, Near Central Park, Riverside', date: '05 Mar 2026',
    officer: 'Rajan Kumar', dept: 'Water Dept.',
    status: 'resolved',
    timeline: [
      { step:'Submitted',  icon:'fa-paper-plane', state:'done',   date:'05 Mar 2026, 07:10 AM', desc:'Complaint received and ID assigned.',           note:'' },
      { step:'Verified',   icon:'fa-shield-check',state:'done',   date:'05 Mar 2026, 09:30 AM', desc:'Marked critical. Urgent review initiated.',      note:'' },
      { step:'Assigned',   icon:'fa-user-tie',    state:'done',   date:'05 Mar 2026, 10:00 AM', desc:'Assigned to Rajan Kumar on priority basis.',    note:'' },
      { step:'In Progress',icon:'fa-screwdriver-wrench',state:'done',date:'05 Mar 2026, 12:30 PM', desc:'Emergency crew deployed. Pipe sealed.',      note:'' },
      { step:'Resolved',   icon:'fa-circle-check',state:'done',   date:'06 Mar 2026, 04:00 PM', desc:'Issue fully resolved. Road cleared.',            note:'' },
      { step:'Closed',     icon:'fa-lock',        state:'active', date:'Awaiting citizen confirmation',desc:'Please confirm resolution to close complaint.', note:'Rate your experience' },
    ]
  },
  'CMP-2026-104': {
    id: 'CMP-2026-104', title: 'Water Leakage Near School',
    category: 'Water & Sewage', severity: 'high',
    location: '7, School Road, Springfield', date: '05 Mar 2026',
    officer: '—', dept: 'Water Dept.',
    status: 'pending',
    timeline: [
      { step:'Submitted',  icon:'fa-paper-plane', state:'done',   date:'05 Mar 2026, 09:45 AM', desc:'Complaint received and ID assigned.',           note:'' },
      { step:'Verified',   icon:'fa-shield-check',state:'active', date:'Under review',           desc:'Currently being reviewed by a civic officer.',  note:'Review in progress' },
      { step:'Assigned',   icon:'fa-user-tie',    state:'pending',date:'—',                      desc:'Pending assignment.',                            note:'' },
      { step:'In Progress',icon:'fa-screwdriver-wrench',state:'pending',date:'—',               desc:'Not yet started.',                               note:'' },
      { step:'Resolved',   icon:'fa-circle-check',state:'pending',date:'—',                    desc:'Awaiting resolution.',                            note:'' },
      { step:'Closed',     icon:'fa-lock',        state:'pending',date:'—',                    desc:'Pending closure.',                                note:'' },
    ]
  },
};

const statusBadge = {
  pending:    `<span class="badge pending"><i class="fa-solid fa-clock"></i> Pending</span>`,
  inprogress: `<span class="badge inprogress"><i class="fa-solid fa-rotate"></i> In Progress</span>`,
  assigned:   `<span class="badge assigned"><i class="fa-solid fa-user-tie"></i> Assigned</span>`,
  resolved:   `<span class="badge resolved"><i class="fa-solid fa-circle-check"></i> Resolved</span>`,
  closed:     `<span class="badge closed"><i class="fa-solid fa-lock"></i> Closed</span>`,
  rejected:   `<span class="badge rejected"><i class="fa-solid fa-circle-xmark"></i> Rejected</span>`,
};

const sevBadge = {
  low:      `<span class="sev-badge sev-low"><span class="sev-dot"></span>Low</span>`,
  medium:   `<span class="sev-badge sev-medium"><span class="sev-dot"></span>Medium</span>`,
  high:     `<span class="sev-badge sev-high"><span class="sev-dot"></span>High</span>`,
  critical: `<span class="sev-badge sev-critical"><span class="sev-dot"></span>Critical</span>`,
};

function track(id) {
  const key = id.trim().toUpperCase();
  const result = document.getElementById('resultSection');
  const error  = document.getElementById('errorMsg');

  const c = complaints[key];
  if (!c) {
    result.style.display = 'none';
    error.style.display  = 'flex';
    return;
  }

  error.style.display = 'none';

  // Populate summary
  document.getElementById('sId').textContent    = c.id;
  document.getElementById('sTitle').textContent = c.title;
  document.getElementById('sCat').textContent   = c.category;
  document.getElementById('sBadge').innerHTML   = statusBadge[c.status] || '';
  document.getElementById('sCatVal').textContent = c.category;
  document.getElementById('sSev').innerHTML      = sevBadge[c.severity] || c.severity;
  document.getElementById('sLoc').textContent   = c.location;
  document.getElementById('sDate').textContent  = c.date;
  document.getElementById('sOfficer').textContent = c.officer;
  document.getElementById('sDept').textContent  = c.dept;

  // Build timeline
  document.getElementById('timeline').innerHTML = c.timeline.map((t, i) => `
    <div class="tl-step ${t.state === 'done' ? 'done' : t.state === 'active' ? 'active' : 'pending-step'}">
      <div class="tl-dot">
        <i class="fa-solid ${t.state === 'done' ? 'fa-check' : t.state === 'active' ? t.icon : 'fa-circle'}"></i>
      </div>
      <div class="tl-content">
        <div class="tl-title">${t.step}</div>
        <div class="tl-desc">${t.desc}</div>
        <div class="tl-date">${t.date !== '—' ? '<i class="fa-regular fa-clock"></i> ' + t.date : ''}</div>
        ${t.note ? `<div class="tl-note"><i class="fa-solid fa-circle-info"></i> ${t.note}</div>` : ''}
      </div>
    </div>
  `).join('');

  result.style.display = 'block';
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.addEventListener('DOMContentLoaded', () => {
  const input   = document.getElementById('trackInput');
  const trackBtn = document.getElementById('trackBtn');

  trackBtn.addEventListener('click', () => track(input.value));

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') track(input.value);
  });

  // Quick chips
  document.querySelectorAll('.quick-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.id;
      track(chip.dataset.id);
    });
  });
});