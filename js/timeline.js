const fid = getParam('fid');
if (!fid) location.href = 'register.html';

(async () => {
  const r = await post('getHistory', { fileId: fid });
  if (!r.success) return;

  const ul = document.getElementById('timeline');
  ul.innerHTML = '';

  r.history.forEach(h => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="time">${new Date(h.date).toLocaleString('th-TH')}</div>
      <div class="title">${h.status}</div>
      <div class="by">โดย ${h.actor || '-'}</div>
      <div class="remark">${h.remark || ''}</div>
    `;
    ul.appendChild(li);
  });
})();
