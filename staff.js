const GAS = 'https://script.google.com/macros/s/AKfycbycd0jLtPDxF17tZc4QGMGgLQktURjuJ_Q6SlFNA__wU-IRQKtfmVc6AtWqv-Lr5mkCpA/exec';

window.onload = () => {
  google.accounts.id.initialize({
    client_id: 'GOOGLE_CLIENT_ID_ของคุณ',
    callback: handleLogin
  });

  google.accounts.id.renderButton(
    document.getElementById('login'),
    { theme: 'outline', size: 'large' }
  );
};

function handleLogin(response) {
  const payload = JSON.parse(atob(response.credential.split('.')[1]));
  const email = payload.email;

  // ส่งอีเมลไปตรวจสอบกับ GAS
  fetch(GAS, {
    method: 'POST',
    body: JSON.stringify({
      action: 'checkStaff',
      email: email
    })
  })
  .then(res => res.json())
  .then(result => {
    if (result.allow) {
      document.getElementById('staffTable').style.display = 'table';
      loadData();
    } else {
      document.getElementById('noAccess').style.display = 'block';
    }
  });
}

function loadData() {
  fetch(GAS + '?action=getData')
    .then(res => res.json())
    .then(data => {
      tb.innerHTML = '';

      data
        .filter(row => row[3] === 'เสนอแฟ้มต่อผู้อำนวยการ')
        .forEach(row => {
          tb.innerHTML += `
            <tr>
              <td>${row[1]}</td>
              <td>
                <input type="date" id="d${row[1]}">
              </td>
              <td>
                <button onclick="updateOut('${row[1]}')">
                  บันทึก
                </button>
              </td>
            </tr>
          `;
        });

      if (tb.innerHTML === '') {
        tb.innerHTML = `
          <tr>
            <td colspan="3">ไม่มีแฟ้มรออัปเดต</td>
          </tr>
        `;
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
