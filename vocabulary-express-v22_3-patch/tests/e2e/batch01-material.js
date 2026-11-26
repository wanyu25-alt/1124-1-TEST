// v22.2 第01批：教材讀取異常修復（Chromium 模擬；不是真機）
// 重現「正式教材變成 0 個可用詞彙」的本機狀態，重新整理後實際進入第1、2站開始練習，並確認資料沒有被清除。
const {chromium}=require('playwright');
const URL='http://localhost:'+(process.env.E2E_PORT||8124)+'/1124-1-TEST/';let P=0,F=0;
const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
const ready=async p=>{await p.waitForFunction(()=>typeof S!=='undefined'&&S.cards&&typeof LIB!=='undefined'&&LIB.base&&S.lrn&&typeof MATFIX!=='undefined',null,{timeout:60000});await p.waitForTimeout(1200);
 await p.evaluate(()=>{window.confirm=()=>true;window.alert=m=>{window.__al=(window.__al||[]).concat(String(m))};S.set.music=false;S.set.sound=false;V2.prepDone=true})};
const fresh=async(b,o={})=>{const ctx=await b.newContext({viewport:{width:1280,height:800}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(URL);await ready(p);return{ctx,p,errs}};
const reload=async(c,block)=>{if(block)await c.ctx.route('**/default-library.json*',r=>r.abort());await c.p.reload();await ready(c.p)};
/* 開啟某站設定畫面並嘗試開始練習（與使用者點選相同的函式） */
const tryStart=(p,st)=>p.evaluate(st=>{UI.mode='quiet';FL.open(st);const sum=(document.getElementById('fl_sum')||{}).innerText||'';const btn=document.querySelector('.fgob');
 const ok=!!btn&&!btn.disabled,note0=(document.getElementById('mid')||{}).innerText.includes('已經不存在');if(ok)FL.go();const q=(G&&G.on&&G.q)||[];const res={sum,ok,on:!!(G&&G.on),n:q.length,lib:q.filter(c=>c&&c.lib).length,note:note0};
 try{if(G&&G.on){G.on=false;FL.end()}}catch(e){}return res},st);
(async()=>{const b=await chromium.launch();
 /* A：全新瀏覽器 */
 {const c=await fresh(b);const r=await c.p.evaluate(()=>({lib:S.cards.filter(x=>x.lib).length,img:S.cards.filter(x=>x.lib&&x.img).length,th:S.cats.filter(x=>x.lib&&!x.lvl).length,lv:S.cats.filter(x=>x.lvl).length,
   mapped:S.cards.filter(x=>x.lib).every(x=>x.cats.some(id=>S.cats.find(k=>k.id===id&&k.lib&&!k.lvl))&&x.cats.some(id=>S.cats.find(k=>k.id===id&&k.lvl))),noimg:S.cards.filter(x=>x.lib&&!x.img).length,build:(m=>!!m&&(+m[1]>22||(+m[1]===22&&+m[2]>=2)))(document.documentElement.innerHTML.match(/build:'v(\d+)\.(\d+)'/))}));
  T('A1 全新瀏覽器：正式 1000 詞載入、950 有圖、50 缺圖仍保留',r.lib===1000&&r.img===950&&r.noimg===50,r);
  T('A2 16 主題＋20 Level，每個正式詞都同時有主題與 Level',r.th===16&&r.lv===20&&r.mapped,r);
  T('A3 程式版本為 v22.2 或之後',r.build,r);
  const s1=await tryStart(c.p,1),s2=await tryStart(c.p,2);T('A4 第1站可開始練習且題目來自正式教材',s1.on&&s1.lib>0,s1);T('A5 第2站可開始練習',s2.on&&s2.n>0,s2);
  T('A6 沒有頁面錯誤',c.errs.length===0,c.errs);await c.ctx.close()}
 /* B：使用者實際情況——曾在教材未完整時選過範圍，之後刪除全部舊分類與舊詞彙 */
 {const c=await fresh(b);
  const before=await c.p.evaluate(async()=>{const m=FL.mem();m.range='pick';m.dim='theme';m.sel={theme:S.cats.filter(k=>!k.lib).map(k=>k.id),level:[],custom:[]};m.cat='sel';
   const ids=S.cats.filter(k=>!k.lib).map(k=>k.id);S.cards=S.cards.filter(x=>x.lib);S.cats=S.cats.filter(k=>!ids.includes(k.id));
   S.recs.push({id:'r_t1',ts:Date.now(),itemId:'VOC0001',game:'pick',outcome:'correct'});S.rw.stars=(S.rw.stars||0)+7;S.rw.badges=(S.rw.badges||[]).concat(['t_badge']);S.lib.off['VOC0005']=1;(S.lib.ov['VOC0002']=S.lib.ov['VOC0002']||{}).rv='pending';LIB.sync();await save();
   return{recs:S.recs.length,stars:S.rw.stars,bad:S.rw.badges.length,lrn:S.lrn.list.length,cats:S.cats.length}});
  /* 舊版（v22.1）會在這裡變成 0：驗證失效範圍的確存在 */
  const dead=await c.p.evaluate(()=>{const m=FL.mem();return m.sel.theme.filter(id=>S.cats.some(k=>k.id===id)).length});T('B0 重現條件：範圍內的分類全部已刪除',dead===0,dead);
  await reload(c);
  const s1=await tryStart(c.p,1);T('B1 刪除舊分類／舊詞彙後，第1站仍可開始練習（不是 0 個詞彙）',s1.on&&s1.lib>0,s1);T('B2 畫面說明原本的分類已不存在',s1.note,s1);
  const s2=await tryStart(c.p,2);T('B3 第2站也可開始練習',s2.on&&s2.n>0,s2);
  const after=await c.p.evaluate(()=>({has1:S.recs.some(r=>r.id==='r_t1'),recs:S.recs.length,stars:S.rw.stars,bad:S.rw.badges.length,lrn:S.lrn.list.length,off:!!S.lib.off['VOC0005'],in5:S.cards.some(x=>x.id==='VOC0005'),pend:S.lib.ov['VOC0002'].rv,img2:(S.cards.find(x=>x.id==='VOC0002')||{}).img||'',live:FL.mem().sel.theme.every(id=>S.cats.some(k=>k.id===id)),th:FL.mem().sel.theme.length}));
  T('B4 原有學習紀錄、星星、收藏、個案都保留（練習本身新增的紀錄除外）',after.has1&&after.recs>=before.recs&&after.stars>=before.stars&&after.bad===before.bad&&after.lrn===before.lrn,{before,after});
  T('B5 教師明確停用的詞彙仍停用',after.off&&!after.in5,after);T('B6 教師明確退回待審的圖片仍不出現',after.pend==='pending'&&!after.img2,after);
  T('B7 練習範圍已改為存在的分類（16 個正式主題）',after.live&&after.th===16,after);
  /* 選「全部」詞彙數量 */
  const all=await c.p.evaluate(()=>{UI.mode='quiet';FL.open(1);FL.setW('all');const t=(document.getElementById('fl_sum')||{}).innerText||'';return{t,dis:!!(document.querySelector('.fgob')||{}).disabled}});
  T('B8 練習數量選「全部」可以開始（950 有圖－1 停用－1 退回待審＝948）',!all.dis&&/948 個不同的詞彙/.test(all.t),all);
  await c.ctx.close()}
 /* C：使用者自己取消全選 → 說明要選分類（不是誤導成缺圖） */
 {const c=await fresh(b);const r=await c.p.evaluate(()=>{UI.mode='quiet';FL.open(1);FL.setRange('pick');FL.selNone('theme');const x=FL.chk(FL.ladder(1,'quiet')[0],'pick','sel');return x});
  T('C1 沒有勾選分類時，訊息是「還沒有選擇教材分類」',!r.ok&&/還沒有選擇教材分類/.test(r.msg),r);
  const r2=await c.p.evaluate(()=>FL.chk(FL.ladder(2,'quiet')[0],'rv','all'));T('C2 還沒有學過的詞時，「複習」的訊息正確',!r2.ok&&/還沒有已經學會的詞彙/.test(r2.msg),r2);
  const r3=await c.p.evaluate(()=>{FL.selAll('theme');return FL.chk(FL.ladder(1,'quiet')[0],'pick','sel')});T('C3 按「全部選取」後可以練習',r3.ok&&r3.n>0,r3);
  const keep=await c.p.evaluate(()=>{FL.togCat('theme',FL.mem().sel.theme[0],false);const n=FL.mem().sel.theme.length;MATFIX.selFix();return{n,n2:FL.mem().sel.theme.length,auto:!!FL.mem().selAuto}});
  T('C4 手動取消一個主題後，系統不會自動加回',keep.n===keep.n2&&!keep.auto,keep);await c.ctx.close()}
 /* D：個別學生詞彙範圍是空陣列（舊版留下）→ 不再排除全部正式詞彙；設定本身保留 */
 {const c=await fresh(b);await c.p.evaluate(async()=>{const e=LRN.cur();e.ext=e.ext||{};e.ext.libSel=[];S.cards=S.cards.filter(x=>x.lib);await save()});await reload(c);
  const s1=await tryStart(c.p,1);const kept=await c.p.evaluate(()=>Array.isArray(LRN.cur().ext.libSel));T('D1 個別詞彙範圍沒有有效詞彙時，第1站仍可練習',s1.on&&s1.lib>0,s1);T('D2 原本的個別詞彙範圍設定沒有被刪除',kept,kept);
  const lim=await c.p.evaluate(async()=>{LRN.cur().ext.libSel=['VOC0001','VOC0002','VOC0003'];MAT.bump();return deck().cards.filter(x=>x.lib).map(x=>x.id).sort().join()});T('D3 有效的個別詞彙範圍仍照教師設定限制',lim==='VOC0001,VOC0002,VOC0003',lim);await c.ctx.close()}
 /* E：預設審核清單下載失敗（網路異常）→ 沿用上次成功的審核預設值，圖片不消失 */
 {const c=await fresh(b);const has=await c.p.evaluate(()=>!!(S.lib.defRv&&Object.keys(S.lib.defRv).length===1000));T('E0 成功下載時保存審核預設值快取',has,has);
  await c.p.evaluate(async()=>{S.cards=S.cards.filter(x=>x.lib);LIB.base.forEach(w=>{S.lib.ov[w.id]={zyRev:'ok'}});await save()});await reload(c,true);
  const r=await c.p.evaluate(()=>({img:S.cards.filter(x=>x.lib&&x.img).length,log:MATFIX.log.some(x=>x.t==='defRvCache')}));T('E1 預設清單下載失敗時，950 個正式詞仍有圖片',r.img===950&&r.log,r);
  const s1=await tryStart(c.p,1);T('E2 下載失敗時第1站仍可練習',s1.on&&s1.lib>0,s1);await c.ctx.close()}
 /* F：唯讀診斷 */
 {const c=await fresh(b);const r=await c.p.evaluate(async()=>{S.lrn.list[0].name='測試姓名甲';await save();const before=JSON.stringify(S);const d=MATFIX.diag();const after=JSON.stringify(S);return{same:before===after,txt:JSON.stringify(d),d}});
  T('F1 診斷不修改任何資料',r.same,null);T('F2 診斷不輸出學生姓名',!r.txt.includes('測試姓名甲'),r.txt.slice(0,200));T('F3 診斷包含正式教材與範圍資訊',r.d.a_正式教材&&r.d.a_正式教材.詞彙庫詞數===1000&&r.d.c_目前個案,r.d);
  await c.ctx.close()}
 /* G：教材初始化完成後重新計算（自動範圍）：未載入詞彙庫時建立的自動範圍，載入後改為正式主題 */
 {const c=await fresh(b);const r=await c.p.evaluate(()=>{const m=FL.mem();delete m.dim;m.sel={theme:[],level:[],custom:[]};m.cat='all';m.range='pick';const keep=S.cards;S.cards=S.cards.filter(x=>!x.lib);MAT.bump();FL.migDim();const pre=m.sel.theme.length;S.cards=keep;LIB.sync();MAT.selFix&&0;MATFIX.selFix();return{pre,post:m.sel.theme.filter(id=>S.cats.some(k=>k.id===id&&k.lib)).length,auto:!!m.selAuto}});
  T('G1 教材未載入時的自動範圍，載入後會包含全部正式主題',r.auto&&r.post===16,r);await c.ctx.close()}
 await b.close();console.log('PASS',P,'FAIL',F);process.exit(F?1:0)})();
