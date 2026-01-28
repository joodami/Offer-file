const GAS = 'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

const loginBox = document.getElementById('loginBox');
const staffBox = document.getElementById('staffBox');

const tableOut = document.getElementById('tableOut');
const tableReceive = document.getElementById('tableReceive');
const tbOut = document.getElementById('tbOut');
const tbReceive = document.getElementById('tbReceive');

/* Login */
function login(e) {
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
      return;
    }
    loginBox.classList.add('d-none');
    staffBox.classList.remove('d-none');
    showTab('out');
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
      loadOut();
    } else {
      document.querySelectorAll('.nav-link')[1].classList.add('active');
      tableReceive.classList.remove('d-none');
      tableOut.classList.add('d-none');
      loadReceive();
    }
  }, 200);
}


/* OUT FROM DIRECTOR */
function loadOut() {
  showLoading('กำลังโหลดแฟ้มรอออกจากห้อง ผอ.');

  fetch(GAS + '?action=getData')
    .then(r => r.json())
    .then(data => {
      tbOut.innerHTML = '';

      const list = data.filter(r => r[3] === 'เสนอแฟ้มต่อผู้อำนวยการ');

      if (!list.length) {
        tbOut.innerHTML = `
          <tr>
            <td colspan="5" class="text-center text-muted p-4">
              ไม่มีข้อมูล
            </td>
          </tr>`;
        return;
      }

      list.forEach(r => {
        tbOut.innerHTML += `
          <tr>
            <td class="text-center">${r[1]}</td>
            <td class="text-start">${formatDateTH(r[0])}</td>
            <td class="text-start">${r[2]}</td>
            <td>
              <input type="date"
                     class="form-control"
                     id="d${r[1]}">
            </td>
            <td class="text-center">
              <button class="btn btn-success btn-sm"
                      onclick="updateOut('${r[1]}', this)">
                บันทึก
              </button>
            </td>
          </tr>
        `;
      });
    })
    .catch(err => {
      tbOut.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-danger p-4">
            เกิดข้อผิดพลาดในการโหลดข้อมูล
          </td>
        </tr>`;
      console.error(err);
    })
    .finally(() => {
      hideLoading();
    });
}

/* RECEIVE */
function loadReceive() {
  showLoading('กำลังโหลดแฟ้มรับคืน');

  fetch(GAS + '?action=getData')
    .then(r => r.json())
    .then(data => {
      tbReceive.innerHTML = '';

      const list = data.filter(r => r[3] === 'รับแฟ้มคืนเรียบร้อยแล้ว');

      if (!list.length) {
        tbReceive.innerHTML = `
          <tr>
            <td colspan="5" class="text-center text-muted p-4">
              ไม่มีข้อมูล
            </td>
          </tr>`;
        return;
      }

      list.forEach(r => {
        tbReceive.innerHTML += `
          <tr>
            <td class="text-center">${r[1]}</td>
            <td class="text-start">${r[2]}</td>
            <td class="text-start">${formatDateTH(r[6])}</td>
            <td class="text-start">${r[5]}</td>
            <td class="text-center">
              <button class="btn btn-secondary btn-sm"
                      onclick="closeJobFront('${r[1]}', this)">
                ปิดงาน
              </button>
            </td>
          </tr>
        `;
      });
    })
    .catch(err => {
      tbReceive.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-danger p-4">
            เกิดข้อผิดพลาดในการโหลดข้อมูล
          </td>
        </tr>`;
      console.error(err);
    })
    .finally(() => {
      hideLoading();
    });
}


/* UPDATE OUT */
function updateOut(code, btn) {
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

  fetch(GAS, {
    method: 'POST',
    body: JSON.stringify({
      action: 'outDirector',
      code,
      outDate: document.getElementById('d' + code).value
    })
  })
  .then(() => {
    showToast('บันทึกเรียบร้อย');
    loadOut();
  });
}


/* CLOSE JOB */
let closeJobCode = '';
let closeJobBtn = null;

function closeJobFront(code, btn) {
  closeJobCode = code;
  closeJobBtn = btn;

  document.getElementById('closeJobCode').innerText = code;

  const modal = new bootstrap.Modal(
    document.getElementById('confirmCloseModal')
  );
  modal.show();
}


function formatDateTH(dateValue) {
  if (!dateValue) return '-';

  const d = new Date(dateValue);
  if (isNaN(d)) return '-';

  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function showLoading(text = 'กำลังประมวลผล...') {
  const box = document.getElementById('globalLoading');
  box.querySelector('.fw-medium').innerText = text;
  box.classList.remove('d-none');
}

function hideLoading() {
  document.getElementById('globalLoading').classList.add('d-none');
}


document.getElementById('confirmCloseBtn')
  .addEventListener('click', () => {

    const btn = closeBtnRef;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

    bootstrap.Modal
      .getInstance(document.getElementById('confirmCloseModal'))
      .hide();

    showLoading('กำลังปิดงาน');

    fetch(GAS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'closeJob',
        code: closeCode
      })
    })
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        showToast('ปิดงานเรียบร้อย');
        loadReceive();
      } else {
        showToast(res.message || 'ปิดงานไม่สำเร็จ', false);
        btn.disabled = false;
        btn.innerHTML = 'ปิดงาน';
      }
    })
    .catch(err => {
      console.error(err);
      showToast('เกิดข้อผิดพลาด', false);
      btn.disabled = false;
      btn.innerHTML = 'ปิดงาน';
    })
    .finally(() => {
      hideLoading();
    });
  });

