const GAS_URL = 'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnRegister')
    .addEventListener('click', register);
});

async function register(e) {
  e.preventDefault();

  const code = document.getElementById('code').value.trim();
  const sender = document.getElementById('sender').value.trim();

  if (!code || !sender) {
    alert('กรุณากรอกข้อมูลให้ครบ');
    return;
  }

  const btn = document.getElementById('btnRegister');
  btn.disabled = true;
  btn.innerText = 'กำลังสร้าง...';

  const r = await post('registerFile', { code, sender });

  btn.disabled = false;
  btn.innerText = 'ลงทะเบียน & ออก QR';

  if (!r.success) {
    alert('สร้างแฟ้มไม่สำเร็จ');
    return;
  }

  const fid = r.fileId;

  // ⭐ URL ที่ถูกต้องสำหรับ QR
  const url =
    location.origin +
    location.pathname.replace('register.html', '') +
    'index.html?fid=' + fid;

  document.getElementById('qrImg').src =
    'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' +
    encodeURIComponent(url);

  document.getElementById('form').classList.add('d-none');
  document.getElementById('qr').classList.remove('d-none');
}

async function post(action, data) {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...data })
  });
  return res.json();
}
