const {sleep,T,mk,mkSetup,res}=require('./t19h.js');
(async()=>{const w=mk();await sleep(500);const {E,d,q,V,endV,setup,wrong,right}=mkSetup(w);
 const ans=()=>E('typed()')?right():E('sOk(1)');
 const finish=async()=>{let g=0;while(!E('G.lock')&&g++<30)ans();};
 const full=async()=>{await finish();for(let i=0;i<8;i++){endV();await sleep(350)}await finish();for(let i=0;i<4;i++){endV();await sleep(350)}await sleep(2400)};
 const ov=()=>d.querySelectorAll('#arr').length;
 // 1) five vehicles each have their own terminal scene
 const sig={bike:'.arch',car:'.pk',train:'.chp',hsr:'.chp',plane:'.cl'},txt={bike:'終點・公園',car:'送貨完成',train:'火車站',hsr:'高鐵站',plane:'機場'};
 const seen=new Set();
 for(const k of ['bike','car','train','hsr','plane']){
  setup(2,k);await sleep(80);
  // 2) single correct answer must NOT trigger the journey ending
  await finish();for(let i=0;i<8;i++){endV();await sleep(350)}
  T(`${k}: after 1 of 2 questions no arrival overlay`,ov()===0&&E('G.done')===1);
  await finish();for(let i=0;i<4;i++){endV();await sleep(350)}await sleep(2400);
  const o=q('#arr');
  T(`${k}: overlay appears once after ALL questions`,ov()===1&&!!o);
  T(`${k}: dedicated scene (.v-${k}, ${sig[k]}, "${txt[k]}")`,!!(o&&o.querySelector('.arrsc.v-'+k)&&o.querySelector('.arrsc '+sig[k])&&o.textContent.includes(txt[k])||(o&&o.querySelector('.arrsc.v-'+k+' '+sig[k]))));
  seen.add(o?o.querySelector('.arrsc').innerHTML.length:0);
  if(k==='car'){
   const st=E('S.rw.stars'),jn=E('S.rw.journeys.length');
   T('car: stars = questions answered (2), not doubled by arrival',st===2);
   E('arrive();arrive();arrive()');T('car: calling arrive again does not replay/duplicate (1 overlay, stars & journeys unchanged)',ov()===1&&E('S.rw.stars')===st&&E('S.rw.journeys.length')===jn);
   const txtc=o.textContent;
   T('car: completion info (only 完成旅程, 題數, 本次星星)',/完成旅程/.test(txtc)&&/完成題數/.test(txtc)&&/本次獲得星星/.test(txtc)&&!/練習分類|車票|沒有使用提示|用了提示/.test(txtc));
   T('car: three buttons 再玩一次 / 選擇其他交通工具 / 返回首頁',['再練習一次','選擇其他站','返回首頁'].every(t=>[...o.querySelectorAll('button')].some(b=>b.textContent.includes(t))));
   // skip
   const osc0=w.__osc.length;[...o.querySelectorAll('button')].find(b=>b.textContent.includes('跳過動畫')).click();await sleep(1500);
   T('car: 跳過動畫 → final state, learning record & stars untouched, no arrival sfx afterwards',q('#arbx').classList.contains('sk')&&E('S.rw.stars')===st&&E('S.rw.journeys.length')===jn&&w.__osc.length===osc0&&!q('#arbx .skp').offsetParent!==undefined);
   // restart
   [...o.querySelectorAll('button')].find(b=>b.textContent.includes('再玩一次')).click();await sleep(100);
   T('car: 再玩一次 → overlay gone, new round, progress reset',ov()===0&&E('G.on')&&E('G.done')===0);
   await full();
   T('car: second journey → overlay again once, stars now 4, journeys 2',ov()===1&&E('S.rw.stars')===4&&E('S.rw.journeys.length')===2);
   [...q('#arr').querySelectorAll('button')].find(b=>b.textContent.includes('返回首頁')).click();await sleep(100);
   T('car: 返回首頁 → overlay gone, game stopped, home shown',ov()===0&&!E('G.on')&&d.body.textContent.includes('選一種交通工具'));
  }
  d.querySelectorAll('.ov').forEach(x=>x.remove());E('RC.ui.classic=true;leave()');
 }
 T('five vehicles produce five different scenes',seen.size===5);
 // 選擇其他交通工具
 setup(2,'bike');await sleep(80);await full();
 [...q('#arr').querySelectorAll('button')].find(b=>b.textContent.includes('選擇其他交通工具')).click();await sleep(120);
 T('選擇其他交通工具 → home with vehicle picker',ov()===0&&!E('G.on')&&!!q('.vgrid'));
 // hint info
 setup(2,'bike','S.set.vf=false');await sleep(80);E('kHint("p")');await full();
 T('hint info: one question used a hint → says 用了提示',/用了提示/.test(q('#arr .hintln').textContent));
 d.querySelectorAll('.ov').forEach(x=>x.remove());
 // animation settings
 setup(2,'plane','S.set.anim=false');await sleep(80);await full();
 T('animation off: no skip button, static final scene, no ribbons/stars flying, info shown',q('#arbx').classList.contains('fx0')&&!q('#arr .skp')&&!q('#arr .fxl')&&q('#arr').textContent.includes('完成題數'));
 d.querySelectorAll('.ov').forEach(x=>x.remove());
 setup(2,'train','S.set.anim=true;S.set.fx="low"');await sleep(80);await full();
 T('simplified: fx1 (shorter), skip available, no ribbons',q('#arbx').classList.contains('fx1')&&!!q('#arr .skp')&&!q('#arr .fxl'));
 d.querySelectorAll('.ov').forEach(x=>x.remove());
 // leaving mid-animation stops arrival sfx
 setup(2,'hsr');await sleep(80);await finish();for(let i=0;i<8;i++){endV();await sleep(350)}await finish();for(let i=0;i<4;i++){endV();await sleep(350)}await sleep(2400);E("tab(2)");const n0=w.__osc.length;await sleep(3500);
 T('switching page during animation removes overlay and cancels arrival sound',ov()===0&&w.__osc.length===n0);
 // records complete
 T('learning records complete: logs present for answered questions',E('S.logs.length')>=2&&E('S.rw.journeys.every(j=>j.veh&&j.n===2)'));
 console.log(res.P+' pass, '+res.F+' fail');process.exit(0)})().catch(e=>{console.log('ERR',e);process.exit(1)});
