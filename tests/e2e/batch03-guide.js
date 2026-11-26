// v22.4 第03批：設定畫面簡化、單一步驟逐音引導、聲調播國字讀音、語音佇列（Chromium 模擬）
// 注意：音訊以測試替身記錄「程式要求播放的內容與順序」，不是真實喇叭輸出；真機聽感需另行驗收。
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const URL='http://localhost:'+(process.env.E2E_PORT||8124)+'/1124-1-TEST/';let P=0,F=0;
const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
const STUB=fs.readFileSync(path.join(__dirname,'lib','audio-stub.js'),'utf8');
const open=async(b,vp)=>{const ctx=await b.newContext({viewport:vp||{width:1280,height:800}});await ctx.addInitScript({content:STUB});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(URL);await p.waitForFunction(()=>typeof S!=='undefined'&&S.cards&&typeof LIB!=='undefined'&&LIB.base&&S.lrn&&typeof ZG!=='undefined',null,{timeout:60000});await p.waitForTimeout(1500);
 await p.evaluate(()=>{window.confirm=()=>true;window.alert=()=>{};S.set.music=false;V2.prepDone=true;window.sl=ms=>new Promise(r=>setTimeout(r,ms));
  /* 只取注音、合成語音（排除鼓勵語音與引導語音）；P＝提示佇列、E＝按鍵回音 */
  window.take=()=>window.__al.splice(0).filter(x=>x.tts||/zhuyin/.test(x.a||'')).map(x=>x.tts?'T:'+x.tts:(x.tag==='E'?'e:':'p:')+x.a.replace(/^.*zy_/,'').replace('.m4a',''));
  window.go=async(text,star,st,mode)=>{const c=S.cards.find(x=>x.text===text);const m=FL.mem();m.range='pick';m.dim='theme';m.sel={theme:S.cats.filter(k=>k.lib&&!k.lvl).map(k=>k.id),level:[],custom:[]};m.cat='sel';m.w=5;delete m.wcOn;m.star[(mode||'quiet')+':'+(st||2)]=star;UI.mode=mode||'quiet';FL.open(st||2);FL.go();AM.stop();ZQ.stop();G.q[G.i]=c;window.__al.length=0;ask();await sl(2300);return take()};
  window.press=async(k,ms)=>{kPress(k,'physical_keyboard');await sl(ms==null?900:ms);return take()};
  window.stopG=()=>{try{if(G.on){G.on=false;FL.end()}}catch(e){}AM.stop()}});return{ctx,p,errs}};
