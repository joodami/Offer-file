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

  btn.disabled = false;
  btn.innerHTML = 'ลงทะเบียน & ออก QR Code';

  if (!r || !r.success) {
    alert('เกิดข้อผิดพลาด');
    return;
  }

  const fid = r.fileId;

  // ✅ QR ต้องชี้ไปหน้า scan.html
  const scanUrl =
    location.origin +
    location.pathname.replace('register.html', '') +
    'scan.html?fid=' +
    fid;

  document.getElementById('qrImg').src =
    'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' +
    encodeURIComponent(scanUrl);

  document.getElementById('form').classList.add('d-none');
  document.getElementById('qr').classList.remove('d-none');
}
