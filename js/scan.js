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

    // 🆕 ยังไม่เคยเสนอ หรือ รับคืนแล้ว
    if (r.status === 'NEW' || r.status === 'RECEIVED') {
      location.replace('submit.html?fid=' + fid);
      return;
    }

    // มีสถานะแล้ว → dashboard
    location.replace('index.html?fid=' + fid);

  } catch (e) {
    alert('ไม่สามารถตรวจสอบสถานะแฟ้มได้');
    location.replace('index.html');
  }
})();
