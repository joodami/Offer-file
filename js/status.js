const fid = getParam('fid');
if (!fid) location.href = 'register.html';

(async () => {
  const r = await post('getFileStatus', { fileId: fid });
  if (!r.success) return;

  // redirect ถ้าสถานะเปลี่ยน
  if (r.status === 'SUBMITTED' && !location.href.includes('submit'))
    location.href = 'status_submit.html?fid=' + fid;

  if (r.status === 'APPROVED' && !location.href.includes('approved'))
    location.href = 'status_approved.html?fid=' + fid;

  if (r.status === 'RECEIVED' && !location.href.includes('received'))
    location.href = 'status_received.html?fid=' + fid;
})();
