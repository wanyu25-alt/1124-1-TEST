// v22.6.2 第05-C批：清楚標示目前是「聽讀／口語」練習（六站地圖、站內設定頁、練習進行中的小標籤）
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const BASE='http://localhost:'+(process.env.E2E_PORT||8124)+'/1124-1-TEST/';let P=0,F=0;
const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x===undefined?null:x).slice(0,600))};
const AS=fs.readFileSync(path.join(__dirname,'lib','audio-stub.js'),'utf8'),MS=fs.readFileSync(path.join(__dirname,'lib','mic-stub.js'),'utf8');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900}});await ctx.addInitScript({content:AS});await ctx.addInitScript({content:MS});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(BASE);
 await p.waitForFunction(()=>typeof S!=='undefined'&&S.cards&&S.cards.length>=1000&&S.lrn&&typeof P37!=='undefined',null,{timeout:60000});await p.waitForTimeout(800);
 await p.evaluate(()=>{window.confirm=()=>true;window.alert=()=>{}});
 const page=async()=>p.evaluate(()=>{const w=document.querySelector('.hm3'),band=document.querySelector('.lmband');return{cls:w&&w.className,band:band&&band.textContent,h2:(document.querySelector('.hm3 h2')||{}).textContent}});
 await p.locator(`[onclick="UI.pick('quiet')"]`).click();await p.waitForTimeout(400);const m1=await page();
 T('M1 聽讀練習的六站地圖：藍色外框（lm-quiet）＋「🎧 聽讀練習｜選一站開始」',/lm-quiet/.test(m1.cls)&&/聽讀練習/.test(m1.band)&&/選一站開始/.test(m1.band),m1);
 await p.locator('[onclick="FL.open(1)"]').first().click();await p.waitForTimeout(300);const s1=await page();
 T('M2 聽讀第1站設定頁：橫條寫「聽讀練習｜第 1 站」與「不需要麥克風」',/lm-quiet/.test(s1.cls)&&/聽讀練習/.test(s1.band)&&/第 1 站/.test(s1.band)&&/不需要麥克風/.test(s1.band),s1);
 await p.locator('[onclick="FL.back()"]').first().click();await p.waitForTimeout(300);await p.locator('[onclick="UI.navTo(1)"]').first().click();await p.waitForTimeout(300);
 await p.locator(`[onclick="UI.pick('oral')"]`).click();await p.waitForTimeout(400);const m2=await page();
 T('M3 口語練習的六站地圖：橘色外框（lm-oral）＋「🗣️ 口語練習」',/lm-oral/.test(m2.cls)&&/口語練習/.test(m2.band),m2);
 await p.locator('[onclick="FL.open(2)"]').first().click();await p.waitForTimeout(300);const s2=await page();
 T('M4 口語第2站設定頁：橫條寫「口語練習｜第 2 站」與「需要麥克風」',/lm-oral/.test(s2.cls)&&/口語練習/.test(s2.band)&&/第 2 站/.test(s2.band)&&/需要麥克風/.test(s2.band),s2);
 /* 練習中（口語會先出現麥克風準備畫面） */
 await p.locator('.fstar').nth(2).click();await p.waitForTimeout(200);await p.locator('#fl_go').click();await p.waitForTimeout(900);
 if(await p.locator('#prep').count())await p.locator('#prep button',{hasText:'啟用麥克風並開始'}).click();await p.waitForTimeout(1500);
 const g=await p.evaluate(()=>{const e=document.getElementById('lmbd'),cs=e&&getComputedStyle(e);return{on:G.on,txt:e&&e.textContent,disp:cs&&cs.display,pe:cs&&cs.pointerEvents,cls:e&&e.className,hidden:e&&e.getAttribute('aria-hidden')}});
 T('M5 口語練習進行中：右下角小標籤「🗣️ 口語｜第2站｜三星」，不能點、不朗讀',g.on&&g.txt==='🗣️ 口語｜第2站｜三星'&&g.disp==='block'&&g.pe==='none'&&g.cls==='lm-oral'&&g.hidden==='true',g);
 const g2=await p.evaluate(async()=>{try{endGame&&endGame()}catch(e){}G.on=false;try{mbd()}catch(e){}const e=document.getElementById('lmbd');return{disp:getComputedStyle(e).display}});
 T('M6 練習結束後小標籤隱藏',g2.disp==='none',g2);
 /* 不是由六站開始的練習（教師直接開始）：不顯示 */
 const g3=await p.evaluate(async()=>{FL.run=null;S.set.mode='pick';S.set.pks='word';startRound();await new Promise(r=>setTimeout(r,1500));const e=document.getElementById('lmbd');return{on:G.on,disp:getComputedStyle(e).display}});
 T('M7 不是由六站開始的練習不顯示小標籤',g3.disp==='none',g3);
 T('M8 沒有頁面錯誤',errs.length===0,errs);await b.close();console.log(`\n${P} 通過 / ${F} 失敗`);process.exit(F?1:0)})().catch(e=>{console.error('CRASH',e);process.exit(2)});
