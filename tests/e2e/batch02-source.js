// v22.3 第02批：教材來源管理（Chromium 模擬；不是真機）
const {chromium}=require('playwright');
const URL='http://localhost:'+(process.env.E2E_PORT||8124)+'/1124-1-TEST/';let P=0,F=0;
const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
const ready=async p=>{await p.waitForFunction(()=>typeof S!=='undefined'&&S.cards&&typeof LIB!=='undefined'&&LIB.base&&S.lrn&&typeof SRC!=='undefined',null,{timeout:60000});await p.waitForTimeout(1200);
 await p.evaluate(()=>{window.confirm=()=>true;window.alert=m=>{window.__al=(window.__al||[]).concat(String(m))};S.set.music=false;S.set.sound=false;V2.prepDone=true})};
const fresh=async(b,vp)=>{const ctx=await b.newContext({viewport:vp||{width:1280,height:800}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(URL);await ready(p);return{ctx,p,errs}};
const reload=async c=>{await c.p.waitForTimeout(600);/* 等 IndexedDB 寫入完成 */await c.p.reload();await ready(c.p)};
/* 在題庫中抽出的題目來源（不開始遊戲） */
const poolOrg=(p,src)=>p.evaluate(src=>{const o=S.set.src;S.set.src=src||'all';try{const a=deck().cards;return{n:a.length,lib:a.filter(c=>c.lib).length,leg:a.filter(c=>MAT.origin(c)==='legacy').length,cus:a.filter(c=>!c.lib&&MAT.origin(c)==='custom').length}}finally{S.set.src=o}},src);
const start=(p,st)=>p.evaluate(st=>{UI.mode='quiet';FL.open(st);const btn=document.querySelector('.fgob'),ok=!!btn&&!btn.disabled,txt=(document.getElementById('mid')||{}).innerText||'';if(ok)FL.go();const q=(G&&G.on&&G.q)||[];
 const r={ok,on:!!(G&&G.on),n:q.length,lib:q.filter(c=>c&&c.lib).length,non:q.filter(c=>c&&!c.lib).map(c=>c.id),txt:txt.slice(0,400)};try{if(G&&G.on){G.on=false;FL.end()}}catch(e){}return r},st);
const addCustom=p=>p.evaluate(async()=>{S.cats.push({id:'cuA',name:'老師的教材A',order:[]});for(let i=0;i<4;i++)S.cards.push({id:'cu_'+i,text:['杯子','書包','雨傘','鉛筆'][i],zy:'ㄅㄟ ˙ㄗ',img:'materials/images/'+(S.cards.find(c=>c.img&&!c.lib)||{img:''}).img.split('/').pop(),audio:'',cats:['cuA'],created:Date.now(),modified:Date.now()});
 S.cards.filter(c=>c.id.startsWith('cu_')).forEach(c=>{const l=S.cards.find(x=>!x.lib&&x.img&&!x.id.startsWith('cu_'));if(l)c.img=l.img});MAT.bump();await save()});
(async()=>{const b=await chromium.launch();
 /* A：預設只使用正式教材 */
 {const c=await fresh(b);const s=await c.p.evaluate(()=>({leg:SRC.on('legacy'),cus:SRC.on('custom'),ex:!!S.matSrc,ver:APP.build,html:LIB.view(),cnt:SRC.count()}));
  T('A1 預設：舊版內建與教師自訂都「未使用」，正式一律使用',!s.leg&&!s.cus&&!s.ex,s.cnt);
  const a=await poolOrg(c.p,'all'),r=await poolOrg(c.p,'rec');T('A2 全部／系統推薦題庫只有正式詞彙（950 有圖）',a.n===950&&a.leg===0&&r.lib===r.n&&r.leg===0,{a,r});
  const g=await start(c.p,1);T('A3 第1站實際出題全部是正式詞彙',g.on&&g.lib===g.n&&g.n>0,g);
  T('A4 教師後臺「教材來源管理」三種來源都列出',/教材來源管理/.test(s.html)&&/正式內建教材/.test(s.html)&&/舊版內建教材/.test(s.html)&&/教師自訂教材/.test(s.html),null);
  T('A5 程式版本不再寫死（教材版本面板、完整性檢查都顯示目前版本 '+s.ver+'）',/^v22\.\d+$/.test(s.ver)&&+s.ver.split('.')[1]>=3&&s.html.includes('程式版本 '+s.ver)&&s.html.includes('（程式 '+s.ver+'）')&&!/v20\.0）/.test(s.html),s.html.match(/程式版本 [^）]*/));
  T('A6 沒有頁面錯誤',c.errs.length===0,c.errs);await c.ctx.close()}
 /* B：啟用／停用舊版內建教材；停用不刪除 */
 {const c=await fresh(b);const before=await c.p.evaluate(()=>({cards:S.cards.length,leg:S.cards.filter(x=>(S.packIds||[]).includes(x.id)).length,cats:S.cats.length}));
  await c.p.evaluate(()=>SRC.set('legacy',1));let a=await poolOrg(c.p,'all');T('B1 啟用舊版後，題庫加入 18 張舊版圖卡',a.leg===before.leg&&a.leg===18&&a.n===968,a);
  const tab=await c.p.evaluate(()=>{UI.mode='quiet';FL.open(1);FL.setRange('pick');FL.setDim('custom');return document.getElementById('mid').innerText});T('B2 學生端「教師自訂教材」分頁列出舊版分類',/水果|交通工具|民生用品|三餐/.test(tab),tab.slice(0,300));
  await c.p.evaluate(()=>SRC.set('legacy',0));await reload(c);a=await poolOrg(c.p,'all');const after=await c.p.evaluate(()=>({cards:S.cards.length,leg:S.cards.filter(x=>(S.packIds||[]).includes(x.id)).length,cats:S.cats.length,saved:S.matSrc.legacy}));
  T('B3 停用並重新整理後：舊版不進題庫，但圖卡與分類全部保留',a.leg===0&&after.cards===before.cards&&after.leg===18&&after.cats===before.cats&&after.saved===0,{a,before,after});
  const tab2=await c.p.evaluate(()=>{UI.mode='quiet';FL.open(1);FL.setRange('pick');FL.setDim('custom');return document.getElementById('mid').innerText});T('B4 停用時學生端說明「沒有啟用」，不列出停用分類',/沒有啟用/.test(tab2)&&!/水果（|民生用品\s/.test(tab2),tab2.slice(0,300));
  await c.ctx.close()}
 /* C：教師自訂教材；預設不使用，啟用後可在自選範圍練習 */
 {const c=await fresh(b);await addCustom(c.p);let a=await poolOrg(c.p,'all');T('C1 新增的教師自訂圖卡預設不進入題庫',a.cus===0,a);
  await c.p.evaluate(()=>SRC.set('custom',1));a=await poolOrg(c.p,'all');T('C2 啟用教師自訂後可以出題',a.cus===4,a);
  const g=await c.p.evaluate(()=>{UI.mode='quiet';FL.open(2);FL.setRange('pick');FL.setDim('custom');FL.selNone('custom');FL.togCat('custom','cuA',true);FL.setW('all');FL.go();const q=(G.q||[]).map(x=>x.id);try{G.on=false;FL.end()}catch(e){}return q});
  T('C3 自選「老師的教材A」→ 題目都來自該分類',g.length>0&&g.every(id=>id.startsWith('cu_')),g);
  /* D：範圍指向已停用來源 → 自動改用正式教材並說明；重新啟用後原選擇還在 */
  await c.p.evaluate(()=>SRC.set('custom',0));const d=await c.p.evaluate(()=>{UI.mode='quiet';FL.open(2);const m=FL.mem(),t=document.getElementById('mid').innerText,chk=FL.cur().chk;return{dim:m.dim,keep:(m.sel.custom||[]).includes('cuA'),t:t.slice(0,600),ok:chk.ok,n:chk.n}});
  T('D1 範圍只選了已停用來源 → 自動改用正式主題，仍可練習',d.dim==='theme'&&d.ok&&d.n>0,d);T('D2 畫面說明來源已停用',/沒有啟用/.test(d.t),d.t);T('D3 原本的自訂範圍選擇保留（重新啟用後可選回）',d.keep,d);
  await c.ctx.close()}
 /* E：保護正式詞彙、主題、Level */
 {const c=await fresh(b);await addCustom(c.p);const e=await c.p.evaluate(async()=>{if(!document.getElementById('sp')){const d=document.createElement('div');d.id='sp';document.body.appendChild(d)}const n0=S.cards.length,th=S.cats.find(k=>k.lib&&!k.lvl).id,lv=S.cats.find(k=>k.lvl).id;window.__al=[];cardDel('VOC0001');await catDelIds([th,lv,'cuA']);
   return{card:S.cards.some(x=>x.id==='VOC0001'),th:S.cats.some(k=>k.id===th),lv:S.cats.some(k=>k.id===lv),cu:S.cats.some(k=>k.id==='cuA'),cuCards:S.cards.filter(x=>x.id.startsWith('cu_')).length,n:S.cards.length===n0,al:window.__al.length}});
  T('E1 正式詞彙不能在詞彙管理刪除（並提示改用「停用」）',e.card&&e.al>=1,e);T('E2 正式主題與 Level 不能在分類管理刪除',e.th&&e.lv,e);T('E3 教師自訂分類仍可刪除，圖卡保留',!e.cu&&e.cuCards===4&&e.n,e);await c.ctx.close()}
 /* F：教材安全修復＋復原 */
 {const c=await fresh(b);const pre=await c.p.evaluate(async()=>{LRN.add('乙');const L=S.lrn.list;L.forEach(p=>{p.ext=p.ext||{};p.ext.fl={range:'pick',dim:'theme',sel:{theme:['deadX','deadY'],level:[],custom:[]},cat:'sel',star:{}}});
   const th=S.cats.find(k=>k.lib&&!k.lvl),thN=S.cards.filter(x=>x.cats.includes(th.id)).length;S.cats=S.cats.filter(k=>k.id!==th.id);S.cards.slice(0,5).forEach(x=>x.cats.push('ghost1'));S.recs.push({id:'r_f1',ts:Date.now(),itemId:'VOC0003',game:'pick',outcome:'correct'});S.rw.stars=(S.rw.stars||0)+5;S.lib.off['VOC0009']=1;await save();
   return{th:th.id,thN,cats:S.cats.length,recs:S.recs.length,stars:S.rw.stars,lrn:L.length}});
  const rep0=await c.p.evaluate(()=>{const r=INT.report();return{dead:r.learnerRangeDead,refs:r.deadCatRefs}});T('F0 完整性檢查列出「個案範圍含已刪除分類」與「失效分類連結」',rep0.dead===pre.lrn&&rep0.refs===5+pre.thN,{rep0,thN:pre.thN});
  await c.p.evaluate(()=>SRC.fix());await c.p.waitForTimeout(300);
  const f=await c.p.evaluate(async th=>({th:S.cats.some(k=>k.id===th),refs:S.cards.reduce((a,x)=>a+x.cats.filter(i=>!S.cats.some(k=>k.id===i)).length,0),ranges:S.lrn.list.every(p=>(p.ext.fl.sel[p.ext.fl.dim]||[]).length&&(p.ext.fl.sel[p.ext.fl.dim]||[]).every(id=>S.cats.some(k=>k.id===id))),
   recs:S.recs.length,r1:S.recs.some(r=>r.id==='r_f1'),stars:S.rw.stars,off:!!S.lib.off['VOC0009'],in9:S.cards.some(x=>x.id==='VOC0009'),bk:!!(await kvGet('backup-pre-safefix')),res:S.matFix&&S.matFix.r,html:SRC.html()}),pre.th);
  T('F1 安全修復補回被刪除的正式主題',f.th,f.res);T('F2 圖卡上已不存在的分類連結全部清除（正式主題補回後重新連結）',f.refs===0,f.refs);T('F3 每位個案（含非目前個案）的失效範圍都已修正',f.ranges&&f.res.learners===pre.lrn,f.res);
  T('F4 學習紀錄、星星、教師停用設定都保留',f.r1&&f.recs===pre.recs&&f.stars===pre.stars&&f.off&&!f.in9,f);T('F5 修復前已自動備份，畫面顯示修復結果',f.bk&&/上次安全修復/.test(f.html),null);
  const u=await c.p.evaluate(async()=>{S.recs.push({id:'r_after',ts:Date.now(),itemId:'VOC0004',game:'pick',outcome:'correct'});await SRC.undo();return{ghost:S.cards.some(x=>x.cats.includes('ghost1')),after:S.recs.some(r=>r.id==='r_after'),r1:S.recs.some(r=>r.id==='r_f1')}});
  T('F6 復原會還原教材狀態，但修復之後新增的學習紀錄保留',u.ghost&&u.after&&u.r1,u);await c.ctx.close()}
 /* G：六站實際可用題數 */
 {const c=await fresh(b,{width:390,height:844});const g=await c.p.evaluate(()=>{SRC.calc();const R=SRC.rows.out,h=SRC.html(),d=document.createElement('div');d.style.width='360px';d.innerHTML=h;document.body.appendChild(d);const ow=[...d.querySelectorAll('div')].some(x=>x.scrollWidth>x.clientWidth&&getComputedStyle(x).overflowX!=='auto');d.remove();
   return{q11:R.quiet[1][0],q15:R.quiet[1][4],q31:R.quiet[3][0],o21:R.oral[2][0],cells:Object.values(R).reduce((a,m)=>a+Object.values(m).reduce((s,x)=>s+x.length,0),0),tbl:/學習站/.test(h)&&/聽讀練習/.test(h)&&/口語練習/.test(h)&&/綜合練習/.test(h),ow}});
  T('G1 六站×三模式×五星全部計算（90 格）',g.cells===90&&g.tbl,g);T('G2 第1站一星可用 950 個詞彙',g.q11.ok&&g.q11.n===950,g.q11);
  T('G3 不可用時列出原因（第1站五星、第3站）',!g.q15.ok&&/需要/.test(g.q15.msg)&&!g.q31.ok&&/組合/.test(g.q31.msg),{q15:g.q15,q31:g.q31});T('G4 手機寬度下表格可捲動、不撐破版面',!g.ow,g.ow);await c.ctx.close()}
 /* H：家長直接複習不使用停用來源 */
 {const c=await fresh(b);const h=await c.p.evaluate(async()=>{const leg=S.cards.find(x=>(S.packIds||[]).includes(x.id)),now=Date.now();S.recs.push({id:'r_h1',ts:now,itemKind:'word',itemId:leg.id,game:'pick',outcome:'wrong',purpose:'teach'},{id:'r_h2',ts:now,itemKind:'word',itemId:'VOC0010',game:'pick',outcome:'wrong',purpose:'teach'});
   const off=PAR.review().map(w=>w.id);await SRC.set('legacy',1);const on=PAR.review().map(w=>w.id);return{leg:leg.id,off,on}});
  T('H1 家長「待複習詞彙」不列出停用來源的詞彙',!h.off.includes(h.leg),h);T('H2 啟用後才列出',h.on.includes(h.leg),h);await c.ctx.close()}
 await b.close();console.log('PASS',P,'FAIL',F);process.exit(F?1:0)})();
