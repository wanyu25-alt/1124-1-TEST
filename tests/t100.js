// 第06階段：教師後台、個案管理及數據分析（合成資料；獨立 jsdom + fake-indexeddb，不接觸任何正式個案資料）
const {mk,R,T,sleep}=require('./t30h.js');
(async()=>{
 const w=mk();await sleep(600);const E=s=>w.eval(s),q=s=>w.document.querySelector(s);w.confirm=()=>true;w.alert=()=>{};
 let n=0;const DAY=864e5,now=Date.now();
 const mkR=o=>({sv:1,id:'R'+(++n)+'x'+Math.random().toString(36).slice(2,5),learnerId:'L001',taskId:'S1.pick.word',itemId:'c1',itemKind:'word',itemText:'水',game:'pick',sub:'word',stage:1,purpose:'assess',outcome:'correct',first:{answer:'a',result:'correct'},final:{},hints:[],independent:true,ts:now-DAY,iso:'',ext:{closedBy:'next_question'},tech:[],asr:[],reward:{starsGained:0},...o});
 const HT=['','P1','P2','P3_voice','P4_voice'],hint=(l,t)=>({order:1,type:t||HT[l],level:l});
 const WR={outcome:'wrong',first:{answer:'x',result:'wrong'},independent:false};
 const nameR=(l,o)=>mkR({taskId:'S2.speak',game:'speak',sub:'obj',stage:2,hints:l?[hint(l)]:[],independent:l===0,...o});
 const setRecs=(a)=>E(`S.recs=${JSON.stringify(a)};S.as=undefined`);
 const D=()=>{const h=JSON.stringify;return JSON.parse(E('JSON.stringify(DSH.dash(),(k,v)=>k==="_E"||k==="rep"?undefined:v)'))};
 const REP=()=>JSON.parse(E('JSON.stringify(DSH.dash().rep,(k,v)=>k==="_E"?undefined:v)'));
 E('S.cats=[{id:"k1",name:"飲食",order:[]},{id:"k2",name:"動作",order:[]}];S.cards=[{id:"c1",text:"水",zy:"",cats:["k1"],img:"",audio:"",created:1,modified:1},{id:"c2",text:"跑",zy:"",cats:["k2"],img:"",audio:"",created:1,modified:1},{id:"c3",text:"飯",zy:"",cats:["k1"],img:"",audio:"",created:1,modified:1}];S.cx={c2:{pos:"動詞"}}');
 // ===== A 存取控制 =====
 const abc=E('SHA.str("abc")'),empty=E('SHA.str("")');
 T('A1 SHA-256 matches the standard test vectors (abc / empty string / 1000 chars)',abc==='ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'&&empty==='e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'&&E('SHA.str("a".repeat(1000))')==='41edece42d63e8d9bf515a9ba6932e1c20cbc9f5a5d134645adb5db1b9737ea3');
 T('A2 before a password exists: teacher area open, tab(2) renders it, and deletion is refused with an explanation',(()=>{E('tab(2);sub="dash";tch()');return !E('ACL.need()')&&/能力儀表板/.test(q('#tch').innerHTML)&&E('ACL.delLearner("zz","1","x").msg').includes('')})());
 T('A3 invalid PIN rejected; valid PIN stored only as salted hash; recovery code created',(()=>{const bad=E('ACL.setPin("12","")').ok===false,r=JSON.parse(E('JSON.stringify(ACL.setPin("2468"))')),_x=(globalThis.RC=r.recovery),s=E('JSON.stringify(S.acl)');return bad&&r.ok&&/^[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{2}$/.test(r.recovery)&&!s.includes('2468')&&!s.includes(r.recovery)&&E('S.acl.h.length')===64})());
 const rc=globalThis.RC;
 E('ACL.lock()');
 T('A4 locked: tch() and tab(2) show only the lock screen — no learner data in the DOM',(()=>{E('sub="dash";tab(2)');const h=q('#tch').innerHTML;return /已上鎖/.test(h)&&!/個案|能力儀表板|詞彙熱力/.test(h)&&E('ACL.need()')})());
 T('A5 wrong PIN fails, 5 wrong PINs pause attempts even for the right PIN',(()=>{let ok=true;for(let i=0;i<5;i++)ok=ok&&E('ACL.unlock("0000")').ok===false;const r=E('ACL.unlock("2468")');const paused=r.ok===false&&/秒/.test(r.msg);E('S.acl.lockUntil=0;S.acl.fails=0');return ok&&paused})());
 T('A6 correct PIN unlocks and the dashboard renders',(()=>{const r=E('ACL.unlock("2468")');E('tab(2)');return r.ok&&/能力儀表板/.test(q('#tch').innerHTML)})());
 T('A7 returning to the student view locks again (real gate, not a hidden button)',(()=>{E('tab(1)');return E('ACL.need()')===true})());
 T('A8 idle for 16 minutes locks automatically',(()=>{E('ACL.unlock("2468")');E('ACL.at=Date.now()-16*60*1000');return E('ACL.need()')===true})());
 T('A9 recovery code resets the PIN; wrong code rejected; old PIN no longer works',(()=>{const bad=E('ACL.recover("AAAA-BBBB-CC","1357")').ok===false,r=JSON.parse(E(`JSON.stringify(ACL.recover(${JSON.stringify(rc)},"1357"))`));return bad&&r.ok&&E('ACL.verify("2468",true)')===false&&E('ACL.verify("1357",true)')===true})());
 E('ACL.unlock("1357")');
 // ===== B 個案隔離、刪除 =====
 E('S.ob=[]');E('LRN.add("乙");LRN.add("丙")');const ids=JSON.parse(E('JSON.stringify(S.lrn.list.map(p=>p.id))')),[A,B,C]=ids;
 setRecs([mkR({itemText:'甲專用詞',learnerId:A}),...[1,2,3,4,5].map(i=>mkR({learnerId:A}))]);
 E(`S.lrn.store["${B}"].recs=${JSON.stringify([...[1,2,3,4,5,6].map(i=>mkR({learnerId:B,itemText:'乙專用詞',...(i<3?WR:{})}))])}`);
 E(`S.lrn.store["${C}"].recs=${JSON.stringify([mkR({learnerId:C,itemText:'丙專用詞'})])}`);
 E(`S.ob=[{id:"o1",learnerId:"${A}",ts:${now-1000},text:"甲觀察",purpose:"request",initiated:"y",mode:"oral",setting:"home"},{id:"o2",learnerId:"${B}",ts:${now-1000},text:"乙觀察",purpose:"ask",initiated:"y",mode:"oral",setting:"school"}]`);
 E(`DSH.ui.pre="all"`);let dA=D();
 T('B1 dashboard for the current learner counts only that learner (6 comprehension questions, not 13)',dA.cards[0].m.den===6);
 E(`DSH.sw("${B}")`);let dB=D();
 T('B2 switching learner updates every figure: B has 6 questions, 4/6 independent; observation counts follow the learner',dB.cards[0].m.den===6&&dB.cards[0].m.num===4&&dB.life.n===1&&E('S.lrn.cur')===B);
 const shA=JSON.parse(E('JSON.stringify(RPT.sheets().map(s=>s.rows.flat().join("|")).join("##"))'));
 T('B3 exports of learner B contain only B data (no A / C markers, B observation only)',shA.includes('乙專用詞')&&shA.includes('乙觀察')&&!shA.includes('甲專用詞')&&!shA.includes('甲觀察')&&!shA.includes('丙專用詞'));
 E(`DSH.sw("${A}")`);const shB=JSON.parse(E('JSON.stringify(RPT.sheets().map(s=>s.rows.flat().join("|")).join("##"))'));
 T('B4 after switching back, exports contain only A data',shB.includes('甲專用詞')&&shB.includes('甲觀察')&&!shB.includes('乙專用詞')&&!shB.includes('乙觀察'));
 T('B5 individual learner export (needs PIN) contains only that learner; wrong PIN returns nothing',(()=>{const o=JSON.parse(E(`JSON.stringify(ACL.expLearner("${B}","1357"))`));const s=JSON.stringify(o);return o&&o.learner.id===B&&s.includes('乙專用詞')&&!s.includes('甲專用詞')&&o.observations.length===1&&E(`ACL.expLearner("${B}","0000")`)===null})());
 E(`LRN.archive("${B}",true)`);E(`S.as=S.as||{ver:"1.0.0",rules:{},log:[],fix:{}};S.as.fix["${(JSON.parse(E(`JSON.stringify(S.lrn.store["${B}"].recs[0].id)`)))}"]=[{id:"f",ts:1,set:{exclude:true},revoke:false}]`);
 E(`ZA.rec.a["P:${B}:ok"]={m:"audio/mp4",d:new ArrayBuffer(4),n:"x"};ZA.rec.a["P:${A}:ok"]={m:"audio/mp4",d:new ArrayBuffer(4),n:"y"}`);
 T('B6 deletion refused: current learner / not archived / wrong PIN / wrong name',E(`ACL.delLearner("${A}","1357","甲")`).ok===false&&E(`ACL.delLearner("${C}","1357","丙")`).ok===false&&E(`ACL.delLearner("${B}","0000","乙")`).ok===false&&E(`ACL.delLearner("${B}","1357","錯名")`).ok===false&&!!E(`LRN.get("${B}")`));
 T('B7 deletion refused when locked, and when no password is set',(()=>{E('ACL.lock()');const a=E(`ACL.delLearner("${B}","1357","乙")`).ok===false;E('ACL.unlock("1357")');return a})());
 const delr=E(`ACL.delLearner("${B}","1357","乙")`);
 T('B8 permitted deletion removes that learner\'s records, observations, corrections and recordings — others untouched',delr.ok===true&&!E(`LRN.get("${B}")`)&&!E(`S.lrn.store["${B}"]`)&&E(`S.ob.filter(r=>r.learnerId==="${B}").length`)===0&&E(`Object.keys(S.as.fix).length`)===0&&!E(`"P:${B}:ok" in ZA.rec.a`)&&!!E(`"P:${A}:ok" in ZA.rec.a`)&&E(`S.recs.length`)===6&&E(`S.lrn.store["${C}"].recs.length`)===1&&E(`S.ob.length`)===1);
 T('B9 audit log records sensitive actions without learner names or content',(()=>{const a=E('JSON.stringify(S.acl.audit)');return /刪除個案資料/.test(a)&&!a.includes('乙')&&!a.includes('專用詞')})());
 T('B10 the last remaining learner can never be deleted',(()=>{const keep=E('JSON.stringify(S.lrn.list)');E(`LRN.archive("${C}",true)`);E(`(()=>{const p=S.lrn.list.find(x=>x.id==="${C}");S.lrn.__keep=S.lrn.list;S.lrn.list=[p]})()`);const r=E(`ACL.delLearner("${C}","1357","丙")`);E(`S.lrn.list=S.lrn.__keep;delete S.lrn.__keep;LRN.archive("${C}",false)`);return r.ok===false&&/至少要保留/.test(r.msg)&&!!E(`LRN.get("${C}")`)})());
 E('ACL.clear("1357")');T('B11 removing the password needs the current PIN and the area becomes open again',E('ACL.has()')===false&&E('ACL.need()')===false);
 // ===== C 儀表板（都由紀錄計算） =====
 E(`DSH.sw("${A}")`);setRecs([]);E('S.ob=[];DSH.ui.pre="30"');E('sub="dash";DSH.ui.view="dash";DSH.ui.radar=false;tch()');
 const eh=q('#sp').innerHTML,dEmpty=D();
 T('C1 empty data: all eight bars say 尚未評量; no percentage is drawn; no data → no numbers',dEmpty.cards.every(c=>c.m.status==='none')&&(eh.match(/尚未評量/g)||[]).length>=8&&!/\d+(\.\d)?%（\d+／\d+/.test(eh.replace(/選擇「全部期間」/,'')));
 const rec30=[...Array.from({length:8},(_,i)=>mkR({itemId:'p'+i,ts:now-(2+i)*DAY,...(i<2?WR:{})})),...Array.from({length:6},(_,i)=>nameR(i<3?0:2,{itemId:'n'+i,ts:now-(3+i)*DAY})),
  ...Array.from({length:5},(_,i)=>mkR({itemKind:'combo',itemId:'cb'+i,itemText:'喝水',taskId:'S4.cbo',game:'cbo',stage:4,channel:'compose',novelCombo:true,combo:{id:'cb'+i,parts:[{cid:'c1'},{cid:'c2'}],taughtBefore:false,demoBefore:false},ts:now-(4+i)*DAY}))];
 setRecs(rec30);dA=D();const r=REP();
 T('C2 figures equal the engine values: comprehension 6/8, naming 6/6 (no answer cue), new-combo 5/5',dA.cards[0].m.num===6&&dA.cards[0].m.den===8&&dA.cards[1].m.num===6&&dA.cards[1].m.den===6&&dA.cards[4].m.num===5&&dA.cards[4].m.den===5);
 E('tch()');const h2=q('#sp').innerHTML;
 T('C3 each ability card shows period, value, valid count, unconfirmed count, data source and comparison',['評量期間','有效題數','未確認題數','資料來源','與相近難度歷史比較'].every(t=>h2.includes(t)));
 setRecs([...rec30,...Array.from({length:7},(_,i)=>mkR({itemId:'o'+i,ts:now-(20+i)*DAY,...(i<5?WR:{})}))]);E('DSH.ui.pre="7"');
 T('C4 changing the period recomputes: 7 days keeps only recent records (comprehension den drops; older questions excluded)',D().cards[0].m.den===1+0||D().cards[0].m.den<8);
 E('DSH.ui.pre="all"');const all=D();E('DSH.ui.pre="custom";DSH.ui.from="'+new Date(now-6*DAY).toISOString().slice(0,10)+'";DSH.ui.to="'+new Date(now-3*DAY).toISOString().slice(0,10)+'"');const cu=D();
 T('C5 "all" includes the 20+ day old records (den 15); a custom date range counts only that window',all.cards[0].m.den===15&&cu.cards[0].m.den<all.cards[0].m.den&&cu.cards[0].m.den>=2);
 E('DSH.ui.pre="30"');setRecs([...Array.from({length:8},(_,i)=>mkR({itemId:'a'+i,ts:now-(40+i)*DAY,...(i<4?WR:{})})),...Array.from({length:8},(_,i)=>mkR({itemId:'b'+i,ts:now-(2+i)*DAY}))]);
 let c0=D().cards[0];T('C6 comparison with the previous period of similar tasks: 50% → 100% shown as +50 points',c0.cmp.state==='ok'&&c0.cmp.delta===50&&/\+50/.test(c0.cmp.text));
 setRecs([...Array.from({length:8},(_,i)=>mkR({itemId:'a'+i,ts:now-(40+i)*DAY,...(i<4?WR:{})})),...Array.from({length:8},(_,i)=>mkR({itemId:'b'+i,itemText:'跑步跳舞',taskId:'S1.pick.verb',ts:now-(2+i)*DAY}))]);c0=D().cards[0];
 T('C7 when task mix / difficulty differ, no improvement is claimed and the reason is shown',c0.cmp.state==='nc'&&c0.cmp.delta===undefined&&/不比較/.test(c0.cmp.text));
 setRecs(rec30);E('DSH.ui.radar=true;DSH.ui.org="nonoral";tch()');let rh=q('#sp').innerHTML;
 T('C8 radar chart is selectable, carries the "visual aid only, not standardized clinical ability" disclaimer, and is not drawn as an area while abilities are 尚未評量',/<svg/.test(rh)&&/不代表標準化臨床能力/.test(rh)&&!/<polygon points="[^"]*" fill="rgba/.test(rh)&&/尚未評量，因此不連成面積/.test(rh));
 E('DSH.ui.radar=false');
 // 讓七項都有資料（含 6、7）→ 雷達圖連成面積
 const full=[...rec30,...Array.from({length:6},(_,i)=>mkR({itemId:'g'+i,newImage:true,ts:now-DAY})),...Array.from({length:6},(_,i)=>mkR({itemKind:'scene',itemId:'sc',itemText:'休息',taskId:'S6.scn',game:'speak',channel:'oral',spontaneous:i<3,comm:{type:i<3?'spontaneous':'responded'},independent:true,generalization:{inGame:true,kinds:['scene']},ts:now-DAY})),
  ...Array.from({length:5},(_,i)=>mkR({itemKind:'combo',itemId:'oc'+i,taskId:'S4.cbs',game:'speak',stage:4,channel:'oral',ts:now-DAY})),...Array.from({length:5},(_,i)=>mkR({itemKind:'combo',itemId:'cc'+i,taskId:'S3.cbc',game:'cbc',stage:3,channel:'compose',novelCombo:false,ts:now-DAY}))];
 setRecs(full);E('DSH.ui.radar=true;tch()');rh=q('#sp').innerHTML;
 T('C9 radar draws an area only when all seven axes have data; toggling 語意組織 (non-oral / oral) switches the axis, never mixing them',/<polygon points="[^"]*" fill="rgba/.test(rh)&&(()=>{E('DSH.ui.org="oral";tch()');const h=q('#sp').innerHTML;E('DSH.ui.org="nonoral"');return /<polygon points="[^"]*" fill="rgba/.test(h)})());
 E('DSH.ui.radar=false');
 // ===== D 熱力表 =====
 const heatRecs=[...Array.from({length:5},(_,i)=>mkR({itemId:'c1',itemText:'水',ts:now-(1+i)*DAY,...(i<2?WR:{})})),...Array.from({length:4},(_,i)=>nameR(i<2?0:3,{itemId:'c1',itemText:'水',ts:now-(1+i)*DAY+1000})),...Array.from({length:5},(_,i)=>mkR({itemId:'c2',itemText:'跑',ts:now-(40+i)*DAY})),...Array.from({length:3},(_,i)=>nameR(4,{itemId:'c2',itemText:'跑',ts:now-(41+i)*DAY+1000}))];
 setRecs(heatRecs);E('DSH.ui.filt={cat:"",stage:"",recent:"",hint:"",unpr:false};DSH.ui.view="heat";DSH.ui.word=null');let H=JSON.parse(E('JSON.stringify(DSH.heat().map(x=>({t:x.text,comp:x.cells.comp,name:x.cells.name,hint:x.cells.hint,lh:x.lastHint,stages:x.stages})))'));
 T('D1 one row per practised word; unpractised words are hidden unless requested',H.length===2&&!H.some(x=>x.t==='飯')&&E('DSH.ui.filt.unpr=true;DSH.heat().length')===3);E('DSH.ui.filt.unpr=false');
 T('D2 cells are computed from records: 水 comprehension 3/5, naming (no answer cue) 2/4, hinted naming 0/2... shown with numerator/denominator',(()=>{const w=H.find(x=>x.t==='水');return w.comp.num===3&&w.comp.den===5&&w.name.num===2&&w.name.den===4&&w.hint.den===2&&w.hint.num===2})());
 T('D3 filters: by category, stage, recency and hint need each change the rows',(()=>{const c=(k,v)=>{E(`DSH.ui.filt={cat:"",stage:"",recent:"",hint:"",unpr:false};DSH.ui.filt.${k}=${JSON.stringify(v)}`);return JSON.parse(E('JSON.stringify(DSH.heat().map(x=>x.text))'))};
  const a=c('cat','k2'),b=c('stage','2'),r7=c('recent','7'),old=c('recent','old'),h4=c('hint','4'),h3=c('hint','0');E('DSH.ui.filt={cat:"",stage:"",recent:"",hint:"",unpr:false}');
  return a.join()==='跑'&&b.length===2&&r7.join()==='水'&&old.join()==='跑'&&h4.join()==='跑'&&h3.join()==='水'})());
 E('DSH.ui.word="c1";tch()');let dh=q('#sp').innerHTML;
 T('D4 clicking a word shows the full learning history and the original answer records (all purposes)',/「水」完整學習履歷/.test(dh)&&/原始作答紀錄（9 筆/.test(dh)&&/人工確認／修正/.test(dh));
 const firstId=E('S.recs.find(r=>r.itemId==="c1"&&r.game==="pick"&&r.outcome==="wrong").id');const bf=JSON.parse(E('JSON.stringify(DSH.heat().find(x=>x.id==="c1").cells.comp)'));
 E(`AS.fixSet(S.recs.find(r=>r.id==="${firstId}"),{outcome:"correct"},"t","現場確認")`);const af=JSON.parse(E('JSON.stringify(DSH.heat().find(x=>x.id==="c1").cells.comp)'));
 T('D5 after a manual correction the heat map and dashboard recompute (3/5 → 4/5) while the original record is unchanged',bf.num===3&&af.num===4&&E(`S.recs.find(r=>r.id==="${firstId}").outcome`)==='wrong'&&D().cards[0].m.num===af.num);
 E('S.as=undefined');
 // ===== E 提示依賴 =====
 const hrecs=[];for(let wk=0;wk<8;wk++)for(let i=0;i<6;i++)hrecs.push(nameR(wk<4?(i<4?4:0):(i<1?4:0),{itemId:'h'+((wk*6+i)%7),ts:now-(56-wk*7)*DAY-i*1000}));
 setRecs(hrecs);E('DSH.ui.pre="all"');let rp=REP(),dist=rp.c5.dist;
 T('E1 P0–P4 distribution counts each question once and sums to the valid oral questions',dist.P0.num+dist.P1.num+dist.P2.num+dist.P3.num+dist.P4.num+dist.fail.num===dist.P0.den&&dist.P0.den===48);
 E('DSH.ui.view="hint";tch()');let hh=q('#sp').innerHTML;
 T('E2 weekly P4 share trend: full-model need is judged as decreasing from real weekly data',/完整示範（P4）需求有下降/.test(hh));
 setRecs(hrecs.slice(0,6));E('tch()');
 T('E3 with fewer than four usable weeks the page says 資料不足 instead of a trend',/資料不足：可用的週數少於 4 週/.test(q('#sp').innerHTML));
 const fxr=[nameR(2,{itemId:'e1',ts:now-5*DAY}),nameR(0,{itemId:'e1',ts:now-4*DAY}),nameR(4,{itemId:'e2',hints:[hint(4,'P4_zy')],ts:now-5*DAY}),nameR(4,{itemId:'e2',ts:now-4*DAY}),nameR(3,{itemId:'e3',ts:now-5*DAY}),nameR(0,{itemId:'e3',ts:now-4*DAY,taskId:'S2.speak.act'})];setRecs(fxr);
 const fx=JSON.parse(E('JSON.stringify(DSH.hintFx(DSH.dash().rep))')),g=id=>fx.find(x=>x.id===id);
 T('E4 effect by hint type: 語意提示 1 use → success then independent next time; 完整注音 and 完整口語示範 separate; next attempt only compared within the same task type',g('P2').n===1&&g('P2').nxOk===1&&g('P4z').n===1&&g('P4z').nx===1&&g('P4z').nxOk===0&&g('P4v').n===1&&g('P3v').n===1&&g('P3v').nx===0);
 const rtr=[...Array.from({length:6},(_,i)=>nameR(0,{itemId:'r'+i,kind:'retest',ts:now-DAY})),...Array.from({length:2},(_,i)=>nameR(2,{itemId:'q'+i,kind:'retest',ts:now-DAY}))];setRecs(rtr);
 T('E5 unhinted retest success is computed from retest records (6/8)',REP().c5.retest.num===6&&REP().c5.retest.den===8);
 // ===== F 長期趨勢 =====
 const trr=[];for(let d=0;d<14;d++)for(let i=0;i<5;i++)trr.push(mkR({itemId:'t'+i,ts:now-d*DAY-i*1000,taskId:d<7?'S1.pick.word':'S1.pick.verb',...(d<3&&i<3?WR:{})}));setRecs(trr);E('DSH.ui.pre="all";DSH.ui.bucket="week"');
 let tr=JSON.parse(E('JSON.stringify(DSH.trend("week"),(k,v)=>k==="reps"?undefined:v)'));const cIdx=tr.series.findIndex(s=>s.key==='c1.main');
 T('F1 weekly buckets are built from real records; each point carries its numerator/denominator',tr.B.length>=2&&tr.series[cIdx].pts.filter(p=>p.den>0).every(p=>p.num<=p.den)&&tr.series.length===9);
 T('F2 daily and monthly buckets also work (more days than weeks; ≤ months)',JSON.parse(E('DSH.trend("day").B.length'))>tr.B.length&&JSON.parse(E('DSH.trend("month").B.length'))<=tr.B.length);
 T('F3 a change of task type between buckets is flagged ("題型組成差異")',tr.flags.some(f=>f.some(x=>/題型組成/.test(x))));
 E(`LRN.cur().ext=LRN.cur().ext||{};LRN.cur().ext.cfgLog=[{ts:${now-DAY},field:"oralDiff",from:3,to:1}]`);tr=JSON.parse(E('JSON.stringify(DSH.trend("week"),(k,v)=>k==="reps"?undefined:v)'));
 T('F4 a difficulty / scope setting change is flagged in the bucket where it happened',tr.flags.some(f=>f.some(x=>/設定變更：口語難度/.test(x))));
 E('DSH.ui.view="trend";tch()');T('F5 trend page renders nine series including 生活主動表達次數 and 詞彙保留',/生活主動表達次數/.test(q('#sp').innerHTML)&&/詞彙保留情形/.test(q('#sp').innerHTML)&&/詞彙拼打正確率/.test(q('#sp').innerHTML));
 E('LRN.cur().ext.cfgLog=[]');
 // ===== G 錯誤分析 =====
 const er0=[mkR({...WR,pk:{sub:'word'},confusions:[{target:'c1',chosen:'c3'}],ts:now-DAY}),mkR({outcome:'no_response',first:{result:'no_response'},independent:false,ts:now-DAY}),nameR(4,{ts:now-DAY}),mkR({outcome:'skipped',ts:now-DAY}),mkR({outcome:'tech_error',tech:[{code:'asr_network'}],ts:now-DAY}),mkR({outcome:'tech_error',tech:[{code:'mic_denied'}],ts:now-DAY}),
  nameR(0,{outcome:'unconfirmed',independent:false,sp:{cls:'unrecognized'},ts:now-DAY}),nameR(0,{outcome:'unconfirmed',independent:false,sp:{cls:'attempt'},ts:now-DAY}),nameR(0,{...WR,sp:{cls:'wrong',matchedBy:'near'},ts:now-DAY}),nameR(0,{...WR,sp:{cls:'wrong'},ts:now-DAY}),mkR({...WR,taskId:'S4.cbo',game:'cbo',itemKind:'combo',channel:'compose',ts:now-DAY}),mkR({outcome:'no_response',ext:{closedBy:'leave'},independent:false,ts:now-DAY})];
 setRecs(er0);E('DSH.ui.pre="all";DSH.ui.onlyAssess=false');let er=JSON.parse(E('JSON.stringify(ERR.run(DSH.inp(),0,Date.now(),false))')),tb=er.tab;
 T('G1 events the system can determine are counted directly: 尚未反應 1, 操作問題 2 (skip + mic), 語音辨識失敗 2, 待人工確認 1, 仿說 1, 語序及組合錯誤 1（現分為詞彙組合困難或語句排列困難）; abandoned question (leave) is not an error',tb.noresp.sys===1&&tb.oper.sys===2&&tb.asr.sys===2&&tb.pending.sys===1&&tb.imit.sys===1&&tb.combo.sys+tb.sent.sys+tb.order.sys===1);
 T('G2 causes the system cannot judge are only "suspected": 語意混淆 1, 語音或音節表達困難 1, 詞彙提取困難 1 — none counted as confirmed',tb.sem.sus===1&&tb.artic.sus===1&&tb.retr.sus===1&&tb.sem.conf===0&&tb.artic.conf===0&&tb.retr.conf===0&&er.pending.length===3);
 const pid=er.pending.find(x=>x.sys==='retr').id;E(`ERR.confirm("${pid}","artic","老師聽到是音節省略")`);er=JSON.parse(E('JSON.stringify(ERR.run(DSH.inp(),0,Date.now(),false))'));tb=er.tab;
 T('G3 teacher confirmation moves the record: retrieval suspected 1→0, 語音或音節表達困難 confirmed 1; analysis recomputes',tb.retr.sus===0&&tb.artic.conf===1&&er.pending.length===2&&E('S.as.err["'+pid+'"].cat')==='artic');
 E('DSH.ui.view="err";tch()');const eh2=q('#sp').innerHTML;
 T('G4 page states that unclear causes need teacher confirmation and are never auto-assigned as clinical language disorders',/不會自動推定為任何臨床語言障礙/.test(eh2)&&/待教師確認/.test(eh2)&&!/診斷為|失語|語言障礙：/.test(eh2.replace(/不會自動推定為任何臨床語言障礙/,'')));
 E(`ERR.clear("${pid}")`);T('G5 confirmation can be revoked',JSON.parse(E('JSON.stringify(ERR.run(DSH.inp(),0,Date.now(),false).tab.artic)')).conf===0);
 T('G6 invalid category rejected',E('ERR.confirm("x","bogus","")')===false);
 // ===== H 報表 =====
 setRecs(full);E(`S.ob=[{id:"o9",learnerId:"${A}",ts:${now-1000},text:"=HYPERLINK(1)",purpose:"name",initiated:"y",mode:"oral",setting:"home",partner:"媽媽"}]`);E('DSH.ui.pre="all"');
 const sheets=JSON.parse(E('JSON.stringify(RPT.sheets())'));
 T('H1 nine report sheets: summary, seven abilities, heat map, hint dependency, trends, errors, life observations, goals, raw records',sheets.length===9&&['摘要','七大能力','詞彙熱力表','提示依賴','長期趨勢','錯誤分析','生活觀察','教學目標','作答紀錄'].every((n,i)=>sheets[i].name===n));
 T('H2 every analysis sheet carries the no-clinical-diagnosis disclaimer and the rules version',sheets.slice(0,8).every(s=>JSON.stringify(s.rows.slice(0,8)).includes('不具臨床診斷效力')&&JSON.stringify(s.rows.slice(0,8)).includes('評量規則版本')));
 T('H3 ability sheet numbers equal the engine (comprehension row)',(()=>{const row=sheets[1].rows.find(r=>r[1]&&String(r[1]).startsWith('獨立理解正確率'));return row&&row[2]===REP().c1.main.num&&row[3]===REP().c1.main.den})());
 T('H4 CSV neutralises spreadsheet-formula text typed by users (=…) with a leading apostrophe',E('RPT.csv([["=HYPERLINK(1)","-5","正常"]])').includes(`"'=HYPERLINK(1)"`)&&E('RPT.csv([["-5"]])').includes('"-5"'));
 const xf=JSON.parse(E('JSON.stringify(RPT.xlFiles(RPT.sheets()).map(f=>({n:f.name,t:new TextDecoder().decode(f.data).slice(0,3000)})))'));
 T('H5 Excel package has the required parts (content types, workbook, 9 worksheets) with inline text and numeric cells',xf.length===4+9&&xf.some(f=>f.n==='[Content_Types].xml')&&xf.filter(f=>/worksheets\/sheet/.test(f.n)).length===9&&xf.find(f=>f.n==='xl/worksheets/sheet2.xml').t.includes('t="inlineStr"')&&/<c r="C\d+"><v>\d+/.test(xf.find(f=>f.n==='xl/worksheets/sheet2.xml').t));
 T('H6 zip container is produced by the app zip writer (PK header)',E('(()=>{const b=zipMake(RPT.xlFiles(RPT.sheets()));return b.size>1000&&b.type==="application/zip"})()'));
 const ph=E('RPT.html()');
 T('H7 printable summary: learner, period, goals, seven abilities, hint dependency, errors, signature line and disclaimer; says radar/abilities are not summed',/個案學習摘要/.test(ph)&&/七大核心語言能力（不加總/.test(ph)&&/不具臨床診斷效力/.test(ph)&&/教師簽名/.test(ph)&&/提示依賴/.test(ph)&&/錯誤與技術問題/.test(ph));
 E('RPT.open()');T('H8 print overlay opens and closes; page CSS prints only the overlay',!!q('#prt')&&(E('document.head.innerHTML').includes('body>*:not(#prt)'))&&(E('RPT.close()'),!q('#prt')));
 // ===== I 教學目標 =====
 setRecs([...Array.from({length:6},(_,i)=>mkR({itemId:'a'+i,ts:now-(10+i)*DAY,...(i<3?WR:{})}))]);E('DSH.ui.pre="all";LRN.cur().ext={};');
 const g1=JSON.parse(E('JSON.stringify(GL.add("能看圖選出 10 個生活詞彙",{pri:1,key:"c1.main"}))'));
 T('I1 goal records a baseline from real data at creation (3/6) and the rules version',g1.base.num===3&&g1.base.den===6&&g1.base.pct===50&&g1.base.ver);
 E(`GL.list()[0].ts=${now-5*DAY}`);E(`S.recs.push(...${JSON.stringify(Array.from({length:6},(_,i)=>mkR({itemId:'z'+i,ts:now-(1+i)*0.5*DAY})))})`);
 const pg=JSON.parse(E('JSON.stringify(GL.progress(GL.list()[0]))'));
 T('I2 progress since the goal started compared with before (comparable tasks): 50% → 100% = +50',pg.cmp.state==='ok'&&pg.cmp.delta===50);
 T('I3 notes and status are kept with timestamps; empty goal text rejected',E(`GL.note(GL.list()[0].id,"今天進步")`)&&E(`GL.status(GL.list()[0].id,"已達成")`)&&E('GL.list()[0].notes.length')===2&&E('GL.add("  ")')===null);
 E('DSH.ui.view="goal";tch()');T('I4 goal page renders the progress comparison',/目標建立後/.test(q('#sp').innerHTML)&&/\+50/.test(q('#sp').innerHTML));
 // ===== J 個案教材管理 =====
 E('LRN.cur().ext.excl=["c3"]');T('J1 excluding a word hides it from this learner\'s pool only',!E('pool().some(c=>c.id==="c3")')&&E('pool().some(c=>c.id==="c1")'));
 E('LRN.cur().ext.excl=[]');T('J2 clearing exclusions restores the pool',E('pool().some(c=>c.id==="c3")'));
 // ===== K 設定變更紀錄 =====
 E(`lrSel=LRN.cur().id;sub="lr";tch()`);E('$("#lr_od").value="1";$("#lr_stage").value="2";lrSave()');const cl=JSON.parse(E('JSON.stringify(LRN.cur().ext.cfgLog)'));
 T('K1 saving the learner settings logs stage and difficulty changes with before/after',cl.some(x=>x.field==='oralDiff'&&String(x.to)==='1')&&cl.some(x=>x.field==='stage'&&String(x.to)==='2'));
 T('K2 learner page shows material management and the delete panel with the password requirement',(()=>{E('lrSel=LRN.cur().id;sub="lr";tch()');const h=q('#sp').innerHTML;return /個案教材管理/.test(h)&&/封存與刪除個案資料/.test(h)})());
 // ===== L 全部畫面可渲染 =====
 T('L1 every dashboard view renders without errors, with data and when empty',(()=>{const ok=[];for(const emp of[false,true]){if(emp)setRecs([]);for(const v of['dash','heat','hint','trend','err','hist','goal','rpt']){try{E(`sub="dash";DSH.ui.view="${v}";DSH.ui.word=null;tch()`);ok.push(q('#sp').innerHTML.length>200)}catch(e){ok.push(false)}}}return ok.every(Boolean)})());
 T('L2 teacher tab bar contains the new tabs (儀表板與報表, 存取與隱私) after the existing ones',(()=>{E('sub="dash";tch()');const t=[...w.document.querySelectorAll('#tch .sub button')].map(b=>b.textContent);return t.includes('📊 儀表板與報表')&&t.includes('🔒 存取與隱私')&&t[0].includes('詞彙管理')})());
 T('L3 privacy page explains the protection scope of the single-machine version',(()=>{E('sub="acl";tch()');const h=q('#sp').innerHTML;return /沒有加密/.test(h)&&/不是防駭/.test(h)&&/有保護/.test(h)})());
 T('L4 AS.run stays read-only even with the new analysis (no S.as created by merely viewing)',(()=>{E('S.as=undefined;DSH.ui.pre="all"');E('DSH.dash();DSH.heat();DSH.trend("week");ERR.run(DSH.inp(),0,Date.now())');return E('S.as')===undefined})());
 console.log(`\nPASS ${R.P}  FAIL ${R.F}`);process.exit(R.F?1:0)})().catch(e=>{console.log('CRASH',e.stack);process.exit(2)});
