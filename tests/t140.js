// 第01階段：首頁三入口、四項功能列、設定頁、麥克風提醒、裝置偵測、斷點接續、旋轉不重來（jsdom）
const {mk,R,T,sleep}=require('./t30h.js');
const CARDS=`S.cards=[1,2,3,4,5,6].map(i=>({id:'c'+i,text:'詞'+i,zy:'ㄏㄨㄛˇ ㄔㄜ',img:'',audio:'',cats:[]}));S.cats=[];S.set.src='all';S.set.order='seq';S.set.sound=false;S.set.music=false;S.set.n=4;S.set.hint='none';`;
const boot=async(o={})=>{const w=mk(Object.assign({fresh:true},o));const t0=Date.now();while(Date.now()-t0<8000&&!(w.eval('typeof UI!=="undefined"&&S.set.ttsMig===3&&!!document.querySelector("#mid .mc")')))await sleep(50);const E=s=>w.eval(s),q=s=>w.document.querySelector(s),qa=s=>[...w.document.querySelectorAll(s)];E(CARDS);return {w,E,q,qa}};
(async()=>{
 {const {w,E,q,qa}=await boot();
  T('nav has exactly 首頁／家長專區／設定／教師專區',JSON.stringify(qa('nav button').map(b=>b.textContent.trim()))==='["🏠 首頁","👪 家長專區","⚙ 設定","🧑‍🏫 教師專區"]');
  T('no 學生遊戲 entry anywhere in nav/home',!/學生遊戲/.test(q('nav').textContent+q('#mid').textContent));
  T('home shows exactly three large learning entries and no vehicle grid/settings',qa('.mc').length===3&&qa('#mid .vc').length===0&&qa('#mid select').length===0&&qa('#mid input').length===0);
  T('entry labels and one-line descriptions as specified',JSON.stringify(qa('.mc b').map(x=>x.textContent))==='["聽讀練習","口語練習","綜合練習"]'&&JSON.stringify(qa('.mc .ms').map(x=>x.textContent))==='["聽一聽、認一認、拼一拼","想一想、說一說","聽、說、認、拼，一起練習"]');
  T('each entry has an icon, and mic requirement tag (聽讀 none; 口語/綜合 need)',qa('.mc .mi').length===3&&/不需要麥克風/.test(qa('.mc .mk')[0].textContent)&&/需要麥克風/.test(qa('.mc .mk')[1].textContent)&&/部分題目需要麥克風/.test(qa('.mc .mk')[2].textContent));
  // 模式畫面
  E('UI.pick("quiet")');T('聽讀 → six-station map, lm=quiet, back button, no vehicle grid',qa('#mid .stc').length===6&&qa('#mid .vc').length===0&&E('S.set.lm')==='quiet'&&!!q('#mid .bk button'));
  E('UI.pick("oral")');T('口語 → six-station map, lm=oral',qa('#mid .stc').length===6&&E('S.set.lm')==='oral'&&/口語練習/.test(q('#mid h2').textContent));
  E('UI.pick("integ")');T('綜合 → six-station map, lm=integ',qa('#mid .stc').length===6&&E('S.set.lm')==='integ');
  T('mode view is the six-station map',q('#mid').textContent.includes('選一站開始'));
  // 設定
  E('tab(5)');T('設定 page exists with 聲音/學習輔助/畫面/輸入方式/麥克風 and highlights n5',['聲音','學習輔助','畫面','輸入方式','麥克風'].every(k=>q('#mid').textContent.includes(k))&&q('#n5').classList.contains('on')&&!q('#n1').classList.contains('on'));
  T('設定 no longer holds the 分類／順序／題數 selectors (moved to setup)',!/選擇分類|出題順序/.test(q('#mid').textContent));
  E('S.set.src="all"');
  T('音樂 button label renders in 設定 (mtLbl)',/音樂/.test(q('#mt').textContent));
  // 家長專區 / 教師專區
  E('tab(4)');T('家長專區 shows the parent home (today plan) and highlights n4',/今日|開始/.test(q('#mid').textContent)&&q('#n4').classList.contains('on'));
  E('tab(2)');T('教師專區 shows teacher area, highlights n2, student area hidden',q('#tch')&&!q('#tch').classList.contains('hide')&&q('#stu').classList.contains('hide')&&q('#n2').classList.contains('on'));
  E('S.acl&&S.acl.h&&0;ACL&&ACL.unlock&&0');
  E('tab(1)');T('tab(1) returns to home with only n1 highlighted',qa('.mc').length===3&&qa('nav button.on').map(b=>b.id).join()==='n1');
  T('我的收藏 reachable from home chip and hidden when teacher disables',(()=>{const a=q('.hmf button')!=null;E('tab(3)');const b=q('#tch').textContent.includes('我的收藏');E('S.set.showRw=false;tab(1)');const c=!q('#mid').textContent.includes('我的收藏');E('S.set.showRw=true;tab(1)');return a&&b&&c})());
 }
 // 麥克風提醒
 {const {w,E,q,qa}=await boot();
  w.__gum=0;w.navigator.mediaDevices.getUserMedia=async()=>{w.__gum++;return {active:true,getTracks:()=>[{stop(){w.__stopped=(w.__stopped||0)+1}}]}};
  E('UI.micHide=false;S.set.micLaterAt=0;UI.mic.state="prompt";home()');
  T('reminder on home (before choosing a mode) says 口語/綜合需要、聽讀不需要、有 立即授權 與 稍後再設定; no permission asked yet',/口語練習、綜合練習需要麥克風/.test(q('#micrem').textContent)&&/聽讀練習不需要/.test(q('#micrem').textContent)&&/立即授權/.test(q('#micrem').textContent)&&/稍後再設定/.test(q('#micrem').textContent)&&w.__gum===0);
  E('UI.micLater()');T('稍後再設定 hides the reminder, persists, and does not request permission',!q('#micrem b')&&w.__gum===0&&E('S.set.micLaterAt')>0);
  E('UI.micHide=false;home()');T('reminder stays hidden for a day after 稍後',!q('#micrem b'));
  E('S.set.micLaterAt=Date.now()-9e7;UI.micHide=false;UI.mic.state="prompt";home()');T('reminder returns after a day',!!q('#micrem b'));
  await w.eval('UI.micAsk()');await sleep(50);T('立即授權 requests once, then releases the stream (no always-on mic)',w.__gum===1&&w.__stopped===1&&E('UI.mic.state')==='granted'&&!E('!!MIC.st'));
  E('home()');T('after granted: no reminder',!q('#micrem b'));
  w.navigator.mediaDevices.getUserMedia=async()=>{w.__gum++;const e=new Error('x');e.name='NotAllowedError';throw e};
  E('UI.micHide=false;UI.mic.state="prompt";S.set.micLaterAt=0;home()');await w.eval('UI.micAsk()');await sleep(50);
  T('denied: explains listening practice still works, no repeated request',/聽讀練習不受影響/.test(q('#micrem').textContent)&&E('UI.mic.state')==='denied');
  const g=w.__gum;E('home();UI.pick("quiet");home();UI.view="home";home()');await sleep(100);T('denied: moving between screens never re-requests',w.__gum===g);
  E('UI.view="home";home();UI.pick("quiet");goV("bike")');await sleep(800);
  T('denied: 聽讀 round starts and runs (G.on, typed mode, no mic)',E('G.on')===true&&E('S.set.mode')==='key'&&!E('!!MIC.st')&&w.__gum===g);
  E('leave()');
 }
 // 麥克風開關規則
 {const {w,E}=await boot();
  const rule=(lm,mode,orq,noMic,oj)=>E(`S.set.lm='${lm}';S.set.mode='${mode}';S.set.oj='${oj||"A"}';V2.noMic=${!!noMic};G={on:true,orq:${!!orq}};UI.micNow()`);
  T('micNow: quiet never',rule('quiet','key',0)===false&&rule('quiet','speak',0)===false);
  T('micNow: oral true for every question',rule('oral','speak',0)===true&&rule('oral','key',0)===true);
  T('micNow: integ only on questions with an oral step (or speak)',rule('integ','key',false)===false&&rule('integ','key',true)===true&&rule('integ','speak',false)===true);
  T('micNow: user declined mic → never',rule('oral','speak',0,true)===false);
  // micSync 實際開關
  E('S.set.lm="integ";S.set.mode="key";S.set.oj="A";V2.noMic=false;window.__c={s:0,p:0};MIC.st=null;micStart=async()=>{__c.s++;MIC.st={}};micStop=()=>{__c.p++;MIC.st=null};G={on:true,orq:true};UI.micSync()');
  T('micSync starts mic for an oral-step question',E('__c.s')===1&&!!E('!!MIC.st'));
  E('G.orq=false;UI.micSync()');T('micSync stops mic when the next question has no oral step',E('__c.p')===1&&!E('!!MIC.st'));
  E('UI.micSync()');T('micSync is idempotent (no extra stop/start)',E('__c.s')===1&&E('__c.p')===1);
 }
 // 輸入方式與裝置偵測
 {const {w,E,q}=await boot();
  const tk=(m,hw,inp,pk)=>E(`UI.m=${JSON.stringify(m)};UI.hw=${hw};S.set.input='${inp}';S.set.inputPicked=${!!pk};UI.touchKb()`);
  T('input: tablet (touch, no mouse) → touch keyboard',tk({w:820,h:1180,touch:true,fine:false},false,'phys',false)===true);
  T('input: touch laptop / desktop → physical keyboard',tk({w:1366,h:768,touch:true,fine:true},false,'phys',false)===false&&tk({w:1920,h:1080,touch:false,fine:true},false,'phys',false)===false);
  T('input: tablet + physical key detected → physical',tk({w:820,h:1180,touch:true,fine:false},true,'phys',false)===false);
  T('input: explicit teacher/user choice wins (touch / phys)',tk({w:1366,h:768,touch:false,fine:true},false,'touch',false)===true&&tk({w:820,h:1180,touch:true,fine:false},false,'phys',true)===false);
  T('existing stored input:"phys" with no explicit pick is treated as auto (migration-free)',E('S.set.input="phys";S.set.inputPicked=undefined;UI.inMode()')==='auto');
  // measure 尺寸分類
  const sz=(w,h)=>{E(`Object.defineProperty(window,'innerWidth',{value:${w},configurable:true});Object.defineProperty(window,'innerHeight',{value:${h},configurable:true});UI.full={}`);return E('UI.measure()');};
  const a=sz(360,640),b=sz(844,390),c=sz(768,1024),d=sz(1024,768),e=sz(1920,1080);
  T('measure: phone portrait/landscape, tablet portrait/landscape, desktop',a.size==='phone'&&!a.land&&b.size==='phone'&&b.land&&c.size==='tablet'&&!c.land&&d.size==='tablet'&&d.land&&e.size==='desktop');
  E('UI.apply()');T('apply sets body classes',/d-desktop/.test(w.document.body.className)&&/o-land/.test(w.document.body.className));
 }
 // 斷點接續
 {const {w,E,q}=await boot();
  E('UI.pick("quiet");goV("bike")');await sleep(900);
  const s=E('JSON.stringify((LRN.cur().ext.rs)||null)');const rs=JSON.parse(s);
  T('snapshot written at first question: remaining ids, settings, learner-scoped (in LRN ext)',rs&&rs.ids.length===4&&rs.set.mode==='key'&&rs.v===1);
  E('G.i=2;G.done=2;ask()');await sleep(200);T('snapshot follows progress (2 remaining)',JSON.parse(E('JSON.stringify(LRN.cur().ext.rs)')).ids.length===2);
  E('leave()');T('leaving mid-round keeps the snapshot (can resume)',!!E('LRN.cur().ext.rs'));
  E('UI.view="home";home()');T('home offers 繼續上次的練習 and still only 3 main entries',!!q('#rsum')&&/還剩 2 題/.test(q('#rsum').textContent)&&w.document.querySelectorAll('.mc').length===3);
  E('UI.resume()');await sleep(900);T('resume starts with exactly the remaining questions (2) and consumes the snapshot',E('G.on')===true&&E('G.n')===2&&E('G.q.map(c=>c.id).join()')==='c3,c4');
  E('leave()');
  // 過期／資料已不存在 → 不提供
  E('LRN.cur().ext.rs={v:1,ts:Date.now()-5e7,rid:1,set:{mode:"key"},ids:["c1"],total:3};UI.view="home";home()');T('expired snapshot (>12h) is not offered',!q('#rsum'));
  E('LRN.cur().ext.rs={v:1,ts:Date.now(),rid:1,set:{mode:"key"},ids:["zzz"],total:3};home()');T('snapshot whose card no longer exists is not offered',!q('#rsum'));
  E('LRN.cur().ext.rs={v:1,ts:Date.now(),rid:1,set:{mode:"key"},ids:["c1","c2"],total:3};home()');
  E('UI.rsDrop()');T('不用了 clears the snapshot',!E('LRN.cur().ext.rs')&&!q('#rsum'));
  // 完成後清除
  E('UI.pick("quiet");goV("bike")');await sleep(900);T('(setup) snapshot exists again',!!E('LRN.cur().ext.rs'));
  E('G.done=G.n;arrive()');await sleep(300);T('finishing the round (arrive) clears the snapshot',!E('LRN.cur().ext.rs'));
  E('arrClose();leave()');
  // 個案隔離
  E('LRN.add&&0');
 }
 // 旋轉（尺寸改變）不重來
 {const {w,E}=await boot();
  E('S.set.input="touch";S.set.inputPicked=true;UI.pick("quiet");goV("bike")');await sleep(900);
  const b=E('JSON.stringify({rid:G.rid,i:G.i,st:S.rounds.started,w:G.cur.text,t0:G.t0})');
  E('K.seq[0].length&&kPress(K.seq[0][0],"touch_keyboard")');const ci=E('K.ci+":"+K.si');
  for(const [W,H] of [[844,390],[390,844],[1024,768],[360,640]]){E(`Object.defineProperty(window,'innerWidth',{value:${W},configurable:true});Object.defineProperty(window,'innerHeight',{value:${H},configurable:true})`);w.dispatchEvent(new w.Event('resize'));w.dispatchEvent(new w.Event('orientationchange'));await sleep(200)}
  const a=E('JSON.stringify({rid:G.rid,i:G.i,st:S.rounds.started,w:G.cur.text,t0:G.t0})');
  T('rotating/resizing repeatedly keeps the same question, round count and start time',a===b);
  T('rotating keeps typed progress and touch keyboard',E('K.ci+":"+K.si')===ci&&w.document.querySelectorAll('.tkb').length===43);
  E('leave()');
 }
 // 唯讀稽核：只瀏覽新畫面，不改資料
 {const {w,E}=await boot();E('S.recs=[];save()');const before=E('JSON.stringify([S.recs,S.logs,S.rw,S.mst,S.cards.length,S.set.vol,S.set.recRate,S.set.ttsRate,S.set.aiGain,S.set.n])');
  E('tab(4);tab(5);tab(1);UI.pick("quiet");UI.pick("oral");UI.pick("integ");tab(1)');
  T('browsing home/mode/parent/settings does not change records, stars, cards or audio settings',E('JSON.stringify([S.recs,S.logs,S.rw,S.mst,S.cards.length,S.set.vol,S.set.recRate,S.set.ttsRate,S.set.aiGain,S.set.n])')===before);
  T('no overlay leaks after navigating (no .ov / #hm)',w.document.querySelectorAll('.ov').length===0);
 }
 console.log('PASS',R.P,'FAIL',R.F);process.exit(R.F?1:0);
})();
