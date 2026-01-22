const GAS = 'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

function login() {
  const phone = document.getElementById('phone').value.trim();

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
      loginBox.style.display = 'none';
      staffBox.style.display = 'block';
      staffName.innerText = '👩‍💼 ' + r.name;
      loadData();
    } else {
      msg.innerText = '❌ เบอร์โทรนี้ไม่มีสิทธิ์ใช้งาน';
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
