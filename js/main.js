const GAS_URL = 'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

let CURRENT_STATUS = 'SUBMITTED';
let modal, canvas, ctx, drawing=false;

document.addEventListener('DOMContentLoaded', async ()=>{
  modal = new bootstrap.Modal(receiveModal);
  canvas = signPad;
  ctx = canvas.getContext('2d');
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  canvas.onmousedown = e=>{drawing=true;ctx.beginPath();ctx.moveTo(e.offsetX,e.offsetY);}
  canvas.onmousemove = e=>{if(drawing){ctx.lineTo(e.offsetX,e.offsetY);ctx.stroke();}}
  canvas.onmouseup = ()=>drawing=false;
  canvas.onmouseleave = ()=>drawing=false;

  const fid = new URLSearchParams(location.search).get('fid');
  if (fid){
    const r = await fetch(GAS_URL+'?action=scan&fid='+fid).then(r=>r.json());
    if (r.status==='NEW'){ location.replace('register.html?fid='+fid); return; }
    showTab(r.status);
  }
  loadData();
});

function showTab(status){
  CURRENT_STATUS = status;
  document.querySelectorAll('#statusTabs .nav-link')
    .forEach(b=>b.classList.toggle('active',b.dataset.status===status));
  loadData();
}

async function loadData(){
  tb.innerHTML='';
  const data = await fetch(GAS_URL+'?action=getData').then(r=>r.json());
  const list = data.filter(x=>x[3]===CURRENT_STATUS);
  if(!list.length){
    tb.innerHTML='<tr><td colspan="4" class="text-center text-muted">ไม่มีข้อมูล</td></tr>';
    return;
  }
  list.forEach(x=>{
    tb.innerHTML+=`
    <tr class="text-center">
      <td>${x[1]}</td>
      <td>${x[2]}</td>
      <td>${x[3]}</td>
      <td>
        ${CURRENT_STATUS==='APPROVED'
          ? `<button class="btn btn-success btn-sm" onclick="openReceive('${x[1]}')">รับแฟ้มคืน</button>`
          : '-'}
      </td>
    </tr>`;
  });
}

function openReceive(code){
  receiveCode.value=code;
  receiverName.value='';
  clearSign();
  modal.show();
}

function clearSign(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
}

async function submitReceive(){
  if(!receiverName.value.trim()){ alert('กรอกชื่อผู้รับ'); return; }
  const r = await fetch(GAS_URL,{
    method:'POST',
    headers:{'Content-Type':'text/plain;charset=utf-8'},
    body:JSON.stringify({
      action:'receive',
      code:receiveCode.value,
      receiver:receiverName.value,
      signature:canvas.toDataURL()
    })
  }).then(r=>r.json());
  if(r.success){ modal.hide(); loadData(); }
}
