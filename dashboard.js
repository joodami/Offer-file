fetch(GAS+'?action=dashboard').then(r=>r.json()).then(x=>{
 d.innerHTML=`
 <h3>ทั้งหมด ${x.total}</h3>
 <h3>รอ ผอ. ${x.waiting}</h3>
 <h3>เสร็จแล้ว ${x.done}</h3>`;
});
