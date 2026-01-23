const GAS = 'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

const tb = document.getElementById('tb');
const cardView = document.getElementById('cardView');
let CODE = '';

/* =====================
   Virtual / Filter state
===================== */
let ALL_DATA = [];
let FILTERED_DATA = [];
let CURRENT_STATUS = 'all';

const BATCH_SIZE = 20;
let renderedCount = 0;

/* =====================
   Toast
===================== */
function showToast(msg, success = true) {
  const toastEl = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  toastEl.className = `toast align-items-center text-bg-${success ? 'success' : 'danger'} border-0`;
  toastMsg.innerText = msg;
  new bootstrap.Toast(toastEl).show();
}

/* =====================
   ลงทะเบียนแฟ้มใหม่ (เดิม)
===================== */
function add(e) {
  e.preventDefault();

  const btn = document.getElementById('btnAdd');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>กำลังบันทึก...`;

  const date   = date.value;
  const sender = sender.value.trim();
  const codes  = code.value.split('\n').map(c => c.trim()).filter(Boolean);

  if (!date || !sender || !codes.length) {
    showToast('กรุณากรอกข้อมูลให้ครบ', false);
    btn.disabled = false;
    btn.innerHTML = 'บันทึก';
    return;
  }

  fetch(GAS, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'add', date, sender, codes })
  })
  .then(r => r.json())
  .then(() => loadData())
  .finally(() => {
    btn.disabled = false;
    btn.innerHTML = 'บันทึก';
  });
}

/* =====================
   โหลดข้อมูล (แก้ตรงนี้)
===================== */
loadData();

function loadData() {
  fetch(GAS + '?action=getData')
    .then(r => r.json())
    .then(data => {
      ALL_DATA = data.sort((a, b) => new Date(b[8]) - new Date(a[8]));
      applyFilter();
    });
}

/* =====================
   Filter + reset virtual
===================== */
function applyFilter() {
  renderedCount = 0;
  tb.innerHTML = '';
  cardView.innerHTML = '';

  FILTERED_DATA =
    CURRENT_STATUS === 'all'
      ? ALL_DATA
      : ALL_DATA.filter(x => x[3] === CURRENT_STATUS);

  if (!FILTERED_DATA.length) {
    tb.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted p-4">
          ไม่พบข้อมูล
        </td>
      </tr>`;
    return;
  }

  renderNextBatch();
}

/* =====================
   Virtual render
===================== */
function renderNextBatch() {
  const slice = FILTERED_DATA.slice(
    renderedCount,
    renderedCount + BATCH_SIZE
  );

  slice.forEach(x => {
    appendRow(x);
    appendCard(x);
  });

  renderedCount += slice.length;
}

/* =====================
   Scroll โหลดเพิ่ม
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
   Tabs (Desktop + Mobile)
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
   เพิ่มแถวตาราง
===================== */
function appendRow(x) {
  const statusColor = {
    'เสนอแฟ้มต่อผู้อำนวยการ': 'warning',
    'พิจารณาเรียบร้อยแล้ว': 'success',
    'รับแฟ้มคืนเรียบร้อยแล้ว': 'secondary'
  };

  const tr = document.createElement('tr');

  tr.innerHTML = `
    <!-- วันที่เสนอ -->
    <td class="text-center">
      ${formatDateTH(x[0])}
    </td>

    <!-- รหัสแฟ้ม -->
    <td class="text-center">
      ${x[1]}
    </td>

    <!-- ผู้เสนอ -->
    <td>
      ${x[2]}
    </td>

    <!-- สถานะ -->
    <td class="text-center">
      <span class="badge bg-${statusColor[x[3]] || 'secondary'}">
        ${x[3]}
      </span>
    </td>

    <!-- วันออกจาก ผอ. -->
    <td class="text-center">
      ${x[4] ? formatDateTH(x[4]) : '-'}
    </td>

    <!-- วันรับคืน -->
    <td class="text-center">
      ${x[6] ? formatDateTH(x[6]) : '-'}
    </td>

    <!-- ดำเนินการ -->
    <td class="text-center">
      ${
        x[3] === 'พิจารณาเรียบร้อยแล้ว'
          ? `<button class="btn btn-sm btn-success"
               onclick="openSign('${x[1]}')">
               รับแฟ้มคืน
             </button>`
          : x[3] === 'รับแฟ้มคืนเรียบร้อยแล้ว'
            ? `<span class="text-success">
                 👤 ${x[5]}
               </span>`
            : '-'
      }
    </td>
  `;

  tb.appendChild(tr);
}

