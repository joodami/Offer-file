const GAS_URL = 'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

const fid = new URLSearchParams(location.search).get('fid');

document.addEventListener('DOMContentLoaded', init);

function init() {
  if (!fid) {
    alert('ไม่พบรหัสแฟ้ม');
    return;
  }
  loadStatus();
}

/* =========================
   LOAD STATUS → เลือก TAB
========================= */
async function loadStatus() {
  const r = await post('getFileStatus', { fileId: fid });

  if (!r.success) {
    alert('โหลดสถานะไม่สำเร็จ');
    return;
  }

  /*
    STATUS ที่ใช้
    - NEW
    - SUBMITTED
    - APPROVED
  */

  if (r.status === 'NEW') {
    show('new');
  } else if (r.status === 'SUBMITTED') {
    show('submit');
  } else if (r.status === 'APPROVED') {
    show('approve');
  }
}

function show(tab) {
  // tab
  ['new','submit','approve'].forEach(t => {
    document.getElementById('tab-'+t).classList.remove('active');
    document.getElementById('page-'+t).classList.add('d-none');
  });

  document.getElementById('tab-'+tab).classList.add('active');
  document.getElementById('page-'+tab).classList.remove('d-none');
}

/* =========================
   REGISTER (ครั้งแรก / รอบใหม่)
========================= */
async function registerFile() {
  const sender = document.getElementById('sender').value.trim();
  if (!sender) {
    alert('กรุณากรอกชื่อผู้เสนอ');
    return;
  }

  const r = await post('submitFile', {
    fileId: fid,
    sender
  });

  if (r.success) {
    loadStatus();
  }
}

/* =========================
   SIGN + RECEIVE
========================= */
const canvas = document.getElementById('sign');
const ctx = canvas.getContext('2d');
let drawing = false;

canvas.addEventListener('mousedown', ()=>drawing=true);
canvas.addEventListener('mouseup', ()=>drawing=false);
canvas.addEventListener('mousemove', e=>{
  if(!drawing) return;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

async function receiveFile() {
  const dataURL = canvas.toDataURL();

  const r = await post('receive', {
    fileId: fid,
    signature: dataURL
  });

  if (r.success) {
    alert('รับแฟ้มคืนเรียบร้อย');
    loadStatus(); // จะกลับไป NEW รอบใหม่
  }
}

/* =========================
   POST HELPER
========================= */
async function post(action, data) {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type':'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...data })
  });
  return res.json();
}
