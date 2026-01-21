/***********************
 * 🔧 ตั้งค่า URL GAS
 ***********************/
const GAS = 'https://script.google.com/macros/s/AKfycbycd0jLtPDxF17tZc4QGMGgLQktURjuJ_Q6SlFNA__wU-IRQKtfmVc6AtWqv-Lr5mkCpA/exec';

/***********************
 * 🔐 Google Login
 ***********************/
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
  // ล็อกอินสำเร็จ → โหลดข้อมูล
  loadData();
}

/***********************
 * 📥 โหลดข้อมูลแฟ้ม
 ***********************/
function loadData() {
  fetch(GAS + '?action=getData')
    .then(res => res.json())
    .then(data => {
      const tb = document.getElementById('tb');
      tb.innerHTML = '';

      // แสดงเฉพาะแฟ้มที่ยังอยู่กับ ผอ.
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
    })
    .catch(err => {
      alert('โหลดข้อมูลไม่สำเร็จ');
      console.error(err);
    });
}

/***********************
 * 📝 อัปเดตวันที่ออกจาก ผอ.
 ***********************/
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
    alert('อัปเดตสถานะเรียบร้อย');
    loadData(); // โหลดข้อมูลใหม่
  });
}
