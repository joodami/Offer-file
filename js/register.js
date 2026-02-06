const GAS_URL =
  'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

let CURRENT_QR_URL = '';
let CURRENT_CODE = '';

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
  CURRENT_CODE = code;

  // 🔗 URL สำหรับสแกน
  const scanUrl =
    location.origin +
    location.pathname.replace('register.html', '') +
    'index.html?fid=' + fid;

  // 🔳 สร้าง QR
  CURRENT_QR_URL =
    'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' +
    encodeURIComponent(scanUrl);

  document.getElementById('qrImg').src = CURRENT_QR_URL;

  // toggle UI
  document.getElementById('formBox').classList.add('d-none');
  document.getElementById('qrBox').classList.remove('d-none');

  // 🧠 เก็บค่าไว้ใช้ต่อ
  sessionStorage.setItem('new_fid', fid);
  sessionStorage.setItem('new_code', code);
  sessionStorage.setItem('new_sender', sender);
}

/* =========================
   DOWNLOAD QR
========================= */
function downloadQR() {
  if (!CURRENT_QR_URL) return;

  const a = document.createElement('a');
  a.href = CURRENT_QR_URL;
  a.download = `QR_${CURRENT_CODE}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
