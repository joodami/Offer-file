const GAS = 'https://script.google.com/macros/s/AKfycbycd0jLtPDxF17tZc4QGMGgLQktURjuJ_Q6SlFNA__wU-IRQKtfmVc6AtWqv-Lr5mkCpA/exec';

fetch(GAS + '?action=dashboard')
  .then(r => r.json())
  .then(x => {
    d.innerHTML = `
      <div class="col-md-4">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h5>📁 แฟ้มทั้งหมด</h5>
            <h2 class="text-primary">${x.total}</h2>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h5>⏳ รอผู้อำนวยการ</h5>
            <h2 class="text-warning">${x.waiting}</h2>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h5>✅ เสร็จสิ้น</h5>
            <h2 class="text-success">${x.done}</h2>
          </div>
        </div>
      </div>
    `;
  });
