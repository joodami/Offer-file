/* =====================
   CONFIG
===================== */
const GAS = 'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

const tb = document.getElementById('tb');
const cardView = document.getElementById('cardView');

/* =====================
   STATUS MAP
===================== */
const STATUS_LABEL = {
  SUBMITTED: 'เสนอแฟ้มต่อผู้อำนวยการ',
  APPROVED: 'พิจารณาเรียบร้อยแล้ว',
  RECEIVED: 'รับแฟ้มคืนเรียบร้อยแล้ว'
};

const STATUS_COLOR = {
  SUBMITTED: 'warning',
  APPROVED: 'success',
  RECEIVED: 'secondary'
};

const STATUS_CLASS = {
  SUBMITTED: 'status-offer',
  APPROVED: 'status-approved',
  RECEIVED: 'status-received'
};

/* =====================
   STATE
===================== */
let CODE = '';
let ALL_DATA = [];
let FILTERED_DATA = [];
let CURRENT_STATUS = 'SUBMITTED';   // ⭐ ใช้ status อังกฤษ
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
      <div class="text-muted fw-medium py-4">
        กำลังโหลดข้อมูล...
      </div>
    </div>
  `;
}

/* =====================
   LOAD DATA
===================== */
loadData();

function loadData() {
  showMobileLoading();

  fetch(GAS + '?action=getData')
    .then(r => r.json())
    .then(data => {
      ALL_DATA = data.sort((a, b) => new Date(b[8]) - new Date(a[8]));
      applyFilter();
    })
    .catch(() => showToast('โหลดข้อมูลไม่ได้', false));
}

/* =====================
   FILTER
===================== */
function applyFilter() {
  renderedCount = 0;
  tb.innerHTML = '';

  FILTERED_DATA = ALL_DATA.filter(x => {

    if (SEARCH_KEYWORD) {
      const k = SEARCH_KEYWORD.toLowerCase();
      return (
        String(x[1] || '').toLowerCase().includes(k) ||
        String(x[2] || '').toLowerCase().includes(k)
      );
    }

    return x[3] === CURRENT_STATUS;
  });

  if (!FILTERED_DATA.length) {
    if (isDesktop()) {
      tb.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted p-4">
            ไม่มีรายการแฟ้ม
          </td>
        </tr>
      `;
    }

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
   RENDER
===================== */
function renderNextBatch() {
  if (renderedCount === 0 && isMobile()) {
    cardView.innerHTML = '';
  }

  const slice = FILTERED_DATA.slice(renderedCount, renderedCount + BATCH_SIZE);

  slice.forEach(x => {
    if (isDesktop()) appendRow(x);
    if (isMobile()) appendCard(x);
  });

  renderedCount += slice.length;
}

window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    if (renderedCount < FILTERED_DATA.length) {
      renderNextBatch();
    }
  }
});

/* =====================
   STATUS TABS
===================== */
document.querySelectorAll('#statusTabs .nav-link')
  .forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#statusTabs .nav-link')
        .forEach(t => t.classList.remove('active'));

      tab.classList.add('active');
      CURRENT_STATUS = tab.dataset.status; // SUBMITTED / APPROVED / RECEIVED
      applyFilter();
    });
  });

/* =====================
   TABLE ROW
===================== */
function appendRow(x) {
  const tr = document.createElement('tr');

  tr.innerHTML = `
    <td class="text-center">${formatDateTH(x[0])}</td>
    <td class="text-center">${x[1]}</td>
    <td>${x[2]}</td>
    <td class="text-center">
      <span class="badge bg-${STATUS_COLOR[x[3]]}">
        ${STATUS_LABEL[x[3]]}
      </span>
    </td>
    <td class="text-center">${x[4] ? formatDateTH(x[4]) : '-'}</td>
    <td class="text-center">${x[6] ? formatDateTH(x[6]) : '-'}</td>
    <td class="text-center">
      ${
        x[3] === 'APPROVED'
          ? `<button class="btn btn-sm btn-success" onclick="openSign('${x[1]}')">
               รับแฟ้มคืน
             </button>`
          : x[3] === 'RECEIVED'
            ? `<div class="d-flex flex-column align-items-center gap-1">
                 <span class="text-success fw-semibold">👤 ${x[5]}</span>
                 <button class="btn btn-sm btn-outline-primary view-sign-btn"
                         data-url="${x[7]}">
                   ดูลายเซ็น
                 </button>
               </div>`
            : '-'
      }
    </td>
  `;
  tb.appendChild(tr);
}

/* =====================
   MOBILE CARD
===================== */
function appendCard(x) {
  const div = document.createElement('div');
  div.className = `file-card ${STATUS_CLASS[x[3]]}`;

  div.innerHTML = `
    <div class="file-code-box">
      <div class="file-code-label">รหัสแฟ้ม</div>
      <div class="file-code">${x[1]}</div>
    </div>

    <div class="status-row">
      <span class="badge bg-${STATUS_COLOR[x[3]]}">
        ${STATUS_LABEL[x[3]]}
      </span>
    </div>

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

    <div class="actions d-flex flex-column gap-1">
      ${
        x[3] === 'APPROVED'
          ? `<button class="btn btn-success btn-sm" onclick="openSign('${x[1]}')">
               รับแฟ้มคืน
             </button>`
          : x[3] === 'RECEIVED'
            ? `<span class="text-success fw-semibold">👤 ${x[5]}</span>
               <button class="btn btn-outline-primary btn-sm view-sign-btn"
                       data-url="${x[7]}">
                 ดูลายเซ็น
               </button>`
            : ''
      }
    </div>
  `;
  cardView.appendChild(div);
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

/* =====================
   SEARCH
===================== */
const searchInput = document.getElementById('searchInput');

document.getElementById('btnSearch').addEventListener('click', () => {
  SEARCH_KEYWORD = searchInput.value.trim();
  applyFilter();
});

document.getElementById('btnClearSearch').addEventListener('click', () => {
  SEARCH_KEYWORD = '';
  searchInput.value = '';
  applyFilter();
});

searchInput.addEventListener('keyup', e => {
  if (e.key === 'Enter') {
    SEARCH_KEYWORD = searchInput.value.trim();
    applyFilter();
  }
});

/* =====================
   SCAN → AUTO TAB
===================== */
const FID = new URLSearchParams(location.search).get('fid');

if (FID) {
  fetch(GAS, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'getFileStatus', fileId: FID })
  })
  .then(r => r.json())
  .then(r => {
    if (!r.success) return;

    CURRENT_STATUS = r.status;

    document.querySelectorAll('#statusTabs .nav-link')
      .forEach(tab => {
        tab.classList.toggle(
          'active',
          tab.dataset.status === CURRENT_STATUS
        );
      });

    applyFilter();
  });
}
