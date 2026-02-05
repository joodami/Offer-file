/* =========================
   CONFIG
========================= */
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

/* =========================
   AUTO CHECK LOGIN
========================= */
document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('staffLogin') === '1') {
    showStaff();
    loadData();
  }
});

/* =========================
   LOGIN
========================= */
async function login() {
  const phone = document.getElementById('phone').value.trim();
  const msg = document.getElementById('msg');

  if (!phone) {
    msg.innerText = 'กรุณากรอกเบอร์โทรศัพท์';
    return;
  }

  msg.innerText = 'กำลังตรวจสอบ...';

  const r = await post('staffLogin', { phone });

  if (!r.success) {
    msg.innerText = 'ไม่พบสิทธิ์เจ้าหน้าที่';
    return;
  }

  sessionStorage.setItem('staffLogin', '1');
  showStaff();
  loadData();
}

/* =========================
   LOGOUT
========================= */
function logout() {
  sessionStorage.removeItem('staffLogin');
  location.reload();
}

/* =========================
   UI
========================= */
function showStaff() {
  document.getElementById('loginBox').classList.add('d-none');
  document.getElementById('staffBox').classList.remove('d-none');
}

/* =========================
   LOAD DATA
========================= */
async function loadData() {
  const tb = document.getElementById('tb');
  tb.innerHTML = `<tr><td colspan="5" class="text-center">กำลังโหลด...</td></tr>`;

  const data = await fetch(GAS_URL + '?action=getData')
    .then(r => r.json());

  tb.innerHTML = '';

  data
    .filter(r => r[3] === 'SUBMITTED')
    .forEach(r => {
      tb.innerHTML += `
        <tr>
          <td class="text-center">${r[1]}</td>
          <td>${r[2]}</td>
          <td class="text-center">เสนอ ผอ.</td>
          <td>
            <input type="date" class="form-control">
          </td>
          <td class="text-center">
            <button class="btn btn-success btn-sm"
              onclick="outDirector('${r[1]}', this)">
              บันทึก
            </button>
          </td>
        </tr>
      `;
    });
}

/* =========================
   OUT DIRECTOR
========================= */
async function outDirector(code, btn) {
  const tr = btn.closest('tr');
  const date = tr.querySelector('input').value;

  if (!date) {
    alert('กรุณาเลือกวันที่');
    return;
  }

  btn.disabled = true;

  const r = await post('outDirector', {
    code,
    outDate: date
  });

  if (r.success) {
    loadData();
  } else {
    alert('บันทึกไม่สำเร็จ');
  }

  btn.disabled = false;
}

/* =========================
   POST HELPER
========================= */
async function post(action, data) {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...data })
  });
  return res.json();
}
