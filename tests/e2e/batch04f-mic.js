// v22.5.5 第04-F批：口語練習「聽詞認識」畫面顯示麥克風聲波；麥克風測試頁 mic-test.html（Chromium 模擬麥克風與辨識；不是真機）
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const BASE='http://localhost:'+(process.env.E2E_PORT||8124)+'/1124-1-TEST/';let P=0,F=0;
const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x===undefined?null:x).slice(0,500))};
const AS=fs.readFileSync(path.join(__dirname,'lib','audio-stub.js'),'utf8'),MS=fs.readFileSync(path.join(__dirname,'lib','mic-stub.js'),'utf8');
const ready=async p=>{await p.waitForFunction(()=>typeof S!=='undefined'&&S.cards&&S.cards.length>=1000&&S.lrn&&typeof P33!=='undefined',null,{timeout:60000});await p.waitForTimeout(1000);await p.evaluate(()=>{window.confirm=()=>true;window.alert=()=>{}})};
const st=p=>p.evaluate(()=>({mode:S.set.mode,box:!!$('#micbox'),bx:($('#micbox')||{dataset:{}}).dataset.v||null,wst:($('#wst')||{}).textContent||'',bars:[...document.querySelectorAll('#wave i')].map(b=>parseFloat(b.style.height)||0),srOn:window.__sr.filter(r=>r.on).length,gum:window.__gum}));
const start=async(p,mode,st,star)=>{await p.locator(`[onclick="UI.pick('${mode}')"]`).click();await p.waitForTimeout(400);await p.locator(`[onclick="FL.open(${st})"]`).first().click();await p.waitForTimeout(300);
 await p.locator('.fstar').nth(star-1).click();await p.getByRole('button',{name:'自行選擇教材'}).click().catch(()=>{});await p.locator('#fl_go').click();await p.waitForTimeout(900);
 if(await p.locator('#prep').count())await p.locator('#prep button',{hasText:'啟用麥克風並開始'}).click();await p.waitForTimeout(3500)};
