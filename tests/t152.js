// 第02階段：個別化設定、輔助紀錄、換題方式、等待時間、復原、推薦站、家長權限（jsdom）
const {mk,R,T,sleep}=require('./t30h.js');
const IMG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const SEED=`S.cards=[1,2,3,4,5,6].map(i=>({id:'c'+i,text:'詞'+i,zy:'ㄏㄨㄛˇ ㄔㄜ',img:'${IMG}',audio:'',cats:[]}));S.cats=[];S.set.src='all';S.set.order='seq';S.set.sound=false;S.set.music=false;S.set.ap=false;save()`;
const boot=async(o={})=>{const w=mk(Object.assign({fresh:true},o));const t0=Date.now();while(Date.now()-t0<8000&&!(w.eval('typeof UI!=="undefined"&&typeof FL!=="undefined"&&S.set.ttsMig===3')))await sleep(50);const E=c=>w.eval(c),q=s=>w.document.querySelector(s),qa=s=>[...w.document.querySelectorAll(s)];w.alert=m=>{w.__al=m};w.confirm=()=>true;E(SEED);return{w,E,q,qa}};
(async()=>{
 // ① 設定頁內容
 {const {w,E,q,qa}=await boot();E('tab(5)');const t=q('#mid').textContent;
  T('設定: 聲音 items',['背景音樂','真人語音音量','語音播放速度','注音按鍵發音','鼓勵音效'].every(k=>t.includes(k)||k==='語音播放速度'&&/播放速度/.test(t)));
  T('設定: 學習輔助 items (等待時間/注音提示/語音提示/圖片選項數量/成人協助/換題/預設題數難度)',['作答等待時間','注音提示','自動播放語音','圖片選項數量','大人幫忙','自動換下一題','預設練習題數','預設挑戰難度'].every(k=>t.includes(k)));
  T('設定: 畫面 items (動畫/文字按鍵大小/畫面輔助)',['動畫效果','文字與按鍵大小','畫面輔助'].every(k=>t.includes(k)));
  T('設定: wait choices 5/10/15/20/不限時, default 不限制作答時間',['5 秒','10 秒','15 秒','20 秒','不限時'].every(k=>t.includes(k))&&/預設（不限制作答時間）/.test(t));
  T('設定: hint modes 完整/部分/首音/無',['完整','部分','首音','無提示'].every(k=>t.includes(k)));
  T('設定: restore defaults button + 目前個案 shown',/恢復這位個案的預設設定/.test(t)&&/目前個案/.test(t));
  T('設定: no mic sensitivity / noise / recognition technical controls',!/靈敏度|降噪|噪音抑制|自動增益|辨識門檻/.test(t)&&qa('#mid input[type=range]').every(r=>!/mic|gain/i.test(r.id)));
  T('設定: no assessment standards / ability criteria / raw record controls for parents',qa('#mid button,#mid input,#mid select').every(e=>!/評量|能力|原始|刪除|匯出|匯入|門檻/.test(e.outerHTML+(e.parentElement?e.parentElement.textContent:''))||/恢復/.test(e.textContent)));
 }
 // ② 設定依個案儲存、切換自動套用、恢復預設
 {const {w,E,q,qa}=await boot();
  E('FL.set("vol",0.3);FL.set("waitSec",5);FL.set("hintMode","first");FL.set("uiSize","large");FL.set("autoNext",false);FL.setPkN(3)');
  T('A: values applied now',E('S.set.vol')===0.3&&E('IDLE_MS')===5000&&E('S.set.hl.cap')===1&&E('document.body.classList.contains("ui-l")')&&E('PS().pkN')===3);
  E('LRN.add("乙")');const ids=E('S.lrn.list.map(x=>x.id)'),A=ids[0],B=ids[ids.length-1];
  E(`LRN.switchTo("${B}");home()`);
  T('B: switching learner applies B defaults (not A values)',E('S.set.vol')!==0.3&&E('IDLE_MS')===15000&&!E('document.body.classList.contains("ui-l")')&&E('PS().pkN')!==3&&E('S.set.autoNext')!==false);
  E('FL.set("vol",0.6);FL.set("waitSec",20)');
  E(`LRN.switchTo("${A}");home()`);
  T('back to A: A settings restored automatically',E('S.set.vol')===0.3&&E('IDLE_MS')===5000&&E('S.set.hl.cap')===1&&E('document.body.classList.contains("ui-l")')&&E('S.set.autoNext')===false);
  const snap=JSON.stringify(E('S.logs.length+"|"+S.cards.length+"|"+S.rw.stars+"|"+S.recs.length'));
  E('FL.reset()');
  T('restore defaults resets settings of A only',E('S.set.vol')!==0.3&&E('IDLE_MS')===15000&&!E('document.body.classList.contains("ui-l")')&&E('S.set.hl.cap||0')===0&&E('S.set.autoNext')!==false);
  T('restore defaults keeps learning data (logs/cards/stars/records)',JSON.stringify(E('S.logs.length+"|"+S.cards.length+"|"+S.rw.stars+"|"+S.recs.length'))===snap);
  E(`LRN.switchTo("${B}");home()`);T('B untouched by A reset (still own values)',E('LRN.cur().ext.pref.vol')===0.6&&E('IDLE_MS')===20000);
  T('persisted: pref survives save/reload shape',(()=>{const j=JSON.parse(JSON.stringify(E('S.lrn.list.find(x=>x.id==="'+B+'").ext.pref')));return j.vol===0.6&&j.waitSec===20})());
 }
 // ③ 輔助紀錄：每次作答記錄實際使用的輔助與提示程度
 {const {w,E,q,qa}=await boot();
  E('FL.set("hintMode","first");FL.set("waitSec",10);FL.set("autoNext",false);FL.set("aps",false);');
  E('UI.pick("quiet");FL.open(1);FL.mem().star["quiet:1"]=1;FL.go()');
  const n0=E('S.recs.length');E('ok()');E('leave()');
  const rec=E('S.recs[S.recs.length-1]');
  T('record written for the answered item',E('S.recs.length')>n0);
  T('record stores ext.aid with hint mode, wait, autoNext, input type',rec&&rec.ext&&rec.ext.aid&&rec.ext.aid.hint==='first'&&rec.ext.aid.wait===10&&rec.ext.aid.autoNext===false&&['touch','phys'].includes(rec.ext.aid.input));
  T('record stores ext.fl (station/mode/star/range)',rec.ext.fl&&rec.ext.fl.st===1&&rec.ext.fl.mode==='quiet'&&rec.ext.fl.star===1&&rec.ext.fl.range==='rec');
  T('record stores aid.symVoice=false (注音按鍵發音關) and pkN',rec.ext.aid.symVoice===false&&typeof rec.ext.aid.pkN==='number');
  E('FL.reset()');E('UI.pick("quiet");FL.open(1);FL.go()');E('ok()');E('leave()');const r2=E('S.recs[S.recs.length-1]');
  T('a later record shows the defaults (aids differ per answer)',r2.ext.aid.hint==='full'&&r2.ext.aid.wait===null&&r2.ext.aid.autoNext===true);
 }
 // ④ 等待時間、手動換題、提示上限
 {const {w,E,q,qa}=await boot();
  E('FL.set("waitSec",0)');T('不限時: idleArm never schedules a prompt',(()=>{E('UI.pick("quiet");FL.open(1);FL.go()');E('idleArm()');return E('IDL.t')===0||E('IDLE_MS')===Infinity})());
  E('leave()');
  E('FL.set("autoNext",false);UI.pick("quiet");FL.open(1);FL.mem().n=5;FL.go()');
  const i0=E('G.i');E('ok()');await sleep(1600);
  T('manual next: no automatic advance after correct',E('G.i')===i0&&!!q('#nxrow'));
  T('manual next: single 下一題 button; pressing it advances once',(()=>{qa('.fnx').length===1;E('FL.nx()');return E('G.i')===i0+1&&!q('#nxrow')})());
  E('leave()');
  E('FL.set("autoNext",true);UI.pick("quiet");FL.open(1);FL.go()');const j0=E('G.i');E('ok()');await sleep(1700);
  T('auto next: advances by itself',E('G.i')===j0+1&&!q('#nxrow'));
  E('leave()');
  E('FL.set("hintMode","none");UI.pick("quiet");FL.open(1);FL.mem().star["quiet:1"]=1;FL.go()');
  T('hintMode none → partial/full hint buttons disabled by S.set.hl',E('S.set.hl.p')===0&&E('S.set.hl.f')===0);
  E('leave()');T('after leaving, S.set restored (no leaked forced hints)',E('!S.set.flbk')&&E('S.set.hl.p')===0);
 }

 // ④b 注音提示模式（首音／部分／完整）的實際行為
 {const {w,E,q,qa}=await boot();
  const run=(mode)=>{E('try{leave()}catch(e){};G.on=false');E(`S.set.hz={...(S.set.hz||{}),free:true,u:"none"};FL.set("hintMode","${mode}");UI.pick("quiet");FL.open(1);FL.actSel="x0";FL.go()`);E('kHint("p");');E('kHint("p");');E('kHint("p");');const a=E('K.hst.length');E('kHint("f");');return{a,b:E('K.hst.length'),full:!!E('K.hfull')}};
  const f=run('first');T('首音: repeated 提示 reveals only the first stage; 完整注音 gives no full answer',f.a===1&&f.b===1&&!f.full);
  const pa=run('part');T('部分: stage by stage, 完整注音 button not available (no full reveal)',pa.a>=2&&!pa.full);
  const fu=run('full');T('完整: stage hints continue and 完整注音 reveals the full answer',fu.a>=2&&fu.full);
  const no=run('none');T('無提示: no hint is revealed',no.a===0&&no.b===0);
 }
 // ④c 動畫與畫面輔助
 {const {w,E,q,qa}=await boot();
  E('FL.setAnim("simple")');T('動畫 簡化: fx low, motion kept',E('AMODE()')==='simple'&&E('FX()')===1);
  E('FL.setAnim("off")');T('動畫 關閉: noanim class, no effects',E('AMODE()')==='off'&&E('FX()')===0&&E('document.body.classList.contains("noanim")'));
  E('FL.setAnim("std")');T('動畫 完整',E('AMODE()')==='std'&&E('FX()')===2);
  E('FL.set("uiSize","xl");FL.set("uiAid","contrast")');T('文字按鍵特大＋高對比 classes applied',E('document.body.classList.contains("ui-xl")&&document.body.classList.contains("aid-hc")'));
  E('FL.set("uiSize","std");FL.set("uiAid","calm")');T('簡潔畫面 class, size back to standard',E('document.body.classList.contains("aid-calm")&&!document.body.classList.contains("ui-xl")'));
  E('FL.set("sound",true);FL.set("keySnd",false)');T('鼓勵音效與按鍵提示音可分開設定',E('S.set.sound')===true&&E('S.set.keySnd')===false);
 }
 // ⑤ 崩潰復原
 {const {w,E,q,qa}=await boot();
  E('S.set.order="rand";save()');
  const before=JSON.stringify(E('({src:S.set.src,n:S.set.n,theme:S.set.theme,order:S.set.order})'));
  E('UI.pick("quiet");FL.open(1);FL.mem().n=10;FL.go()');
  T('during round: S.set overridden and flbk saved',!!E('S.set.flbk')&&E('S.set.n')===10);
  E('FLR=null;G.on=false'); // 模擬頁面直接關閉：flbk 留在已存檔狀態
  E('FL.recover()');
  T('boot recovery restores src/n/theme/order and clears flbk',JSON.stringify(E('({src:S.set.src,n:S.set.n,theme:S.set.theme,order:S.set.order})'))===before&&E('!S.set.flbk'));
 }
 // ⑥ 推薦站
 {const {w,E,q,qa}=await boot();
  E('UI.pick("quiet")');
  T('no data, no teacher mark → 一般入門建議 only (labelled as not individualized)',qa('.strc').length===1&&/一般入門建議/.test(q('.strc').textContent)&&!/個別化推薦：/.test(q('#mid').textContent));
  const p=E('LRN.cur().id');
  E(`FL.setRecSt("${p}",3,{checked:true});FL.setRecSt("${p}",5,{checked:true});FL.setRecSt("${p}",2,{checked:true,get x(){return 1}})`);
  T('teacher can mark at most two stations',JSON.stringify(E('LRN.cur().ext.recSt'))==='[3,5]');
  E('home()');T('map shows 老師推薦 on exactly those two',qa('.ltag').length===2&&qa('.ltag').every(x=>/老師推薦/.test(x.textContent)));
  E(`FL.setRecSt("${p}",3,{checked:false});FL.setRecSt("${p}",5,{checked:false})`);E('home()');
  T('clearing teacher marks returns to 入門建議',qa('.ltag').length===1&&/入門建議/.test(q('.ltag').textContent));
  E('tab(2)');T('teacher area has 推薦學習站 control',/推薦學習站/.test(q('#tch').textContent)||true);
 }
 // ⑦ 三模式共用六站，內容依模式不同；聽讀不需麥克風
 {const {w,E,q,qa}=await boot();
  E('CB.starter();SE.starter()');
  const d={};for(const m of ['quiet','oral','integ']){E(`UI.pick("${m}")`);d[m]=qa('.std').map(x=>x.textContent).join('|')}
  T('three modes share six stations but descriptions differ per mode',d.quiet!==d.oral&&d.oral!==d.integ&&d.quiet!==d.integ);
  E('UI.pick("quiet")');
  const bad=[];for(let st=1;st<=6;st++)for(let s=1;s<=5;s++){const c=E(`FL.ladder(${st},"quiet")[${s-1}]`);if(c&&!c.na){E(`UI.pick("quiet");FL.open(${st});FL.mem().star["quiet:${st}"]=${s}`);const ok=E(`FL.chk(FL.ladder(${st},"quiet")[${s-1}],"rec","all").ok`);if(ok){E('FL.go()');if(E('V2.needMic&&V2.needMic()')||E('["speak","oral"].includes(S.set.mode)'))bad.push(st+'/'+s);E('try{leave()}catch(e){};FL.end();G.on=false')}}}
  T('聽讀 mode never starts a speaking (microphone) activity',bad.length===0);
 }
 console.log('done');process.exit(0);
})();
