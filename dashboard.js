const GAS = 'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';
const d = document.getElementById('d');

fetch(GAS + '?action=dashboard')
  .then(r => r.json())
  .then(x => {
    d.innerHTML = `
      <div class="col-12 col-md-4">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h5>📁 แฟ้มทั้งหมด</h5>
            <h2 class="text-primary dashboard-num">${x.total}</h2>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h5>⏳ รอผู้อำนวยการ</h5>
            <h2 class="text-warning dashboard-num">${x.waiting}</h2>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h5>✅ เสร็จสิ้น</h5>
            <h2 class="text-success dashboard-num">${x.done}</h2>
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
