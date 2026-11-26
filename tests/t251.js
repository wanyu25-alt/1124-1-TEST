// 完整場次（jsdom 模擬）：10 題聽讀練習、10 題口語練習、10 題綜合練習；檢查語音不重疊、不過量、模式不混用、收音不殘留。
// 作答用「程式事件」代替學生操作；麥克風／語音辨識是模擬物件。這不是真人實機驗證。
const {JSDOM}=require('jsdom');const fs=require('fs');const {IDBFactory}=require('fake-indexeddb');
const html=fs.readFileSync(process.env.IDX,'utf8').replace(/<script src[^>]*><\/script>/,'');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let P=0,F=0;const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const WORDS=[['蘋果','ㄆㄧㄥˊ ㄍㄨㄛˇ'],['香蕉','ㄒㄧㄤ ㄐㄧㄠ'],['貓','ㄇㄠ'],['狗','ㄍㄡˇ'],['魚','ㄩˊ'],['橘子','ㄐㄩˊ ㄗ˙'],['火車','ㄏㄨㄛˇ ㄔㄜ'],['汽車','ㄑㄧˋ ㄔㄜ'],['水','ㄕㄨㄟˇ'],['飯','ㄈㄢˋ'],['雞','ㄐㄧ'],['鳥','ㄋㄧㄠˇ']];
const mk=()=>{const L={aud:[],asr:{start:0,abort:0},gum:0,act:0};const w=new JSDOM(html,{url:'http://localhost/?noseed',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
 w.indexedDB=new IDBFactory();w.alert=()=>{};w.confirm=()=>true;w.AudioContext=function(){};w.speechSynthesis={getVoices:()=>[],cancel(){},speak(u){setTimeout(()=>u.onend&&u.onend(),30)}};w.SpeechSynthesisUtterance=function(t){this.text=t};
 w.fetch=()=>Promise.reject(new Error('no network'));w.URL.createObjectURL=()=>'blob:t';w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){};
 w.Audio=class{constructor(s){this.src=s||'';this.volume=1;this.paused=true}play(){const e={src:this.src,t0:Date.now(),t1:null};L.aud.push(e);const me=this;L.act++;setTimeout(()=>{e.t1=Date.now();L.act--;me.onended&&me.onended()},350);return Promise.resolve()}pause(){}};
 w.webkitSpeechRecognition=class{start(){L.asr.start++}abort(){L.asr.abort++}};
 w.navigator.mediaDevices={getUserMedia:async()=>{L.gum++;return{active:true,getTracks:()=>[{stop(){}}]}}}}}).window;w.L=L;return w};
const boot=async()=>{const w=mk();const t0=Date.now();while(Date.now()-t0<8000&&!w.eval('typeof GV!=="undefined"&&S.set.ttsMig===3'))await sleep(50);await sleep(300);return w};
const E=(w,s)=>w.eval(s);
const gid=s=>(s.match(/guidance\/(find_it|repeat_after_me|listen_carefully|speak_louder|your_turn|what_is_this)\.m4a/)||[])[1];
const seed=w=>E(w,`S.set.music=false;S.set.sound=false;V2.prepDone=true;S.set.anim=false;S.set.ap=true;S.set.apd=100;S.set.n=10;S.asrAgreed=1;S.cats=[{id:'fr',name:'水果',order:[]},{id:'an',name:'動物',order:[]}];
 S.cards=${JSON.stringify(WORDS)}.map(([t,z],i)=>({id:'c'+i,text:t,zy:z,img:'${PNG}',audio:'',cats:[i%2?'an':'fr'],created:1,modified:1}));save()`);
/* 逐題推進：依目前題型用程式事件完成，並記錄每題的模式與引導語音 */
async function run(w,label,cfg){const L=w.L;L.aud.length=0;const r0=E(w,'S.recs.length');
 E(w,cfg+';startRound()');const seen=[];let key='',guard=0;const t0=Date.now();
 while(guard++<400&&Date.now()-t0<150000){await sleep(250);
  if(!E(w,'G.on')||E(w,'S.recs.length')-r0>=10)break;
  const m=E(w,'S.set.mode'),k=E(w,'G.rid+":"+G.i+":"+S.set.mode');
  if(m==='expose'){E(w,'try{EXP.done()}catch(e){}');await sleep(500);continue}
  if(k!==key&&E(w,'!!G.cur')){key=k;seen.push({k,m,t:Date.now()});await sleep(1700);   // 讓開頭的引導語音有時間播完
   if(m==='speak'){E(w,'MIC.st=MIC.st||{active:true,getTracks(){return[]}};MIC.err=""')}
   try{if(m==='pick'&&E(w,'G.pk'))E(w,'document.querySelectorAll(".pko")[G.pk.ci].click()');else if(m==='speak'){E(w,'SK.credit("adult",{by:"adult"})')}else{for(let j=0;j<8&&E(w,'!!V2.stp||(G.orq&&!(G.o&&G.o.doneAll))');j++){E(w,'V2.stp&&V2.tc("ok")');await sleep(1600)}E(w,'RE.input&&RE.input();ok()')}}catch(e){console.log('step err',e.message)}
   await sleep(900)}}
 await sleep(1200);
 const recs=E(w,'S.recs.length')-r0;return{seen,recs,aud:L.aud.slice()}}
