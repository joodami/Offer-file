const GAS = 'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

const loginBox = document.getElementById('loginBox');
const staffBox = document.getElementById('staffBox');

const tableOut = document.getElementById('tableOut');
const tableReceive = document.getElementById('tableReceive');
const tbOut = document.getElementById('tbOut');
const tbReceive = document.getElementById('tbReceive');

const cardOut = document.getElementById('cardOut');
const cardReceive = document.getElementById('cardReceive');

/* Login */
function login() {
  const btn = document.getElementById('loginBtn');
  msg.innerText = '';

  // ปิดปุ่ม + แสดง spinner บนปุ่ม
  btn.disabled = true;
  const oldText = btn.innerHTML;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> กำลังเข้าสู่ระบบ`;

  // แสดง Global loading
  showLoading('กำลังตรวจสอบสิทธิ์');

  fetch(GAS, {
    method: 'POST',
    body: JSON.stringify({
      action: 'staffLogin',
      phone: phone.value
    })
  })
  .then(r => r.json())
  .then(r => {
    if (!r.allow) {
      msg.innerText = 'ไม่มีสิทธิ์ใช้งาน';
      btn.disabled = false;
      btn.innerHTML = oldText;
      return;
    }

    loginBox.classList.add('d-none');
    staffBox.classList.remove('d-none');
    showTab('out');
  })
  .catch(err => {
    console.error(err);
    msg.innerText = 'เกิดข้อผิดพลาด กรุณาลองใหม่';
    btn.disabled = false;
    btn.innerHTML = oldText;
  })
  .finally(() => {
    hideLoading();
  });
}

/* Tabs */
function showTab(tab) {
  showLoading('กำลังเปลี่ยนแท็บ');

  setTimeout(() => {
    document.querySelectorAll('.nav-link')
      .forEach(b => b.classList.remove('active'));

    if (tab === 'out') {
      document.querySelectorAll('.nav-link')[0].classList.add('active');
      tableOut.classList.remove('d-none');
      tableReceive.classList.add('d-none');
      cardOut.classList.remove('d-none');
      cardReceive.classList.add('d-none');
      loadOut();
    } else {
      document.querySelectorAll('.nav-link')[1].classList.add('active');
      tableReceive.classList.remove('d-none');
      tableOut.classList.add('d-none');
      cardReceive.classList.remove('d-none');
      cardOut.classList.add('d-none');
      loadReceive();
    }
  }, 200);
}

/* OUT */
function loadOut() {
  showLoading('กำลังโหลดแฟ้มรอออกจากห้อง ผอ.');

  fetch(GAS + '?action=getData')
    .then(r => r.json())
    .then(data => {
      tbOut.innerHTML = '';
      cardOut.innerHTML = '';

      const list = data.filter(r => r[3] === 'เสนอแฟ้มต่อผู้อำนวยการ');

      if (!list.length) {
        tbOut.innerHTML = `<tr><td colspan="5" class="text-center">ไม่มีข้อมูล</td></tr>`;
        cardOut.innerHTML = `<div class="text-center text-muted">ไม่มีข้อมูล</div>`;
        return;
      }

      list.forEach(r => {

        // TABLE
        tbOut.innerHTML += `
          <tr>
            <td class="text-center">${r[1]}</td>
            <td>${formatDateTH(r[0])}</td>
            <td>${r[2]}</td>
            <td><input type="date" class="form-control" id="d${r[1]}"></td>
            <td class="text-center">
              <button class="btn btn-success btn-sm"
                onclick="updateOut('${r[1]}', this)">บันทึก</button>
            </td>
          </tr>
        `;

        // CARD
        cardOut.innerHTML += `
          <div class="staff-card">
            <div class="code">📁 ${r[1]}</div>
            <div class="label">วันที่เสนอ</div>
            <div>${formatDateTH(r[0])}</div>
            <div class="label mt-2">ผู้เสนอ</div>
            <div>${r[2]}</div>
            <input type="date" class="form-control mt-3" id="d${r[1]}">
            <button class="btn btn-success mt-3"
              onclick="updateOut('${r[1]}', this)">บันทึก</button>
          </div>
        `;
      });
    })
    .finally(hideLoading);
}

/* RECEIVE */
function loadReceive() {
  showLoading('กำลังโหลดแฟ้มรับคืน');

  fetch(GAS + '?action=getData')
    .then(r => r.json())
    .then(data => {
      tbReceive.innerHTML = '';
      cardReceive.innerHTML = '';

      const list = data.filter(r => r[3] === 'รับแฟ้มคืนเรียบร้อยแล้ว');

      if (!list.length) {
        tbReceive.innerHTML = `<tr><td colspan="5" class="text-center">ไม่มีข้อมูล</td></tr>`;
        cardReceive.innerHTML = `<div class="text-center text-muted">ไม่มีข้อมูล</div>`;
        return;
      }

      list.forEach(r => {

        tbReceive.innerHTML += `
          <tr>
            <td class="text-center">${r[1]}</td>
            <td>${r[2]}</td>
            <td>${formatDateTH(r[6])}</td>
            <td>${r[5]}</td>
            <td class="text-center">
              <button class="btn btn-secondary btn-sm"
                onclick="closeJobFront('${r[1]}', this)">ปิดงาน</button>
            </td>
          </tr>
        `;

        cardReceive.innerHTML += `
          <div class="staff-card">
            <div class="code">📁 ${r[1]}</div>
            <div class="label">ผู้เสนอ</div>
            <div>${r[2]}</div>
            <div class="label mt-2">วันที่รับคืน</div>
            <div>${formatDateTH(r[6])}</div>
            <div class="label mt-2">ผู้รับคืน</div>
            <div>${r[5]}</div>
            <button class="btn btn-danger mt-3"
              onclick="closeJobFront('${r[1]}', this)">ปิดงาน</button>
          </div>
        `;
      });
    })
    .finally(hideLoading);
}

/* CLOSE JOB */
let closeJobCode = '';
let closeJobBtn = null;

function closeJobFront(code, btn) {
  closeJobCode = code;
  closeJobBtn = btn;
  document.getElementById('closeJobCode').innerText = code;
  new bootstrap.Modal(document.getElementById('confirmCloseModal')).show();
}

document.getElementById('confirmCloseBtn').addEventListener('click', () => {
  closeJobBtn.disabled = true;
  showLoading('กำลังปิดงาน');

  fetch(GAS, {
    method: 'POST',
    body: JSON.stringify({ action: 'closeJob', code: closeJobCode })
  })
  .then(() => loadReceive())
  .finally(hideLoading);
});

function formatDateTH(v) {
  if (!v) return '-';
  const d = new Date(v);
  return isNaN(d) ? '-' : d.toLocaleDateString('th-TH');
}

function showLoading(text) {
  const box = document.getElementById('globalLoading');
  box.querySelector('.fw-medium').innerText = text;
  box.classList.remove('d-none');
}
function hideLoading() {
  document.getElementById('globalLoading').classList.add('d-none');
}

/* UPDATE OUT FROM DIRECTOR */
function updateOut(code, btn) {
  const dateInput = document.getElementById('d' + code);

  if (!dateInput || !dateInput.value) {
    alert('กรุณาเลือกวันที่ออกจากห้อง ผอ.');
    return;
  }

  btn.disabled = true;
  const oldText = btn.innerHTML;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

  showLoading('กำลังบันทึกวันที่ออกจากห้อง ผอ.');

  fetch(GAS, {
    method: 'POST',
    body: JSON.stringify({
      action: 'outDirector',
      code: code,
      outDate: dateInput.value
    })
  })
  .then(r => r.json())
  .then(res => {
    if (res.success) {
      loadOut(); // รีเฟรชรายการ
    } else {
      alert(res.message || 'บันทึกไม่สำเร็จ');
      btn.disabled = false;
      btn.innerHTML = oldText;
    }
  })
  .catch(err => {
    console.error(err);
    alert('เกิดข้อผิดพลาด');
    btn.disabled = false;
    btn.innerHTML = oldText;
  })
  .finally(() => {
    hideLoading();
  });
}

