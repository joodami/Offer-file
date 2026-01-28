const GAS = 'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

const loginBox = document.getElementById('loginBox');
const staffBox = document.getElementById('staffBox');
const staffName = document.getElementById('staffName');
const tb = document.getElementById('tb');
const staffCardView = document.getElementById('staffCardView');

let currentTab = 'out';

/* Toast */
function showToast(msg, success = true) {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').innerText = msg;
  t.className = `toast align-items-center text-bg-${success ? 'success' : 'danger'} border-0`;
  new bootstrap.Toast(t).show();
}

/* Login */
function login(e) {
  const btn = e.target;
  btn.disabled = true;
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
    btn.disabled = false;
    btn.innerHTML = 'เข้าสู่ระบบ';

    if (!r.allow) {
      msg.innerText = '❌ ไม่มีสิทธิ์ใช้งาน';
      return;
    }

    loginBox.classList.add('d-none');
    staffBox.classList.remove('d-none');
    showTab('out');
  });
}

/* Tab */
function showTab(tab) {
  currentTab = tab;

  document.querySelectorAll('.nav-link').forEach(b =>
    b.classList.remove('active')
  );

  if (tab === 'out') {
    document.querySelectorAll('.nav-link')[0].classList.add('active');
    loadData();
  } else {
    document.querySelectorAll('.nav-link')[1].classList.add('active');
    loadReceiveData();
  }
}

/* โหลดข้อมูล : รอออกจาก ผอ. (เดิม ไม่แตะ) */
function loadData() {
  fetch(GAS + '?action=getData')
    .then(r => r.json())
    .then(data => {
      tb.innerHTML = '';
      staffCardView.innerHTML = '';

      const list = data.filter(r => r[3] === 'เสนอแฟ้มต่อผู้อำนวยการ');

      if (!list.length) {
        tb.innerHTML = `
          <tr>
            <td colspan="5" class="text-center text-muted p-4">
              ไม่มีแฟ้มรออัปเดต
            </td>
          </tr>`;
        return;
      }

      list.forEach(r => {
        tb.innerHTML += `
          <tr class="d-none d-md-table-row">
            <td class="text-center">${r[1]}</td>
            <td colspan="3"></td>
            <td class="text-center">
              <input type="date" class="form-control mb-1" id="d${r[1]}">
              <button class="btn btn-success btn-sm w-100"
                      onclick="updateOut('${r[1]}', this)">
                บันทึก
              </button>
            </td>
          </tr>`;
      });
    });
}

/* โหลดข้อมูล : รับแฟ้มคืน / ปิดงาน (แก้ตรงนี้) */
function loadReceiveData() {
  fetch(GAS + '?action=getData')
    .then(r => r.json())
    .then(data => {
      tb.innerHTML = '';
      staffCardView.innerHTML = '';

      const list = data.filter(r =>
        r[3] === 'รับแฟ้มคืนเรียบร้อยแล้ว'
      );

      if (!list.length) {
        tb.innerHTML = `
          <tr>
            <td colspan="5" class="text-center text-muted p-4">
              ไม่มีแฟ้มรอปิดงาน
            </td>
          </tr>`;
        return;
      }

      list.forEach(r => {
        /* Desktop Table */
        tb.innerHTML += `
          <tr class="d-none d-md-table-row">
            <td class="text-center">${r[1]}</td>
            <td class="text-start">${r[2] || '-'}</td>
            <td class="text-start">${r[6] || '-'}</td>
            <td class="text-start">${r[5] || '-'}</td>
            <td class="text-center">
              <button class="btn btn-secondary btn-sm"
                      onclick="closeJobFront('${r[1]}', this)">
                ปิดงาน
              </button>
            </td>
          </tr>`;

        /* Mobile Card */
        staffCardView.innerHTML += `
          <div class="card mb-2 shadow-sm">
            <div class="card-body">
              <div class="fw-bold text-center mb-2">
                📁 รหัสแฟ้ม: ${r[1]}
              </div>
              <div>👤 ผู้เสนอแฟ้ม: ${r[2] || '-'}</div>
              <div>📅 วันที่รับแฟ้มคืน: ${r[6] || '-'}</div>
              <div>📥 ผู้รับแฟ้มคืน: ${r[5] || '-'}</div>
              <button class="btn btn-outline-secondary w-100 mt-2"
                      onclick="closeJobFront('${r[1]}', this)">
                ปิดงาน
              </button>
            </div>
          </div>`;
      });
    });
}

/* บันทึกออกจาก ผอ. */
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
    showToast('อัปเดตสถานะเรียบร้อย');
    loadData();
  });
}

/* ปิดงาน */
function closeJobFront(code, btn) {
  if (!confirm('ยืนยันปิดงานแฟ้มนี้ใช่หรือไม่')) return;

  btn.disabled = true;

  fetch(GAS, {
    method: 'POST',
    body: JSON.stringify({
      action: 'closeJob',
      code
    })
  })
  .then(r => r.json())
  .then(res => {
    if (res.success) {
      showToast('ปิดงานเรียบร้อย');
      loadReceiveData();
    } else {
      showToast(res.message || 'ปิดงานไม่สำเร็จ', false);
      btn.disabled = false;
    }
  });
}
