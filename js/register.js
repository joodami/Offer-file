document.addEventListener('DOMContentLoaded', () => {

  console.log('register.js loaded');

  const fid = getParam('fid');

  if (fid) {
    checkStatus(fid);
  }

  const btn = document.getElementById('btnRegister');
  if (btn) {
    btn.addEventListener('click', register);
  }
});


/* =========================
   CHECK STATUS (SCAN QR)
========================= */
async function checkStatus(fid) {
  const r = await post('getFileStatus', { fileId: fid });
  if (!r || !r.success) return;

  redirectByStatus(r.status, fid);
}


/* =========================
   REGISTER NEW FILE
========================= */
async function register(e) {
  if (e) e.preventDefault();

  console.log('click register');

  const code = document.getElementById('code').value.trim();
  const sender = document.getElementById('sender').value.trim();

  if (!code || !sender) {
    alert('กรุณากรอกข้อมูลให้ครบ');
    return;
  }

  const btn = document.getElementById('btnRegister');
  btn.disabled = true;
  btn.innerHTML = 'กำลังบันทึก...';

  const r = await post('registerFile', { code, sender });
  console.log('API result', r);

  btn.disabled = false;
  btn.innerHTML = 'ลงทะเบียน & ออก QR Code';

  if (!r || !r.success) {
    alert('เกิดข้อผิดพลาด');
    return;
  }

  const fid = r.fileId;

  const scanUrl =
    location.origin +
    location.pathname.replace('register.html', '') +
    'register.html?fid=' +
    fid;

  document.getElementById('qrImg').src =
    'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' +
    encodeURIComponent(scanUrl);

  document.getElementById('form').classList.add('d-none');
  document.getElementById('qr').classList.remove('d-none');
}


/* =========================
   REDIRECT BY STATUS
========================= */
function redirectByStatus(status, fid) {
  if (status === 'SUBMITTED')
    location.href = 'status_submit.html?fid=' + fid;

  if (status === 'APPROVED')
    location.href = 'status_approved.html?fid=' + fid;

  if (status === 'RECEIVED')
    location.href = 'status_received.html?fid=' + fid;
}
