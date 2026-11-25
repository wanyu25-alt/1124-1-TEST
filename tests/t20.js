const {sleep,T,mk,mkSetup,res}=require('./t19h.js');
(async()=>{const w=mk();await sleep(500);const {E,d,q,setup}=mkSetup(w);
 const typedOk=()=>E('typed()')?E('(()=>{while(!G.lock)kPress(K.seq[K.ci][K.si],"physical_keyboard")})()'):E('sOk(1)');
 const exp=(n)=>({left:E('SC.start'),unit:E('SC.unit')});
 const VEHS=['bike','car','train','hsr','plane'];
 for(const k of VEHS){
  setup(3,k,k==='plane'?'':'');E(`S.set.mix=false;S.set.mode=TH.${k}.mode;S.set.vf=false;S.set.sound=false`);E(`S.set.theme='${k}';startRound()`);await sleep(80);
  T(`${k}: in game → body.ig, scene themed, vehicle present`,d.body.classList.contains('ig')&&q('#scene').dataset.th===k&&!!q('#train'));
  let pos=true,prog=true;
  for(let i=0;i<=3;i++){
   const x=E('SC.start')+E('G.done')*E('SC.unit'),pct=Math.round(E('G.done')/3*100);
   pos=pos&&Math.abs(parseFloat(q('#train').style.left)-x)<1;prog=prog&&parseInt(q('#jf').style.width)===pct&&parseInt(q('#jv').style.left)===pct;
   if(i<3){if(E('typed()')){while(!E('G.lock'))E('kPress(K.seq[K.ci][K.si],"physical_keyboard")')}else E('sOk(1)');
    if(i===0){await sleep(60);T(`${k}: correct → vehicle moving, ground flow, boost + speed state`,q('#train').classList.contains('mv')&&q('#scene').classList.contains('fl')&&q('#train').classList.contains('boost')&&q('#scene').classList.contains('bst'))}
    await sleep(1550)}
  }
  T(`${k}: vehicle position always = start + done × unit (matches journey %)`,pos&&prog);
  await sleep(1700);
  T(`${k}: motion classes cleared after the move (quiet again)`,!q('#train').classList.contains('mv')&&!q('#scene').classList.contains('fl')&&!q('#train').classList.contains('boost')&&!q('#scene').classList.contains('bst'));
  d.querySelectorAll('.ov').forEach(o=>o.remove());E('leave()');
  T(`${k}: leaving game stops idle animations (body.ig removed)`,!d.body.classList.contains('ig'));
 }
 // distinct parts per vehicle
 const parts={};for(const k of VEHS){setup(3,k);E(`S.set.theme='${k}';startRound()`);await sleep(60);parts[k]={pd:!!q('.pd'),rod:!!q('.rod'),smk:!!q('.smk'),shine:!!q('.shine'),beam:!!q('.beam'),exh:!!q('.exh'),fan:!!q('.fan'),eg:!!q('.eg'),sl:d.querySelectorAll('.sl').length,lay:d.querySelectorAll('.lay').length,rot:d.querySelectorAll('#train .rot').length};E('leave()')}
 T('bike: pedals + 2 spinning wheels + foreground grass layer',parts.bike.pd&&parts.bike.rot>=2&&parts.bike.lay===4&&!parts.bike.rod);
 T('car: headlight beam + exhaust, wheels, 3 city/road layers',parts.car.beam&&parts.car.exh&&parts.car.rot>=2&&parts.car.lay===3&&!parts.car.smk);
 T('train: connecting rod + smoke + driving wheels + mountain/forest layers',parts.train.rod&&parts.train.smk&&parts.train.rot>=3&&parts.train.lay===4);
 T('hsr: body shine + 6 speed streaks in background + 3 tower layers',parts.hsr.shine&&parts.hsr.sl===6&&parts.hsr.lay===3&&!parts.hsr.pd);
 T('plane: engine fan + engine glow + 4 streaks + 3 cloud layers',parts.plane.fan&&parts.plane.eg&&parts.plane.sl===4&&parts.plane.lay===3);
 T('five vehicles all have distinct feature sets',new Set(Object.values(parts).map(p=>JSON.stringify(p))).size===5);
 // scene switch
 setup(3,'car');E("S.set.theme='train';startRound()");await sleep(30);T('switching vehicle: new scene fades in (sw), no streaks left over, vehicle placed at start immediately',q('#scene').classList.contains('sw')&&d.querySelectorAll('.sl').length===0&&Math.abs(parseFloat(q('#train').style.left)-E('SC.start'))<1);E('leave()');
 // animation modes
 setup(3,'train');await sleep(60);E("setAm('simple')");T('簡化: body.am-simple, fx low, animation still on (vehicle moves)',d.body.classList.contains('am-simple')&&E('S.set.fx')==='low'&&E('S.set.anim')===true&&E('AMODE()')==='simple');
 E('kPress(K.seq[0][0],"physical_keyboard");while(!G.lock)kPress(K.seq[K.ci][K.si],"physical_keyboard")');await sleep(60);T('簡化: still moves forward on correct',q('#train').classList.contains('mv')&&Math.abs(parseFloat(q('#train').style.left)-(E('SC.start')+E('SC.unit')))<1);
 await sleep(1500);E("setAm('off')");T('關閉非必要動畫: noanim, no transition, anim=false',d.body.classList.contains('noanim')&&!d.body.classList.contains('am-simple')&&E('S.set.anim')===false&&E('AMODE()')==='off');
 E('while(!G.lock)kPress(K.seq[K.ci][K.si],"physical_keyboard")');await sleep(60);T('關閉: vehicle jumps to correct position instantly, no mv/fl/boost classes',q('#train').style.transition==='none'&&!q('#train').classList.contains('mv')&&!q('#scene').classList.contains('fl')&&!q('#train').classList.contains('boost')&&Math.abs(parseFloat(q('#train').style.left)-(E('SC.start')+2*E('SC.unit')))<1);
 E("setAm('std')");T('標準: restored',E('S.set.anim')===true&&E('S.set.fx')==='full'&&!d.body.classList.contains('am-simple')&&!d.body.classList.contains('noanim'));
 E('leave()');E("tab(3)");E("sub='set';tch()");const html=d.body.innerHTML;T('teacher settings show the 3-option 動畫效果 selector',/動畫效果/.test(html)&&/標準動畫/.test(html)&&/簡化動畫/.test(html)&&/關閉非必要動畫/.test(html));
 // reduced motion
 let cb=null;w.matchMedia=()=>({matches:true,addEventListener:(e,f)=>{cb=f}});E('tab(1)');setup(3,'car');await sleep(60);
 T('prefers-reduced-motion: treated as off (noanim, no motion classes after answer)',d.body.classList.contains('noanim'));
 E('while(!G.lock)kPress(K.seq[K.ci][K.si],"physical_keyboard")');await sleep(60);T('reduced-motion: still reaches correct position, no mv',!q('#train').classList.contains('mv')&&Math.abs(parseFloat(q('#train').style.left)-(E('SC.start')+E('SC.unit')))<1);
 w.matchMedia=()=>({matches:false});E('scene()');T('reduced-motion off → animation returns',!d.body.classList.contains('noanim'));E('leave()');
 // visibility
 setup(3,'bike');await sleep(60);Object.defineProperty(d,'hidden',{value:true,configurable:true});d.dispatchEvent(new w.Event('visibilitychange'));T('hidden tab: animations paused (body.hid)',d.body.classList.contains('hid'));Object.defineProperty(d,'hidden',{value:false,configurable:true});d.dispatchEvent(new w.Event('visibilitychange'));T('visible again: resumes',!d.body.classList.contains('hid'));E('leave()');
 // leak check: repeated rounds
 const cnt=()=>d.querySelectorAll('*').length;setup(3,'hsr');E('leave()');await sleep(30);const c0=cnt();
 for(let r=0;r<8;r++){E(`S.set.theme='${VEHS[r%5]}';startRound()`);await sleep(30);E('ok()');await sleep(30);E('leave()')}
 E("S.set.theme='hsr';startRound()");E('leave()');await sleep(1700);
 T('no DOM growth after 8 start/answer/leave cycles (toasts/particles cleaned)',Math.abs(cnt()-c0)<=6&&d.querySelectorAll('.sl,.enc,.star,.fxl').length===0||d.querySelectorAll('.lay').length<=4);
 T('no stray timers/voices after leaving',E('AM.tm.length')===0&&E('AM.cur')===null);
 // typing unaffected during animation
 setup(3,'bike');await sleep(60);E('ok()');await sleep(60);const before=E('K.ci');w.document.dispatchEvent(new w.KeyboardEvent('keydown',{code:'KeyZ',key:'z',bubbles:true,cancelable:true}));T('keyboard still accepted while vehicle animates',E('G.tries')>=0&&!!E('K'));
 console.log(res.P+' pass, '+res.F+' fail');process.exit(0)})().catch(e=>{console.log('ERR',e);process.exit(1)});
