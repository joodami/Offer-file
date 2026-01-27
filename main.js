const GAS = 'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

const tb = document.getElementById('tb');
const cardView = document.getElementById('cardView');

let CODE = '';
let ALL_DATA = [];
let CURRENT_STATUS = 'เสนอแฟ้มต่อผู้อำนวยการ';
const BATCH_SIZE = 20;
let rendered = 0;

/* ================= Toast ================= */
function showToast(msg, ok=true){
  alert(msg);
}

/* ================= Add ================= */
function add(e){
  e.preventDefault();
  const date=document.getElementById('date').value;
  const sender=document.getElementById('sender').value.trim();
  const codes=document.getElementById('code').value.split('\n').map(x=>x.trim()).filter(Boolean);
  if(!date||!sender||!codes.length){ showToast('กรอกข้อมูลไม่ครบ',false); return;}
  fetch(GAS,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({action:'add',date,sender,codes})})
  .then(r=>r.json()).then(()=>loadData());
}

/* ================= Load ================= */
loadData();
function loadData(){
  fetch(GAS+'?action=getData').then(r=>r.json()).then(d=>{
    ALL_DATA=d;
    applyFilter();
  });
}

function applyFilter(){
  tb.innerHTML='';
  cardView.innerHTML='';
  rendered=0;
  const list=ALL_DATA.filter(x=>x[3]===CURRENT_STATUS);
  if(!list.length){
    tb.innerHTML='<tr><td colspan="7" class="text-center p-4">ไม่พบข้อมูล</td></tr>';
    return;
  }
  list.forEach(x=>{ appendRow(x); appendCard(x); });
}

/* ================= Table ================= */
function appendRow(x){
  tb.insertAdjacentHTML('beforeend',`
    <tr>
      <td>${fmt(x[0])}</td>
      <td>${x[1]}</td>
      <td>${x[2]}</td>
      <td><span class="badge bg-secondary">${x[3]}</span></td>
      <td>${fmt(x[4])}</td>
      <td>${fmt(x[6])}</td>
      <td>${x[3]==='รับแฟ้มคืนเรียบร้อยแล้ว'
        ?`<button class="btn btn-sm btn-outline-primary" onclick="viewSignature('${x[7]}')">ดูลายเซ็น</button>`
        :'-'}</td>
    </tr>`);
}

/* ================= Card ================= */
function appendCard(x){
  const div=document.createElement('div');
  div.className='file-card';
  div.innerHTML=`
    <div class="file-code-box">
      <div class="file-code-label">รหัสแฟ้ม</div>
      <div class="file-code">${x[1]}</div>
    </div>
    <div class="info-row">
      <div><div class="label">วันที่</div><div class="value">${fmt(x[0])}</div></div>
      <div><div class="label">ผู้เสนอ</div><div class="value">${x[2]}</div></div>
    </div>
    ${x[3]==='พิจารณาเรียบร้อยแล้ว'
      ?`<button class="btn btn-success w-100" onclick="openSign('${x[1]}')">รับแฟ้มคืน</button>`
      :''}
  `;
  cardView.appendChild(div);
}

/* ================= Signature (FULL SMOOTH) ================= */
const c=document.getElementById('c');
const ctx=c.getContext('2d');
ctx.lineWidth=2.4;
ctx.lineCap='round';
ctx.lineJoin='round';

let drawing=false, points=[];

function resizeCanvas(){
  const dpr=window.devicePixelRatio||1;
  const rect=c.getBoundingClientRect();
  c.width=rect.width*dpr;
  c.height=rect.height*dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
}

function openSign(code){
  CODE=code;
  new bootstrap.Modal(signModal).show();
  setTimeout(()=>{resizeCanvas();clearC();},300);
}

c.addEventListener('mousedown',e=>{drawing=true;points=[pos(e)]});
c.addEventListener('mousemove',e=>{if(!drawing)return;points.push(pos(e));draw()});
c.addEventListener('mouseup',()=>drawing=false);

c.addEventListener('touchstart',e=>{e.preventDefault();drawing=true;points=[tpos(e)]});
c.addEventListener('touchmove',e=>{e.preventDefault();if(!drawing)return;points.push(tpos(e));draw()});
c.addEventListener('touchend',()=>drawing=false);

function draw(){
  if(points.length<2)return;
  ctx.beginPath();
  ctx.moveTo(points[0].x,points[0].y);
  for(let i=1;i<points.length-1;i++){
    const mx=(points[i].x+points[i+1].x)/2;
    const my=(points[i].y+points[i+1].y)/2;
    ctx.quadraticCurveTo(points[i].x,points[i].y,mx,my);
  }
  ctx.stroke();
}

function pos(e){const r=c.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
function tpos(e){const r=c.getBoundingClientRect();return{x:e.touches[0].clientX-r.left,y:e.touches[0].clientY-r.top}}

function clearC(){ctx.clearRect(0,0,c.width,c.height)}

function save(){
  fetch(GAS,{method:'POST',headers:{'Content-Type':'text/plain'},
  body:JSON.stringify({action:'receive',code:CODE,signature:c.toDataURL()})})
  .then(()=>loadData());
}

function viewSignature(b){document.getElementById('signImage').src=b;new bootstrap.Modal(viewSignModal).show();}
function fmt(d){return d?new Date(d).toLocaleDateString('th-TH'):'-'}
