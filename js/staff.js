const GAS_URL =
  'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

let CURRENT_TAB = 'out';

/* ======================
   AUTO CHECK LOGIN
====================== */
document.addEventListener('DOMContentLoaded', () => {
  const phone = sessionStorage.getItem('staffPhone');
  if (phone) {
    openStaff();
  }
});

/* ======================
   LOGIN
====================== */
async function login() {
  const phone = document.getElementById('phone').value.trim();
  const msg = document.getElementById('msg');

  if (!phone) {
    msg.innerText = 'กรุณากรอกเบอร์โทร';
    return;
  }

  msg.innerText = 'กำลังตรวจสอบ...';

  const r = await post('staffLogin', { phone });

  if (!r.success) {
    msg.innerText = 'ไม่พบสิทธิ์เจ้าหน้าที่';
    return;
  }

  sessionStorage.setItem('staffPhone', phone);
  openStaff();
}

function logout() {
  sessionStorage.removeItem('staffPhone');
  location.reload();
}

function openStaff() {
  document.getElementById('loginBox').classList.add('d-none');
  document.getElementById('staffBox').classList.remove('d-none');
  loadData();
}

/* ======================
   TAB
====================== */
function showTab(tab) {
  CURRENT_TAB = tab;

  document.querySelectorAll('.nav-link')
    .forEach(b => b.classList.remove('active'));

  document.querySelectorAll('.nav-link')
    .forEach(b => {
      if (b.innerText.includes(tab === 'out' ? 'ออกจาก' : 'รับแฟ้ม')) {
        b.classList.add('active');
      }
    });

  loadData();
}

/* ======================
   LOAD DATA
====================== */
async function loadData() {
  const r = await fetch(GAS_URL + '?action=getData');
  const data = await r.json();

  const tb = document.getElementById('tb');
  const card = document.getElementById('cardView');

  tb.innerHTML = '';
  card.innerHTML = '';

  const list = data.filter(x =>
    CURRENT_TAB === 'out'
      ? x[3] === 'SUBMITTED'
      : x[3] === 'RECEIVED'
  );

  if (!list.length) {
    tb.innerHTML =
      `<tr><td colspan="4" class="text-center text-muted">ไม่มีข้อมูล</td></tr>`;
    card.innerHTML =
      `<div class="text-center text-muted">ไม่มีข้อมูล</div>`;
    return;
  }

  list.forEach(x => {
    // Desktop
    tb.innerHTML += `
      <tr class="text-center">
        <td>${x[1]}</td>
        <td>${x[2]}</td>
        <td>${formatDate(x[0])}</td>
        <td>
          ${
            CURRENT_TAB === 'out'
              ? `<button class="btn btn-success btn-sm"
                   onclick="outDirector('${x[1]}')">
                   บันทึกออก ผอ.
                 </button>`
              : '-'
          }
        </td>
      </tr>
    `;

    // Mobile
    card.innerHTML += `
      <div class="file-card">
        <div class="code">📁 ${x[1]}</div>
        <div class="label">ผู้เสนอ</div>
        <div>${x[2]}</div>

        ${
          CURRENT_TAB === 'out'
            ? `<button class="btn btn-success btn-sm mt-3 w-100"
                 onclick="outDirector('${x[1]}')">
                 บันทึกออกจากห้อง ผอ.
               </button>`
            : ''
        }
      </div>
    `;
  });
}

/* ======================
   ACTION : OUT DIRECTOR
====================== */
async function outDirector(code) {
  const date = prompt('วันที่ออกจากห้อง ผอ. (YYYY-MM-DD)');
  if (!date) return;

  const r = await post('outDirector', {
    code,
    outDate: date
  });

  if (r.success) loadData();
}

/* ======================
   UTIL
====================== */
async function post(action, data) {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...data })
  });
  return res.json();
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('th-TH') : '-';
}
