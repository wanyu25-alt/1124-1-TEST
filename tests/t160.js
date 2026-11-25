// 第03階段：注音逐鍵發音、口語結果分類、成人確認、辨識失敗處理、觀察指標（jsdom）
const fs=require('fs');const {mk,R,T,sleep}=require('./t30h.js');
const IMG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const SEED=`S.cards=[{id:'c1',text:'火車',zy:'ㄏㄨㄛˇ ㄔㄜ',img:'${IMG}',audio:'',cats:[]},{id:'c2',text:'蘋果',zy:'ㄆㄧㄥˊ ㄍㄨㄛˇ',img:'${IMG}',audio:'',cats:[]},{id:'c3',text:'公車',zy:'ㄍㄨㄥ ㄔㄜ',img:'${IMG}',audio:'',cats:[]}];S.cats=[];S.set.src='all';S.set.order='seq';S.set.sound=false;S.set.music=false;S.set.ap=false;S.set.n=3;S.set.anim=false;S.set.hz={u:'none',free:true};S.set.hl={w:1,c:1,p:1,f:1,a:1};V2.prepDone=true;save()`;
const boot=async(o={})=>{const w=mk(Object.assign({fresh:true},o));const t0=Date.now();while(Date.now()-t0<8000&&!(w.eval('typeof UI!=="undefined"&&typeof KV!=="undefined"&&S.set.ttsMig===3')))await sleep(50);const E=c=>w.eval(c),q=s=>w.document.querySelector(s),qa=s=>[...w.document.querySelectorAll(s)];w.alert=m=>{w.__al=m};w.confirm=()=>true;E(SEED);return{w,E,q,qa}};
(async()=>{
 // ① 37 個注音符號與錄音對應（對照 AUDIO-MAPPING.md）
 {const {w,E}=await boot();
  const md=fs.readFileSync(__dirname+'/../AUDIO-MAPPING.md','utf8');
  const rows=[...md.matchAll(/^\| (\S) \| U\+([0-9A-F]{4}) \| `voice\/zhuyin\/(zy_\w+\.m4a)` \|.*?\| ([0-9.]+) s \|/gm)].map(m=>({sym:m[1],cp:m[2],file:m[3],lead:+m[4]}));
  T('AUDIO-MAPPING.md lists 37 symbols',rows.length===37);
  const map=JSON.parse(E('JSON.stringify(ZSY)'));
  T('every symbol → same file name as the documented table (no wrong pairing)',rows.every(r=>{const z=map.find(x=>x[0]===r.sym);return z&&'zy_'+z[1]+'.m4a'===r.file&&r.sym.codePointAt(0).toString(16).toUpperCase()===r.cp}));
  T('all 37 recordings exist on disk',rows.every(r=>fs.existsSync(__dirname+'/../voice/zhuyin/'+r.file)));
  T('code uses the built-in URL of exactly that file for each symbol',rows.every(r=>E(`ZQ.symUrl("${r.sym}")`)==='voice/zhuyin/'+r.file));
  T('no recording is mapped to a tone mark or space (tones stay silent)',['ˊ','ˇ','ˋ','˙',' ','ˉ'].every(t=>E(`ZMAP[${JSON.stringify(t)}]===undefined&&!isSym(${JSON.stringify(t)})`)));
  T('built-in lead-in silence ≥ 0.25 s everywhere, so trimming 0.18 s never cuts the sound',rows.every(r=>r.lead>=0.25)&&E('KV.lead')<0.25);
 }
 // ② 按鍵發音行為
 {const {w,E}=await boot();
  E('UI.pick("quiet");goV("bike")');await sleep(300);
  const log=()=>w.__aud.log||[];const urls=()=>log().map(x=>x.src);
  T('a typed round is running',E('G.on')&&E('typed()'));
  E('G.listened=true;V2.stp=null');
  const n0=log().length;E('kPress("ㄏ","touch_keyboard")');
  const k1=log().slice(n0);
  T('pressing ㄏ immediately plays zy_h.m4a (touch)',k1.length===1&&/voice\/zhuyin\/zy_h\.m4a$/.test(k1[0].src));
  const exp=E('K.seq[K.ci][K.si]');const wrong=['ㄅ','ㄆ'].find(x=>x!==exp);const w0=log().length;E(`kPress("${wrong}","physical_keyboard")`);
  const kw=log().slice(w0).filter(x=>/zhuyin/.test(x.src));
  T('a wrong key plays its own sound (the pressed symbol), never the expected one',kw.length>=1&&kw[0].src.endsWith('zy_'+E(`ZMAP["${wrong}"]`)+'.m4a'));
  const t0=log().length;E('kPress("ˇ","touch_keyboard");kPress("ˊ","touch_keyboard");kPress(" ","touch_keyboard")');
  T('tone keys and space play no recording',log().slice(t0).filter(x=>/zhuyin/.test(x.src)).length===0);
  // 快速按鍵：同一鍵 60ms 內不重複輸入
  const tr0=E('G.tries'),ci=E('K.ci+":"+K.si'),ev0=E('K.evs.length');E('kPress("ㄅ","touch_keyboard");kPress("ㄅ","touch_keyboard");kPress("ㄅ","touch_keyboard")');
  T('three presses of the same key within 60 ms count as one input',E('K.evs.length')-ev0===1);
  // 不堆疊：連按多個不同鍵，同一時間只有一個注音在播
  await sleep(80);E('kPress("ㄇ","touch_keyboard")');await sleep(10);E('kPress("ㄈ","touch_keyboard")');await sleep(10);E('kPress("ㄉ","touch_keyboard")');
  const playing=w.__aud.filter(a=>!a.paused&&/zhuyin/.test(a.src));
  T('rapid different keys: only the latest symbol is playing (no stacking)',playing.length===1&&playing[0].src.endsWith('zy_d.m4a'));
  T('no two voice files ever played at the same time during all of this',!(w.__viol>0));
  T('at most one Audio element per symbol (pool ≤ 37), no new element per press',w.__aud.filter(a=>/zhuyin/.test(a.src)).length<=37);
  // 開關與音量
  E('S.set.keyVoice=false');const o0=log().length;E('kPress("ㄋ","touch_keyboard")');T('發音開關關閉 → no key voice (beep fallback still works)',log().slice(o0).filter(x=>/zhuyin/.test(x.src)).length===0);
  E('S.set.keyVoice=true;S.set.vv=0.3');await sleep(80);E('kPress("ㄌ","touch_keyboard")');
  T('volume setting is respected (voice volume 0.3)',Math.abs(log().slice(-1)[0].el.volume-0.3)<1e-6);
  E('S.set.vv=0.9');
  // 實體鍵盤：長按不重複
  const ev1=E('K.evs.length');w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'1',code:'Digit1',repeat:true}));
  T('physical key auto-repeat is ignored (no second input, no sound)',E('K.evs.length')===ev1);
  // 鼓勵語音與注音不重疊：答錯後的「再一次喔」等注音念完才播
  await sleep(300);E('G.lock=false;V2.stp=null');const nn=E('KV.cur?1:0');
  E('kPress("ㄅ","touch_keyboard")');
  T('while a symbol is playing, a teacher cheer voice is queued (not overlapped)',E('KV.cur')!==null);
  await sleep(1200);T('after everything: still no overlapping voices',!(w.__viol>0));
  E('leave()');T('leaving stops key voice',E('KV.cur')===null);
 }
 // ③ 成人確認六選項、分類、紀錄
 {const {w,E,q,qa}=await boot();
  const start=()=>{E('try{leave()}catch(e){};S.set.lm="oral";S.set.oj="B";S.set.mode="speak";S.set.mix=false;S.set.src="all";PH.start("speak","obj")')};
  start();await sleep(400);
  const btn=qa('#spadult button').map(b=>b.textContent.trim());
  T('adult panel offers the six options (正確/部分/嘗試/尚未/沒回答/技術問題)',['正確說出','說出部分詞彙','有開口嘗試','尚未正確說出','沒有回答','技術問題'].every(t=>btn.some(x=>x.includes(t))));
  T('confirmer selector present',!!q('#cfby'));
  const mark=(c)=>{start();return new Promise(async r=>{await sleep(300);E(`G.sk&&0;RE.hint&&0`);E(`SK.mark("${c}")`);await sleep(250);r(E('S.recs[S.recs.length-1]'))})};
  // 部分口語
  start();await sleep(300);E('SK.mark("partial")');await sleep(300);let rec=E('S.recs[S.recs.length-1]');
  T('部分口語表達: sp.cls=partial, not counted as wrong, confirm saved',rec&&rec.sp.cls==='partial'&&rec.outcome!=='wrong'&&rec.confirm&&rec.confirm.final==='partial');
  start();await sleep(300);E('SK.mark("attempt")');await sleep(300);rec=E('S.recs[S.recs.length-1]');
  T('有開口嘗試: sp.cls=attempt, outcome unconfirmed (not wrong)',rec.sp.cls==='attempt'&&rec.outcome==='unconfirmed'&&rec.sp.attempt===true);
  start();await sleep(300);const nq=E('G.q.length');E('SK.mark("tech")');await sleep(300);rec=E('S.recs[S.recs.length-1]');
  T('技術問題: recorded as tech_error (not wrong), question comes back later, no star',rec.outcome==='tech_error'&&E('G.q.length')===nq+1&&rec.reward.starsGained===0);
  start();await sleep(300);E('SK.mark("correct")');await sleep(300);rec=E('S.recs[S.recs.length-1]');
  T('正確說出 with no hints: ok_indep, confirm.by recorded, independent',rec.sp.cls==='ok_indep'&&rec.confirm.final==='correct'&&rec.confirm.by==='成人'&&rec.confirm.ts>0);
  start();await sleep(300);E('FL.setCfBy("老師");SK.mark("none")');await sleep(200);E('SK.mark("correct")');await sleep(300);rec=E('S.recs[S.recs.length-1]');
  T('changing the confirmation keeps history (none → correct) with confirmer and time',rec.confirm.history.length===2&&rec.confirm.history[0].choice==='none'&&rec.confirm.history[1].choice==='correct'&&rec.confirm.revisions===1&&rec.confirm.by==='老師');
  // 語音辨識原始紀錄不被覆蓋；事後補確認
  rec=E('S.recs.find(r=>r.sp&&r.sp.cls==="attempt")');const id=rec.id,asr0=JSON.stringify(rec.asr),out0=rec.outcome,first0=JSON.stringify(rec.first);
  E(`RE.revise("${id}","correct","家長")`);const r2=E(`S.recs.find(r=>r.id==="${id}")`);
  T('late confirmation appends history only: asr/outcome/first untouched, earlier entries kept',JSON.stringify(r2.asr)===asr0&&r2.outcome===out0&&JSON.stringify(r2.first)===first0&&r2.confirm.late===true&&r2.confirm.history.length===2&&r2.confirm.history[0].choice==='attempt'&&r2.confirm.history[1].by==='家長'&&r2.confirm.history[1].prev==='attempt');
  T('record has session, no raw audio fields',r2.session&&r2.session.learnerId&&!JSON.stringify(r2).match(/blob:|data:audio|rawAudio/));
 }
 // ④ 辨識失敗：最多請學生再說一次，之後改請大人確認
 {const {w,E,q,qa}=await boot();
  E('S.set.lm="oral";S.set.oj="C";S.set.mode="speak";PH.start("speak","obj")');await sleep(400);
  w.__aud.log=[];
  for(let i=0;i<5;i++){E('G.sp.miss++;SK.heardNo("嗯");asrMiss()');await sleep(60)}
  const again=(w.__aud.log||[]).filter(x=>/again|nohear|slow/.test(x.src)).length;
  T('after repeated recognition failures the student is asked to repeat at most once',again<=1);
  T('adult confirmation is highlighted and the message says adult confirms',!!q('#spadult.att'));
  const ev=E('G.sk.evs.filter(e=>e.cls==="unrecognized").length');T('each failure is logged as unrecognized (not wrong)',ev===5&&E('G.tries||0')===0);
  E('SK.mark("correct")');await sleep(300);const rec=E('S.recs[S.recs.length-1]');
  T('record keeps asrFail count and asrUsed; outcome not wrong',rec.sp.asrFail===5&&rec.sp.asrUsed===true&&rec.outcome!=='wrong');
 }
 // ⑤ 收音設定與背景音樂
 {const {w,E}=await boot();
  const cons=[];const g=w.navigator.mediaDevices.getUserMedia;w.navigator.mediaDevices.getUserMedia=async c=>{cons.push(JSON.stringify(c));return g(c)};
  E('S.set.music=true;S.set.lm="oral";S.set.oj="C";S.set.mode="speak";PH.start("speak","obj")');await sleep(800);
  T('speaking round requests echoCancellation, noiseSuppression and autoGainControl',cons.length>0&&cons.every(c=>/"echoCancellation":true/.test(c)&&/"noiseSuppression":true/.test(c)&&/"autoGainControl":true/.test(c)));
  T('background music is held (paused) while collecting speech',E('!!mus.hold')||E('musVol()')===0);
  E('leave()');await sleep(200);
 }
 // ⑥ 指標：分子、分母、有效筆數
 {const {w,E}=await boot();
  const mkr=(o)=>Object.assign({game:'speak',purpose:'assess',outcome:'correct',hints:[],asr:[],ts:Date.now(),sp:{cls:'ok_indep',attempt:true,asrFail:0,asrUsed:false,hintTypes:[]},confirm:null},o);
  const rows=[mkr({}),mkr({}),mkr({sp:{cls:'ok_prompted',attempt:true,asrFail:0,asrUsed:true},hints:[{type:'P3_voice'}]}),
   mkr({outcome:'correct',sp:{cls:'ok_imitated',attempt:true,asrFail:1,asrUsed:true,demoType:'voice'},hints:[{type:'P4_voice'}]}),
   mkr({outcome:'correct',sp:{cls:'ok_prompted',attempt:true,asrFail:0,asrUsed:false,demoType:'zhuyin'},hints:[{type:'P4_zy'}]}),
   mkr({outcome:'unconfirmed',sp:{cls:'unrecognized',attempt:true,asrFail:2,asrUsed:true}}),
   mkr({outcome:'no_response',sp:{cls:'none',attempt:false,asrFail:0,asrUsed:false}}),
   mkr({outcome:'tech_error',sp:{cls:'none',attempt:false,asrFail:0,asrUsed:false}}),mkr({outcome:'skipped',sp:{cls:'none',attempt:false}}),
   mkr({outcome:'unconfirmed',sp:{cls:'attempt',attempt:true,asrFail:0},confirm:{final:'correct',history:[{choice:'correct'}]}})];
  const o=w.eval(`OBS.compute(${JSON.stringify(rows)})`);
  T('valid oral questions exclude tech error and skipped (8 of 10)',o.valid===8);
  T('嘗試率: 7 attempted ÷ 8 valid',o.attempt.num===7&&o.attempt.den===8);
  T('pending (unrecognized, unconfirmed) is kept out of correct-rate denominators and listed separately',o.pending===1&&o.indep.den===7);
  T('自主正確率: 3 ok_indep (two unhinted + one confirmed-correct) ÷ 7 confirmed',o.indep.num===3&&o.indep.den===7);
  T('部分提示後正確率: 1 ÷ 1 (P3)',o.partial.num===1&&o.partial.den===1&&o.partial.low===true);
  T('完整示範後正確率: P4 voice + P4 zhuyin both correct, kept as separate types in the note',o.full.num===2&&o.full.den===2&&/完整語音 1／1/.test(o.full.note)&&/完整注音 1／1/.test(o.full.note));
  T('辨識失敗: 2 questions had ≥1 failure ÷ 3 using ASR; total failures stated',o.asr.den===3&&o.asr.num===2&&/失敗總次數 3 次/.test(o.asr.note));
  T('every indicator carries n and a low-data flag below 5',[o.attempt,o.indep,o.partial,o.full,o.dep,o.asr].every(x=>typeof x.n==='number'&&typeof x.low==='boolean'));
  T('人工確認 counted separately',o.conf.n===1&&o.conf.cnt.correct===1);
  E('tab(2)');
 }
 // ⑦ 自主詞彙提取：開始時不給答案、示範後仿說不算自主、之後重測
 {const {w,E,q}=await boot();
  E('S.set.lm="oral";S.set.oj="B";S.set.mode="speak";S.set.n=5;PH.start("speak","obj")');w.__aud.log=[];await sleep(500);
  const mid=q('#mid').textContent+q('#bot').textContent;
  T('speak start: answer text/zhuyin not shown and no voice of the answer played',!mid.includes(E('G.cur.text'))&&!mid.includes('ㄏㄨㄛ')&&!(w.__aud.log||[]).some(x=>/voice\//.test(x.src)&&!/again|slow|guidance/.test(x.src)));
  E('SK.give("P4v","button")');await sleep(100);E('SK.mark("correct")');await sleep(300);const r=E('S.recs[S.recs.length-1]');
  T('imitation after the full voice demo: ok_imitated, NOT independent, hint type P4_voice saved',r.sp.cls==='ok_imitated'&&r.independent===false&&r.sp.demoType==='voice'&&r.hints.some(h=>h.type==='P4_voice'));
  T('a no-hint retest of that word is scheduled later in the round',E('G.q.slice(G.i).some(c=>c._rt)')||E('!!G.lastRec&&!!G.lastRec.fadeScheduled'));
  E('leave()');E('S.set.mode="speak";PH.start("speak","obj")');await sleep(300);E('SK.give("P4z","button")');await sleep(100);E('SK.mark("correct")');await sleep(300);const z=E('S.recs[S.recs.length-1]');
  T('full zhuyin hint kept as its own type (P4_zy → ok_prompted, demoType zhuyin), not merged with voice imitation',z.sp.cls==='ok_prompted'&&z.sp.demoType==='zhuyin'&&z.hints.some(h=>h.type==='P4_zy'));
 }
 console.log('done');process.exit(0);
})();
