const GAS = 'https://script.google.com/macros/s/AKfycbycd0jLtPDxF17tZc4QGMGgLQktURjuJ_Q6SlFNA__wU-IRQKtfmVc6AtWqv-Lr5mkCpA/exec';
let CODE = '';

fetch(GAS+'?action=getData').then(r=>r.json()).then(d=>{
  d.forEach(x=>{
    tb.innerHTML += `
    <tr>
      <td>${x[1]}</td>
      <td>${x[2]}</td>
      <td>${x[3]}</td>
      <td>${x[3]=='พิจารณาเรียบร้อยแล้ว'
        ? `<button onclick="openSign('${x[1]}')">รับแฟ้ม</button>`:'-'}</td>
    </tr>`;
  });
});

function add(){
 fetch(GAS,{
  method:'POST',
  body:JSON.stringify({
    action:'add',
    date:date.value,
    code:code.value,
    sender:sender.value
  })
 }).then(()=>location.reload());
}

// Canvas Touch
const c = document.getElementById('c');
const ctx = c.getContext('2d');
let draw=false;

['mousedown','touchstart'].forEach(e=>c.addEventListener(e,()=>draw=true));
['mouseup','touchend'].forEach(e=>c.addEventListener(e,()=>draw=false));

c.addEventListener('mousemove',drawLine);
c.addEventListener('touchmove',drawLine);

function drawLine(e){
 if(!draw) return;
 const r=c.getBoundingClientRect();
 const x=(e.touches?e.touches[0].clientX:e.clientX)-r.left;
 const y=(e.touches?e.touches[0].clientY:e.clientY)-r.top;
 ctx.lineWidth=2; ctx.lineCap='round';
 ctx.lineTo(x,y); ctx.stroke();
}

function clearC(){ ctx.clearRect(0,0,c.width,c.height); }

function openSign(code){ CODE=code; sign.style.display='block'; }

function save(){
 fetch(GAS,{
  method:'POST',
  body:JSON.stringify({
    action:'receive',
    code:CODE,
    receiver:receiver.value,
    date:new Date().toLocaleDateString(),
    signature:c.toDataURL()
  })
 }).then(()=>location.reload());
}
