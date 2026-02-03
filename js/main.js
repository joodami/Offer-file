/* =====================
   CONFIG
===================== */
const GAS = 'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

const tb = document.getElementById('tb');
const cardView = document.getElementById('cardView');

/* =====================
   STATE (Virtual + Filter)
===================== */
let CODE = '';
let ALL_DATA = [];
let FILTERED_DATA = [];
let CURRENT_STATUS = 'เสนอแฟ้มต่อผู้อำนวยการ';
let SEARCH_KEYWORD = '';

const BATCH_SIZE = 20;
let renderedCount = 0;

/* =====================
   TOAST
===================== */
function showToast(msg, success = true) {
  const toastEl = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  toastEl.className = `toast align-items-center text-bg-${success ? 'success' : 'danger'} border-0`;
  toastMsg.innerText = msg;
  new bootstrap.Toast(toastEl).show();
}

function showMobileLoading() {
  if (!isMobile()) return;

  cardView.innerHTML = `
    <div class="card shadow-sm text-center mt-2">
      <div class="text-muted fw-medium py-4 loading-text">
        กำลังโหลดข้อมูล...
      </div>
    </div>
  `;
}


/* =====================
   ADD FILE (เดิม แค่แก้การอ้าง DOM)
===================== */
function add(e) {
  e.preventDefault();

  const btn = document.getElementById('btnAdd');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>กำลังบันทึก...`;

  const dateEl   = document.getElementById('date');
  const senderEl = document.getElementById('sender');
  const codeEl   = document.getElementById('code');

  const date   = dateEl.value;
  const sender = senderEl.value.trim();
  const codes  = codeEl.value
    .split('\n')
    .map(c => c.trim())
    .filter(Boolean);

  if (!date || !sender || !codes.length) {
    showToast('กรุณากรอกข้อมูลให้ครบ', false);
    resetBtn();
    return;
  }

  fetch(GAS, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'add', date, sender, codes })
  })
  .then(r => r.json())
  .then(res => {
    if (res.success) {
      showToast('บันทึกข้อมูลเรียบร้อย');
      dateEl.value = '';
      senderEl.value = '';
      codeEl.value = '';
      loadData();
    } else {
      showToast(res.message || 'บันทึกไม่สำเร็จ', false);
    }
  })
  .catch(() => showToast('เชื่อมต่อระบบไม่ได้', false))
  .finally(resetBtn);

  function resetBtn() {
    btn.disabled = false;
    btn.innerHTML = 'บันทึก';
  }
}

/* =====================
   LOAD DATA (Virtual)
===================== */
loadData();

function loadData() {

  // แสดง loading บนมือถือ
  showMobileLoading();

  fetch(GAS + '?action=getData')
    .then(r => r.json())
    .then(data => {
      ALL_DATA = data.sort((a, b) => new Date(b[8]) - new Date(a[8]));
      applyFilter(); // จะล้าง loading ตอน render จริง
    })
    .catch(() => showToast('โหลดข้อมูลไม่ได้', false));
}



/* =====================
   FILTER + RESET
===================== */
function applyFilter() {
  renderedCount = 0;

  // ล้างเฉพาะ desktop
  tb.innerHTML = '';

  FILTERED_DATA = ALL_DATA.filter(x => {

    // 🔍 ถ้ามี keyword → ค้นหาทุกสถานะ
    if (SEARCH_KEYWORD) {
      const keyword = SEARCH_KEYWORD.toLowerCase();

      const fileCode = String(x[1] || '').toLowerCase(); // รหัสแฟ้ม
      const sender   = String(x[2] || '').toLowerCase(); // ชื่อผู้เสนอ

      return (
        fileCode.includes(keyword) ||
        sender.includes(keyword)
      );
    }

    // ===== FILTER ตามสถานะ =====

    // 🟡 แท็บ "เสนอแฟ้มต่อผู้อำนวยการ"
    // รวมทั้งแถวที่สถานะยังว่าง
    if (CURRENT_STATUS === 'เสนอแฟ้มต่อผู้อำนวยการ') {
      return !x[3] || x[3] === 'เสนอแฟ้มต่อผู้อำนวยการ';
    }

    // 📂 สถานะอื่น ๆ (ตรงตัว)
    return x[3] === CURRENT_STATUS;
  });

  // ===== ไม่พบข้อมูล =====
  if (!FILTERED_DATA.length) {

    // Desktop
    if (isDesktop()) {
      tb.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted p-4">
            ไม่มีรายการแฟ้ม
          </td>
        </tr>
      `;
    }

    // Mobile
    if (isMobile()) {
      cardView.innerHTML = `
        <div class="card shadow-sm text-center text-muted p-4 mt-3">
          📂 ไม่มีรายการแฟ้ม
        </div>
      `;
    }

    return;
  }

  renderNextBatch();
}

/* =====================
   VIRTUAL RENDER
===================== */
function renderNextBatch() {

  // ล้าง loading ก่อน render ชุดแรก
  if (renderedCount === 0 && isMobile()) {
    cardView.innerHTML = '';
  }

  const slice = FILTERED_DATA.slice(
    renderedCount,
    renderedCount + BATCH_SIZE
  );

  slice.forEach(x => {
    if (isDesktop()) appendRow(x);
    if (isMobile()) appendCard(x);
  });

  renderedCount += slice.length;
}


