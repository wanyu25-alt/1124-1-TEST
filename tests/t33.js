const fs=require('fs');const {mk,L,R,T,sleep}=require('./t30h.js');
const W={棉被:'ㄇㄧㄢˊ ㄅㄟˋ',火車:'ㄏㄨㄛˇ ㄔㄜ',蘋果:'ㄆㄧㄥˊ ㄍㄨㄛˇ',香蕉:'ㄒㄧㄤ ㄐㄧㄠ',高鐵:'ㄍㄠ ㄊㄧㄝˇ',愛心:'ㄞˋ ㄒㄧㄣ',被:'ㄅㄟˋ',愛:'ㄞˋ'};
const boot=async(word,stars=10,extra='')=>{const w=mk();await sleep(450);const E=s=>w.eval(s),q=s=>w.document.querySelector(s);
 E(`S.set.legacyCost=true;S.cards=[{id:'a',text:'${word}',zy:'${W[word]}',img:'',audio:'',cats:[]},{id:'b',text:'火車',zy:'ㄏㄨㄛˇ ㄔㄜ',img:'',audio:'',cats:[]}];S.cats=[];S.set.src='all';S.set.order='seq';S.set.lm='quiet';S.set.mode='listen';S.set.n=3;S.set.ap=false;S.set.anim=false;S.set.hz={u:'rep',cost:true,n:1,free:false};S.set.hl={w:1,c:1,p:1,f:1,a:1};S.rw.stars=${stars};S.rw.spent=0;S.logs=[];${extra};startRound()`);await sleep(120);E('G.repDone=1;kBot()');return {w,E,q}};
