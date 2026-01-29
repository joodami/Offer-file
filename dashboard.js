const GAS = 'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';
const d = document.getElementById('d');

fetch(GAS + '?action=dashboard')
  .then(r => r.json())
  .then(x => {
d.innerHTML = `
  <div class="col-12 col-md-4">
    <div class="card shadow-sm text-center dashboard-card">
      <div class="card-body">
        <div class="dashboard-icon">📁</div>
        <div class="dashboard-label">แฟ้มทั้งหมด</div>
        <div class="dashboard-num text-primary">${x.total}</div>
      </div>
    </div>
  </div>

  <div class="col-12 col-md-4">
    <div class="card shadow-sm text-center dashboard-card">
      <div class="card-body">
        <div class="dashboard-icon">⏳</div>
        <div class="dashboard-label">รอผู้อำนวยการ</div>
        <div class="dashboard-num text-warning">${x.waiting}</div>
      </div>
    </div>
  </div>

  <div class="col-12 col-md-4">
    <div class="card shadow-sm text-center dashboard-card">
      <div class="card-body">
        <div class="dashboard-icon">✅</div>
        <div class="dashboard-label">เสร็จสิ้น</div>
        <div class="dashboard-num text-success">${x.done}</div>
      </div>
    </div>
  </div>
`;
  })
  .catch(() => {
    d.innerHTML = `
      <div class="col-12 text-center text-danger">
        โหลดข้อมูล dashboard ไม่ได้
      </div>
    `;
  });
