const GAS_URL =
  'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

let CURRENT_STATUS = 'SUBMITTED';

/* ======================
   AUTO LOGIN
====================== */
document.addEventListener('DOMContentLoaded', () => {
  const phone = sessionStorage.getItem('staffPhone');
  if (phone) openStaff();
});

/* ======================
   LOGIN
====================== */
async function login() {
  const phone = phoneInput.value.trim();
  msg.innerText = '';

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
  loginBox.classList.add('d-none');
  staffBox.classList.remove('d-none');
  loadData();
}

/* ======================
   TAB
====================== */
function showTab(status) {
  CURRENT_STATUS = status;

  document.querySelectorAll('.nav-link').forEach(b =>
    b.classList.toggle('active', b.dataset.status === status)
  );

  loadData();
}

/* ======================
   LOAD DATA
====================== */
async function loadData() {
  const tb = document.getElementById('tb');
  const card = document.getElementById('cardView');

  tb.innerHTML = '';
  card.innerHTML = '';

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
    card.innerHTML =
      `<div class="text-center text-muted">
        ไม่มีข้อมูล
      </div>`;
    return;
  }

  list.forEach(x => {
    renderTable(x);
    renderCard(x);
  });
}

/* ======================
   RENDER DESKTOP
====================== */
function renderTable(x) {
  const tb = document.getElementById('tb');

  tb.innerHTML += `
    <tr class="text-center align-middle">
      <td>${x[1]}</td>
      <td>${x[2]}</td>
      <td>${formatDate(x[0])}</td>
      <td>
        ${
          CURRENT_STATUS === 'SUBMITTED'
            ? `<button class="btn btn-success btn-sm"
                onclick="outDirector('${x[1]}')">
                บันทึกออก ผอ.
              </button>`
            : `
              <div class="small">
                <div>${x[5]}</div>
                ${x[7]
                  ? `<img src="${x[7]}" style="height:60px">`
                  : ''}
              </div>
            `
        }
      </td>
    </tr>
  `;
}

/* ======================
   RENDER MOBILE CARD
====================== */
function renderCard(x) {
  const card = document.getElementById('cardView');

  card.innerHTML += `
    <div class="file-card">
      <div class="code">📁 ${x[1]}</div>

      <div class="label">ผู้เสนอ</div>
      <div class="mb-2">${x[2]}</div>

      ${
        CURRENT_STATUS === 'SUBMITTED'
          ? `
            <button
              class="btn btn-success w-100"
              onclick="outDirector('${x[1]}')">
              บันทึกออกจากห้อง ผอ.
            </button>
          `
          : `
            <div class="label mt-2">ผู้รับแฟ้ม</div>
            <div>${x[5]}</div>

            ${
              x[7]
                ? `<img src="${x[7]}"
                     class="img-fluid mt-2 border rounded">`
                : ''
            }
          `
      }
    </div>
  `;
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
  return d
    ? new Date(d).toLocaleDateString('th-TH')
    : '-';
}