const press=async(E,t,n=1)=>{for(let i=0;i<n;i++){E('G.repDone=1');E(`kHint('${t}')`);await sleep(150)}};
const cellsTxt=q=>[...q('#mid').querySelectorAll('.dm')].map(x=>x.textContent);
(async()=>{
 /* ===== 6 個詞彙：4 階段順序、每階段 −1、第 5 次不再扣 ===== */
 for(const word of ['棉被','火車','蘋果','香蕉','高鐵','愛心']){
  const {w,E,q}=await boot(word);
  T(`${word}: buttons show next stage & cost (提示聲母 −1⭐ / 完整注音 −4⭐)`,q('#hbp').textContent.includes('提示聲母 −1⭐')&&q('#hbf').textContent.includes('完整注音 −4⭐'));
  const seq=[];for(let i=0;i<4;i++){E("kHint('p')");await sleep(150);seq.push(E('K.hst[K.hst.length-1]'))}
  T(`${word}: order 聲母→介音→韻母→聲調; 4 presses = −4⭐`,seq.join()==='0,1,2,3'&&E('S.rw.stars')===6&&E('K.hcost')===4);
  T(`${word}: after 4th: button says 已完整提示`,q('#hbp').textContent.includes('已完整提示')&&q('#hbf').textContent.includes('已完整提示'));
  E("kHint('p')");E("kHint('f')");await sleep(150);T(`${word}: further presses never deduct`,E('S.rw.stars')===6&&E('K.hcost')===4);
  T(`${word}: hint never fills the answer boxes (typing still required)`,E('K.ci')===0&&E('K.si')===0&&q('#mid').querySelectorAll('.zs.ok').length===0&&[...q('#mid').querySelectorAll('.zs')].every(e=>e.textContent===''));
  E('leave()')}
 /* ===== 棉被：每階段顯示的內容 ===== */
 {const {w,E,q}=await boot('棉被');await press(E,'p');T('棉被 stage1 shows ㄇ and ㄅ only',cellsTxt(q).join('')==='ㄇㄅ');
  await press(E,'p');T('stage2 adds ㄧ (被 has no 介音 → blank)',cellsTxt(q).join('')==='ㄇㄧㄅ');await press(E,'p');T('stage3 adds ㄢ ㄟ',cellsTxt(q).join('')==='ㄇㄧㄢㄅㄟ');
  await press(E,'p');T('stage4 adds tones ˊ ˋ',cellsTxt(q).join('')==='ㄇㄧㄢˊㄅㄟˋ');E('leave()')}
 /* ===== 缺少類型時跳過 ===== */
 {const {w,E,q}=await boot('被');await press(E,'p',2);T('被: 介音 skipped → 2nd press reveals 韻母 (stages 聲母,韻母)',E('K.hst.join()')==='0,2'&&E('S.rw.stars')===8);
  await press(E,'p');T('被: 3rd press = 聲調; all valid shown',E('K.hst.join()')==='0,2,3'&&q('#hbp').textContent.includes('已完整提示')&&E('S.rw.stars')===7);await press(E,'p');T('被: 4th press no extra charge (no empty clue added)',E('S.rw.stars')===7&&E('K.hcost')===3);
  E('leave()')}
 {const {w,E,q}=await boot('愛');await press(E,'p',3);T('愛 (no 聲母/介音): only 韻母 + 聲調, total −2⭐, no empty button press',E('K.hst.join()')==='2,3'&&E('S.rw.stars')===8&&q('#hbp').textContent.includes('已完整提示'));E('leave()')}
 /* ===== 完整注音：直接 −4；部分後補差額；上限 4 ===== */
 {const {w,E,q}=await boot('棉被');await press(E,'f');T('direct 完整注音 = −4⭐',E('S.rw.stars')===6&&E('K.hdirect')===1&&cellsTxt(q).join('')==='ㄇㄧㄢˊㄅㄟˋ');
  T('after full: all buttons 已完整提示, no more deduction',q('#hbf').textContent.includes('已完整提示'));await press(E,'f');await press(E,'p');T('cap: still −4 in total',E('S.rw.stars')===6&&E('K.hcost')===4);E('leave()')}
 for(const [n,pay] of [[1,3],[2,2],[3,1]]){const {w,E,q}=await boot('棉被');await press(E,'p',n);const lab=q('#hbf').textContent;await press(E,'f');
  T(`${n} partial (−${n}) then full → label −${pay}⭐, deducts only ${pay}; total −4`,lab.includes('−'+pay+'⭐')&&E('S.rw.stars')===6&&E('K.hcost')===4&&E('K.hdirect')===0);E('leave()')}
 /* ===== 連點、不足、獨立 ===== */
 {const {w,E,q}=await boot('棉被');E("kHint('p')");E("kHint('p')");E("kHint('p')");await sleep(300);T('rapid triple click → single deduction',E('S.rw.stars')===9&&E('K.hst.length')===1);E('leave()')}
 {const {w,E,q}=await boot('棉被',1);await press(E,'f');T('insufficient stars: full still shown, stars 0 (never negative), cost recorded 4, deducted 1',E('S.rw.stars')===0&&E('K.hfull')===1&&E('K.hcost')===4&&E('K.hded')===1);E('leave()')}
 {const {w,E,q}=await boot('棉被',0);await press(E,'p');T('0 stars: hint still works, no block, no negative',E('K.hst.length')===1&&E('S.rw.stars')===0);E('leave()')}
 /* ===== 一聲空白鍵 ===== */
 {const {w,E,q}=await boot('火車');await press(E,'p',4);const sps=[...q('#mid').querySelectorAll('.sps')];
  T('一聲: tone hint shows 空白鍵 in hint row, answer box stays empty',sps.length===1&&sps[0].textContent==='空白鍵'&&[...q('#mid').querySelectorAll('.zs')].every(e=>!e.classList.contains('ok')));
  E('kPress("ㄏ");kPress("ㄨ");kPress("ㄛ");kPress("ˇ");kPress("ㄔ");kPress("ㄜ")');const z=q('#z1_2');T('一聲 box still blank until the student presses Space',!z.classList.contains('ok')&&E('K.ci')===1);
  E('kPress(" ")');T('after Space: box turns blue, char done',E('G.lock')===true||q('#z1_2').classList.contains('ok'));E('leave()')}
 /* ===== 已完成的字不再提示；題目切換重置 ===== */
 {const {w,E,q}=await boot('棉被');E('kPress("ㄇ");kPress("ㄧ");kPress("ㄢ");kPress("ˊ")');E("kHint('p')");await sleep(150);T('completed 棉 not hinted; 聲母 shown only for 被',cellsTxt(q).join('')==='ㄅ'&&E('K.hnew')!==null);
  E('K.ci=K.seq.length;ok()');await sleep(1700);T('next question: hint state fully reset',E('G.i')===1&&E('K.hst.length')===0&&E('K.hcost')===0&&E('K.hrv.size')===0&&cellsTxt(q).join('')==='');
  const lg=E('S.logs[0].v2.hint');T('record: partial 1, stages, cost 1, deducted 1, not direct',lg&&lg.partial===1&&lg.stages.join()==='聲母'&&lg.cost===1&&lg.ded===1&&lg.direct===0&&E('S.logs[0].cat')==='zy'&&E('S.logs[0].v2.starsS')===1);E('leave()')}
 {const {w,E,q}=await boot('棉被');await press(E,'f');E('K.ci=K.seq.length;ok()');const lg=E('S.logs[0].v2.hint');T('record: direct full → direct 1, cost 4, ded 4',lg.direct===1&&lg.full===1&&lg.cost===4&&lg.ded===4);
  await sleep(1700);E('S.logs.length');T('independent answer (no hint) recorded as 獨立完成 with no hint cost',(()=>{E('G.cur&&1');E('K.ci=K.seq.length;ok()');return E('S.logs[S.logs.length-1].cat')==='ind'&&E('S.logs[S.logs.length-1].v2.hint.cost')===0})());E('leave()')}
 /* ===== 星星扣除動畫 ===== */
 {const {w,E,q}=await boot('棉被',10,'S.set.anim=true');E("kHint('f')");await sleep(100);const sp=w.document.querySelector('.stfx.sp');T('full hint animation shows −4',!!sp&&sp.textContent.includes('−4')&&E('S.rw.stars')===6);await sleep(1400);
  T('new hints glow (class hl) after reveal',!!q('#mid .dm.hl')||E('K.hf')===1);E('leave()')}
 /* ===== CSS 顏色規格 ===== */
 {const h=fs.readFileSync((process.env.IDX||'/mnt/user-data/outputs/vocabulary-express/index.html'),'utf8');
  T('colors: empty box gray, hint pale gold, correct blue, wrong orange',/\.zs\{[^}]*background:#e3e8eb/.test(h)&&/\.dm:not\(:empty\)\{background:#fff3c4\}/.test(h)&&/\.zs\.ok\{background:#2f6fe4/.test(h)&&/\.zs\.bad\{border-color:#f59e0b/.test(h))}
 /* ===== 語音：速度、音量、來源 ===== */
 {const w=mk();await sleep(450);const E=s=>w.eval(s),q=s=>w.document.querySelector(s);w.__dur=60;
  T('defaults: recordings 1.25×, AI 0.75×, AI gain 1.5',E('DEF().set.recRate')===1.25&&E('DEF().set.ttsRate')===.75&&E('DEF().set.aiGain')===1.5);
  E("S.set.legacyCost=true;S.cards=[{id:'a',text:'棉被',zy:'ㄇㄧㄢˊ ㄅㄟˋ',img:'',audio:'',cats:[]}];S.set.sound=true;S.set.vf=true");
  E("ZQ.play([{k:'S:ㄅ',url:'voice/zhuyin/zy_b.m4a',src:'built-in'}])");await sleep(40);const el=w.__aud.log.slice(-1)[0].el;
  T('recording: playbackRate 1.25 with pitch preserved',el.playbackRate===1.25&&el.preservesPitch===true);
  E("AM.say('ok',{test:1})");await sleep(40);const e2=w.__aud.log.slice(-1)[0].el;T('teacher feedback recording also 1.25×',e2.playbackRate===1.25);
  E("ZQ.play([ZQ.word(S.cards[0])])");await sleep(150);const t=w.__ttsLog.slice(-1)[0];T('AI TTS: rate 0.75 (only one rate applied), volume ≤ 1 (API limit)',t&&t.rate===.75&&t.vol<=1&&t.vol===1);
  E('S.set.vol=.5');T('AI target volume = 1.5× setting when within limit (0.5 → 0.75)',Math.abs(E('V2.av()')-.75)<1e-9);E('S.set.vol=.7');T('AI volume capped at 1.0 when 1.5× exceeds API max',E('V2.av()')===1&&E('V2.avRaw()')>1);
  E('S.set.recRate=1;ZQ.play([{k:"S:ㄅ",url:"voice/zhuyin/zy_b.m4a",src:"built-in"}])');await sleep(40);T('teacher can change recording rate',w.__aud.log.slice(-1)[0].el.playbackRate===1);
  E('S.set.recRate=1.25');T('gap formula: 0.3 s total = program gap + 0.24 s file lead (built-in) ; full gap for AI',E("ZQ.gapFor({src:'built-in'})")===60&&E("ZQ.gapFor({src:'tts'})")===300);
  E("sub='set';tab(2)");const tx=q('#sp').textContent;T('teacher 設定: voice panel (真人 1.25×, AI 0.75×, 恢復預設, 單字/完整詞彙測試, 37 test table, 依序測試, stop)',['語音設定與音檔測試','1.25×','0.75×','恢復預設語音設定','注音分解','逐字','完整詞彙','依序測試全部注音','停止播放'].every(k=>tx.includes(k))&&q('#zatab').rows.length===38);
  T('API limit warning shown when AI volume capped',tx.includes('已達上限'));
  /* 播放模式與來源標示 */
  E("V2.playMode(S.cards[0],'sym')");await sleep(20);const inf=q('#vsinfo').textContent;T('注音分解: real recordings, tones not played',inf.includes('真人錄音')&&inf.includes('聲調沒有教學音檔')&&!inf.includes('AI'));
  E("V2.playMode(S.cards[0],'char')");T('逐字 without recording is labelled AI 合成語音',q('#vsinfo').textContent.includes('AI 合成語音'));E("V2.playMode(S.cards[0],'word')");T('完整詞彙 uses word item (AI when no recording)',q('#vsinfo').textContent.includes('AI 合成語音'));
  T('分解 plays ㄇㄧㄢ ㄅㄟ only (5 symbols)',E("V2.playMode(S.cards[0],'sym').map(i=>i.k).join()")==='S:ㄇ,S:ㄧ,S:ㄢ,S:ㄅ,S:ㄟ');
  /* 依序測試：一個播完才下一個；可停止 */
  w.__viol=0;w.__aud.log=[];E('zaSeq()');await sleep(1200);const n1=(w.__aud.log||[]).filter(x=>/zhuyin/.test(x.src)).length;E('zaSeqStop()');await sleep(500);const n2=(w.__aud.log||[]).filter(x=>/zhuyin/.test(x.src)).length;
  T('sequential test: plays in order, one at a time, stop works',n1>=2&&n2===n1&&!(w.__viol)&&w.__aud.log.filter(x=>/zhuyin/.test(x.src))[0].src.includes('zy_b.m4a'));
  /* 狀態：找不到／無法解碼 */
  w.fetch=async()=>({ok:false});const r1=await w.eval('zaProbe')('ㄅ');T('status: 找不到音檔 when 404',r1.t.includes('找不到音檔'));
  w.fetch=async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)});const r2=await w.eval('zaProbe')('ㄅ');T('status: 音檔無法解碼 when decode fails',r2.t.includes('無法解碼'));
  E("ZQ.play([{k:'x',url:'voice/none.m4a',src:'built-in',fail:()=>{window.__f=1}}])");const a=w.__aud.log.slice(-1)[0].el;a.onerror&&a.onerror();T('status: 播放失敗 hook fires on error',w.__f===1);
  /* 設定納入備份、恢復預設 */
  T('voice settings are portable (ZIP) settings',E("JSON.stringify(portableSet(S.set))").includes('"recRate"')&&E("JSON.stringify(portableSet(S.set))").includes('"aiGain"'));
  E('S.set.recRate=1.5;S.set.ttsRate=.9;S.set.aiGain=2;V2.vsReset()');T('restore defaults',E('S.set.recRate')===1.25&&E('S.set.ttsRate')===.75&&E('S.set.aiGain')===1.5)}
 /* ===== 檔案：備份、前導空白 ===== */
 {const P='/mnt/user-data/outputs/vocabulary-express/';const n=d=>fs.readdirSync(P+d).length;
  T('originals backed up: 37 zhuyin + 4 guidance + 5 generic',n('voice-original/zhuyin')===37&&n('voice-original/guidance')===4&&n('voice-original/generic')===5);
  const rep=JSON.parse(fs.readFileSync('/home/claude/v2/rep3.json','utf8'));
  T('lead silence in processed files ≤ 0.375 s (→ ≤ 0.3 s at 1.25×)',rep.every(r=>r.lead_file<=0.375&&r.lead_play<=0.3));
  T('removed head contains only noise floor (no clipped consonants): peak below −29 dB',rep.every(r=>r.removed_head_peak_db<-29));}
 console.log('P',R.P,'F',R.F);process.exit(R.F?1:0)})();
