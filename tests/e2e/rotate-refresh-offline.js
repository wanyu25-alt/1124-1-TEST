const {chromium}=require('playwright');
const URL='http://localhost:8124/1124-1-TEST/';let P=0,F=0;const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
const boot=async(ctx)=>{const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));await p.addInitScript(()=>{window.__gum=0;const o=navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);if(o)navigator.mediaDevices.getUserMedia=function(){window.__gum++;return o.apply(null,arguments)}});
 await p.goto(URL);await p.waitForFunction(()=>typeof UI!=='undefined'&&S&&S.cards&&S.cards.length&&S.lrn,null,{timeout:40000});await p.waitForTimeout(800);return p};
const setup=p=>p.evaluate(()=>{S.set.music=false;S.set.sound=false;S.set.hz={...(S.set.hz||{}),free:true};V2.prepDone=true;UI.micHide=true;S.set.n=5;save()});
const answer=p=>p.evaluate(()=>{for(const c of K.seq.flat()){if(!G.on||G.lock)break;kPress(c,'touch_keyboard')}});
(async()=>{const b=await chromium.launch({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
let ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});let p=await boot(ctx);await setup(p);
await p.evaluate(()=>{UI.pick('quiet');goV('bike')});await p.waitForTimeout(2500);
// 打一個符號
await p.evaluate(()=>{kPress(K.seq[0][0],'touch_keyboard')});await p.waitForTimeout(400);
const s0=await p.evaluate(()=>({rid:G.rid,i:G.i,st:S.rounds.started,w:G.cur.text,ci:K.ci,si:K.si,t0:G.t0,evs:K.evs.length,cid:G.cur.id}));
T('進入後有輸入進度',s0.si>=1||s0.ci>=1,s0);
await p.setViewportSize({width:844,height:390});await p.waitForTimeout(800);
const s1=await p.evaluate(()=>({rid:G.rid,i:G.i,st:S.rounds.started,w:G.cur.text,ci:K.ci,si:K.si,t0:G.t0,evs:K.evs.length,keys:document.querySelectorAll('.tkb').length,on:G.on,cls:document.body.className}));
T('旋轉：題目未重新開始（rid/題號/輪數/題目相同）',s1.rid===s0.rid&&s1.i===s0.i&&s1.st===s0.st&&s1.w===s0.w&&s1.on,{s0,s1});
T('旋轉：已打的注音保留',s1.ci===s0.ci&&s1.si===s0.si&&s1.evs===s0.evs&&s1.t0===s0.t0,{s0,s1});
T('旋轉：觸控鍵盤仍在、版面類別改為橫向',s1.keys===43&&/o-land/.test(s1.cls),s1);
await p.setViewportSize({width:390,height:844});await p.waitForTimeout(800);
const s2=await p.evaluate(()=>({rid:G.rid,i:G.i,ci:K.ci,si:K.si,cls:document.body.className}));
T('轉回直向：仍同一題與進度',s2.rid===s0.rid&&s2.i===s0.i&&s2.ci===s0.ci&&s2.si===s0.si&&/o-port/.test(s2.cls),s2);
// 完成兩題
await answer(p);await p.waitForTimeout(2500);await answer(p);await p.waitForTimeout(2500);
const s3=await p.evaluate(()=>({i:G.i,done:G.done,recs:S.recs.length,stars:S.rw.stars,left:G.q.slice(G.i).map(c=>c.id)}));
T('完成兩題後有紀錄與星星',s3.done>=2&&s3.recs>=2&&s3.stars>=2,s3);
// 斷線：保留已成功寫入本機的紀錄（IndexedDB）
await ctx.setOffline(true);await answer(p);await p.waitForTimeout(2500);
const s4=await p.evaluate(async()=>{const st=await load();return {mem:S.recs.length,idb:st.lrn?st.lrn.list.reduce((a,x)=>a+((x.id===S.lrn.cur&&st.recs)?st.recs.length:0),0):(st.recs||[]).length,idbStars:(st.rw||{}).stars,stars:S.rw.stars}});
T('離線時作答仍寫入本機 IndexedDB',s4.idb>=3&&s4.idbStars===s4.stars,s4);
await ctx.setOffline(false);
const snap=await p.evaluate(async()=>{const st=await load();const pr=st.lrn.list.find(x=>x.id===st.lrn.cur);return {rs:pr.ext&&pr.ext.rs&&{ids:pr.ext.rs.ids.length,total:pr.ext.rs.total},i:G.i}});
T('進行中有接續快照（剩餘題數合理）',snap.rs&&snap.rs.ids>=1&&snap.rs.ids<=2,snap);
// 重新整理
await p.reload();await p.waitForFunction(()=>typeof UI!=='undefined'&&S&&S.cards&&S.cards.length&&S.lrn,null,{timeout:40000});await p.waitForTimeout(1500);
const h=await p.evaluate(()=>({rs:!!document.querySelector('#rsum'),txt:(document.querySelector('#rsum')||{}).textContent,recs:S.recs.length,stars:S.rw.stars,mc:document.querySelectorAll('.mc').length}));
T('重新整理後：紀錄與星星仍在',h.recs>=3&&h.stars>=3,h);
T('重新整理後：首頁出現「繼續上次的練習」，仍只有三個主要入口',h.rs&&h.mc===3,h);
await setup(p);const left=snap.rs.ids;
await p.evaluate(()=>UI.resume());await p.waitForTimeout(2500);
const r1=await p.evaluate(()=>({on:G.on,n:G.n,w:G.cur&&G.cur.text,rs:!!(UI.rsGet())}));
T('按繼續：回到練習，題數為剩餘題數',r1.on&&r1.n===left,{r1,left});
await answer(p);await p.waitForTimeout(2500);
const r2=await p.evaluate(()=>({i:G.i,done:G.done,on:G.on}));
await p.evaluate(async()=>{for(let k=0;k<6&&G.on;k++){if(G.on&&K&&K.seq&&!G.lock){for(const c of K.seq.flat()){if(!G.on||G.lock)break;kPress(c,'touch_keyboard')}}await new Promise(r=>setTimeout(r,2300))}});
await p.waitForTimeout(3500);
const r3=await p.evaluate(()=>({rs:!!UI.rsGet(),arr:!!document.querySelector('#arr'),on:G.on}));
T('完成後接續快照被清除',!r3.rs,r3);
// 麥克風：整輪聽讀都沒有要求麥克風
const g1=await p.evaluate(()=>window.__gum);T('聽讀練習全程未要求麥克風（getUserMedia=0）',g1===0,g1);
T('無頁面錯誤',p.errs.length===0,p.errs);
console.log('PASS',P,'FAIL',F);await b.close()})();
