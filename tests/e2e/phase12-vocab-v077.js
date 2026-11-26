// v19.0（Chromium 模擬，不是真機）：1000 詞新詞彙匯入——全部預設啟用、分類／Level 兩區下拉、依 Level 與分類實際開始練習
const {chromium}=require('playwright');let P=0,F=0;const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
(async()=>{const b=await chromium.launch();const pg=await (await b.newContext({viewport:{width:820,height:1000}})).newPage();const errs=[],bad=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('response',r=>{if(r.status()>=400&&!/default-library/.test(r.url()))bad.push(r.status()+' '+r.url())});
await pg.goto('http://localhost:'+(process.env.E2E_PORT||8124)+'/1124-1-TEST/');
await pg.waitForFunction(()=>typeof LIB!=='undefined'&&LIB.base&&S&&S.cards.filter(c=>c.lib).length>=950,null,{timeout:60000});await pg.waitForTimeout(1500);
const r=await pg.evaluate(()=>({base:LIB.base.length,lv:LIB.lvs.length,cat:LIB.cats.length,en:S.cards.filter(c=>c.lib).length,noimg:S.cards.filter(c=>c.lib&&!(c.imgs&&c.imgs.length)).length,lvc:S.cats.filter(c=>c.lvl).length}));
T('新詞彙自動啟用：1000 詞、16 分類、20 Level；啟用 950 張且都有圖',r.base===1000&&r.lv===20&&r.cat===16&&r.en===950&&r.noimg===0&&r.lvc===20,r);
await pg.evaluate(()=>{window.confirm=()=>true;window.alert=m=>{window.__al=m};S.set.music=false;S.set.sound=false;S.set.anim=false;S.set.ap=false;V2.prepDone=true;save();UI.pick&&UI.pick('quiet')});
await pg.evaluate(()=>{FL.open(1)});await pg.waitForSelector('#fl_cat',{state:'attached'});
const o=await pg.$$eval('#fl_cat option',x=>x.map(e=>({t:e.textContent,d:e.disabled,v:e.value})));
const iC=o.findIndex(e=>e.d&&/依分類/.test(e.t)),iL=o.findIndex(e=>e.d&&/依 Level/.test(e.t));
T('同一個下拉選單分成「全部／依分類／依 Level」三段',o[0].v==='all'&&iC>0&&iL>iC&&o.slice(iC+1,iL).length>=16&&o.slice(iL+1).filter(e=>/^c:/.test(e.v)).length===20,o.length);
T('Level 選項顯示名稱與張數（例：Level 01｜…（42張））',o.some(e=>/Level 01｜.+（\d+張）/.test(e.t)));
// 依 Level 開始練習
const lv=await pg.evaluate(()=>{const c=S.cats.find(c=>c.libId==='LV02');return{id:c.id,n:S.cards.filter(x=>x.cats.includes(c.id)).length}});
await pg.evaluate(v=>{const e=document.getElementById('fl_cat');e.value=v;e.dispatchEvent(new Event('change'))},'c:'+lv.id);
const src=await pg.evaluate(()=>({src:FL.mem().cat}));
T('選 Level 02 後練習範圍記住該 Level',src.src==='c:'+lv.id,src);
await pg.evaluate(id=>{S.set.src='c:'+id;save()},lv.id);
const pl=await pg.evaluate(()=>{const p=pool();return{n:p.length,allIn:p.every(c=>c.cats.some(k=>k===S.set.src.slice(2)))}});
T('依 Level 出題範圍只含該級的圖卡',pl.n===lv.n&&pl.allIn&&pl.n>0,pl);
await pg.evaluate(()=>{try{startRound()}catch(e){window.__e=e.message}});await pg.waitForTimeout(1500);
const g=await pg.evaluate(()=>({e:window.__e||'',inGame:!!document.querySelector('#app')&&!!G&&!!G.cur||!!G,q:G&&G.q?1:0}));
T('依 Level 實際開始練習，沒有錯誤',!g.e&&errs.length===0,{g,errs});
await pg.evaluate(()=>{try{leave()}catch(e){}});
// 依分類
const cat=await pg.evaluate(()=>{const c=S.cats.find(c=>c.libId==='CAT01'||(c.lib&&!c.lvl));return{id:c.id,n:S.cards.filter(x=>x.cats.includes(c.id)).length}});
await pg.evaluate(id=>{S.set.src='c:'+id;save()},cat.id);
const pc=await pg.evaluate(()=>pool().length);
T('依分類出題範圍正確',pc===cat.n&&pc>0,{pc,cat});
// 首頁下拉
await pg.evaluate(()=>{try{leave()}catch(e){}home()});const h=await pg.evaluate(()=>[...document.querySelectorAll('select')].some(s=>/依 Level/.test(s.innerHTML)));
T('首頁的選擇分類下拉也分兩區',h);
// 後台詞彙庫 Level 篩選
await pg.evaluate(()=>{tab(2);sub='lib';tch()});await pg.waitForFunction(()=>/內建詞彙庫/.test(document.querySelector('#sp').innerText),null,{timeout:15000});
const f=await pg.evaluate(()=>[...document.querySelectorAll('#sp select')].some(s=>/全部 Level/.test(s.innerHTML)));
T('後台詞彙庫有 Level 篩選',f);
await pg.evaluate(()=>LIB.set('lv','LV05'));await pg.waitForTimeout(300);
T('Level 篩選只列該級 50 詞',await pg.evaluate(()=>LIB.list().length===50&&LIB.list().every(w=>w.lvId==='LV05')));
T('沒有任何資源 404',bad.length===0,bad.slice(0,3));
console.log('P',P,'F',F);await b.close();
})();
