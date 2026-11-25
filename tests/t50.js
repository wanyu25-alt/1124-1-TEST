// 第02階段測試：聽詞選圖、自主說詞、P0–P4、褪除重測、ASR 分類、間隔複習、整合流程
const {mk,R,T,sleep}=require('./t30h.js');
const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const C=(id,t,zy,x)=>({id,text:t,zy,img:PNG,audio:'',cats:[],created:1,modified:1,...(x||{})});
const CARDS=[C('a','棉被','ㄇㄧㄢˊ ㄅㄟˋ'),C('b','火車','ㄏㄨㄛˇ ㄔㄜ'),C('c','蘋果','ㄆㄧㄥˊ ㄍㄨㄛˇ'),C('d','吃飯','ㄔ ㄈㄢˋ'),C('e','紅色','ㄏㄨㄥˊ ㄙㄜˋ')];
(async()=>{
 let w=mk();await sleep(600);const E=s=>w.eval(s),q=s=>w.document.querySelector(s);w.URL.createObjectURL=()=>'blob:t'+Math.random();
 const setup=(m,o={})=>E(`S.cards=${JSON.stringify(CARDS)};S.cats=[];S.set.src='all';S.set.order='seq';S.set.lm='${o.lm||'quiet'}';S.set.mode='${m}';S.set.mix=false;S.set.n=${o.n||3};S.set.ap=false;S.set.anim=false;S.set.sk=true;S.cx={a:{use:'蓋在身上保暖',scene:'臥室',alts:['被子'],approx:['被被']},b:{pos:'名詞',use:'載很多人到遠方',scene:'車站'},c:{},d:{pos:'動詞'},e:{pos:'形容詞／特徵詞'}};S.recs=[];S.rv={};S.asrAgreed=1;S.lrn.list[0].ps=${JSON.stringify(o.ps||{sw:30})};S.set.sps='${o.sps||'obj'}';S.set.pks='${o.pks||'word'}';`);
 const rec=()=>E('S.recs[S.recs.length-1]');
 // ---------- 選圖 ----------
 setup('pick');E('startRound()');await sleep(200);
 T('pick: 2 options at start, answer not text',E('G.pk.opts.length')===2&&q('#mid').querySelectorAll('.pko').length===2&&!q('#word'));
 T('pick: one correct, random position recorded',E('G.pk.opts.filter(o=>o.correct).length')===1);
 let ci=E('G.pk.ci');E(`PICK.choose(${ci})`);await sleep(100);let r=rec();
 T('pick independent correct: first correct, independent, no hints',r.game==='pick'&&r.first.result==='correct'&&r.independent&&r.hints.length===0&&r.outcome==='correct'&&r.pk.n===2);
 await sleep(1500);
 // wrong then correct, with P1 hint
 ci=E('G.pk.ci');E(`PICK.hint('P1')`);E(`PICK.choose(${1-ci})`);await sleep(50);E(`PICK.choose(${ci})`);await sleep(100);r=rec();
 T('pick hinted + wrong first: not independent, confusion recorded, first=wrong',r.first.result==='wrong'&&!r.independent&&r.outcome==='correct'&&r.hints[0].type==='P1'&&r.confusions.length===1&&r.reward.kind==='hinted');
 T('pick hinted success schedules unhinted retest',r.fadeScheduled===true&&E('G.q.filter(c=>c._rt).length')>=1);
 E('leave()');
 // 4 options
 setup('pick',{ps:{pkN:4,sw:30}});E('startRound()');await sleep(150);T('pick 4 options',E('G.pk.opts.length')===4);E('leave()');
 // sub-types eligibility
 setup('pick');T('verb pick eligible (1 verb card w/ img but needs ≥2 imgs overall)',E('PH.elig("pick","verb").ok')===true);
 E('S.cx={}');T('verb/feat/use/same disabled with message when no material',['verb','feat','use','same'].every(k=>!E(`PH.elig("pick","${k}").ok`)&&E(`PH.elig("pick","${k}").msg`).includes('需要')));
 setup('pick',{pks:'use'});E('startRound()');await sleep(150);T('use-pick: question audio is the use description',E('PICK.item(G.cur).tts')===E('S.cx[G.cur.id].use'));E('leave()');
 // generalization
 setup('pick',{pks:'same'});E('S.cx.a.gimgs=[{id:"IMG-a-g1",img:"'+PNG+'x"}]');E('S.cards=S.cards.filter(c=>c.id!=="b"&&c.id!=="c")');E('startRound()');await sleep(150);
 T('same-word different image: uses generalized image id',E('G.pk.opts.find(o=>o.correct).imgId')==='IMG-a-g1');E(`PICK.choose(${E('G.pk.ci')})`);await sleep(100);T('record flags new image',rec().newImage===true&&rec().pk.sub==='same');E('leave()');
 // ---------- 自主說詞 ----------
 setup('speak');w.__aud.log=[];w.__ttsLog.length=0;E('startRound()');await sleep(250);
 T('speak: initial screen hides answer & zhuyin, no target recording played',q('#word').textContent==='？'&&!q('#mid').textContent.includes('ㄇ')&&!q('#mid').textContent.includes('棉被')&&!(w.__aud.log||[]).some(x=>!/ok\.m4a$/.test(x.src))&&!w.__ttsLog.some(x=>x.t.trim()));
 E('SK.mark("correct")');await sleep(60);r=rec();
 T('speak independent correct (adult confirm)',r.sp.cls==='ok_indep'&&r.independent&&r.outcome==='correct'&&r.hints.length===0&&r.reward.kind==='independent');
 await sleep(1500);
 // P2 hint then correct = prompted
 E('SK.give("P2","button")');E('SK.give("P3z","button")');E('SK.mark("correct")');await sleep(60);r=rec();
 T('speak partial-hint correct: ok_prompted, hint types recorded, not independent',r.sp.cls==='ok_prompted'&&!r.independent&&r.hints.map(h=>h.type).join()==='P2,P3_zy'&&r.maxHint===3&&r.reward.kind==='hinted'&&r.reward.starsGained===1);
 await sleep(1500);
 // full imitation
 E('SK.give("P4v","button")');await sleep(30);E('SK.mark("correct")');await sleep(60);r=rec();
 T('speak full voice demo → imitation: ok_imitated, never independent, P4_voice recorded',r.sp.cls==='ok_imitated'&&!r.independent&&r.hints.some(h=>h.type==='P4_voice')&&r.maxHint===4);
 E('leave()');
 // zhuyin full vs voice full separate
 setup('speak');E('startRound()');await sleep(200);E('SK.give("P4z","button")');E('SK.mark("correct")');await sleep(60);r=rec();
 T('full zhuyin recorded as P4_zy (separate from P4_voice)',r.hints.length===1&&r.hints[0].type==='P4_zy'&&r.sp.cls==='ok_prompted');E('leave()');
 // no response
 setup('speak',{n:1});E('startRound()');await sleep(200);E('SK.mark("none")');await sleep(30);E('hSkip()');await sleep(100);
 T('no response → recorded as skipped w/o stars loss, class none',E('S.recs.some(r=>r.game==="speak")')&&rec().outcome==='skipped'&&rec().reward.starsGained===0);E('leave()');
 setup('speak',{n:2});E('startRound()');await sleep(200);let st0=E('S.rw.stars');E('SK.mark("none")');E('SK.mark("wrong")');
 T('adult marks no-response & wrong: no stars deducted',E('S.rw.stars')===st0);
 E('leave()');r=rec();T('abandoned item: outcome wrong/no_response not correct, sp cls recorded',['wrong','no_response'].includes(r.outcome)&&r.sp&&['wrong','none'].includes(r.sp.cls)&&r.independent===false);
 // recognition failure
 setup('speak');E('startRound()');await sleep(200);E('SK.heardNo("啊")');E('SK.heardNo("")');
 E('leave()');r=rec();T('recognition failure: class unrecognized (unconfirmed), not wrong, adult prompt shown',r.sp.cls==='unrecognized'&&r.outcome==='unconfirmed'&&r.sp.evs.length===2);
 // recognition then adult confirm
 setup('speak');E('startRound()');await sleep(200);E('SK.heardNo("x")');T('adult buttons highlighted after failure',q('#spadult').classList.contains('att'));E('SK.mark("correct")');await sleep(60);r=rec();
 T('system could not recognize → adult confirms correct: ok_indep, evidence=adult',r.sp.cls==='ok_indep'&&r.sp.evidence==='adult'&&r.sp.evs[0].cls==='unrecognized');E('leave()');
 // attempt
 setup('speak');E('startRound()');await sleep(200);E('SK.mark("attempt")');await sleep(60);r=rec();
 T('meaningful attempt: outcome unconfirmed (not correct), still earns participation star, retest scheduled',r.sp.cls==='attempt'&&r.outcome==='unconfirmed'&&r.reward.starsGained===1&&r.reward.kind==='participation'&&r.fadeScheduled===true);E('leave()');
 // ASR path with synonym / approx
 setup('speak');E('startRound()');await sleep(200);
 const fire=(txt)=>{w.__txt=txt;E('MV.sfxAt=0;MV.quietUntil=0;MV.holdQuiet=0;MIC.deafUntil=0;ASR.skipUntil=0;ASR.lockUntil=0;ASR.base=0;ASR.paused=false;SP.speaking=false;ZQ.busy=false;AM.cur=null');E('asrRes({resultIndex:0,results:[Object.assign([{transcript:window.__txt}],{isFinal:true})]})')};
 fire('嗯哼');await sleep(50);T('ASR miss → logged as unrecognized event, not wrong',E('G.sk.evs.some(e=>e.cls==="unrecognized")')&&E('G.lock')===false);
 fire('被子');await sleep(80);r=rec();T('teacher-set synonym 被子 accepted by ASR',r.sp&&r.sp.matchedBy==='alt'&&r.outcome==='correct'&&r.sp.evidence==='asr_only');E('leave()');
 await sleep(1500);
 setup('speak');E('startRound()');await sleep(200);fire('被被');await sleep(80);r=rec();T('approximation 被被 accepted, clarity noted as approx',r.sp.matchedBy==='approx'&&r.clarity==='approx_accepted'&&r.contentCorrect===true);E('leave()');
 setup('speak');E('startRound()');await sleep(200);E('SK.clar("unclear")');E('SK.mark("correct")');await sleep(60);r=rec();T('clarity recorded separately from content correctness',r.clarity==='unclear'&&r.contentCorrect===true&&r.outcome==='correct');E('leave()');
 // system audio not counted
 setup('speak');E('startRound()');await sleep(200);E('w=1');w.__txt='棉被';E('SP.speaking=true;ASR.skipUntil=0;ASR.lockUntil=0');E('asrRes({resultIndex:0,results:[Object.assign([{transcript:window.__txt}],{isFinal:true})]})');
 T('ASR result during system speech ignored',E('G.lock')===false&&E('G.sk.evs.length')===0);E('SP.speaking=false;ZQ.busy=true');E('asrRes({resultIndex:0,results:[Object.assign([{transcript:window.__txt}],{isFinal:true})]})');T('ASR result during hint playback ignored',E('G.lock')===false);E('ZQ.busy=false;leave()');
 // auto hint timeout
 setup('speak',{ps:{sw:3,auto:'P2'}});E('S.cx.a.use="用來蓋的"');E('startRound()');await sleep(200);E('G.sk.t&&clearTimeout(G.sk.t);SK.arm()');await sleep(6900);
 T('wait time elapsed → auto hints P1 then P2, capped at P2 (never P3/P4)',E('RE.cur.hints.map(h=>h.type).join()')==='P1,P2');E('leave()');
 // zyAb false
 setup('speak',{ps:{sw:30,zyAb:false}});E('startRound()');await sleep(150);T('no-zhuyin learner: zhuyin hints removed from order and buttons',!E('SK.order("speak")').some(x=>/z$/.test(x))&&!q('#bot').textContent.includes('P4 完整注音'));E('leave()');
 // hint reorder
 setup('speak',{ps:{sw:30,hints:['P4v','P1','P2','P3v','P3z','P4z']}});E('startRound()');await sleep(150);T('teacher hint order respected',E('SK.nextId()')==='P4v');E('leave()');
 // ---------- 褪除重測 ----------
 setup('speak',{n:3});E('S.lrn.list[0].ps.fg=1');E('startRound()');await sleep(200);const w0=E('G.cur.id');E('SK.give("P4v","button")');E('SK.mark("correct")');await sleep(60);
 T('hinted success inserts retest few items later',E('G.q[G.i+2]&&G.q[G.i+2]._rt&&G.q[G.i+2].id')===w0&&E('G.n')===4);
 T('positive feedback after hinted success',q('#msg').textContent.includes('等一下'));
 await sleep(1500);E('SK.mark("correct")');await sleep(1500);
 T('retest item is a fresh unhinted presentation',E('G.cur._rt&&G.cur.id')===w0&&E('RE.cur.hints.length')===0);E('SK.mark("correct")');await sleep(80);r=rec();
 T('retest independent retrieval recorded',r.kind==='retest'&&r.indepRetrieval===true&&r.retestOf&&r.independent===true);
 T('rv fade counters',E('S.rv[G.cur?G.cur.id:"a"]')!==undefined&&E('S.recs.filter(r=>r.kind==="retest").length')===1);E('leave()');
 // imitation immediate not counted in retest
 setup('speak',{n:2});E('S.lrn.list[0].ps.fg=1');E('startRound()');await sleep(200);E('SK.give("P4v","button")');E('SK.mark("correct")');await sleep(1500);
 E('SK.mark("correct")');await sleep(1500);E('SK.give("P4v","button")');E('SK.mark("correct")');await sleep(80);r=rec();
 T('retest needing full demo again → indepRetrieval=false (imitation never independent)',r.kind==='retest'&&r.indepRetrieval===false&&r.sp.cls==='ok_imitated');E('leave()');
 // ---------- 間隔複習 ----------
 setup('speak',{n:1});E('S.lrn.list[0].ps.fg=1');E('startRound()');await sleep(200);E('SK.give("P4v","button")');E('SK.mark("correct")');await sleep(80);
 const id=E('S.recs[S.recs.length-1].itemId');T('review state created: due today, reason demo_dependent',E(`S.rv["${id}"].sr.reasons.includes("demo_dependent")`)&&E(`REV.due().some(d=>d.id==="${id}")`));
 E('leave()');
 E('S.rv.b={teach:0,assess:0,ok:0,last:0,sr:{base:REV.day(Date.now()),step:0,due:REV.day(Date.now()),reasons:["unstable_understanding"],hist:[]}}');
 T('review priority order: demo-dependent before unstable understanding?',E('REV.due()[0].pri')>=E('REV.due()[REV.due().length-1].pri'));
 T('default offsets 0,1,3,7,14',E('REV.offs().join()')==='0,1,3,7,14');
 E('S.set.rvi="0,2"');T('review offsets adjustable',E('REV.offs().join()')==='0,2');E('S.set.rvi=null');
 // advance after success (simulate)
 E(`S.rv.b.sr.step=0;REV.upd({game:"speak",outcome:"correct",independent:true,first:{result:"correct"},hints:[],itemId:"b",ts:Date.now(),id:"x",kind:"normal"})`);
 T('independent success on due word advances schedule to next day',E('S.rv.b.sr.step')===1&&E('S.rv.b.sr.due')===E('REV.day(Date.now())')+864e5);
 E(`REV.upd({game:"pick",outcome:"correct",independent:false,first:{result:"wrong"},hints:[],itemId:"b",ts:Date.now(),id:"y",kind:"normal",pk:{sub:"same"}})`);
 T('failure resets to same-day, adds generalization reason',E('S.rv.b.sr.step')===0&&E('S.rv.b.sr.reasons.includes("generalization")'));
 setup('pick');/* 第04階段：到期日改由詞彙履歷（作答紀錄）推算；昨天獨立答對 → 今天到期 */E('S.recs.push({id:"z1",learnerId:LRN.id(),itemId:"a",itemKind:"word",game:"pick",outcome:"correct",independent:true,hints:[],first:{result:"correct"},ts:Date.now()-864e5,session:{id:"s1"},pk:{sub:"word",n:3},ext:{}});VP._k=null');E('PH.startReview()');await sleep(200);
 T('review round starts with due words',E('G.flow')===true&&E('G.cur.id')==='a'&&E('G.cur._rt.from')==='review');E('leave()');
 // ---------- 整合流程 ----------
 setup('listen',{lm:'integ',n:3,ps:{sw:30,fw:2,fg:1}});E('PH.startFlow()');await sleep(250);
 const seq=[];for(let i=0;i<14&&E('G.on');i++){seq.push(E('G.cur&&G.cur._step'));const m=E('S.set.mode');
  if(m==='expose')E('EXP.done()');else if(m==='pick')E(`PICK.choose(${E('G.pk.ci')})`);else if(m==='speak')E('SK.mark("correct")');else break;await sleep(1500)}
 T('integrated flow order: expose → pick → speak → spell → ...',seq.slice(0,4).join()==='expose,pick,speak,spell');
 T('expose step creates no scored record; pick+speak do',E('S.recs.every(r=>r.game!=="expose")')&&E('S.recs.some(r=>r.game==="pick")')&&E('S.recs.some(r=>r.game==="speak")'));
 E('leave()');
 setup('listen',{lm:'oral',ps:{sw:30,fw:1}});T('oral mode flow never includes spell/listen',!E('FLOW.steps()').includes('spell')&&!E('FLOW.steps()').includes('listen'));
 // flow step toggles
 setup('listen',{ps:{fw:1,flow:{spell:0,listen:0}}});T('flow steps individually optional',E('FLOW.steps().join()')==='expose,pick,speak');
 // ---------- 既有打字功能 ----------
 setup('key');E('startRound()');await sleep(200);E('G.repDone=1');for(const k of ['ㄇ','ㄧ','ㄢ','ˊ','ㄅ','ㄟ','ˋ']){E(`kPress("${k}")`);await sleep(20)}await sleep(150);
 T('existing zhuyin typing still completes a word',rec().game==='key'&&rec().outcome==='correct');E('leave()');
 setup('listen');E('startRound()');await sleep(200);E('G.repDone=1');for(const k of ['ㄇ','ㄧ','ㄢ','ˊ','ㄅ','ㄟ','ˋ']){E(`kPress("${k}")`);await sleep(20)}await sleep(150);
 T('existing listen-typing still completes a word',rec().game==='listen'&&rec().outcome==='correct');E('leave()');
 // CSV and report
 const csv=E('RE.csv()');T('CSV has new columns',csv.includes('口語分類')&&csv.includes('重測獨立提取')&&csv.includes('星星類型'));
 E("sub='lr';lrSel=S.lrn.cur;tab(2)");T('teacher panel & report render',(q('#sp').textContent||'').includes('第 02 階段設定')&&q('#sp').textContent.includes('第 02 階段學習報告'));
 E('MAP.show()');T('map shows pick sub-type buttons',q('#mid').textContent.includes('聽詞選圖')&&q('#mid').textContent.includes('今日複習'));
 console.log('PASS',R.P,'FAIL',R.F);process.exit(R.F?1:0);
})();
