const {chromium}=require('playwright');
const URL='http://localhost:8124/1124-1-TEST/';let P=0,F=0;const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
const boot=async(ctx)=>{const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));await p.addInitScript(()=>{window.__gum=window.__gum||0;window.__st=[];const md=navigator.mediaDevices;if(md&&md.getUserMedia&&!md.getUserMedia.__stub){const o=md.getUserMedia.bind(md);md.getUserMedia=function(){window.__gum++;return o.apply(null,arguments).then(s=>{window.__st.push(s);return s})}}});
 await p.goto(URL);await p.waitForFunction(()=>typeof UI!=='undefined'&&S&&S.cards&&S.cards.length&&S.lrn,null,{timeout:40000});await p.waitForTimeout(1000);
 await p.evaluate(()=>{window.confirm=()=>true;window.alert=()=>{};S.set.music=false;S.set.sound=false;S.set.hz={...(S.set.hz||{}),free:true};V2.prepDone=true;S.set.n=3;save()});return p};
const live=p=>p.evaluate(()=>window.__st.filter(s=>s.getTracks().some(t=>t.readyState==='live')).length);
(async()=>{
// ===== A. 拒絕授權（不使用假授權旗標）=====
let b=await chromium.launch({args:['--use-fake-device-for-media-stream']});let ctx=await b.newContext({viewport:{width:1100,height:800}});await ctx.addInitScript(()=>{const md=navigator.mediaDevices;if(md){const f=function(){window.__gum=(window.__gum||0)+1;return Promise.reject(new DOMException('Permission denied','NotAllowedError'))};f.__stub=1;md.getUserMedia=f}});let p=await boot(ctx);
await p.evaluate(()=>{UI.micHide=false;S.set.micLaterAt=0;UI.view='home';home()});await p.waitForTimeout(600);
const a0=await p.evaluate(()=>({gum:window.__gum,rem:!!document.querySelector('#micrem .btn.go'),txt:(document.querySelector('#micrem')||{}).textContent}));
T('首頁（未選模式）顯示麥克風提醒，且尚未要求權限',a0.rem&&a0.gum===0&&/口語練習/.test(a0.txt)&&/聽讀練習不需要/.test(a0.txt)&&/立即授權/.test(a0.txt)&&/稍後再設定/.test(a0.txt),a0);
await p.click('#micrem .btn.go');await p.waitForTimeout(1200);
const a1=await p.evaluate(()=>({gum:window.__gum,st:UI.mic.state,txt:(document.querySelector('#micrem')||{}).textContent}));
T('按「立即授權」被拒絕：只要求一次，顯示說明且聽讀不受影響',a1.gum===1&&a1.st==='denied'&&/聽讀練習不受影響/.test(a1.txt||''),a1);
await p.evaluate(()=>{UI.view='home';home()});await p.waitForTimeout(800);
const a2=await p.evaluate(()=>({gum:window.__gum}));T('重新回首頁不會再自動要求權限',a2.gum===1,a2);
await p.evaluate(()=>{UI.pick('quiet');goV('bike')});await p.waitForTimeout(2500);
await p.evaluate(()=>{for(let k=0;k<3&&G.on;k++){}});
await p.evaluate(()=>{for(const c of K.seq.flat()){if(!G.on||G.lock)break;kPress(c,'physical')}});await p.waitForTimeout(2000);
const a3=await p.evaluate(()=>({on:G.on,done:G.done,recs:S.recs.length,gum:window.__gum}));
T('拒絕授權後聽讀練習正常作答並有紀錄',a3.on&&a3.done>=1&&a3.recs>=1&&a3.gum===1,a3);
await p.evaluate(()=>{leave()});await p.waitForTimeout(500);
await p.evaluate(()=>{UI.pick('oral');goV('hsr')});await p.waitForTimeout(3500);
const a4=await p.evaluate(()=>({on:G.on,gum:window.__gum,bot:(document.querySelector('#bot')||{}).textContent.slice(0,80),mic:!!MIC.st}));
T('拒絕授權後進口語練習：不崩潰、不連續跳出權限（getUserMedia 增加≤1）',a4.on&&a4.gum<=2&&!a4.mic,a4);
T('無頁面錯誤(A)',p.errs.length===0,p.errs);await b.close();
// ===== B. 已授權 =====
b=await chromium.launch({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});ctx=await b.newContext({viewport:{width:1100,height:800}});p=await boot(ctx);
await p.evaluate(()=>{UI.micHide=false;S.set.micLaterAt=0;home()});await p.waitForTimeout(500);
await p.click('#micrem .btn.go');await p.waitForTimeout(1200);
const b1=await p.evaluate(()=>({gum:window.__gum,st:UI.mic.state,mic:!!MIC.st,rem:!!document.querySelector('#micrem .btn')}));const l1=await live(p);
T('授權後立即釋放麥克風（沒有常駐收音）',b1.st==='granted'&&l1===0&&!b1.mic&&!b1.rem,{b1,l1});
await p.evaluate(()=>{UI.pick('oral');goV('hsr')});await p.waitForTimeout(4000);
const b2=await p.evaluate(()=>({on:G.on,mic:!!MIC.st,mode:S.set.mode,prep:!!document.querySelector('#prep')}));
if(b2.prep){await p.evaluate(()=>V2.prepGo(true));await p.waitForTimeout(2500)}
const b2b=await p.evaluate(()=>({on:G.on,mic:!!MIC.st,mode:S.set.mode}));const l2=await live(p);
T('口語題目進行中才收音',b2b.on&&b2b.mic&&l2>=1,{b2b,l2});
await p.evaluate(()=>UI.navTo(1));await p.waitForTimeout(500);
await p.evaluate(()=>hmGo(0));await p.waitForTimeout(1200);
const b3=await p.evaluate(()=>({on:G.on,mic:!!MIC.st,asr:!!ASR.on}));const l3=await live(p);
T('離開口語題目後停止收音（無 live 軌道、無辨識進行中）',!b3.on&&!b3.mic&&!b3.asr&&l3===0,{b3,l3});
await p.evaluate(()=>{UI.pick('quiet');goV('car')});await p.waitForTimeout(2500);
const l4=await live(p),b4=await p.evaluate(()=>!!MIC.st);T('聽讀練習中沒有收音',l4===0&&!b4,{l4,b4});
await p.evaluate(()=>leave());
// 綜合：逐題觀察收音狀態
await p.evaluate(()=>{UI.pick('integ');goV('plane')});await p.waitForTimeout(1500);await p.evaluate(()=>{G.orSet=new Set([0,2])});await p.waitForTimeout(2500);
const p2=await p.evaluate(()=>!!document.querySelector('#prep'));if(p2){await p.evaluate(()=>V2.prepGo(true));await p.waitForTimeout(2500)}
const obs=[];for(let q=0;q<4;q++){await p.waitForTimeout(1200);obs.push(await p.evaluate(()=>({mode:S.set.mode,mic:!!MIC.st,orq:!!G.orq,i:G.i,on:G.on})));
 await p.evaluate(()=>{if(typeof typed==='function'&&typed()&&K&&K.seq){for(const c of K.seq.flat()){if(!G.on||G.lock)break;kPress(c,'physical')}}});await p.waitForTimeout(2600)}
console.log('綜合練習逐題收音觀察',JSON.stringify(obs));T('綜合練習：沒有口語步驟的題目不收音、有口語步驟的題目才收音',obs.every(o=>o.mic===(o.mode==='speak'||o.orq)),obs);
T('無頁面錯誤(B)',p.errs.length===0,p.errs);await b.close();
console.log('PASS',P,'FAIL',F)})();
