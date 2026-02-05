const fid = getParam('fid');

if (!fid) {
  alert('QR ไม่ถูกต้อง');
  location.replace('index.html');
}

(async function () {
  try {
    const res = await fetch(
      GAS_URL + '?action=scan&fid=' + encodeURIComponent(fid)
    );

    const r = await res.json();

    if (!r.success) {
      alert('ไม่พบข้อมูลแฟ้ม');
      location.replace('index.html');
      return;
    }

    switch (r.status) {

  case 'NEW':
    // 🆕 ยังไม่เสนอ → ลงทะเบียนเสนอแฟ้ม
    location.replace('submit.html?fid=' + fid);
    break;

  case 'SUBMITTED':
    // 📤 เสนอแล้ว → หน้า index แท็บเสนอแฟ้ม
    location.replace('index.html?fid=' + fid);
    break;

  case 'APPROVED':
    // ✅ ผอ.พิจารณาแล้ว
    location.replace('index.html?fid=' + fid);
    break;

  case 'RECEIVED':
    // 🔁 จบรอบ → เสนอรอบใหม่
    location.replace('submit.html?fid=' + fid);
    break;

  default:
    location.replace('index.html');
}


  } catch (e) {
    console.error(e);
    alert('ตรวจสอบสถานะแฟ้มไม่สำเร็จ');
    location.replace('index.html');
  }
})();
