const GAS_URL = 'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

/* =========================
   CREATE QR
========================= */
async function createQR() {

  const code   = document.getElementById('code').value.trim();
  const sender = document.getElementById('sender').value.trim();

  if (!code || !sender) {
    alert('กรุณากรอกข้อมูลให้ครบ');
    return;
  }

  // เรียก GAS → registerFile
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify({
      action: 'registerFile',
      code,
      sender
    })
  });

  const r = await res.json();

  if (!r.success) {
    alert('สร้างแฟ้มไม่สำเร็จ');
    return;
  }

  // 🔗 URL ที่ QR จะชี้ไป
  const scanUrl =
    location.origin +
    location.pathname.replace('register.html', '') +
    'index.html?fid=' + r.fileId;

  // 🔳 สร้าง QR
  document.getElementById('qrImg').src =
    'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' +
    encodeURIComponent(scanUrl);

  // toggle UI
  document.getElementById('formBox').classList.add('d-none');
  document.getElementById('qrBox').classList.remove('d-none');
}
