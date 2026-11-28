// v22.6.8 手機直式答題畫面：題目圖片不再把國字與注音格擠到畫面下方
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const BASE='http://localhost:'+(process.env.E2E_PORT||8124)+'/1124-1-TEST/';let P=0,F=0;
const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x===undefined?null:x).slice(0,900))};
const AS=fs.readFileSync(path.join(__dirname,'lib','audio-stub.js'),'utf8');
const ready=p=>p.waitForFunction(()=>typeof S!=='undefined'&&S.cards&&S.cards.length>=1000,null,{timeout:60000}).then(()=>p.waitForTimeout(600));
/* 進入某模式某站某星，略過新詞示範卡與麥克風準備，回傳各區塊位置 */
const enter=(p,m,st,star)=>p.evaluate(async([m,st,star])=>{const sl=t=>new Promise(r=>setTimeout(r,t));try{G.on=false}catch(e){}home();await sl(200);UI.pick(m);await sl(300);FL.open(st);await sl(300);FL.setStar(star);await sl(100);document.getElementById('fl_go').click();await sl(900);
 if(document.querySelector('[onclick="V2.prepGo(0)"]')){V2.prepGo(0);await sl(900)}
 for(let i=0;i<12&&S.set.mode==='expose';i++){EXP.done();await sl(500)}await sl(900);
 const R=s=>{const e=document.querySelector(s);if(!e||!e.getClientRects().length)return null;const b=e.getBoundingClientRect();return{t:Math.round(b.top),b:Math.round(b.bottom),h:Math.round(b.height),l:Math.round(b.left),r:Math.round(b.right)}};
 const mid=document.getElementById('mid'),keys=[...document.querySelectorAll('.tkb')].map(e=>e.getBoundingClientRect());
 return{mode:S.set.mode,vh:innerHeight,vw:innerWidth,pic:R('#pic'),rep:R('#rep'),word:R('#word'),cells:R('.sr'),mid:R('#mid'),midScroll:mid.scrollHeight-mid.clientHeight,midDisp:getComputedStyle(mid).display,bot:R('#bot'),
  keysOut:keys.filter(k=>k.bottom>innerHeight+1||k.right>innerWidth+1).length,keyN:keys.length,minKeyH:keys.length?Math.round(Math.min(...keys.map(k=>k.height))):0,page:document.documentElement.scrollHeight-innerHeight}},[m,st,star]);
const inView=(r,o)=>r&&o.mid&&r.t>=o.mid.t-1&&r.b<=o.mid.b+1;
(async()=>{const b=await chromium.launch();const errs=[];
 const open=async(w,h,q='')=>{const ctx=await b.newContext({viewport:{width:w,height:h},isMobile:w<760,hasTouch:true});await ctx.addInitScript({content:AS});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(BASE+q);await ready(p);return{ctx,p}};
 /* 一、三種手機尺寸：聽讀第 2 站（有圖片＋注音格＋觸控鍵盤） */
 for(const [w,h] of [[390,844],[375,667],[430,932],[360,640]]){const {ctx,p}=await open(w,h);
  for(const star of [1,3]){const o=await enter(p,'quiet',2,star);
   T(`M1 ${w}×${h} 聽讀第2站★${star}：圖片、國字、注音格都在畫面內，不用捲動`,o.pic&&o.pic.h>=(o.vh<700?54:60)&&inView(o.pic,o)&&inView(o.word,o)&&inView(o.cells,o)&&o.midScroll<=2&&o.page<=2,o);
   T(`M2 ${w}×${h} 聽讀第2站★${star}：「再聽一次」在圖片旁邊；觸控鍵盤完整、按鍵夠大`,o.rep&&Math.abs((o.rep.t+o.rep.b)/2-(o.pic.t+o.pic.b)/2)<=40&&o.rep.l>=o.pic.r&&o.keyN>=40&&o.keysOut===0&&o.minKeyH>=33,o)}
  const o5=await enter(p,'quiet',2,5);
  T(`M3 ${w}×${h} 聽讀第2站★5（只有國字）：國字與注音格在畫面內`,!o5.pic&&inView(o5.word,o5)&&o5.midScroll<=2&&o5.keysOut===0,o5);
  await ctx.close()}
 /* 二、口語：圖片與題目不再被下方大人區蓋掉 */
 for(const [w,h] of [[390,844],[375,667]]){const {ctx,p}=await open(w,h);const o=await enter(p,'oral',2,1);
  T(`M4 ${w}×${h} 口語第2站：圖片（至少 80 像素高）與題目都看得到，下方大人區可自行捲動`,o.mode==='speak'&&o.pic&&o.pic.h>=80&&inView(o.pic,o)&&inView(o.word,o)&&o.midScroll<=2&&o.bot.h<=o.vh*0.45+1,o);
  await ctx.close()}
 /* 三、預覽主題也一樣 */
 {const {ctx,p}=await open(390,844,'?theme=nature');const o=await enter(p,'quiet',2,1);
  T('M5 390×844 自然旅行預覽主題：同樣不用捲動',o.pic&&inView(o.word,o)&&inView(o.cells,o)&&o.midScroll<=2,o);await ctx.close()}
 /* 四、iPad 與電腦、手機橫向：版面不受影響 */
 for(const [w,h] of [[768,1024],[1180,820],[844,390]]){const {ctx,p}=await open(w,h);const o=await enter(p,'quiet',2,1);
  T(`M6 ${w}×${h} 不是手機直式：維持原本版面（不套用新規則）`,o.midDisp!=='grid'&&o.pic&&o.keysOut===0,o);await ctx.close()}
 T('M8 沒有頁面錯誤',!errs.length,errs);
 await b.close();console.log(`\n${P} 通過 / ${F} 失敗`);process.exit(F?1:0)})().catch(e=>{console.error('CRASH',e);process.exit(2)});
