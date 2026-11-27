// v22.5.6 第04-G批：口語練習只有一星先念示範；二星以上不先念題目，新詞直接看圖說（Chromium 模擬；聲音由 audio-stub 記錄）
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const BASE='http://localhost:'+(process.env.E2E_PORT||8124)+'/1124-1-TEST/';let P=0,F=0;
const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x===undefined?null:x).slice(0,500))};
const AS=fs.readFileSync(path.join(__dirname,'lib','audio-stub.js'),'utf8'),MS=fs.readFileSync(path.join(__dirname,'lib','mic-stub.js'),'utf8');
const ready=async p=>{await p.waitForFunction(()=>typeof S!=='undefined'&&S.cards&&S.cards.length>=1000&&S.lrn&&typeof P33!=='undefined',null,{timeout:60000});await p.waitForTimeout(1000);await p.evaluate(()=>{window.confirm=()=>true;window.alert=()=>{}})};
const start=async(p,star)=>{await p.locator(`[onclick="UI.pick('oral')"]`).click();await p.waitForTimeout(400);await p.locator('[onclick="FL.open(2)"]').first().click();await p.waitForTimeout(300);
 await p.locator('.fstar').nth(star-1).click();await p.getByRole('button',{name:'系統推薦'}).click();await p.evaluate(()=>{window.__al.length=0});await p.locator('#fl_go').click();await p.waitForTimeout(900);
 if(await p.locator('#prep').count())await p.locator('#prep button',{hasText:'啟用麥克風並開始'}).click();await p.waitForTimeout(3500)};
const home=async p=>{await p.locator('button:visible',{hasText:'首頁'}).first().click();await p.waitForTimeout(400);await p.locator('#hm button',{hasText:'返回首頁'}).click();await p.waitForTimeout(600)};
const q=p=>p.evaluate(()=>({steps:G.q.map(x=>x._step),mode:S.set.mode,cur:G.cur&&G.cur.text,said:window.__al.filter(x=>x.tts).map(x=>x.tts),ids:new Set(G.q.map(x=>x.id)).size}));
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900}});await ctx.addInitScript({content:AS});await ctx.addInitScript({content:MS});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(BASE);await ready(p);
 for(const star of [2,3]){/* 第一次（新學生起點）與第二次（之後的新詞）都檢查 */
  for(const round of [1,2]){await start(p,star);const r=await q(p);
   T(`S${star}-${round} 口語二星以上（第${round}次）：沒有「聽詞認識」，新詞直接看圖說`,r.steps.length>0&&!r.steps.includes('expose')&&r.mode==='speak',r);
   T(`S${star}-${round}b 開口前沒有念出答案`,!r.said.includes(r.cur),r);await home(p)}}
 await start(p,1);const r=await q(p);T('S1 一星「先聽完整示範，再自己說」：仍然先念示範（聽詞認識）再說',r.steps[0]==='expose'&&r.steps.includes('speak')&&r.mode==='expose',r);await home(p);
 T('N 沒有頁面錯誤',errs.length===0,errs);await b.close();console.log(`\n${P} 通過 / ${F} 失敗`);process.exit(F?1:0)})().catch(e=>{console.error('CRASH',e);process.exit(2)});
