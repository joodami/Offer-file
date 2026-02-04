<script src="js/api.js"></script>
<script>
const fid = getParam('fid');

if (!fid) {
  alert('QR ไม่ถูกต้อง');
  location.replace('index.html');
}

/**
 * ขั้นตอนการทำงาน
 * 1. เรียก GAS action=scan
 * 2. GAS บอกสถานะล่าสุด
 * 3. frontend ตัดสินใจว่าจะไปหน้าไหน
 */
(async function checkStatus() {
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

    // ===== ตัดสินใจจากสถานะ =====
    if (r.status === 'NEW') {
      // ยังไม่เคยเสนอ หรือรับคืนแล้วพร้อมเสนอใหม่
      location.replace('submit.html?fid=' + fid);
      return;
    }

    // มีประวัติแล้ว → ดูสถานะ / timeline
    location.replace('index.html?fid=' + fid);

  } catch (err) {
    alert('ไม่สามารถตรวจสอบสถานะแฟ้มได้');
    location.replace('index.html');
  }
})();
</script>
