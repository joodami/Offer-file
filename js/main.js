const GAS_URL = 'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';
const fid = new URLSearchParams(location.search).get('fid');

const pages = {
  NEW: 'new',
  SUBMITTED: 'sub',
  APPROVED: 'app'
};

document.addEventListener('DOMContentLoaded', loadStatus);

/* ===== STATUS ===== */
async function loadStatus() {
  const r = await post('getFileStatus', { fileId: fid });
  if (!r.success) return;

  show(pages[r.status] || 'new');
}

function show(p) {
  ['new','sub','app'].forEach(x=>{
    document.getElementById('tab-'+x)?.classList.remove('active');
    document.getElementById('page-'+x)?.classList.add('d-none');
  });

  document.getElementById('tab-'+p).classList.add('active');
  document.getElementById('page-'+p).classList.remove('d-none');
}

/* ===== REGISTER ===== */
async function registerFile() {
  const sender = senderInput.value.trim();
  if (!sender) return alert('กรอกชื่อผู้เสนอ');

  const r = await post('registerFile', { sender });
  if (r.success) loadStatus();
}

/* ===== SIGN ===== */
const c = document.getElementById('sign');
const ctx = c.getContext('2d');
let draw=false;

c.onmousedown=()=>draw=true;
c.onmouseup=()=>draw=false;
c.onmousemove=e=>{
  if(!draw) return;
  ctx.lineWidth=2;
  ctx.lineCap='round';
  ctx.lineTo(e.offsetX,e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX,e.offsetY);
};

async function receive() {
  const r = await post('receive',{
    code: fid,
    signature: c.toDataURL(),
    receiver: 'ผู้เสนอ'
  });
  if (r.success) loadStatus();
}

async function post(action,data){
  const res = await fetch(GAS_URL,{
    method:'POST',
    headers:{'Content-Type':'text/plain;charset=utf-8'},
    body:JSON.stringify({action,...data})
  });
  return res.json();
}
