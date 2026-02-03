const fid = getParam('fid');

if (!fid) {
  alert('ไม่พบข้อมูลแฟ้ม');
  location.href = 'index.html';
}

loadFileInfo();

document
  .getElementById('btnSubmit')
  .addEventListener('click', submit);


/* =========================
   LOAD FILE INFO
========================= */
async function loadFileInfo() {
  const r = await post('getFileStatus', { fileId: fid });
  if (!r || !r.success) {
    alert('ไม่พบแฟ้ม');
    return;
  }

  document.getElementById('code').value = r.code || '';
}


/* =========================
   SUBMIT FILE
========================= */
async function submit() {
  const date   = document.getElementById('date').value;
  const sender = document.getElementById('sender').value.trim();
  const remark = document.getElementById('remark').value.trim();

  if (!date || !sender) {
    alert('กรุณากรอกข้อมูลให้ครบ');
    return;
  }

  const btn = document.getElementById('btnSubmit');
  btn.disabled = true;
  btn.innerHTML = 'กำลังบันทึก...';

  const r = await post('submitFile', {
    fileId: fid,
    date,
    sender,
    remark
  });

  btn.disabled = false;
  btn.innerHTML = '📌 เสนอแฟ้ม';

  if (!r || !r.success) {
    alert('เกิดข้อผิดพลาด');
    return;
  }

  location.href = 'status_submit.html?fid=' + fid;
}
