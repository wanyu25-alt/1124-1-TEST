const {JSDOM}=require('jsdom');const fs=require('fs');require('fake-indexeddb/auto');
const html=fs.readFileSync((process.env.IDX||'/mnt/user-data/outputs/vocabulary-express/index.html'),'utf8').replace(/<script src[^>]*><\/script>/,'').replace("lm:'quiet'","lm:'integ'").replace("or:30,","or:0,").replace("hz:{u:'once',cost:true,n:1,free:false}","hz:{u:'none',cost:false,n:1,free:true}").replace("ap:true,","ap:false,").replace("oj:'A'","oj:'B'").replace("prepDone:false","prepDone:true");
const mk=()=>new JSDOM(html,{url:'http://localhost/?noseed',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.indexedDB=indexedDB;w.alert=m=>w.__al=m;w.confirm=()=>true;w.Audio=class{constructor(s){this.src=s;this.volume=1}play(){setTimeout(()=>this.onended&&this.onended(),60);return Promise.resolve()}pause(){}};w.AudioContext=function(){throw 0}}}).window;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let P=0,F=0;const T=(n,c)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n)};
const w=mk();
(async()=>{await sleep(400);const E=s=>w.eval(s),d=w.document;
 const kd=(code,key)=>d.dispatchEvent(new w.KeyboardEvent('keydown',{code,key,bubbles:true,cancelable:true}));
 E(`S.cards=[{id:'a',text:'車',zy:'ㄔㄜ一聲',img:'',audio:'',cats:[]}];(S.cats=[{id:'bk',name:'測'}],S.cards.forEach(c=>c.cats=['a'].includes(c.id)?['bk']:[]),S.set.src='c:bk');S.set.n=4;S.set.stEvery=2;S.set.sound=false;S.set.music=false;S.set.mode='key';S.set.anim=true;home();startRound()`);await sleep(50);
 T('route: every question is a stop (start, 1-3, terminal)',d.querySelectorAll('.stn').length===5&&d.querySelector('#st1')&&d.querySelector('#st4'));
 T('vehicle drawn as SVG with rotating wheels',!!d.querySelector('#train svg.vh')&&d.querySelectorAll('#train .rot').length>=2);
 const x0=parseFloat(E("$('#train').style.left"));
 const type=()=>{['KeyT','KeyK','Space'].forEach(c=>kd(c,c==='Space'?' ':''))};
 type();await sleep(20);
 const x1=parseFloat(E("$('#train').style.left"));T('train moves a clear distance per answer (>=150px)',x1-x0>=150);
 T('wheels spin while moving',d.querySelector('#train').classList.contains('mv'));
 T('star total accumulates',E('S.rw.stars')===1);
 await sleep(1500);T('stop 1 lit + badge after first answer',d.querySelector('#st1').classList.contains('lit')&&E('S.rw.badges.length')===1);
 type();await sleep(1500);T('stop 2 lit',d.querySelector('#st2').classList.contains('lit')&&E('S.rw.badges.length')===2);
 type();await sleep(1500);T('stop 3 lit',d.querySelector('#st3').classList.contains('lit')&&E('S.rw.badges.length')===3);
 type();await sleep(20);T('final answer: train uses decelerating arrival',d.querySelector('#train').classList.contains('arr'));
 await sleep(1800);T('terminal lit, badge 4',d.querySelector('#st4').classList.contains('lit')&&E('S.rw.badges.length')===4);
 await sleep(1500);
 T('journey complete: vehicle collected, journey saved, overlay with choices',E('S.rw.veh.length')===1&&E('S.rw.journeys.length')===1&&d.querySelector('.ov')&&d.querySelector('.ov').textContent.includes('再練習一次')&&E('S.rw.stars')===4);
 E("document.querySelectorAll('.ov').forEach(o=>o.remove());home()");
 E(`tab(3)`);T('collection page shows stars/badges/vehicles',d.querySelector('#tch').textContent.includes('累計星星')&&d.querySelectorAll('.veh').length===16&&d.querySelectorAll('.veh.lk').length===15);
 E(`S.set.showRw=false;tab(1)`);T('teacher can hide collection entry',!d.querySelector('#mid').textContent.includes('我的收藏'));
 // persistence
 await sleep(200);const w2=mk();await sleep(500);T('rewards persist after reopen',w2.eval('S.rw.stars')===4&&w2.eval('S.rw.badges.length')===4&&w2.eval('S.rw.veh.length')===1);
 // mix mode
 E(`S.set.showRw=true;S.set.mix=true;S.set.n=8;S.set.stEvery=10;home()`);T('home has 綜合挑戰',d.body.textContent.includes('綜合挑戰'));
 E('startRound()');await sleep(30);const seen=new Set();
 for(let i=0;i<8;i++){seen.add(E('S.set.mode'));const m=E('S.set.mode');
  if(m==='speak')E('sOk(1)');else{E('G.cur.zy');for(const c of JSON.parse(E("JSON.stringify(K.seq.flat().map(s=>s===' '?'Space':Object.entries(ZK).find(e=>e[1]===s)[0]))")))kd(c,c==='Space'?' ':'');}
  await sleep(1450)}
 T('mix: several modes appear and every question completes',seen.size>=2&&E('S.logs.length')===12&&E('S.rw.stars')===12);
 T('mix logs real mode per question',E('new Set(S.logs.map(l=>l.mode)).size')>=2);
 // backup/restore moved to t14 (ZIP)
 console.log(P+' pass, '+F+' fail');process.exit(0)})().catch(e=>{console.log('ERR',e);process.exit(1)});

//LEGACY2

//LEGACY3
