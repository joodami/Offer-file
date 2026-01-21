const GAS = 'https://script.google.com/macros/s/AKfycbycd0jLtPDxF17tZc4QGMGgLQktURjuJ_Q6SlFNA__wU-IRQKtfmVc6AtWqv-Lr5mkCpA/exec';

const tb = document.getElementById('tb');
let CODE = '';

/* Toast */
function showToast(msg, success = true) {
  const toastEl = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  toastEl.className = `toast align-items-center text-bg-${success ? 'success' : 'danger'} border-0`;
  toastMsg.innerText = msg;
  new bootstrap.Toast(toastEl).show();
}

/* โหลดข้อมูล */
loadData();

function loadData() {
  fetch(GAS + '?action=getData')
    .then(r => r.json())
    .then(data => {
      tb.innerHTML = '';

      if (!data.length) {
        tb.innerHTML = `
          <tr>
            <td colspan="4" class="text-center text-muted p-4">
              ยังไม่มีข้อมูล
            </td>
          </tr>`;
        return;
      }

      data.forEach(x => appendRow(x));
    });
}

/* เพิ่มแถว */
function appendRow(x) {
  const statusColor = {
    'เสนอแฟ้มต่อผู้อำนวยการ': 'warning',
    'พิจารณาเรียบร้อยแล้ว': 'success'
  };

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${x[1]}</td>
    <td>${x[2]}</td>
    <td>
      <span class="badge bg-${statusColor[x[3]] || 'secondary'}">
        ${x[3]}
      </span>
    </td>
    <td>
      ${x[3] === 'พิจารณาเรียบร้อยแล้ว'
        ? `<button class="btn btn-sm btn-success" onclick="openSign('${x[1]}')">
            รับแฟ้มคืน
          </button>`
        : '-'}
    </td>
  `;
  tb.prepend(tr);
}

/* เพิ่มแฟ้ม */
function add(e) {
  const btn = e.target;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

  const data = {
    action: 'add',
    date: date.value,
    code: code.value,
    sender: sender.value
  };

  fetch(GAS, {
    method: 'POST',
    body: JSON.stringify(data)
  })
  .then(() => {
    appendRow(['', data.code, data.sender, 'เสนอแฟ้มต่อผู้อำนวยการ']);
    showToast('บันทึกแฟ้มเรียบร้อย');
    date.value = code.value = sender.value = '';
  })
  .finally(() => {
    btn.disabled = false;
    btn.innerHTML = 'บันทึก';
  });
}

/* Modal ลายเซ็น */
function openSign(code) {
  CODE = code;
  new bootstrap.Modal(document.getElementById('signModal')).show();
}

/* Canvas */
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

/* บันทึกรับแฟ้มคืน */
function save(e) {
  const btn = e.target;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

  fetch(GAS, {
    method: 'POST',
    body: JSON.stringify({
      action: 'receive',
      code: CODE,
      receiver: receiver.value,
      receiveDate: new Date().toLocaleDateString(),
      signature: c.toDataURL()
    })
  })
  .then(() => {
    showToast('รับแฟ้มคืนเรียบร้อย');
    bootstrap.Modal.getInstance(document.getElementById('signModal')).hide();
    loadData();
  })
  .finally(() => {
    btn.disabled = false;
    btn.innerHTML = 'บันทึก';
  });
}
