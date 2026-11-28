// 新版第05階段：家長專區（jsdom）。資料全部由測試造出的「真實格式」作答紀錄產生
const fs=require('fs');const {mk,R,T,sleep}=require('./t30h.js');
const IMG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const N=12,SEED=`S.cards=[${Array.from({length:N},(_,i)=>`{id:'c${i+1}',text:'詞${i+1}詞',zy:'ㄅㄚ ㄆㄚ',img:'${IMG}',audio:'',cats:['k1']}`).join(',')}];S.cats=[{id:'k1',name:'日常',order:[]}];S.set.src='all';S.set.order='seq';S.set.sound=false;S.set.music=false;S.set.ap=false;S.set.n=5;S.set.anim=false;S.set.hz={u:'none',free:true};V2.prepDone=true;save()`;
const HELP=`window.__n=0;window.__t=d=>Date.now()-d*864e5-36e5;
window.__add=(wid,game,o)=>{o=o||{};const out=o.out||'correct',ts=o.ts!=null?o.ts:__t(o.d||0);__n++;
 const r={sv:1,id:'T'+__n,learnerId:LRN.id(),itemId:wid,itemKind:'word',itemText:(byId(wid)||{}).text,game,outcome:out,independent:out==='correct'&&o.ind!==false&&!(o.hints&&o.hints.length),hints:o.hints||[],first:{result:out==='correct'?'correct':'wrong'},final:{},ts,session:{id:o.sid||('s'+(o.d||0))},ext:{aid:{hint:'none'}},sub:null,purpose:o.purpose||'assess',stage:o.stage||2,tries:o.tries||0,durMs:o.dur!=null?o.dur:20000};
 if(game==='pick')r.pk={sub:o.sub||'word',n:3,dist:'mix'};if(game==='speak')r.sp={cls:out==='correct'?'ok_indep':'wrong'};if(o.conf)r.asr=[{text:'x',matched:false}];
 S.recs.push(r);VP._k=null;return r};`;
