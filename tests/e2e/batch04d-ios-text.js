// v22.5.3 第04-D批：iPhone／iPad 念題目時自動顯示題目文字（v22.5.4 起為「沒有預錄音檔時」的備援）（Chromium＋iPhone User-Agent 模擬；不是真機）
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const BASE='http://localhost:'+(process.env.E2E_PORT||8124)+'/1124-1-TEST/';let P=0,F=0;
const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x===undefined?null:x).slice(0,500))};
const AS=fs.readFileSync(path.join(__dirname,'lib','audio-stub.js'),'utf8'),MS=fs.readFileSync(path.join(__dirname,'lib','mic-stub.js'),'utf8');
const IPHONE='Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.7 Mobile/15E148 Safari/604.1';
const ready=async p=>{await p.waitForFunction(()=>typeof S!=='undefined'&&S.cards&&S.cards.length>=1000&&S.lrn&&typeof P31!=='undefined',null,{timeout:60000});await p.waitForTimeout(1000);await p.evaluate(()=>{window.confirm=()=>true;window.alert=()=>{}})};
const open=async(b,ios)=>{const ctx=await b.newContext(ios?{userAgent:IPHONE,viewport:{width:430,height:900},isMobile:true,hasTouch:true}:{viewport:{width:1280,height:900}});await ctx.addInitScript({content:AS});await ctx.addInitScript({content:MS});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(BASE);await ready(p);
 /* v22.5.4 起 iPhone 有預錄音檔時改播音檔；這裡關閉預錄音檔，測「沒有音檔時顯示文字」的備援 */
 await p.evaluate(()=>{S.set.iosPre=false});return{ctx,p,errs}};
const start=async(p,mode,st,star)=>{await p.locator(`[onclick="UI.pick('${mode}')"]`).click();await p.waitForTimeout(400);await p.locator(`[onclick="FL.open(${st})"]`).first().click();await p.waitForTimeout(300);
 await p.locator('.fstar').nth(star-1).click();await p.getByRole('button',{name:'自行選擇教材'}).click();await p.locator('#fl_go').click();await p.waitForTimeout(900);
 if(await p.locator('#prep').count())await p.locator('#prep button',{hasText:'啟用麥克風並開始'}).click();await p.waitForTimeout(3500)};
const home=async p=>{await p.locator('button:visible',{hasText:'首頁'}).first().click();await p.waitForTimeout(400);await p.locator('#hm button',{hasText:'返回首頁'}).click();await p.waitForTimeout(600)};
(async()=>{const b=await chromium.launch();
 /* ===== I：iPhone ===== */
 {const c=await open(b,true);T('I0 判斷為 iPhone／iPad',await c.p.evaluate(()=>P29.ios&&P31.on()));
  await start(c.p,'quiet',1,1);let r=await c.p.evaluate(()=>({mode:S.set.mode,cur:G.cur&&G.cur.text,pkw:($('#pkw')||{}).textContent,vis:$('#pkw')?!$('#pkw').classList.contains('hide'):false,aid:G.pk&&G.pk.aidA}));
  T('I1 聽詞選圖：念題目時自動顯示題目文字（沿用「顯示文字」）',r.mode==='pick'&&r.vis&&r.pkw===r.cur&&r.aid==='ios-tts',r);await home(c.p);
  await start(c.p,'quiet',2,1);r=await c.p.evaluate(()=>({mode:S.set.mode,cur:G.cur&&G.cur.text,t:($('#iosTxt')||{}).textContent}));
  T('I2 看圖打字：圖片下方顯示題目詞彙',r.mode==='key'&&r.t===r.cur,r);
  const z=await c.p.evaluate(async()=>{const s=K.seq[0][0];kPress(s==='˙'?K.seq[0][1]:s,'physical_keyboard');await new Promise(r=>setTimeout(r,900));return{t:($('#iosTxt')||{}).textContent,cur:G.cur.text}});
  T('I3 按鍵後畫面更新：題目文字仍然在',z.t===z.cur,z);
  await c.p.evaluate(()=>hSkip());await c.p.waitForTimeout(600);const rec=await c.p.evaluate(()=>{const r=S.recs[S.recs.length-1];return r&&r.ext&&r.ext.tx});
  T('I4 紀錄標示「語音異常、改看文字」（不計入純聽覺能力）',rec&&rec.v===1&&rec.a==='ios-tts',rec);
  await c.p.waitForTimeout(3000);r=await c.p.evaluate(()=>({t:($('#iosTxt')||{}).textContent,cur:G.cur&&G.cur.text}));T('I5 下一題換成新詞彙的文字',r.t===r.cur,r);await home(c.p);
  await start(c.p,'oral',2,3);r=await c.p.evaluate(()=>({mode:S.set.mode,t:$('#iosTxt')?$('#iosTxt').textContent:null,word:($('#word')||{}).textContent,cur:G.cur&&G.cur.text}));
  T('I6 口語看圖說詞：不顯示答案文字',r.mode==='speak'&&r.t===null&&r.word!==r.cur,r);
  T('I7 沒有頁面錯誤',c.errs.length===0,c.errs);await c.ctx.close()}
 /* ===== D：電腦（不影響） ===== */
 {const c=await open(b,false);await start(c.p,'quiet',1,1);let r=await c.p.evaluate(()=>({ios:P29.ios,vis:$('#pkw')?!$('#pkw').classList.contains('hide'):false}));
  T('D1 電腦瀏覽器：聽詞選圖不自動顯示文字（維持原本）',!r.ios&&!r.vis,r);await home(c.p);
  await start(c.p,'quiet',2,1);r=await c.p.evaluate(()=>!!$('#iosTxt'));T('D2 電腦瀏覽器：打字題不顯示詞彙文字',r===false);T('D3 沒有頁面錯誤',c.errs.length===0,c.errs);await c.ctx.close()}
 await b.close();console.log(`\n${P} 通過 / ${F} 失敗`);process.exit(F?1:0)})().catch(e=>{console.error('CRASH',e);process.exit(2)});
