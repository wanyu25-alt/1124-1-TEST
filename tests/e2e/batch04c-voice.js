// v22.5.2 第04-C批：語音挑選避開趣味語音、偵測瀏覽器語音卡住（WebKit 用本機真實語音清單；Chromium 用語音替身；不是喇叭的真實聲音）
const pw=require('playwright');const fs=require('fs'),path=require('path');
const BASE='http://localhost:'+(process.env.E2E_PORT||8124)+'/1124-1-TEST/';let P=0,F=0;
const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x===undefined?null:x).slice(0,500))};
const AS=fs.readFileSync(path.join(__dirname,'lib','audio-stub.js'),'utf8'),VS=fs.readFileSync(path.join(__dirname,'lib','voice-stub.js'),'utf8');
/* Safari 的實際排序：趣味語音 Shelley 排第一、美佳在後面 */
const VOICES=`window.__voices=[{name:'Shelley (中文（台灣）)',lang:'zh-TW',localService:true,voiceURI:'shelley'},{name:'Grandma (中文（台灣）)',lang:'zh-TW',localService:true,voiceURI:'grandma'},
 {name:'Eddy (中文（台灣）)',lang:'zh-TW',localService:true,voiceURI:'eddy'},{name:'美佳',lang:'zh-TW',localService:true,voiceURI:'meijia'},{name:'Google 國語（臺灣）',lang:'zh-TW',localService:false,voiceURI:'g-tw'},
 {name:'Tingting',lang:'zh-CN',localService:true,voiceURI:'tingting'},{name:'Samantha',lang:'en-US',localService:true,voiceURI:'samantha'}];`;
