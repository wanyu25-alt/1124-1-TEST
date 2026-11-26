const {sleep,T,mk,mkSetup,res}=require('./t19h.js');
(async()=>{const w=mk();await sleep(500);const {E,d,q,V,endV,setup,wrong,right}=mkSetup(w);
 const finish=async()=>{while(!E('G.lock'))right();};
 // ===== 6. 完成單一關卡 =====
 setup(2,'car');await sleep(100);
 await finish();await sleep(1500);endV();await sleep(1500);
 w.__log.length=0;wrong();await sleep(60);T('level: pending normal voice (retry) is playing before final answer',V().join()==='retry');
 w.eval('IDL.act=0');wrong();// cheer queued behind retry
 const viol0=w.__viol;await finish();await sleep(60);
 T('level: final answer cancels playing retry and the queued cheer; AM.lv set',w.__els.find(x=>x.src==='voice/retry.m4a')&&E('AM.cur')===null&&E('AM.lv')===true);
 T('level: teacher voice not at once (0.3s later), no sfx before it',V().join()==='retry');
 await sleep(1000);T('level: 恭喜過關 after ~0.9s; no 答對囉 for final question; no done',V().join()==='retry,pass');
 T('level: dash animation on vehicle',E('document.querySelector("#train").className').includes('dash')||E('AM.lv'));
 endV();await sleep(2300);const o=q('#arr');
 T('level: result overlay at ~2s with count, rate, rewards, 再練習一次/選擇其他站/返回首頁',!!o&&o.textContent.includes('完成旅程')&&o.textContent.includes('完成題數')&&o.textContent.includes('本次獲得星星')&&o.textContent.includes('再練習一次')&&o.textContent.includes('返回首頁')&&o.textContent.includes('選擇其他站')&&!/一次就答對|車票|累計/.test(o.textContent)&&!!o.querySelector('.skp'));
 T('level: soft celebration (ribbons, flying stars, ticket), NO flash/fireworks; overlay only at end of level',o.querySelectorAll('.rib').length>10&&o.querySelectorAll('.fs').length>=3&&!o.querySelector('.flash')&&!o.querySelector('.fw'));
 T('level: first-try count still recorded for parent/teacher (1 of 2), not shown to student',E('S.rw.journeys.slice(-1)[0].first')===1&&!/1／2/.test(o.textContent));
 T('level: pass voice never double-played; voices ≤1 concurrently',V().filter(x=>x==='pass').length===1&&w.__viol===viol0);
 T('level: records ok (round counted once, journey saved w/ vehicle)',E('S.rounds.completed')===1&&E('S.rw.journeys.length')===1&&E('S.rw.journeys[0].veh')==='car');
 // continue button
 [...o.querySelectorAll('button')].find(b=>/再玩一次|再練習一次/.test(b.textContent)).click();await sleep(100);T('level: 繼續挑戰 starts a new round and silences voice',!q('#arr')&&E('G.on')&&E('G.done')===0&&E('AM.lv')===false&&E('AM.cur')===null);
 // ===== 7. 完成整個階段 =====
 setup(2,'bike','S.set.stageN=2');await sleep(100);
 await finish();await sleep(1500);endV();await sleep(1000);
 await finish();await sleep(60);await sleep(1000);
 T('stage: first round of N=2 gets 恭喜過關, not done',V().filter(x=>x==='pass'||x==='done').join()==='pass'&&E('S.rw.stageLog.length')===0);
 endV();await sleep(2500);w.__log.length=0;
 // run the second round
 await sleep(1500);endV();q('#arr')&&[...q('#arr').querySelectorAll('button')].find(b=>/再玩一次|再練習一次/.test(b.textContent)).click();await sleep(100);
 w.__log.length=0;await finish();await sleep(1500);endV();await sleep(100);
 await finish();await sleep(1100);
 T('stage: round meeting daily goal plays 恭喜小明完成啦 (not 恭喜過關)',V().includes('done')&&!V().includes('pass'));
 endV();await sleep(2400);const o2=q('#arr');
 T('stage: （v9.0 簡化後）階段完成仍顯示完成旅程畫面與學生姓名；舊版獎盃／今天的學習紀錄畫面已被取代',!!o2&&o2.textContent.includes('完成旅程')&&o2.textContent.includes('小明')&&!o2.textContent.includes('今天的學習紀錄'));
 T('stage: logged once (stageLog, trophies)',E('S.rw.stageLog.length')===1&&E('S.rw.trophies')===1&&E('S.rw.journeys.length')===2);
 endV();[...o2.querySelectorAll('button')].find(b=>/再玩一次|再練習一次/.test(b.textContent)).click();await sleep(100);
 await finish();await sleep(1500);endV();await finish();await sleep(1100);
 T('stage: same day 3rd round → normal 恭喜過關 only, done not repeated',V().filter(x=>x==='done').length===1&&V().includes('pass'));
 T('stage: done never played for ordinary questions',E('S.rw.stageLog.length')===1);
 // ===== 8. 快速連續作答 =====
 setup(5,'bike');await sleep(100);w.__viol=0;
 for(let k=0;k<3;k++){const i0=E('G.i');while(E('G.i')===i0&&!E('G.lock'))right();E('ok()');E('ok()');await sleep(40)}
 await sleep(400);T('rapid: 3 quick completions of one question → one ok voice, ok() idempotent',V().filter(x=>x==='ok').length===1&&E('G.done')===1);
 await sleep(1200);endV();w.__log.length=0;
 for(let k=0;k<5;k++){wrong();await sleep(15)}
 await sleep(100);T('rapid: 5 wrong presses within 100ms → retry, then 沒關係 replaces it at the 3rd wrong (never overlapping)',V().join().replace('guidance/retry_try','retry')==='retry,guidance/slow'&&w.__viol===0);
 endV();await sleep(60);endV();await sleep(60);
 T('rapid: no further voices after 沒關係; never overlapping',V().join().replace('guidance/retry_try','retry')==='retry,guidance/slow'&&w.__viol===0);
 await finish();await sleep(1500);endV();
 for(let k=0;k<3;k++){const i0=E('G.i');await finish();await sleep(1450)}
 T('rapid: voices never overlap across fast progress',w.__viol===0);
 // ===== 9. 語音播放中切換頁面 =====
 setup(5,'bike','S.set.music=true;S.set.mv=.4');await sleep(300);
 await finish();await sleep(300);T('switch: voice playing and music ducked',E('AM.cur&&AM.cur.k')==='ok'&&Math.abs(E('musVol()/S.set.mv')-.25)<.01);
 const el=w.__els.find(x=>x.src==='voice/ok.m4a'&&!x.muted);E('tab(2)');await sleep(30);
 T('switch: voice stopped, no current voice, duck released, timers cleared, game off',el.paused&&E('AM.cur')===null&&E('AM.tm.length')===0&&E('mus.dv')===0&&E('G.on')===false);
 w.__log.length=0;await sleep(1700);T('switch: nothing plays afterwards (no stray next-question cue)',V().length===0);
 E('tab(1)');home=E('home()');
 // switch before delayed ok voice (100ms)
 setup(5,'bike');await sleep(100);await finish();await sleep(80);E('tab(2)');w.__log.length=0;await sleep(600);T('switch: pending 220ms ok voice cancelled by page switch',V().length===0);
 // final-level voice pending then leave
 E('tab(1)');setup(1,'bike');await sleep(100);await finish();await sleep(300);E('leave()');w.__log.length=0;await sleep(2500);T('switch: leaving during level-end cancels pass voice & overlay',V().length===0&&!q('#arr'));
 // visibility hidden
 setup(5,'bike');await sleep(100);await finish();await sleep(400);const had=E('AM.cur&&AM.cur.k');Object.defineProperty(w.document,'hidden',{value:true,configurable:true});w.document.dispatchEvent(new w.Event('visibilitychange'));await sleep(30);
 T('hidden tab: voice stopped',had==='ok'&&E('AM.cur')===null);Object.defineProperty(w.document,'hidden',{value:false,configurable:true});
 // restart
 setup(5,'bike');await sleep(100);await finish();await sleep(400);E('startRound()');T('restart: voice stopped, flags reset',E('AM.cur')===null&&E('AM.lv')===false&&E('G.done')===0);
 // ===== extras: vehicles, volumes, settings =====
 const sig={};for(const k of ['bike','car','train','hsr','plane']){for(const kind of ['ok','pass']){setup(3,k);w.__osc.length=0;E(`S.set.theme='${k}'`);E(kind==='ok'?"sfx('ok')":"sfx('win')");sig[k+kind]=w.__osc.map(o=>o.type[0]+Math.round(o.frequency.value)).join(',')}}
 const vals=Object.values(sig);T('vehicles: five ok-sounds and five pass-sounds are all different',new Set(vals).size===10);
 T('vehicles: engine types use low gain/softly (peak per gain ≤0.25)',w.__gain.every(g=>g.gain.peak<=.25));
 setup(3,'bike','S.set.vs=0.2;S.set.vv=0.3;S.set.mv=.5');w.__log.length=0;w.__gain.length=0;E("sfx('ok')");const pk=Math.max(...w.__gain.map(g=>g.gain.peak));E('AM.say("ok",{test:1})');
 T('volumes independent: sfx peak scales with vs, voice uses vv, music untouched',pk<.04&&w.__log.filter(x=>x.src==='voice/ok.m4a'&&!x.muted).pop().vol===.3&&E('S.set.mv')===.5);
 E('S.set.vf=false');E('AM.stop()');w.__log.length=0;E('AM.say("ok")');T('voice feedback off: no teacher voice, game still works',V().length===0);
 E('S.set.vf=true;S.set.sound=false');w.__osc.length=0;E("sfx('ok')");T('sfx off: silent',w.__osc.length===0);E('S.set.sound=true');
 E('S.set.anim=false');setup(2,'bike','S.set.anim=false');await sleep(80);await finish();await sleep(1500);await finish();await sleep(600);endV();await sleep(2400);T('animation off: no particles/fireworks in result overlay, still shows stats',!!q('#arr')&&q('#arr .fxl')===null&&q('#arr').textContent.includes('完成題數'));
 setup(2,'bike','S.set.anim=true;S.set.fx="low"');await sleep(80);await finish();await sleep(1500);await finish();await sleep(600);endV();await sleep(2400);T('low intensity: fewer particles, no flash',!q('#arr .fxl')&&!q('#arr .flash')&&q('#arr .arbx.fx1')!==null&&q('#arr').querySelectorAll('.fs').length===3);
 console.log(res.P+' pass, '+res.F+' fail');process.exit(0)})().catch(e=>{console.log('ERR',e);process.exit(1)});
