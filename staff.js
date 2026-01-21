const GAS = 'https://script.google.com/macros/s/AKfycbycd0jLtPDxF17tZc4QGMGgLQktURjuJ_Q6SlFNA__wU-IRQKtfmVc6AtWqv-Lr5mkCpA/exec';

function login() {
  const phone = document.getElementById('phone').value.trim();
  const msg = document.getElementById('msg');

  if (!phone) {
    msg.innerText = 'กรุณากรอกเบอร์โทรศัพท์';
    return;
  }

  fetch(GAS, {
    method: 'POST',
    body: JSON.stringify({
      action: 'staffLogin',
      phone: phone
    })
  })
  .then(res => res.json())
  .then(r => {
    if (r.allow) {
      document.getElementById('loginBox').style.display = 'none';
      document.getElementById('staffBox').style.display = 'block';
      document.getElementById('staffName').innerText = '👩‍💼 ' + r.name;
      loadData();
    } else {
      msg.innerText = '❌ เบอร์โทรนี้ไม่มีสิทธิ์ใช้งาน';
    }
  })
  .catch(err => {
    console.error(err);
    msg.innerText = 'เกิดข้อผิดพลาดในการเชื่อมต่อระบบ';
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
