const GAS_URL = 'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

let CURRENT_STATUS = 'SUBMITTED';

document.addEventListener('DOMContentLoaded', async () => {
  // 🔍 กรณี scan QR
  const fid = new URLSearchParams(location.search).get('fid');
  if (fid) {
    const r = await fetch(GAS_URL + '?action=scan&fid=' + fid);
    const j = await r.json();

    if (j.success) {
      if (j.status === 'NEW') location.replace('register.html?fid=' + fid);
      if (j.status === 'SUBMITTED') showTab('SUBMITTED');
      if (j.status === 'APPROVED') showTab('APPROVED');
      if (j.status === 'RECEIVED') showTab('RECEIVED');
    }
  }

  loadData();
});

function showTab(status) {
  CURRENT_STATUS = status;

  document.querySelectorAll('.nav-link')
    .forEach(b => b.classList.remove('active'));

  document.querySelectorAll('.nav-link')
    .forEach(b => {
      if (b.innerText.includes(status === 'SUBMITTED' ? 'เสนอ' :
                               status === 'APPROVED' ? 'พิจารณา' : 'รับแฟ้ม')) {
        b.classList.add('active');
      }
    });

  loadData();
}

async function loadData() {
  const res = await fetch(GAS_URL + '?action=getData');
  const data = await res.json();

  const tb = document.getElementById('tb');
  const card = document.getElementById('cardView');

  tb.innerHTML = '';
  card.innerHTML = '';

  const list = data.filter(x => x[3] === CURRENT_STATUS);

  if (!list.length) {
    tb.innerHTML = `<tr><td colspan="4" class="text-center text-muted">ไม่มีข้อมูล</td></tr>`;
    card.innerHTML = `<div class="text-center text-muted">ไม่มีข้อมูล</div>`;
    return;
  }

  list.forEach(x => {
    tb.innerHTML += `
      <tr class="text-center">
        <td>${x[1]}</td>
        <td>${x[2]}</td>
        <td>${x[3]}</td>
        <td>${new Date(x[0]).toLocaleDateString('th-TH')}</td>
      </tr>
    `;

    card.innerHTML += `
      <div class="file-card">
        <div class="code">📁 ${x[1]}</div>
        <div class="label">ผู้เสนอ</div>
        <div>${x[2]}</div>
        <div class="mt-2 badge bg-secondary">${x[3]}</div>
      </div>
    `;
  });
}
