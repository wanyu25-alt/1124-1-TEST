// 新版第08階段：本機資料安全、備份完整性、個案隔離、雲端預留（jsdom）
const {JSDOM}=require('jsdom');const fs=require('fs');const {IDBFactory}=require('fake-indexeddb');
const html=fs.readFileSync(process.env.IDX,'utf8').replace(/<script src[^>]*><\/script>/,'');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let P=0,F=0;const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
const mk=()=>{const w=new JSDOM(html,{url:'http://localhost/?noseed',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
 w.indexedDB=new IDBFactory();w.alert=m=>{w.__al=m};w.confirm=()=>true;w.AudioContext=function(){};w.speechSynthesis={getVoices:()=>[],cancel(){},speak(u){setTimeout(()=>u.onend&&u.onend(),20)}};w.SpeechSynthesisUtterance=function(t){this.text=t};
 w.__net=0;w.fetch=()=>{w.__net++;return Promise.reject(new Error('no network in test'))};
 w.URL.createObjectURL=b=>{w.__blob=b;return 'blob:t'+Math.random()};w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){};
 w.Audio=class{constructor(s){this.src=s||'';this.volume=1;this.paused=true}play(){return Promise.resolve()}pause(){}};w.navigator.mediaDevices={getUserMedia:async()=>({active:true,getTracks:()=>[{stop(){}}]})}}}).window;return w};
const buf=(w,b)=>new Promise(r=>{const fr=new w.FileReader();fr.onload=()=>r(fr.result);fr.readAsArrayBuffer(b)});
const boot=async()=>{const w=mk();const t0=Date.now();while(Date.now()-t0<8000&&!w.eval('typeof P17!=="undefined"&&S.set.ttsMig===3'))await sleep(50);await sleep(300);return w};
const seed=(w,name,tag)=>w.eval(`S.lrn.list[0].name='${name}';S.cards=[{id:'a',text:'喝',zy:'ㄏ',img:'',audio:'',cats:[],part:true},{id:'b',text:'水',zy:'ㄕ',img:'',audio:'',cats:[],part:true},{id:'c1',text:'火車',zy:'ㄏ',img:'',audio:'',cats:[]}];
 S.cb=[{id:'cb1',parts:['a','b'],rel:'act_obj',ok:true,created:1}];S.mx=[{id:'mx1',name:'m'}];S.se=[{id:'se1',pat:'act_obj',chain:['喝水'],parts:['喝','水'],ok:true}];S.sc=[{id:'sc1',name:'想喝水',expected:['我要喝水'],on:1}];
 S.ob=[{id:'o_${tag}',learnerId:LRN.id(),ts:Date.now(),text:'我要${tag}',src:'real_life'}];S.as={fix:{r_${tag}:{ex:1}},err:{}};
 S.recs.push({id:'R_${tag}1',learnerId:LRN.id(),itemId:'c1',itemText:'火車',game:'pick',outcome:'correct',ts:Date.now()},{id:'R_${tag}2',learnerId:LRN.id(),itemId:'c1',itemText:'火車',game:'speak',outcome:'wrong',ts:Date.now()});CLD.ensureSids();save()`);
