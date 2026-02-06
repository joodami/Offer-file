const GAS_URL =
  'https://script.google.com/macros/s/AKfycbxl0TS1km8Fzg3CZoqcrqynHkg7pIirNVO9ouvDFTTbvmsBio7e28HOAoOcAqRWpZwz/exec';

let CURRENT_QR_URL = '';
let CURRENT_CODE = '';

document.addEventListener('DOMContentLoaded', () => {
  const fid = new URLSearchParams(location.search).get('fid');

  if (fid) {
    // โหมดเสนอแฟ้ม
    qrCreateBox.classList.add('d-none');
    submitBox.classList.remove('d-none');
    sessionStorage.setItem('fid', fid);
  }
});

/* =========================
   CREATE QR
========================= */
function createQR() {
  const code   = codeInput.value.trim();
  const sender = senderInput.value.trim();

  if (!code || !sender) {
    alert('กรุณากรอกข้อมูลให้ครบ');
    return;
  }

  const fid = crypto.randomUUID();
  CURRENT_CODE = code;

  // 🔴 ใส่ code ไปด้วย
  const scanUrl =
    location.origin +
    location.pathname.replace('register.html', '') +
    `register.html?fid=${fid}&code=${encodeURIComponent(code)}`;

  CURRENT_QR_URL =
    'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' +
    encodeURIComponent(scanUrl);

  qrImg.src = CURRENT_QR_URL;

  qrCreateBox.classList.add('d-none');
  qrBox.classList.remove('d-none');
}


/* =========================
   DOWNLOAD QR
========================= */
function downloadQR() {
  if (!CURRENT_QR_URL) return;

  const a = document.createElement('a');
  a.href = CURRENT_QR_URL;
  a.download = `QR_${CURRENT_CODE}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/* =========================
   SUBMIT FILE
========================= */
async function submitFile() {
  const fid = sessionStorage.getItem('fid');
  const submitDate = submitDate.value;
  const sender = submitSender.value.trim();
  const remark = remark.value.trim();

  if (!submitDate || !sender) {
    alert('กรุณากรอกข้อมูลให้ครบ');
    return;
  }

  const r = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'registerFile',
      fid: fid,
      submitDate: submitDate,
      sender: sender,
      remark: remark
    })
  }).then(r => r.json());

  if (r.success) {
    location.replace('index.html');
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const fid  = params.get('fid');
  const code = params.get('code');

  if (fid && code) {
    qrCreateBox.classList.add('d-none');
    submitBox.classList.remove('d-none');

    showCode.innerText = code;

    sessionStorage.setItem('fid', fid);
    sessionStorage.setItem('code', code);
  }
});

