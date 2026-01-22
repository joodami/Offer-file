const GAS = 'https://script.google.com/macros/s/AKfycbx102S-XxCGa4eJ5mRKPudTtQ8iKNSxk_-DFfFdYYqufEsKSgwPHn3-S_OaL8QGIXr3Aw/exec';

const tb = document.getElementById('tb');
let CODE = '';

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
   โหลดข้อมูล
===================== */
loadData();

function loadData() {
  fetch(GAS + '?action=getData')
    .then(r => r.json())
    .then(data => {
      tb.innerHTML = '';

      if (!data.length) {
        tb.innerHTML = `
          <tr>
            <td colspan="4" class="text-center text-muted p-4">
              ยังไม่มีข้อมูล
            </td>
          </tr>`;
        return;
      }

      data.reverse().forEach(x => appendRow(x));
    })
    .catch(() => {
      tb.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-danger p-4">
            โหลดข้อมูลไม่สำเร็จ
          </td>
        </tr>`;
    });
}

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
    <td class="text-center align-middle">${x[1]}</td>
    <td class="text-start align-middle">${x[2]}</td>
    <td class="text-center align-middle">
      <span class="badge bg-${statusColor[x[3]] || 'secondary'}">
        ${x[3]}
      </span>
    </td>
    <td class="text-center align-middle">
      ${x[3] === 'พิจารณาเรียบร้อยแล้ว'
        ? `<button class="btn btn-sm btn-success"
            onclick="openSign('${String(x[1]).trim()}')">
            รับแฟ้มคืน
          </button>`
        : '-'}
    </td>
  `;
  tb.prepend(tr);
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
