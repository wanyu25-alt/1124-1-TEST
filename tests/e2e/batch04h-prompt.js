// v22.5.7 第04-H批：「這是什麼」只在第 1、2 題；引導語音播放中說對也算過關（Chromium 模擬麥克風與辨識；聲音由 audio-stub 記錄）
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const BASE='http://localhost:'+(process.env.E2E_PORT||8124)+'/1124-1-TEST/';let P=0,F=0;
const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x===undefined?null:x).slice(0,500))};
const AS=fs.readFileSync(path.join(__dirname,'lib','audio-stub.js'),'utf8'),MS=fs.readFileSync(path.join(__dirname,'lib','mic-stub.js'),'utf8');
const ready=async p=>{await p.waitForFunction(()=>typeof S!=='undefined'&&S.cards&&S.cards.length>=1000&&S.lrn&&typeof P34!=='undefined',null,{timeout:60000});await p.waitForTimeout(1000);
 await p.evaluate(()=>{window.confirm=()=>true;window.alert=()=>{};window.sl=ms=>new Promise(r=>setTimeout(r,ms));window.what=()=>window.__al.filter(x=>/guidance\/what_is_this|gv_what/.test(x.a||'')).length})};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900}});await ctx.addInitScript({content:AS+';window.__dur=2500;'});await ctx.addInitScript({content:MS});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(BASE);await ready(p);
 await p.locator(`[onclick="UI.pick('oral')"]`).click();await p.waitForTimeout(400);await p.locator('[onclick="FL.open(2)"]').first().click();await p.waitForTimeout(300);
 await p.locator('.fstar').nth(2).click();await p.getByRole('button',{name:'自行選擇教材'}).click();await p.evaluate(()=>{window.__al.length=0});await p.locator('#fl_go').click();await p.waitForTimeout(900);
 if(await p.locator('#prep').count())await p.locator('#prep button',{hasText:'啟用麥克風並開始'}).click();
 /* 第 1 題：等「這是什麼」開始播，播放中說出答案 */
 const r1=await p.evaluate(async()=>{for(let i=0;i<80&&!(AM.cur&&/^gv_what$/.test(AM.cur.k||'')&&ASR.on);i++)await sl(100);const during=!!(AM.cur&&AM.cur.k==='gv_what');
  await sl(200);__say('香蕉',true);await sl(300);const wrong=G.lock;await sl(200);__say(G.cur.text,true);await sl(400);return{during,wrong,lock:G.lock,cut:!(AM.cur&&AM.cur.k==='gv_what'),q:G.i,cur:G.cur.text}});
 T('H1 第 1 題播放「這是什麼」',r1.during,r1);
 T('H2 播放中說了其他詞：不採用（不過關、不算錯）',r1.wrong===false,r1);
 T('H3 播放中說出正確答案：立刻停止引導語音、記為答對並接續下一題',r1.lock===true&&r1.cut,r1);
 await p.waitForTimeout(3500);
 const rec=await p.evaluate(()=>{const r=S.recs.filter(x=>x.game==='speak').pop();return r&&{out:r.outcome,ind:r.independent,oral:r.ext&&r.ext.oral}});
 T('H4 紀錄：A 正確辨識、獨立完成，並標示「在引導語音中說出」',rec&&rec.out==='correct'&&rec.ind===true&&rec.oral&&rec.oral.cls==='A'&&rec.oral.duringPrompt===true,rec);
 /* 第 2、3 題：「這是什麼」只播到第 2 題 */
 const n2=await p.evaluate(async()=>{await sl(3000);const n=what();__say(G.cur.text,true);await sl(3500);return{n,i:G.i}});
 const n3=await p.evaluate(async()=>{const a=what();await sl(4000);const b2=what();return{a,b:b2,i:G.i}});
 T('H5 第 2 題仍播「這是什麼」，第 3 題起不再播（避免疲乏）',n2.n>=2&&n3.b===n3.a,{n2,n3});
 T('H6 沒有頁面錯誤',errs.length===0,errs);await b.close();console.log(`\n${P} 通過 / ${F} 失敗`);process.exit(F?1:0)})().catch(e=>{console.error('CRASH',e);process.exit(2)});
