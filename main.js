/* =====================
   CONFIG
===================== */
const GAS = 'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

const tb = document.getElementById('tb');
const cardView = document.getElementById('cardView');

/* =====================
   CACHE
===================== */
let PRESENT_CACHE = null;
let PRESENT_CACHE_TIME = 0;
const CACHE_TTL = 60 * 1000; // 1 นาที

function getPresentData(force = false) {
  const now = Date.now();

  if (!force && PRESENT_CACHE && (now - PRESENT_CACHE_TIME < CACHE_TTL)) {
    return Promise.resolve(PRESENT_CACHE);
  }

  return fetch(GAS + '?action=getData')
    .then(r => r.json())
    .then(data => {
      PRESENT_CACHE = data;
      PRESENT_CACHE_TIME = Date.now();
      return data;
    });
}

/* =====================
   STATE
===================== */
let CODE = '';
let ALL_DATA = [];
let FILTERED_DATA = [];
let CURRENT_STATUS = 'เสนอแฟ้มต่อผู้อำนวยการ';

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
   LOAD DATA (FAST)
===================== */
loadData();

function loadData(force = false) {
  showMobileLoading();

  getPresentData(force)
    .then(data => {
      ALL_DATA = [...data].sort(
        (a, b) => new Date(b[8]) - new Date(a[8])
      );
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

  FILTERED_DATA =
    CURRENT_STATUS === 'all'
      ? ALL_DATA
      : ALL_DATA.filter(x => x[3] === CURRENT_STATUS);

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
   VIRTUAL RENDER
===================== */
function renderNextBatch() {
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
   SCROLL
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
   STATUS TABS
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
   ADD FILE
===================== */
function add(e) {
  e.preventDefault();

  const btn = document.getElementById('btnAdd');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>กำลังบันทึก...`;

  const date = dateEl.value;
  const sender = senderEl.value.trim();
  const codes = codeEl.value.split('\n').map(c => c.trim()).filter(Boolean);

  if (!date || !sender || !codes.length) {
    showToast('กรุณากรอกข้อมูลให้ครบ', false);
    reset();
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
        PRESENT_CACHE = null; // 🔥 clear cache
        loadData(true);
        dateEl.value = senderEl.value = codeEl.value = '';
      } else {
        showToast(res.message || 'บันทึกไม่สำเร็จ', false);
      }
    })
    .finally(reset);

  function reset() {
    btn.disabled = false;
    btn.innerHTML = 'บันทึก';
  }
}

/* =====================
   SAVE RECEIVE
===================== */
function save(e) {
  const receiver = document.getElementById('receiver').value.trim();
  if (!receiver || isCanvasEmpty()) {
    showToast('กรุณากรอกข้อมูลให้ครบ', false);
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
      receiver,
      receiveDate: new Date().toISOString().slice(0, 10),
      signature: c.toDataURL('image/png')
    })
  })
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        showToast('รับแฟ้มคืนเรียบร้อย');
        PRESENT_CACHE = null; // 🔥 clear cache
        loadData(true);
        bootstrap.Modal.getInstance(
          document.getElementById('signModal')
        ).hide();
      } else {
        showToast(res.message || 'บันทึกไม่สำเร็จ', false);
      }
    })
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

function isMobile() { return window.innerWidth < 768; }
function isDesktop() { return window.innerWidth >= 768; }