const ready=async p=>{await p.waitForFunction(()=>typeof S!=='undefined'&&S.cards&&S.cards.length>=1000&&S.lrn&&typeof P30!=='undefined',null,{timeout:60000});await p.waitForTimeout(1500);await p.evaluate(()=>{window.confirm=()=>true;window.alert=()=>{}})};
(async()=>{
 /* ===== W：WebKit（Safari 引擎），這台 Mac 的真實語音清單 ===== */
 {const b=await pw.webkit.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(BASE);await ready(p);
  const r=await p.evaluate(()=>{const tw=TTSX.voices().filter(v=>/^zh[-_]TW/i.test(v.lang));const c=TTSX.cands();return{n:tw.length,first:tw[0]&&tw[0].name,pick:TTSX.pick()&&TTSX.pick().name,
   novIdx:c.map((v,i)=>P30.nov(v)?i:-1).filter(i=>i>=0),normIdx:c.map((v,i)=>!P30.nov(v)?i:-1).filter(i=>i>=0)}});
  if(r.n){T('W1 Safari 引擎：自動選用美佳（Meijia），不是清單第一個的趣味語音（'+r.first+'）',/Meijia|美佳/.test(r.pick||''),r);
   T('W2 趣味語音一律排在正常語音後面（只當最後備援）',!r.novIdx.length||Math.min(...r.novIdx)>Math.max(...r.normIdx),r);
   const q=await p.evaluate(()=>{const nv=TTSX.voices().find(v=>P30.nov(v));if(!nv)return null;S.set.ttsVoice=nv.name;const k=TTSX.pick().name;delete S.set.ttsVoice;return{nv:nv.name,k}});
   T('W3 老師在語音診斷指定的語音（即使是趣味語音）仍然最優先',!q||q.k===q.nv,q);
   const d=await p.evaluate(()=>VDX.list());T('W4 語音診斷清單標示「趣味語音，不建議」',/趣味語音，不建議/.test(d),d.slice(0,300))}
  else T('W1 這個環境的 WebKit 沒有中文語音（略過）',true);
  T('W5 沒有頁面錯誤',errs.length===0,errs);await b.close()}
 const b=await pw.chromium.launch();
 /* ===== C：Chromium，語音順序與 Safari 相同（Shelley 在前） ===== */
 {const ctx=await b.newContext();await ctx.addInitScript({content:AS});await ctx.addInitScript({content:VOICES+VS});const p=await ctx.newPage();await p.goto(BASE);await ready(p);
  const r=await p.evaluate(()=>({pick:TTSX.pick().name,c:TTSX.cands().map(v=>v.name)}));
  T('C1 自動選用美佳；Google 國語其次；趣味語音排最後',r.pick==='美佳'&&r.c[1]==='Google 國語（臺灣）'&&/Shelley|Grandma|Eddy/.test(r.c[r.c.length-1])&&r.c.slice(0,3).every(n=>!/Shelley|Grandma|Eddy/.test(n)),r);
  await p.evaluate(()=>{window.__al.length=0;TTSX.say('葡萄',{})});await p.waitForTimeout(500);const al=await p.evaluate(()=>window.__al.filter(x=>x.tts).map(x=>x.voice));
  T('C2 念詞彙時實際使用美佳',al[0]==='美佳',al);
  await p.evaluate(()=>{window.__vb={'美佳':'error'};window.__al.length=0;TTSX.say('棉被',{})});await p.waitForTimeout(900);const al2=await p.evaluate(()=>window.__al.filter(x=>x.tts).map(x=>x.voice));
  T('C3 美佳失敗時，改用下一個正常語音（不是趣味語音）',al2[0]==='美佳'&&al2[1]==='Google 國語（臺灣）',al2);await ctx.close()}
 /* ===== K：瀏覽器語音卡住（一直「正在念」卻沒有開始） ===== */
 {const ctx=await b.newContext();await ctx.addInitScript({content:AS});await ctx.addInitScript({content:VOICES+VS+`;window.__vb=new Proxy({},{get:()=>'nostart'});`});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(BASE);await ready(p);
  const one=()=>p.evaluate(()=>new Promise(res=>TTSX.say('葡萄',{startMs:300,max:2000,onend:()=>res('end'),onfail:r=>res('fail:'+r)})));
  const r1=await one();const b1=await p.locator('#ttsStuck').count();
  T('K1 第一次念不出來：只改顯示文字，先不跳出提示',/^fail:/.test(r1)&&b1===0,{r1,b1});
  const r2=await one();await p.waitForTimeout(200);const b2=await p.locator('#ttsStuck').count(),t2=b2?await p.locator('#ttsStuck').innerText():'';
  T('K2 連續兩次念不出來且瀏覽器一直在「念」：顯示給大人的提示（完全結束瀏覽器再開、或改用 Safari）',/^fail:/.test(r2)&&b2===1&&/⌘Q/.test(t2)&&/Safari/.test(t2),{r2,b2,t2});
  await one();await p.waitForTimeout(200);T('K3 提示只顯示一次',await p.locator('#ttsStuck').count()===1);
  const d=await p.evaluate(()=>VDX.html());T('K4 語音診斷顯示「語音狀態：卡住」',/語音狀態：卡住/.test(d),d.slice(-500));
  await p.locator('#ttsStuck button').click();T('K5 按「知道了」關閉提示',await p.locator('#ttsStuck').count()===0);
  T('K6 沒有頁面錯誤',errs.length===0,errs);await ctx.close()}
 /* ===== N：一般被瀏覽器擋自動播放（沒有在「念」）不會誤判成卡住 ===== */
 {const ctx=await b.newContext();await ctx.addInitScript({content:AS});await ctx.addInitScript({content:VOICES+VS+`;window.__vb=new Proxy({},{get:()=>'notallowed'});`});const p=await ctx.newPage();await p.goto(BASE);await ready(p);
  for(let i=0;i<3;i++)await p.evaluate(()=>new Promise(res=>TTSX.say('葡萄',{startMs:300,max:2000,onend:res,onfail:res})));
  T('N1 播放被擋（沒有卡在「念」）：不顯示卡住提示',await p.locator('#ttsStuck').count()===0);await ctx.close()}
 await b.close();console.log(`\n${P} 通過 / ${F} 失敗`);process.exit(F?1:0)})().catch(e=>{console.error('CRASH',e);process.exit(2)});
