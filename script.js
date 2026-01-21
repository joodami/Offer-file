const GAS_URL = 'https://script.google.com/macros/s/AKfycbycd0jLtPDxF17tZc4QGMGgLQktURjuJ_Q6SlFNA__wU-IRQKtfmVc6AtWqv-Lr5mkCpA/exec';

fetch(`${GAS_URL}?action=getData`)
  .then(res => res.json())
  .then(data => renderTable(data));

function renderTable(data) {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';
  data.forEach(row => {
    tbody.innerHTML += `
      <tr>
        <td>${row[0]}</td>
        <td>${row[1]}</td>
        <td>${row[2]}</td>
        <td>${row[3]}</td>
        <td>
          ${row[3] === 'พิจารณาเรียบร้อยแล้ว'
            ? `<button onclick="receive('${row[1]}')">รับแฟ้มคืน</button>`
            : '-'}
        </td>
      </tr>`;
  });
}

document.getElementById('formAdd').onsubmit = e => {
  e.preventDefault();
  fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({
      action: 'add',
      date: date.value,
      code: code.value,
      sender: sender.value
    })
  }).then(() => location.reload());
};

function receive(code) {
  const receiver = prompt('ผู้รับแฟ้มคืน');
  const signature = prompt('ลงลายมือชื่อ');
  fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({
      action: 'updateStatus',
      code,
      status: 'รับแฟ้มคืนเรียบร้อยแล้ว',
      receiver,
      returnDate: new Date().toLocaleDateString(),
      signature
    })
  }).then(() => location.reload());
}
