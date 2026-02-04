document.addEventListener('DOMContentLoaded', () => {

  console.log('register.js loaded');

  const btn = document.getElementById('btnRegister');
  if (btn) {
    btn.addEventListener('click', register);
  }
});

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
  GAS +
  '?action=scan&fid=' +
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

  // 🆕 ยังไม่เคยเสนอแฟ้ม
  if (status === 'NEW') {
    location.href = 'submit.html?fid=' + fid;
    return;
  }

  if (status === 'SUBMITTED')
    location.href = 'status_submit.html?fid=' + fid;

  if (status === 'APPROVED')
    location.href = 'status_approved.html?fid=' + fid;

  if (status === 'RECEIVED')
    location.href = 'status_received.html?fid=' + fid;
}
