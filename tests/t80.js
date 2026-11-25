// 第04階段：第5站語句表達＋第6站生活溝通（jsdom；無真人語音，辨識結果以模擬輸入）
const {mk,R,T,sleep}=require('./t30h.js');
(async()=>{
 const w=mk();await sleep(600);const E=s=>w.eval(s),q=s=>w.document.querySelector(s);
 w.confirm=()=>true;w.alert=m=>{w.__al=m};
 const MAP={棉:'mian2',被:'bei4',我:'wo3',想:'xiang3',喝:'he1',水:'shui3'};w.pinyinPro={pinyin:c=>MAP[c]||'xx1'};
 const fire=(txt,fin=true)=>{w.__txt=txt;E('MV.sfxAt=0;MV.quietUntil=0;MV.holdQuiet=0;MIC.deafUntil=0;ASR.skipUntil=0;ASR.lockUntil=0;ASR.base=0;ASR.paused=false;SP.speaking=false;ZQ.busy=false;AM.cur=null');E(`asrRes({resultIndex:0,results:[Object.assign([{transcript:window.__txt}],{isFinal:${fin}})]})`)};
 const rec=()=>E('S.recs[S.recs.length-1]'),nrec=()=>E('S.recs.length');
 const reset=()=>{E('leave&&leave();S.recs=[];S.rv={};S.set.p4Gen="orig";S.set.seScope="all";S.set.music=false;S.set.lm="oral";S.set.mix=false;S.set.n=3;S.set.anim=false;S.set.ap=false;S.set.sk=true;S.asrAgreed=1;V2.prepDone=true;S.lrn.list[0].ps={fade:0,sw:10};S.lrn.list[0].p4={}');};
 const go=async(g,o)=>{reset();E(`SE.start('${g}',${JSON.stringify(o||{})})`);await sleep(500);E('MV.sfxAt=0;MV.quietUntil=0;MV.holdQuiet=0;MIC.deafUntil=0')};
 // ---- A 站與教材 ----
 E('S.cards=[];S.cx={}');T('A1 stations 5 and 6 marked developed',E('STG[4].dev&&STG[5].dev'));
 E('SE.starter()');const n1=E('SE.all().length'),m1=E('SCN.all().length');E('SE.starter()');
 T('A2 starter loads 9 sentences + 11 scenes, idempotent',n1===9&&m1===11&&E('SE.all().length')===9&&E('SCN.all().length')===11);
 T('A3 every scene lists several accepted answers (no single fixed answer)',E('SCN.all().every(s=>s.expected.length>=5)'));
 // ---- B 句型 ----
 reset();let on=E('PAT.filter(p=>SE.patOn(p.id)).map(p=>p.id)');
 T('B1 complex patterns off by default; life-useful patterns on',!on.includes('reason_need')&&!on.includes('event')&&!on.includes('p_act_obj')&&on.includes('need_act_obj')&&on.includes('act_place'));
 E('SE.p4set("cx",true)');on=E('PAT.filter(p=>SE.patOn(p.id)).map(p=>p.id)');T('B2 teacher can open complex patterns',on.includes('reason_need')&&on.includes('event'));
 E('SE.patTog("event",false)');T('B3 single pattern can be switched off',E('SE.patOn("event")')===false&&E('SE.patOn("reason_need")')===true);
 E('LRN.upd(LRN.cur().id,{p4:{}})');
 // ---- C 語句擴展示範 ----
 await go('sxt');const sid=E('G.cur._se');await sleep(7000);
 T('C1 expansion demo marks sentence taught+demo, writes no answer record',nrec()===0&&E(`SE.st("${sid}").taught`)&&E(`SE.st("${sid}").demo`)&&E(`SE.novel("${sid}")`)===false);
 E('SEG.tdone()');
 // ---- D 車廂：選下一節 ----
 await go('sxc');let eg=E('G.eg');T('D1 next-car options built; distractors are never accepted answers',eg&&eg.opts.length>=2&&eg.opts.filter(o=>o.ok).length===1&&E('G.eg.opts.filter(o=>!o.ok).every(o=>!SE.accepts(G.eg.d,o.t))'));
 const wi=E('G.eg.opts.findIndex(o=>!o.ok)'),ci=E('G.eg.opts.findIndex(o=>o.ok)');E(`SEG.pick(${wi})`);E(`SEG.pick(${ci})`);await sleep(200);let r=rec();
 T('D2 wrong then right: first=wrong, final correct, compose channel, no oral fields, star kept',r.game==='sxc'&&r.channel==='compose'&&r.first.result==='wrong'&&r.outcome==='correct'&&r.oralCorrect===null&&r.compCorrect===true&&E('S.rw.stars')>0);
 // ---- E 排列 ----
 await go('sxo');const se=E('SE.get(G.cur._se)'),parts=se.parts;
 const idxOf=t=>E(`G.eg.pool.findIndex(p=>p&&p.t===${JSON.stringify(t)})`);
 const ordered=[...parts].reverse();if(parts.length>=2&&ordered.join('')!==parts.join('')){ordered.forEach(t=>E(`SEG.put(${idxOf(t)})`));T('E1 wrong order is NOT accepted (not any arrangement is correct)',E('G.lock')===false&&E('G.tries')>=1&&E('G.eg.ch.every(x=>!x.ok)'))}
 await sleep(1100);parts.forEach(t=>E(`SEG.put(${idxOf(t)})`));await sleep(200);r=rec();T('E2 correct order accepted; first answer recorded wrong',r.outcome==='correct'&&r.game==='sxo'&&r.first.result==='wrong');
 // ---- F 選擇適合的說法 ----
 await go('scc');eg=E('G.eg');T('F1 scene choice: one valid option, distractors from other intents never valid',eg&&E('G.eg.opts.filter(o=>o.ok).length')===1&&E('G.eg.opts.filter(o=>!o.ok).every(o=>!SE.accepts(G.eg.d,o.t))'));
 E(`SEG.pick(${E('G.eg.opts.findIndex(o=>o.ok)')})`);await sleep(200);r=rec();T('F2 scc recorded as scene/compose, first correct, independent',r.itemKind==='scene'&&r.channel==='compose'&&r.first.result==='correct'&&r.independent);
 // ---- G 口說：多種合理答案 ----
 const ctxOf=async(g,id)=>{reset();E(`SE.start('${g}')`);await sleep(500);};
 const startSc=async(g,scId)=>{reset();E(`PH.qq={items:[SE.card(SCN.get("${scId}"),"${g}",{})],flow:true};PH.m0=S.set.mode;S.set.mode="listen";startRound()`);await sleep(500);E('MV.sfxAt=0;MV.quietUntil=0;MV.holdQuiet=0;MIC.deafUntil=0')};
 await startSc('scn','sc_drink');fire('我要水');await sleep(250);r=rec();
 T('G1 scene accepts different reasonable answers (我要水 matched via answer list)',r.outcome==='correct'&&r.comm.type==='spontaneous');
 await startSc('scn','sc_drink');fire('我好渴要喝一點');await sleep(250);r=rec();T('G2 keyword rule accepts unlisted reasonable wording',r.outcome==='correct'&&r.sp.matchedBy==='core');
 await startSc('scn','sc_drink');fire('我不要水');await sleep(250);T('G3 negated sentence not accepted for a request scene (and not marked wrong)',E('G.lock')===false&&E('G.tries')===0&&nrec()===0);
 await startSc('scn','sc_stop');fire('不要了');await sleep(250);T('G4 refusal scene accepts negation',rec().outcome==='correct');
 // ---- H 溝通類型 ----
 await startSc('scn','sc_rest');fire('我累了');await sleep(250);r=rec();T('H1 no question, no hints → spontaneous initiation; M10 credited',r.comm.type==='spontaneous'&&r.spontaneous===true&&r.indicators.includes('M10')&&r.independent);
 await startSc('scn','sc_rest');E('SE.askQ("button")');fire('我累了');await sleep(250);r=rec();T('H2 answer after system question → responded, not spontaneous, no M10',r.comm.type==='responded'&&r.comm.questionAsked&&!r.spontaneous&&!r.indicators.includes('M10')&&r.independent);
 await startSc('scn','sc_rest');E('SK.give("P2","button")');fire('我累了');await sleep(250);r=rec();T('H3 partial prompt → prompted',r.comm.type==='prompted'&&!r.independent);
 await startSc('scn','sc_rest');E('SK.give("P4v","button")');fire('我累了');await sleep(250);r=rec();T('H4 full model → imitated',r.comm.type==='imitated');
 await startSc('scq','sc_rest');await sleep(1800);fire('我累了');await sleep(250);r=rec();T('H5 scq asks the question first → responded',r.comm.type==='responded'&&r.comm.questionSrc==='start');
 await startSc('scn','sc_open');E('SE.alt("gesture")');await sleep(250);r=rec();T('H6 gesture/card communication recorded honestly (not oral, not independent oral)',r.comm.type==='aac'&&r.comm.altKind==='gesture'&&r.outcome==='correct'&&r.independent===false&&!r.indicators.includes('M4')&&r.oralCorrect===null);
 const st0=E('S.rw.stars');await startSc('scn','sc_open');const s1=E('S.rw.stars');E('SE.help()');await sleep(250);r=rec();T('H7 adult help: need met, no_response (not wrong), star still given, no penalty',r.comm.adultHelped&&r.comm.needMet&&r.outcome==='no_response'&&r.comm.type==='none'&&E('S.rw.stars')>s1);
 await startSc('scn','sc_help');await sleep(200);T('H8 no auto question / answer shown before waiting ends',E('!G.sk.q')&&q('#msg')&&!/幫/.test(q('#word').textContent)&&(q('.spq')?q('.spq').textContent:'')==='');
 // 自然等待：第一次只給溫和 P1，沒有問句；第二次不自動提問（預設）
 E('S.lrn.list[0].ps.sw=2');E('SK.arm()');await sleep(2300);T('H9 after the wait only gentle P1 (no question, no answer)',E('!G.sk.q')&&E('G.sk.used.join()')==='P1');
 await sleep(2300);T('H10 never auto-asks by default; offers adult help / gesture instead',E('!G.sk.q')&&/大人|手勢/.test(q('#msg').textContent));
 // ---- I 語句口說與擴展 ----
 await go('sxs');const se2=E('SE.get(G.cur._se)');fire(se2.chain[0]+'');await sleep(250);r=rec();
 T('I1 short but situation-appropriate expression accepted (shortest level)',r.outcome==='correct'&&r.comm.lvReached===0&&r.sentence.pattern);
 T('I2 sxs initiation is NOT counted as spontaneous communication (naming/picture-describing ≠ initiation)',!r.spontaneous&&!r.indicators.includes('M10'));
 await go('sxe');const sx=E('G.cur'),lvT=sx._lv;T('I3 expansion ladder starts at level 2 (word → two-word)',lvT===1&&E('G.cur.text')===E('SE.get(G.cur._se)').chain[1]);
 fire(E('G.cur.text'));await sleep(250);r=rec();T('I4 reaching target level = expanded, ladder advances',r.comm.expanded===true&&E(`SE.st(G.cur?G.cur._se:"${sx._se}").lvTop`)>=1);
 await go('sxx');fire(E('SE.get(G.cur._se)').chain.slice(-1)[0]);await sleep(250);r=rec();T('I5 free speech task: spontaneous only without any hint, M10 credited, full sentence flagged',r.comm.type==='spontaneous'&&r.spontaneous&&r.comm.fullSentence===true);
 // ---- J 已教／未教、首次新語句 ----
 await go('sxx');const nid=E('G.cur._se'),sn=E(`SE.snap("${nid}")`);fire('不相干的話');await sleep(200);E('SK.mark("none")');
 T('J0 novel sentence before any exposure',sn.novel===true);
 E('SK.mark("correct")');await sleep(250);r=rec();T('J1 first new-sentence result stored once (firstNew)',r.novelSentence===true&&E(`!!SE.st("${nid}").firstNew`)&&E(`SE.st("${nid}").firstNew.recId`)===r.id);
 const fn=E(`SE.st("${nid}").firstNew.recId`);
 reset();E(`SE.stW("${nid}").firstNew={recId:"X"};PH.qq={items:[SE.card(SE.get("${nid}"),"sxx",{_lv:1})],flow:true};PH.m0=S.set.mode;S.set.mode="listen";startRound()`);await sleep(500);E('SK.give("P4v","button")');E('MV.sfxAt=0;MV.quietUntil=0;MV.holdQuiet=0;MIC.deafUntil=0');E('SK.mark("correct")');await sleep(250);
 T('J2 after full demo (P4) the sentence is no longer "untaught"; first-new not overwritten',E(`SE.novel("${nid}")`)===false&&E(`SE.st("${nid}").firstNew.recId`)==='X');
 // ---- K 類化 ----
 reset();E('S.set.p4Gen="variant"');E('SE.avail("sxs",{})');T('K1 variant generalization locked with honest reason when no variant images',E('SE.avail("sxs",{gen:"variant"}).length')===0&&/變化圖片/.test(E('SE.why')));
 const img='data:image/gif;base64,R0lGODlhAQABAAAAACw=';E(`(()=>{const d=SE.all()[0];d.variants=[{id:"V1",img:"${img}",kind:"person",label:"爺爺"}];save()})()`);
 reset();E('S.set.p4Gen="variant"');E('SE.start("sxs",{gen:"variant"})');await sleep(500);E('MV.sfxAt=0;MV.quietUntil=0;MV.holdQuiet=0;MIC.deafUntil=0');
 T('K2 variant picture shown instead of original',E('G.cur._gv&&G.cur._gv.kind')==='person'&&E('G.cur.img')===img);fire(E('G.cur.text'));await sleep(250);r=rec();
 T('K3 record marks in-game generalization (person), variant image id, and says real-life is separate',r.generalization&&r.generalization.inGame&&r.generalization.kinds.includes('person')&&r.qImgId&&/-vV1$/.test(r.qImgId)&&r.generalization.realLife===false);
 reset();E('SE.start("sxx",{gen:"noimg"})');await sleep(500);E('MV.sfxAt=0;MV.quietUntil=0;MV.holdQuiet=0;MIC.deafUntil=0');T('K4 no-original-image oral task shows no picture',E('G.cur._noImg')===1&&!q('#pic')&&!q('.scvis'));fire(E('G.cur.text'));await sleep(250);T('K5 no-original-image task recorded as generalization kind',rec().generalization.kinds.includes('no_original_image'));
 // ---- L 生活觀察 ----
 const before=nrec(),stars=E('S.rw.stars');
 E('OB.open()');const set=(id,v)=>{const e=q('#obq_'+id);if(e)e.value=v};set('txt','要水');set('set','school');set('who','老師');set('pur','request');set('mode','gesture');set('ini','y');set('prm','none');set('obs','導師');set('note','用手指杯子');q('#obq_new').checked=true;E('OB.save("obq")');
 const ob=E('S.ob[S.ob.length-1]');
 T('L1 observation saved with all fields in its own store',ob&&ob.text==='要水'&&ob.setting==='school'&&ob.partner==='老師'&&ob.purpose==='request'&&ob.mode==='gesture'&&ob.initiated==='y'&&ob.prompted==='none'&&ob.observer==='導師'&&ob.newContext===true&&ob.learnerId===E('S.lrn.cur')&&ob.iso);
 T('L2 observation does not touch game records or stars',nrec()===before&&E('S.rw.stars')===stars&&!E('S.recs.some(r=>r.src==="real_life")'));
 const csv=E('OB.csv()');T('L3 observation CSV has the required columns',['個案ID','日期時間','實際說出的詞彙或語句','互動人物','溝通目的','是否主動發起','是否經過提示','溝通方式','觀察者','補充說明'].every(h=>csv.includes(h))&&csv.includes('手勢'));
 E('OB.save("obq")');T('L4 empty utterance allowed (gesture-only)',E('S.ob.length')===2);E('$("#obov").remove()');
 // ---- M 紀錄與 CSV ----
 const csv2=E('RE.csv()');const hdr=csv2.split('\n')[0];T('M1 game CSV has new Phase 04 columns',['溝通類型','被問後回答','非口語溝通方式','大人協助完成','語句目標層級','類化種類(遊戲內)'].every(h=>hdr.includes(h)));
 const rows=E('RE.rows()').length;T('M2 CSV rows = records',csv2.trim().split('\n').length-1>=rows&&rows>0);
 // ---- N 句子拼打（語文）----
 reset();E('SE.start("sxp")');await sleep(400);T('N1 literacy game available when zhuyin exists or honestly locked',E('G.on')||/注音/.test(E('SE.why')));E('leave()');
 // ---- O 個案隔離 ----
 E('S.lrn.list[0].p4={cx:true}');const pid=E('LRN.add("乙").id');E('LRN.switchTo("'+pid+'")');T('O1 p4 settings are per learner',E('SE.p4().cx')===false);E('LRN.switchTo(S.lrn.list[0].id)');T('O2 first learner keeps its setting',E('SE.p4().cx')===true);
 // ---- P 既有功能 ----
 E('SE.p4set("cx",false)');E('MAP.show()');const mp=q('#mid').innerHTML;T('P1 map shows stage 5/6 buttons, none say 尚未開發',/第 5 站/.test(mp)&&/第 6 站/.test(mp)&&!/尚未開發/.test(mp.replace(/ltag no/g,''))||!/🚧/.test(mp));
 T('P2 stage 3/4 buttons unchanged',/短語示範教學|短語示範/.test(mp)&&/排列雙詞短語/.test(mp));
 E('leave()');console.log('PASS',R.P,'FAIL',R.F);process.exit(R.F?1:0)})().catch(e=>{console.log('ERR',e);process.exit(1)});
