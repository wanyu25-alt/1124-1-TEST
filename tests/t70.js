// 麥克風自動適應收音與語音辨識優化：測試（jsdom；無真人聲音／無實機，結果僅代表程式邏輯）
const {mk,R,T,sleep}=require('./t30h.js');
const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const C=(id,t,zy)=>({id,text:t,zy,img:PNG,audio:'',cats:[],created:1,modified:1});
const CARDS=[C('a','棉被','ㄇㄧㄢˊ ㄅㄟˋ'),C('b','蘋果','ㄆㄧㄥˊ ㄍㄨㄛˇ'),C('c','火車','ㄏㄨㄛˇ ㄔㄜ')];
(async()=>{
 let w=mk();await sleep(600);const E=s=>w.eval(s),q=s=>w.document.querySelector(s);
 const args=[];const g0=w.navigator.mediaDevices.getUserMedia;w.navigator.mediaDevices.getUserMedia=async a=>{args.push(a);const st=await g0();st.getAudioTracks=()=>[{getSettings:()=>({echoCancellation:true,noiseSuppression:true,autoGainControl:false,channelCount:1,sampleRate:48000}),stop(){}}];return st};
 w.navigator.mediaDevices.getSupportedConstraints=()=>({echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:true});
 const MAP={棉:'mian2',被:'bei4',貝:'bei4',面:'mian4',蘋:'ping2',果:'guo3',火:'huo3',車:'che1'};w.pinyinPro={pinyin:c=>MAP[c]||'xx1'};
 const setup=m=>E(`S.cards=${JSON.stringify(CARDS)};S.cats=[];S.set.src='all';S.set.order='seq';S.set.lm='oral';S.set.mode='${m}';S.set.mix=false;S.set.n=3;S.set.ap=false;S.set.anim=false;S.set.sk=true;S.cx={};S.recs=[];S.rv={};S.asrAgreed=1;S.lrn.list[0].ps={fade:0}`);
 const rec=()=>E('S.recs[S.recs.length-1]');
 const fire=(txt,fin=true)=>{w.__txt=txt;E('MV.sfxAt=0;MV.quietUntil=0;MV.holdQuiet=0;MIC.deafUntil=0;ASR.skipUntil=0;ASR.lockUntil=0;ASR.base=0;ASR.paused=false;SP.speaking=false;ZQ.busy=false;AM.cur=null');E(`asrRes({resultIndex:0,results:[Object.assign([{transcript:window.__txt}],{isFinal:${fin}})]})`)};
 // ---- A. 架構：沒有新增使用者介面，沿用同一個 MIC ----
 T('A1 MV module + shipped VAD core present, single MIC object',E('typeof MVAD')==='function'&&E('typeof MV.vad')!=='undefined'&&E('typeof MIC')==='object');
 const tp=E('(()=>{tab(2);return document.body.innerHTML})()');
 T('A2 teacher page has no new mic/gain/NS/AGC/calibration controls',!/噪音抑制|自動增益|校正|收音增益|錄音測試/.test(tp));
 E('tab(1)');
 // ---- B. 啟動：限制條件、只問一次權限 ----
 setup('speak');E('startRound()');await sleep(500);
 const a0=args[0]&&args[0].audio;
 T('B1 constraints: echoCancellation, noiseSuppression, autoGainControl true, channelCount 1',a0&&a0.echoCancellation===true&&a0.noiseSuppression===true&&a0.autoGainControl===true&&a0.channelCount===1);
 T('B2 getSettings recorded; AGC reported false is kept as reported (not assumed)',E('MV.flags.applied.autoGainControl')===false&&E('MV.flags.requested.autoGainControl')===true);
 E('PH.pre();PH.pre()');await sleep(100);T('B3 permission asked once only (no duplicate stream)',args.length===1&&w.__gum===1);
 const dg=E('MVDIAG()');T('B4 diagnostics expose raw/proc level, floor, threshold, gain, flags, honest ASR note',['raw_db','proc_db','floor_db','threshold_db','analysis_gain_x','flags'].every(k=>k in dg)&&/Web Speech/.test(dg.note)&&/不會收到放大/.test(dg.note));
 T('B5 analysis gain within 1.0–2.0x',dg.analysis_gain_x>=1&&dg.analysis_gain_x<=2);
 E('leave()');await sleep(100);T('B6 leaving stops tracks / analysis chain',E('MIC.st')===null&&E('MIC.raf')===0);
 // ---- C. 閘門與回音緩衝 ----
 setup('speak');E('startRound()');await sleep(400);
 E('MV.sfxAt=0;MV.quietUntil=0;MV.holdQuiet=0;MIC.deafUntil=0;ZQ.busy=false;AM.cur=null;SP.speaking=false');
 T('C1 gate open when nothing plays',E('MV.gate()')===true);
 E('ZQ.busy=true');T('C2 gate closed while demo/prompt plays',E('MV.gate()')===false);
 E('ZQ.busy=true');await sleep(80);E('ZQ.busy=false');await sleep(60);T('C3 0.3s echo buffer after playback completes',E('MV.gate()')===false);await sleep(450);T('C4 gate reopens after buffer',E('MV.gate()')===true);
 E('sfx("ok")');T('C5 sfx (cheer/pass/vehicle) also closes gate',E('MV.gate()')===false);
 // ---- D. VAD 輸出與 MIC 語意 ----
 E('MV.sfxAt=0');E('MIC.vms=0');w.__loud=1;await sleep(1200);
 T('D1 loud input → suspected voice → MIC.state speaking and vms grows',E('MIC.state')==='speaking'&&E('MIC.vms')>300);
 w.__loud=0;await sleep(2600);T('D2 after >2s silence → done (inter-word pause tolerance 2s)',E('MIC.state')==='done');
 E('leave()');
 // ---- E. 音樂：口說作答完全暫停、結束後淡入、老師關閉不重開 ----
 setup('speak');E('S.set.music=true;S.set.musSrc="synth";S.set.mode="key";musStart();S.set.mode="speak"');
 T('E0 music running before oral prompt',E('!!mus.t'));
 E('startRound()');await sleep(500);
 T('E1 oral answering: music held (silent, not just ducked)',E('mus.hold')===1&&E('musVol()')===0);
 T('E2 gate stays closed until music paused buffer done, then opens',E('MV.musicOn()')===false);
 E('MV.sfxAt=0;MIC.deafUntil=0');fire('棉被');await sleep(200);
 T('E3 correct answer credited',rec()&&rec().outcome==='correct');
 await sleep(2600);T('E4 music restored after sounds finish (fade-in)',E('mus.hold')===0&&E('musVol()')>0);
 E('leave()');
 setup('speak');E('S.set.music=false;musStop()');E('startRound()');await sleep(400);E('MV.relSoon()');await sleep(1600);
 T('E5 teacher turned music off: never re-enabled',E('!!mus.t')===false);E('leave()');
 // ---- F. 辨識結果處理 ----
 setup('speak');E('S.set.music=false');E('startRound()');await sleep(400);
 fire('棉貝');await sleep(200);let r=rec();
 T('F1 homophone 棉貝 (same syllables+tones) accepted, marked as homophone',r&&r.outcome==='correct'&&(r.sp.matchedBy==='homophone'));E('leave()');
 setup('speak');E('S.set.music=false');E('startRound()');await sleep(400);
 fire('面被');await sleep(150);
 T('F2 tone-different 面被: near → friendly retry, no wrong, no star loss',E('G.lock')===false&&E('G.sp.near')===1&&!/聽不清楚/.test(q('#msg').textContent)&&/接近/.test(q('#msg').textContent)&&E('G.tries')===0);
 fire('棉',true);await sleep(80);fire('被',true);await sleep(200);r=rec();
 T('F3 slow speech "棉"…"被" accumulates across pause and succeeds',r&&r.outcome==='correct');E('leave()');
 setup('speak');E('S.set.music=false');E('startRound()');await sleep(400);
 fire('蘋果');await sleep(150);T('F4 unrelated word: unrecognized event, not wrong, not locked',E('G.sk.evs.some(e=>e.cls==="unrecognized")')&&E('G.lock')===false&&E('G.tries')===0);
 // 有聲音但沒有辨識結果
 E('MV.asrSince=0');E('MV.utt={t0:Date.now()}');E('MV.onEnd({rejected:false,dur:900,avgDb:-30,peakDb:-20,reason:"silence"})');await sleep(2700);
 T('F5 voice but no ASR: 「我有聽到你的聲音喔！」, no wrong, no auto-pass',/我有聽到你的聲音/.test(q('#msg').textContent)&&E('G.lock')===false&&E('G.tries')===0&&E('G.sk.evs.some(e=>e.cls==="voice_no_asr")'));
 E('MV.noVoice()');T('F6 no voice: 靠近麥克風 message',/靠近麥克風/.test(q('#msg').textContent));
 E('leave()');
 // ---- G. 失敗不當作答錯 ----
 setup('speak');E('S.set.music=false');E('startRound()');await sleep(400);
 E('RE.tech("asr_network")');E('leave()');await sleep(200);r=rec();
 T('G1 ASR/service fault goes to tech[], outcome not "wrong"',r.tech.some(t=>t.code==='asr_network')&&r.outcome!=='wrong');
 // ---- H. 記錄與隱私 ----
 setup('speak');E('S.set.music=false');E('startRound()');await sleep(400);
 E('RE.cur.vad={n:1,ms:900,peakDb:-20,avgDb:-30,noVoice:0,voiceNoAsr:0,floor:-55,thr:-47,gdb:0}');fire('棉被');await sleep(200);r=rec();
 T('H1 record carries VAD summary separately (ext.vad), no audio fields',r.ext.vad&&r.ext.vad.n===1&&!JSON.stringify(r).match(/blob:|data:audio|base64,UklG/));
 T('H2 no raw audio persisted anywhere in state',!/audio\/(webm|wav|ogg)/.test(E('JSON.stringify(S).slice(0,2e6)')));
 E('leave()');
 // ---- I. 純邏輯：校準、門檻有界、平滑 ----
 const th=E(`(()=>{const v=new MVAD();let t=0;const o=[];for(let i=0;i<150;i++){t+=16;v.process({db:-58+Math.sin(i)*1,br:.5,fl:.5,lo:.2},t,true)}const a=v.thr,cal=v.calibrated,f0=v.floor;for(let i=0;i<600;i++){t+=16;v.process({db:-30,br:.6,fl:.1,lo:.2},t,true)}return{cal,fl:f0,a,b:v.thr,min:MVC.thrMin,max:MVC.thrMax}})()`);
 T('I1 calibrates noise floor in ~1.8–3s of quiet; threshold within bounds',th.cal&&th.fl<-52&&th.fl>-64&&th.b>=th.min&&th.b<=th.max);
 const jump=E(`(()=>{const v=new MVAD();v.floor=-60;v.calibrated=true;v.thr=v.target();let t=0,m=0,p=v.thr;for(let i=0;i<300;i++){t+=16;v.process({db:i<20?-60:-40,br:.2,fl:.9,lo:.2},t,true);m=Math.max(m,Math.abs(v.thr-p));p=v.thr}return m})()`);
 T('I2 threshold moves smoothly (no sudden jumps ≥1 dB per frame)',jump<.1);
 console.log('PASS',R.P,'FAIL',R.F);process.exit(R.F?1:0)})().catch(e=>{console.log('ERR',e);process.exit(1)});
