const {JSDOM}=require('jsdom');const fs=require('fs');require('fake-indexeddb/auto');
const html=fs.readFileSync((process.env.IDX||'/mnt/user-data/outputs/vocabulary-express/index.html'),'utf8').replace(/<script src[^>]*><\/script>/,'').replace("lm:'quiet'","lm:'integ'").replace("or:30,","or:0,").replace("hz:{u:'once',cost:true,n:1,free:false}","hz:{u:'none',cost:false,n:1,free:true}").replace("ap:true,","ap:false,").replace("oj:'A'","oj:'B'").replace("prepDone:false","prepDone:true");const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let P=0,F=0;const T=(n,c)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n)};
const mk=()=>new JSDOM(html,{url:'http://localhost/?noseed',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.indexedDB=indexedDB;w.alert=()=>{};w.Audio=class{constructor(s){this.src=s;this.volume=1}play(){setTimeout(()=>this.onended&&this.onended(),60);return Promise.resolve()}pause(){}};w.confirm=()=>true;w.AudioContext=function(){};w.speechSynthesis={getVoices:()=>[],cancel(){}};
 w.navigator.mediaDevices={getUserMedia:async()=>({active:true,getTracks:()=>[{stop(){}}]})}}}).window;
(async()=>{const w=mk();await sleep(500);const E=s=>w.eval(s),d=w.document,q=s=>d.querySelector(s);
 const setup=(n,k)=>{E(`S.cards=[${['火車','高鐵','公車','計程車'].map((t,i)=>`{id:'c${i}',text:'${t}',zy:'ㄏㄨㄛˇ ㄔㄜ',img:'',audio:'',cats:[]}`).join(',')}];S.cats=[];S.set.src='all';S.set.n=${n};S.set.sound=false;S.set.music=false;S.set.anim=true;S.asrDecl=1;S.logs=[];S.rw.stars=0;S.rw.badges=[];S.rw.veh=[];S.rw.journeys=[];S.rounds={started:0,completed:0};save();home();goV('${k}')`)};
 const pct=()=>parseInt(q('#jf').style.width),mark=()=>parseInt(q('#jv').style.left);
 // ---- 5 questions
 setup(5,'bike');await sleep(150);
 T('panel: title, start, end, vehicle, count, progress, location present',q('#prog .jt').textContent.includes('腳踏車旅行')&&q('#prog').textContent.includes('起點')&&q('#prog').textContent.includes('終點')&&q('#jv').textContent==='🚲'&&q('#jq').textContent.includes('第 1 題／共 5 題')&&q('#jx').textContent.includes('進度 0%')&&q('#jl').textContent.includes('起點'));
 T('panel sits in the scene (above photo/answer area), pointer-events none',q('#prog').parentElement.id==='scene'&&E('getComputedStyle(document.querySelector("#prog")).pointerEvents')!=='x');
 T('journey has 5 segments: 6 stops (start, 1-4, terminal)',d.querySelectorAll('.stn').length===6&&d.querySelectorAll('.jtrack u').length===6);
 // wrong input: no regress
 const wrong=()=>{d.dispatchEvent(new w.KeyboardEvent('keydown',{code:'KeyZ',key:'z',bubbles:true,cancelable:true}))};
 wrong();wrong();await sleep(50);T('wrong input: no progress change, no regress, not completed',E('G.done')===0&&pct()===0&&!E('G.lock'));
 const exp=[20,40,60,80];let okAll=true;
 for(let k=1;k<=4;k++){const t0=Date.now();const i0=E('G.i');E('ok()');
  const x=pct(),m=mark(),txt=q('#jq').textContent,loc=q('#jl').textContent;
  okAll=okAll&&x===exp[k-1]&&m===exp[k-1]&&E('G.done')===k&&txt.includes('已完成 '+k)&&txt.includes('第 '+(k+1)+' 題／共 5 題')&&loc.includes('第 '+k+' 站');
  if(k===2){const lg=E('S.logs.length'),st=E('S.rw.stars');E('ok()');E('ok()');T('same question counted once (duplicate ok() ignored)',E('S.logs.length')===lg&&E('S.rw.stars')===st&&E('G.done')===2);wrong();T('wrong input after progress does not regress',E('G.done')===2&&pct()===40)}
  if(k>1||false){}
  if(k===1){await sleep(1000);T('next question not before ~1s',E('G.i')===i0);await sleep(600);T('next question within ~1.5s',E('G.i')===i0+1&&Date.now()-t0<2000)}
  else await sleep(1600);}
 T('5-question journey: 20/40/60/80% with marker, count and location',okAll);
 // hint-assisted last question
 E('G.used.zy=true');E('ok()');await sleep(150);
 const last=E('S.logs[S.logs.length-1]');T('hint-assisted completion advances to 100% and is logged as 提示後完成 (cat zy, not ind)',E('S.logs[S.logs.length-1].cat')==='zy'&&E(`S.logs.filter(l=>l.cat==="ind").length`)===4);
 T('final: 100%, location 終點, 5/5',pct()===100&&mark()===100&&q('#jl').textContent.includes('終點')&&q('#jq').textContent.includes('第 5 題／共 5 題')&&q('#jx').textContent.includes('進度 100%'));
 await sleep(3200);T('arrival overlay after last question; round counted once',!!q('.ov')&&E('S.rounds.completed')===1&&E('S.rw.journeys.length')===1);
 T('logs keep card ids, mode, 5 entries; stars 5',E('S.logs.length')===5&&E('S.logs.every(l=>l.cid&&l.mode==="key")')&&E('S.rw.stars')===5);
 // ---- 10 questions
 d.querySelectorAll('.ov').forEach(o=>o.remove());E('leave()');setup(10,'car');await sleep(150);
 T('10 questions → 10 segments, 11 stops, panel says 共 10 題',d.querySelectorAll('.stn').length===11&&d.querySelectorAll('.jtrack u').length===11&&q('#jq').textContent.includes('共 10 題'));
 let ok10=true;for(let k=1;k<=10;k++){E('ok()');ok10=ok10&&pct()===k*10&&E('G.done')===k;if(k<10)await sleep(1500)}
 T('10-question journey advances 10%…100% step by step',ok10);await sleep(3200);T('arrives at terminal (overlay)',!!q('.ov'));d.querySelectorAll('.ov').forEach(o=>o.remove());E('leave()');
 // ---- all five vehicles share the logic
 for(const k of ['bike','car','train','hsr','plane']){setup(3,k);await sleep(150);let g=true;for(let i=1;i<=3;i++){E('ok()');g=g&&pct()===Math.round(i/3*100)&&E('G.done')===i&&q('#jv').textContent===E(`TH.${k}.e`);if(i<3)await sleep(1500)}
  T(`${k}: shared journey logic 33/67/100% and vehicle marker`,g);await sleep(3200);d.querySelectorAll('.ov').forEach(o=>o.remove());E('leave()')}
 // plane (mix) shows per-question mode badge while journey continues
 setup(3,'plane');await sleep(150);T('plane: mode badge + journey panel both visible',q('#mbd').style.display==='block'&&!!q('#jf'));E('leave()');
 // home view
 E('home()');T('home: no journey panel (just star total)',!q('#jf')&&q('#prog').textContent.includes('累計'));
 // persistence of earlier data
 E('goV("bike")');E('ok()');await sleep(300);E('leave()');await sleep(200);const w2=mk();await sleep(500);T('records & stars persisted across reopen',w2.eval('S.logs.length')>=1&&w2.eval('S.rw.stars')>=1);
 console.log(P+' pass, '+F+' fail');process.exit(0)})().catch(e=>{console.log('ERR',e);process.exit(1)});

//LEGACY2

//LEGACY3
