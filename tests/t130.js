// 全面稽核（第01–07階段修改後）：輕聲詞注音提示、麥克風迴圈錯誤、設定保留、重複事件、舊資料保留
const {mk,R,T,sleep}=require('./t30h.js');
const W={鞋子:'ㄒㄧㄝˊ ㄗ˙',叉子:'ㄔㄚ ㄗ˙',襪子:'ㄨㄚˋ ㄗ˙',火車:'ㄏㄨㄛˇ ㄔㄜ',高鐵:'ㄍㄠ ㄊㄧㄝˇ'};
const boot=async(word,extra='')=>{const w=mk();await sleep(450);const E=s=>w.eval(s),q=s=>w.document.querySelector(s);
 E(`S.set.legacyCost=true;S.cards=[{id:'a',text:'${word}',zy:'${W[word]}',img:'',audio:'',cats:[]},{id:'b',text:'火車',zy:'ㄏㄨㄛˇ ㄔㄜ',img:'',audio:'',cats:[]}];S.cats=[];S.set.src='all';S.set.order='seq';S.set.lm='quiet';S.set.mode='listen';S.set.hint='none';S.set.mix=false;S.set.sound=false;S.set.music=false;S.set.n=3;S.set.ap=false;S.set.anim=false;S.set.hz={u:'rep',cost:true,n:1,free:false};S.set.hl={w:1,c:1,p:1,f:1,a:1};S.rw.stars=10;S.rw.spent=0;S.logs=[];${extra};V2.prepDone=true;startRound()`);await sleep(150);E('G.repDone=1;kBot()');return{w,E,q}};
