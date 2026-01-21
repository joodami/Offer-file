const GAS = 'https://script.google.com/macros/s/AKfycbycd0jLtPDxF17tZc4QGMGgLQktURjuJ_Q6SlFNA__wU-IRQKtfmVc6AtWqv-Lr5mkCpA/exec';
let CODE = '';

fetch(GAS + '?action=getData')
.then(r => r.json())
.then(data => {
  data.forEach(x => {
    tb.innerHTML += `
      <tr>
        <td>${x[1]}</td>
        <td>${x[2]}</td>
        <td>${x[3]}</td>
        <td>
          ${x[3] === 'พิจารณาเรียบร้อยแล้ว'
            ? `<button onclick="openSign('${x[1]}')">รับแฟ้มคืน</button>`
            : '-'}
        </td>
      </tr>`;
  });
});

function add() {
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

/* Canvas รองรับมือถือ */
const c = document.getElementById('c');
const ctx = c.getContext('2d');
let draw = false;

c.addEventListener('pointerdown', () => draw = true);
c.addEventListener('pointerup', () => draw = false);
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

function openSign(code) {
  CODE = code;
  sign.style.display = 'block';
}

function save() {
  fetch(GAS, {
    method: 'POST',
    body: JSON.stringify({
      action: 'receive',
      code: CODE,
      receiver: receiver.value,
      receiveDate: new Date().toLocaleDateString(),
      signature: c.toDataURL()
    })
  }).then(() => location.reload());
}

