// 第03階段測試：詞彙組合、車廂遊戲、替換、矩陣、已教／未教、三條管道分開記錄
const {mk,R,T,sleep}=require('./t30h.js');
const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
(async()=>{
 let w=mk();await sleep(600);const E=s=>w.eval(s),q=s=>w.document.querySelector(s);w.URL.createObjectURL=()=>'blob:t'+Math.random();
 E('S.cards=[];S.cats=[];S.set.n=5;S.set.ap=false;S.set.anim=false;S.set.sk=true;S.set.lm="quiet";S.asrAgreed=1;S.set.src="all";S.lrn.list[0].ps={sw:60,fade:0}');
 E('CB.starter()');
 const id=t=>E(`S.cards.find(c=>c.text==="${t}").id`),cbOf=t=>E(`CB.all().find(c=>CB.text(c)==="${t}").id`);
 ['吃','拿','要','蘋果','香蕉','麵包','水','飯','鞋','玩具'].forEach(t=>E(`S.cards.find(c=>c.text==="${t}").img="${PNG}"`));
 const run=async(cb,step,x)=>{E(`PH.qq={items:[CB.item(CB.get("${cb}"),"${step}",${JSON.stringify(x||{})})],flow:true};S.set.mode="listen";startRound()`);await sleep(250)};
 const rec=()=>E('S.recs[S.recs.length-1]');
 const nrec=()=>E('S.recs.length');
 // ---- 資料 ----
 T('starter: 22+9 combos, 1 matrix, part cards hidden from normal pool',E('CB.all().length')>=31&&E('S.mx.length')===1&&E('S.cards.filter(c=>c.part).length')>=30&&E('pool().filter(c=>c.part).length')===0);
 T('9 relations defined',E('REL.length')===9);
 T('valid combos judged by table: 吃飯 yes; 喝飯 no; reversed 飯吃 no; arbitrary no',E(`CB.valid([${JSON.stringify(id('吃'))},${JSON.stringify(id('飯'))}])`)&&!E(`CB.valid(["${id('喝')}","${id('飯')}"])`)&&!E(`CB.valid(["${id('飯')}","${id('吃')}"])`)&&!E(`CB.valid(["${id('水')}","${id('球')}"])`));
 // ---- 排列 ----
 const cb1=cbOf('吃飯');
 await run(cb1,'cbo');T('cbo: 2 slots, pool shuffled, no phrase audio before answer',E('G.cg.slots.length')===2&&E('G.cg.pool.length')===2&&!q('#word'));
 // wrong order first
 const wrongK=E('G.cg.pool.findIndex(p=>p.i===1)');E(`CBG.put(${wrongK})`);E(`CBG.put(${E('G.cg.pool.findIndex(p=>p&&p.i===0)')})`);await sleep(100);
 T('cbo: reversed order judged wrong (not any arrangement)',E('G.cg.ch.length')===1&&E('G.cg.ch[0].ok')===false&&E('G.lock')===false);
 await sleep(1100);
 E(`CBG.put(${E('G.cg.pool.findIndex(p=>p&&p.i===0)')})`);E(`CBG.put(${E('G.cg.pool.findIndex(p=>p&&p.i===1)')})`);await sleep(120);let r=rec();
 T('cbo record: channel compose, first=wrong, tries=1, not independent, compCorrect true, oralCorrect null',r.channel==='compose'&&r.game==='cbo'&&r.first.result==='wrong'&&r.tries===1&&!r.independent&&r.compCorrect===true&&r.oralCorrect===null&&r.itemKind==='combo'&&r.itemId===cb1);
 T('record carries combo info: relation, parts with roles, taughtBefore false, novel true',r.combo.relName==='動作＋物品'&&r.combo.parts.length===2&&r.combo.parts[0].role==='動作'&&r.combo.taughtBefore===false&&r.novelCombo===true&&r.indicators.includes('M6')&&r.indicators.includes('M9'));
 T('first-new-combo result saved once (compose, wrong-first)',E(`CB.st("${cb1}").firstNew.channel`)==='compose'&&E(`CB.st("${cb1}").firstNew.first`)==='wrong'&&E(`CB.st("${cb1}").firstNew.independent`)===false);
 T('untaught combo stays untaught after compose (no phrase demo given)',E(`CB.novel("${cb1}")`)===true);
 E('leave()');
 // ---- 選車廂 / 配對 ----
 const cb2=cbOf('吃蘋果');
 await run(cb2,'cbc');T('cbc: fixed first car, slot, options include 1 correct + invalid distractors only',E('G.cg.opts.filter(o=>o.ok).length')===1&&E('G.cg.opts.filter(o=>!o.ok).every(o=>!CB.valid([G.cg.cb.parts[0],o.c.id]))')===true);
 const bad=E('G.cg.opts.findIndex(o=>!o.ok)');E(`CBG.pick(${bad})`);await sleep(60);E(`CBG.hint("P2")`);E(`CBG.pick(${E('G.cg.opts.findIndex(o=>o.ok)')})`);await sleep(100);r=rec();
 T('cbc: wrong→hint→correct recorded (confusion, P2, not independent, reward hinted)',r.first.result==='wrong'&&r.confusions.length===1&&r.hints[0].type==='P2'&&!r.independent&&r.reward.kind==='hinted'&&r.channel==='compose');E('leave()');
 await run(cbOf('吃飯'),'cbm');T('cbm: chooses the verb given the object (index 0)',E('G.cg.ci')===0&&E('G.cg.opts.length')===2);E(`CBG.pick(${E('G.cg.opts.findIndex(o=>o.ok)')})`);await sleep(100);
 T('cbm independent correct',rec().independent===true&&rec().game==='cbm'&&rec().stage===3&&rec().taskId==='S3.cbm');E('leave()');
 // ---- 口語 ----
 await run(cbOf('吃蘋果'),'cbs');
 T('cbs: no answer text, no zhuyin, no audio; train picture of parts',q('#word').textContent==='？'&&!q('#mid').textContent.includes('ㄔ')&&q('#mid').querySelectorAll('.ccar').length===2);
 E('SK.mark("correct")');await sleep(100);r=rec();
 T('cbs independent oral: channel oral, oralIndependent true, compCorrect null, stage 4',r.channel==='oral'&&r.oralIndependent===true&&r.compCorrect===null&&r.sp.cls==='ok_indep'&&r.stage===4&&r.taskId==='S4.cbs');
 T('same combo: compose and oral are separate records with separate fields',E(`S.recs.filter(x=>x.itemId==="${cb2}").map(x=>x.channel).join()`)==='compose,oral');
 T('first-new by channel: compose and oral stored separately; overall first stays compose',E(`CB.st("${cb2}").firstNew.channel`)==='compose'&&E(`CB.st("${cb2}").firstNewBy.oral.independent`)===true&&E(`CB.st("${cb2}").oralIndep`)===true);E('leave()');
 // part words
 await run(cbOf('拿香蕉'),'cbs');E(`CB.pw("${id('拿')}")`);E('SK.mark("attempt")');await sleep(100);r=rec();
 T('oral partial: only one word said → attempt, parts recorded',r.sp.cls==='attempt'&&r.oralParts.find(p=>p.text==='拿').said===true&&r.oralParts.find(p=>p.text==='香蕉').said===false&&r.outcome==='unconfirmed');E('leave()');
 // cbx needs ctx
 T('cbx locked without ctx/img (message), enabled when ctx set',E('CB.avail("cbx",{rel:"act_obj"}).length')===0&&E('CB.why').includes('情境提示'));
 E(`CB.upd("${cbOf('喝水')}","ctx","口渴了，想要喝的")`);T('cbx available after setting context',E('CB.avail("cbx",{rel:"act_obj"}).length')===1);
 await run(cbOf('喝水'),'cbx');T('cbx shows context only; not the phrase; not part pictures',q('.cbctx').textContent.includes('口渴')&&q('#word').textContent==='？'&&q('#mid').querySelectorAll('.ccar').length===0);
 E('SK.give("P4v","button")');await sleep(50);E('SK.mark("correct")');await sleep(100);r=rec();
 T('cbx + full phrase demo: ok_imitated, not independent, spontaneous false',r.sp.cls==='ok_imitated'&&!r.independent&&r.spontaneous===false&&r.sub==='cbx');
 T('after full demo played the combo is no longer untaught; first-new unchanged',E(`CB.novel("${cbOf('喝水')}")`)===false&&E(`CB.st("${cbOf('喝水')}").demo`)===true&&E(`CB.st("${cbOf('喝水')}").firstNew.independent`)===false);E('leave()');
 // spontaneous
 E(`CB.upd("${cbOf('吃飯')}","ctx","肚子餓了")`);E(`CB.st("${cbOf('吃飯')}")`);
 await run(cbOf('穿鞋'),'cbs');E('SK.give("P1","button")');E('SK.mark("correct")');await sleep(100);T('oral with P1 → prompted; novel at start recorded',rec().sp.cls==='ok_prompted'&&rec().novelCombo===true);E('leave()');
 // ---- 示範教學 ----
 const cb3=cbOf('媽媽吃');T('before teach: novel',E(`CB.novel("${cb3}")`)===true);
 const n0=nrec();await run(cb3,'cbt');await sleep(900);T('cbt: plays phrase, marks demo+taught, no scored record yet',E(`CB.st("${cb3}").demo`)===true&&nrec()===n0);E('CBG.tdone()');await sleep(100);
 T('cbt: taught by teach_mode; still no scored record; star earned',E(`CB.st("${cb3}").taught`)&&E(`CB.st("${cb3}").taughtBy`)==='teach_mode'&&nrec()===n0&&E('S.rw.stars')>0);E('leave()');
 await run(cb3,'cbo');E(`CBG.put(${E('G.cg.pool.findIndex(p=>p&&p.i===0)')})`);E(`CBG.put(${E('G.cg.pool.findIndex(p=>p&&p.i===1)')})`);await sleep(100);
 T('taught combo recorded novelCombo=false, taughtBefore true, no M6',rec().novelCombo===false&&rec().combo.taughtBefore===true&&!rec().indicators.includes('M6')&&E(`CB.st("${cb3}").firstNew`)===null);E('leave()');
 // ---- 矩陣 ----
 const mxid=E('S.mx[0].id');
 E(`CB.mxStart("${mxid}","teach")`);await sleep(250);T('matrix teach: 6 cells planned for teaching, all cbt',E('G.q.length')===6&&E('G.q.every(c=>c._step==="cbt")'));
 for(let i=0;i<6;i++){E('CBG.tdone()');await sleep(1450)}await sleep(300);
 T('matrix teach marks only planned cells taught',E('CB.all().filter(c=>c.mx&&CB.st(c.id).taught).length')===6&&E('CB.all().filter(c=>c.mx&&CB.novel(c.id)).length')===3);
 E('leave()');
 E(`CB.mxStart("${mxid}","order")`);await sleep(250);
 T('matrix assess: only the 3 untaught cells',E('G.q.length')===3&&E('G.q.every(c=>CB.novel(c._cb))'));
 const asses=E('G.q.map(c=>c.text).sort().join()');T('assessed cells are 吃麵包,拿蘋果,要香蕉',asses===['吃麵包','拿蘋果','要香蕉'].sort().join());
 const first=E('G.cur._cb');E(`CBG.put(${E('G.cg.pool.findIndex(p=>p&&p.i===0)')})`);E(`CBG.put(${E('G.cg.pool.findIndex(p=>p&&p.i===1)')})`);await sleep(150);
 T('matrix first-new assessment saved independent & correct, flagged novel',E(`CB.st("${first}").firstNew.outcome`)==='correct'&&E(`CB.st("${first}").firstNew.independent`)===true&&rec().combo.matrix&&rec().combo.matrix.id===mxid);
 E('leave()');
 // ---- 替換 ----
 E('S.set.cbScope="all"');E('S.set.n=5');
 E('CB.start("sub_v",{rel:"all"})');await sleep(250);
 T('sub_v: all items share the fixed verb; options are objects; invalid pairings not accepted',E('G.q.length')>=2&&E('new Set(G.q.map(c=>CB.get(c._cb).parts[0])).size')===1&&E('G.q.every(c=>c._sw==="v")')&&E('G.cg.ci')===1);
 E(`CBG.pick(${E('G.cg.opts.findIndex(o=>!o.ok)')})`);await sleep(50);T('sub: semantically invalid object rejected',E('G.lock')===false&&E('G.cg.ch[0].ok')===false);E(`CBG.pick(${E('G.cg.opts.findIndex(o=>o.ok)')})`);await sleep(100);
 T('sub record stores swap type',rec().combo.swap==='v'&&rec().taskId==='S3.sub.v'&&rec().indicators.includes('M9'));E('leave()');
 E('CB.start("sub_o",{rel:"all"})');await sleep(250);T('sub_o: fixed object, changing verb',E('G.q.every(c=>c._sw==="o")')&&E('new Set(G.q.map(c=>CB.get(c._cb).parts[CB.get(c._cb).parts.length-1])).size')===1&&E('G.cg.ci')===0);E('leave()');
 // 中途離開、完全沒操作 → 不算首次新組合評量
 const cbL=cbOf('小球');await run(cbL,'cbo');E('leave()');await sleep(50);
 T('abandoned untouched item does not consume first-new slot (record kept as no_response)',rec().outcome==='no_response'&&E(`CB.st("${cbL}").firstNew`)===null&&E(`CB.novel("${cbL}")`)===true);
 // ---- 語文 ----
 const cbw=cbOf('喝水');
 await run(cbw,'cbp');E('G.repDone=1');for(const k of ['ㄏ','ㄜ',' ','ㄕ','ㄨ','ㄟ','ˇ']){E(`kPress("${k}")`);await sleep(25)}await sleep(200);r=rec();
 T('phrase spelling works; channel literacy; excluded from oral & compose fields',r.game==='spell'&&r.channel==='literacy'&&r.outcome==='correct'&&r.oralIndependent===null&&r.compCorrect===null&&r.oralCorrect===null&&r.taskId==='S4.cbp');
 T('literacy result does not set oral independence',E(`CB.st("${cbw}").oralIndep`)!==true);E('leave()');
 await run(cbw,'cbl');E('G.repDone=1');for(const k of ['ㄏ','ㄜ',' ','ㄕ','ㄨ','ㄟ','ˇ']){E(`kPress("${k}")`);await sleep(25)}await sleep(200);
 T('phrase listen-typing works',rec().game==='listen'&&rec().channel==='literacy'&&rec().outcome==='correct');E('leave()');
 E('LRN.cur().ps={sw:60,zyAb:false}');T('literacy locked for learner without zhuyin',E('CB.avail("cbp",{}).length')===0&&E('CB.why').includes('不使用注音'));E('LRN.cur().ps={sw:60,fade:0}');
 // ---- 關係排序／停用 ----
 E('CB.relOn("act_obj",false)');T('teacher can disable a relation',E('CB.avail("cbo",{}).every(c=>c.rel!=="act_obj")'));E('CB.relOn("act_obj",true)');E('CB.relMv("state",-1)');T('teacher can reorder relations',E('CB.p3().order.indexOf("state")')===E('REL.map(r=>r.id).indexOf("state")')-1);
 // ---- 個案獨立 ----
 const lid=E('LRN.add("乙").id');E(`LRN.switchTo("${lid}")`);T('other learner: taught state is independent (all novel again)',E(`CB.novel("${cb3}")`)===true&&E(`CB.novel("${cbOf('喝水')}")`)===true);E(`LRN.switchTo("L001")`);T('back to first learner: state kept',E(`CB.novel("${cb3}")`)===false);
 // ---- 後台、報告、CSV、地圖 ----
 E("sub='cb';tab(2)");T('teacher page renders combos, matrix grid, report',q('#sp').textContent.includes('詞彙組合矩陣')&&q('#sp').textContent.includes('首次新組合評量結果')&&q('#sp').querySelectorAll('.mxt td').length>=9);
 T('report separates channels',q('#sp').textContent.includes('圖片組合')&&q('#sp').textContent.includes('口語表達')&&q('#sp').textContent.includes('語文'));
 const csv=E('RE.csv()');T('CSV has combo columns',csv.includes('通道')&&csv.includes('未教組合首次成功')&&csv.includes('圖片組合'));
 E('MAP.show()');const st=[...w.document.querySelectorAll('.lstn')];T('map: stations 3 and 4 developed with buttons',st[2].textContent.includes('已完成開發')&&st[3].textContent.includes('已完成開發')&&st[2].textContent.includes('固定動詞')&&st[3].textContent.includes('排列雙詞短語')&&st[4].textContent.includes('已完成開發'));
 // 新增 UI
 E('S.cb=[]');T('empty combos: games locked with message',E('CB.avail("cbo",{}).length')===0&&E('CB.why').includes('還沒有'));
 const nc=E(`CB.add({rel:"act_obj",parts:["${id('吃')}","${id('水')}"],ok:false}).id`);T('teacher can add a combo flagged unreasonable; it is never valid',E(`CB.valid(["${id('吃')}","${id('水')}"])`)===false);
 // 既有 speak/pick 仍可用
 E('S.cards=[{id:"a",text:"棉被",zy:"ㄇㄧㄢˊ ㄅㄟˋ",img:"'+PNG+'",audio:"",cats:[],created:1,modified:1},{id:"b",text:"火車",zy:"ㄏㄨㄛˇ ㄔㄜ",img:"'+PNG+'",audio:"",cats:[],created:1,modified:1}];S.set.mode="speak";S.set.sps="obj";S.cx={};S.recs=[]');E('startRound()');await sleep(250);E('SK.mark("correct")');await sleep(100);
 T('phase-02 speak game still works',rec().game==='speak'&&rec().independent===true&&rec().itemKind==='word');E('leave()');
 console.log('PASS',R.P,'FAIL',R.F);process.exit(R.F?1:0);
})().catch(e=>{console.log('CRASH',e.stack);process.exit(2)});
