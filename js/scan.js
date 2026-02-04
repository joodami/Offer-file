const fid = getParam('fid');

if (!fid) {
  alert('QR ไม่ถูกต้อง');
  location.href = 'index.html';
}

checkStatus();

async function checkStatus() {
  const r = await post('getFileStatus', { fileId: fid });
  if (!r || !r.success) {
    alert('ไม่พบข้อมูลแฟ้ม');
    return;
  }

  redirectByStatus(r.status);
}

function redirectByStatus(status) {
  location.replace('index.html?fid=' + fid);
}

