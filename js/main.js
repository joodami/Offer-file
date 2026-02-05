const GAS_URL =
  'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

let CURRENT_STATUS = 'SUBMITTED';

document.addEventListener('DOMContentLoaded', async () => {

  const params = new URLSearchParams(location.search);
  const fid = params.get('fid');

  // =========================
  // 🔍 กรณีสแกน QR (ผู้เสนอ)
  // =========================
  if (fid) {
    try {
      const res = await fetch(
        GAS_URL + '?action=scan&fid=' + encodeURIComponent(fid)
      );
      const r = await res.json();

      if (!r.success) {
        location.replace('index.html');
        return;
      }

      // 🔁 redirect ตามสถานะ
      switch (r.status) {
        case 'NEW':
          location.replace('register.html?fid=' + fid);
          return;

        case 'SUBMITTED':
          showTab('SUBMITTED');
          break;

        case 'APPROVED':
          showTab('APPROVED');
          break;

        case 'RECEIVED':
          showTab('RECEIVED');
          break;

        default:
          showTab('SUBMITTED');
      }

    } catch (e) {
      console.error(e);
      location.replace('index.html');
      return;
    }
  }

  // =========================
  // 📋 โหลดข้อมูลปกติ
  // =========================
  loadData();
});

/* =========================
   TAB CONTROL
========================= */
function showTab(status) {
  CURRENT_STATUS = status;

  document.querySelectorAll('#statusTabs .nav-link')
    .forEach(tab => {
      tab.classList.toggle(
        'active',
        tab.dataset.status === status
      );
    });

  loadData();
}

/* =========================
   LOAD DATA
========================= */
async function loadData() {
  const tb = document.getElementById('tb');
  const card = document.getElementById('cardView');

  tb.innerHTML = '';
  card.innerHTML = '';

  const res = await fetch(GAS_URL + '?action=getData');
  const data = await res.json();

  const list = data.filter(x => x[3] === CURRENT_STATUS);

  if (!list.length) {
    tb.innerHTML =
      `<tr><td colspan="4" class="text-center text-muted">
        ไม่มีข้อมูล
      </td></tr>`;

    card.innerHTML =
      `<div class="text-center text-muted mt-3">
        ไม่มีข้อมูล
      </div>`;
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
      <div class="file-card">
        <div class="code">📁 ${x[1]}</div>
        <div class="label">ผู้เสนอ</div>
        <div>${x[2]}</div>
        <div class="mt-2">
          <span class="badge bg-secondary">${x[3]}</span>
        </div>
      </div>
    `;
  });
}
