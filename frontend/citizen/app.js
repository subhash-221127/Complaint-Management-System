document.addEventListener('DOMContentLoaded', () => {

  /* Severity toggle */
  document.querySelectorAll('.sev').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sev').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* Char counter */
  const box = document.getElementById('descBox');
  const cc  = document.getElementById('cc');
  if (box) {
    box.addEventListener('input', () => {
      cc.textContent = box.value.length;
      cc.style.color = box.value.length > 500 ? '#EF4444' : '';
    });
  }

  /* Map click — move pin */
  const mapBox = document.getElementById('mapBox');
  const pin    = document.getElementById('pin');
  if (mapBox && pin) {
    mapBox.addEventListener('click', e => {
      const r = mapBox.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  * 100).toFixed(1);
      const y = ((e.clientY - r.top)  / r.height * 100).toFixed(1);
      pin.style.left = x + '%';
      pin.style.top  = y + '%';
      pin.style.animation = 'none';
      void pin.offsetWidth;
      pin.style.animation = 'drop .4s ease-out';
      fillAddress();
    });
  }

  /* Zoom */
  let zoom = 14;
  const zl = document.getElementById('zl');
  document.getElementById('zi')?.addEventListener('click', e => {
    e.stopPropagation();
    if (zoom < 19) {
      zoom++;
      zl.textContent = zoom;
    }
  });

  document.getElementById('zo')?.addEventListener('click', e => {
    e.stopPropagation();
    if (zoom > 8) {
      zoom--;
      zl.textContent = zoom;
    }
  });

  /* Use My Location */
  const locBtn = document.getElementById('locateBtn');
  if (locBtn) {
    locBtn.addEventListener('click', () => {
      locBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Locating…';
      locBtn.disabled = true;

      setTimeout(() => {
        locBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Location found!';
        locBtn.style.cssText =
          'background:#ECFDF5;border-color:#059669;color:#065F46;width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:9px;border-radius:7px;font-weight:500;font-size:13.5px;margin-bottom:12px;';

        if (pin) {
          pin.style.left = '50%';
          pin.style.top  = '42%';
        }

        fillAddress();

        setTimeout(() => {
          locBtn.disabled = false;
          locBtn.style.cssText = '';
          locBtn.innerHTML =
            '<i class="fa-solid fa-crosshairs"></i> Use My Current Location';
        }, 3000);

      }, 1600);
    });
  }

  function fillAddress() {
    const streets = ['Park Avenue','Main Street','Oak Lane','Gandhi Nagar','Civil Lines','MG Road'];
    const cities  = ['Springfield','Greenfield','Riverside','Lakewood'];
    const dists   = ['Central District','North District','East District'];

    const street  = streets[Math.floor(Math.random() * streets.length)];
    const num     = Math.floor(Math.random() * 400) + 10;
    const pin2    = '5' + Math.floor(Math.random() * 89999 + 10000);

    typeIn('addr', `${num}, ${street}`);

    const p = document.getElementById('pin2');
    if (p) p.value = pin2;

    const c = document.getElementById('city');
    if (c) c.value = cities[Math.floor(Math.random() * cities.length)];

    const d = document.getElementById('dist');
    if (d) d.value = dists[Math.floor(Math.random() * dists.length)];
  }

  function typeIn(id, str) {
    const el = document.getElementById(id);
    if (!el) return;

    el.value = '';
    let i = 0;

    const t = setInterval(() => {
      el.value += str[i++];
      if (i >= str.length) clearInterval(t);
    }, 22);
  }

  /* Sidebar Nav Highlight (FIXED) */
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
    });
  });

  /* FAB submit */
  const fab   = document.getElementById('fabBtn');
  const toast = document.getElementById('toast');

  if (fab && toast) {
    fab.addEventListener('click', () => {

      const sel = document.getElementById('categorySelect');

      if (sel && !sel.value) {
        sel.style.borderColor = '#EF4444';
        sel.style.boxShadow   = '0 0 0 3px rgba(239,68,68,.15)';
        sel.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(() => {
          sel.style.borderColor = '';
          sel.style.boxShadow   = '';
        }, 2000);

        return;
      }

      fab.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting…';
      fab.disabled  = true;

      setTimeout(() => {

        toast.classList.add('show');
        fab.innerHTML = '<i class="fa-solid fa-circle-check"></i> Submitted!';

        setTimeout(() => {
          toast.classList.remove('show');
          fab.disabled  = false;
          fab.innerHTML =
            '<i class="fa-solid fa-paper-plane"></i> <span>Submit Complaint</span>';
        }, 3500);

      }, 2000);
    });
  }

  /* File Upload */
  const uploadBox  = document.getElementById('uploadBox');
  const fileInput  = document.getElementById('fileInput');
  const fileList   = document.getElementById('fileList');
  const uploadIcon = document.getElementById('uploadIcon');
  const uploadText = document.getElementById('uploadText');
  const uploadSub  = document.getElementById('uploadSub');

  const MAX_SIZE = 10 * 1024 * 1024;

  function handleFiles(files) {

    const valid  = [];
    const errors = [];

    Array.from(files).forEach(f => {
      if (f.size > MAX_SIZE) {
        errors.push(`${f.name} exceeds 10 MB`);
      } else {
        valid.push(f);
      }
    });

    if (errors.length) {
      alert('Skipped (too large):\n' + errors.join('\n'));
    }

    if (!valid.length) return;

    uploadIcon.className = 'fa-solid fa-circle-check';
    uploadIcon.style.color = '#059669';

    uploadText.innerHTML =
      `<strong>${valid.length} file${valid.length > 1 ? 's' : ''} selected</strong>`;

    uploadSub.textContent = 'Click to change files';

    uploadBox.style.borderColor = '#059669';
    uploadBox.style.background  = '#ECFDF5';

    fileList.innerHTML = '';

    valid.forEach(f => {

      const isImage = f.type.startsWith('image/');
      const isVideo = f.type.startsWith('video/');
      const icon    = isImage ? 'fa-image' : isVideo ? 'fa-film' : 'fa-file';

      const size =
        f.size < 1024 * 1024
        ? (f.size / 1024).toFixed(0) + ' KB'
        : (f.size / (1024 * 1024)).toFixed(1) + ' MB';

      const chip = document.createElement('div');
      chip.className = 'file-chip';

      chip.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span class="file-chip-name">${f.name}</span>
        <span class="file-chip-size">${size}</span>
        <button class="file-chip-remove" title="Remove">
          <i class="fa-solid fa-xmark"></i>
        </button>
      `;

      chip.querySelector('.file-chip-remove').addEventListener('click', e => {
        e.stopPropagation();
        chip.remove();
        if (!fileList.children.length) resetUpload();
      });

      if (isImage) {
        const reader = new FileReader();
        reader.onload = ev => {
          const thumb = document.createElement('img');
          thumb.src = ev.target.result;
          thumb.className = 'file-thumb';
          chip.prepend(thumb);
        };
        reader.readAsDataURL(f);
      }

      fileList.appendChild(chip);
    });
  }

  function resetUpload() {
    uploadIcon.className = 'fa-solid fa-cloud-arrow-up';
    uploadIcon.style.color = '';

    uploadText.innerHTML =
      'Drag & drop or <span class="upload-link">browse files</span>';

    uploadSub.textContent = 'JPG, PNG, MP4 · Max 10 MB';

    uploadBox.style.borderColor = '';
    uploadBox.style.background  = '';

    fileInput.value = '';
  }

  if (uploadBox && fileInput) {

    uploadBox.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => handleFiles(fileInput.files));

    uploadBox.addEventListener('dragover', e => {
      e.preventDefault();
      uploadBox.style.borderColor = '#7B6BAE';
      uploadBox.style.background  = '#F5F2FF';
    });

    uploadBox.addEventListener('dragleave', () => {
      if (!fileList.children.length) {
        uploadBox.style.borderColor = '';
        uploadBox.style.background  = '';
      }
    });

    uploadBox.addEventListener('drop', e => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    });
  }

});