const home=async p=>{await p.locator('button:visible',{hasText:'首頁'}).first().click();await p.waitForTimeout(400);await p.locator('#hm button',{hasText:'返回首頁'}).click();await p.waitForTimeout(600)};
(async()=>{const b=await chromium.launch();
 {const ctx=await b.newContext({viewport:{width:1280,height:900}});await ctx.addInitScript({content:AS});await ctx.addInitScript({content:MS});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(BASE);await ready(p);
  /* 口語練習第1站一星＝聽詞認識 */
  await start(p,'oral',1,1);let s=await st(p);
  T('M1 口語練習「聽詞認識」畫面：有聲波區，顯示「麥克風已開啟」',s.mode==='expose'&&s.box&&/麥克風已開啟/.test(s.wst),s);
  await p.evaluate(()=>__mic.voice(.3));await p.waitForTimeout(900);s=await st(p);
  T('M2 說話時：聲波依實際音量升高，顯示「麥克風有收到你的聲音」',Math.max(...s.bars)>40&&/收到你的聲音/.test(s.wst),s);
  await p.evaluate(()=>__mic.voice(0));await p.waitForTimeout(1500);s=await st(p);
  T('M3 安靜時：聲波平穩；這個畫面不啟動語音辨識、不判定',Math.max(...s.bars)<=25&&s.srOn===0&&s.mode==='expose',s);
  await p.locator('button',{hasText:'我知道了'}).first().click();await p.waitForTimeout(3000);s=await st(p);
  T('M4 按「我知道了」之後：仍正常往下（不影響原本流程）',s.mode==='expose'||s.mode==='speak',s);await home(p);
  /* 口語練習第2站一星＝先聽示範再說 */
  await start(p,'oral',2,1);s=await st(p);T('M5 第2站一星的聽詞認識也有聲波區',s.mode==='expose'&&s.box,s);
  await p.locator('button',{hasText:'我知道了'}).first().click();await p.waitForTimeout(3200);s=await st(p);
  T('M6 接著的口說題：聲波區與語音辨識正常（第04批功能不變）',s.mode==='speak'&&s.box&&s.srOn===1&&/聆聽|先聽/.test(s.wst),s);await home(p);
  const g0=await p.evaluate(()=>window.__gum);await start(p,'quiet',1,1);s=await st(p);
  T('M7 聽讀練習：沒有聲波區、不要求麥克風',!s.box&&s.gum===g0,{s,g0});
  const d=await p.evaluate(()=>VDX.html());T('M8 語音診斷有「麥克風測試頁」連結',/mic-test\.html/.test(d));
  T('M9 沒有頁面錯誤',errs.length===0,errs);
  /* 麥克風測試頁（同一個瀏覽器，網站已有設定） */
  const q=await ctx.newPage();const qe=[];q.on('pageerror',e=>qe.push(e.message));await q.goto(BASE+'mic-test.html');await q.waitForTimeout(800);
  await q.locator('#bA button',{hasText:'取得麥克風'}).click();await q.waitForTimeout(600);let e=await q.locator('#eA').innerText();
  T('T1 測試頁 A：取得麥克風並顯示麥克風資訊（降噪、回音消除、自動增益）',/取得麥克風/.test(e)&&/降噪/.test(e),e);
  await q.locator('#bB button',{hasText:'開始聲波'}).click();await q.evaluate(()=>__mic.voice(.3));await q.waitForTimeout(1200);
  const hb=await q.evaluate(()=>Math.max(...[...document.querySelectorAll('#wv i')].map(b=>parseFloat(b.style.height)||0)));e=await q.locator('#eB').innerText();
  T('T2 測試頁 B：說話時長條跳動，顯示音量 dB 與音訊引擎狀態',hb>30&&/目前音量 -?\d/.test(e)&&/音訊引擎 running/.test(e),{hb,e});
  await q.evaluate(()=>__mic.voice(0));await q.locator('#bB button',{hasText:'停止'}).click();
  await q.locator('#bC button',{hasText:'開始辨識'}).click();await q.waitForTimeout(300);await q.evaluate(()=>__say('葡萄',true));await q.waitForTimeout(400);
  e=await q.locator('#eC').innerText();const tc=await q.locator('#tC').innerText();
  T('T3 測試頁 C：顯示辨識開始、最後結果「葡萄」、辨識結束',tc==='葡萄'&&/辨識開始/.test(e)&&/最後結果：葡萄/.test(e)&&/辨識結束/.test(e),{tc,e});
  await q.locator('#bD button',{hasText:'同時開始'}).click();await q.waitForTimeout(300);await q.evaluate(()=>{__mic.voice(.3);__say('蘋果',true)});await q.waitForTimeout(900);
  e=await q.locator('#eD').innerText();T('T4 測試頁 D：聲波與辨識同時進行，並記錄摘要',/聲波開始/.test(e)&&/最後結果：蘋果/.test(e)&&/聲波摘要/.test(e),e);
  e=await q.locator('#eE').innerText();T('T5 測試頁 E：唯讀顯示網站設定（學習模式、判定方式、聲波、辨識同意）',/學習模式/.test(e)&&/判定方式/.test(e)&&/聲音動畫/.test(e)&&/語音辨識同意/.test(e),e);
  await q.locator('#bA button.y').click();await q.locator('#bB button.y').click();const o=await q.locator('#out').inputValue();
  T('T6 結果文字可複製，包含 A～E',/^【麥克風測試結果】/.test(o)&&/\nA｜✔｜/.test(o)&&/\nB｜✔｜/.test(o)&&/\nE｜/.test(o),o.slice(0,300));
  T('T7 測試頁沒有錯誤',qe.length===0,qe);await ctx.close()}
 /* 從未開過網站的裝置：測試頁不會建立網站資料庫 */
 {const ctx=await b.newContext();await ctx.addInitScript({content:MS});const q=await ctx.newPage();await q.goto(BASE+'mic-test.html');await q.waitForTimeout(800);
  const e=await q.locator('#eE').innerText();const dbs=await q.evaluate(async()=>indexedDB.databases?(await indexedDB.databases()).map(d=>d.name):null);
  T('T8 沒開過網站的裝置：只顯示「沒有網站資料」，不建立網站資料庫（不影響之後開網站）',/還沒有網站資料|沒有網站設定/.test(e)&&(!dbs||!dbs.includes('trafficHero')),{e,dbs});await ctx.close()}
 await b.close();console.log(`\n${P} 通過 / ${F} 失敗`);process.exit(F?1:0)})().catch(e=>{console.error('CRASH',e);process.exit(2)});