/* =====================
   INFINITE SCROLL
===================== */
window.addEventListener('scroll', () => {
  if (
    window.innerHeight + window.scrollY >=
    document.body.offsetHeight - 200
  ) {
    if (renderedCount < FILTERED_DATA.length) {
      renderNextBatch();
    }
  }
});

/* =====================
   STATUS TABS (Desktop + Mobile)
===================== */
document.querySelectorAll('#statusTabs .nav-link')
  .forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#statusTabs .nav-link')
        .forEach(t => t.classList.remove('active'));

      tab.classList.add('active');
      CURRENT_STATUS = tab.dataset.status;
      applyFilter();
    });
  });

/* =====================
   TABLE ROW (เดิม)
===================== */
function appendRow(x) {
  const statusColor = {
    'เสนอแฟ้มต่อผู้อำนวยการ': 'warning',
    'พิจารณาเรียบร้อยแล้ว': 'success',
    'รับแฟ้มคืนเรียบร้อยแล้ว': 'secondary'
  };

  const tr = document.createElement('tr');

  tr.innerHTML = `
    <td class="text-center">${formatDateTH(x[0])}</td>
    <td class="text-center">${x[1]}</td>
    <td>${x[2]}</td>
    <td class="text-center">
      <span class="badge bg-${statusColor[x[3]] || 'secondary'}">
        ${x[3]}
      </span>
    </td>
    <td class="text-center">${x[4] ? formatDateTH(x[4]) : '-'}</td>
    <td class="text-center">${x[6] ? formatDateTH(x[6]) : '-'}</td>
    <td class="text-center">
      ${
        x[3] === 'พิจารณาเรียบร้อยแล้ว'
          ? `
            <button class="btn btn-sm btn-success"
                    onclick="openSign('${x[1]}')">
              รับแฟ้มคืน
            </button>
          `
          : x[3] === 'รับแฟ้มคืนเรียบร้อยแล้ว'
            ? `
              <div class="d-flex flex-column align-items-center gap-1">
                <span class="text-success fw-semibold">
                  👤 ${x[5]}
                </span>
            <button class="btn btn-sm btn-outline-primary view-sign-btn"
        data-url="${x[7]}">
  ดูลายเซ็น
</button>
              </div>
            `
            : '-'
      }
    </td>
  `;

  tb.appendChild(tr);
}


/* =====================
   MOBILE CARD (เดิม)
===================== */
function appendCard(x) {
  const statusColor = {
    'เสนอแฟ้มต่อผู้อำนวยการ': 'warning',
    'พิจารณาเรียบร้อยแล้ว': 'success',
    'รับแฟ้มคืนเรียบร้อยแล้ว': 'secondary'
  };

  const statusClassMap = {
    'เสนอแฟ้มต่อผู้อำนวยการ': 'status-offer',
    'พิจารณาเรียบร้อยแล้ว': 'status-approved',
    'รับแฟ้มคืนเรียบร้อยแล้ว': 'status-received'
  };

  const div = document.createElement('div');
  div.className = `file-card ${statusClassMap[x[3]] || ''}`;

  div.innerHTML = `
    <!-- รหัสแฟ้ม -->
    <div class="file-code-box">
      <div class="file-code-label">รหัสแฟ้ม</div>
      <div class="file-code">${x[1]}</div>
    </div>

    <!-- สถานะ -->
    <div class="status-row">
      <span class="badge bg-${statusColor[x[3]] || 'secondary'}">
        ${x[3]}
      </span>
    </div>

    <!-- ข้อมูล -->
    <div class="info-row">
      <div>
        <div class="label">วันที่เสนอ</div>
        <div class="value">${formatDateTH(x[0])}</div>
      </div>
      <div>
        <div class="label">ผู้เสนอ</div>
        <div class="value">${x[2]}</div>
      </div>
    </div>

    <div class="info-row">
      <div>
        <div class="label">ออกจาก ผอ.</div>
        <div class="value">${x[4] ? formatDateTH(x[4]) : '-'}</div>
      </div>
      <div>
        <div class="label">รับคืน</div>
        <div class="value">${x[6] ? formatDateTH(x[6]) : '-'}</div>
      </div>
    </div>

    <!-- ปุ่ม -->
    <div class="actions d-flex flex-column gap-1">
      ${
        x[3] === 'พิจารณาเรียบร้อยแล้ว'
          ? `
            <button class="btn btn-success btn-sm"
                    onclick="openSign('${x[1]}')">
              รับแฟ้มคืน
            </button>
          `
          : x[3] === 'รับแฟ้มคืนเรียบร้อยแล้ว'
            ? `
              <span class="text-success fw-semibold">
                👤 ${x[5]}
              </span>
        <button class="btn btn-outline-primary btn-sm view-sign-btn"
        data-url="${x[7]}">
  ดูลายเซ็น
</button>

            `
            : ''
      }
    </div>
  `;

  cardView.appendChild(div);
}



