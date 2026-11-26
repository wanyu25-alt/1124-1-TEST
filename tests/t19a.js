const {sleep,T,mk,mkSetup,res}=require('./t19h.js');
(async()=>{const w=mk();await sleep(500);const {E,d,q,V,endV,setup,wrong,right}=mkSetup(w);
 // ===== 1. 答對一題 =====
 setup(5,'bike');await sleep(100);
 T('voice files: 5 public + 2 private-named exist and are non-empty',['ok','retry','cheer','again','pass'].every(k=>require('fs').statSync('/mnt/user-data/outputs/vocabulary-express/voice/'+k+'.m4a').size>20000)&&['done','push'].every(k=>require('fs').statSync('/mnt/user-data/outputs/私人錄音_請勿上傳/'+k+'.m4a').size>20000));
 const i0=E('G.i'),st0=E('S.rw.stars');
 while(E('G.i')===i0&&!E('G.lock'))right();
 await sleep(150);T('correct: voice not yet doubled (delay ~220ms, one voice only)',V().length<=1);
 await sleep(300);T('correct: 答對囉 played exactly once, from original file',V().join()==='ok'&&w.__log.filter(x=>x.src==='voice/ok.m4a'&&!x.muted).length===1);
 T('correct: vehicle sfx tones played (bike bell ≥2093Hz)',w.__osc.some(o=>o.frequency.value>=2000));
 E('ok()');E('ok()');await sleep(100);T('correct: duplicate ok() does not replay voice or double stars',V().length===1&&E('S.rw.stars')===st0+1);
 T('correct: star burst + vehicle boost',d.querySelectorAll('.star').length>0&&q('#train').classList.contains('boost'));
 T('correct: music ducked to 25% during teacher voice',Math.abs(E('musVol()/S.set.mv')-.25)<.01);
 await sleep(1400);T('correct: auto-next question after animation',E('G.i')===i0+1&&!E('G.lock'));
 endV();await sleep(50);T('correct: duck released after voice ends',Math.abs(E('musVol()/S.set.mv')-1)<.01);
 // ===== 2. 答錯一次 =====
 w.__log.length=0;w.__osc.length=0;const tr0=E('G.tries'),lg0=E('S.logs.length');wrong();await sleep(100);
 T('wrong once: 再一次喔 played once',V().join()==='retry');
 T('wrong once: soft cue (sine 392Hz), no low harsh tone',w.__osc.some(o=>o.frequency.value===392)&&!w.__osc.some(o=>o.type==='sawtooth'||o.type==='square'));
 T('wrong once: question kept, tries=1, no log/penalty, vehicle wobble',E('G.i')===i0+1&&!E('G.lock')&&E('G.tries')===tr0+1&&E('S.logs.length')===lg0&&q('#train').classList.contains('wob'));
 T('wrong once: gentle message, no negative wording',!/錯|失敗|笨/.test(q('#msg').textContent));
 // ===== 3. 連續答錯兩次 =====
 wrong();await sleep(100);T('wrong twice quickly: cheer queued behind retry (never two voices)',V().join()==='retry'&&w.__viol===0);
 endV();await sleep(100);T('wrong twice: 加油加油 plays after retry ends',V().join()==='retry,cheer');
 T('wrong twice: hint given (partial zhuyin), recorded honestly; charge animation',E('K.hp')===1&&E('G.h.p')===1&&q('#train').classList.contains('chg')&&!!q('.enc'));
 wrong();wrong();wrong();await sleep(100);T('wrong 3–5×: cheer not repeated; 3rd wrong plays 沒關係 once; never two voices',V().join()==='retry,cheer,guidance/slow'&&w.__viol===0);
 endV();await sleep(100);
 T('wrong ≥4: only soft cue/animation; push voice max once per question (maybe played after voices)',V().filter(x=>x==='cheer').length===1&&V().filter(x=>x==='retry').length===1);
 const stars=E('S.rw.stars');while(!E('G.lock'))right();await sleep(50);
 T('after wrongs: answer still logged with tries>0, stars +1 (no deduction)',E('S.logs[S.logs.length-1].tries')>=4&&E('S.rw.stars')===stars+1&&E('S.logs[S.logs.length-1].cat')==='zy');
 await sleep(1500);endV();
 // listen mode: cheer → replay prompt after voice
 setup(5,'car');await sleep(100);let sp=0;w.eval('window.__sp=0;const _s=speak;speak=function(c){window.__sp++;return _s(c)}');
 wrong();endV();wrong();await sleep(80);T('listen: cheer voice playing, prompt NOT replayed during voice',w.eval('window.__sp')===0);endV();await sleep(80);
 T('listen: after cheer ends, zhuyin sequence replayed (new queue)',w.eval('ZQ.busy')||w.__log.some(x=>/zhuyin/.test(x.src)));
 // ===== 4. 語音辨識失敗 =====
 setup(3,'hsr','S.asrAgreed=1;S.asrDecl=0');await sleep(500);
 T('speak: mode + recognition started',E('S.set.mode')==='speak'&&w.__asr.length>=1&&q('#micbox')!==null);
 w.__log.length=0;const nres=(txt,fin=true)=>({resultIndex:0,results:Object.assign([Object.assign([{transcript:txt}],{isFinal:fin})],{})});
 E('ASR.skipUntil=0;ASR.base=0');const asr0=w.__asr.length,tr1=E('G.tries'),lg1=E('S.logs.length');
 w.eval('asrRes')(nres('嗯嗯'));await sleep(100);
 T('ASR failure: 請再說一次 played once',V().join()==='guidance/no_hear'&&E('G.vf.again')===1);
 T('ASR failure: recognition really paused (aborted, ASR.paused, not on)',E('ASR.paused')===true&&E('ASR.on')===false&&w.__asr[w.__asr.length-1].aborted===true);
 T('ASR failure: mic breathing light on, NOT counted as wrong',!!q('#micbox.breath')&&E('G.tries')===tr1&&E('S.logs.length')===lg1&&E('G.wc')===0&&E('G.sp.miss')===1);
 w.eval('asrRes')(nres(E('G.cur.text')));await sleep(50);T('ASR: even a correct transcript is ignored while teacher voice plays',E('G.done')===0&&!E('G.lock'));
 w.eval('asrRes')(nres('嗯'));await sleep(50);T('ASR: second miss inside 5s cooldown → no second voice',V().join()==='guidance/no_hear');
 endV();await sleep(100);T('ASR: after voice ends, recognition reopened',E('ASR.paused')===false&&w.__asr.length>asr0&&E('ASR.on')===true);
 await sleep(2000);T('ASR: breathing light fades after restart',!q('#micbox.breath'));
 w.eval('asrRes')(nres(E('G.cur.text')));await sleep(400);T('ASR: correct answer accepted after skip window → progresses (ok voice)',E('G.done')===1&&V().includes('ok'));
 // ===== 5. 停頓 15 秒 =====
 endV();await sleep(1600);setup(3,'bike','IDLE_MS=500');E('IDLE_MS=500');E('ask()');w.__log.length=0;
 await sleep(300);right();await sleep(300);T('idle: key activity resets the timer (no push at 600ms after activity)',V().filter(x=>x==='push').length===0);
 await sleep(500);T('idle: 小明加油 once after pause; warm bubble + nudge; answer not shown',V().join()==='push'&&!!q('.enc')&&q('#train').classList.contains('nudge'));
 T('idle: no answer given (hint state unchanged)',E('G.h.f')===0&&E('K.hf')!==1);
 endV();await sleep(1600);T('idle: not repeated within the same question',V().filter(x=>x==='push').length===1);
 console.log(res.P+' pass, '+res.F+' fail');process.exit(0)})().catch(e=>{console.log('ERR',e);process.exit(1)});
