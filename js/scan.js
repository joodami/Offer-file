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

  if (status === 'NEW') {
    location.replace('submit.html?fid=' + fid);
    return;
  }

  if (status === 'SUBMITTED') {
    location.replace('status_submit.html?fid=' + fid);
    return;
  }

  if (status === 'APPROVED') {
    location.replace('status_approved.html?fid=' + fid);
    return;
  }

  if (status === 'RECEIVED') {
    location.replace('status_received.html?fid=' + fid);
    return;
  }
}