/* =====================
   SIGN MODAL + CANVAS (เดิม)
===================== */
function openSign(code) {
  CODE = String(code).trim();
  document.getElementById('receiver').value = '';

  const modalEl = document.getElementById('signModal');
  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  // ✅ รอให้ modal แสดงก่อน แล้วค่อย resize canvas
  modalEl.addEventListener('shown.bs.modal', () => {
    resizeCanvas();
    clearC();
  }, { once: true });
}


const c = document.getElementById('c');
const ctx = c.getContext('2d');

/* ===== Pen Style ===== */
ctx.strokeStyle = '#000';
ctx.lineWidth = 2.4;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

let drawing = false;
let points = [];

/* ===== Mouse ===== */
c.addEventListener('mousedown', e => {
  drawing = true;
  points = [getPos(e)];
});

c.addEventListener('mousemove', e => {
  if (!drawing) return;
  points.push(getPos(e));
  drawSmoothLine();
});

c.addEventListener('mouseup', stopDraw);
c.addEventListener('mouseleave', stopDraw);

/* ===== Touch ===== */
c.addEventListener('touchstart', e => {
  e.preventDefault();
  drawing = true;
  points = [getTouchPos(e)];
});

c.addEventListener('touchmove', e => {
  e.preventDefault();
  if (!drawing) return;
  points.push(getTouchPos(e));
  drawSmoothLine();
});

c.addEventListener('touchend', stopDraw);

function viewSignature(url) {
  const img = document.getElementById('signImage');
  img.src = url;
  img.onerror = () => {
    img.src = '';
    alert('ไม่สามารถแสดงลายเซ็นได้');
  };

  new bootstrap.Modal(
    document.getElementById('viewSignModal')
  ).show();
}



/* ===== Draw Logic ===== */
function drawSmoothLine() {
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
  }

  ctx.stroke();
}

function stopDraw() {
  drawing = false;
  points = [];
}

/* ===== Utils ===== */
function getPos(e) {
  const r = c.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function getTouchPos(e) {
  const r = c.getBoundingClientRect();
  return {
    x: e.touches[0].clientX - r.left,
    y: e.touches[0].clientY - r.top
  };
}

function clearC() {
  ctx.clearRect(0, 0, c.width, c.height);
}

function isCanvasEmpty() {
  const imgData = ctx.getImageData(0, 0, c.width, c.height).data;
  for (let i = 3; i < imgData.length; i += 4) {
    if (imgData[i] !== 0) return false; // มี pixel ที่ไม่โปร่งใส
  }
  return true;
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = c.getBoundingClientRect();

  c.width  = rect.width * dpr;
  c.height = rect.height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

/* =====================
   SAVE RECEIVE (เดิม)
===================== */
function save(e) {
  const receiver = document.getElementById('receiver').value.trim();

  if (!receiver) {
    showToast('กรุณากรอกชื่อผู้รับแฟ้มคืน', false);
    return;
  }

  if (isCanvasEmpty()) {
    showToast('🚫 กรุณาลงลายเซ็นก่อนบันทึก', false);
    return;
  }

  const btn = e.target;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

  fetch(GAS, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'receive',
      code: CODE,
      receiver: receiver,
      receiveDate: new Date().toISOString().slice(0, 10),
      signature: c.toDataURL('image/png')
    })
  })
  .then(r => r.json())
  .then(res => {
    if (res.success) {
      showToast('รับแฟ้มคืนเรียบร้อย');
      bootstrap.Modal.getInstance(
        document.getElementById('signModal')
      ).hide();
      loadData();
    } else {
      showToast(res.message || 'บันทึกไม่สำเร็จ', false);
    }
  })
  .catch(() => showToast('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้', false))
  .finally(() => {
    btn.disabled = false;
    btn.innerHTML = 'บันทึก';
  });
}


/* =====================
   UTIL
===================== */
function formatDateTH(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('th-TH');
}

function isMobile() {
  return window.innerWidth < 768;
}

function isDesktop() {
  return window.innerWidth >= 768;
}

let lastMode = isMobile() ? 'mobile' : 'desktop';

window.addEventListener('resize', () => {
  const mode = isMobile() ? 'mobile' : 'desktop';
  if (mode !== lastMode) {
    lastMode = mode;
    applyFilter();
  }
});

document.addEventListener('click', e => {
  const btn = e.target.closest('.view-sign-btn');
  if (!btn) return;

  const url = btn.dataset.url;
  viewSignature(url);
});

const searchInput = document.getElementById('searchInput');

document.getElementById('btnSearch')
  .addEventListener('click', () => {
    SEARCH_KEYWORD = searchInput.value.trim();
    applyFilter();
  });

document.getElementById('btnClearSearch')
  .addEventListener('click', () => {
    SEARCH_KEYWORD = '';
    searchInput.value = '';
    applyFilter();
  });

// กด Enter เพื่อค้นหา
searchInput.addEventListener('keyup', e => {
  if (e.key === 'Enter') {
    SEARCH_KEYWORD = searchInput.value.trim();
    applyFilter();
  }
});

