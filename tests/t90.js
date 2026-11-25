// 第05階段：七大核心語言能力評量引擎（獨立測試）
// 測試資料全部是合成資料（個案ID "TEST"），在獨立的 jsdom + fake-indexeddb 內執行，不接觸任何正式個案資料。
const {mk,R,T,sleep}=require('./t30h.js');
(async()=>{
 const w=mk();await sleep(600);const E=s=>w.eval(s),q=s=>w.document.querySelector(s);
 w.confirm=()=>true;w.alert=m=>{w.__al=m};
 let n=0,T0=1.7e12;
 const mkR=o=>({sv:1,id:'R'+(++n),learnerId:'TEST',taskId:'S1.pick.word',itemId:'c1',itemKind:'word',itemText:'水',game:'pick',sub:'word',purpose:'assess',outcome:'correct',first:{answer:'a',result:'correct'},final:{answer:'a',result:'correct'},hints:[],independent:true,ts:T0+=60000,ext:{closedBy:'next_question'},...o});
 const HT=['','P1','P2','P3_voice','P4_voice'],hint=l=>({order:1,type:HT[l],level:l});
 const WR={outcome:'wrong',first:{answer:'x',result:'wrong'},final:{answer:'x',result:'wrong'},independent:false};
 const UNC={outcome:'unconfirmed',first:{answer:'?',result:'unconfirmed'},final:{answer:null,result:'unconfirmed'},independent:false};
 const pick=o=>mkR(o),nameR=o=>mkR({taskId:'S2.speak',game:'speak',sub:'obj',...o}),nameH=(l,o)=>nameR({hints:l?[hint(l)]:[],independent:l===0,...o});
 const cmb=o=>mkR({itemKind:'combo',itemId:'cb1',itemText:'喝水',taskId:'S4.cbo',game:'cbo',sub:null,channel:'compose',novelCombo:true,combo:{id:'cb1',parts:[{cid:'c1'},{cid:'c2'}],taughtBefore:false,demoBefore:false,novel:true},...o});
 const scn=(t,o)=>mkR({itemKind:'scene',itemId:'sc_x',itemText:'想休息',taskId:'S6.scn',game:'speak',channel:'oral',spontaneous:t==='spontaneous',comm:{type:t},independent:['spontaneous','responded'].includes(t),...o});
 const calc=(recs,extra)=>{w.__in=JSON.parse(JSON.stringify({recs,cards:[{id:'c1',text:'水'},{id:'c2',text:'喝'}],cx:{},ob:[],fix:{},rules:{},learnerId:'TEST',...(extra||{})}));return JSON.parse(E('JSON.stringify(AS.calc(window.__in),(k,v)=>k==="_E"?undefined:v)'))};
 const rep=(recs,extra)=>calc(recs,extra);
 const rpt=rep;
 const keys=(o,f,p='')=>{let r=[];for(const k in o){const v=o[k];if(f(k))r.push(p+k);if(v&&typeof v==='object')r=r.concat(keys(v,f,p+k+'.'))}return r};

 // ===== A 零題 =====
 let r=rpt([]);
 T('A1 zero records: every main indicator is 尚未評量 (den 0, no NaN, pct null)',[r.c1.main,r.c2.main,r.c3.nonoral.car,r.c3.oral.two,r.c4.main,r.c5.main,r.c7.game.spont].every(m=>m.den===0&&m.status==='none'&&m.pct===null)&&r.c2.rt.status==='none'&&r.meta.nRecs===0);
 T('A2 zero records: display text says 尚未評量, not 0%',E('AS.fmt({status:"none",unc:0})')==='尚未評量'&&!JSON.stringify(r).includes('NaN'));
 T('A3 symbol / tone recognition have no source data → 尚未評量, never invented',r.lit.symbol.status==='none'&&r.lit.tone.status==='none');
 // ===== B 全對／全錯／資料不足 =====
 r=rpt(Array.from({length:10},(_,i)=>pick({itemId:'p'+i})));
 T('B1 all correct: 100% with numerator/denominator 10/10',r.c1.main.pct===100&&r.c1.main.num===10&&r.c1.main.den===10&&r.c1.main.status==='ok'&&r.c1.first.pct===100);
 r=rpt(Array.from({length:10},(_,i)=>pick({itemId:'p'+i,...WR})));
 T('B2 all wrong: 0% (a real 0, not 尚未評量) with 0/10',r.c1.main.pct===0&&r.c1.main.num===0&&r.c1.main.den===10&&r.c1.main.status==='ok');
 r=rpt(Array.from({length:3},(_,i)=>pick({itemId:'p'+i})));
 T('B3 too few valid questions (3 < 5): status 資料不足 and display hides the percentage',r.c1.main.status==='low'&&E(`AS.fmt(${JSON.stringify(r.c1.main)})`).startsWith('資料不足（3／3'));
 // ===== C 提示後成功、分布不重複 =====
 const N12=[...[0,0,0,0,1,1,2,2,3,4].map((l,i)=>nameH(l,{itemId:'n'+i})),nameR({itemId:'w1',...WR}),nameR({itemId:'w2',outcome:'no_response',first:{answer:null,result:'no_response'},final:{answer:null,result:'no_response'},independent:false})];
 r=rpt(N12);const D=r.c5.dist;
 T('C1 naming: 無答案提示 (P0–P2) = 8/12; P0 = 4/12; partial(P3) = 1/12',r.c2.main.num===8&&r.c2.main.den===12&&r.c2.p0.num===4&&r.c2.partial.num===1&&r.c2.partial.den===12);
 T('C2 hint distribution counts each question once: P0 4, P1 2, P2 2, P3 1, P4 1, fail 2 (sum = 12 valid)',D.P0.num===4&&D.P1.num===2&&D.P2.num===2&&D.P3.num===1&&D.P4.num===1&&D.fail.num===2&&D.P0.num+D.P1.num+D.P2.num+D.P3.num+D.P4.num+D.fail.num===12&&D.P0.den===12);
 T('C3 independence primary = P0 only (4/12 = 33.3%); hinted successes are not counted as independent',r.c5.main.num===4&&r.c5.main.pct===33.3);
 T('C4 a question that needed P2 then P4 is classified once by its highest hint (P4)',(()=>{const x=rpt([nameR({itemId:'z',hints:[{type:'P2',level:2},{type:'P4_voice',level:4}],independent:false}),...Array.from({length:5},(_,i)=>nameH(0,{itemId:'q'+i}))]);return x.c5.dist.P4.num===1&&x.c5.dist.P2.num===0})());
 // ===== D 辨識失敗、未確認、跳過、技術異常 =====
 r=rpt([...Array.from({length:5},(_,i)=>nameH(0,{itemId:'a'+i})),...Array.from({length:3},(_,i)=>nameR({itemId:'u'+i,...UNC,sp:{cls:'unrecognized'}}))]);
 T('D1 ASR failure (unconfirmed) is NOT a wrong answer: denominator stays 5, unconfirmed 3 shown',r.c2.main.den===5&&r.c2.main.num===5&&r.c2.main.unc===3&&r.c5.unconfirmed.num===3&&r.c5.unconfirmed.den===8);
 r=rpt([...Array.from({length:5},(_,i)=>pick({itemId:'a'+i})),pick({itemId:'s1',outcome:'skipped'}),pick({itemId:'t1',outcome:'tech_error'})]);
 T('D2 skipped and tech errors are excluded from the denominator and counted separately',r.c1.main.den===5&&r.meta.counts.skip===1&&r.meta.counts.tech===1);
 r=rpt([...Array.from({length:4},(_,i)=>pick({itemId:'a'+i})),pick({itemId:'n1',outcome:'no_response',first:{result:'no_response'},independent:false}),pick({itemId:'n2',outcome:'no_response',independent:false,ext:{closedBy:'leave'}})]);
 T('D3 confirmed no-response counts in the denominator; a question abandoned by leaving is unconfirmed',r.c1.main.den===5&&r.c1.main.num===4&&r.c1.main.unc===1);
 // ===== E 人工確認與人工修正 =====
 r=rpt([...Array.from({length:4},(_,i)=>nameH(0,{itemId:'a'+i})),nameR({itemId:'m1',hints:[],independent:true,manual:{used:true,choices:['ok'],retries:0},sp:{cls:'ok_indep',by:'adult',evidence:'adult'}})]);
 T('E1 teacher-confirmed correct answer is a valid correct answer (not unconfirmed)',r.c2.main.den===5&&r.c2.main.num===5&&r.c2.main.unc===0);
 const orig=nameR({itemId:'fix1',...UNC});const origJson=JSON.stringify(orig);
 E(`S.as=undefined;AS.fixSet(${JSON.stringify(orig)},{outcome:'correct'},'tester','老師當場聽到說對了')`);
 const fixed=JSON.parse(E('JSON.stringify(S.as.fix)'));
 r=rpt([...Array.from({length:4},(_,i)=>nameH(0,{itemId:'a'+i})),orig],{fix:fixed});
 T('E2 manual correction applies as an overlay: unconfirmed → correct, counted 5/5',r.c2.main.den===5&&r.c2.main.num===5&&r.c2.main.unc===0);
 T('E3 the original record is kept unchanged; correction history keeps original value, reason, time',JSON.stringify(orig)===origJson&&fixed[orig.id].length===1&&fixed[orig.id][0].orig.outcome==='unconfirmed'&&fixed[orig.id][0].reason==='老師當場聽到說對了'&&fixed[orig.id][0].set.outcome==='correct'&&fixed[orig.id][0].ts>0);
 E(`AS.fixRevoke("${orig.id}",'tester','撤銷')`);const f2=JSON.parse(E('JSON.stringify(S.as.fix)'));
 r=rpt([...Array.from({length:4},(_,i)=>nameH(0,{itemId:'a'+i})),orig],{fix:f2});
 T('E4 revoking restores the original result but keeps both history entries',r.c2.main.den===4&&r.c2.main.unc===1&&f2[orig.id].length===2&&f2[orig.id][1].revoke===true);
 E(`AS.fixSet(${JSON.stringify(orig)},{exclude:true},'tester','此題受干擾')`);const f3=JSON.parse(E('JSON.stringify(S.as.fix)'));r=rpt([...Array.from({length:5},(_,i)=>nameH(0,{itemId:'a'+i})),orig],{fix:f3});
 T('E5 manually excluded record is dropped from every denominator and counted as 人工排除',r.c2.main.den===5&&r.meta.counts.excl===1);
 T('E6 correction without a valid change is rejected',E(`AS.fixSet({id:"zz",outcome:"correct"},{outcome:"bogus"},"t","r")`)===false);
 E('S.as=undefined');
 // ===== F 教學練習 vs 評量 =====
 r=rpt([...Array.from({length:5},(_,i)=>pick({itemId:'a'+i})),...Array.from({length:6},(_,i)=>pick({itemId:'t'+i,purpose:'teach',...WR})),...Array.from({length:4},(_,i)=>pick({itemId:'u'+i,purpose:'unknown',...WR}))]);
 T('F1 teaching practice and unlabeled records are NOT counted as assessment (den 5, 100%)',r.c1.main.den===5&&r.c1.main.pct===100&&r.meta.counts.teach===6&&r.meta.counts.unk===4);
 r=rpt([...Array.from({length:5},(_,i)=>pick({itemId:'a'+i})),...Array.from({length:5},(_,i)=>pick({itemId:'u'+i,purpose:'unknown',...WR}))],{rules:{unk:'assess'}});
 T('F2 teacher may choose to treat unlabeled records as assessment (den 10, 50%)',r.c1.main.den===10&&r.c1.main.pct===50);
 // ===== G 組合彈性：未教組合首次獨立 =====
 const cb=(id,o)=>cmb({itemId:id,itemText:id,combo:{id,parts:[{cid:'c1'},{cid:'c2'}],taughtBefore:false,demoBefore:false,novel:true},...o});
 const GR=[cb('A'),cb('A'),                                                     // A：首次獨立成功；第二次不再計
  cb('D',{...WR}),                                                            // D：首次失敗，仍在分母
  cb('X1'),cb('X2'),cb('X3'),cb('X4'),                                        // 其他未教組合首次獨立成功
  cb('B',{purpose:'teach',hints:[hint(4)],independent:false}),cb('B'),        // B：先看過完整示範（教學）→ 之後不再算未教
  cb('C',{purpose:'teach'}),cb('C'),                                           // C：第一次接觸在教學練習 → 不計入評量
  cb('E',{combo:{id:'E',parts:[{cid:'c1'},{cid:'c2'}],taughtBefore:false,demoBefore:true,novel:false},novelCombo:false}),   // E：已播放完整示範
  cb('F',{...UNC}),cb('F'),                                                    // F：先未確認，再成功
  mkR({itemKind:'combo',itemId:'G',itemText:'G',taskId:'S4.cbp',game:'spell',channel:'literacy',combo:{id:'G',parts:[{cid:'c1'}]},novelCombo:true,first:{result:'correct'}}),cb('G')];  // G：拼打已看過整句
 r=rpt(GR);const m4=r.c4.main;
 T('G1 first-new independent rate counts each untaught combo once: A,X1–X4,F succeed (6), D fails → 6/7',m4.num===6&&m4.den===7&&m4.status==='ok');
 T('G2 a combo that already had a full demo (P4 hint / demoBefore / typed whole phrase) is no longer untaught',r.c4.main.den===7&&r.c4.taught.den>=3);
 T('G3 first contact during teaching practice (B, C) is reported as excluded (2) and not in the assessment denominator',m4.excludedFirstInPractice===2);
 T('G4 unconfirmed first attempt is shown as unconfirmed for that metric',m4.unc>=1);
 T('G5 engine does not trust the "novel" flag alone: flagged-novel record after a P4 demo is treated as taught',(()=>{const x=rpt([cb('K',{purpose:'teach',hints:[hint(4)],independent:false}),...Array.from({length:5},(_,i)=>cb('K'))]);return x.c4.main.den===0&&x.c4.taught.den===5})());
 T('G6 new-phrase counters: composed vs oral separated',r.c4.newComposeCount.n===6&&r.c4.newOralCount.n===0);
 r=rpt([cb('O1',{game:'speak',channel:'oral',taskId:'S4.cbx'}),cb('O2',{game:'speak',channel:'oral',taskId:'S4.cbx'}),cb('O3',{game:'speak',channel:'oral',taskId:'S4.cbx',...WR})]);
 T('G7 oral new-combo productions counted as 自主產生的新語句 (2) and shown by channel',r.c4.newOralCount.n===2&&r.c4.byChannel.oral.den===3&&r.c4.byChannel.compose.den===0);
 r=rpt([...Array.from({length:3},(_,i)=>cb('V'+i,{combo:{id:'V'+i,parts:[],swap:'v',taughtBefore:true,demoBefore:true,novel:false},novelCombo:false})),...Array.from({length:2},(_,i)=>cb('N'+i,{...WR,combo:{id:'N'+i,parts:[],swap:'o',taughtBefore:true,demoBefore:true,novel:false},novelCombo:false}))]);
 T('G8 verb-swap and noun-swap success rates are separate',r.c4.verbSwap.num===3&&r.c4.verbSwap.den===3&&r.c4.nounSwap.num===0&&r.c4.nounSwap.den===2);
 // ===== H 語意組織：非口語／口語不混合 =====
 r=rpt([...Array.from({length:3},(_,i)=>cb('p'+i)),...Array.from({length:2},(_,i)=>cb('q'+i,{...WR})),...Array.from({length:4},(_,i)=>cb('o'+i,{game:'speak',channel:'oral',taskId:'S4.cbs'})),cb('ow',{game:'speak',channel:'oral',taskId:'S4.cbs',...WR}),...Array.from({length:2},(_,i)=>cb('m'+i,{game:'cbm',taskId:'S3.cbm'}))]);
 T('H1 non-oral car combination (3/5) and oral two-word combination (4/5) are separate indicators',r.c3.nonoral.car.num===3&&r.c3.nonoral.car.den===5&&r.c3.oral.two.num===4&&r.c3.oral.two.den===5);
 T('H2 semantic pairing counted separately (2/2); not part of either primary',r.c3.nonoral.pair.den===2&&r.c3.nonoral.pair.num===2);
 T('H3 no merged non-oral+oral figure exists in the report',!keys(r.c3,k=>/combined|all|merge|mixed/i.test(k)).length&&!!r.c3.oral.orderNote);
 r=rpt(Array.from({length:6},(_,i)=>cb('r'+i,{first:{result:i<4?'correct':'wrong'},independent:i<4,outcome:i<4?'correct':'wrong'})));
 T('H4 order accuracy = first arrangement correct (4/6)',r.c3.nonoral.order.num===4&&r.c3.nonoral.order.den===6);
 const sx=o=>mkR({itemKind:'sentence',itemId:'s'+(++n),itemText:'喝水',taskId:'S5.sxe',game:'speak',channel:'oral',sub:'obj',novelSentence:false,sentence:{id:'s',taughtBefore:true,demoBefore:true,novel:false},comm:{type:'responded',expanded:true,lvSrc:'asr'},...o});
 r=rpt([sx(),sx(),sx({comm:{expanded:false}}),sx({comm:{expanded:null}}),sx({comm:{expanded:true}}),sx({comm:{expanded:true}}),sx({comm:{expanded:null,lvSrc:'adult'}})]);
 T('H5 oral sentence expansion: only level-known questions counted (4/5 known... adult-confirmed shown as unknown)',r.c3.oral.expand.den===5&&r.c3.oral.expand.num===4&&r.c3.oral.expand.unk===2);
 // ===== I 語文延伸獨立 =====
 const ty=(g,ok,o)=>mkR({taskId:g==='key'?'S1.key':g==='spell'?'S1.spell':'S1.listen',game:g,sub:null,outcome:ok?'correct':'wrong',first:{result:ok?'correct':'wrong'},independent:ok,itemId:'t'+(++n),...o});
 const core=[...Array.from({length:6},(_,i)=>pick({itemId:'p'+i})),...N12];const lit=[...Array.from({length:5},()=>ty('key',true)),ty('key',false),...Array.from({length:5},()=>ty('spell',true)),...Array.from({length:5},()=>ty('listen',false,{hints:[{type:'zy_stage',order:1}]}))];
 const a1=JSON.stringify(rpt(core,{}).c1),a2=JSON.stringify(rpt([...core,...lit]).c1);r=rpt([...core,...lit]);
 T('I1 literacy (typing) records never change any of the seven core indicators',a1===a2&&JSON.stringify(rpt(core).c2)===JSON.stringify(rpt([...core,...lit]).c2)&&JSON.stringify(rpt(core).c5)===JSON.stringify(rpt([...core,...lit]).c5));
 T('I2 literacy computed on its own: zhuyin composition 5/6, word spelling 5/5, listening 0/5',r.lit.zy.num===5&&r.lit.zy.den===6&&r.lit.wordSpell.num===5&&r.lit.wordListen.num===0&&r.lit.wordListen.den===5);
 T('I3 zhuyin hint use reported as usage: 5 of 16 typed questions',r.lit.hintUse.withHint===5&&r.lit.hintUse.n===16&&r.lit.hintUse.byType.zy_stage===5);
 T('I4 report has no total / score / combined-ability field anywhere',!keys(r,k=>/^(total|score|overall|composite|sum)$|總分|總和/i.test(k)).length);
 T('I5 stars and reward fields are never used in any indicator',(()=>{const a=rpt([pick({reward:{starsGained:0}}),...Array.from({length:5},(_,i)=>pick({itemId:'z'+i,reward:{starsGained:9}}))]);const b=rpt([pick({reward:{starsGained:99}}),...Array.from({length:5},(_,i)=>pick({itemId:'z'+i,reward:{starsGained:0}}))]);return JSON.stringify(a.c1)===JSON.stringify(b.c1)})());
 // ===== J 延宕提取、反應時間 =====
 const H25=25*3600000,HR=2*3600000,t0=1.7e12+9e9;
 r=rpt([...Array.from({length:3},(_,i)=>nameH(0,{itemId:'d'+i,ts:t0+i*1000})),...Array.from({length:3},(_,i)=>nameH(0,{itemId:'d'+i,ts:t0+H25+i*1000})),...Array.from({length:2},(_,i)=>nameH(0,{itemId:'e'+i,ts:t0+i*1000})),...Array.from({length:2},(_,i)=>nameH(0,{itemId:'e'+i,ts:t0+HR+i*1000}))]);
 T('J1 delayed retrieval counts only repeats ≥24 h after the previous practice (3 delayed; 2-hour repeats excluded)',r.c2.delayed.den===3&&r.c2.delayed.num===3);
 r=rpt([1000,2000,3000,4000,5000].map((x,i)=>nameH(0,{itemId:'r'+i,rtFirstInput:x})));
 T('J2 retrieval time median of independent correct answers = 3000 ms',r.c2.rt.median===3000&&r.c2.rt.n===5&&r.c2.rt.status==='ok');
 r=rpt([nameH(0,{rtFirstInput:900}),nameH(1,{rtFirstInput:100}),nameR({...WR,rtFirstInput:50})]);
 T('J3 median uses only unhinted correct answers; with 1 sample → 資料不足 (value kept, not presented as stable)',r.c2.rt.n===1&&r.c2.rt.status==='low'&&r.c2.rt.median===900);
 // ===== K 提示需求變化（同詞、同題型才比較） =====
 const tw=(it,seq,task)=>seq.map(l=>l==='x'?nameR({itemId:it,taskId:task||'S2.speak',...WR}):nameH(l,{itemId:it,taskId:task||'S2.speak'}));
 r=rpt([...tw('tw',[3,2,0]),...tw('up',[0,2]),...tw('same',[1,1]),...tw('mixed',[3],'S2.speak'),...tw('mixed',[0],'S2.speak.act')]);
 T('K1 hint need change across practices: tw 3→0 down, up 0→2 up, same 1→1 same',r.c5.trend.down===1&&r.c5.trend.up===1&&r.c5.trend.same===1);
 T('K2 same word practised in two different task types is not compared',!r.c5.trend.items.some(x=>x.itemId==='mixed'));
 r=rpt(Array.from({length:6},(_,i)=>nameH(i<4?0:2,{itemId:'rt'+i,kind:'retest',indepRetrieval:i<4,purpose:'teach'})));
 T('K3 post-fading unhinted retest success is counted from system retests (4/6), independent of the teach/assess mark',r.c5.retest.num===4&&r.c5.retest.den===6);
 // ===== L 類化、生活觀察分開 =====
 const ob=(o)=>({id:'O'+(++n),learnerId:'TEST',ts:T0+=1000,text:'',setting:'home',settingNote:'',partner:'媽媽',purpose:'request',initiated:'y',prompted:'none',mode:'oral',newContext:false,src:'real_life',...o});
 const OB=[ob({purpose:'name',text:'這是蘋果',partner:'媽媽'}),ob({purpose:'name',text:'車車',partner:'老師',setting:'school',newContext:true}),ob({purpose:'comment',text:'好大',initiated:'y'}),ob({purpose:'ask',text:'這是什麼',initiated:'u'}),ob({purpose:'refuse',mode:'gesture',initiated:'y',text:''}),ob({purpose:'help',mode:'card',initiated:'n',text:'',partner:''}),ob({purpose:'share',mode:'mixed',text:'看',partner:'同學',setting:'school'})];
 const GEN=(k)=>({inGame:true,realLife:false,kinds:[k]});
 r=rpt([...[1,1,1,1,0].map((x,i)=>pick({itemId:'g'+i,newImage:true,outcome:x?'correct':'wrong',independent:!!x,first:{result:x?'correct':'wrong'}})),...Array.from({length:5},(_,i)=>scn('spontaneous',{generalization:GEN('scene')})),...Array.from({length:5},(_,i)=>scn('spontaneous',{itemKind:'sentence',itemId:'sg'+i,taskId:'S5.sxs',generalization:GEN('different_image'),...(i<2?WR:{})}))],{ob:OB});
 T('L1 new-image comprehension 4/5; new-situation expression 5/5; new-image naming (sentence level) 3/5',r.c6.game.newImgPick.num===4&&r.c6.game.newImgPick.den===5&&r.c6.game.newScene.num===5&&r.c6.game.newImgName.num===3&&r.c6.game.newImgName.den===5);
 T('L2 real-life observations are separate and counts only: object naming 2, new context 1, cross-person & cross-setting lists, no rate fields',r.c6.life.naming===2&&r.c6.life.newContext===1&&r.c6.life.partners.length>=3&&r.c6.life.settings.length===2&&!keys(r.c6.life,k=>/pct|rate|den|num/.test(k)).length&&r.c6.life.src==='real_life');
 T('L3 game generalization never uses life observation data (changing observations leaves game metrics identical)',JSON.stringify(rpt([pick()],{ob:OB}).c6.game)===JSON.stringify(rpt([pick()],{ob:[]}).c6.game));
 // ===== M 溝通主動性 =====
 r=rpt([...['spontaneous','spontaneous','spontaneous','responded','responded','prompted','imitated'].map(t=>scn(t)),scn('aac',{outcome:'correct',independent:false}),scn('none',{outcome:'no_response',first:{result:'no_response'},independent:false}),scn('responded',{itemKind:'sentence',itemId:'s9',taskId:'S5.sxs'})],{ob:OB});const g7=r.c7.game;
 T('M1 spontaneous initiation = 3/9 opportunities; responded 2/9, prompted 1/9, imitated 1/9, gesture/card 1/9, no oral 1/9',g7.spont.num===3&&g7.spont.den===9&&g7.responded.num===2&&g7.prompted.num===1&&g7.imitated.num===1&&g7.aac.num===1&&g7.none.num===1);
 T('M2 naming a picture (sxs) is never counted as an initiation opportunity or initiation',g7.spont.den===9);
 T('M3 life initiation reported as counts only (5 initiated, 1 unsure, 1 no), no success rate',r.c7.life.initiated===5&&!keys(r.c7.life,k=>/pct|rate|den/.test(k)).length&&r.c7.life.note.includes('不換算'));
 T('M4 life observations split by purpose (need, refuse, help, share, comment, ask) and by mode (oral, gesture, card, mixed)',(()=>{const p=r.c7.life.byPurpose,m=r.c7.life.byMode;return p.request===undefined&&p.refuse.n===1&&p.help.n===1&&p.share.n===1&&p.comment.n===1&&p.ask.n===1&&m.oral===4&&m.gesture===1&&m.card===1&&m.mixed===1})());
 T('M5 answering when asked (scq) is reported separately from spontaneous initiation',(()=>{const x=rpt([...Array.from({length:5},()=>scn('responded',{taskId:'S6.scq'}))]);return x.c7.game.answerQ.num===5&&x.c7.game.spont.den===0})());
 // ===== N 版本紀錄 =====
 E('S.as=undefined');const v0=E('AS.ver()');const v1=E('AS.setRules({minN:3},"teacher","測試調整")'),v1b=E('AS.setRules({minN:3},"teacher","相同值")');
 T('N1 rules start at version 1.0.0; changing a threshold creates 1.0.1 with before/after in the log; unchanged values create nothing',v0==='1.0.0'&&v1==='1.0.1'&&v1b===null&&E('S.as.log.length')===2&&E('S.as.log[1].changes.minN.from')===5&&E('S.as.log[1].changes.minN.to')===3);
 r=rpt(Array.from({length:3},(_,i)=>pick({itemId:'p'+i})),{rules:E('AS.rules()')});T('N2 the new threshold changes 資料不足 → ok, and the report meta carries the rule set it used',r.c1.main.status==='ok'&&r.meta.rules.minN===3&&r.meta.spec==='1.0');
 E('AS.setRules({unk:"assess"},"teacher","x")');T('N3 every change appends a version; csv export carries the rules version',E('AS.ver()')==='1.0.2'&&E('AS.csv(AS.calc(window.__in))').includes('1.0.2')&&E('AS.csv(AS.calc(window.__in))').includes('分子')&&E('AS.csv(AS.calc(window.__in))').includes('未確認題數'));
 E('S.as=undefined');
 // ===== O 詞彙學習履歷 =====
 const base=[...Array.from({length:3},(_,i)=>pick({itemId:'c1',ts:t0+i*1000})),pick({itemId:'c1',...WR,ts:t0+4000}),pick({itemId:'c1',purpose:'teach',ts:t0+5000}),...tw('c1',[3,2,0]).map((x,i)=>({...x,ts:t0+10000+i*1000})),cmb({itemId:'cbq',game:'cbm',taskId:'S3.cbm',combo:{id:'cbq',parts:[{cid:'c1'},{cid:'c2'}],taughtBefore:true,demoBefore:true,novel:false},novelCombo:false,ts:t0+20000}),ty('spell',true,{itemId:'c1',ts:t0+30000})];
 w.__in=JSON.parse(JSON.stringify({recs:base,cards:[{id:'c1',text:'水'},{id:'c2',text:'喝'}],cx:{c1:{pos:'名詞'}},ob:[ob({text:'我要喝水',purpose:'request'})],fix:{},rules:{minNWord:3},learnerId:'TEST'}));
 const wp=JSON.parse(E('JSON.stringify(AS.wordProfile(window.__in,"c1"))'));
 T('O1 word profile: comprehension (3/4 assessed + 1 teaching), naming, hint sequence 3→2→0 trending down',wp.comprehension.den===4&&wp.comprehension.num===3&&wp.comprehension.teachN===1&&wp.hintSeq.join()==='3,2,0'&&wp.hintTrend==='down'&&wp.afterHint.n===2);
 T('O2 word profile: pairing, typing, life-use count (text match, flagged for human check), last practice date',wp.pairing.den===1&&wp.typing.den===1&&wp.life.n===1&&wp.life.note.includes('人工確認')&&wp.lastPractice===t0+30000&&wp.pos==='名詞');
 T('O3 word profile has all required sections',['comprehension','naming','afterHint','hintSeq','pairing','phrase','typing','newImage','delayed','life','lastPractice'].every(k=>k in wp));
 // ===== P 進步比較 =====
 const DAY=864e5,now=1.8e12,win=(d,fn)=>Array.from({length:8},(_,i)=>fn(i,now-d*DAY+i*1000));
 const inp0=(recs)=>{w.__in=JSON.parse(JSON.stringify({recs,cards:[],cx:{},ob:[],fix:{},rules:{},learnerId:'TEST'}));return w.__in};
 let recsA=win(20,(i,t)=>pick({itemId:'a'+i,ts:t,...(i<4?WR:{})})),recsB=win(5,(i,t)=>pick({itemId:'b'+i,ts:t}));
 let cmpR=JSON.parse(E(`JSON.stringify(AS.compare(${JSON.stringify(inp0([...recsA,...recsB]))},{from:${now-28*DAY},to:${now-14*DAY}},{from:${now-14*DAY},to:${now}}).map(x=>({k:x.key,c:x.comparable,d:x.delta,r:x.reasons})))`));
 T('P1 comparable windows (same task type & difficulty): improvement is reported as a number (50% → 100% = +50)',cmpR.find(x=>x.k==='c1.main').c===true&&cmpR.find(x=>x.k==='c1.main').d===50);
 recsB=win(5,(i,t)=>pick({itemId:'b'+i,ts:t,taskId:'S1.pick.verb',sub:'verb',itemText:'跑步跳舞'}));
 cmpR=JSON.parse(E(`JSON.stringify(AS.compare(${JSON.stringify(inp0([...recsA,...recsB]))},{from:${now-28*DAY},to:${now-14*DAY}},{from:${now-14*DAY},to:${now}}).map(x=>({k:x.key,c:x.comparable,d:x.delta,r:x.reasons})))`));
 T('P2 different task mix / word length: improvement is NOT claimed, reasons listed',cmpR.find(x=>x.k==='c1.main').c===false&&cmpR.find(x=>x.k==='c1.main').d===null&&cmpR.find(x=>x.k==='c1.main').r.length>=1);
 recsB=win(5,(i,t)=>pick({itemId:'b'+i,ts:t})).slice(0,3);cmpR=JSON.parse(E(`JSON.stringify(AS.compare(${JSON.stringify(inp0([...recsA,...recsB]))},{from:${now-28*DAY},to:${now-14*DAY}},{from:${now-14*DAY},to:${now}}).map(x=>({k:x.key,c:x.comparable,d:x.delta})))`));
 T('P3 a window with too few valid questions is not compared',cmpR.find(x=>x.k==='c1.main').c===false);
 // ===== Q 容錯與隔離 =====
 T('Q1 old / minimal records (missing hints, first, ext, comm) do not break the engine',(()=>{try{const x=rpt([{id:'old1',ts:1,outcome:'correct',itemId:'x',taskId:'S1.pick.word',game:'pick',purpose:'assess'},{id:'old2',ts:2,outcome:'wrong',itemId:'y',game:'speak'},{id:'old3',ts:3}]);return x.meta.nRecs===3}catch(e){return false}})());
 const frozen=E(`(()=>{const deep=o=>{Object.values(o).forEach(v=>v&&typeof v==='object'&&deep(v));return Object.freeze(o)};const inp=deep(JSON.parse(JSON.stringify(${JSON.stringify({recs:[...N12,...GR],cards:[],cx:{},ob:OB,fix:{},rules:{},learnerId:'TEST'})})));try{AS.calc(inp);return true}catch(e){return String(e)}})()`);
 T('Q2 the engine never modifies its input (deep-frozen records and observations pass)',frozen===true);
 E('S.recs=[];S.as=undefined');const snap=E('JSON.stringify(S)');E('AS.run();AS.run({from:1});AS.wordProfile(AS.input(),"x")');
 T('Q3 AS.run is read-only: app state is byte-identical and S.as is not created by computing a report',E('JSON.stringify(S)')===snap&&E('S.as')===undefined);
 E(`S.recs=[{id:'SENTINEL',ts:1,itemId:'real',outcome:'correct',purpose:'assess',taskId:'S1.pick.word',game:'pick',independent:true,learnerId:'REAL'}]`);
 T('Q4 AS.calc on synthetic input ignores whatever is in the live state (test data isolated from real data)',rpt([]).meta.nRecs===0&&rpt([pick()]).meta.nRecs===1);
 E('S.recs=[]');
 // ===== R 教師頁面 =====
 E("sub='as';tch()");let html=q('#sp').innerHTML;
 T('R1 empty page renders: 尚未評量 shown, all seven abilities and the separate 語文延伸 section, no total score',/尚未評量/.test(html)&&['一、語意理解','二、詞彙提取','三、語意組織','四、組合彈性','五、表達獨立性','六、語言類化','七、溝通主動性','八、語文延伸能力'].every(t=>html.includes(t))&&!/總分|綜合分數|總能力/.test(html));
 T('R2 page states the rules: no stars/completion used, no single score, version shown',/不使用星星數或遊戲完成率/.test(html)&&/不把七項能力加總/.test(html)&&/規則版本/.test(html));
 E(`S.recs=${JSON.stringify([...N12.map(x=>({...x,learnerId:E('S.lrn.cur')})),...Array.from({length:5},(_,i)=>pick({itemId:'u'+i,purpose:'unknown',learnerId:E('S.lrn.cur')}))])}`);E("sub='as';tch()");html=q('#sp').innerHTML;
 T('R3 with data: numerator／denominator and 未確認 shown; unlabeled-purpose warning shown',/8／12 題/.test(html)&&/沒有標示「教學題／評量題」/.test(html));
 T('R4 correction panel & rule version panel present; word profile table appears',/人工修正/.test(html)&&/評量規則與版本紀錄/.test(html)&&/詞彙學習履歷/.test(html));
 E('S.recs=[];S.as=undefined');
 // ===== S 真實遊戲紀錄相容（第 5、6 站實際產生的紀錄能被引擎讀取） =====
 const MAPz={棉:'mian2',被:'bei4',我:'wo3',想:'xiang3',喝:'he1',水:'shui3'};w.pinyinPro={pinyin:c=>MAPz[c]||'xx1'};
 const fire=(txt)=>{w.__txt=txt;E('MV.sfxAt=0;MV.quietUntil=0;MV.holdQuiet=0;MIC.deafUntil=0;ASR.skipUntil=0;ASR.lockUntil=0;ASR.base=0;ASR.paused=false;SP.speaking=false;ZQ.busy=false;AM.cur=null');E(`asrRes({resultIndex:0,results:[Object.assign([{transcript:window.__txt}],{isFinal:true})]})`)};
 const reset=()=>{E('leave&&leave();S.recs=[];S.rv={};S.as=undefined;S.set.p4Gen="orig";S.set.seScope="all";S.set.music=false;S.set.lm="oral";S.set.mix=false;S.set.n=3;S.set.anim=false;S.set.ap=false;S.set.sk=true;S.set.rp="assess";S.asrAgreed=1;V2.prepDone=true;S.lrn.list[0].ps={fade:0,sw:10};S.lrn.list[0].p4={}')};
 E('S.cards=[];S.cx={}');E('SE.starter()');
 reset();E('SE.start("sxc",{})');await sleep(500);E(`SEG.pick(${E('G.eg.opts.findIndex(o=>o.ok)')})`);await sleep(250);
 let real=JSON.parse(E('JSON.stringify(AS.run().c3.nonoral.expand)'));
 T('S1 a real station-5 car-choice record is read by the engine (S5.sxc, assessment, first correct → independent 1/1)',real.num===1&&real.den===1&&E('S.recs[0].purpose')==='assess');
 reset();E(`PH.qq={items:[SE.card(SCN.get("sc_rest"),"scn",{})],flow:true};PH.m0=S.set.mode;S.set.mode="listen";startRound()`);await sleep(500);E('MV.sfxAt=0;MV.quietUntil=0;MV.holdQuiet=0;MIC.deafUntil=0');fire('我累了');await sleep(250);
 real=JSON.parse(E('JSON.stringify(AS.run().c7.game.spont)'));
 T('S2 a real spontaneous scene record (no question, no hint) counts as 1/1 initiation',real.num===1&&real.den===1);
 reset();E(`PH.qq={items:[SE.card(SCN.get("sc_rest"),"scn",{})],flow:true};PH.m0=S.set.mode;S.set.mode="listen";startRound()`);await sleep(500);E('SE.askQ("button")');E('MV.sfxAt=0;MV.quietUntil=0;MV.holdQuiet=0;MIC.deafUntil=0');fire('我累了');await sleep(250);
 real=JSON.parse(E('JSON.stringify(AS.run().c7.game)'));
 T('S3 after a question the answer is "responded", not initiation (0/1 initiation, 1/1 responded)',real.spont.num===0&&real.spont.den===1&&real.responded.num===1);
 reset();E('S.set.rp="teach"');E(`PH.qq={items:[SE.card(SCN.get("sc_rest"),"scn",{})],flow:true};PH.m0=S.set.mode;S.set.mode="listen";startRound()`);await sleep(500);E('MV.sfxAt=0;MV.quietUntil=0;MV.holdQuiet=0;MIC.deafUntil=0');fire('我累了');await sleep(250);
 real=JSON.parse(E('JSON.stringify(AS.run().c7.game.spont)'));
 T('S4 the same play marked as 教學題 is excluded from assessment (尚未評量)',real.den===0&&real.status==='none');
 E('S.recs=[]');
 // ===== T 第1–2階段真實紀錄相容（聽詞選圖、看圖說詞） =====
 const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
 const cards=()=>'S.cards=[{id:"a",text:"棉被",zy:"ㄇㄧㄢˊ ㄅㄟˋ",img:"'+PNG+'",audio:"",cats:[],created:1,modified:1},{id:"b",text:"火車",zy:"ㄏㄨㄛˇ ㄔㄜ",img:"'+PNG+'",audio:"",cats:[],created:1,modified:1}];S.cx={a:{pos:"名詞",scene:"家裡"},b:{pos:"名詞",scene:"車站"}};';
 reset();E(cards()+'S.set.mode="pick";S.set.pks="word"');E('startRound()');await sleep(500);E(`PICK.choose(${E('G.pk.ci')})`);await sleep(250);
 let rr=JSON.parse(E('JSON.stringify(AS.run())'));
 T('T1 real pick record (聽詞選圖, first try, no hint) → comprehension 1/1 independent, classified as noun by 詞性',E('S.recs[0].game')==='pick'&&rr.c1.main.num===1&&rr.c1.main.den===1&&rr.c1.noun.den===1);
 reset();E(cards()+'S.set.mode="pick";S.set.pks="word"');E('startRound()');await sleep(500);E(`PICK.choose(${E('G.pk.opts.findIndex(o=>!o.correct)')})`);await sleep(100);E(`PICK.choose(${E('G.pk.ci')})`);await sleep(250);
 rr=JSON.parse(E('JSON.stringify(AS.run())'));
 T('T2 real pick: wrong then right → first-try 0/1, independent 0/1, final correct; a confusion pair is recorded',rr.c1.first.num===0&&rr.c1.first.den===1&&rr.c1.main.num===0&&E('S.recs[0].outcome')==='correct');
 reset();E(cards()+'S.set.mode="speak";S.set.sps="obj"');E('startRound()');await sleep(300);E('SK.mark("correct")');await sleep(250);
 rr=JSON.parse(E('JSON.stringify(AS.run())'));
 T('T3 real naming record (看圖說詞, no hint, adult-confirmed) → naming 1/1, independence P0 1/1, RT field not invented',rr.c2.main.num===1&&rr.c5.dist.P0.num===1&&rr.c5.main.den===1);
 reset();E(cards()+'S.set.mode="speak";S.set.sps="obj"');E('startRound()');await sleep(300);E('SK.give("P4v","button")');E('SK.mark("correct")');await sleep(250);
 rr=JSON.parse(E('JSON.stringify(AS.run())'));
 T('T4 real naming after a full model (P4) → counted as success after P4, NOT as 自主命名 or P0',rr.c2.main.num===0&&rr.c2.main.den===1&&rr.c5.dist.P4.num===1&&rr.c5.main.num===0);
 reset();E(cards()+'S.set.mode="speak";S.set.sps="obj"');E('startRound()');await sleep(300);E('SK.give("P2","button")');E('SK.mark("correct")');await sleep(250);
 rr=JSON.parse(E('JSON.stringify(AS.run())'));
 T('T5 real naming after a semantic hint (P2) → 自主命名 (no answer cue) but not P0 independence',rr.c2.main.num===1&&rr.c5.dist.P2.num===1&&rr.c5.main.num===0);
 E('S.recs=[]');

 console.log(`\nPASS ${R.P}  FAIL ${R.F}`);process.exit(R.F?1:0)})();
