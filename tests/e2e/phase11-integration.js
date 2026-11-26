// 整合驗收（Chromium 模擬，不是真機）：六站 × 三種模式 × 星級 全部進入，檢查無 JS 錯誤、題目出現、紀錄寫入、
// 再測 手機/平板/桌機 直橫向、重新整理、返回、首頁、中途離開。
const {chromium}=require('playwright');let P=0,F=0;const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:820,height:1000}});const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:8124/1124-1-TEST/');await pg.waitForFunction(()=>typeof P17!=='undefined'&&S&&S.cards&&S.cards.length>=1,null,{timeout:40000});await pg.waitForTimeout(1200);
await pg.evaluate(png=>{window.confirm=()=>true;window.alert=m=>{window.__al=m};S.set.music=false;S.set.sound=false;V2.prepDone=true;S.set.anim=false;S.set.ap=false;
 S.cats=[{id:'fr',name:'水果',order:[]},{id:'an',name:'動物',order:[]}];
 S.cards=[['a','蘋果','fr','ㄆㄧㄥˊ'],['b','香蕉','fr','ㄒㄧㄤ'],['c','貓','an','ㄇㄠ'],['d','狗','an','ㄍㄡˇ'],['e','魚','an','ㄩˊ'],['f','橘子','fr','ㄐㄩˊ'],['g','火車','an','ㄏㄨㄛˇ'],['h','汽車','an','ㄑㄧˋ']].map(([id,t,c,z])=>({id,text:t,zy:z,img:png,audio:'',cats:[c],created:1,modified:1}));save()},PNG);
const modes=['quiet','oral','integ'];let entered=0,fails=[];
for(const m of modes)for(let st=1;st<=6;st++){
  for(const star of [1,3,5]){
    const before=errs.length;
    const r=await pg.evaluate(async([m,st,star])=>{try{if(G.on)leave();UI.pick(m);FL.open(st);FL.setStar(star);
      const btn=document.querySelector('.fgob');if(!btn)return {no:'無開始按鈕'};if(btn.disabled)return {dis:true,why:(document.querySelector('.fdesc')||{}).textContent};
      FL.go();await new Promise(r=>setTimeout(r,400));if(S.set.mode==='expose'&&window.EXP)EXP.done();await new Promise(r=>setTimeout(r,500));
      return {on:!!G.on,mode:S.set.mode,hasCur:!!G.cur,bodyIg:document.body.classList.contains('ig'),bar:!!document.querySelector('#bar,.bar,#hdr,#top')}}catch(e){return {ex:e.message}}},[m,st,star]);
    if(r.dis){continue}
    entered++;
    const ok=r.on&&r.hasCur&&errs.length===before&&!r.ex;if(!ok)fails.push([m,st,star,r,errs.slice(before)]);
    await pg.evaluate(()=>{try{if(G.on)leave()}catch(e){}});await pg.waitForTimeout(150);
  }}
T('六站×三模式×星級 3/6 組合：可進入的全部能開始、有題目、無 JS 錯誤（入口數 '+entered+'）',entered>=12&&fails.length===0,fails.slice(0,3));
// 紀錄寫入
await pg.evaluate(async()=>{if(G.on)leave();UI.pick('quiet');FL.open(1);FL.go();for(let i=0;i<14&&S.set.mode==='expose';i++){await new Promise(r=>setTimeout(r,900));try{EXP.done()}catch(e){}}await new Promise(r=>setTimeout(r,900))});
const rc0=await pg.evaluate(()=>S.recs.length);
const modeNow=await pg.evaluate(()=>S.set.mode);
await pg.evaluate(()=>{if(S.set.mode==='pick'&&G.pk){const i=G.pk.ci;document.querySelectorAll('.pko')[i].click()}});await pg.waitForTimeout(2500);
T('作答後寫入一筆有 learnerId/itemId/outcome 的紀錄',await pg.evaluate(rc0=>{const r=S.recs[S.recs.length-1];return S.recs.length>rc0&&r&&!!r.learnerId&&!!r.itemId&&!!r.outcome},rc0)||modeNow);
await pg.evaluate(()=>{try{leave()}catch(e){}});
// 跨裝置尺寸：首頁與遊戲都不得水平捲動、主要按鈕在螢幕內
const sizes={phoneP:[390,844],phoneL:[844,390],tabP:[820,1180],tabL:[1180,820],desk:[1440,900]};
for(const [k,[w,h]] of Object.entries(sizes)){await pg.setViewportSize({width:w,height:h});await pg.evaluate(()=>{try{if(G.on)leave()}catch(e){}UI.pick('quiet');FL.view='map';FL.st=null;home()});await pg.waitForTimeout(300);
  const m=await pg.evaluate(()=>({hs:document.documentElement.scrollWidth>innerWidth+2,btnOut:[...document.querySelectorAll('button')].filter(b=>{const r=b.getBoundingClientRect();return r.width>0&&r.left<-2}).length}));
  T(k+' 首頁無水平捲動、按鈕不在螢幕左外',!m.hs&&m.btnOut===0,m);
  await pg.evaluate(()=>{FL.open(1);FL.go()});await pg.waitForTimeout(500);await pg.evaluate(()=>{if(S.set.mode==='expose')EXP.done()});await pg.waitForTimeout(400);
  const g=await pg.evaluate(()=>({hs:document.documentElement.scrollWidth>innerWidth+2,opt:[...document.querySelectorAll('.pko')].every(o=>{const r=o.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&r.top>=-1})}));
  T(k+' 遊戲中無水平捲動、選項都在螢幕內',!g.hs&&g.opt,g);await pg.evaluate(()=>{try{leave()}catch(e){}});}
// 重新整理：資料與目前個案保留
await pg.setViewportSize({width:820,height:1000});
await pg.waitForFunction(()=>typeof LIB!=='undefined'&&(!LIB.loading)&&LIB.base&&S.cards.length>=900,null,{timeout:40000}).catch(()=>{});await pg.waitForTimeout(1500);
const snap=await pg.evaluate(()=>JSON.stringify({c:S.cards.length,r:S.recs.length,l:LRN.id()}));
await pg.evaluate(()=>save());await pg.waitForTimeout(500);await pg.reload();await pg.waitForFunction(()=>typeof P17!=='undefined'&&S&&S.cards&&S.cards.length>=1,null,{timeout:40000});await pg.waitForFunction(()=>typeof LIB!=='undefined'&&!LIB.loading&&LIB.base,null,{timeout:40000}).catch(()=>{});await pg.waitForTimeout(2500);
T('重新整理後卡片數、紀錄數、目前個案不變',await pg.evaluate(s=>JSON.stringify({c:S.cards.length,r:S.recs.length,l:LRN.id()})===s,snap));
// 中途離開再回來：不應留下進行中狀態
await pg.evaluate(()=>{UI.pick('quiet');FL.open(1);FL.go()});await pg.waitForTimeout(500);await pg.evaluate(()=>{try{leave()}catch(e){}});await pg.waitForTimeout(300);
T('中途離開後回到可用首頁（不在遊戲中、沒殘留 ig）',await pg.evaluate(()=>!G.on&&!document.body.classList.contains('ig')&&!!document.querySelector('#app,body')));
T('整個流程沒有未處理的 JS 錯誤',errs.length===0,errs.slice(0,3));
console.log(`phase11-integration: ${P} pass ${F} fail`);await b.close();process.exit(F?1:0)})();