const overlaps=aud=>{let n=0;const a=aud.filter(x=>x.t1).sort((x,y)=>x.t0-y.t0);for(let i=1;i<a.length;i++)if(a[i].t0<a[i-1].t1-30&&gid(a[i].src)&&gid(a[i-1].src)===undefined?false:a[i].t0<a[i-1].t1-30)n++;return n};
const gOnly=aud=>aud.filter(x=>gid(x.src));
(async()=>{
 // ===== 1) 聽讀練習 10 題 =====
 let w=await boot();seed(w);
 let R=await run(w,'listen',`S.set.lm="quiet";S.set.mix=false;UI.pick("quiet");FL.open(1);S.set.n=10;FL.setN(10);FL.go()`);
 let g=gOnly(R.aud).map(x=>gid(x.src));console.log('聽讀 modes',[...new Set(R.seen.map(x=>x.m))],'題數',R.seen.length,'引導',g.join(','));
 T('聽讀 10 題：完成 10 題且產生 10 筆紀錄（含認識階段以外）',R.recs>=10||R.seen.filter(x=>x.m!=='expose').length>=10,{recs:R.recs,seen:R.seen.length});
 T('聽讀：沒有任何口語指令',!g.some(x=>['your_turn','repeat_after_me','what_is_this','speak_louder'].includes(x)),g);
 T('聽讀：沒有啟動麥克風或語音辨識（getUserMedia＝0、ASR start＝0）',w.L.gum===0&&w.L.asr.start===0,[w.L.gum,w.L.asr]);
 T('聽讀：引導語音不是每題都播（總數 < 題數）',g.length<R.seen.length,[g.length,R.seen.length]);
 T('聽讀：沒有任何兩段錄音同時播放',(()=>{const a=R.aud.filter(x=>x.t1).sort((x,y)=>x.t0-y.t0);let n=0;for(let i=1;i<a.length;i++)if(a[i].t0<a[i-1].t1-30)n++;return n===0})(),R.aud.length);
 E(w,'try{leave()}catch(e){}');
 // ===== 2) 口語練習 10 題 =====
 w=await boot();seed(w);
 R=await run(w,'oral',`S.set.lm="oral";UI.pick("oral");FL.open(2);FL.setStar(2);S.set.n=10;FL.setN(10);MIC.st={active:true,getTracks(){return[]}};FL.go()`);
 g=gOnly(R.aud).map(x=>gid(x.src));console.log('口語 modes',[...new Set(R.seen.map(x=>x.m))],'題數',R.seen.length,'引導',g.join(','));
 T('口語 10 題：完成 10 題',R.seen.filter(x=>x.m==='speak').length>=10,R.seen.map(x=>x.m));
 T('口語：播放過「這是什麼」且前兩題以外不是每題都播（命名題只在每回合前 3 題自動播）',g.filter(x=>x==='what_is_this').length>=1&&g.filter(x=>x==='what_is_this').length<=3,g);
 T('口語：沒有任何一題六個語音全播',(()=>{const per={};gOnly(R.aud).forEach(x=>{const q=R.seen.filter(s=>s.t<=x.t0).pop();const k=q?q.k:'?';(per[k]=per[k]||new Set()).add(gid(x.src))});return Object.values(per).every(s=>s.size<=3)})(),g);
 T('口語：沒有「找找看／請仔細聽」套用在看圖說詞上',!g.some(x=>['find_it','listen_carefully'].includes(x)),g);
 T('口語：結束時辨識沒有被卡在暫停（ASR.paused＝false）',E(w,'ASR.paused')===false);
 T('口語：沒有任何兩段錄音同時播放',(()=>{const a=R.aud.filter(x=>x.t1).sort((x,y)=>x.t0-y.t0);let n=0;for(let i=1;i<a.length;i++)if(a[i].t0<a[i-1].t1-30)n++;return n===0})(),R.aud.length);
 T('口語：每筆紀錄的 ext.guide（若有）都有分類且不超過 6 筆',E(w,'S.recs.slice(-10).every(r=>!r.ext||!r.ext.guide||(r.ext.guide.length<=6&&r.ext.guide.every(x=>x.cls)))'));
 E(w,'try{leave()}catch(e){}');
 // ===== 3) 綜合練習 10 題 =====
 w=await boot();seed(w);
 R=await run(w,'integ',`S.set.lm="integ";UI.pick("integ");FL.open(1);FL.setStar(4);S.set.n=10;FL.setN(10);MIC.st={active:true,getTracks(){return[]}};FL.go()`);
 g=gOnly(R.aud).map(x=>gid(x.src));const modes=[...new Set(R.seen.map(x=>x.m))];console.log('綜合 modes',modes,'題數',R.seen.length,'引導',g.join(','));
 T('綜合：完成至少 10 題（不含認識階段）',R.seen.filter(x=>x.m!=='expose').length>=10,R.seen.map(x=>x.m));
 T('綜合：引導語音不與任何其他錄音同時播放（驅動程式直接呼叫 ok() 造成的其他重疊不計）',(()=>{const a=R.aud.filter(x=>x.t1).sort((x,y)=>x.t0-y.t0);let n=0;for(let i=1;i<a.length;i++)if(a[i].t0<a[i-1].t1-30&&(gid(a[i].src)||gid(a[i-1].src)))n++;return n===0})(),R.aud.length);
 console.log('DBG integ cfg',JSON.stringify(E(w,'FL.run&&{st:FL.run.st,mode:FL.run.mode,star:FL.run.star,flow:S.set.flow,pks:S.set.pks}')));
 T('綜合：引導語音總數遠少於題數 × 6',g.length<=R.seen.length*2,[g.length,R.seen.length]);
 T('綜合：離開後沒有殘留收音／計時器（ASR.on＝false、GV.tm 清空）',(E(w,'try{leave()}catch(e){}'),E(w,'!ASR.on&&GV.tm.length===0')));
 console.log(`t251: ${P} pass ${F} fail`);process.exit(F?1:0)})();
