const fid = getParam('fid');

if (fid) {
  checkStatus(fid);
}

document
  .getElementById('btnRegister')
  .addEventListener('click', register);

async function checkStatus(fid) {
  const r = await post('getFileStatus', { fileId: fid });
  if (!r.success) return;

  redirectByStatus(r.status, fid);
}

async function register() {
  const code = document.getElementById('code').value.trim();
  const sender = document.getElementById('sender').value.trim();

  if (!code || !sender) {
    alert('กรอกข้อมูลให้ครบ');
    return;
  }

  const r = await post('registerFile', { code, sender });
  if (!r.success) {
    alert('เกิดข้อผิดพลาด');
    return;
  }

  const fid = r.fileId;
  const url = location.origin + '/register.html?fid=' + fid;

  document.getElementById('qrImg').src =
    'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data='
    + encodeURIComponent(url);

  document.getElementById('form').style.display = 'none';
  document.getElementById('qr').style.display = 'block';
}

function redirectByStatus(status, fid) {
  if (status === 'SUBMITTED')
    location.href = 'status_submit.html?fid=' + fid;

  if (status === 'APPROVED')
    location.href = 'status_approved.html?fid=' + fid;

  if (status === 'RECEIVED')
    location.href = 'status_received.html?fid=' + fid;
}
