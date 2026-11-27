// v22.5.4 第04-E批：iPhone／iPad 播放預錄詞彙音檔（Chromium＋iPhone User-Agent 模擬；聲音由 lib/audio-stub.js 記錄，不是喇叭的真實聲音）
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const BASE='http://localhost:'+(process.env.E2E_PORT||8124)+'/1124-1-TEST/';let P=0,F=0;
const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x===undefined?null:x).slice(0,500))};
const AS=fs.readFileSync(path.join(__dirname,'lib','audio-stub.js'),'utf8');
const IPHONE='Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.7 Mobile/15E148 Safari/604.1';
const ready=async p=>{await p.waitForFunction(()=>typeof S!=='undefined'&&S.cards&&S.cards.length>=1000&&S.lrn&&typeof P32!=='undefined',null,{timeout:60000});await p.waitForTimeout(1200);
 await p.evaluate(()=>{window.confirm=()=>true;window.alert=()=>{};window.sl=ms=>new Promise(r=>setTimeout(r,ms));window.pre=()=>window.__al.filter(x=>/voice\/tts\//.test(x.a||'')).map(x=>x.a.replace(/^.*voice\/tts\//,''));window.tts=()=>window.__al.filter(x=>x.tts).map(x=>x.tts)})};
const open=async(b,ios)=>{const ctx=await b.newContext(ios?{userAgent:IPHONE,viewport:{width:430,height:900},isMobile:true,hasTouch:true}:{viewport:{width:1280,height:900}});await ctx.addInitScript({content:AS});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(BASE);await ready(p);return{ctx,p,errs}};
const start=async(p,mode,st,star)=>{await p.mouse.click(200,200);await p.locator(`[onclick="UI.pick('${mode}')"]`).click();await p.waitForTimeout(400);await p.locator(`[onclick="FL.open(${st})"]`).first().click();await p.waitForTimeout(300);
 await p.locator('.fstar').nth(star-1).click();await p.getByRole('button',{name:'自行選擇教材'}).click();await p.evaluate(()=>{window.__al.length=0});await p.locator('#fl_go').click();await p.waitForTimeout(3800)};
const home=async p=>{await p.locator('button:visible',{hasText:'首頁'}).first().click();await p.waitForTimeout(400);await p.locator('#hm button',{hasText:'返回首頁'}).click();await p.waitForTimeout(600)};
const fileOf=(p,t)=>p.evaluate(t=>P32.map&&P32.map[t],t);
(async()=>{const b=await chromium.launch();
 /* ===== I：iPhone ===== */
 {const c=await open(b,true);const m=await c.p.evaluate(()=>({on:P32.on(),n:P32.map?Object.keys(P32.map).length:0,lib:S.cards.filter(x=>x.lib).every(x=>P32.has(x.text))}));
  T('I1 iPhone：載入預錄音檔清單（1000 個詞彙＋逐音引導單字），每個正式詞彙都有音檔',m.on&&m.n>=1800&&m.lib,m);
  await start(c.p,'quiet',1,1);let r=await c.p.evaluate(()=>({cur:G.cur.text,pre:pre(),tts:tts(),vis:$('#pkw')?!$('#pkw').classList.contains('hide'):false}));let f=await fileOf(c.p,r.cur);
  T('I2 聽詞選圖：題目詞彙播放預錄音檔（不是網頁合成語音）',r.pre.includes(f)&&!r.tts.includes(r.cur),{r,f});
  T('I3 有音檔時不再自動顯示文字（學生用聽的）',!r.vis,r);
  await c.p.evaluate(()=>{window.__al.length=0;PICK.play(true)});await c.p.waitForTimeout(800);r=await c.p.evaluate(()=>({cur:G.cur.text,pre:pre()}));f=await fileOf(c.p,r.cur);
  T('I4 按「聽題目」再聽一次：播放預錄音檔',r.pre.includes(f),{r,f});await home(c.p);
  await start(c.p,'quiet',2,1);r=await c.p.evaluate(()=>({cur:G.cur.text,pre:pre(),txt:!!$('#iosTxt')}));f=await fileOf(c.p,r.cur);
  T('I5 看圖打字：題目詞彙播放預錄音檔，不顯示文字',r.pre.includes(f)&&!r.txt,{r,f});
  r=await c.p.evaluate(async()=>{window.__al.length=0;const c=G.cur,seq=ZG.norm(zyToks(c.zy)),pl=ZG.charPlan(0,c,seq);if(pl.tts)TTSX.say(pl.tts,{});await sl(500);return{pl:{how:pl.how,tts:pl.tts},pre:pre()}});
  const cf=r.pl.tts?await fileOf(c.p,r.pl.tts):null;T('I6 逐音引導念單字（聲調）：播放該字的預錄音檔',!r.pl.tts||r.pre.includes(cf),{r,cf});
  r=await c.p.evaluate(async()=>{speak(G.cur);await sl(50);return{src:SP.audio&&SP.audio.src.replace(/^.*voice\/tts\//,''),rate:SP.audio&&SP.audio.playbackRate,cur:G.cur.text}});f=await fileOf(c.p,r.cur);
  T('I7 提示「聽整個詞」：播放預錄音檔，速度沿用 AI 語速（不套用真人錄音 1.25 倍）',r.src===f&&Math.abs(r.rate-1)<.01,{r,f});
  r=await c.p.evaluate(async()=>{S.set.ttsRate=.6;window.__al.length=0;TTSX.say('葡萄',{});await sl(100);const x={rate:P32.audio().playbackRate};S.set.ttsRate=.75;return x});
  T('I8 老師把 AI 語速改成 0.6：預錄音檔依比例放慢（0.8 倍）',Math.abs(r.rate-.8)<.01,r);
  r=await c.p.evaluate(async()=>{window.__al.length=0;TTSX.say('老師自訂的詞XYZ',{});await sl(400);return{pre:pre(),tts:tts()}});
  T('I9 沒有預錄音檔的文字（例如老師自訂教材）：照舊用合成語音',r.pre.length===0&&r.tts.includes('老師自訂的詞XYZ'),r);
  const d=await c.p.evaluate(()=>VDX.html());T('I10 語音診斷顯示預錄音檔段數與播放次數',/預錄音檔：\d+ 段/.test(d),d.slice(-500));
  T('I11 沒有頁面錯誤',c.errs.length===0,c.errs);await c.ctx.close()}
 /* ===== D：電腦（不變） ===== */
 {const c=await open(b,false);await start(c.p,'quiet',1,1);const r=await c.p.evaluate(()=>({on:P32.on(),map:!!P32.map,pre:pre(),tts:tts(),cur:G.cur.text}));
  T('D1 電腦瀏覽器：不下載、不使用預錄音檔，照舊用合成語音念題目',!r.on&&!r.map&&r.pre.length===0&&r.tts.includes(r.cur),r);T('D2 沒有頁面錯誤',c.errs.length===0,c.errs);await c.ctx.close()}
 await b.close();console.log(`\n${P} 通過 / ${F} 失敗`);process.exit(F?1:0)})().catch(e=>{console.error('CRASH',e);process.exit(2)});
