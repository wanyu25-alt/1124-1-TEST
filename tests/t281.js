// v21.0：多圖詞彙——一個詞彙多張圖、同題內穩定、載入失敗改用其他圖、紀錄以詞彙 ID 為準
const {mk,T,sleep}=require('./t30h.js');
const J=(E,c)=>JSON.parse(E('JSON.stringify('+c+')'));
(async()=>{
 const w=mk({fresh:true,vocab:true});const E=c=>w.eval(c);
 const t0=Date.now();while(Date.now()-t0<12000&&!E('typeof MAT!=="undefined"&&!!LIB.base&&S.cards.filter(c=>c.lib).length>=900'))await sleep(50);await sleep(500);
 T('新學生多圖預設「隨機：每題隨機一張」',E('LIB.mode()')==='random');
 const multi=J(E,'S.cards.filter(c=>c.lib&&c.img&&(c.imgs||[]).length>=2).slice(0,3).map(c=>({id:c.id,n:c.imgs.length}))');
 T('詞彙庫中有多張圖片的詞彙',multi.length>0,multi);
 if(multi.length){
  const id=multi[0].id;
  T('多圖詞彙在教材統計中只算 1 個詞彙、圖片張數為多張',E(`MAT.union(S.cards.find(c=>c.id==='${id}').cats).filter(c=>c.id==='${id}').length`)===1&&E(`MAT.imgN(S.cards.find(c=>c.id==='${id}'))`)>=2);
  const seen=new Set();for(let i=0;i<40;i++){E(`(()=>{G.rid=${i+1};G.i=0;const q=Object.assign({},S.cards.find(c=>c.id==='${id}'));LIB.pick(q);window.__u=q.img;window.__a=q._alts})()`);seen.add(E('window.__u'))}
  T('多次出題：同一詞彙會出現不同圖片',seen.size>=2,[...seen]);
  E(`(()=>{G.rid=999;G.i=0;const q=Object.assign({},S.cards.find(c=>c.id==='${id}'));LIB.pick(q);window.__u1=q.img;const r=Object.assign({},S.cards.find(c=>c.id==='${id}'));LIB.pick(r);window.__u2=r.img;window.__al=q._alts})()`);
  T('同一題內重複呈現圖片穩定（不會換圖）',E('window.__u1')===E('window.__u2'));
  T('保留其他圖片作為載入失敗備援',J(E,'window.__al').length>=1&&!J(E,'window.__al').includes(E('window.__u1')));
 }
 console.log('RESULT done');process.exit(0);
})();