const boot=async()=>{const w=mk({fresh:true});const t0=Date.now();while(Date.now()-t0<8000&&!w.eval('typeof PAR!=="undefined"&&typeof UI!=="undefined"&&S.set.ttsMig===3'))await sleep(50);const E=c=>w.eval(c);w.alert=m=>{w.__al=m};w.confirm=()=>true;E(SEED);E(HELP);return{w,E}};
const J=(E,c)=>JSON.parse(E('JSON.stringify('+c+')'));
/* v22.6.4：學習分析頁只顯示兩個分頁；原本的六個分頁函式保留在 PAR.sec0，這裡直接測試它們 */
const page=(E,sec)=>{E(`UI.view='parent';PAR.ui.sec='${sec}';PAR.ui.msg=''`);return E(`PAR.sec0['${sec}']()`)};
(async()=>{
 // ① 沒有任何紀錄：每一頁都能顯示，且不亂下判斷
 {const {E}=await boot();
  const h=['today','res','rev','ab','tip','ob'].map(s=>page(E,s));
  T('① every parent section renders with no records and no errors',h.every(x=>x.length>200)&&!h.some(x=>/undefined|NaN|\[object/.test(x)));
  T('① no data → 尚未觀察 (not "表現不佳"); 七項能力 shown with plain names',/語意理解/.test(h[3])&&/聽得懂詞彙/.test(h[3])&&(h[3].match(/尚未觀察/g)||[]).length>=7&&!/表現不佳|不好意思|落後/.test(h[3].replace('不代表表現不好','')));
  T('① results page says no records instead of showing zeros as progress',/沒有練習紀錄/.test(h[1])&&/還沒有練習紀錄/.test(h[1]));
  T('① review page with no records lists nothing and does not invent words',/目前沒有待複習的詞彙/.test(h[2])&&E('PAR.review().length')===0);
  {const pg=E("UI.view='parent';UI.parent()");T('① permission limits are shown plainly on the parent page',/本機測試階段的權限說明/.test(pg)&&/不是資訊安全保護/.test(pg));}}
 // ② 今日推薦
 {const {E}=await boot();
  E(`__add('c1','pick');__add('c1','pick',{d:1});__add('c2','speak',{hints:[{type:'P1'}]});__add('c2','speak',{d:1,hints:[{type:'P1'}]});__add('c3','speak',{out:'wrong',d:2});for(let i=0;i<6;i++)__add('c'+(4+i%3),'pick',{d:i%3})`);
  const h=page(E,'today');
  T('② today: first/second priority, expected minutes, suggested question count, start button (real recommendation from records)',/第一優先/.test(h)&&/預計約/.test(h)&&/建議題數/.test(h)&&/開始今日學習|繼續今日學習|今天沒有可以開始/.test(h));
  E('PAR.setMins(10)');T('② parent can change practice time (6–20) and it is stored',E('RC.xr().mins')===10&&/預計約 <b>10 分鐘/.test(page(E,'today')));
  E('PAR.setWait(8)');T('② parent can change wait-before-hint (4–10) and the change is logged as 家長',E('LRN.cur().wait')===8&&E('LRN.cur().ext.cfgLog.some(l=>l.field==="wait"&&l.by==="家長")'));
  E('PAR.setWait(99)');T('② out-of-range aid values are clamped',E('LRN.cur().wait')===10);
  const n0=E('S.recs.length');E('PAR.setLit(false)');T('② parent aid change does not touch records or teacher rules',E('S.recs.length')===n0&&E('RC.xr().lit')===false&&E('RC.R().mins')>0);}
 // ③ 近期成果
 {const {E}=await boot();
  E(`__add('c1','speak',{d:1,sid:'a'});__add('c2','speak',{d:2,sid:'b',dur:30000});__add('c3','pick',{d:2,sid:'b'});__add('c9','speak',{d:20,sid:'z'});__add('c1','speak',{d:20,sid:'z'})`);
  const s7=J(E,`(PAR.ui.rng='7',PAR.stats())`),s30=J(E,`(PAR.ui.rng='30',PAR.stats())`);
  T('③ 近7天: 2 sessions, 3 words, minutes from real durations, last practice date',s7.sess===2&&s7.words===3&&s7.min===1&&s7.n===3&&s7.last>Date.now()-2.5*864e5);
  T('③ 近30天 includes older practice (3 sessions, 4 words)',s30.sess===3&&s30.words===4&&s30.n===5);
  E(`PAR.ui.rng='custom';PAR.ui.from=PAR.day(Date.now()-25*864e5);PAR.ui.to=PAR.day(Date.now()-15*864e5)`);const sc=J(E,'PAR.stats()');
  T('③ custom date range works (only the 20-days-ago session)',sc.n===2&&sc.sess===1);
  T('③ 新增自主說出: counts words whose FIRST independent spoken success falls in range (c1 had one 20 days ago → not new this week; only c2 is new)',s7.spont===1);
  E(`PAR.ui.rng='7'`);const h=page(E,'res');
  T('③ results page lists all required items and no stars',/最近練習日期/.test(h)&&/練習次數/.test(h)&&/累積練習時間/.test(h)&&/練習過的詞彙/.test(h)&&/新增熟悉的詞彙/.test(h)&&/新增「自己說出」/.test(h)&&/需要提示的情況/.test(h)&&/近期需要持續加強/.test(h)&&!/⭐|星星數/.test(h.replace('星星是遊戲獎勵，不代表語言能力進步，這裡不使用','')));}
 // ④ 趨勢只比較相近條件
 {const {E}=await boot();
  E(`for(let i=0;i<4;i++)__add('c'+(1+i),'speak',{d:9+i%3,out:i<1?'correct':'wrong',stage:2});for(let i=0;i<4;i++)__add('c'+(1+i),'speak',{d:1+i%3,stage:2})`);
  const c=J(E,`(PAR.ui.rng='7',PAR.stats().ind)`);
  T('④ comparable (same game/stage/purpose, ≥3 each): 25% → 100% reported as progress',c.ok&&c.prev===25&&c.cur===100&&/更常自己說出/.test(E('PAR.trendTxt(PAR.stats().ind,"更常自己說出")')));
  const {E:E2}=await boot();
  E2(`for(let i=0;i<4;i++)__add('c'+(1+i),'speak',{d:9+i%3,out:'wrong',stage:2});for(let i=0;i<4;i++)__add('c'+(1+i),'speak',{d:1+i%3,stage:3})`);
  const c2=J(E2,`(PAR.ui.rng='7',PAR.stats().ind)`);
  T('④ different stage/difficulty → NOT compared (no unreasonable cross-condition comparison)',c2.ok===false&&/暫時不做比較/.test(E2('PAR.trendTxt(PAR.stats().ind,"x")')));
  const {E:E3}=await boot();E3(`for(let i=0;i<4;i++)__add('c'+(1+i),'speak',{d:9+i%3,stage:2});for(let i=0;i<4;i++)__add('c'+(1+i),'speak',{d:1+i%3,stage:2,out:'wrong'})`);
  T('④ a drop is worded as 持續練習中 support, not "退步／不好"',/需要的協助較多/.test(E3('(PAR.ui.rng="7",PAR.trendTxt(PAR.stats().ind,"x"))'))&&!/退步|變差|不好/.test(E3('PAR.trendTxt(PAR.stats().ind,"x")')));
  const {E:E4}=await boot();E4(`for(let i=0;i<4;i++)__add('c'+(1+i),'speak',{d:9+i%3,stage:2,hints:[{type:'P1'}]});for(let i=0;i<4;i++)__add('c'+(1+i),'speak',{d:1+i%3,stage:2})`);
  const hn=J(E4,`(PAR.ui.rng='7',PAR.stats().hn)`);T('④ hint need decreasing is detected (100% → 0%)',hn.ok&&hn.prev===100&&hn.cur===0);}
 // ⑤ 待複習＋直接複習
 {const {E}=await boot();
  E(`for(let i=0;i<4;i++){__add('c1','key',{d:i});__add('c1','pick',{d:i})}__add('c2','speak',{d:1,hints:[{type:'P1'}]});__add('c3','pick',{d:2,out:'wrong'});__add('c3','pick',{d:1,out:'wrong'});__add('c4','pick',{d:3});__add('c5','speak',{d:0,hints:[{type:'P2'}]})`);
  const L=J(E,'PAR.review().map(w=>({id:w.id,k:[...w.kinds],why:w.why,mode:w.mode,how:w.how,last:w.last}))');
  T('⑤ review list has real reasons from records: 會拼打但口語還沒（c1）、需要提示（c2,c5）、答錯（c3）',L.some(w=>w.id==='c1'&&/拼打.*自己說出/.test(w.why.join(''))&&w.mode==='oral')&&L.some(w=>w.id==='c2'&&w.k.includes('hint'))&&L.some(w=>w.id==='c3'&&w.k.includes('wrong'))&&L.every(w=>w.how&&w.mode&&w.last));
  T('⑤ every listed word carries 原因／建議模式／建議練習方式／最近練習日期 (rendered)',(h=>/最近練習：/.test(h)&&/建議：/.test(h)&&/<img src=/.test(h))(page(E,'rev')));
  T('⑤ words never practiced are not invented into the list',!L.some(w=>['c8','c9','c10'].includes(w.id)));
  const ok=E(`PAR.go('all')`);
  T('⑤ 一鍵複習: creates a real game round immediately (G.on, questions from the review list), no return to the home settings',ok===true&&E('G.on')===true&&E('G.q.length')>=2&&E('G.q.every(q=>PAR.review().some(w=>w.id===q.id))')&&E('G.flow')===true);
  E('leave()');E(`PAR.ui.sel={c2:1,c5:1}`);const sel=E(`PAR.go('sel')`);
  T('⑤ 勾選複習: only the ticked words',sel===true&&J(E,'G.q.map(q=>q.id)').every(id=>['c2','c5'].includes(id))&&E('G.q.length')===2);
  E('leave()');E(`PAR.go('wrong')`);T('⑤ 近期答錯複習: only the wrong word (c3)',J(E,'G.q.map(q=>q.id)').join()==='c3');
  E('leave()');E(`PAR.go('hint')`);T('⑤ 近期需要提示複習: c2 and c5 only',J(E,'G.q.map(q=>q.id).sort()').join()==='c2,c5');
  E('leave()');E(`PAR.go('all','oral')`);T('⑤ 依學習模式(口語): learning mode switched, speaking steps',E('V2.lm()')==='oral'&&J(E,'G.q.map(q=>q._step)').every(s=>s==='speak'));
  E('leave()');E(`PAR.go('all','quiet')`);T('⑤ 依學習模式(聽讀): no speaking steps',E('V2.lm()')==='quiet'&&J(E,'G.q.map(q=>q._step)').every(s=>s!=='speak'));
  E('leave()');E(`PAR.ui.cat='k1'`);T('⑤ 依教材分類複習 works',E(`PAR.go('cat')`)===true&&E('G.on')===true);
  E('leave()');E(`PAR.ui.cat='nope'`);const none=E(`PAR.go('cat')`);T('⑤ empty selection → plain message, no empty game',none===false&&E('G.on')===false&&/沒有待複習/.test(E('PAR.ui.msg')));
  T('⑤ the runs are recorded (what was started, how many words)',E('PAR.x().runs.length')>=6&&E('PAR.x().runs.every(r=>r.ids.length>0)'));
  E(`PAR.ui.sel={};PAR.ui.msg=''`);const sel0=E(`PAR.go('sel')`);T('⑤ nothing ticked → asks to tick (no game)',sel0===false&&/請先勾選/.test(E('PAR.ui.msg')));}
 // ⑥ 能力說明
 {const {E}=await boot();
  E(`for(let i=0;i<8;i++)__add('c'+(1+i%4),'pick',{d:i%6});__add('c1','speak',{d:1});__add('c2','speak',{d:1})`);
  const A=J(E,'PAR.abil().map(a=>[a.n,a.st])'),m=Object.fromEntries(A);
  T('⑥ seven abilities with the parent-friendly names',A.map(a=>a[0]).join()==='語意理解,詞彙提取,語意組織,組合彈性,表達獨立性,語言類化,溝通主動性');
  T('⑥ only the four allowed status words are used',A.every(a=>['近期有進步','持續練習中','尚未觀察','資料不足'].includes(a[1])));
  T('⑥ abilities with records vs without: 語意理解=持續練習中, 詞彙提取=資料不足 (2 questions), 語意組織/組合彈性/溝通主動性=尚未觀察 (never shown as poor)',m['語意理解']==='持續練習中'&&m['詞彙提取']==='資料不足'&&m['語意組織']==='尚未觀察'&&m['組合彈性']==='尚未觀察'&&m['溝通主動性']==='尚未觀察');
  E(`OB.all().push({id:'OBx1',learnerId:LRN.cur().id,ts:Date.now()-864e5,text:'水',initiated:'y',prompted:'none',mode:'oral',setting:'home',src:'real_life'},{id:'OBx2',learnerId:LRN.cur().id,ts:Date.now()-2*864e5,text:'餅乾',initiated:'y',prompted:'none',mode:'oral',setting:'home',src:'real_life'},{id:'OBx3',learnerId:LRN.cur().id,ts:Date.now()-3*864e5,text:'媽媽',initiated:'n',prompted:'none',mode:'oral',setting:'home',src:'real_life'})`);
  T('⑥ 溝通主動性 comes only from real-life observation records',J(E,'Object.fromEntries(PAR.abil().map(a=>[a.n,a.st]))')['溝通主動性']==='持續練習中');}
 // ⑦ 陪伴建議
 {const {E}=await boot();
  const t0=J(E,'PAR.tips()');T('⑦ no records → only general tips, labelled as general',t0.length>=2&&t0.every(t=>/一般性建議|一般性提醒/.test(t.b)));
  E(`for(let i=0;i<5;i++)__add('c'+(1+i%3),'speak',{d:i%4,out:i%2?'wrong':'correct',hints:i%2?[{type:'P1'}]:[]})`);
  const t=J(E,'PAR.tips()'),all=t.map(x=>x.t).join('|');
  T('⑦ tips from records: wait before prompting, do not give the full answer, accept current spoken length, link to daily life with real words, encourage attempts, never delay needed help',/先等待幾秒/.test(all)&&/不直接說出完整答案/.test(all)&&/接受孩子目前能完成的口語長度/.test(all)&&/詞\d詞/.test(all)&&/鼓勵/.test(all)&&/不因為孩子還沒說出答案，就延遲必要的協助/.test(all));
  T('⑦ every tip states its basis',t.every(x=>x.b&&x.b.length>3));
  E(`PAR.st().tpl=[{id:'T1',title:'吃飯時',text:'吃飯時請孩子拿{詞}，先等他自己說',ab:'',cat:'k1'},{id:'T2',title:'洗澡',text:'洗澡情境',ab:'',cat:'nope'},{id:'T3',title:'通用',text:'通用情境練習',ab:'',cat:''}]`);
  const tp=J(E,'PAR.tpls()');T('⑦ teacher templates are picked by the child\'s data: matching category + general ones; non-matching one hidden; {詞} filled with a real recent word',tp.some(x=>x.title==='吃飯時'&&/詞\d詞/.test(x.text)&&/最近練習過/.test(x.why))&&tp.some(x=>x.title==='通用')&&!tp.some(x=>x.title==='洗澡'));}
 // ⑧ 生活口語觀察
 {const {E,w}=await boot();E(`__add('c1','speak')`);const rn=E('S.recs.length'),rows=E('RE.rows().length'),vp=JSON.stringify(J(E,'VP.prof("c1").ab.dl'));
  const fill=(o)=>{const d=w.document;const set=(k,v)=>{let e=d.getElementById('par_'+k);if(!e){e=d.createElement('input');e.id='par_'+k;d.body.appendChild(e)}e.value=v};Object.entries(o).forEach(([k,v])=>set(k,v))};
  fill({txt:'我要喝水',how:'spont',date:E('PAR.day(Date.now())'),time:'10:30',set:'home',place:'客廳',who:'媽媽',pur:'request',mode:'oral',note:'自己走過來說'});E('PAR.obSave()');
  const o=J(E,'OB.all().slice(-1)[0]');
  T('⑧ observation saved with all fields: words, how, date, place, partner, purpose, mode, note; learner = current; src real_life; by parent',o.text==='我要喝水'&&o.how==='spont'&&o.setting==='home'&&o.settingNote==='客廳'&&o.partner==='媽媽'&&o.purpose==='request'&&o.mode==='oral'&&o.note==='自己走過來說'&&o.learnerId===E('LRN.cur().id')&&o.src==='real_life'&&o.by==='parent'&&o.ts>0);
  T('⑧ the four ways map onto the existing teacher fields (自行主動=主動/無提示；詢問後=非主動/無提示；部分提示；模仿=完整示範)',o.initiated==='y'&&o.prompted==='none'&&(()=>{const m={};for(const[h,i,p]of[['asked','n','none'],['partial','n','partial'],['imitate','n','full']]){fill({txt:'x'+h,how:h,date:E('PAR.day(Date.now())')});E('PAR.obSave()');const r=J(E,'OB.all().slice(-1)[0]');m[h]=r.initiated===i&&r.prompted===p}return m.asked&&m.partial&&m.imitate})());
  T('⑧ real-life observation is stored separately: game records, record count, 詞彙履歷 and star count unchanged',E('S.recs.length')===rn&&E('RE.rows().length')===rows&&JSON.stringify(J(E,'VP.prof("c1").ab.dl'))===vp);
  fill({txt:'',how:'spont',date:E('PAR.day(Date.now())'),mode:'oral'});const n1=E('OB.all().length');E('PAR.obSave()');T('⑧ oral observation with no words is refused',E('OB.all().length')===n1);
  fill({txt:'x',how:'spont',date:E('PAR.day(Date.now()+5*864e5)')});E('PAR.obSave()');T('⑧ a future date is refused',E('OB.all().length')===n1);
  fill({txt:'',how:'spont',date:E('PAR.day(Date.now())'),mode:'gesture'});E('PAR.obSave()');T('⑧ gesture/card-only observation (no spoken words) is allowed',E('OB.all().length')===n1+1);
  const h=page(E,'ob');T('⑧ parent sees recent entries but gets no delete/edit buttons',/最近的紀錄/.test(h)&&!/OB\.del|btn red|<button[^>]*>[^<]*(刪除|修改)/.test(h)); }
 // ⑨ 權限
 {const {E}=await boot();E(`__add('c1','pick')`);E(`LRN.add('另一位孩子')`);const A=E('S.lrn.cur'),B=E('S.lrn.list.find(x=>x.name==="另一位孩子").id');
  T('⑨ default: parent may only see the currently selected learner',E(`PAR.allowed('${A}')`)&&!E(`PAR.allowed('${B}')`));
  const hm=(E(`UI.view='home';home();document.body.innerHTML`)||'');T('⑨ learner-switch lists in student/parent screens do not show the other learner',!/另一位孩子/.test(E('MAP.show&&(()=>{try{MAP.show()}catch(e){};return document.body.innerHTML})()')));
  E(`RC.ctx='p'`);T('⑨ the observation form only offers authorised learners',!/另一位孩子/.test(E('OB.form("x")')));
  E(`PAR.tAuth('${B}',true)`);T('⑨ teacher can authorise more learners (current stays)',E(`PAR.allowed('${A}')&&PAR.allowed('${B}')`));
  E(`PAR.tAuth('${A}',false);LRN.switchTo('${A}')`);T('⑨ current learner not authorised → parent page is locked with an explanation (no data shown)',/沒有開放給家長查看/.test(E('PAR.page()'))&&!/語意理解/.test(E('PAR.page()')));
  const m0=E('RC.xr().mins');E('PAR.setMins(14)');T('⑨ parent actions are refused for an unauthorised learner',E('RC.xr().mins')===m0&&E('PAR.start(["c1"],{})')===false&&E(`PAR.confirm('x','correct')`)===false);
  E('S.par.auth=null');
  const keys=Object.keys(J(E,'Object.fromEntries(Object.keys(PAR).map(k=>[k,1]))'));T('⑨ the parent module offers no way to change teacher rules or delete records',!keys.some(k=>/setRules|delRec|deleteRec|clearRec|delLearner|rules/i.test(k)));
  E(`__add('c2','speak',{out:'unconfirmed',conf:true})`);const rid=E('S.recs[S.recs.length-1].id'),asr0=JSON.stringify(J(E,'S.recs[S.recs.length-1].asr')),cnt=E('S.recs.length');
  T('⑨ parent can confirm speech: adds a confirmation, keeps the original recognition result and the record',E(`PAR.confirm('${rid}','correct')`)===true&&E('S.recs.length')===cnt&&JSON.stringify(J(E,'S.recs[S.recs.length-1].asr'))===asr0&&E('S.recs[S.recs.length-1].confirm.final')==='correct'&&E('S.recs[S.recs.length-1].confirm.by')==='家長');
  T('⑨ parent actions are written to the audit log',E('(S.acl.audit||[]).filter(a=>/^家長/.test(a.action)).length')>=2);
  E(`sub='par';tch()`);const t=E('document.querySelector("#sp").innerHTML');T('⑨ teacher "家長專區設定" tab: authorisation, templates, the local-testing limitation',/授權家長查看的個案/.test(t)&&/生活練習情境模板/.test(t)&&/不是資訊安全保護/.test(t));}
 console.log('t200:',R.P,'pass',R.F,'fail');process.exit(R.F?1:0)})();
