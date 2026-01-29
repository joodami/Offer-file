const GAS = 'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';
const d = document.getElementById('d');

/* Loading (Mobile-friendly) */
d.innerHTML = `
  <div class="col-12">
    <div class="card shadow-sm p-4 text-center text-muted">
      <div class="spinner-border text-primary mb-2"></div>
      <div>กำลังโหลดข้อมูล...</div>
    </div>
  </div>
`;

fetch(GAS + '?action=dashboard')
  .then(r => r.json())
  .then(x => {
    d.innerHTML = `
      <div class="col-12 col-md-4">
        <div class="card shadow-sm text-center h-100">
          <div class="card-body py-4">
            <h6 class="text-muted">📁 แฟ้มทั้งหมด</h6>
            <h1 class="fw-bold text-primary dashboard-num">
              ${x.total}
            </h1>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="card shadow-sm text-center h-100">
          <div class="card-body py-4">
            <h6 class="text-muted">⏳ รอผู้อำนวยการ</h6>
            <h1 class="fw-bold text-warning dashboard-num">
              ${x.waiting}
            </h1>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="card shadow-sm text-center h-100">
          <div class="card-body py-4">
            <h6 class="text-muted">✅ เสร็จสิ้น</h6>
            <h1 class="fw-bold text-success dashboard-num">
              ${x.done}
            </h1>
          </div>
        </div>
      </div>
    `;
  });
