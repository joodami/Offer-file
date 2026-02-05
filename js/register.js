const GAS_URL = 'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

/* =========================
   CREATE QR (ONLY)
========================= */
async function createQR() {

  const code   = document.getElementById('code').value.trim();
  const sender = document.getElementById('sender').value.trim();

  if (!code || !sender) {
    alert('กรุณากรอกข้อมูลให้ครบ');
    return;
  }

  // ✅ สร้าง fid ที่ frontend
  const fid = crypto.randomUUID();

  // 🔗 URL สำหรับสแกน
  const scanUrl =
    location.origin +
    location.pathname.replace('register.html', '') +
    'index.html?fid=' + fid;

  // 🔳 สร้าง QR
  document.getElementById('qrImg').src =
    'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' +
    encodeURIComponent(scanUrl);

  // toggle UI
  document.getElementById('formBox').classList.add('d-none');
  document.getElementById('qrBox').classList.remove('d-none');

  // 🧠 เก็บค่าไว้ใช้ต่อ (optional)
  sessionStorage.setItem('new_fid', fid);
  sessionStorage.setItem('new_code', code);
  sessionStorage.setItem('new_sender', sender);
}
