const GAS = 'https://script.google.com/macros/s/AKfycbycd0jLtPDxF17tZc4QGMGgLQktURjuJ_Q6SlFNA__wU-IRQKtfmVc6AtWqv-Lr5mkCpA/exec';

function login() {
  const btn = event.target;
  btn.disabled = true;
  btn.innerHTML = `
    <span class="spinner-border spinner-border-sm"></span>
    กำลังเข้าสู่ระบบ...
  `;

  fetch(GAS, {
    method: 'POST',
    body: JSON.stringify({
      action: 'staffLogin',
      phone: phone.value
    })
  })
  .then(res => res.json())
  .then(r => {
    btn.disabled = false;
    btn.innerHTML = 'เข้าสู่ระบบ';

    if (r.allow) {
      loginBox.style.display = 'none';
      staffBox.style.display = 'block';
      staffName.innerText = '👩‍💼 ' + r.name;
      loadData();
    } else {
      msg.innerText = '❌ ไม่มีสิทธิ์';
    }
  });
}


function loadData() {
  fetch(GAS + '?action=getData')
    .then(res => res.json())
    .then(data => {
      const tb = document.getElementById('tb');
      tb.innerHTML = '';

      data
        .filter(row => row[3] === 'เสนอแฟ้มต่อผู้อำนวยการ')
        .forEach(row => {
          tb.innerHTML += `
            <tr>
              <td>${row[1]}</td>
              <td><input type="date" id="d${row[1]}"></td>
              <td>
                <button onclick="updateOut('${row[1]}')">บันทึก</button>
              </td>
            </tr>
          `;
        });

      if (!tb.innerHTML) {
        tb.innerHTML = `<tr><td colspan="3">ไม่มีแฟ้มรออัปเดต</td></tr>`;
      }
    });
}

function updateOut(code) {
  const outDate = document.getElementById('d' + code).value;

  if (!outDate) {
    alert('กรุณาเลือกวันที่ออกจาก ผอ.');
    return;
  }

  fetch(GAS, {
    method: 'POST',
    body: JSON.stringify({
      action: 'outDirector',
      code: code,
      outDate: outDate
    })
  })
  .then(() => {
    alert('อัปเดตเรียบร้อย');
    loadData();
  });
}
