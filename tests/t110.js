// 第07階段：初始評量、個別化推薦、每日任務（合成資料；jsdom + fake-indexeddb）
const {mk,R,T,sleep}=require('./t30h.js');
(async()=>{
 const w=mk();await sleep(600);const E=s=>w.eval(s),q=s=>w.document.querySelector(s);w.confirm=()=>true;w.alert=()=>{};w.prompt=()=>'';
 let n=0;const DAY=864e5,now=Date.now();
 const mkR=o=>({sv:1,id:'R'+(++n)+'x'+Math.random().toString(36).slice(2,5),learnerId:'L001',taskId:'S1.pick.word',itemId:'c'+(n%3+1),itemKind:'word',itemText:'水',game:'pick',sub:'word',stage:1,purpose:'assess',outcome:'correct',first:{answer:'a',result:'correct'},final:{},hints:[],independent:true,ts:now-DAY*(1+n%5)-n*1000,iso:'',ext:{closedBy:'next_question'},tech:[],asr:[],reward:{starsGained:0},...o});
 const WR={outcome:'wrong',first:{answer:'x',result:'wrong'},independent:false},HT=['','P1','P2','P3_voice','P4_voice'];
 const pick=(c,t)=>Array.from({length:t},(_,i)=>mkR({itemId:'p'+i,...(i<c?{}:WR)}));
 const speak=(arr)=>arr.map((l,i)=>l==='x'?mkR({taskId:'S2.speak',game:'speak',sub:'obj',stage:2,itemId:'s'+i,...WR}):mkR({taskId:'S2.speak',game:'speak',sub:'obj',stage:2,itemId:'s'+i,hints:l?[{order:1,type:HT[l],level:l}]:[],independent:l===0}));
 const cb=(g,c,t,o)=>Array.from({length:t},(_,i)=>mkR({itemKind:'combo',itemId:g+i,itemText:'喝水',taskId:'S3.'+g,game:g,stage:g==='cbo'?4:3,channel:'compose',novelCombo:false,...(i<c?{}:WR),...(o||{})}));
 const novel=(c,t)=>Array.from({length:t},(_,i)=>mkR({itemKind:'combo',itemId:'nv'+i,itemText:'吃蘋果',taskId:'S4.cbs',game:'speak',stage:4,channel:'oral',novelCombo:true,combo:{id:'nv'+i,parts:[{cid:'c1'},{cid:'c2'}],taughtBefore:false,demoBefore:false},...(i<c?{}:WR)}));
 const spell=(c,t)=>Array.from({length:t},(_,i)=>mkR({taskId:'S1.spell',game:'spell',sub:'word',itemId:'sp'+i,channel:'literacy',...(i<c?{}:WR)}));
 E('S.cats=[{id:"k1",name:"飲食",order:[]}];S.cards=[{id:"c1",text:"水",zy:"",cats:["k1"],img:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",audio:"",created:1,modified:1},{id:"c2",text:"跑",zy:"",cats:["k1"],img:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",audio:"",created:1,modified:1},{id:"c3",text:"飯",zy:"",cats:["k1"],img:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",audio:"",created:1,modified:1}]');
 const set=(recs,ext)=>{E(`S.recs=${JSON.stringify(recs)};S.as=undefined;S.ob=[];LRN.cur().ext=${JSON.stringify(ext||{})};LRN.cur().stage=1`)};
 const cur=()=>JSON.parse(E('JSON.stringify(RC.current().recs.map(r=>r&&{rule:r.rule,name:r.name,why:r.why,ind:r.ind,ev:r.evidence.length}))'));
 const rules=()=>cur().map(r=>r&&r.rule);
 // ===== A 七種個案情境 =====
 set([]);let c=cur();
 T('A1 new learner without data: first = 補充評量 (SUP), no ability is guessed; second = 維持／暖身',c[0].rule==='SUP'&&c[1].rule==='R10'&&/資料還不夠/.test(c[0].why));
 const r1=(set([...pick(3,8)]),rules());T('A2 weak comprehension (3/8): first priority = 詞彙理解 R01',r1[0]==='R01');
 const r2=(set([...pick(8,8),...speak([0,0,4,4,4,4,4,4,4,4])]),cur());
 T('A3 echo-dependent learner (good comprehension, P0 20% but 100% success after full model): first = 提示褪除 R03 — not 自主說詞 even though naming % is low',r2[0].rule==='R03'&&/依賴示範/.test(r2[0].why));
 const r3=(set([...pick(8,8),...speak([0,0,0,0,0,0,0,0]),...cb('cbo',2,10),...cb('cbc',2,8)]),cur());
 T('A4 single words good but combining weak: first = 語意連結與雙詞組合 R04',r3[0].rule==='R04');
 const r4=(set([...pick(8,8),...speak([0,0,0,0,0,0,0,0]),...cb('cbo',10,10),...cb('cbc',8,8),...novel(2,8)]),cur());
 T('A5 fixed phrases good but new combinations weak: first = 詞彙替換與矩陣訓練 R05',r4[0].rule==='R05');
 const r5=(set([...pick(8,8),...speak([0,0,0,0,0,0,0,0,0,0]),...spell(1,8)]),cur());const plan5=JSON.parse(E('JSON.stringify(RC.plan())'));
 T('A6 oral good but zhuyin weak: not labelled oral-weak (no R01/R02/R03), spell/listen automatically skipped with an explanation, oral work remains scheduled',!['R01','R02','R03'].includes(r5[0].rule)&&plan5.items.find(i=>i.id==='lit').state==='na'&&/注音/.test(plan5.items.find(i=>i.id==='lit').note)&&plan5.items.find(i=>i.id==='p1').state!=='na');
 T('A6b …and the literacy items never reduce the oral ability level',E('RC.ab(RC.rep(),RC.xr()).retr.lvl')==='good'&&E('RC.ab(RC.rep(),RC.xr()).zy.v')==='no');
 // 語音辨識失敗但人工確認成功
 const asrRecs=Array.from({length:10},(_,i)=>mkR({taskId:'S2.speak',game:'speak',sub:'obj',stage:2,itemId:'a'+i,outcome:'unconfirmed',independent:false,first:{result:'unconfirmed'},sp:{cls:'unrecognized'}}));
 set([...pick(8,8),...speak([0,0,0,0]),...asrRecs]);const idsA=asrRecs.map(r=>r.id);
 const noFix=cur();E(`${JSON.stringify(idsA.slice(0,8))}.forEach(id=>AS.fixSet(S.recs.find(r=>r.id===id),{outcome:"correct"},"t","老師現場聽到"))`);const withFix=cur();
 T('A7a high ASR failure but not yet confirmed → recommend human confirmation (補充), never lowers difficulty',noFix[0].rule!=='R08'&&noFix.some(r=>r.rule==='SUP'&&/人工確認/.test(r.why)));
 T('A7b high ASR failure and teacher-confirmed correct (8/8) → first = 改善辨識設定 R08, stage/difficulty unchanged',withFix[0].rule==='R08'&&/不調低語言學習難度/.test(withFix[0].why)&&E('LRN.cur().stage')===1&&E('LRN.cur().oralDiff')===3);
 const all=[rules.call(null)];
 T('A8 different learners receive different, reasonable recommendations (R01 / R03 / R04 / R05 / R08 / SUP all distinct)',new Set([r1[0],r2[0].rule,r3[0].rule,r4[0].rule,withFix[0].rule,'SUP']).size===6);
 T('A9 never simply picks the lowest percentage: comprehension 75% + retrieval 20% → still 理解(R01) first with 自主說詞(R02) second; comprehension 90% + retrieval 40% → R02 first',(()=>{set([...pick(6,8),...speak(['x','x','x','x',0,'x','x','x'])]);const a=cur();set([...pick(9,10),...speak([0,'x','x',2,'x','x'])]);const b=cur();return a[0].rule==='R01'&&a[1].rule==='R02'&&b[0].rule==='R02'})());
 // ===== B 推薦內容 / 記錄 =====
 set([...pick(3,8)]);const rc=JSON.parse(E('JSON.stringify(RC.current({log:true}).recs[0])'));
 T('B1 each recommendation carries reason, concrete practice, minutes, parent help, observable indicator with baseline, evidence list, rule id and version',!!rc.why&&!!rc.practice&&rc.minutes>0&&!!rc.parent&&rc.ind&&rc.ind.base.pct===37.5&&rc.evidence.length>=1&&rc.rule==='R01'&&/^1\.0\./.test(rc.ver));
 T('B2 only two main goals are produced',E('RC.current().recs.length')===2);
 T('B3 suggestion is logged once (not duplicated when the page is refreshed)',(()=>{E('RC.current({log:true});RC.current({log:true})');return E('RC.xr().log.filter(l=>l.ev==="suggested"&&l.rank===1&&l.rule==="R01").length')===1})());
 E('RC.accept(1)');T('B4 teacher accept is recorded and keeps the recommendation fixed (status accepted + log)',E('RC.current().recs[0].status')==='accepted'&&E('RC.xr().log.some(l=>l.ev==="accepted"&&l.rule==="R01")'));
 E('RC.modify(1,{rule:"R02",minutes:8,parent:"自訂提醒"})');const md=JSON.parse(E('JSON.stringify(RC.current().recs[0])'));
 T('B5 teacher modify: rule/minutes/parent hint changed, original recorded, status modified',md.rule==='R02'&&md.minutes===8&&md.parent==='自訂提醒'&&md.status==='modified'&&md.orig.rule==='R01');
 E('RC.cancel(1,"今天不練")');const cn=cur();
 T('B6 teacher cancel removes that rule for a while and logs the reason; engine proposes the next candidate',cn[0].rule!=='R02'&&E('RC.xr().log.some(l=>l.ev==="cancelled"&&l.reason==="今天不練")')&&E('Object.keys(RC.xr().cancelled).includes("R02")'));
 E('RC.release(1)');
 set([...pick(8,8),...speak([0,0,0,0,0,0,0,0]),...cb('cbo',10,10),...cb('cbc',8,8),...novel(2,8)]);E('RC.setCfg("need","R07")');
 T('B7 teacher functional need only reorders when its rule is justified by data (R07 not fired → ignored)',cur()[0].rule==='R05');
 set([...pick(8,8),...speak([0,0,0,0,0,0,0,0]),...Array.from({length:8},(_,i)=>mkR({itemKind:'scene',itemId:'sc',taskId:'S6.scn',game:'speak',channel:'oral',spontaneous:false,comm:{type:'responded'},independent:true,generalization:{inGame:true,kinds:['scene']}})),...cb('cbo',10,10),...cb('cbc',8,8),...novel(2,8)]);
 E('RC.setCfg("need","R07")');const nd=rules();E('RC.setCfg("need","")');const nd0=rules();
 T('B8 when both fire, the functional need is placed first only if no foundation rule (R01/R02/R03) blocks it',nd.includes('R07')&&nd0.includes('R05')&&(nd[0]==='R07'||nd[1]==='R07'));
 // ===== C 資料不足 / 教師補充 / 跳過 =====
 set([...pick(2,3)]);T('C1 insufficient data (3 questions) is shown as 資料不足 and leads to supplementary assessment, not a guessed level',cur()[0].rule==='SUP'&&E('RC.ab(RC.rep(),RC.xr()).comp.lvl')==='low');
 E('RC.iaSup("comp","not","老師觀察不會聽詞選圖")');T('C2 teacher supplement is used only when real data is missing, and labelled as 教師補充',E('RC.ab(RC.rep(),RC.xr()).comp.src')==='teacher'&&cur()[0].rule==='R01'&&JSON.stringify(E('RC.current().recs[0].evidence.map(e=>e.src)')).includes('teacher'));
 T('C3 real data overrides teacher supplement once sufficient',(()=>{set([...pick(9,10)],{rc:{ia:{skip:{},sup:{comp:{lvl:'not',ts:1}},started:1}}});return E('RC.ab(RC.rep(),RC.xr()).comp.src')==='data'&&E('RC.ab(RC.rep(),RC.xr()).comp.lvl')==='good'})());
 T('C4 invalid supplement rejected; skip & unskip work',E('RC.iaSup("comp","xx","")')===false&&E('RC.iaSkip("link","");RC.xr().ia.skip.link')&&(E('RC.iaUnskip("link")'),!E('RC.xr().ia.skip.link')));
 set([]);let ia=JSON.parse(E('JSON.stringify(RC.iaNext(RC.rep(),RC.xr()).steps.map(s=>[s.id,s.state]))'));
 T('C5 initial assessment lists the nine required skills in order',ia.map(x=>x[0]).join()==='comp,retr,hint,link,two,novel,sent,newimg,scene'&&ia.every(x=>x[1]==='none'));
 set([...pick(2,8)]);const lim=JSON.parse(E('JSON.stringify(RC.iaNext(RC.rep(),RC.xr()))'));
 T('C6 adaptive: with very weak comprehension, harder steps are not asked for (limited to comp / retr / hint)',lim.limited&&lim.allow.join()==='comp,retr,hint'&&lim.next.id==='retr');
 T('C7 start-stage suggestion: no data → none; strong comprehension + naming → stage 3; teacher can set stage directly and it is logged',(()=>{set([]);const a=E('RC.startStage(RC.rep(),RC.xr()).stage')===null;set([...pick(9,10),...speak([0,0,0,0,0,0,0,0])]);const b=E('RC.startStage(RC.rep(),RC.xr()).stage')===3;E('RC.setStage(4,"老師判斷","manual")');return a&&b&&E('LRN.cur().stage')===4&&E('RC.xr().log.some(l=>l.ev==="stage"&&l.to===4)')&&E('LRN.cur().ext.cfgLog.some(x=>x.field==="stage"&&x.to===4)')})());
 // ===== D 階段進階建議 =====
 const days=(arr,k)=>arr.map((r,i)=>({...r,ts:now-((i%k)+1)*DAY}));
 set([...days(pick(9,10),4)]);let ad=JSON.parse(E('JSON.stringify(RC.adv(1,RC.rep(),RC.xr()))'));
 T('D1 stage 1 criteria: comprehension ≥ 80% and ≥ 3 days met, but retention / new-image data missing → verdict 資料不足 (not ready)',ad.criteria.find(c=>/理解/.test(c.label)).st==='met'&&ad.criteria.find(c=>/跨練習日數/.test(c.label)).st==='met'&&ad.verdict==='insufficient');
 set([...days(pick(4,10),4)]);ad=JSON.parse(E('JSON.stringify(RC.adv(1,RC.rep(),RC.xr()))'));T('D2 comprehension below threshold → 尚未達到',ad.verdict==='not_yet');
 set([...days(pick(9,10),2)]);ad=JSON.parse(E('JSON.stringify(RC.adv(1,RC.rep(),RC.xr()))'));T('D3 observed on only 2 days → days criterion unmet even with high accuracy',ad.criteria.find(c=>/日數/.test(c.label)).st==='unmet');
 T('D4 each stage uses its own indicators (1: comprehension, 2: naming, 4: two-word, 6: spontaneous + life observations)',[1,2,4,6].map(s=>JSON.parse(E(`JSON.stringify(RC.adv(${s},RC.rep(),RC.xr()).criteria.map(c=>c.label))`)).join('|')).every((t,i,a)=>a.indexOf(t)===i)&&/理解/.test(JSON.parse(E('JSON.stringify(RC.adv(1,RC.rep(),RC.xr()).criteria.map(c=>c.label))')).join()));
 T('D5 thresholds adjustable → new rule version + change log; takes effect on verdict',(()=>{const v0=E('RC.ver()');const v=E('RC.setRules({comp:95},"提高門檻")');set([...days(pick(9,10),4)]);const ok=JSON.parse(E('JSON.stringify(RC.adv(1,RC.rep(),RC.xr()).criteria.find(c=>/理解/.test(c.label)))')).st==='unmet'&&v!==v0&&E('S.rc.log.length')===1&&E('RC.ver()')===v;E('RC.setRules({comp:80},"還原")');return ok})());
 T('D6 advance requires teacher action, goes exactly one stage, and is logged; no automatic advance',(()=>{set([...days(pick(9,10),4)]);E('RC.rep()');const still=E('LRN.cur().stage')===1;const bad=E('RC.advance(3,"")')===false;const good=E('RC.advance(2,"確認")')===true;return still&&bad&&good&&E('LRN.cur().stage')===2&&E('RC.xr().log.some(l=>l.ev==="stage"&&l.src==="advance")')})());
 T('D7 words may be in different stages (per-word stage stored, defaults to learner stage)',(()=>{const d=E('RC.wordStage("c1")')===2;E('RC.setWordStage("c1",4)');const e=E('RC.wordStage("c1")')===4&&E('RC.wordStage("c2")')===2;return d&&e&&E('RC.setWordStage("zz",3)')===false})());
 // ===== E 每日任務 =====
 set([...pick(3,8)]);const pl=JSON.parse(E('JSON.stringify(RC.plan())'));
 T('E1 daily plan has the five parts in order; first/second priority follow the recommendations; default 12 minutes',pl.items.map(i=>i.id).join()==='warm,p1,p2,lit,life'&&pl.mins===12&&pl.items[1].rule==='R01'&&['SUP','R10'].includes(pl.items[2].rule));
 T('E2 no zhuyin ability known → spelling/listening item skipped automatically with a reason',pl.items[3].state==='na'&&/注音/.test(pl.items[3].note));
 E('RC.setCfg("zy","yes")');T('E3 teacher marks zhuyin ability → spelling item scheduled',JSON.parse(E('JSON.stringify(RC.plan().items[3])')).state==='todo');
 E('RC.setMins(8)');T('E4 minutes adjustable within 6–20',E('RC.plan().mins')===8&&E('RC.setMins(99)')===20&&E('RC.setMins(1)')===6);E('RC.setMins(12)');
 E('RC.setCfg("zy","auto")');
 E('S.set.n=3');set([...pick(3,8)]);E('RC.plan()');E('LRN.cur().ext.rc.daily=null');const st0=E('S.rw.stars');
 const started=E('RC.start()');T('E5 start launches a real game for the next to-do item (G.on true)',started===true&&E('G.on')===true);
 E('G.on=false');
 // 模擬遊戲產生紀錄（ts 在開始之後）
 const add=k=>E(`for(let i=0;i<${k};i++)S.rv["x"+(++window.__xn||(window.__xn=1))]={exposed:1};RC.sync()`);
 const addRec=k=>E(`S.recs.push(...${JSON.stringify(Array.from({length:k},(_,i)=>mkR({ts:Date.now()+1000+(++n)*5,itemId:'z'+i})))});RC.sync()`);
 add(2);T('E6 warm-up (聽詞認識) progress counts real exposures logged after starting (2/3 → still to-do)',E('RC.plan().items[0].n0')===2&&E('RC.plan().items[0].state')==='todo');
 add(1);T('E7 warm-up completes after 3 exposures (done)',E('RC.plan().items[0].state')==='done'&&E('RC.progress().done')===1);
 E('RC.pause()');T('E8 pause keeps progress (split sessions) and resumes at the next item',E('RC.plan().paused')===true&&E('RC.plan().items[0].state')==='done'&&(E('RC.start()'),E('RC.plan().paused')===false&&E('RC.plan().cur.id')==='p1'));
 addRec(2);T('E8b core item progress is counted from real answer records after launch (2/3)',E('RC.plan().items[1].n0')===2&&E('RC.plan().items[1].state')==='todo');addRec(1);T('E8c core item completes from records; target never exceeds one round (S.set.n=3)',E('RC.plan().items[1].state')==='done');
 E('G.on=false');E('RC.skipItem("p2")');T('E9 parent can skip an item; it is not counted as done',E('RC.plan().items[2].state')==='skipped');
 E('RC.shorten()');T('E10 shorten turns remaining optional items off for today',E('RC.plan().items[3].state')!=='todo');
 // 完成全部 → 獎勵
 E('(()=>{const d=RC.plan();d.items.forEach(i=>{if(i.state==="todo"){i.state="done"}});RC.sync()})()');
 T('E11 completing all required items gives the completion reward exactly once',E('RC.plan().rewarded')===true&&E('S.rw.stars')===st0+12-12+3&&(E('RC.sync();RC.sync()'),E('S.rw.stars')===st0+3));
 T('E12 life task completes when an observation is recorded today',(()=>{E('LRN.cur().ext.rc.daily=null');set([...pick(3,8)]);E('RC.plan()');E(`S.ob=[{id:"o",learnerId:LRN.cur().id,ts:Date.now(),text:"今天自己說要水",purpose:"request",initiated:"y",mode:"oral",setting:"home"}];RC.sync()`);return E('RC.plan().items[4].state')==='done'})());
 T('E13 plan regenerates on a new day',(()=>{E('RC.plan();RC.x().daily.date="2000-01-01"');const d=E('RC.plan().date');return d===E('RC.day()')})());
 // ===== F 家長首頁 =====
 set([...pick(3,8)]);E('LRN.cur().ext.rc=undefined;UI.view="parent";home()');let h=q('#mid').innerHTML;
 T('F1 parent home shows: stage, today first/second priority, start button, estimated minutes, progress, stars, companion reminder, recent progress, life-observation entry',['目前學習階段','第一優先','第二優先','開始今日學習','預計約','今日進度','累計','陪伴提醒','最近進步','記錄生活口語觀察'].every(t=>h.includes(t)));
 T('F2 parent home hides professional detail (no raw percentages table, no rule ids / ability codes)',!/R0\d|c\d\.main|有效題數|分子/.test(h));
 T('F3 parent 自選交通工具 leads to the six-station map and can return',(()=>{E('UI.view="parent";home()');const hasBtn=q('#mid').innerHTML.includes('自選學習站');E('UI.pick(V2.lm())');const c=q('#mid').querySelectorAll('.stc').length===6&&q('#mid').innerHTML.includes('回首頁');E('tab(4)');return hasBtn&&c&&q('#mid').innerHTML.includes('開始今日學習')})());
 T('F4 new learner (no data) sees the initial-assessment entry',(()=>{set([]);E('UI.view="parent";home()');return q('#mid').innerHTML.includes('開始初始評量')})());
 E('RC.iaShow()');h=q('#mid').innerHTML;T('F5 initial assessment screen: nine steps, kid-friendly names, splitting allowed, states "not a diagnosis, zhuyin not required"',/詞彙理解/.test(h)&&/新圖片類化/.test(h)&&/情境口語表達/.test(h)&&/不是診斷/.test(h)&&/分次完成/.test(h)&&/不會因為注音不熟/.test(h));
 T('F6 initial-assessment step launches the right game when material exists',(()=>{E('G.on=false');const ok=E('RC.iaGo("comp")');const on=E('G.on');E('G.on=false');return ok===true&&on===true})());
 // ===== G 教師頁 =====
 set([...pick(3,8)]);E('sub="rc";tab(2);tch()');h=q('#sp').innerHTML;
 T('G1 teacher page: recommendations with reason / practice / time / parent help / indicator / evidence, accept-modify-cancel buttons, initial assessment table, stage advance, thresholds, log, rules',['推薦原因','具體練習內容','預計練習時間','家長協助方法','可觀察的進步指標','使用的評量資料','接受','修改','取消','初始評量','階段進階建議','調整門檻','推薦紀錄','推薦規則說明','直接設定起始階段'].every(t=>h.includes(t)));
 T('G2 page states thresholds are provisional, not clinical norms, and not a diagnosis',/不是經驗證的臨床常模/.test(h)&&/不作為障礙診斷/.test(h)&&/不會因為學生不會注音/.test(h));
 T('G3 teacher tab bar includes the new tab and stays after the earlier ones',(()=>{const t=[...w.document.querySelectorAll('#tch .sub button')].map(b=>b.textContent);return t.includes('🎯 初始評量與推薦')&&t[0].includes('詞彙管理')&&t.length===16&&t.includes('📖 詞彙庫')})());
 T('G4 every view renders with empty data and with data (no exceptions)',(()=>{let ok=true;for(const d of[[],[...pick(8,8),...speak([0,0,0,0,0,0])]]){set(d);try{E('sub="rc";tch();RC.iaShow();RC.ui.classic=false;UI.view="parent";home()')}catch(e){ok=false}}return ok})());
 // ===== H 隔離與唯讀 =====
 T('H1 recommendations are per learner: switching learner gives that learner\'s own result and logs',(()=>{set([...pick(3,8)]);E('RC.current({log:true})');E('LRN.add("乙")');const B=E('S.lrn.list[S.lrn.list.length-1].id');E(`DSH.sw("${B}")`);const rb=E('RC.current().recs[0].rule');const logB=E('RC.xr().log.length'),bHasR01=E('RC.xr().log.some(l=>l.rule==="R01")');E(`DSH.sw("${E('S.lrn.list[0].id')}")`);return rb==='SUP'&&!bHasR01&&logB>=1&&E('RC.xr().log.some(l=>l.rule==="R01")')})());
 T('H2 engine reads only: RC.suggest()/RC.rep() do not create S.as or change records',(()=>{set([...pick(3,8)]);E('S.as=undefined');const before=E('JSON.stringify(S.recs)');E('RC.suggest();RC.rep();RC.adv(1)');return E('S.as')===undefined&&E('JSON.stringify(S.recs)')===before})());
 T('H3 teacher area gate still applies (locked → recommendation page not shown)',(()=>{E('ACL.setPin("2468");ACL.lock();sub="rc";tab(2)');const h2=q('#tch').innerHTML;E('ACL.unlock("2468");ACL.clear("2468")');return /已上鎖/.test(h2)&&!/推薦原因/.test(h2)})());
 console.log(`\nPASS ${R.P}  FAIL ${R.F}`);process.exit(R.F?1:0)})().catch(e=>{console.log('CRASH',e.stack);process.exit(2)});
