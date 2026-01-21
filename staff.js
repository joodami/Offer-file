google.accounts.id.initialize({
  client_id: 'GOOGLE_CLIENT_ID',
  callback: ()=>load()
});
google.accounts.id.renderButton(login,{ theme:'outline' });

function load(){
 fetch(GAS+'?action=getData').then(r=>r.json()).then(d=>{
  d.filter(x=>x[3]=='เสนอแฟ้มต่อผู้อำนวยการ').forEach(x=>{
    tb.innerHTML+=`
    <tr>
      <td>${x[1]}</td>
      <td><input type="date" id="d${x[1]}"></td>
      <td><button onclick="save('${x[1]}')">บันทึก</button></td>
    </tr>`;
  });
 });
}

function save(code){
 fetch(GAS,{
  method:'POST',
  body:JSON.stringify({
    action:'outDirector',
    code,
    outDate:document.getElementById('d'+code).value
  })
 }).then(()=>location.reload());
}
