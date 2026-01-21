const GAS = 'https://script.google.com/macros/s/AKfycbycd0jLtPDxF17tZc4QGMGgLQktURjuJ_Q6SlFNA__wU-IRQKtfmVc6AtWqv-Lr5mkCpA/exec';

const loginBox = document.getElementById('loginBox');
const staffBox = document.getElementById('staffBox');
const staffName = document.getElementById('staffName');
const tb = document.getElementById('tb');

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
    staffName.innerText = '👩‍💼 ' + r.name;
    loadData();
  });
}

/* โหลดข้อมูล */
function loadData() {
  fetch(GAS + '?action=getData')
    .then(r => r.json())
    .then(data => {
      tb.innerHTML = '';

      const list = data.filter(r => r[3] === 'เสนอแฟ้มต่อผู้อำนวยการ');

      if (!list.length) {
        tb.innerHTML = `
          <tr>
            <td colspan="3" class="text-center text-muted p-4">
              ไม่มีแฟ้มรออัปเดต
            </td>
          </tr>`;
        return;
      }

      list.forEach(r => {
        tb.innerHTML += `
          <tr>
            <td>${r[1]}</td>
            <td><input type="date" class="form-control" id="d${r[1]}"></td>
            <td class="text-center">
              <button class="btn btn-success btn-sm" onclick="updateOut('${r[1]}', this)">
                บันทึก
              </button>
            </td>
          </tr>`;
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
