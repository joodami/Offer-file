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
  document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));

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
}

/* OUT FROM DIRECTOR */
function loadOut() {
  fetch(GAS + '?action=getData')
    .then(r => r.json())
    .then(data => {
      tbOut.innerHTML = '';

      const list = data.filter(r => r[3] === 'เสนอแฟ้มต่อผู้อำนวยการ');

      if (!list.length) {
        tbOut.innerHTML = `<tr><td colspan="5" class="text-center">ไม่มีข้อมูล</td></tr>`;
        return;
      }

      list.forEach(r => {
        tbOut.innerHTML += `
          <tr>
            <td class="text-center">${r[1]}</td>
            <td>${r[0]}</td>
            <td>${r[2]}</td>
            <td>
              <input type="date" class="form-control" id="d${r[1]}">
            </td>
            <td class="text-center">
              <button class="btn btn-success btn-sm"
                onclick="updateOut('${r[1]}')">บันทึก</button>
            </td>
          </tr>`;
      });
    });
}

/* RECEIVE */
function loadReceive() {
  fetch(GAS + '?action=getData')
    .then(r => r.json())
    .then(data => {
      tbReceive.innerHTML = '';

      const list = data.filter(r => r[3] === 'รับแฟ้มคืนเรียบร้อยแล้ว');

      if (!list.length) {
        tbReceive.innerHTML = `<tr><td colspan="5" class="text-center">ไม่มีข้อมูล</td></tr>`;
        return;
      }

      list.forEach(r => {
        tbReceive.innerHTML += `
          <tr>
            <td class="text-center">${r[1]}</td>
            <td>${r[2]}</td>
            <td>${r[6]}</td>
            <td>${r[5]}</td>
            <td class="text-center">
              <button class="btn btn-secondary btn-sm"
                onclick="closeJobFront('${r[1]}')">ปิดงาน</button>
            </td>
          </tr>`;
      });
    });
}

/* UPDATE OUT */
function updateOut(code) {
  fetch(GAS, {
    method: 'POST',
    body: JSON.stringify({
      action: 'outDirector',
      code,
      outDate: document.getElementById('d' + code).value
    })
  }).then(() => loadOut());
}

/* CLOSE JOB */
function closeJobFront(code) {
  if (!confirm('ยืนยันปิดงาน')) return;

  fetch(GAS, {
    method: 'POST',
    body: JSON.stringify({
      action: 'closeJob',
      code
    })
  }).then(() => loadReceive());
}
