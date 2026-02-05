const GAS_URL = 'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

let CURRENT_STATUS = 'SUBMITTED';

document.addEventListener('DOMContentLoaded', async () => {

  const fid = new URLSearchParams(location.search).get('fid');

  // 🔍 กรณีสแกน QR
  if (fid) {
    try {
      const r = await fetch(GAS_URL + '?action=scan&fid=' + encodeURIComponent(fid));
      const j = await r.json();

      if (j.success) {
        if (j.status === 'NEW') {
          location.replace('register.html?fid=' + fid);
          return;
        }

        if (['SUBMITTED', 'APPROVED', 'RECEIVED'].includes(j.status)) {
          showTab(j.status);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  loadData();
});

/* =========================
   TAB CONTROL
========================= */
function showTab(status) {
  CURRENT_STATUS = status;

  document.querySelectorAll('.nav-link')
    .forEach(b => {
      b.classList.toggle(
        'active',
        b.dataset.status === status
      );
    });

  loadData();
}

/* =========================
   LOAD DATA
========================= */
async function loadData() {
  const res = await fetch(GAS_URL + '?action=getData');
  const data = await res.json();

  const tb = document.getElementById('tb');
  const card = document.getElementById('cardView');

  tb.innerHTML = '';
  card.innerHTML = '';

  const list = data.filter(x => x[3] === CURRENT_STATUS);

  if (!list.length) {
    tb.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted">
          ไม่มีข้อมูล
        </td>
      </tr>
    `;
    card.innerHTML = `
      <div class="text-center text-muted p-3">
        ไม่มีข้อมูล
      </div>
    `;
    return;
  }

  list.forEach(x => {
    // Desktop
    tb.innerHTML += `
      <tr class="text-center">
        <td>${x[1]}</td>
        <td>${x[2]}</td>
        <td>
          <span class="badge bg-secondary">${x[3]}</span>
        </td>
        <td>${new Date(x[0]).toLocaleDateString('th-TH')}</td>
      </tr>
    `;

    // Mobile
    card.innerHTML += `
      <div class="file-card card mb-2 shadow-sm">
        <div class="card-body">
          <div class="fw-semibold mb-1">📁 ${x[1]}</div>
          <div class="small text-muted">ผู้เสนอ</div>
          <div>${x[2]}</div>
          <span class="badge bg-secondary mt-2">${x[3]}</span>
        </div>
      </div>
    `;
  });
}
