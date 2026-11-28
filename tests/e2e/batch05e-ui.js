// v22.6.4 第05-E批：首頁不顯示車子動畫、上方選單改名、學習分析（五邊形圖、陪伴建議、生活問法）、設定精簡
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const BASE='http://localhost:'+(process.env.E2E_PORT||8124)+'/1124-1-TEST/';let P=0,F=0;
const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x===undefined?null:x).slice(0,600))};
const AS=fs.readFileSync(path.join(__dirname,'lib','audio-stub.js'),'utf8');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900}});await ctx.addInitScript({content:AS});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(BASE);
 await p.waitForFunction(()=>typeof S!=='undefined'&&S.cards&&S.cards.length>=1000&&S.lrn&&typeof P38!=='undefined',null,{timeout:60000});await p.waitForTimeout(800);
 await p.evaluate(()=>{window.confirm=()=>true;window.alert=()=>{};window.sl=ms=>new Promise(r=>setTimeout(r,ms))});
 const nav=await p.evaluate(()=>[...document.querySelectorAll('nav button')].map(b=>b.textContent.trim()));
 T('E1 上方選單由左至右：首頁｜學習分析｜設定｜後台更改',JSON.stringify(nav)===JSON.stringify(['🏠 首頁','📊 學習分析','⚙ 設定','🛠 後台更改']),nav);
 const h=await p.evaluate(()=>({disp:getComputedStyle(document.getElementById('scene')).display,ig:document.body.classList.contains('ig'),train:!!document.getElementById('train')}));
 T('E2 首頁不顯示車子動畫（元素仍保留，程式不出錯）',h.disp==='none'&&!h.ig&&h.train,h);
 /* 練習中保留動畫，且車子位置正常 */
 const g=await p.evaluate(async()=>{UI.pick('quiet');await sl(300);FL.open(1);await sl(300);FL.setStar(2);await sl(300);document.getElementById('fl_go').click();await sl(2500);const sc=document.getElementById('scene'),r=document.getElementById('train').getBoundingClientRect();return{on:G.on,disp:getComputedStyle(sc).display,w:sc.clientWidth,x:Math.round(r.left),tw:Math.round(r.width)}});
 T('E3 練習中顯示車子動畫，車子在畫面內',g.on&&g.disp==='block'&&g.w>300&&g.x>=0&&g.x<g.w&&g.tw>20,g);
 await p.evaluate(async()=>{G.on=false;try{UI.lv(4)}catch(e){UI.navTo(4)}await sl(500)});
 const a=await p.evaluate(async()=>{const tabs=[...document.querySelectorAll('#mid .box:first-child button')].map(b=>b.textContent.trim());const h2=(document.querySelector('#mid h2')||{}).textContent||'';return{tabs,h2,view:UI.view,scene:getComputedStyle(document.getElementById('scene')).display}});
 T('E4 學習分析：標題改名，只有「學習成果」「能力說明與陪伴建議」兩個分頁，沒有車子動畫',/學習分析/.test(a.h2)&&JSON.stringify(a.tabs)===JSON.stringify(['學習成果','能力說明與陪伴建議'])&&a.scene==='none',a);
 const e0=await p.evaluate(async()=>{PAR.ui.sec='ab';home();await sl(300);const svg=document.querySelector('#mid svg');return{axes:svg?svg.querySelectorAll('line').length:0,labels:svg?[...svg.querySelectorAll('text')].map(t=>t.textContent).filter(t=>t!=='資料不足'):[],none:svg?svg.querySelectorAll('text').length:0,txt:document.getElementById('mid').textContent.includes('資料不足')}});
 T('E5 五邊形圖：5 個面向（聽懂、說出、拼寫、組合、生活運用）；沒有紀錄時標示「資料不足」',e0.axes===5&&JSON.stringify(e0.labels)===JSON.stringify(['聽懂','說出','拼寫','組合','生活運用'])&&e0.txt,e0);
 /* 用模擬的作答事件測試計算：聽懂 3 個熟悉詞，說出 2 熟悉＋2 學習中＋1 待加強 */
 const e1=await p.evaluate(async()=>{const o=LA.idx,ow=LA.stage,ws=S.cards.filter(c=>c.lib&&c.img).slice(0,8),byW={};
  const ev=(id,ab,k)=>{(byW[id]=byW[id]||[]).push({ab,rid:id+ab+k,ts:Date.now()-k*1000,lv:'I',w:id})};
  ws.slice(0,3).forEach(c=>{ev(c.id,'lc',1);ev(c.id,'lc',2)});ws.slice(3,8).forEach(c=>{ev(c.id,'sp',1);ev(c.id,'si',2)});
  const st={};ws.slice(0,3).forEach(c=>st[c.id]='fa');[3,4].forEach(i=>st[ws[i].id]='fa');[5,6].forEach(i=>st[ws[i].id]='mid');st[ws[7].id]='weak';
  LA.idx=()=>({byW});LA.stage=e=>st[e[0].w];const lc=P38.axis(P38.AX[0]),sp=P38.axis(P38.AX[1]),zy=P38.axis(P38.AX[2]);home();await sl(300);const t=document.getElementById('mid').textContent,pts=document.querySelectorAll('#mid svg circle').length;LA.idx=o;LA.stage=ow;home();
  return{lc,sp,zy,pts,best:/比較突出：聽懂詞彙/.test(t),card:/已熟悉 2、學習中 2、待加強 1 個詞/.test(t),tip:/生活中可以這樣做/.test(t)}});
 T('E6 面向分數計算：已熟悉 1、學習中 0.5；不足 3 個詞為資料不足',e1.lc.v===1&&e1.lc.j===3&&Math.abs(e1.sp.v-.6)<1e-9&&e1.zy.v===null,e1);
 T('E7 圖上畫出有資料的面向、文字說明「比較突出」，各面向小卡有統計與生活陪伴建議',e1.pts===2&&e1.best&&e1.card&&e1.tip,e1);
 const r=await p.evaluate(async()=>{const o=PAR.review;PAR.review=()=>['牙刷','大象','跳舞'].map(t=>{const c=S.cards.find(x=>x.lib&&x.text===t);return{id:c.id,text:c.text,img:c.img,why:['最近需要提示才完成。'],pri:3}});PAR.ui.sec='res';home();await sl(300);const m=document.getElementById('mid'),cards=[...m.querySelectorAll('.p38w>div')].map(d=>d.textContent);PAR.review=o;return{cards,btn:!!m.querySelector('[onclick="PAR.go(\'all\')"]'),title:/近期可以陪孩子練習的詞彙/.test(m.textContent)}});
 T('E8 學習成果：近期可以陪孩子練習的詞彙，附生活中的問法（物品問句、猜謎、例句）與一鍵複習',r.title&&r.cards.length===3&&/我們用什麼刷牙/.test(r.cards[0])&&/鼻子長長的/.test(r.cards[1])&&/一起說說看/.test(r.cards[2])&&r.btn,r);
 const s0=await p.evaluate(()=>({kv:S.set.keyVoice,snd:S.set.sound,gv:S.set.gv,wait:S.set.waitSec,ap:S.set.ap,an:S.set.autoNext}));
 const st=await p.evaluate(async()=>{UI.navTo(5);await sl(400);const m=document.getElementById('mid');return{h3:[...m.querySelectorAll('h3')].map(h=>h.textContent.trim()),ck:m.querySelectorAll('input[type=checkbox]').length,sl:['mvs','s_vol','s_vv','s_rec','s_tts','s_am','s_sz','s_aid','inmode'].filter(i=>document.getElementById(i)).length,mt:!!document.getElementById('mt'),mic:!!document.getElementById('micst')}});
 T('E9 設定頁只留聲音（音量、速度、音樂）、畫面、輸入方式；沒有打勾項、學習輔助、麥克風',JSON.stringify(st.h3)===JSON.stringify(['🔊 聲音','🖥 畫面','⌨ 輸入方式'])&&st.ck===0&&st.sl===9&&st.mt&&!st.mic,st);
 const s1=await p.evaluate(()=>({kv:S.set.keyVoice,snd:S.set.sound,gv:S.set.gv,wait:S.set.waitSec,ap:S.set.ap,an:S.set.autoNext}));
 T('E10 被移除的設定值完全不變',JSON.stringify(s0)===JSON.stringify(s1),{s0,s1});
 T('E11 沒有頁面錯誤',errs.length===0,errs);await b.close();console.log(`\n${P} 通過 / ${F} 失敗`);process.exit(F?1:0)})().catch(e=>{console.error('CRASH',e);process.exit(2)});