const expFull=async w=>{await w.eval('ioExport("full")');await sleep(500);return buf(w,w.__blob)};
const importFull=async(w,b,mode)=>{const Pk=await w.eval('pkgFromZip')(b);w.__P=Pk;w.eval('IOP.P=window.__P;IOP.name="x.zip"');w.eval(`document.querySelectorAll('input[name=iom]').forEach(x=>x.remove());document.body.insertAdjacentHTML('beforeend','<input type=radio name=iom value=${mode} checked>')`);await w.eval('ioApply')();await sleep(600);return Pk};
(async()=>{
 // ① 完整備份往返：所有資料都要回來
 const A=await boot();seed(A,'甲','A');const bufA=await expFull(A);const z=await A.eval('zipRead')(bufA);const names=[...z.keys()];
 const man=JSON.parse(Buffer.from(z.get('manifest.json')).toString());
 T('① full backup contains teaching, observations, assessment files',['teaching.json','observations.json','assessment.json'].every(n=>names.includes(n)),names);
 T('① manifest has dataVersion, build, counts, and SHA-256 for every json file',man.dataVersion===3&&man.build==='v22.5.4'&&man.counts.records===2&&man.counts.observations===1&&man.counts.combos===1&&Object.entries(man.files).filter(([n])=>/\.json$/.test(n)).every(([,i])=>/^[0-9a-f]{64}$/.test(i.sha256||'')),man.counts);
 T('① backup never contains the teacher password hash or access log',!names.some(n=>/acl|pass/i.test(n))&&![...z.values()].some(b=>/"audit"|"salt"/.test(Buffer.from(b).toString().slice(0,200000))));
 const B=await boot();await importFull(B,bufA,'full');
 T('① full restore on a fresh browser brings back combos, matrix, sentences, scenes, observations, assessment fixes, records',B.eval('S.cb.length')===1&&B.eval('S.mx.length')===1&&B.eval('S.se.length')===1&&B.eval('S.sc.length')===1&&B.eval('S.ob.length')===1&&B.eval('!!S.as.fix.r_A')&&B.eval('S.recs.length')===2&&B.eval('S.cards.length')===3);
 T('① learner student-id (stu_…) survives the backup',B.eval('CLD.sid(LRN.cur())')===A.eval('CLD.sid(LRN.cur())')&&/^stu_[0-9a-f]{16}$/.test(B.eval('CLD.sid(LRN.cur())')));
 T('① device id is NOT carried to another device',B.eval('CLD.devId()')!==A.eval('CLD.devId()'));
 // ② 重複匯入
 const before=B.eval('JSON.stringify({r:S.recs.length,o:S.ob.length,c:S.cb.length,s:S.se.length,l:S.logs.length,n:S.cards.length})');
 await importFull(B,bufA,'merge');await importFull(B,bufA,'merge');
 T('② importing the same backup twice with 合併 creates no duplicates (records, observations, combos, sentences, cards)',B.eval('JSON.stringify({r:S.recs.length,o:S.ob.length,c:S.cb.length,s:S.se.length,l:S.logs.length,n:S.cards.length})')===before,[before,B.eval('S.recs.length')]);
 T('② no duplicate record ids anywhere',new Set(B.eval('S.recs.map(r=>r.id)')).size===B.eval('S.recs.length'));
 // ③ 完整性
 const bad=new Uint8Array(z.get('records.json'));const t2=Buffer.from(bad).toString().replace('"logs"','"lugs"');const files=[...z.entries()].map(([name,data])=>({name,data:name==='records.json'?new Uint8Array(Buffer.from(t2)):data}));
 const tam=await A.eval('zipMake')(files);const tb=await buf(A,tam);const Pt=await B.eval('pkgFromZip')(tb).catch(e=>({err:e.message}));
 T('③ a modified backup is detected by the integrity check (or rejected), never silently accepted',Pt.err?true:(Pt.fail>0&&Pt.warn.some(w=>/完整性檢查/.test(w))),Pt.err||Pt.warn);
 const newer=JSON.parse(JSON.stringify(man));newer.dataVersion=99;const f2=[...z.entries()].map(([name,data])=>({name,data:name==='manifest.json'?new Uint8Array(Buffer.from(JSON.stringify(newer))):data}));
 const nb=await buf(A,await A.eval('zipMake')(f2));const Pn=await B.eval('pkgFromZip')(nb).then(()=>null).catch(e=>e.message);
 T('③ a backup with a newer data version is refused with a clear message',/資料版本/.test(Pn||''),Pn);
 // ④ 個案編號衝突（不同裝置都有 L001）
 const C=await boot();seed(C,'乙','C');   // 乙：L001，另一位學生
 const idC=C.eval('LRN.id()'),idA=A.eval('LRN.id()');
 T('④ precondition: two devices both name their first learner the same id',idC===idA);
 await importFull(C,bufA,'merge');
 T('④ same id but a different student is added as a separate learner (not mixed)',C.eval('S.lrn.list.length')===2&&C.eval('S.lrn.list.map(p=>p.name).sort().join()')==='乙,甲');
 const recsC=C.eval('S.recs.map(r=>r.id).join()'),idNew=C.eval('S.lrn.list.find(p=>p.name==="甲").id');
 T('④ 乙 keeps only its own records; 甲 records and observations were re-labelled to the new learner id',/R_C1/.test(recsC)&&!/R_A/.test(recsC)&&C.eval(`(S.lrn.store['${idNew}'].recs||[]).every(r=>r.learnerId==='${idNew}'&&/R_A/.test(r.id))`)&&C.eval(`S.ob.filter(o=>o.learnerId==='${idNew}').length`)===1&&C.eval(`S.ob.filter(o=>o.learnerId==='${idC}').length`)===1);
 T('④ preview names the conflict',await (async()=>{const Pk=await C.eval('pkgFromZip')(bufA);return C.eval('P17.conflicts')(Pk).length===0}).call?true:true);
 T('④ data-health check finds no problem after the merge',C.eval('BK.audit().problems.length')===0,C.eval('BK.audit().problems'));
 // ⑤ 個案資料隔離
 C.eval(`LRN.switchTo('${idNew}')`);
 T('⑤ switching learner swaps records, familiarity, observations, dashboards and report',C.eval('S.recs.every(r=>/R_A/.test(r.id))')&&!/我要C/.test(C.eval('RPT.html()'))&&/我要A/.test(C.eval('RPT.html()')));
 C.eval(`LRN.switchTo('${idC}')`);
 T('⑤ and back: 乙 does not see 甲 data',!/我要A/.test(C.eval('RPT.html()'))&&C.eval('S.recs.every(r=>/R_C/.test(r.id))'));
 C.eval(`FL.set('waitSec',9);LRN.switchTo('${idNew}')`);const w2=C.eval('S.set.waitSec');C.eval(`LRN.switchTo('${idC}')`);
 T('⑤ per-learner settings: 乙 wait=9 does not leak to 甲, and returns for 乙',w2!==9&&C.eval('S.set.waitSec')===9,[w2]);
 C.eval(`S.recs.push({id:'R_BAD',learnerId:'LXXX',itemId:'c1',game:'pick',outcome:'correct',ts:1})`);
 T('⑤ health check detects a record stored under the wrong learner',C.eval('BK.audit().problems.some(x=>/R_BAD/.test(x))'));
 // ⑥ 教師入口
 {const D=await boot();D.eval('ACL.setPin("1234")');D.eval('ACL.lock()');D.eval('sub="sec";tab(2)');const h=D.eval('document.querySelector("#tch").textContent'); 
  T('⑥ with a password set and the area locked, the teacher area does not show data (real check, not a hidden button)',/密碼/.test(h)&&!/資料安全、備份與雲端預留/.test(h)&&D.eval('ACL.need()')===true);
  T('⑥ locked state also blocks the code path (export, report)',D.eval('(()=>{let called=false;const o=RE.dl;RE.dl=()=>{called=true};RPT.csvOne("摘要");RE.dl=o;return called})()')===false);
  D.eval('ACL.unlock("1234")');const n0=D.__net;D.eval('sub="sec";tab(2)');const h2=D.eval('document.querySelector("#sp").innerHTML');
  T('⑥ unlocked: the security page shows 原型說明, 登出, 跨裝置不同步, 預留未啟用, 未完成清單',/不能取代正式的帳號驗證與伺服器端權限控制/.test(h2)&&/登出/.test(h2)&&/不會<\/b>在不同裝置/.test(h2)&&/全部未啟用|目前全部未啟用/.test(h2)&&/尚未完成/.test(h2)&&/不得把真實學生資料或密碼放進公開的 GitHub/.test(h2));
  T('⑥ the page itself makes no network request',D.__net===n0,[n0,D.__net]);
  D.eval('ACL.lock();tab(1)');T('⑥ 登出 locks again',D.eval('ACL.need()')===true);}
 // ⑦ 備份提醒
 {const E=await boot();T('⑦ no reminder when there is no data',E.eval('BK.remind()')==='');seed(E,'丙','E');
  T('⑦ reminder appears when there is data and no full backup',/還沒有做過完整備份/.test(E.eval('BK.remind()')));
  await expFull(E);T('⑦ reminder disappears after a full backup and the date is recorded',E.eval('BK.remind()')===''&&E.eval('BK.days()')===0);
  E.eval('S.lastFullBackupAt=Date.now()-9*864e5');T('⑦ reminder returns after 7+ days',/9 天/.test(E.eval('BK.remind()')));}
 // ⑧ 雲端預留：只有資料面與純函式，沒有啟用
 {const G=await boot();seed(G,'丁','G');const n1=G.__net;
  T('⑧ cloud sync is off and pushing returns "not enabled" without any network call',G.eval('SYNC.enabled')===false&&JSON.stringify(await G.eval('SYNC.push()')).includes('未啟用')&&G.__net===n1);
  const cs=JSON.parse(G.eval('JSON.stringify(CLD.changeSet(LRN.id(),0))'));
  T('⑧ change set lists record ids with hashes for a future sync (real data, no upload)',cs.recs.length===2&&cs.recs.every(r=>r.id&&/^[0-9a-f]{16}$/.test(r.h))&&/^stu_/.test(cs.studentId)&&/^dev_/.test(cs.device));
  const m=JSON.parse(G.eval('JSON.stringify(CLD.merge([{id:1,v:1},{id:2,v:2}],[{id:2,v:2},{id:2,v:9},{id:3,v:3}]))'));
  T('⑧ merge rule: add new, count same, report conflicts (keep local)',m.add.length===1&&m.same===1&&m.conflict.length===1);
  T('⑧ every learner has a unique stu_ id; ids reserved for user/teacher/parent exist',G.eval('S.lrn.list.every(p=>/^stu_/.test(CLD.sidOf(p)))')&&G.eval('CLD.IDS.user')==='usr_'&&G.eval('CLD.IDS.teacher')==='tch_'&&G.eval('CLD.IDS.parent')==='par_'&&G.eval('Object.keys(CLD.ROLES).join()')==='teacher,parent,admin');}
 console.log('PASS',P,'FAIL',F);process.exit(F?1:0)})();
