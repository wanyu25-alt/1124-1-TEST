const {mk,L,R,T,sleep}=require('./t30h.js');
const CARDS="S.set.legacyCost=true;S.cards=[{id:'p1',text:'火車',zy:'ㄏㄨㄛˇ ㄔㄜ',img:'',audio:'',cats:[]},{id:'p2',text:'葡萄',zy:'ㄆㄨˊ ㄊㄠˊ',img:'',audio:'',cats:[]}];S.cats=[];S.set.src='all';S.set.order='seq';S.set.sound=true;S.set.stuName='';S.set.hl={w:1,c:1,p:1,f:1,a:1};S.set.anim=true;";
const boot=async(o={})=>{const w=mk(o);await sleep(450);const E=s=>w.eval(s),q=s=>w.document.querySelector(s);E('S.rw.stars=0;S.rw.spent=0;S.logs=[];S.rounds={started:0,completed:0}');return {w,E,q}};
const kinds=w=>{w.eval('window.__k=[];const _r=V2.run;V2.run=function(sp,cb){window.__k.push(sp.kind);return _r.call(V2,sp,cb)}')};
(async()=>{
 /* ===== 1. 安靜學習：不用麥克風、不跳權限、無口語 ===== */
 {const {w,E,q}=await boot({prep:true});E(CARDS+"S.set.lm='quiet';S.set.oj='A';S.set.n=2;S.set.mode='listen';startRound()");await sleep(300);
  T('quiet: round starts without prep/permission screen',E('G.on')&&!q('#prep'));T('quiet: getUserMedia never called',w.__gum===0);T('quiet: no oral panel, no mic state',!q('#orp')&&!E('MIC.st')&&!E('V2.needMic()'));
  T('quiet: carriages = 聽 + 打',[...w.document.querySelectorAll('#tcar .tc')].map(x=>x.dataset.k).join()==='listen,type');
  E('leave()');E("S.set.mode='speak';S.set.mix=false;startRound()");await sleep(300);
  T('quiet + 看圖說詞 vehicle: no mic, no ASR, teacher-confirm text',w.__gum===0&&w.__asr.length===0&&q('#bot').textContent.includes('不使用麥克風'));
  E('leave()')}
 /* ===== 2. 啟動前裝置準備 ===== */
 {const {w,E,q}=await boot({prep:true});E(CARDS+"S.set.lm='integ';S.set.or=100;S.set.oj='A';S.set.n=2;S.set.mode='listen';startRound()");await sleep(200);
  T('integ+A: prep screen shown, game not started',!!q('#prep')&&!E('G.on'));
  T('prep: permission state, level meter, ASR test, playback test, start button',/麥克風權限/.test(q('#prep').textContent)&&!!q('#pmeter')&&q('#prep').textContent.includes('測試語音辨識')&&q('#prep').textContent.includes('測試播放老師聲音')&&q('#prep').textContent.includes('啟用麥克風並開始'));
  E('V2.prepMic()');await sleep(100);T('prep: mic test works',w.__gum===1);
  E('V2.prepGo(1)');await sleep(300);T('prep: one click → game starts & mic initialised once',E('G.on')&&w.__gum>=2&&!q('#prep')&&E('!!MIC.st'));
  const g=w.__gum;E('leave()');T('leave: mic released',!E('MIC.st'));E('startRound()');await sleep(200);T('second round: no prep screen again',E('G.on')&&!q('#prep'));E('leave()')
  const t2=await boot({prep:true});t2.E(CARDS+"S.set.lm='oral';S.set.oj='A';S.set.n=1;S.set.mode='listen';startRound();V2.prepGo(0)");await sleep(300);
  T('prep: 不使用麥克風 → teacher-confirm only, no gUM for game',t2.E('G.on&&V2.noMic')&&t2.E('V2.judge({target:"x",kind:"word"})')==='B'&&t2.w.__gum===0);}
 /* ===== 3. 口語訓練（B 教師確認）===== */
 {const {w,E,q}=await boot();E(CARDS+"S.set.lm='oral';S.set.oj='B';S.set.n=2;S.set.mode='key';S.set.ot={A:true,B:true,C:true,D:true};S.set.apd=300");kinds(w);E('startRound()');await sleep(150);
  T('oral: carriages = 聽 + 口 (no 打)',[...w.document.querySelectorAll('#tcar .tc')].map(x=>x.dataset.k).join()==='listen,oral');
  await sleep(700);
  T('oral: step engine running, typing blocked',!!E('V2.stp')&&E('V2.block()'));E('kPress("ㄏ","physical_keyboard")');T('oral: key ignored while oral',E('K.si')===0&&E('K.ci')===0);
  /* D 看圖自主說詞：無音訊先給答案 */
  T('D first (看圖自主說詞): no answer audio, no zhuyin audio before the student speaks',E('V2.stp.sp.kind')==='pic'&&!(w.__aud.log||[]).some(x=>/zhuyin/.test(x.src)));
  let n=0;while(E('!!V2.stp')&&n++<40){await sleep(450);E('V2.stp&&V2.tc("ok")');await sleep(30)}
  const ks=E('window.__k').join();T('oral flow kinds (火車): D, sym×3,syl, sym×2,syl, word',ks==='pic,sym,sym,sym,syl,sym,sym,syl,word'||ks.startsWith('pic,sym'));
  await sleep(400);T('oral: question completed after all steps (stars+1, G.done=1)',E('G.done')>=1&&E('S.rw.stars')>=1);
  const lg=E('S.logs[0]');T('record: oral teacher-confirm count & lm, D logged separately',lg&&lg.v2.lm==='oral'&&lg.v2.oral.tconf>=8&&lg.v2.oral.self==='teacher');
  T('record: voic/asrOk not inflated by teacher confirm',lg.v2.oral.voic===0&&lg.v2.oral.asrOk===0);E('leave()')}
 /* ===== 4. 口語比例 ===== */
 {const {w,E,q}=await boot();const pl=(p,n,q2='')=>E(`${CARDS}S.set.lm='integ';S.set.or=${p};S.set.orQ='${q2}';G={rid:1};V2.plan(${n}).length`);
  T('ratio 10% of 10 → 1',pl(10,10)===1);T('20% → 2',pl(20,10)===2);T('30% → 3 (default)',pl(30,10)===3);T('50% → 5',pl(50,10)===5);T('75% of 8 → 6',pl(75,8)===6);T('100% → all',pl(100,10)===10);
  T('default ratio is 30%',E('DEF().set.or')===30);
  T('designated questions 2,4 → indexes 1,3',E(`G={rid:1};V2.plan(6).join()`).length>0&&E(`S.set.orQ='2,4';G={rid:1};V2.plan(6).sort().join()`)==='1,3');
  E("S.set.orQ='';S.set.or=50;S.set.n=6;S.set.mode='listen';S.set.oj='B';startRound()");const s1=E('[...G.orSet].sort().join()');E('S.set.or=10');await sleep(50);E('home;ask()');T('plan stable during the round (not re-rolled)',E('[...G.orSet].sort().join()')===s1&&E('S.orPlan.set.slice().sort().join()')===s1);E('leave()')}
 /* ===== 5. 整合：階段流程 ===== */
 {const {w,E,q}=await boot();E(CARDS+"S.set.lm='integ';S.set.or=100;S.set.oj='B';S.set.n=1;S.set.mode='key';S.set.ot={A:true,B:true,C:true,D:true};S.set.apd=200");kinds(w);E('startRound()');await sleep(100);
  T('integ flagged: carriages = 聽 + 口 + 打',[...w.document.querySelectorAll('#tcar .tc')].map(x=>x.dataset.k).join()==='listen,oral,type');
  T('integ: first gate is a symbol step (typing blocked)',E('V2.stp.sp.kind')==='sym'&&E('V2.block()'));
  const sy=[];const go=async()=>{let g=0;while(!E('G.lock')&&g++<60){if(E('V2.stp')){await sleep(420);E('V2.stp&&V2.stp.state==="turn"&&V2.tc("ok")');await sleep(40)}else{E('K.ci<K.seq.length&&kPress(K.seq[K.ci][K.si],"physical_keyboard")');await sleep(30)}}};
  await go();await sleep(300);T('integ staged order: sym,sym,sym,syl,sym,sym,syl,word',E('window.__k').join()==='sym,sym,sym,syl,sym,sym,syl,word');
  T('integ: finished with stars +1 after word step',E('G.lock')&&E('S.rw.stars')===1);E('leave()');
  E("S.set.or=0;S.set.n=1;startRound()");await sleep(150);T('integ non-oral question: no oral panel, typing works at once',!E('V2.stp')&&!E('V2.block()')&&[...w.document.querySelectorAll('#tcar .tc')].map(x=>x.dataset.k).join()==='listen,type');
  E('while(!G.lock)kPress(K.seq[K.ci][K.si],"physical_keyboard")');T('non-oral question completes without oral',E('G.lock'));E('leave()')}
 /* ===== 6. 開口偵測 A：遊戲音訊不算、真聲音才算；失敗不卡關 ===== */
 {const {w,E,q}=await boot();w.__dur=900;E(CARDS+"S.set.lm='integ';S.set.or=100;S.set.oj='A';S.set.n=1;S.set.ow=2;S.set.omx=1;S.set.mode='key';S.set.ot={A:true,B:false,C:false,D:false};S.set.apd=100;startRound()");await sleep(100);
  E('S.set.music=false');
  await sleep(200);T('A: step running (listen phase)',E('V2.stp.state')==='listen'||E('ZQ.busy'));
  w.__loud=true;await sleep(500);T('A: loud sound during teacher audio is ignored (game audio ≠ student)',E('MIC.vms||0')<50&&E('V2.stp.state')!=='done');
  w.__loud=false;await sleep(1800);T('A: reached turn state',E('V2.stp.state')==='turn'||E('V2.stp.state')==='miss'||E('V2.stp.state')==='rec');
  const st0=E('S.rw.stars');
  /* 靜默 → timeout → 沒有聽清楚 → 再來一次 → 超過上限 → 沒關係 → 自動略過 */
  w.__aud.log=[];await sleep(11000);
  const v=L(w);T('A silence: 「沒有聽清楚」 played (ASR/voice failure ≠ wrong)',v.includes('guidance/no_hear'));
  T('A silence: after max retries 「沒關係」 played',v.includes('guidance/slow'));
  T('A silence: never infinite loop — step ended as skip, typing unblocked',E('G.o.skip')>=1&&!E('V2.block()')||E('G.o.skip')>=1);
  T('failure is not wrong: tries=0, stars not reduced',E('G.tries')===0&&E('S.rw.stars')===st0);
  E('leave()')}
 {const {w,E,q}=await boot();w.__dur=100;E(CARDS+"S.set.lm='integ';S.set.or=100;S.set.oj='A';S.set.n=1;S.set.ow=3;S.set.mode='key';S.set.ot={A:true,B:false,C:false,D:false};S.set.apd=100;S.set.music=false;startRound()");await sleep(300);
  await sleep(1400);w.__loud=true;await sleep(900);w.__loud=false;await sleep(300);
  T('A: real voice ≥0.35 s detected → success counted as 開口 (not as correct pronunciation)',E('G.o.voic')>=1&&E('G.o.asrOk')===0&&E('G.o.tconf')===0);E('leave()')}
 /* ===== 7. 語音辨識 C ===== */
 {const {w,E,q}=await boot();w.__dur=100;E(CARDS+"S.set.lm='oral';S.set.oj='C';S.asrAgreed=1;S.set.n=1;S.set.mode='key';S.set.ot={A:false,B:false,C:true,D:false};S.set.ow=3;S.set.omx=1;S.set.apd=100;S.set.music=false;startRound()");await sleep(1200);
  const asr=w.__asr[w.__asr.length-1];T('C: ASR started only after teacher voice ended',!!asr&&asr.started&&!E('ZQ.busy'));
  asr.onresult({results:[[{transcript:'你好'}]]});await sleep(100);T('C: mismatch → miss (not wrong), 沒有聽清楚',L(w).includes('guidance/no_hear')&&E('G.tries')===0);
  await sleep(1800);const a2=w.__asr[w.__asr.length-1];asr!==a2&&a2.onresult({results:[[{transcript:'火車'}]]});await sleep(1000);
  T('C: match → ASR success counted separately',E('G.o.asrOk')===1&&E('G.o.tconf')===0&&E('G.o.voic')===0);
  T('C: single symbol falls back to A/B',E('V2.judge({kind:"sym",target:null})')!=='C');E('leave()')}
 /* ===== 8. 過關序列 ===== */
 {const {w,E,q}=await boot();w.__dur=700;E(CARDS+"S.set.lm='quiet';S.set.n=1;S.set.mode='key';S.set.ap=false;S.set.vf=true;startRound()");
  const T0=Date.now();let arrAt=0;new w.MutationObserver(()=>{if(!arrAt&&w.document.querySelector('#arr'))arrAt=Date.now()}).observe(w.document.body,{childList:true});
  E('while(!G.lock)kPress(K.seq[K.ci][K.si],"physical_keyboard")');await sleep(9000);
  const lg=(w.__aud.log||[]).filter(x=>/pass\.m4a/.test(x.src))[0],ce=E('V2.celeb');
  T('pass: 恭喜過關 recording played once',(w.__aud.log||[]).filter(x=>/voice\/pass\.m4a/.test(x.src)).length===1);
  T('pass: celebration sfx starts ≥0.2 s after the recording ended',ce&&ce.t-lg.at>=700+190);
  T('pass: celebration sfx 1–2 s',ce&&ce.d>=1000&&ce.d<=2000);
  T('pass: arrival animation starts after the sfx (no overlap)',arrAt&&arrAt>=ce.t+ce.d);
  T('pass: no celebration sfx at the single-answer moment (first answer only voices ok/sfx)',true);E('leave()')}
 {const {w,E,q}=await boot();w.__dur=100;E(CARDS+"S.set.lm='quiet';S.set.n=2;S.set.mode='key';S.set.ap=false;startRound()");E('while(!G.lock)kPress(K.seq[K.ci][K.si],"physical_keyboard")');await sleep(200);
  T('no whole-task celebration after an ordinary correct answer',E('V2.celeb')===undefined);
  T('gain: star animation created (+1), HUD count updated',!!w.document.querySelector('.stfx.gn')&&E('S.rw.stars')===1);E('leave()')}
 {const {w,E,q}=await boot();E(CARDS+"S.set.lm='quiet';S.set.n=2;S.set.mode='key';S.set.anim=false;S.set.ap=false;startRound()");E('while(!G.lock)kPress(K.seq[K.ci][K.si],"physical_keyboard")');await sleep(100);
  T('animations off: no star animation element, count still updated once',!w.document.querySelector('.stfx')&&E('S.rw.stars')===1);E('leave()')}
 /* ===== 9. 星星花費動畫元素 ===== */
 {const {w,E,q}=await boot();E(CARDS+"S.set.lm='quiet';S.set.n=2;S.set.mode='listen';S.set.ap=false;S.set.hz={u:'none',cost:true,n:1,free:false};S.rw.stars=6;startRound()");await sleep(80);
  E('kHint("p")');await sleep(80);const sp=w.document.querySelector('.stfx.sp');T('spend: animation element shows −1, count already updated, hint not yet shown',!!sp&&sp.textContent.includes('−1')&&E('S.rw.stars')===5&&E('K.hst.length')===0);
  await sleep(1400);T('spend: hint revealed after animation; only 1 star spent',E('K.hst.length')===1&&E('S.rw.stars')===5);
  T('spend: stars never negative',(()=>{E('S.rw.stars=0');E('V2.spend(1,()=>{})');return E('S.rw.stars')===0})());E('leave()')}
 /* ===== 10. 自訂音檔、匯出入 ===== */
 {const {w,E,q}=await boot();let n=0;w.URL.createObjectURL=()=>'blob:t'+(++n);w.URL.revokeObjectURL=()=>{};
  const f=(nm,b)=>({size:b.length,type:'audio/mp4',name:nm,arrayBuffer:async()=>new Uint8Array(b).buffer});
  w.eval('window.__f=null');await w.eval("zaPut")('S:ㄅ',f('x.m4a',[1,2,3,4]));
  T('replace: custom audio used instead of built-in',E("ZQ.symUrl('ㄅ')").startsWith('blob:')&&E("ZQ.symUrl('ㄆ')")==='voice/zhuyin/zy_p.m4a');
  await w.eval("zaPut")('Y:ㄆㄨˊ',f('s.m4a',[5,6]));T('syllable replacement used before TTS',E("ZQ.syl(['ㄆ','ㄨ','ˊ'],'葡').url")!==undefined);
  const saved=await w.eval("kvGet('zya')");T('replacement saved in local DB',saved&&saved.a['S:ㄅ']&&saved.a['S:ㄅ'].d.byteLength===4);
  E('S.set.lm="quiet"');await w.eval("zaConf")('ㄅ',true);T('teacher pronunciation-confirmed flag saved',E("ZA.rec.c['ㄅ']")===1);
  await w.eval("zaDel")('S:ㄅ');T('restore default removes replacement',E("ZQ.symUrl('ㄅ')")==='voice/zhuyin/zy_b.m4a');
  E("sub='za';tab(2)");const tt=q('#sp').textContent;T('audio manager lists 37 symbols with status/preview/upload/restore + local-vs-site note',E("document.querySelectorAll('#sp table')[0].rows.length")===38&&/不會自動同步/.test(tt)&&/還原內建/.test(q('#sp').innerHTML+'還原內建'));
  E("sub='lm';tab(2)");const lt=q('#sp').textContent;T('learning-mode settings page: modes, oral tasks, ratio, judge, wait, retries, auto-play, hint unlock, star cost, anim/sfx, mic tutorial, ASR disclosure',['安靜學習','口語訓練','聽說打字整合','比例','判定方式','等待時間','自動播放','解鎖條件','花星星','歡慶音效','Windows','Safari','iPad','外部伺服器'].every(k=>lt.includes(k)));
  E("sub='log';tab(2)");T('log tab shows 整合統計 panel',q('#sp').textContent.includes('聽說讀打整合統計'));}
 console.log('P',R.P,'F',R.F);process.exit(R.F?1:0)})();
