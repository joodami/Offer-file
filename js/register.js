const fid = getParam('fid');

// 👉 ถ้ามี fid แปลว่า "มาจากการสแกน QR"
// ให้ไปดูสถานะแฟ้ม ไม่ใช่มาสร้างใหม่
if (fid) {
  checkStatus(fid);
}

// 👉 ปุ่มนี้ใช้เฉพาะ "สร้างแฟ้มใหม่"
document
  .getElementById('btnRegister')
  .addEventListener('click', register);

/* ======================
   CHECK STATUS (SCAN QR)
====================== */
async function checkStatus(fid) {
  const r = await post('getFileStatus', { fileId: fid });
  if (!r || !r.success) {
    alert('ไม่พบข้อมูลแฟ้ม');
    return;
  }

  redirectByStatus(r.status, fid);
}

/* ======================
   REGISTER NEW FILE
====================== */
async function register() {
  const code = document.getElementById('code').value.trim();
  const sender = document.getElementById('sender').value.trim();

  if (!code || !sender) {
    alert('กรอกข้อมูลให้ครบ');
    return;
  }

  const r = await post('registerFile', { code, sender });
  if (!r || !r.success) {
    alert('เกิดข้อผิดพลาดในการลงทะเบียน');
    return;
  }

  // 👉 ได้ fileId ใหม่ = แฟ้มใหม่
  const fid = r.fileId;

  // 👉 QR จะชี้กลับมาที่ register.html?fid=...
  const qrUrl =
    location.origin + location.pathname + '?fid=' + fid;

  document.getElementById('qrImg').src =
    'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data='
    + encodeURIComponent(qrUrl);

  // แสดงเฉพาะ QR
  document.getElementById('form').style.display = 'none';
  document.getElementById('qr').style.display = 'block';
}

/* ======================
   REDIRECT BY STATUS
====================== */
function redirectByStatus(status, fid) {
  if (status === 'SUBMITTED')
    location.href = 'status_submit.html?fid=' + fid;

  if (status === 'APPROVED')
    location.href = 'status_approved.html?fid=' + fid;

  if (status === 'RECEIVED')
    location.href = 'status_received.html?fid=' + fid;
}