const cardView = document.getElementById('cardView');

function appendCard(x) {
  const statusColor = {
    'เสนอแฟ้มต่อผู้อำนวยการ': 'warning',
    'พิจารณาเรียบร้อยแล้ว': 'success',
    'รับแฟ้มคืนเรียบร้อยแล้ว': 'secondary'
  };

  const div = document.createElement('div');
  div.className = 'file-card';

  div.innerHTML = `
    <div class="row">
      <div class="label">วันที่เสนอ</div>
      <div class="value">${formatDateTH(x[0])}</div>
    </div>

    <div class="row">
      <div class="label">รหัสแฟ้ม</div>
      <div class="value">${x[1]}</div>
    </div>

    <div class="row">
      <div class="label">ผู้เสนอ</div>
      <div class="value">${x[2]}</div>
    </div>

    <div class="row">
      <div class="label">สถานะ</div>
      <span class="badge bg-${statusColor[x[3]] || 'secondary'}">
        ${x[3]}
      </span>
    </div>

    <div class="row">
      <div class="label">ออกจาก ผอ.</div>
      <div class="value">${x[4] ? formatDateTH(x[4]) : '-'}</div>
    </div>

    <div class="row">
      <div class="label">รับคืน</div>
      <div class="value">${x[6] ? formatDateTH(x[6]) : '-'}</div>
    </div>

    <div class="actions">
      ${
        x[3] === 'พิจารณาเรียบร้อยแล้ว'
          ? `<button class="btn btn-success btn-sm"
               onclick="openSign('${x[1]}')">
               รับแฟ้มคืน
             </button>`
          : x[3] === 'รับแฟ้มคืนเรียบร้อยแล้ว'
            ? `<span class="text-success">👤 ${x[5]}</span>`
            : '-'
      }
    </div>
  `;

  cardView.appendChild(div);
}


/* =====================
   Modal ลายเซ็น
===================== */
function openSign(code) {
  CODE = String(code).trim();
  clearC();
  document.getElementById('receiver').value = '';
  new bootstrap.Modal(document.getElementById('signModal')).show();
}

/* =====================
   Canvas ลายเซ็น
===================== */
const c = document.getElementById('c');
const ctx = c.getContext('2d');

ctx.lineWidth = 2.8;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.strokeStyle = '#000';

let drawing = false;
let lastPoint = null;

/* Mouse */
c.addEventListener('mousedown', e => {
  drawing = true;
  lastPoint = getPos(e);
});
c.addEventListener('mousemove', e => {
  if (!drawing) return;
  const pos = getPos(e);
  drawSmooth(lastPoint, pos);
  lastPoint = pos;
});
c.addEventListener('mouseup', stopDraw);
c.addEventListener('mouseleave', stopDraw);

/* Touch */
c.addEventListener('touchstart', e => {
  e.preventDefault();
  drawing = true;
  lastPoint = getTouchPos(e);
});
c.addEventListener('touchmove', e => {
  e.preventDefault();
  if (!drawing) return;
  const pos = getTouchPos(e);
  drawSmooth(lastPoint, pos);
  lastPoint = pos;
});
c.addEventListener('touchend', stopDraw);

function stopDraw() {
  drawing = false;
  lastPoint = null;
}

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

function drawSmooth(p1, p2) {
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;

  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
  ctx.stroke();
}

function clearC() {
  ctx.clearRect(0, 0, c.width, c.height);
}

/* =====================
   บันทึกรับแฟ้มคืน (FIXED)
===================== */
function save(e) {
  const btn = e.target;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

  fetch(GAS, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify({
      action: 'receive',
      code: CODE,
      receiver: document.getElementById('receiver').value.trim(),
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
  .catch(() => {
    showToast('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้', false);
  })
  .finally(() => {
    btn.disabled = false;
    btn.innerHTML = 'บันทึก';
  });
}

function formatDateTH(d) {
  if (!d) return '-';
  const date = new Date(d);
  return date.toLocaleDateString('th-TH');
}
