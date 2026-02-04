
<script src="js/api.js"></script>
<script>
const fid = new URLSearchParams(location.search).get('fid');

if (!fid) {
  alert('QR ไม่ถูกต้อง');
  location.replace('index.html');
}

(async () => {
  try {
    const res = await fetch(
      GAS + '?action=scan&fid=' + encodeURIComponent(fid)
    );
    const r = await res.json();

    if (!r.success) {
      alert('ไม่พบแฟ้ม');
      location.replace('index.html');
      return;
    }

    if (r.status === 'NEW') {
      location.replace('submit.html?fid=' + fid);
    } else {
      location.replace('index.html?fid=' + fid);
    }

  } catch (e) {
    alert('เชื่อมต่อระบบไม่ได้');
    location.replace('index.html');
  }
})();
</script>
