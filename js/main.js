const GAS_URL =
'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

let CURRENT_STATUS = 'SUBMITTED';
let modal, canvas, ctx, drawing = false;

document.addEventListener('DOMContentLoaded', async () => {
  modal = new bootstrap.Modal(document.getElementById('receiveModal'));
  canvas = document.getElementById('signPad');
  ctx = canvas.getContext('2d');
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDraw);
  canvas.addEventListener('mouseleave', stopDraw);

  loadData();
});

function showTab(status) {
  CURRENT_STATUS = status;
  document.querySelectorAll('#statusTabs .nav-link')
    .forEach(t => t.classList.toggle('active', t.dataset.status === status));
  loadData();
}

async function loadData() {
  const tb = document.getElementById('tb');
  const card = document.getElementById('cardView');
  tb.innerHTML = '';
  card.innerHTML = '';

  const r = await fetch(GAS_URL + '?action=getData');
  const data = await r.json();

  const list = data.filter(x => x[3] === CURRENT_STATUS);
  if (!list.length) {
    tb.innerHTML = `<tr><td colspan="4" class="text-center text-muted">ไม่มีข้อมูล</td></tr>`;
    return;
  }

  list.forEach(x => {
    tb.innerHTML += `
      <tr class="text-center">
        <td>${x[1]}</td>
        <td>${x[2]}</td>
        <td><span class="badge bg-secondary">${x[3]}</span></td>
        <td>
          ${CURRENT_STATUS === 'APPROVED'
            ? `<button class="btn btn-sm btn-success"
                 onclick="openReceive('${x[1]}')">📥 รับแฟ้มคืน</button>`
            : '-'}
        </td>
      </tr>`;
  });
}

/* ===== RECEIVE ===== */
function openReceive(code) {
  document.getElementById('receiveCode').value = code;
  document.getElementById('receiverName').value = '';
  clearSign();
  modal.show();
}

function startDraw(e) {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}
function draw(e) {
  if (!drawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
}
function stopDraw() { drawing = false; }
function clearSign() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

async function submitReceive() {
  const code = document.getElementById('receiveCode').value;
  const receiver = document.getElementById('receiverName').value.trim();
  const signature = canvas.toDataURL();

  if (!receiver) {
    alert('กรุณากรอกชื่อผู้รับ');
    return;
  }

  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'receive',
      code,
      receiver,
      signature
    })
  });

  const r = await res.json();
  if (r.success) {
    modal.hide();
    loadData();
  }
}
