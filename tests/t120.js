// 第01–07階段整合測試（合成資料）：初始評量 → 推薦 → 每日任務 → 紀錄 → 儀表板／報表／匯出／存取控制 一條龍
const {mk,R,T,sleep}=require('./t30h.js');
(async()=>{const w=mk();await sleep(600);const E=s=>w.eval(s);w.confirm=()=>true;w.alert=()=>{};w.prompt=()=>'';
 let n=0;const DAY=864e5,now=Date.now(),png="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
 const mkR=(o,L)=>({sv:1,id:'I'+(++n),learnerId:L||'L001',taskId:'S1.pick.word',itemId:'p'+(n%6),itemKind:'word',itemText:'水',game:'pick',sub:'word',stage:1,purpose:'assess',outcome:'correct',first:{result:'correct'},hints:[],independent:true,ts:now-DAY*(n%5)-n*100,tech:[],ext:{closedBy:'next_question'},...o});
 E(`S.cats=[{id:"k",name:"飲食",order:[]}];S.cards=${JSON.stringify(['水','飯','蘋果','牛奶','麵包','餅乾'].map((t,i)=>({id:'c'+i,text:t,zy:'',cats:['k'],img:png,audio:'',created:1,modified:1})))};S.set.n=3`);
 E('ACL.setPin("2468")');E('LRN.add("乙")');const [A,B]=JSON.parse(E('JSON.stringify(S.lrn.list.map(p=>p.id))'));
 T('1 new learner A: no data → initial assessment recommended; parent home offers it',(()=>{E('ACL.lock();tab(0);RC.ui.classic=false;UI.view="parent";home()');return E('RC.current().recs[0].rule')==='SUP'&&E('PAR.sec0.today()').includes('開始初始評量')})());
 // 學生玩遊戲產生紀錄（以紀錄模擬）：A 理解弱
 E(`S.recs=${JSON.stringify(Array.from({length:8},(_,i)=>mkR(i<3?{}:{outcome:'wrong',first:{result:'wrong'},independent:false})))}`);
 T('2 records from play change the recommendation (weak comprehension → R01) and the dashboard shows the same figure',E('RC.current().recs[0].rule')==='R01'&&E('DSH.ui.pre="all";DSH.dash().cards[0].m.pct')===E('RC.ab(RC.rep(),RC.xr()).comp.m.pct'));
 E('RC.accept(1);RC.plan()');T('3 teacher accepts; daily plan follows (first priority = R01)',E('RC.plan().items[1].rule')==='R01');
 E('RC.start("p1")');E('G.on=false');await sleep(60);E(`S.recs.push(...${JSON.stringify(Array.from({length:3},(_,i)=>mkR({ts:Date.now()-30+i*5})))});RC.sync()`);
 T('4 daily task produces learning records that are counted (3/3) and the same records feed the assessment engine (11 comprehension questions)',E('RC.plan().items[1].state')==='done'&&E('DSH.dash().cards[0].m.den')===11);
 const p0=E('RC.current().recs[0].rule');E(`S.recs.filter(r=>r.outcome==="wrong").forEach(r=>AS.fixSet(r,{outcome:"correct"},"t","老師確認"))`);
 T('5 manual confirmation recalculates analysis and the recommendation (all corrected → no longer R01)',p0==='R01'&&E('RC.current().recs[0].rule')!=='R01'&&E('DSH.dash().cards[0].m.pct')===100);
 E(`DSH.sw("${B}")`);T('6 learner B (no records) is isolated: own recommendation, no data of A in dashboard/report/plan',E('RC.current().recs[0].rule')==='SUP'&&E('DSH.dash().cards[0].m.den')===0&&!JSON.stringify(E('RPT.sheets()')).includes('水')&&E('RC.plan().items[1].n0')===0);
 E(`DSH.sw("${A}")`);
 T('7 export of A contains A\'s recommendation log and goals; needs password; B not included',(()=>{E('ACL.unlock("2468")');const o=E(`ACL.expLearner("${A}","2468")`);const s=JSON.stringify(o);return o&&s.includes('"rc"')&&o.learner.id===A&&!s.includes(B)&&E(`ACL.expLearner("${A}","0000")`)===null})());
 T('8 teacher recommendation page is behind the lock; unlocked it renders',(()=>{E('ACL.lock();sub="rc";tab(2)');const l=/已上鎖/.test(w.document.querySelector('#tch').innerHTML);E('ACL.unlock("2468");sub="rc";tab(2)');return l&&/初始評量與個別化推薦/.test(w.document.querySelector('#tch').innerHTML)})());
 T('9 stage setting from the recommendation page flows to the learner map and daily plan',(()=>{E('RC.setStage(2,"整合測試","manual")');const ok=E('LRN.cur().stage')===2&&E('RC.plan().date')===E('RC.day()')&&E('RC.stName(2)').includes('詞彙練習站');return ok})());
 T('10 all six stages present, original game modes still reachable (six-station map; vehicles chosen in setup)',E('STG.length')===6&&(()=>{E('UI.pick("integ")');const ok=w.document.querySelectorAll('.stc').length===6&&w.document.querySelector('.vgrid')==null;E('UI.view="home"');return ok})());
 console.log(`\nPASS ${R.P}  FAIL ${R.F}`);process.exit(R.F?1:0)})().catch(e=>{console.log('CRASH',e.stack);process.exit(2)});