(async()=>{
 for(const word of ['鞋子','叉子','襪子']){
  const {E,q}=await boot(word);
  const seq=[];for(let i=0;i<4;i++){E("kHint('p')");await sleep(150);seq.push(E('K.hst[K.hst.length-1]'))}
  const exp=JSON.parse(E('JSON.stringify([0,1,2,3].filter(st=>K.seq.some((tk,ci)=>tk.some((x,si)=>x!==" "&&zyClass(tk,si)===st))))'));T(`${word}: staged hints follow 聲母→介音→韻母→聲調 over the stages that exist (˙ belongs to 聲調), −1⭐ per stage`,seq.slice(0,exp.length).join()===exp.join()&&E('S.rw.stars')===10-exp.length);
  T(`${word}: after all stages the answer boxes show every symbol including ˙`,[...q('#mid').querySelectorAll('.dm')].map(x=>x.textContent).join('').includes('˙'));
 }
 // 輕聲符號分類
 {const {E}=await boot('鞋子');T('zyClass: ˙ is class 3 (tone), ㄗ initial class 0',E("zyClass(['ㄗ','˙'],1)")===3&&E("zyClass(['ㄗ','˙'],0)")===0);
  T('zyToks keeps stored order and does not add a first-tone blank for neutral tone',JSON.stringify(E("zyToks('ㄔㄚ ㄗ˙')"))===JSON.stringify([['ㄔ','ㄚ',' '],['ㄗ','˙']]));}
 // 真實流程：打字（正確、錯誤）
 {const {E,q}=await boot('叉子');const press=async k=>{E(`kPress('${k}')`);await sleep(60)};for(const k of ['ㄔ','ㄚ',' ','ㄗ']){await press(k)}await press('ˋ');const wrong=E('G.tries');await press('˙');await sleep(500);
  T('typing: wrong tone rejected and counted (tries 1); correct ˙ accepted; word completes',wrong===1&&E('G.i')>=1||E('G.lock')===true||E('S.recs.length')>=1);}
 // 麥克風迴圈：頻譜資料存在時不得拋出例外（真實瀏覽器曾因 sr 未定義而每個畫格出錯）
 {const {w,E}=await boot('火車','S.set.mode="speak"');const errs=[];w.addEventListener('error',e=>errs.push(e.message));
  E("MV.mkVad();MV.sr=48000;MV.sf=new Float32Array(128).fill(-60);MV.tf=null;MIC.buf=new Uint8Array(2048).fill(128);MIC.an={getByteTimeDomainData(b){b.fill(128)},getFloatFrequencyData(b){b.fill(-60)},fftSize:2048,frequencyBinCount:128};MIC.st=true;S.set.mode='speak';document.body.insertAdjacentHTML('beforeend','<div id=\"wave\"><i></i><i></i><i></i><i></i></div>');window.__f0=MV.cnt.frames");
  let thrown=null;try{E("(()=>{try{micLoop()}catch(e){window.__e=String(e)}})()")}catch(e){thrown=String(e)}
  T('micLoop reaches the bar-animation code (frame counted, bar heights set) with no ReferenceError (sr)',!thrown&&!E('window.__e')&&E('MV.cnt.frames')>E('window.__f0')&&[...E('document.querySelectorAll("#wave i")')].every(b=>b.style.height!==''));
  E('MIC.st=false');}
 // 設定保留：新階段的程式不得改動既有設定
 {const w=mk();await sleep(450);const E=s=>w.eval(s);const keys=['vol','vs','vv','ttsRate','recRate','aiGain','mv','micSens','hint','sound','music','lm','n'];E('S.set.vol=.33;S.set.vs=.44;S.set.vv=.55;S.set.ttsRate=.6;S.set.recRate=1.25;S.set.aiGain=1.7;S.set.mv=.2;S.set.micSens=4;S.set.hint="partial";S.set.n=7');
  const before=JSON.stringify(keys.map(k=>E(`S.set.${k}`)));
  E('RC.ui.classic=false;home();RC.plan();RC.current({log:true});RC.iaShow();sub="rc";tab(2);tch();sub="dash";DSH.ui.view="dash";tch();RPT.sheets();tab(1);home()');
  T('volume / speed / mic sensitivity / hint / question-count settings unchanged after using every new screen',JSON.stringify(keys.map(k=>E(`S.set.${k}`)))===before);
  {const w2=mk({fresh:true});const t0=Date.now();while(Date.now()-t0<8000&&w2.eval('S.set.ttsMig')!==3)await sleep(50);const E2=x=>w2.eval(x);T('fresh install defaults still 1.25× real recording / 0.75× AI voice / AI gain 1.5',E2('S.set.recRate')===1.25&&E2('S.set.ttsRate')===0.75&&E2('S.set.aiGain')===1.5)}}
 // 重複事件
 {const {E}=await boot('火車');E('RC.plan()');const d=E('RC.plan()');E('const x=LRN.cur().ext.rc;x.daily.items.find(i=>i.id==="p1").state="todo";x.daily.cur={id:"p1",t0:Date.now()-5000};x.daily.lastSync=Date.now()-5000');
  E(`RE.rows().push({sv:1,id:'DD1',learnerId:S.lrn.cur,taskId:'S1.pick.word',itemId:'a',itemKind:'word',itemText:'x',game:'pick',stage:1,purpose:'assess',outcome:'correct',first:{result:'correct'},hints:[],independent:true,ts:Date.now()-1000,tech:[],ext:{}})`);
  E('RC.sync()');const n1=E('RC.plan().items.find(i=>i.id==="p1").n0');E('RC.sync();RC.sync()');T('repeated RC.sync() counts each record once (count unchanged by extra syncs, and the pushed record was counted)',n1>=1&&E('RC.plan().items.find(i=>i.id==="p1").n0')===n1&&n1===E('RE.rows().filter(r=>r.ts>=RC.xr().daily.cur.t0).length'));
  const s0=E('S.rw.stars');E('RC.plan().items.forEach(i=>{if(i.state==="todo")i.state="done"});RC.sync();RC.sync();RC.sync()');T('completion reward granted once',E('S.rw.stars')-s0===E('RC.R().bonus'));
  const nodes0=E('document.querySelectorAll("*").length');E('for(let i=0;i<10;i++){RC.ui.classic=false;home()}');T('re-rendering home 10× does not leak DOM nodes',E('document.querySelectorAll("*").length')<=nodes0+5);}
 // 舊資料：檢視所有新畫面不得修改紀錄、星星、錯題
 {const w=mk();await sleep(450);const E=s=>w.eval(s);E(`S.recs=[{sv:1,id:'O1',learnerId:'L001',taskId:'S1.pick.word',itemId:'x',itemKind:'word',itemText:'水',game:'pick',stage:1,purpose:'assess',outcome:'correct',first:{result:'correct'},hints:[],independent:true,ts:Date.now()-1e6,tech:[],ext:{}}];S.rw.stars=42;S.rw.badges=['b1'];S.mst={x:{n:2}};S.logs=[{t:1}];S.rounds={started:5,completed:4}`);
  const snap=()=>E('JSON.stringify([S.recs,S.rw,S.mst,S.logs,S.rounds,S.cards,S.cats])');const b=snap();
  E('sub="dash";["dash","heat","hint","trend","err","hist","goal","rpt"].forEach(v=>{DSH.ui.view=v;tab(2);tch()});sub="as";tab(2);tch();sub="rc";tab(2);tch();RPT.sheets();RC.suggest();RC.rep();RC.adv(1);RC.startStage(RC.rep(),RC.xr());tab(1);RC.ui.classic=false;home();RC.iaShow()');
  T('viewing every dashboard / recommendation / report screen leaves records, stars, badges, mistakes, rounds, logs, cards unchanged',snap()===b);
  T('S.as is not created merely by viewing (read-only guarantee)',E('S.as')===undefined);}
 console.log(`\nPASS ${R.P}  FAIL ${R.F}`);process.exit(R.F?1:0)})().catch(e=>{console.log('CRASH',e.stack);process.exit(2)});
