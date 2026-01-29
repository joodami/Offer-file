/***********************
 * CONFIG
 ***********************/
const GAS = 'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

/***********************
 * CACHE
 ***********************/
let STAFF_CACHE = null;
let STAFF_CACHE_TIME = 0;
const CACHE_TTL = 60 * 1000; // 1 นาที

function getStaffData(force = false) {
  const now = Date.now();

  if (!force && STAFF_CACHE && (now - STAFF_CACHE_TIME < CACHE_TTL)) {
    return Promise.resolve(STAFF_CACHE);
  }

  return fetch(GAS + '?action=getData')
    .then(r => r.json())
    .then(data => {
      STAFF_CACHE = data;
      STAFF_CACHE_TIME = Date.now();
      return data;
    });
}

/***********************
 * ELEMENTS
 ***********************/
const loginBox = document.getElementById('loginBox');
const staffBox = document.getElementById('staffBox');

const tableOut = document.getElementById('tableOut');
const tableReceive = document.getElementById('tableReceive');
const tbOut = document.getElementById('tbOut');
const tbReceive = document.getElementById('tbReceive');

const cardOut = document.getElementById('cardOut');
const cardReceive = document.getElementById('cardReceive');

/***********************
 * LOGIN
 ***********************/
function login() {
  const btn = document.getElementById('loginBtn');
  msg.innerText = '';

  btn.disabled = true;
  const oldText = btn.innerHTML;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

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
    .catch(() => {
      msg.innerText = 'เกิดข้อผิดพลาด กรุณาลองใหม่';
      btn.disabled = false;
      btn.innerHTML = oldText;
    });
}

/***********************
 * TAB CONTROL
 ***********************/
function showTab(tab) {
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
}

function showStaffLoading(target) {
  target.innerHTML = `
    <div class="text-center text-muted py-4">
      <span class="spinner-border spinner-border-sm"></span><br>
      กำลังโหลดข้อมูล...
    </div>
  `;
}

/***********************
 * OUT TAB
 ***********************/
function loadOut() {
  tbOut.innerHTML = '';
  showStaffLoading(cardOut);

  getStaffData()
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
            <td>
              <input type="date" class="form-control">
            </td>
            <td class="text-center">
              <button class="btn btn-success btn-sm"
                onclick="updateOut('${r[1]}', this)">บันทึก</button>
            </td>
          </tr>
        `;

        // CARD (MOBILE)
        cardOut.innerHTML += `
          <div class="staff-card">
            <div class="code">📁 ${r[1]}</div>

            <div class="label">วันที่เสนอ</div>
            <div>${formatDateTH(r[0])}</div>

            <div class="label mt-2">ผู้เสนอ</div>
            <div>${r[2]}</div>

            <div class="label mt-3 text-secondary">
              วันที่ออกจากห้อง ผอ. <span class="text-danger">*</span>
            </div>
            <input type="date" class="form-control mt-1">

            <button class="btn btn-success mt-3"
              onclick="updateOut('${r[1]}', this)">บันทึก</button>
          </div>
        `;
      });
    });
}

/***********************
 * RECEIVE TAB
 ***********************/
function loadReceive() {
  tbReceive.innerHTML = '';
  showStaffLoading(cardReceive);

  getStaffData()
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
    });
}

/***********************
 * UPDATE OUT
 ***********************/
function updateOut(code, btn) {
  const wrapper = btn.closest('.staff-card') || btn.closest('tr');
  const dateInput = wrapper.querySelector('input[type="date"]');

  if (!dateInput.value) {
    alert('กรุณาเลือกวันที่ออกจากห้อง ผอ.');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

  fetch(GAS, {
    method: 'POST',
    body: JSON.stringify({
      action: 'outDirector',
      code,
      outDate: dateInput.value
    })
  })
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        showSuccessToast('บันทึกวันที่ออกจากห้อง ผอ. เรียบร้อย');
        STAFF_CACHE = null; // clear cache
        loadOut();
      } else {
        alert(res.message || 'บันทึกไม่สำเร็จ');
      }
    })
    .finally(() => {
      btn.disabled = false;
      btn.innerHTML = 'บันทึก';
    });
}

/***********************
 * CLOSE JOB
 ***********************/
let closeJobCode = '';
let closeJobBtn = null;

function closeJobFront(code, btn) {
  closeJobCode = code;
  closeJobBtn = btn;
  document.getElementById('closeJobCode').innerText = code;
  new bootstrap.Modal(document.getElementById('confirmCloseModal')).show();
}

document.getElementById('confirmCloseBtn').addEventListener('click', () => {
  const modalEl = document.getElementById('confirmCloseModal');
  bootstrap.Modal.getInstance(modalEl).hide();

  closeJobBtn.disabled = true;

  fetch(GAS, {
    method: 'POST',
    body: JSON.stringify({
      action: 'closeJob',
      code: closeJobCode
    })
  })
    .then(() => {
      showSuccessToast('ปิดงานเรียบร้อยแล้ว');
      STAFF_CACHE = null;
      loadReceive();
    });
});

/***********************
 * UTIL
 ***********************/
function formatDateTH(v) {
  if (!v) return '-';
  const d = new Date(v);
  return isNaN(d) ? '-' : d.toLocaleDateString('th-TH');
}

function showSuccessToast(text) {
  const toastEl = document.getElementById('successToast');
  toastEl.querySelector('.toast-body').innerText = '✅ ' + text;
  new bootstrap.Toast(toastEl, { delay: 2000 }).show();
}
