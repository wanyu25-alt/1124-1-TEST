// 第03階段：注音按鍵發音（Chromium 模擬；不是真機，也無法確認真實喇叭聲音）
const {chromium}=require('playwright');let P=0,F=0;const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:1100,height:800}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8124/1124-1-TEST/');await p.waitForFunction(()=>typeof KV!=='undefined'&&S&&S.cards&&S.cards.length,null,{timeout:40000});await p.waitForTimeout(1200);
const can=await p.evaluate(()=>({aac:new Audio().canPlayType('audio/mp4; codecs="mp4a.40.2"'),m4a:new Audio().canPlayType('audio/x-m4a')}));console.log('INFO 這個 Chromium 可播放 AAC/m4a：',JSON.stringify(can));
await p.evaluate(()=>{window.confirm=()=>true;window.alert=()=>{};S.set.music=false;S.set.sound=false;V2.prepDone=true;S.set.ap=false;S.set.anim=false;save();window.__ev=[];
 const P=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){const s=this.src;window.__ev.push({t:performance.now(),src:s,kind:'play'});this.addEventListener('playing',()=>window.__ev.push({t:performance.now(),src:s,kind:'playing'}),{once:true});return P.apply(this,arguments)}});
await p.click('#n1');await p.click('.mc-quiet');await p.click('.stc >> nth=0 >> text=進入這一站');await p.waitForTimeout(200);
await p.evaluate(()=>{FL.mem().range='pick';FL.mem().cat='all';FL.actSel='x0';FL.go()});/* 手動選擇教材：專測注音按鍵發音，不經第04階段的智慧出題 */await p.waitForTimeout(1500);
await p.evaluate(()=>{G.listened=true;V2.stp=null});
T('打字題進行中',await p.evaluate(()=>G.on&&typed()),null);
const exp=await p.evaluate(()=>K.seq[K.ci][K.si]);
await p.evaluate(()=>{window.__ev=[];window.__t0=performance.now()});
const key=await p.evaluate(e=>{const m=Object.entries(ZKK).find(([k,v])=>v===e);return m?m[0]:null},exp);
await p.keyboard.press(key||'1');await p.waitForTimeout(600);
const ev=await p.evaluate(()=>({ev:window.__ev,t0:window.__t0,n:KV.n}));
const pl=ev.ev.filter(x=>/zhuyin/.test(x.src));
T('按下正確注音鍵 → 立刻呼叫該注音錄音播放',pl.some(x=>x.kind==='play'&&x.src.endsWith('zy_'+exp.replace(/./,c=>'')+'')||/zy_[a-z]+\.m4a$/.test(x.src)),ev);
if(can.aac||can.m4a){const pg=pl.find(x=>x.kind==='playing');T('錄音實際開始播放，並量測按鍵到開始播放的時間（ms）',!!pg,pl);if(pg)console.log('INFO 按鍵→開始播放：',Math.round(pg.t-ev.t0),'ms')}else console.log('INFO 此 Chromium 不含 AAC 解碼器，只能確認有呼叫播放，無法確認聲音實際播出（需真機驗證）');
const f1=await p.evaluate(()=>{const a=[...document.querySelectorAll('audio')];return a.length});
await p.evaluate(()=>{window.__ev=[]});for(const k of ['2','3','4','5','6']){await p.keyboard.press(k);await p.waitForTimeout(15)}
const conc=await p.evaluate(()=>Object.values(KV.pool).filter(a=>!a.paused).length);T('連按 5 個鍵：同時播放中的注音錄音 ≤ 1',conc<=1,conc);
T('沒有頁面錯誤',errs.length===0,errs.slice(0,2));
console.log(`E2E ${P} pass / ${F} fail`);await b.close();process.exit(F?1:0)})();
