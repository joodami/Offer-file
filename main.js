const GAS = 'https://script.google.com/macros/s/AKfycbycd0jLtPDxF17tZc4QGMGgLQktURjuJ_Q6SlFNA__wU-IRQKtfmVc6AtWqv-Lr5mkCpA/exec';
let CODE = '';

/* ===== DOM ===== */
const tb = document.getElementById('tb');
const date = document.getElementById('date');
const code = document.getElementById('code');
const sender = document.getElementById('sender');
const sign = document.getElementById('sign');
const receiver = document.getElementById('receiver');
const c = document.getElementById('c');
const ctx = c ? c.getContext('2d') : null;

/* ===== Thai Date ===== */
function thaiDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/* ===== Load table ===== */
fetch(GAS + '?action=getData')
  .then(r => r.json())
  .then(data => {
    tb.innerHTML = '';
    data.slice(1).forEach(row => {
      tb.innerHTML += `
        <tr>
          <td>${row[1]}</td>
          <td>${row[2]}</td>
          <td>${row[3]}</td>
          <td>
            ${row[3] === 'พิจารณาเรียบร้อยแล้ว'
              ? `<button onclick="openSign('${row[1]}')">รับแฟ้มคืน</button>`
              : '-'}
          </td>
        </tr>
      `;
    });
  });

/* ===== Add new ===== */
function add() {
  if (!date.value || !code.value || !sender.value) {
    alert('กรุณากรอกข้อมูลให้ครบ');
    return;
  }

  fetch(GAS, {
    method: 'POST',
    body: JSON.stringify({
      action: 'add',
      date: date.value,
      code: code.value,
      sender: sender.value
    })
  }).then(() => location.reload());
}

/* ===== Signature ===== */
if (c && ctx) {
  let draw = false;

  c.addEventListener('pointerdown', e => {
    draw = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  });

  c.addEventListener('pointerup', () => draw = false);

  c.addEventListener('pointermove', e => {
    if (!draw) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  });
}

function clearC() {
  if (ctx) ctx.clearRect(0, 0, c.width, c.height);
}

/* ===== Receive ===== */
function openSign(code) {
  CODE = code;
  sign.style.display = 'block';
}

function save() {
  if (!receiver.value) {
    alert('กรุณากรอกชื่อผู้รับแฟ้มคืน');
    return;
  }

  fetch(GAS, {
    method: 'POST',
    body: JSON.stringify({
      action: 'receive',
      code: CODE,
      receiver: receiver.value,
      receiveDate: new Date().toISOString().slice(0, 10),
      signature: c.toDataURL()
    })
  }).then(() => location.reload());
}
