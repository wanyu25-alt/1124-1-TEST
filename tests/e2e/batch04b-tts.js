// v22.5.1 第04-B批：合成語音（AI 念詞彙）低風險修正與語音測試頁（Chromium 模擬；聲音由 lib/audio-stub.js 記錄，不是喇叭的真實聲音）
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const BASE='http://localhost:'+(process.env.E2E_PORT||8124)+'/1124-1-TEST/';let P=0,F=0;
const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x===undefined?null:x).slice(0,500))};
const AS=fs.readFileSync(path.join(__dirname,'lib','audio-stub.js'),'utf8');
/* 記錄每一次 speak／cancel／resume（在音訊替身之後包一層） */
const SPY=`(()=>{const P=SpeechSynthesis.prototype;window.__sp=[];window.__cn=0;window.__rs=0;const sp=P.speak,cn=P.cancel,rs=P.resume;
 P.speak=function(u){window.__sp.push({text:u.text,vol:u.volume==null?1:u.volume,t:Math.round(performance.now()),n:window.__cn});return sp.call(this,u)};
 P.cancel=function(){window.__cn++;return cn.call(this)};P.resume=function(){window.__rs++;return rs&&rs.call(this)}})();`;
const IPHONE='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const ready=async p=>{await p.waitForFunction(()=>typeof S!=='undefined'&&S.cards&&S.cards.length>=1000&&S.lrn&&typeof P29!=='undefined',null,{timeout:60000});await p.waitForTimeout(1000);await p.evaluate(()=>{window.confirm=()=>true;window.alert=()=>{}})};
const open=async(b,o={})=>{const ctx=await b.newContext({viewport:o.vp||{width:1280,height:850},...(o.ua?{userAgent:o.ua,isMobile:true,hasTouch:true}:{})});await ctx.addInitScript({content:AS});await ctx.addInitScript({content:SPY});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(BASE+(o.page||''));if(!o.page)await ready(p);return{ctx,p,errs}};
(async()=>{const b=await chromium.launch();
 /* ===== A：電腦瀏覽器（Chrome） ===== */
 {const c=await open(b);const a0=await c.p.evaluate(()=>({cn:window.__cn,sp:window.__sp.length,ios:P29.ios}));
  T('A1 開啟網頁時先清除一次語音佇列（cancel），而且是在念任何語音之前',a0.cn>=1&&a0.sp===0&&a0.ios===false,a0);
  await c.p.mouse.click(640,300);await c.p.waitForTimeout(400);
  await c.p.locator(`[onclick="UI.pick('quiet')"]`).click();await c.p.waitForTimeout(400);await c.p.locator('[onclick="FL.open(1)"]').first().click();await c.p.waitForTimeout(300);
  await c.p.locator('.fstar').nth(0).click();await c.p.getByRole('button',{name:'自行選擇教材'}).click();await c.p.locator('#fl_go').click();await c.p.waitForTimeout(4500);
  const r=await c.p.evaluate(()=>({sp:window.__sp,rs:window.__rs,cur:G.cur&&G.cur.text,last:P29.last}));
  const silent=r.sp.filter(x=>!String(x.text).trim()||x.vol===0);
  T('A2 電腦瀏覽器：不再念「音量 0／空白」的解鎖語音',silent.length===0,silent);
  T('A3 聽讀練習的題目詞彙仍會用合成語音念出來（音量大於 0）',r.sp.some(x=>x.text===r.cur&&x.vol>0),{cur:r.cur,sp:r.sp.map(x=>x.text+'/'+x.vol)});
  T('A4 沒有暫停時不呼叫 resume（每次念之前不再強制 resume）',r.rs===0,r.rs);
  T('A5 記錄最近一次合成語音的瀏覽器回報（開始、結束）',r.last&&r.last.text===r.cur&&r.last.start!=null&&r.last.end!=null,r.last);
  const d=await c.p.evaluate(()=>VDX.html());T('A6 語音診斷顯示目前語音、最近一次回報、語音測試頁連結',/合成語音（AI 念詞彙）檢查/.test(d)&&/tts-test\.html/.test(d)&&/最近一次/.test(d),d.slice(-400));
  const v=await c.p.evaluate(()=>APP.build+' '+APP.id);T('A7 版本 v22.5.1',/^v22\.5\.1 \d{8}-\w+$/.test(v),v);
  T('A8 沒有頁面錯誤',c.errs.length===0,c.errs);await c.ctx.close()}
 /* ===== B：iPhone（模擬 User-Agent）仍保留解鎖，但用正常音量 ===== */
 {const c=await open(b,{ua:IPHONE,vp:{width:390,height:844}});const a0=await c.p.evaluate(()=>({ios:P29.ios,cn:window.__cn}));
  T('B1 iPhone：判斷為 iOS；開啟時不主動 cancel（iOS 連續 cancel→speak 會吃掉語音）',a0.ios===true&&a0.cn===0,a0);
  await c.p.evaluate(()=>AM.unlock());await c.p.waitForTimeout(300);const u=await c.p.evaluate(()=>window.__sp.slice(0,3));
  T('B2 iPhone：第一次點擊時念一個空格解鎖，音量不是 0',u.length>=1&&u[0].text===' '&&u[0].vol>0&&!u.some(x=>x.vol===0),u);
  await c.p.evaluate(()=>AM.unlock());await c.p.waitForTimeout(200);const n=await c.p.evaluate(()=>window.__sp.length);T('B3 iPhone：解鎖只做一次',n===u.length,{n,u:u.length});
  await c.ctx.close()}
 /* ===== C：語音測試頁 ===== */
 {const c=await open(b,{page:'tts-test.html'});await c.p.waitForTimeout(500);
  const btn=await c.p.locator('button',{hasText:'▶ 測試'}).count();T('C1 語音測試頁可以開啟，有 11 個測試項目',btn===11,btn);
  await c.p.locator('#rA button',{hasText:'▶ 測試'}).click();await c.p.waitForTimeout(800);await c.p.locator('#rA button',{hasText:'有聽到'}).click();
  await c.p.locator('#rJ button',{hasText:'▶ 測試'}).click();await c.p.waitForTimeout(800);await c.p.locator('#rJ button',{hasText:'沒聽到'}).click();
  const o=await c.p.locator('#out').inputValue();
  T('C2 每一項顯示瀏覽器回報（開始、結束），結果文字記錄「有聽到／沒聽到」',/A 最簡單.*有聽到.*開始@\d+ms.*結束@\d+ms/.test(o)&&/J .*沒聽到/.test(o),o);
  const sent=await c.p.evaluate(()=>performance.getEntriesByType('resource').filter(e=>!e.name.includes('tts-test.html')).map(e=>e.name));
  T('C3 測試頁不載入、不送出任何其他資料',sent.length===0,sent);
  T('C4 沒有頁面錯誤',c.errs.length===0,c.errs);await c.ctx.close()}
 await b.close();console.log(`\n${P} 通過 / ${F} 失敗`);process.exit(F?1:0)})().catch(e=>{console.error('CRASH',e);process.exit(2)});
