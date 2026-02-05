const GAS_URL = 'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

let STAFF_PHONE = null;

/* =========================
   INIT
========================= */
document.addEventListener('DOMContentLoaded', checkSession);

async function checkSession() {
  const phone = sessionStorage.getItem('staffPhone');
  if (!phone) return;

  const r = await post('checkStaffSession', { phone });
  if (r.success) {
    STAFF_PHONE = phone;
    showStaff();
  } else {
    sessionStorage.removeItem('staffPhone');
  }
}

/* =========================
   LOGIN
========================= */
async function login() {
  const phone = document.getElementById('phone').value.replace(/\D/g, '');
  if (!phone) {
    alert('กรุณากรอกเบอร์โทร');
    return;
  }

  const r = await post('staffLogin', { phone });

  if (!r.success) {
    alert('ไม่มีสิทธิ์เจ้าหน้าที่');
    return;
  }

  sessionStorage.setItem('staffPhone', phone);
  STAFF_PHONE = phone;
  showStaff();
}

function showStaff() {
  document.getElementById('loginBox').classList.add('d-none');
  document.getElementById('staffBox').classList.remove('d-none');
  document.getElementById('btnLogout').classList.remove('d-none');
}

/* =========================
   LOGOUT
========================= */
document.getElementById('btnLogout').addEventListener('click', () => {
  sessionStorage.removeItem('staffPhone');
  location.reload();
});

/* =========================
   OUT DIRECTOR
========================= */
async function outDirector() {
  if (!STAFF_PHONE) {
    alert('กรุณา login');
    return;
  }

  const code = document.getElementById('fileCode').value.trim();
  const outDate = document.getElementById('outDate').value;

  if (!code || !outDate) {
    alert('กรอกข้อมูลไม่ครบ');
    return;
  }

  const r = await post('outDirector', {
    code,
    outDate,
    phone: STAFF_PHONE
  });

  if (r.success) {
    alert('บันทึกเรียบร้อย');
    document.getElementById('fileCode').value = '';
    document.getElementById('outDate').value = '';
  } else {
    alert('ไม่พบแฟ้ม');
  }
}

/* =========================
   POST
========================= */
async function post(action, data) {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type':'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...data })
  });
  return res.json();
}
