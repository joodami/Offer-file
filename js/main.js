/* =========================
   CONFIG
========================= */
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

/* =========================
   PARAM
========================= */
const FID = new URLSearchParams(location.search).get('fid');
if (!FID) {
  alert('QR ไม่ถูกต้อง');
  location.replace('index.html');
}

/* =========================
   ELEMENTS
========================= */
const registerBox = document.getElementById('registerBox');
const statusBox   = document.getElementById('statusBox');

const tabSubmitted = document.getElementById('tabSubmitted');
const tabApproved  = document.getElementById('tabApproved');

/* =========================
   INIT
========================= */
checkStatus();

/* =========================
   CHECK STATUS (SCAN)
========================= */
async function checkStatus() {
  const r = await post('getFileStatus', { fileId: FID });
  if (!r || !r.success) return;

  if (r.status === 'NEW') {
    showRegister();
  } else {
    showStatus(r.status);
  }
}

/* =========================
   REGISTER
========================= */
document.getElementById('registerForm')
  .addEventListener('submit', async e => {
    e.preventDefault();

    const code = document.getElementById('code').value.trim();
    const sender = document.getElementById('sender').value.trim();

    if (!code || !sender) return;

    const r = await post('registerFile', { code, sender });
    if (r && r.success) {
      showStatus('SUBMITTED');
    }
  });

/* =========================
   SHOW REGISTER
========================= */
function showRegister() {
  registerBox.classList.remove('d-none');
  statusBox.classList.add('d-none');
}

/* =========================
   SHOW STATUS
========================= */
function showStatus(status) {
  registerBox.classList.add('d-none');
  statusBox.classList.remove('d-none');

  document.querySelectorAll('#statusTabs .nav-link')
    .forEach(b => {
      b.classList.toggle('active', b.dataset.status === status);
    });

  tabSubmitted.classList.toggle('d-none', status !== 'SUBMITTED');
  tabApproved.classList.toggle('d-none', status !== 'APPROVED');
}

/* =========================
   RECEIVE + SIGN
========================= */
const canvas = document.getElementById('signCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;

canvas.addEventListener('mousedown', e => {
  drawing = true;
  ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', e => {
  if (!drawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
});

canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseleave', () => drawing = false);

document.getElementById('btnReceive')
  .addEventListener('click', async () => {
    const receiver = document.getElementById('receiver').value.trim();
    if (!receiver) {
      alert('กรุณากรอกชื่อผู้รับแฟ้ม');
      return;
    }

    const r = await post('receive', {
      code: '',
      receiver,
      signature: canvas.toDataURL()
    });

    if (r && r.success) {
      alert('รับแฟ้มเรียบร้อย');
      showRegister(); // จบรอบ → กลับไป NEW
    }
  });

/* =========================
   POST HELPER
========================= */
async function post(action, data) {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...data })
  });
  return res.json();
}
