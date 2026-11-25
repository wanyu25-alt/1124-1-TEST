// 第04階段：詞彙學習履歷、熟悉度、間隔複習、智慧出題、跨模式推薦（jsdom）
const fs=require('fs');const {mk,R,T,sleep}=require('./t30h.js');
const IMG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const N=16;const SEED=`S.cards=[${Array.from({length:N},(_,i)=>`{id:'c${i+1}',text:'詞${i+1}詞',zy:'ㄅㄚ ㄆㄚ',img:'${IMG}',audio:'',cats:[]}`).join(',')}];S.cats=[];S.set.src='all';S.set.order='seq';S.set.sound=false;S.set.music=false;S.set.ap=false;S.set.n=5;S.set.anim=false;S.set.hz={u:'none',free:true};S.set.hl={w:1,c:1,p:1,f:1,a:1};V2.prepDone=true;save()`;
const HELP=`window.__n=0;window.__d=n=>new Date(2026,9,1+n,12).getTime();
window.__add=(wid,game,o)=>{o=o||{};const out=o.out||'correct',ts=o.ts!=null?o.ts:__d(o.d||0);__n++;
 const r={sv:1,id:'T'+__n,learnerId:LRN.id(),itemId:wid,itemKind:'word',itemText:(byId(wid)||{}).text,game,outcome:out,independent:out==='correct'&&o.ind!==false&&!(o.hints&&o.hints.length),hints:o.hints||[],first:{result:o.first||(out==='correct'?'correct':'wrong')},final:{},ts,session:{id:o.sid||('s'+(o.d||0))},ext:{aid:{hint:o.aid||'none'}},sub:o.sub||null,purpose:'assess',tries:0};
 if(o.imm)r.ext.vp={imm:true};
 if(game==='pick')r.pk={sub:o.sub||'word',n:o.n||3,dist:'mix'};
 if(game==='speak')r.sp={cls:o.cls||(out==='correct'?'ok_indep':out==='wrong'?'wrong':'none')};
 S.recs.push(r);return r};
window.__many=(wid,game,arr)=>arr.forEach(a=>__add(wid,game,a));VP._k=null;`;
const boot=async(o={})=>{const w=mk(Object.assign({fresh:true},o));const t0=Date.now();while(Date.now()-t0<8000&&!(w.eval('typeof VP!=="undefined"&&typeof UI!=="undefined"&&S.set.ttsMig===3')))await sleep(50);const E=c=>w.eval(c),q=s=>w.document.querySelector(s),qa=s=>[...w.document.querySelectorAll(s)];w.alert=m=>{w.__al=m};w.confirm=()=>true;E(SEED);E(HELP);E('VP._now=__d(30)');return{w,E,q,qa}};
const J=(E,c)=>JSON.parse(E('JSON.stringify('+c+')'));
(async()=>{
 // ① 每項能力分開保存；會拼打不代表會說；沒有紀錄＝尚未評量，不是不會
 {const {E}=await boot();
  E(`__many('c1','key',[{d:0},{d:1},{d:2}])`);
  const P=J(E,'(()=>{const p=VP.prof("c1");return{zy:[p.ab.zy.state,p.ab.zy.flag],si:[p.ab.si.state,p.ab.si.flag,p.ab.si.n],sp:[p.ab.sp.state,p.ab.sp.flag],dc:p.ab.dc.flag,pi:p.ab.pi.flag,touched:p.touched}})()');
  T('typing record only fills 注音拼打 (其他能力不被推論)',P.zy[0]==='fa'&&P.si[0]===null&&P.si[2]===0&&P.dc==='unassessed'&&P.pi==='unassessed');
  T('typing ability never creates 自主說詞 evidence: flagged 尚未評量 not 不會',P.si[1]==='unassessed'&&P.sp[1]==='unassessed');
  T('ten abilities exist, each with its own record',E('VP.AB.length')===10&&E('VP.AB.map(a=>a.k).join()')==='lc,pi,si,sp,zy,dc,ph,se,gn,dl');
  const r1=J(E,'VP.recAll().filter(r=>r.wid==="c1").map(r=>[r.rule,r.task.mode,r.task.k,r.why.join("|")])');
  T('會拼打但不會說 → 推薦口語提取（附依據、並說明不等於不會說）',r1.some(x=>x[0]==='R1'&&x[1]==='oral'&&/注音拼打：已熟悉/.test(x[3])&&/自主說詞：尚未評量/.test(x[3])&&/不等於會說/.test(x[3])));
  T('an untouched word has no state at all (尚未學習), never a level',E('VP.prof("c9").touched')===false&&E('VP.prof("c9").nEv')===0);
 }
 // ② 五種狀態與判定規則
 {const {E}=await boot();
  const st=(wid,game,arr,ab)=>{E(`__many('${wid}','${game}',${JSON.stringify(arr)})`);const x=J(E,`(()=>{const x=VP.prof('${wid}').ab.${ab};return{s:x.state,f:x.flag,reg:x.regressed,cap:x.cap,n:x.n,b:x.basis}})()`);return x};
  let x=st('c1','pick',[{out:'wrong',d:0},{out:'wrong',d:1}],'pi');T('only errors → 認識中 (not 退步/不會), with 資料不足 flag',x.s==='kn'&&x.f==='insufficient');
  x=st('c2','pick',[{d:0}],'pi');T('a single success → 練習中, not 已熟悉',x.s==='pr'&&x.f==='insufficient');
  x=st('c3','pick',[{d:0,sid:'a'},{d:0,sid:'a'},{d:0,sid:'a'}],'pi');T('3 independent successes in ONE session → still 練習中 (needs different sessions)',x.s==='pr');
  x=st('c4','pick',[{d:0,sid:'a'},{d:0,sid:'a'},{d:1,sid:'b'}],'pi');T('3 independent successes over 2 sessions → 已熟悉',x.s==='fa'&&x.f===null&&x.b.some(b=>/2 個練習時段/.test(b)));
  x=st('c5','pick',[{d:0},{d:1},{d:2},{out:'wrong',d:3}],'pi');T('one wrong answer after being 已熟悉 does NOT demote',x.s==='fa'&&!x.reg);
  x=st('c6','pick',[{d:0},{d:1},{d:2},{out:'wrong',d:3},{out:'wrong',d:4}],'pi');T('repeated recent errors → back to 練習中 flagged 近期不穩 (重新列入待加強)',x.s==='pr'&&x.reg===true&&x.b.some(b=>/曾達「已熟悉」/.test(b)));
  // 穩定運用：延後仍獨立完成＋類化證據
  x=st('c7','pick',[{d:0},{d:1},{d:2},{d:10}],'pi');T('delayed success but NO generalization evidence → capped at 已熟悉 with the reason',x.s==='fa'&&/缺少「不同圖片或情境」/.test(x.cap));
  E(`__many('c7','pick',[{d:11,sub:'same'}])`);x=J(E,'(()=>{const x=VP.prof("c7").ab.pi;return{s:x.state,cap:x.cap}})()');T('with a different-image success too → 穩定運用',x.s==='st'&&!x.cap);
  x=st('c8','pick',[{d:0},{d:1},{d:2},{d:3},{d:4}],'pi');T('many successes within days (no delay) → not 穩定運用',x.s==='fa');
  // 不列入判定的結果
  x=st('c9','pick',[{d:0},{d:1},{d:2},{out:'unconfirmed',d:3},{out:'no_response',d:4},{out:'tech_error',d:5},{out:'skipped',d:6}],'pi');
  T('unconfirmed / no response / tech error / skipped neither count nor lower the state',x.s==='fa'&&x.n===3);
  // 只看過示範
  E('S.rv.c10={exposed:2,teach:0,assess:0,ok:0,last:__d(0)}');VP_=J(E,'(()=>{const p=VP.prof("c10");return{t:p.touched,pi:p.ab.pi.state,pif:p.ab.pi.flag,si:p.ab.si.state,sif:p.ab.si.flag}})()');
  T('exposure only → 認識中 (聽詞/圖片) but flagged 尚未評量; 其他能力仍是尚未評量',VP_.t&&VP_.pi==='kn'&&VP_.pif==='unassessed'&&VP_.si===null&&VP_.sif==='unassessed');
  // 提示、示範、模仿
  E(`__many('c11','speak',[{cls:'ok_imitated',hints:[{type:'P4_voice',level:4}],d:0},{cls:'ok_imitated',hints:[{type:'P4_voice',level:4}],d:1},{cls:'ok_imitated',hints:[{type:'P4_voice',level:4}],d:2}])`);
  const s=J(E,'(()=>{const p=VP.prof("c11");return{si:p.ab.si.state,sp:p.ab.sp.state,D:p.ab.si.c.D,I:p.ab.si.c.I}})()');
  T('repeating after a full demo never becomes 自主說詞 (stays 認識中)',s.si==='kn'&&s.I===0&&s.D===3);
  T('R3: 會仿說但不會自主說 → 無答案提示的看圖說詞',J(E,'VP.recAll().filter(r=>r.wid==="c11").map(r=>r.rule)').includes('R3')&&E('VP.TASK.oralRetr.star')===3);
  E(`__many('c12','speak',[{d:0,cls:'ok_prompted',hints:[{type:'P3_voice',level:3}]},{d:1,cls:'ok_prompted',hints:[{type:'P3_voice',level:3}]}])`);
  T('partial-prompt speech counts for 提示後說詞 (練習中), not for 自主說詞',J(E,'(()=>{const p=VP.prof("c12");return[p.ab.sp.state,p.ab.si.state,p.ab.si.c.P]})()').join()==='pr,pr,2'||J(E,'(()=>{const p=VP.prof("c12");return[p.ab.sp.state,p.ab.si.c.I]})()').join()==='pr,0');
  // 注音有提示時只算「提示後」
  E(`__many('c13','key',[{d:0,aid:'full'},{d:1,aid:'full'},{d:2,aid:'full'}])`);
  T('typing while full 注音 is shown only counts as 提示後完成 (not independent)',E('VP.prof("c13").ab.zy.c.I')===0&&E('VP.prof("c13").ab.zy.c.P')===3&&E('VP.prof("c13").ab.zy.state')==='pr');
  E(`__many('c14','key',[{d:0,aid:'none'},{d:1,aid:'none'},{d:2,aid:'none'}])`);
  T('typing with no 注音 shown counts as independent → 已熟悉',E('VP.prof("c14").ab.zy.state')==='fa');
  // 2 張圖不算聽詞理解
  E(`__many('c15','pick',[{d:0,n:2},{d:1,n:2},{d:2,n:2}])`);
  T('2-image picks count for 圖片辨認 only (chance level), not 聽詞理解',E('VP.prof("c15").ab.pi.n')===3&&E('VP.prof("c15").ab.lc.n')===0);
  E(`__many('c16','pick',[{d:0,n:4},{d:1,n:4}])`);T('4-image picks also count for 聽詞理解',E('VP.prof("c16").ab.lc.n')===2);
  // 狀態說明含規則版本
  T('every ability result carries the rule version used',E('VP.prof("c4").ab.pi.ver')==='1.0');
 }
 // ③ 間隔複習
 {const {E}=await boot();
  const sch=ev=>J(E,`(()=>{const s=VP.sch(${JSON.stringify(ev)}.map(e=>({lv:e.lv,ts:__d(e.d),sid:'x'})),VP.rules(),null);return{step:s.step,due:Math.round((s.due-__d(0))/864e5)}})()`);
  T('first independent success on day 0 → review on day +1',sch([{lv:'I',d:0}]).due===1);
  T('then 自主正確 on day 1 → interval extends to 3 days (due day 4)',sch([{lv:'I',d:0},{lv:'I',d:1}]).due===4);
  T('the ladder follows 1, 3, 7, 14, 30 days',[1,2,3,4,5].map(n=>sch(Array.from({length:n},(_,i)=>({lv:'I',d:i*40}))).due-(n-1)*40).join()==='1,3,7,14,30');
  T('two successes on the same day only advance one step',sch([{lv:'I',d:0},{lv:'I',d:0}]).step===1);
  T('部分提示後正確 → keeps the interval (no extension)',sch([{lv:'I',d:0},{lv:'I',d:1},{lv:'P',d:4}]).step===2);
  T('two partial-prompt successes in a row → interval shortens',sch([{lv:'I',d:0},{lv:'I',d:1},{lv:'P',d:4},{lv:'P',d:7}]).step===1);
  T('完整示範後才完成 → comes back early (next day, step −2)',(r=>r.due===9&&r.step===1)(sch([{lv:'I',d:0},{lv:'I',d:1},{lv:'I',d:4},{lv:'D',d:8}])));
  T('a wrong answer steps back one level only (not a reset)',sch([{lv:'I',d:0},{lv:'I',d:1},{lv:'I',d:4},{lv:'F',d:11}]).step===2);
  T('schedule uses the real practice date: skipping days does not change the next due date',sch([{lv:'I',d:0},{lv:'I',d:20}]).due===20+3);
  E(`__many('c1','pick',[{d:0},{d:1},{out:'tech_error',d:2},{out:'unconfirmed',d:2}])`);
  T('technical / unconfirmed results do not move the schedule',E('VP.prof("c1").ab.pi.sch.step')===2&&Math.round((E('VP.prof("c1").ab.pi.sch.due')-E('__d(0)'))/864e5)===4);
  E('VP._now=__d(4)');T('due list contains the word on its due day, with reason',J(E,'VP.dueList().map(x=>x.id+":"+x.ab)').includes('c1:pi'));
  E('VP._now=__d(3)');T('...and not before',!J(E,'VP.dueList().map(x=>x.id)').includes('c1'));
  E('VP._now=__d(9)');const od=J(E,'VP.dueList().find(x=>x.id==="c1"&&x.ab==="pi")');T('overdue words are listed with how many days late',od&&od.over===5);
  T('R8 recommendation cites the due date reason',J(E,'VP.recAll().filter(r=>r.rule==="R8").map(r=>r.why.join())').some(x=>/逾期 5 天/.test(x)));
  T('legacy REV.due now follows the new schedule (one schedule only)',J(E,'REV.due().map(x=>x.id)').includes('c1'));
 }
 // ④ 規則可調整、保留版本
 {const {E}=await boot();
  E(`__many('c1','pick',[{d:0,sid:'a'},{d:1,sid:'b'}])`);
  T('2 successes → 練習中 under default rules (1.0)',E('VP.prof("c1").ab.pi.state')==='pr'&&E('VP.rules().ver')==='1.0');
  E('VP.syncAll("init")');E('VP.setRules({famN:2},"教師")');
  T('rule change bumps the version and recomputes: same records now 已熟悉',E('VP.rules().ver')==='1.0-t1'&&E('VP.prof("c1").ab.pi.state')==='fa'&&E('VP.prof("c1").ab.pi.ver')==='1.0-t1');
  T('records are not modified by a rule change',E('S.recs.length')===2);
  const hist=J(E,'VP.ext().rh');T('rule history keeps who/when/what (before → after)',hist.length===1&&/famN：3 → 2/.test(hist[0].changes[0])&&hist[0].by==='教師'&&hist[0].ts>0);
  T('the log says it was a rule change, not student progress',J(E,'VP.ext().log').some(l=>/規則調整為 1.0-t1/.test((l.basis||[]).join())));
  E('VP.setRules({gaps:"0,2,5,9"})');T('review intervals are adjustable',J(E,'VP.rules().gaps').join()==='0,2,5,9');
  E('VP.setRules({famN:99,recentK:0})');T('values are clamped to safe ranges',E('VP.rules().famN')===10&&E('VP.rules().recentK')===2);
  E('VP.resetRules()');T('reset restores defaults and logs it',E('VP.rules().famN')===3&&E('VP.ext().rh.slice(-1)[0].changes[0]')==='恢復預設規則');
 }
 // ⑤ 出題順序（動態規劃）
 {const {E}=await boot();
  const seq=(f,n,w)=>E(`SM.seqTypes(${f},${n},${w}).join('')`);
  const ok=(s)=>!/[NW]{3}/.test(s);
  T('default 10 questions (4 熟悉, 5 待加強, 1 新): starts and ends with 熟悉, no 3 hard in a row, 新詞彙 not at either end',(s=>s[0]==='F'&&s.slice(-1)==='F'&&ok(s)&&s[0]!=='W'&&s.slice(-1)!=='W'&&s.length===10)(seq(4,5,1)));
  T('small set 5 (2 熟悉, 3 待加強): opens with 熟悉 and puts one 熟悉 before the end',(s=>s[0]==='F'&&s.slice(-2)[0]==='F'&&ok(s))(seq(2,3,0)));
  T('two 新詞彙 are never adjacent',!/WW/.test(seq(5,5,2)));
  T('15 questions: no 3 hard in a row, ends easy',(s=>ok(s)&&s.slice(-1)==='F')(seq(6,8,1)));
  T('no 熟悉詞彙 at all: still returns a full sequence',seq(0,4,0)==='NNNN');
  T('result is deterministic',seq(4,5,1)===seq(4,5,1));
 }
 // ⑥ 配比、新詞彙教學、實際比例
 {const {w,E}=await boot();
  const mkFam=(ids)=>ids.forEach(id=>E(`__many('${id}','pick',[{d:0,sid:'a'},{d:1,sid:'b'},{d:2,sid:'c'}])`)),mkNeed=ids=>ids.forEach(id=>E(`__many('${id}','pick',[{d:2}])`));
  mkFam(['c1','c2','c3','c4','c5']);mkNeed(['c6','c7','c8','c9','c10','c11']);   // c12–c16 are 新詞彙
  E('VP._now=__d(3);S.set.mode="pick";S.set.pks="word";S.set.src="rec";S.set.n=10;S.set.mix=false;save();startRound()');await sleep(300);
  const pl=E('G.sm'),q=J(E,'G.q.map(c=>[c.id,c._step,c._sm&&c._sm.b])');
  T('flow queue is used: 10 items, plan attached to the round',q.length===10&&pl&&pl.n===10&&E('G.flow')===true);
  T('default ratio: 4 熟悉 / 5 待加強 / 1 新詞彙 (40/50/10)',pl.actual.fam===4&&pl.actual.need===5&&pl.actual.new===1&&pl.pct.fam===40&&pl.pct.need===50&&pl.pct.new===10);
  T('the plan stores the configured ratio and the ACTUAL ratio',pl.ratio.fam===40&&pl.ratio.need===50&&pl.ratio.new===10&&pl.actual.fam+pl.actual.need+pl.actual.new===10);
  T('the 新詞彙 is shown as a teaching card (示範), not assessed',q.filter(x=>x[2]==='new').every(x=>x[1]==='expose')&&q.filter(x=>x[2]!=='new').every(x=>x[1]==='pick'));
  T('the new word is a word with no record at all',q.filter(x=>x[2]==='new').every(x=>E(`VP.prof("${x[0]}").touched`)===false));
  const t=q.map(x=>x[2]==='fam'?'F':x[2]==='need'?'N':'W').join('');T('actual order opens and closes with 熟悉 words, new word not at the ends, no 3 hard in a row',t[0]==='F'&&t.slice(-1)==='F'&&!/[NW]{3}/.test(t)&&t[0]!=='W'&&t.slice(-1)!=='W');
  T('not purely random: 熟悉 bucket holds exactly the words with ≥已熟悉 on 圖片辨認',q.filter(x=>x[2]==='fam').every(x=>['c1','c2','c3','c4','c5'].includes(x[0]))&&q.filter(x=>x[2]==='need').every(x=>['c6','c7','c8','c9','c10','c11'].includes(x[0])));
  E('leave()');await sleep(100);
  // 手動比例：建立信心 60/30/10
  E('VP.preset("conf")');E('S.set.n=10;startRound()');await sleep(300);const p2=E('G.sm');
  T('only 5 熟悉 words exist: 60% of 10 cannot be met → 5 熟悉 / 4 待加強 / 1 新, with the shortage written down',p2.actual.fam===5&&p2.actual.need===4&&p2.actual.new===1&&p2.target.fam===6&&p2.fallback.some(x=>/熟悉的詞彙不足 1 個/.test(x)));
  E('leave()');await sleep(100);
  // 暫停新詞彙
  E('VP.preset("nonew")');E('S.set.n=10;startRound()');await sleep(300);const p3=E('G.sm'),q3=J(E,'G.q.map(c=>c._step)');
  T('暫停新詞彙 → no new words, no teaching cards',p3.actual.new===0&&!q3.includes('expose')&&p3.ratio.paused===true);
  E('leave()');await sleep(100);
  // 新詞彙累積：5 題一輪時，每兩輪出現 1 個
  E('VP.preset("def");SM.cfg().carry=0');let nn=0;for(let i=0;i<4;i++){E('S.set.n=5;startRound()');await sleep(250);nn+=E('G.sm.actual.new');E('leave()');await sleep(60)}
  T('with 5 questions per round the 10% new share accumulates (≈2 new words in 4 rounds, never more)',nn===2);
  // 教材不足：退而求其次並記錄
  E('VP.preset("def");S.set.n=10;SM.cfg().carry=0');E('S.cards=S.cards.slice(0,7);save()');E('startRound()');await sleep(300);const p4=E('G.sm');
  T('when 教材/紀錄不足 the plan falls back and says so; actual ratios are still recorded',p4&&p4.fallback.length>0&&p4.actual.fam+p4.actual.need+p4.actual.new>0&&typeof p4.pct.fam==='number');
  E('leave()');
  T('plans are saved in the learner data (last 40) with rule version',J(E,'VP.ext().plans').length>=4&&J(E,'VP.ext().plans').every(p=>p.ver==='1.0'&&p.words.length>0));
 }
 // ⑥b 教師調整比例（材料充足時完全照比例）
 {const {E}=await boot();
  ['c1','c2','c3','c4','c5','c6'].forEach(id=>E(`__many('${id}','pick',[{d:0,sid:'a'},{d:1,sid:'b'},{d:2,sid:'c'}])`));['c7','c8','c9','c10','c11','c12','c13','c14'].forEach(id=>E(`__many('${id}','pick',[{d:2}])`));
  E('VP._now=__d(3);S.set.mode="pick";S.set.pks="word";S.set.src="rec";S.set.n=10;S.set.mix=false;VP.preset("conf");startRound()');await sleep(300);const p=E('G.sm');
  T('建立信心 60/30/10 with enough words → exactly 6 熟悉 / 3 待加強 / 1 新',p.actual.fam===6&&p.actual.need===3&&p.actual.new===1&&p.fallback.length===0);
  E('leave()');await sleep(80);
  E('SM.setRatio(20,70,10);S.set.n=10;SM.cfg().carry=0;startRound()');await sleep(300);const p2=E('G.sm');
  T('custom 20/70/10 → 2 / 7 / 1 (new share stays small)',p2.actual.fam===2&&p2.actual.need===7&&p2.actual.new===1);
  E('leave()');await sleep(80);
  E('SM.setRatio(10,10,30);SM.cfg().carry=0;S.set.n=10;startRound()');await sleep(300);const p3=E('G.sm');
  T('新詞彙 share is capped at 30% and never fills the whole round',p3.actual.new<=3&&p3.actual.fam+p3.actual.need>=7);
  E('leave()');
 }
 // ⑦ 資料全空時：先教學、再問一次（基礎觀察），結果只算「示範後」
 {const {E}=await boot();
  const till=async k=>{for(let j=0;j<24&&E('G.i')<k;j++)await sleep(250)};
  E('S.set.mode="pick";S.set.pks="word";S.set.src="rec";S.set.n=5;S.set.mix=false;SM.cfg().carry=0;save();startRound()');await sleep(300);
  const pl=E('G.sm'),q=J(E,'G.q.map(c=>c._step)');
  T('all-new material: 資料不足 → 先教學、再問一次 (基礎觀察), flagged in the plan',pl&&pl.baseline===true&&/資料不足/.test(pl.fallback.join())&&q.join()==='expose,pick,expose,pick,expose');
  E('EXP.done()');await till(1);E('PICK.choose(G.pk.ci)');await till(2);
  const rec=E('S.recs[S.recs.length-1]');
  T('the question right after teaching is marked 示範後 (imm), not counted as independent',rec&&rec.game==='pick'&&rec.ext.vp.imm===true&&rec.ext.vp.sm.b==='new'&&E('VP.lv(S.recs[S.recs.length-1])')==='D');
  T('so the first contact never makes the word 練習中/已熟悉: it is 認識中 with 資料不足',E('VP.prof(S.recs[S.recs.length-1].itemId).ab.pi.state')==='kn'&&E('VP.prof(S.recs[S.recs.length-1].itemId).ab.pi.flag')==='insufficient');
  E('leave()');
 }
 {const {E}=await boot();
  E('S.set.mode="pick";S.set.pks="word";S.set.src="rec";S.set.n=5;S.set.mix=false;VP.preset("nonew");startRound()');await sleep(200);
  T('paused new words + no learned words → does not silently assess new words (asks the adult)',E('G.on')===false&&/暫停新詞彙/.test(E('window.__al||""')));
 }
 // ⑧ 剛聽過答案立刻說出，不算自主提取
 {const {w,E}=await boot();
  E('S.set.lm="integ";S.set.mix=false');
  E(`PH.m0=S.set.mode;S.set.mode='listen';PH.qq={flow:true,items:[{...byId('c1'),_step:'expose',_fw:0},{...byId('c1'),_step:'pick',_sub:'word',_fw:0},{...byId('c1'),_step:'speak',_sub:'obj',_fw:0},{...byId('c2'),_step:'speak',_sub:'obj',_fw:1},{...byId('c3'),_step:'expose',_fw:2},{...byId('c4'),_step:'expose',_fw:3},{...byId('c5'),_step:'expose',_fw:4},{...byId('c1'),_step:'speak',_sub:'obj',_fw:0,_rt:{of:null,n:1,from:'flow'}}]};S.set.n=8;startRound()`);await sleep(300);
  const till=async k=>{for(let j=0;j<24&&E('G.i')<k;j++)await sleep(250)};
  E('EXP.done()');await till(1);E('PICK.choose(G.pk.ci)');await till(2);
  E('SK.mark("correct")');await till(3);
  let rec=E('S.recs.filter(r=>r.game==="speak")[0]');
  T('speak right after 聽詞認識/選圖 of the same word is flagged immediate (集中式)',rec&&rec.ext.vp.imm===true&&rec.sp.imm===true);
  T('flagged record is NOT counted as independent retrieval (level D, 自主說詞 stays 認識中)',E('VP.lv(S.recs.filter(r=>r.game==="speak")[0])')==='D'&&E('VP.prof("c1").ab.si.c.I')===0);
  T('and the 口語觀察 indicator does not count it as 自主說詞 either',E('OBS.cls(S.recs.filter(r=>r.game==="speak")[0])')==='ok_imm');
  E('SK.mark("correct")');await till(4);const r2=E('S.recs.filter(r=>r.game==="speak")[1]');
  T('a word that was NOT just heard (c2) is counted as independent',r2&&r2.ext.vp.imm===false&&E('VP.lv(S.recs.filter(r=>r.game==="speak")[1])')==='I');
  for(let i=0;i<3;i++){const k=E('G.i');E('EXP.done()');await till(k+1)}
  E('SK.mark("correct")');await till(8);const r3=E('S.recs.filter(r=>r.game==="speak")[2]');
  T('the delayed retest of c1 (3+ items after hearing it) counts as independent retrieval',r3&&r3.itemId==='c1'&&r3.ext.vp.imm===false&&E('VP.lv(S.recs.filter(r=>r.game==="speak")[2])')==='I');
  T('records carry the rule version and the questioning plan info',!!r3.ext.vp.rv&&r3.ext.vp.sm===null);
  E('leave()');
 }
 // ⑨ 綜合練習：集中式／交錯式、每詞彙步驟數
 {const {E}=await boot();
  E('S.set.lm="integ";S.set.src="all";S.set.order="seq";PS();');
  const items=(il,per)=>{E(`SM.cfg().il=${JSON.stringify(il)};SM.cfg().per=${per}`);return J(E,'FLOW.items().map(c=>c.id+":"+c._step)')};
  const b=items('block',0),i=items('inter',0);
  T('集中式: the same word stays together (c1 all steps first)',/^c1:expose,c1:pick,c1:speak/.test(b.join()));
  T('交錯式: different words take turns on the same task type',/^c1:expose,c2:expose,c3:expose,c1:pick,c2:pick,c3:pick/.test(i.join()));
  T('auto = low star 集中式',(()=>{E('SM.cfg().il="auto"');return E('FLOW.ilOf()')==='block'})());
  E('FLR={star:4,ps:{}}');T('auto = star 3+ 交錯式',E('FLOW.ilOf()')==='inter');E('FLR=null');
  const p1=items('block',1);const per=p1.filter(x=>!/:expose/.test(x));
  T('each word does not have to finish every task type (1 task per word)',(()=>{const m={};per.forEach(x=>{const k=x.split(':')[0];m[k]=(m[k]||0)+1});return Object.values(m).every(n=>n<=2)})());
 }
 // ⑨b 各種題型都能在智慧出題中切換（教學卡 ↔ 題目），離開後模式復原
 {const mkc=async(mode,sub)=>{const {E}=await boot();
   ['c1','c2','c3'].forEach(id=>E(`__many('${id}','${mode==='speak'?'speak':mode==='key'?'key':mode==='listen'?'listen':mode==='spell'?'spell':'pick'}',[{d:0,sid:'a'},{d:1,sid:'b'},{d:2,sid:'c'}])`));
   ['c4','c5'].forEach(id=>E(`__many('${id}','${mode==='speak'?'speak':mode==='key'?'key':mode==='listen'?'listen':mode==='spell'?'spell':'pick'}',[{d:2}])`));
   E(`VP._now=__d(3);S.set.mode="${mode}";S.set.src="rec";S.set.n=6;S.set.mix=false;S.set.order="seq";VP.setRatio&&0;SM.setRatio(34,50,16);startRound()`);await sleep(350);return E};
  for(const [mode,exp] of [['key','key'],['listen','listen'],['spell','spell'],['speak','speak']]){
   const E=await mkc(mode);const q=J(E,'G.q.map(c=>[c._step,c._sm.b])'),ne=q.filter(x=>x[1]==='new');
   T(mode+': smart queue uses the '+exp+' step for assessed words and 示範卡 for the new word(s)',q.length===6&&q.filter(x=>x[1]!=='new').every(x=>x[0]===exp)&&ne.every(x=>x[0]==='expose')&&ne.length>=1);
   const modes=[];for(let i=0;i<6;i++){modes.push(E('S.set.mode'));const m=E('S.set.mode');if(m==='expose'){const k=E('G.i');E('EXP.done()');for(let j=0;j<24&&E('G.i')<=k;j++)await sleep(250)}else break}
   T(mode+': S.set.mode follows each card (first card is a '+exp+' question, 示範卡 switches to expose)',modes[0]===exp||modes[0]==='expose');
   E('leave()');await sleep(80);T(mode+': leaving restores the original mode',E('S.set.mode')===mode&&E('!G.on'));
  }
 }
 // ⑨c 提示褪除重測不破壞智慧出題的順序（只取代後面「待加強」的題目）
 {const {E}=await boot();
  ['c1','c2','c3','c4','c5'].forEach(id=>E(`__many('${id}','pick',[{d:0,sid:'a'},{d:1,sid:'b'},{d:2,sid:'c'}])`));['c6','c7','c8','c9','c10','c11'].forEach(id=>E(`__many('${id}','pick',[{d:2}])`));
  E('VP._now=__d(3);UI.pick("quiet");FL.open(1);FL.mem().star["quiet:1"]=1;FL.mem().n=10;FL.mem().range="rec";FL.go()');await sleep(300);
  const before=J(E,'G.q.map(c=>c._sm&&c._sm.b)'),n0=E('G.n');
  const first=before.indexOf('need');E(`G.i=${first};G.cur=G.q[G.i];RE.open();RE.hint("P2",{level:2});PH.sched()`);
  const after=J(E,'G.q.map(c=>c._sm&&c._sm.b)');
  T('fade retest keeps the question count (10) and the first/last 熟悉 cards',E('G.n')===n0&&after.length===before.length&&after[0]==='fam'&&after[after.length-1]==='fam');
  T('the retest took the place of a later 待加強 slot only',!!E('G.fs')&&after.filter(x=>x==='fam').length===before.filter(x=>x==='fam').length&&after.filter(x=>x==='new').length===before.filter(x=>x==='new').length);
  E('leave()');
 }
 // ⑩ 跨模式推薦規則
 {const {E}=await boot();
  E(`S.cb=[{id:'cb1',parts:['c1','c2'],ok:true,rel:'x',created:1}]`);
  E(`__many('c1','pick',[{d:0,sid:'a'},{d:1,sid:'b'},{d:2,sid:'c'}])`);                  // 圖片辨認熟悉，沒有類化、沒有短語 → R4, R5
  E(`__many('c3','speak',[{d:0,sid:'a'},{d:1,sid:'b'},{d:2,sid:'c'}])`);               // 會說，不會拼打 → R2
  E(`__many('c4','pick',[{d:0},{d:1},{d:2},{out:'wrong',d:3},{out:'wrong',d:4}])`);    // R7
  E(`__many('c5','pick',[{d:0}])`);                                                    // R9
  const R=J(E,'VP.recAll()'),has=(w,r)=>R.some(x=>x.wid===w&&x.rule===r);
  T('R4 只會辨認固定圖片 → 不同圖片',has('c1','R4')&&R.find(x=>x.wid==='c1'&&x.rule==='R4').task.k==='diffPic');
  T('R5 單一詞彙熟悉但沒練過短語 → 短語組合 (only for words that belong to a phrase)',has('c1','R5')&&!has('c3','R5'));
  T('R2 會說但不會拼打 → 注音及拼打',has('c3','R2')&&R.find(x=>x.wid==='c3'&&x.rule==='R2').task.mode==='quiet');
  T('R7 曾經熟悉但近期不穩定 → 複習（附依據）',has('c4','R7')&&/不穩定/.test(R.find(x=>x.wid==='c4'&&x.rule==='R7').why.join()));
  T('R9 資料不足 → 先做基礎觀察，不下能力判斷',has('c5','R9')&&/資料不足/.test(R.find(x=>x.wid==='c5'&&x.rule==='R9').why.join()));
  T('every recommendation carries at least one evidence line',R.every(x=>x.why.length>0&&x.why.every(s=>s.length>3)));
  E(`__many('c6','listen',[{d:0},{d:1},{d:2}])`);E(`S.cb=[{id:'cb1',parts:['c6','c7'],ok:true,rel:'x',created:1}]`);
  E(`__many('c8','key',[{d:0},{d:1},{d:2}])`);
  E(`VP._k=null`);
  // R6：固定短語熟悉但沒有新組合證據
  const add=(wid,sid,d,nv)=>E(`(()=>{const r=__add('${wid}','pick',{d:${d},sid:'${sid}'});r.itemKind='combo';r.combo={parts:[{cid:'${wid}'}]};r.novelCombo=${!!nv};})()`);
  add('c9','a',0);add('c9','b',1);add('c9','c',2);E('VP._k=null');
  T('R6 固定短語熟悉、缺少新組合 → 詞彙替換',J(E,'VP.recAll()').some(x=>x.wid==='c9'&&x.rule==='R6'&&x.task.k==='subst'));
  const g=J(E,'VP.groups()');T('recommendations are grouped by rule and task, with word counts',g.length>=4&&g.every(x=>x.words.length>0&&x.task.label));
  // 手動選擇仍保留：自行選擇教材 → 不使用智慧排序
  E('S.set.mode="pick";S.set.pks="word";S.set.src="all";S.set.n=5;S.set.mix=false;startRound()');await sleep(250);
  T('手動選擇教材（全部圖卡）仍照原本方式出題，不經智慧出題',E('G.sm')===undefined||E('!G.sm'));
  E('leave()');
 }
 // ⑪ 複習學過的詞彙
 {const {w,E,q}=await boot();
  E(`['c1','c2','c3','c4','c5','c6'].forEach(id=>__many(id,'pick',[{d:0,sid:'a'},{d:1,sid:'b'}]))`);E(`__many('c7','key',[{d:0}])`);
  E('VP._now=__d(10);UI.mode="quiet";S.set.n=5');
  const n=E('VP.quickCands("quiet").length');T('review candidates are words that already have records (7), never untouched words',n===7);
  E('UI.pick&&0;FL.view="map";UI.view="mode"');const html=E('FL.mapHtml()');
  T('map page has the 「複習學過的詞彙」 shortcut with the number of words',/複習學過的詞彙（7 個）/.test(html)&&/VP\.quick\(\)/.test(html));
  E('FL.mem().n=5;VP.quick()');await sleep(300);
  const pl=E('G.sm'),qq=J(E,'G.q.map(c=>[c.id,c._step,c._sm.b])');
  T('quick review builds a mixed-ability queue of learned words only (no 新詞彙/no teaching cards)',pl.kind==='review'&&qq.length===5&&qq.every(x=>x[2]!=='new'&&x[1]!=='expose'));
  T('every item uses the weakest/due ability of that word (pick for 辨認, key for typing)',qq.every(x=>['pick','key','listen'].includes(x[1])));
  E('leave()');
  E('VP._now=__d(10);UI.mode="oral"');T('oral mode: only words with spoken records can be reviewed there (typing/picking history is not enough)',E('VP.quickCands("oral").length')===0);
  E(`__many('c8','speak',[{d:0}])`);T('...once a spoken record exists the word appears',E('VP.quickCands("oral").length')===1);
 }
 // ⑫ 教師後台
 {const {E}=await boot();
  E('document.body.insertAdjacentHTML("beforeend","<div id=sp></div>")');
  E(`__many('c1','key',[{d:0},{d:1},{d:2}]);__many('c2','pick',[{d:0}])`);E('VP.ui.w="c1"');
  let h='';try{h=E('DSH.v.vp()')}catch(e){h='ERR '+e.message}
  T('「詞彙履歷」 tab renders (table, detail, 推薦, 出題設定, 規則, 狀態變更)',/詞彙學習履歷/.test(h)&&/學習推薦/.test(h)&&/出題設定/.test(h)&&/判定規則/.test(h)&&/狀態變更紀錄/.test(h));
  T('detail shows evidence lines and "尚未評量" instead of "不會"',/有效紀錄 3 次/.test(h)&&/尚未評量/.test(h)&&!/不會說（/.test(h));
  T('the tab is in the dashboard menu',E('DSH.hd()').includes('詞彙履歷'));
  E('DSH.ui.view="vp";tDASH()');T('tDASH renders the tab without errors',E('document.querySelector("#sp").innerHTML.includes("詞彙學習履歷")'));
  E('VP.ui.w="c1";document.body.insertAdjacentHTML("beforeend","<input id=vn_t><select id=vn_k><option value=spont>x</option></select>");document.getElementById("vn_t").value="餐桌上說火車"');E('VP.note()');
  T('生活口語運用 only comes from adult notes: 1 spont note → one independent daily event, game results do not touch it',E('VP.prof("c1").ab.dl.c.I')===1&&E('VP.prof("c2").ab.dl.n')===0);
  E('VP.addNote("c2","none","沒有使用")');T('a "not used" note is only stored; it creates no negative evidence',E('VP.prof("c2").ab.dl.n')===0&&E('VP.ext().notes.length')===2);
  E('DSH.ui.view="vp";tDASH()');T('the log stores state changes with rule version and basis',J(E,'VP.ext().log').length>0&&J(E,'VP.ext().log').every(l=>l.ver));
 }
 // ⑫b 事後補確認會影響履歷（辨識失敗的題目，大人補確認為正確說出）
 {const {E}=await boot();
  E(`(()=>{const r=__add('c1','speak',{d:0,out:'unconfirmed'});r.sp={cls:'unrecognized'};r.asr=[];r.purpose='assess';})()`);
  T('an unrecognized (not yet confirmed) speech answer is not evidence at all',E('VP.prof("c1").ab.si.n')===0&&E('VP.prof("c1").ab.si.flag')==='unassessed');
  E('RE.revise("T1","correct","家長")');
  T('after the adult confirms 正確說出 later, the profile updates (cache invalidated)',E('VP.prof("c1").ab.si.n')===1&&E('VP.prof("c1").ab.si.c.I')===1);
 }
 // ⑬ 狀態變更紀錄（在作答時自動留下）與資料格式
 {const {E}=await boot();
  E('S.set.mode="pick";S.set.pks="word";S.set.src="all";S.set.n=3;S.set.mix=false;startRound()');await sleep(300);
  E('PICK.choose(G.pk.ci)');await sleep(500);const rec=E('S.recs[S.recs.length-1]');
  T('a real answer gets ext.vp (rule version, imm flag) and updates the profile',rec&&rec.ext.vp&&rec.ext.vp.rv==='1.0'&&rec.ext.vp.imm===false&&E('VP.prof(S.recs[S.recs.length-1].itemId).ab.pi.n')===1);
  T('state log has the first change for that word',J(E,'VP.ext().log').some(l=>l.w===rec.itemId&&l.ab==='pi'));
  E('leave()');
  const ser=E('JSON.stringify(LRN.cur().ext.vp)');T('all new data lives under learner ext.vp and is JSON-serializable',ser.length>10&&JSON.parse(ser).sm.ratio.fam===40);
  E('delete LRN.cur().ext.vp;VP._k=null');T('old data without ext.vp migrates with defaults (no crash, profile still computed)',E('VP.ext().sm.ratio.fam')===40&&E('VP.prof("c1").touched')!==undefined);
  T('no raw audio / no student names introduced',!/blob:|data:audio/.test(ser));
 }
 // ⑭ 學習地圖推薦站
 {const {E}=await boot();
  E(`['c1','c2'].forEach(id=>__many(id,'key',[{d:0},{d:1},{d:2}]))`);E('UI.mode="oral";FL.view="map"');
  const r=J(E,'FL.recs()');T('student map station tag comes from the 學習履歷 (kind=data) with a reason',r.kind==='data'&&r.list.length>=1&&/依學習履歷推薦/.test(r.list[0].why)&&r.list[0].st===2);
  E('LRN.cur().ext.recSt=[4]');T('a teacher-set recommended station still wins',J(E,'FL.recs()').kind==='teacher');
 }
 console.log('done');process.exit(0)})();
