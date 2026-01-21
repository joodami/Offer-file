/* =========================
   CONFIG
========================= */
const GAS = 'https://script.google.com/macros/s/AKfycbycd0jLtPDxF17tZc4QGMGgLQktURjuJ_Q6SlFNA__wU-IRQKtfmVc6AtWqv-Lr5mkCpA/exec';
let CODE = '';

/* =========================
   UTILS
========================= */
function thaiDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/* =========================
   LOAD TABLE DATA
========================= */
fetch(GAS + '?action=getData')
  .then(r => r.json())
  .then(data => {
    tb.innerHTML = '';

    // ข้าม header row
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

/* =========================
   ADD NEW FILE
========================= */
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

/* =========================
   SIGNATURE CANVAS (MOBILE)
========================= */
const c = document.getElementById('c');
const ctx = c.getContext('2d');
let draw = false;

// รองรับมือถือ + ปากกา
c.addEventListener('pointerdown', e => {
  draw = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

c.addEventListener('pointerup', () => {
  draw = false;
});

c.addEventListener('pointermove', e => {
  if (!draw) return;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
});

function clearC() {
  ctx.clearRect(0, 0, c.width, c.height);
}

/* =========================
   RECEIVE FILE
========================= */
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
  })
  .then(r => r.json())
  .then(() => {
    alert('บันทึกรับแฟ้มคืนเรียบร้อยแล้ว');
    location.reload();
  });
}
