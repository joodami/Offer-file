const GAS_URL =
  'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

let CURRENT_STATUS = 'SUBMITTED';
let modal, canvas, ctx;
let drawing = false;

/* =========================
   INIT
========================= */
document.addEventListener('DOMContentLoaded', async () => {
  modal = new bootstrap.Modal(receiveModal);

  canvas = signPad;
  ctx = canvas.getContext('2d');
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  canvas.onmousedown = e => {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  };
  canvas.onmousemove = e => {
    if (drawing) {
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    }
  };
  canvas.onmouseup = () => drawing = false;
  canvas.onmouseleave = () => drawing = false;

  // ✅ scan จาก QR
  const fid = new URLSearchParams(location.search).get('fid');
  if (fid) {
    const r = await fetch(`${GAS_URL}?action=scan&fid=${fid}`)
      .then(r => r.json());

    if (r.status === 'NEW') {
      location.replace(`register.html?fid=${fid}`);
      return;
    }
    showTab(r.status);
  } else {
    loadData();
  }
});

/* =========================
   TAB
========================= */
function showTab(status) {
  CURRENT_STATUS = status;

  document
    .querySelectorAll('#statusTabs .nav-link')
    .forEach(b =>
      b.classList.toggle('active', b.dataset.status === status)
    );

  loadData();
}

/* =========================
   LOAD DATA
========================= */
async function loadData() {
  const tb = document.getElementById('tb');
  tb.innerHTML = '';

  const data = await fetch(`${GAS_URL}?action=getData`)
    .then(r => r.json());

  const list = data.filter(x => x[3] === CURRENT_STATUS);

  if (!list.length) {
    tb.innerHTML =
      `<tr>
        <td colspan="4" class="text-center text-muted">
          ไม่มีข้อมูล
        </td>
      </tr>`;
    return;
  }

  list.forEach(x => {
    tb.innerHTML += renderRow(x);
  });
}

/* =========================
   RENDER ROW
========================= */
function renderRow(x) {
  const code     = x[1];
  const sender   = x[2];
  const status   = x[3];
  const outDate  = x[4];
  const name     = x[5];
  const signUrl  = x[7];

  let actionHtml = '-';

  if (status === 'APPROVED') {
    actionHtml = `
      <button class="btn btn-success btn-sm"
        onclick="openReceive('${code}')">
        รับแฟ้มคืน
      </button>
    `;
  }

  if (status === 'RECEIVED') {
    actionHtml = `
      <div class="small text-start">
        <div><strong>ผู้รับ:</strong> ${name}</div>
        ${
          signUrl
            ? `<img src="${signUrl}"
                 class="img-fluid border mt-1"
                 style="max-height:120px">`
            : '-'
        }
      </div>
    `;
  }

  return `
    <tr class="text-center align-middle">
      <td>${code}</td>
      <td>${sender}</td>
      <td>
        ${status === 'APPROVED' && outDate
          ? `ออกจากห้อง ผอ. : ${formatDate(outDate)}`
          : status}
      </td>
      <td>${actionHtml}</td>
    </tr>
  `;
}


function renderCard(x) {
  const card = document.getElementById('cardView');

  card.innerHTML += `
    <div class="file-card">
      <div class="code">📁 ${x[1]}</div>

      <div class="label">ผู้เสนอ</div>
      <div>${x[2]}</div>

      <div class="label mt-2">สถานะ</div>
      <div>${x[3]}</div>

      ${
        x[3] === 'APPROVED'
          ? `<button class="btn btn-success w-100 mt-3"
               onclick="openReceive('${x[1]}')">
               รับแฟ้มคืน
             </button>`
          : ''
      }
    </div>
  `;
}

/* =========================
   RECEIVE MODAL
========================= */
function openReceive(code) {
  receiveCode.value = code;
  receiverName.value = '';
  clearSign();
  modal.show();
}

function clearSign() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

async function submitReceive() {
  if (!receiverName.value.trim()) {
    alert('กรอกชื่อผู้รับแฟ้ม');
    return;
  }

  const r = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'receive',
      code: receiveCode.value,
      receiver: receiverName.value,
      signature: canvas.toDataURL()
    })
  }).then(r => r.json());

  if (r.success) {
    modal.hide();
    loadData();
  }
}

/* =========================
   UTIL
========================= */
function formatDate(d) {
  return d
    ? new Date(d).toLocaleDateString('th-TH')
    : '-';
}
