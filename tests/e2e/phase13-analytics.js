// v20.0（Chromium 模擬，不是真機）：教師端學習分析——畫面、各尺寸不溢出、從分析開始練習
const {chromium}=require('playwright');let P=0,F=0;const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:820,height:1000}});const pg=await ctx.newPage();const errs=[],bad=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('response',r=>{if(r.status()>=400&&!/default-library/.test(r.url()))bad.push(r.status()+' '+r.url())});
await pg.goto('http://localhost:'+(process.env.E2E_PORT||8124)+'/1124-1-TEST/');
await pg.waitForFunction(()=>typeof LA!=='undefined'&&LIB.base&&S.cards.filter(c=>c.lib).length>=950,null,{timeout:60000});await pg.waitForTimeout(1500);
await pg.evaluate(()=>{window.confirm=()=>true;window.alert=m=>{window.__al=m};S.set.music=false;S.set.sound=false;S.set.anim=false;S.set.ap=false;V2.prepDone=true;
 const N=Date.now(),D=864e5;let q=0;const ids=['VOC0001','VOC0002','VOC0003','VOC0004','VOC0005'];
 S.recs=[];ids.forEach((id,k)=>{for(let i=0;i<4;i++)S.recs.push({id:'E'+(++q),learnerId:LRN.id(),itemId:id,itemKind:'word',itemText:'',game:'pick',outcome:k<2?'correct':(i%2?'wrong':'correct'),independent:k<2,hints:k<2?[]:[{type:'P2'}],first:{result:'correct'},ts:N-(i+1)*D,stage:1,ext:{fl:{st:1}},pk:{sub:'word',n:3},sub:'word'})});save();UI.pick&&UI.pick('quiet')});
for(const vp of [[390,800],[820,1000],[1280,800]]){
 await pg.setViewportSize({width:vp[0],height:vp[1]});
 await pg.evaluate(()=>{tab(2);sub='la';LA.ui.view='lv';LA.ui.open='LV01';tch()});await pg.waitForFunction(()=>/學習分析/.test(document.querySelector('#sp').innerText),null,{timeout:15000});
 const m=await pg.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,txt:document.querySelector('#sp').innerText.length,nan:/NaN|Infinity|undefined/.test(document.querySelector('#sp').innerText)}));
 T('學習分析在 '+vp[0]+' 寬度沒有橫向溢出、沒有 NaN',m.sw<=m.cw+2&&!m.nan&&m.txt>500,m);
}
await pg.setViewportSize({width:820,height:1000});
const t=await pg.evaluate(()=>{const s=performance.now();LA.view();return Math.round(performance.now()-s)});
T('學習分析（展開 Level 01）計算＋組版 < 1.5 秒（1000 詞、20 筆紀錄）',t<1500,t);
await pg.evaluate(()=>{LA.ui.view='rv';LA.re()});
T('智慧複習顯示待加強推薦',await pg.evaluate(()=>/用這 \d+ 個詞開始練習/.test(document.querySelector('#sp').innerText)));
await pg.evaluate(()=>{const n=LA.rec({},20).length;window.__n=n;LA.go(LA.rec({},20).map(x=>x.id),'待加強')});await pg.waitForTimeout(800);
const r=await pg.evaluate(()=>({src:S.set.src,cat:FL.mem().cat,n:FL.withSrc(FL.srcOf(FL.mem().range,FL.mem().cat),()=>pool().length),al:window.__al}));
T('從分析開始練習：範圍＝分析推薦、題庫只含推薦詞',r.cat==='la'&&r.n===await pg.evaluate(()=>window.__n),r);
// 實際開始第 1 站
await pg.evaluate(()=>{FL.open(1)});await pg.waitForTimeout(500);
const g=await pg.evaluate(()=>{FL.setStar&&FL.setStar(1);let ok=false,e='';try{ok=FL.go()}catch(x){e=x.message}return{ok,e,on:!!G.on,ids:G.q?G.q.map(c=>c.id):[],allow:S.set.laIds}});
T('用推薦的詞實際進入第 1 站練習，題目只來自推薦的詞',g.ok!==false&&g.on&&g.ids.length>0&&g.ids.every(id=>g.allow.includes(id)),g);
await pg.evaluate(()=>{try{leave()}catch(e){}});
T('沒有頁面錯誤、沒有資源 404',errs.length===0&&bad.length===0,{errs,bad:bad.slice(0,3)});
console.log('P',P,'F',F);await b.close();})();