(async()=>{const b=await chromium.launch();
 /* ===== 一、設定畫面 ===== */
 {const c=await open(b);const r=await c.p.evaluate(()=>{const out=[];for(const md of ['quiet','oral','integ'])for(let st=1;st<=6;st++){UI.mode=md;FL.open(st);const t=document.getElementById('mid').innerText,h=document.getElementById('mid').innerHTML;
   const i1=t.indexOf('挑戰難度'),i2=t.indexOf('練習範圍'),i4=t.indexOf('本次練習數量'),i5=t.indexOf('開始練習');out.push({md,st,sum:/本次學習任務|實際遊戲題數|符合這個難度的可用詞彙/.test(t),order:i1>=0&&i1<i2&&i2<i4&&i4<i5,btn:!!document.getElementById('fl_go'),ok:FL.cur().chk.ok,warn:/目前無法開始/.test(t)})}return out});
  T('S1 六站×三模式（18 個設定畫面）都沒有「本次學習任務」摘要',r.length===18&&r.every(x=>!x.sum),r.filter(x=>x.sum));
  T('S2 順序為 難度→練習範圍→（選擇教材）→練習數量→開始練習',r.every(x=>x.order&&x.btn),r.filter(x=>!x.order));
  T('S3 無法開始的設定仍顯示原因（例如第3～6站沒有教材）',r.filter(x=>!x.ok).every(x=>x.warn)&&r.some(x=>!x.ok),r.filter(x=>!x.ok&&!x.warn));
  const s=await c.p.evaluate(async()=>{UI.mode='quiet';FL.open(1);FL.setRange('pick');FL.setDim('level');FL.selNone('level');const lv=S.cats.find(k=>k.lvl).id;FL.togCat('level',lv,true);FL.setW(10);const t=document.getElementById('mid').innerText;
   const sel=/選擇教材/.test(t);FL.go();await sl(300);const r={sel,on:G.on,snap:SNAP.on(),cats:SNAP.s&&SNAP.s.cats,want:SNAP.s&&SNAP.s.want,lv,n:G.q.length,inLv:G.q.every(q=>q.cats.includes(lv))};stopG();return r});
  T('S4 四項設定（難度、範圍、選擇教材、數量）都能用，直接開始練習',s.sel&&s.on&&s.n>=10&&s.inLv,s);T('S5 移除摘要後，內部練習快照 SNAP 仍記錄範圍與數量',s.snap&&s.want===10&&JSON.stringify(s.cats)===JSON.stringify([s.lv]),s);
  const m=await c.p.evaluate(()=>{const d=document.createElement('div');UI.mode='quiet';FL.open(2);return document.documentElement.scrollWidth<=innerWidth+1});
  await c.p.setViewportSize({width:390,height:844});const m2=await c.p.evaluate(()=>{UI.mode='quiet';FL.open(2);return document.documentElement.scrollWidth<=innerWidth+1});
  T('S6 電腦與手機寬度下設定畫面沒有橫向溢出',m&&m2,{m,m2});await c.ctx.close()}
 /* ===== 二、逐音引導：葡萄、棉被（一星：完整逐步引導） ===== */
 {const c=await open(b);const r=await c.p.evaluate(async()=>{const L={};L.start=await go('葡萄',1);
   L.p=await press('ㄆ');L.wrong=await press('ㄉ');L.u=await press('ㄨ');L.wt=await press('ˇ');L.t2=await press('ˊ');L.t=await press('ㄊ');L.ao=await press('ㄠ');L.end=await press('ˊ',1800);
   const lg=S.logs[S.logs.length-1];return{L,lv:ZG.level(),zg:lg&&lg.v2&&lg.v2.zg,h:lg&&lg.h,cat:lg&&lg.cat,tries:lg&&lg.tries}});const L=r.L;
  T('G1 題目開始：只念「葡萄」再提示第一個注音「ㄆ」（不念整串）',JSON.stringify(L.start)==='["T:葡萄","p:p"]',L.start);
  T('G2 輸入ㄆ正確 → 只提示下一個「ㄨ」',JSON.stringify(L.p)==='["e:p","p:u"]',L.p);
  T('G3 按錯ㄉ → 先念按錯的ㄉ，再提示正確的ㄨ',JSON.stringify(L.wrong)==='["e:d","p:u"]',L.wrong);
  T('G4 下一個是聲調 → 播「葡」的讀音（不是「二聲」）',JSON.stringify(L.u)==='["e:u","T:葡"]',L.u);
  T('G5 聲調按錯 → 重播「葡」的讀音',JSON.stringify(L.wt)==='["T:葡"]',L.wt);
  T('G6 聲調正確後不再念「葡」，直接提示下一個字的「ㄊ」',JSON.stringify(L.t2)==='["p:t"]',L.t2);
  T('G7 ㄊ→ㄠ→「萄」讀音',JSON.stringify(L.t)==='["e:t","p:ao"]'&&JSON.stringify(L.ao)==='["e:ao","T:萄"]',{t:L.t,ao:L.ao});
  T('G8 整個詞完成 → 念「葡萄」並給成功回饋',L.end[0]==='T:葡萄',L.end);
  const all=Object.values(L).flat();T('G9 全程沒有念任何聲調名稱',!all.some(x=>/聲/.test(x)),all);
  /* 第 2 次答錯時，既有的「加油＋部分注音提示」會自動顯示一段注音（原有機制，計入 h.p）；逐音語音引導本身不計入 */
T('G10 逐音語音引導另記在 v2.zg（下一個 5 次、錯誤後提示 2 次），不增加完整提示或逐字提示',r.h&&r.h.f===0&&r.h.c===0&&r.h.w===0&&r.zg&&r.zg.lv==='full'&&r.zg.next>=5&&r.zg.fix===2,r);
  const m=await c.p.evaluate(async()=>{stopG();const L={};L.s=await go('棉被',1);for(const k of ['ㄇ','ㄧ','ㄢ','ˊ','ㄅ','ㄟ'])L[k]=await press(k);L.end=await press('ˋ',1800);return L});
  T('G11 棉被：棉被→ㄇ→ㄧ→ㄢ→「棉」→ㄅ→ㄟ→「被」→棉被',JSON.stringify(m.s)==='["T:棉被","p:m"]'&&m['ㄇ'][1]==='p:i'&&m['ㄧ'][1]==='p:an'&&m['ㄢ'][1]==='T:棉'&&JSON.stringify(m['ˊ'])==='["p:b"]'&&m['ㄅ'][1]==='p:ei'&&m['ㄟ'][1]==='T:被'&&m.end[0]==='T:棉被',m);
  /* 五種聲調：腳踏車（三聲、四聲、一聲）、杯子（輕聲） */
  const t=await c.p.evaluate(async()=>{stopG();const L={};L.s=await go('腳踏車',1);for(const k of ['ㄐ','ㄧ','ㄠ','ˇ','ㄊ','ㄚ','ˋ','ㄔ','ㄜ'])L[k]=await press(k);const cell=document.getElementById('z2_2');L.cell=cell?{ok:cell.classList.contains('ok'),txt:cell.textContent}:null;
   L.sp=await press(' ',300);const cell2=document.getElementById('z2_2');L.cell2=cell2?{ok:cell2.classList.contains('ok'),txt:cell2.textContent}:null;await sl(1600);L.end=take();return L});
  /* 「車」單獨有 ㄔㄜ／ㄐㄩ 兩種讀音，合成語音單念一個字可能念錯 → 改念整個詞（在語境中聽到正確讀音），並列入補錄清單 */
T('G12 三聲（腳）、四聲（踏）、一聲（車）聲調前都播讀音；多音字「車」改念整個詞以確保讀音正確',t['ㄠ'][1]==='T:腳'&&t['ㄚ'][1]==='T:踏'&&t['ㄜ'][1]==='T:腳踏車',t);
  T('G13 一聲用空白鍵完成；方格變成正確狀態但不顯示符號',t.cell2&&t.cell2.ok&&t.cell2.txt==='',t.cell2);
  const n=await c.p.evaluate(async()=>{stopG();const L={};L.s=await go('杯子',1);L.seq=JSON.stringify(K.seq);for(const k of ['ㄅ','ㄟ',' '])L[k]=await press(k);L.z=await press('ㄗ');L.end=await press('˙',1800);return L});
  T('G14 輕聲：先打ㄗ、最後打輕聲；聲調前播整個詞「杯子」（單字合成語音無法念出輕聲）',n.seq==='[["ㄅ","ㄟ"," "],["ㄗ","˙"]]'&&n.z[1]==='T:杯子'&&n.end[0]==='T:杯子',n);
  T('G15 沒有頁面錯誤',c.errs.length===0,c.errs);await c.ctx.close()}
 /* ===== 三、依星級的引導程度 ===== */
 {const c=await open(b);const r=await c.p.evaluate(async()=>{ZG.idleMs=(o=>()=>o()?1800:0)(ZG.idleMs);const o={};
   o.s2=await go('葡萄',2);o.s2p=await press('ㄆ');stopG();
   o.s3=await go('葡萄',3);o.s3p=await press('ㄆ',400);await sl(1900);o.s3idle=take();stopG();
   o.s4=await go('葡萄',4);await sl(1500);o.s4idle=take();V2.replay();await sl(1200);o.s4rep=take();stopG();
   o.s5=await go('葡萄',5);o.mode5=S.set.mode;V2.replay();await sl(900);o.s5r1=take();V2.replay();await sl(900);o.s5r2=take();V2.replay();await sl(1200);o.s5r3=take();stopG();return o});
  T('L1 二星：開始時念詞再提示第一個注音；正確後提示下一個',JSON.stringify(r.s2)==='["T:葡萄","p:p"]'&&r.s2p[1]==='p:u',r);
  T('L2 三星：開始只念詞；正確後不自動提示；停一下才提示目前一個注音',JSON.stringify(r.s3)==='["T:葡萄"]'&&JSON.stringify(r.s3p)==='["e:p"]'&&JSON.stringify(r.s3idle)==='["p:u"]',r);
  T('L3 四星：只念詞、停頓不自動提示；按「再聽一次」念詞＋目前一個注音',JSON.stringify(r.s4)==='["T:葡萄"]'&&r.s4idle.length===0&&JSON.stringify(r.s4rep)==='["T:葡萄","p:p"]',r);
  T('L4 五星（聽音打字）：只念詞；第 1 次「再聽一次」只念詞，第 2 次起才加目前一個注音',r.mode5==='listen'&&JSON.stringify(r.s5)==='["T:葡萄"]'&&JSON.stringify(r.s5r1)==='["T:葡萄"]'&&JSON.stringify(r.s5r2)==='["T:葡萄","p:p"]'&&JSON.stringify(r.s5r3)==='["T:葡萄","p:p"]',r);
  await c.ctx.close()}
 /* ===== 四、停頓、快速輸入、重疊 ===== */
 {const c=await open(b);const r=await c.p.evaluate(async()=>{const im=ZG.idleMs;ZG.idleMs=()=>1500;const o={};o.s=await go('葡萄',1);await sl(1300);o.i1=take();await sl(1750);o.i2=take();await sl(100);o.cue=!!document.querySelector('.zs.zgcue');await sl(1700);o.i3=take();await sl(2200);o.i4=take();ZG.idleMs=im;
   o.tries=G.tries;o.h=JSON.stringify(G.h);stopG();
   window.__ov=0;const im2=ZG.idleMs;ZG.idleMs=()=>0;o.f0=await go('葡萄',1);kPress('ㄆ','physical_keyboard');await sl(40);kPress('ㄨ','physical_keyboard');await sl(40);kPress('ˊ','physical_keyboard');await sl(1200);o.fast=take();o.ov=window.__ov;ZG.idleMs=im2;stopG();return o});
  T('I1 停頓時只重播目前一個注音（不念整串），最多 3 次',JSON.stringify(r.s)==='["T:葡萄","p:p"]'&&JSON.stringify(r.i1)==='["p:p"]'&&JSON.stringify(r.i2)==='["p:p"]'&&JSON.stringify(r.i3)==='["p:p"]'&&r.i4.length===0,r);
  T('I2 第 2 次起目前方格閃爍提示（不顯示答案）；停頓不扣星、不算錯',r.cue&&r.tries===0&&r.h==='{"w":0,"c":0,"p":0,"f":0}',r);
  T('Q1 快速輸入：過時的提示被取消，只留下目前有效的提示（下一個字的ㄊ）',r.fast.filter(x=>x[0]==='p'||x[0]==='T').join()==='p:t'&&!r.fast.includes('p:u'),r.fast);
  T('Q2 提示與按鍵回音沒有同時重疊播放',r.ov===0,r.ov);await c.ctx.close()}
 /* ===== 五、播放失敗備援、再聽一次、換題與離開 ===== */
 {const c=await open(b);const r=await c.p.evaluate(async()=>{const o={};window.__failTts=1;o.s=await go('葡萄',1);o.msg=(document.getElementById('msg')||{}).textContent;o.lock=G.lock;o.p=await press('ㄆ');o.ci=K.si;o.tries=G.tries;window.__failTts=0;
   window.__failAudio=1;o.f=await press('ㄨ');o.msg2=(document.getElementById('msg')||{}).textContent;window.__failAudio=0;stopG();
   o.r0=await go('葡萄',1);document.getElementById('rep').click();await sl(1300);o.rep=take();
   window.__dur=4000;V2.replay();await sl(300);const id=ZQ.id;G.i++;ask();await sl(200);o.zqChanged=ZQ.id!==id;o.oldPaused=!(AM.a&&AM.a.__pl&&/葡萄/.test(''));window.__dur=180;
   await sl(2500);take();leave();await sl(2500);o.afterLeave=take();o.on=G.on;return o});
  T('B1 合成語音失敗：顯示「語音暫時無法播放」提示，不鎖住作答',/語音暫時無法播放/.test(r.msg||'')&&!r.lock,r);
  T('B2 語音異常不算答錯、不扣星（仍可繼續輸入）',r.tries===0&&r.ci===1,r);
  T('B3 注音錄音失敗也不會卡住（顯示提示、可繼續）',/語音暫時無法播放/.test(r.msg2||''),r);
  T('B4 「再聽一次」按鈕可重播（詞＋目前一個注音）',JSON.stringify(r.rep)==='["T:葡萄","p:p"]',r.rep);
  T('B5 換題時舊的播放佇列立即中止',r.zqChanged,r);T('B6 離開練習後不再播放任何提示',r.afterLeave.length===0&&!r.on,r.afterLeave);await c.ctx.close()}
 /* ===== 六、紀錄、手動提示、速度設定、教材 ===== */
 {const c=await open(b);const r=await c.p.evaluate(async()=>{const o={rate:S.set.ttsRate,rec:S.set.recRate};o.s=await go('葡萄',1);const h0=JSON.stringify(G.h);V2.replay();await sl(1300);take();kHint('p');await sl(400);o.hp=G.h.p;o.h0=h0;
   for(const k of ['ㄆ','ㄨ','ˊ','ㄊ','ㄠ'])await press(k,300);await press('ˊ',1800);const lg=S.logs[S.logs.length-1];o.cat=lg.cat;o.lvl=lg.lvl;o.zg=lg.v2.zg;o.evs=lg.evs.length;stopG();
   const oo=S.set.src;S.set.src='all';o.pool=deck().cards.length;S.set.src=oo;o.src=[SRC.on('legacy'),SRC.on('custom')];o.ver=APP.build;return o});
  T('R1 手動「注音提示」仍照原規則記錄為學生提示（與自動引導分開）',r.h0==='{"w":0,"c":0,"p":0,"f":0}'&&r.hp===1&&r.cat==='zy'&&r.zg&&r.zg.lv==='full',r);
  T('R2 按鍵紀錄（evs）照常保存',r.evs>=6,r.evs);
  T('R3 AI 語音 0.75 倍、真人錄音 1.25 倍（舊版教材設定不再覆蓋成 0.5 倍）',r.rate===0.75&&r.rec===1.25,r);
  T('R4 第01、02批不受影響：正式教材 950 個可練習、舊版與自訂預設不使用、版本 v22.4 以後',r.pool===950&&!r.src[0]&&!r.src[1]&&/^v22\.4(\.\d+)?$/.test(r.ver),r);
  await c.ctx.close()}
 await b.close();console.log('PASS',P,'FAIL',F);process.exit(F?1:0)})();
