// 第02階段完整點擊流程（Chromium 模擬，不是真機）：首頁→模式→六站→設定→真實點圖作答→完成畫面→選擇其他站
const {chromium}=require('playwright');let P=0,F=0;const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
(async()=>{const b=await chromium.launch({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
const ctx=await b.newContext({viewport:{width:1100,height:800}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8124/1124-1-TEST/');await p.waitForFunction(()=>typeof FL!=='undefined'&&S&&S.cards&&S.cards.length,null,{timeout:40000});await p.waitForTimeout(1200);
await p.evaluate(()=>{window.confirm=()=>true;window.alert=()=>{};S.set.music=false;S.set.sound=false;V2.prepDone=true;S.set.ap=false;S.set.anim=false;save()});
await p.click('#n1');await p.click('.mc-quiet');await p.waitForTimeout(300);
T('六站地圖：不在同一頁放題數／難度',(await p.$$('.stc')).length===6&&(await p.$$('.fstar')).length===0);
await p.click('.stc >> nth=0 >> text=進入這一站');await p.waitForTimeout(300);
T('設定頁：題數、五星、範圍、開始',(await p.$$('.fn')).length>=7&&(await p.$$('.fstar')).length===5&&!!(await p.$('.fgob')));
await p.click('.fn >> text=10 題');await p.click('.fstar >> nth=1');await p.waitForTimeout(200);
const sel=await p.evaluate(()=>({n:FL.mem().n,star:FL.starFor(1,'quiet')}));T('選 10 題＋二星並記住',sel.n===10&&sel.star===2,sel);
await p.click('.fgob');await p.waitForTimeout(1200);
T('開始：10 題、二星',await p.evaluate(()=>G.on&&G.n===10&&FL.run.star===2));
const s0=await p.evaluate(()=>S.rw.stars);let prev=s0,dropped=false,wrongClicks=0;
for(let i=0;i<120;i++){if(await p.$('#arr'))break;
 const st=await p.evaluate(()=>({lock:G.lock,n:document.querySelectorAll('.pko:not(.dis)').length,stars:S.rw.stars,dis:document.querySelectorAll('.pko.dis').length}));
 if(st.stars<prev)dropped=true;prev=st.stars;if(st.dis>0)wrongClicks++;
 if(!st.lock&&st.n>0)await p.locator('.pko:not(.dis)').nth(0).click({force:true,timeout:2000}).catch(()=>{});
 else if(!st.lock&&await p.evaluate(()=>S.set.mode==='expose'))await p.evaluate(()=>EXP.done());/* 第04階段：新詞彙先看示範卡 */
 await p.waitForTimeout(450)}
T('星星整個過程沒有減少（答錯也不扣）',!dropped,{dropped});console.log('INFO 過程中出現答錯後重試次數',wrongClicks);
await p.waitForSelector('#arr',{timeout:15000}).catch(()=>{});
const info=await p.evaluate(()=>{const a=document.getElementById('arr');return a?{t:a.innerText,btns:[...a.querySelectorAll('.btns button')].map(x=>x.textContent.trim()),gain:S.rw.stars}:null});
T('完成畫面出現',!!info,info);
if(info){T('完成畫面只有：完成旅程／完成題數／本次獲得星星',/完成旅程/.test(info.t)&&/完成題數/.test(info.t)&&/本次獲得星星/.test(info.t)&&!/錯|排名|扣/.test(info.t),info.t);
 T('三個按鈕',JSON.stringify(info.btns.map(x=>x.replace(/^\S+\s*/,'')))==='["再練習一次","選擇其他站","返回首頁"]',info.btns);
 T('本次星星 = 10題×2星 = 20（答錯不扣、鼓勵星不重複）',info.gain-s0===20&&/⭐ 20/.test(info.t),{gain:info.gain-s0,t:info.t});
 await p.click('#arr .btns button >> text=再練習一次');await p.waitForTimeout(1500);T('再練習一次：以同樣設定重新開始',await p.evaluate(()=>G.on&&G.n===10&&FL.run.star===2&&G.done===0));
 await p.evaluate(()=>{arrive()});await p.waitForTimeout(600);
 await p.click('#arr .btns button >> text=選擇其他站');await p.waitForTimeout(500);T('選擇其他站：回到六站地圖',(await p.$$('.stc')).length===6&&!(await p.$('#arr')),null);
 await p.click('.stc >> nth=0 >> text=進入這一站');await p.waitForTimeout(300);
 const rem=await p.evaluate(()=>({n:FL.mem().n,star:FL.starFor(1,'quiet'),act:document.querySelector('.fn.on').textContent}));T('回到設定：記住 10 題與二星',rem.n===10&&rem.star===2,rem);
 await p.evaluate(()=>{FL.back()});await p.click('.stc >> nth=2 >> text=進入這一站').catch(()=>{});
 await p.evaluate(()=>{UI.view='home';UI.mode=null;home()});
 await p.evaluate(()=>{arrive&&0});}
T('沒有頁面錯誤',errs.length===0,errs.slice(0,2));
console.log(`E2E ${P} pass / ${F} fail`);await b.close();process.exit(F?1:0)})();
