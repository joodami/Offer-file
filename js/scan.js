const fid = getParam('fid');

if (!fid) {
  alert('QR ไม่ถูกต้อง');
  location.replace('index.html');
}

(async function () {
  try {
    const res = await fetch(
      GAS + '?action=scan&fid=' + encodeURIComponent(fid)
    );
    const r = await res.json();

    if (!r.success) {
      alert('ไม่พบข้อมูลแฟ้ม');
      location.replace('index.html');
      return;
    }

    switch (r.status) {

case 'NEW':
  location.replace('submit.html?fid=' + fid);
  break;


      case 'SUBMITTED':
        location.replace('status_submit.html?fid=' + fid);
        break;

      case 'APPROVED':
        location.replace('status_approved.html?fid=' + fid);
        break;

      case 'RECEIVED':
        // 🔁 จบรอบ → เสนอใหม่
        location.replace('register.html?fid=' + fid);
        break;

      default:
        location.replace('index.html');
    }

  } catch (e) {
    alert('ตรวจสอบสถานะแฟ้มไม่สำเร็จ');
    location.replace('index.html');
  }
})();
