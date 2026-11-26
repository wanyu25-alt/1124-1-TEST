// v22.5 第04批：口語練習、語音辨識、麥克風及過關機制（Chromium／WebKit 模擬；不是真機、不是真的麥克風與辨識引擎）
// 從學生端首頁實際點擊進入。麥克風訊號由 lib/mic-stub.js 以 Web Audio 產生（模擬人聲／噪音／無聲），辨識結果由替身送出；
// 聲音播放由 lib/audio-stub.js 記錄（不是喇叭的真實聲音）。瀏覽器：E2E_BROWSER=chromium（預設）或 webkit。
const pw=require('playwright');const fs=require('fs'),path=require('path');
const BR=process.env.E2E_BROWSER||'chromium',URL='http://localhost:'+(process.env.E2E_PORT||8124)+'/1124-1-TEST/';let P=0,F=0;
const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL','['+BR+']',n,c?'':JSON.stringify(x===undefined?null:x).slice(0,600))};
const AS=fs.readFileSync(path.join(__dirname,'lib','audio-stub.js'),'utf8'),MS=fs.readFileSync(path.join(__dirname,'lib','mic-stub.js'),'utf8');
const ready=async p=>{await p.waitForFunction(()=>typeof S!=='undefined'&&S.cards&&S.cards.length>=1000&&S.lrn&&typeof MV!=='undefined',null,{timeout:60000});await p.waitForTimeout(1200);
 await p.evaluate(()=>{window.confirm=()=>true;window.alert=()=>{};window.sl=ms=>new Promise(r=>setTimeout(r,ms));
  window.W=text=>S.cards.find(x=>x.text===text&&x.lib);
  /* 把目前這一題換成指定詞彙（仍走正常出題流程 ask()） */
  window.toWord=async(text,ms)=>{const c=W(text);const cur=G.q[G.i]||{};G.q[G.i]={...c,_step:cur._step,_sub:cur._sub};AM.stop();ZQ.stop();G.okFor=null;G.lock=false;ask();await sl(ms==null?2600:ms)};
  window.st=()=>({mode:S.set.mode,lock:G.lock,on:G.on,i:G.i,cur:G.cur&&G.cur.text,mic:!!(MIC.st&&MIC.st.active),micState:MIC.state,bx:($('#micbox')||{dataset:{}}).dataset.v||null,wst:($('#wst')||{}).textContent||'',msg:($('#msg')||{}).textContent||'',
   bars:[...document.querySelectorAll('#wave i')].map(b=>parseFloat(b.style.height)||0),asrOn:ASR.on,srOn:window.__sr.filter(r=>r.on).length,mhold:mus.hold,musicOn:MV.musicOn()});
  window.lastRec=()=>S.recs[S.recs.length-1]})};
const open=async(b,o={})=>{const ctx=await b.newContext({viewport:{width:1280,height:900}});await ctx.addInitScript({content:AS});await ctx.addInitScript({content:MS+(o.deny?';window.__micDeny=1;':'')+(o.init||'')});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(URL);await ready(p);if(o.pre)await p.evaluate(o.pre);return{ctx,p,errs}};
/* 首頁 → 學習模式 → 第 st 站 → 星級 → 範圍（rec＝系統推薦，sel＝自行選擇教材）→ 開始 → 裝置準備 */
const uiStart=async(p,o)=>{const mode=o.mode||'oral';await p.locator(`[onclick="UI.pick('${mode}')"]`).click();await p.waitForTimeout(400);await p.locator(`[onclick="FL.open(${o.st||2})"]`).first().click();await p.waitForTimeout(400);
 await p.locator('.fstar').nth((o.star||3)-1).click();await p.waitForTimeout(150);
 if((o.range||'sel')==='sel')await p.getByRole('button',{name:'自行選擇教材'}).click();else await p.getByRole('button',{name:'系統推薦'}).click();await p.waitForTimeout(150);
 await p.locator('#fl_go').click();await p.waitForTimeout(900);
 if(await p.locator('#prep').count()){await p.locator('#prep button',{hasText:o.noMic?'不使用麥克風':'啟用麥克風並開始'}).click()}
 await p.waitForTimeout(o.wait==null?3500:o.wait)};
const ST=p=>p.evaluate(()=>st());
(async()=>{const b=await pw[BR].launch();
 /* ===== A：根本原因——口語練習「系統推薦」新詞只剩「聽詞認識（我知道了）」 ===== */
 {const c=await open(b);const home=async()=>{await c.p.locator('button:visible',{hasText:'首頁'}).first().click();await c.p.waitForTimeout(500);await c.p.locator('#hm button',{hasText:'返回首頁'}).click();await c.p.waitForTimeout(800)};
  const qOf=()=>c.p.evaluate(()=>{const ids=[...new Set(G.q.map(x=>x.id))];return{steps:G.q.map(x=>x._step).join(','),noSpeak:ids.filter(id=>!G.q.some(x=>x.id===id&&x._step==='speak')).length,ids:ids.length}});
  /* 第一次練習（新學生的「起點」回合）之後，再從首頁開始：問題出現在第二次以後的新詞 */
  await uiStart(c.p,{st:2,star:1,range:'rec',wait:2500});await home();
  await uiStart(c.p,{st:2,star:1,range:'rec',wait:2500});const q=await qOf();
  T('A1 口語練習一星（先聽示範再說，系統推薦）：每個新詞都有口說步驟，不會整回合只有「我知道了」',q.ids>0&&q.noSpeak===0,q);
  const e0=await ST(c.p);if(e0.mode==='expose'){await c.p.locator('button',{hasText:'我知道了'}).first().click();await c.p.waitForTimeout(3200)}
  const s1=await ST(c.p);T('A2 「我知道了」之後進入口說：出現聲波區、語音辨識已啟動',s1.mode==='speak'&&s1.bx!==null&&s1.bars.length===9&&s1.srOn===1,s1);
  const sd=await c.p.evaluate(()=>{const it=G.q[G.i];return{demo:!!(it&&it._demo),step:it&&it._step}});
  T('A3 新詞「先聽示範再說」的口說步驟標記為示範後仿說（不算自主提取）',sd.step==='speak'&&sd.demo,sd);
  /* 「中途離開」本來就會把當時的詞放進錯題集（既有設計），這裡暫時排除離開紀錄，只檢查「我知道了」本身的影響 */
  const lg=await c.p.evaluate(()=>{const id=(S.expLogs||[]).map(l=>l.cid).pop(),qs=S.quits;S.quits=[];const mist=id?mistakeCards().some(c=>c.id===id):null;S.quits=qs;return{inLogs:S.logs.filter(l=>l.mode==='expose').length,exp:(S.expLogs||[]).length,recs:S.recs.filter(r=>r.game==='expose').length,
   mist,mast:id?mastered(id):null,rv:id&&S.rv[id]?S.rv[id].exposed:null}});
  T('A4 「我知道了」只記為「聽過」：不寫入作答紀錄、不算獨立完成、不算已熟悉、不進錯題集',lg.inLogs===0&&lg.exp>=1&&lg.recs===0&&lg.mist===false&&lg.mast===false&&lg.rv>=1,lg);
  await home();await uiStart(c.p,{st:2,star:2,range:'rec',wait:2500});const q2=await qOf();
  T('A5 口語練習二星（看圖說詞，系統推薦）：每個詞彙也都有口說步驟',q2.ids>0&&q2.noSpeak===0,q2);
  await c.ctx.close()}
 /* ===== B：聲波來自真實麥克風訊號、狀態分明 ===== */
 {const c=await open(b);await uiStart(c.p,{st:2,star:3});await c.p.evaluate(()=>toWord('葡萄'));
  const q0=await ST(c.p);T('B1 安靜時：顯示「正在聆聽」，聲波平穩（不是假的跳動動畫）',q0.mode==='speak'&&q0.bx==='listen'&&/聆聽|說/.test(q0.wst)&&Math.max(...q0.bars)<=25,q0);
  await c.p.evaluate(()=>__mic.voice(.3));await c.p.waitForTimeout(900);const v=await ST(c.p);
  T('B2 說話時：狀態「偵測到聲音」，聲波依實際音量升高',v.bx==='voice'&&/聲音|聽/.test(v.wst)&&Math.max(...v.bars)>40&&v.micState==='speaking',v);
  await c.p.evaluate(()=>__mic.voice(0));await c.p.waitForTimeout(2600);const v2=await ST(c.p);
  T('B3 停止說話後：聲波回到平穩、題目沒有被判對或判錯',Math.max(...v2.bars)<=25&&!v2.lock&&v2.mode==='speak',v2);
  await c.p.evaluate(()=>__say(G.cur.text.slice(0,1),false));await c.p.waitForTimeout(150);const pr=await ST(c.p);
  T('B4 收到辨識中的暫時結果：狀態「正在辨識」',pr.bx==='proc'&&/辨識/.test(pr.wst),pr);
  await c.p.evaluate(()=>__say(G.cur.text,true));await c.p.waitForTimeout(250);const dn=await ST(c.p);
  T('B5 辨識成功：狀態「辨識完成」並自動過關',dn.bx==='done'&&/完成|收到/.test(dn.wst+dn.msg)&&dn.lock,dn);
  await c.p.waitForTimeout(2500);
  const r=await c.p.evaluate(()=>{const r=lastRec();return{out:r.outcome,ind:r.independent,oral:r.ext&&r.ext.oral}});
  T('B6 紀錄：A 正確辨識、獨立完成、記下嘗試次數、偵測到聲音、反應時間；沒有教師確認、沒有技術異常',r.out==='correct'&&r.ind===true&&r.oral&&r.oral.cls==='A'&&r.oral.tries>=1&&r.oral.voice===true&&r.oral.teacher===false&&r.oral.tech===false&&r.oral.skipped===false&&r.oral.rtMs>0,r);
  /* 背景音樂：口說時暫停 */
  const mu=await c.p.evaluate(()=>({hold:mus.hold,on:MV.musicOn(),set:S.set.music}));T('B7 口說題目進行中：背景音樂沒有在收音期間播放',!mu.on,mu);
  /* 返回首頁：釋放麥克風與辨識 */
  await c.p.locator('button:visible',{hasText:'首頁'}).first().click();await c.p.waitForTimeout(500);await c.p.locator('#hm button',{hasText:'返回首頁'}).click();await c.p.waitForTimeout(900);
  const h=await c.p.evaluate(()=>({mic:!!MIC.st,srOn:window.__sr.filter(r=>r.on).length,asr:ASR.on,on:G.on,hold:mus.hold}));
  T('B8 返回首頁：麥克風串流關閉、語音辨識停止、背景音樂解除暫停',!h.mic&&h.srOn===0&&!h.asr&&!h.on&&!h.hold,h);
  T('B9 沒有頁面錯誤',c.errs.length===0,c.errs);await c.ctx.close()}
 /* ===== C：答案判定 A～F ===== */
 {const c=await open(b);await uiStart(c.p,{st:2,star:3});
  const one=async(word,say,fin)=>{await c.p.evaluate(w=>toWord(w),word);await c.p.evaluate(([s,f])=>__say(s,f!==false),[say,fin]);await c.p.waitForTimeout(400);return ST(c.p)};
  let s=await one('葡萄','蒲桃');T('C1 B 合理同音（字不同、讀音與聲調都相同）：自動過關',s.lock===true,s);await c.p.waitForTimeout(2600);
  let r=await c.p.evaluate(()=>lastRec().ext.oral);T('C2 同音紀錄為 B',r&&r.cls==='B',r);
  s=await one('葡萄','撲套');T('C3 C 接近讀音（聲調不同）：不自動過關，提示再說一次或請大人確認',s.lock===false&&/接近/.test(s.msg),s);
  s=await c.p.evaluate(async()=>{__say('香蕉',true);await sl(400);return st()});T('C4 辨識到其他詞：不過關、不顯示答錯',s.lock===false&&!/答錯|錯了/.test(s.msg),s);
  await c.p.evaluate(()=>SK.mark('none'));await c.p.waitForTimeout(300);
  const one1=await c.p.evaluate(()=>{const c=S.cards.find(x=>x.lib&&[...x.text].length===1&&x.img);return c?c.text:null});
  if(one1){const near=await c.p.evaluate(t=>{const c=S.cards.find(x=>x.lib&&x.text.length>=2&&x.text.includes(t)&&x.text!==t);return c?c.text:'大'+t},one1);
   s=await one(one1,near);T('C5 單音節詞（'+one1+'）：辨識到包含它的其他詞（'+near+'）不算過關',s.lock===false,{s,near});
   s=await c.p.evaluate(async t=>{__say(t+'啊',true);await sl(400);return st()},one1);T('C6 單音節詞：只說出該詞（含語助詞）可以過關',s.lock===true,s);await c.p.waitForTimeout(2600)}
  else T('C5 找不到單音節正式詞（略過）',true);
  /* 錯誤詞與接近讀音之後由老師確認：與獨立辨識分開記錄 */
  await c.p.evaluate(()=>toWord('葡萄'));await c.p.evaluate(()=>__say('撲套',true));await c.p.waitForTimeout(400);
  await c.p.locator(`#spadult [onclick="SK.mark('correct')"]`).click();await c.p.waitForTimeout(2600);
  r=await c.p.evaluate(()=>{const r=lastRec();return{ind:r.independent,out:r.outcome,man:r.manual,oral:r.ext.oral}});
  T('C7 接近讀音後由大人按「正確說出」：記為大人確認（與電腦辨識成功分開：teacher=true、asrIndep=false、分類 C）',r.out==='correct'&&r.oral.teacher===true&&r.oral.asrIndep===false&&r.oral.cls==='C'&&r.man&&r.man.used,r);
  T('C8 沒有頁面錯誤',c.errs.length===0,c.errs);await c.ctx.close()}
 /* ===== D：低音量、無聲音、停頓、背景噪音（音量不等於答對） ===== */
 {const c=await open(b);await uiStart(c.p,{st:2,star:2});/* 二星＝逾時自動提示 */
  await c.p.evaluate(()=>toWord('棉被',2200));
  await c.p.evaluate(()=>__mic.voice(.02));await c.p.waitForTimeout(1200);let s=await ST(c.p);
  T('D1 很小聲：仍偵測到聲音（聲波有動），但不因音量就過關',s.micState==='speaking'&&Math.max(...s.bars)>12&&!s.lock,s);
  /* 停頓：說 → 停 1 秒 → 再說，期間不會被自動提示打斷 */
  await c.p.evaluate(()=>__mic.voice(.3));await c.p.waitForTimeout(1500);await c.p.evaluate(()=>__mic.voice(0));await c.p.waitForTimeout(1000);await c.p.evaluate(()=>__mic.voice(.3));await c.p.waitForTimeout(3200);
  const h=await c.p.evaluate(()=>({hints:(RE.cur&&RE.cur.hints||[]).length,lock:G.lock}));
  T('D2 說話中途停頓：說話期間不會自動跳出提示，也不會判定失敗或跳過',h.hints===0&&!h.lock,h);
  await c.p.evaluate(()=>__mic.voice(0));await c.p.waitForTimeout(6000);s=await ST(c.p);
  const r=await c.p.evaluate(()=>({tick:!!(G.sk&&G.sk.voiceNoAsr),msg:$('#msg').textContent,evs:(G.sk&&G.sk.evs||[]).map(e=>e.cls).join(',')}));
  T('D3 有聲音但沒有辨識結果：顯示「有聽到你的聲音」，不算答錯',/聽到你的聲音|再說一次|大人/.test(r.msg)&&/voice_no_asr/.test(r.evs)&&!s.lock,r);
  /* 完全不說話：等候約 10 秒才開始提示，不會跳題 */
  await c.p.evaluate(()=>toWord('葡萄',300));const t0=Date.now();await c.p.waitForTimeout(8000);const h8=await c.p.evaluate(()=>(RE.cur&&RE.cur.hints||[]).filter(x=>x.src==='auto').length);
  await c.p.waitForTimeout(5000);const h13=await c.p.evaluate(()=>({auto:(RE.cur&&RE.cur.hints||[]).filter(x=>x.src==='auto').length,on:G.on,lock:G.lock,cur:G.cur.text,evs:(G.sk&&G.sk.evs||[]).map(e=>e.cls).join(',')}));
  T('D4 完全沒有聲音：前 8 秒不打擾；之後才給提示（約 10 秒）；不會自動跳題',h8===0&&h13.on&&!h13.lock&&h13.cur==='葡萄',{h8,h13});
  /* 背景噪音（穩定噪音）不會被當成說話 */
  await c.p.evaluate(()=>__mic.noise(.03));await c.p.waitForTimeout(2500);s=await ST(c.p);
  T('D5 背景噪音：不過關、不判錯',!s.lock&&s.on,s);await c.p.evaluate(()=>__mic.noise(0));
  T('D6 沒有頁面錯誤',c.errs.length===0,c.errs);await c.ctx.close()}
 /* ===== E：麥克風拒絕、辨識服務錯誤、提前停止、重複啟動、題目切換 ===== */
 {const c=await open(b,{deny:1});await uiStart(c.p,{st:2,star:3});const s=await ST(c.p);
  const g1=await c.p.evaluate(()=>window.__gum);await c.p.evaluate(()=>toWord('棉被'));await c.p.evaluate(()=>toWord('葡萄'));const g2=await c.p.evaluate(()=>window.__gum);
  T('E1 麥克風被拒絕：顯示「麥克風異常」狀態與說明，可由大人確認',s.bx==='err'&&/麥克風/.test(s.wst+((await c.p.locator('#mnote').innerText().catch(()=>''))))&&(await c.p.locator(`#spadult [onclick="SK.mark('correct')"]`).count())===1,s);
  T('E2 被拒絕後換題：不會每題重新跳出權限詢問',g2===g1,{g1,g2});
  await c.p.locator(`#spadult [onclick="SK.mark('tech')"]`).click();await c.p.waitForTimeout(800);
  const r=await c.p.evaluate(()=>{const r=S.recs.filter(x=>x.game==='speak').pop();return r?{out:r.outcome,oral:r.ext.oral}:null});
  T('E3 技術問題：記為技術異常，不算答錯',r&&r.out!=='wrong'&&r.oral&&r.oral.tech===true&&r.oral.cls==='F',r);await c.ctx.close()}
 {const c=await open(b);await uiStart(c.p,{st:2,star:3});
  await c.p.evaluate(()=>__srErr('network'));await c.p.waitForTimeout(700);let s=await ST(c.p);
  T('E4 辨識服務錯誤（network）：顯示異常狀態，不算答錯',s.bx==='err'||/辨識/.test(s.wst+s.msg),s);
  const before=await c.p.evaluate(()=>window.__srLog.filter(x=>x.ev==='start').length);
  for(let i=0;i<5;i++){await c.p.evaluate(()=>__srEnd());await c.p.waitForTimeout(350)}
  s=await ST(c.p);const st5=await c.p.evaluate(()=>({starts:window.__srLog.filter(x=>x.ev==='start').length,gave:ASR.gave}));
  T('E5 辨識服務一直提前停止：不會無限重啟，改請按「開始聆聽」',st5.gave===true&&st5.starts-before<=5,{s,st5});
  await c.p.locator('#asrb').click();await c.p.waitForTimeout(400);await c.p.locator('#asrb').click();await c.p.waitForTimeout(400);
  const d=await c.p.evaluate(()=>({on:window.__sr.filter(r=>r.on).length,err:window.__srDup||0}));
  T('E6 連按「重新聆聽」：同時只有一個辨識工作，沒有重複啟動錯誤',d.on===1,d);
  await c.p.evaluate(()=>__say(G.cur.text,true));await c.p.waitForTimeout(3000);
  const n=await c.p.evaluate(()=>({i:G.i,on:window.__sr.filter(r=>r.on).length,mode:S.set.mode}));
  T('E7 換到下一題：仍只有一個辨識工作在執行',n.on<=1&&n.mode==='speak',n);
  const r=await c.p.evaluate(()=>S.recs.filter(x=>x.game==='speak').map(x=>x.ext.oral&&x.ext.oral.techCodes).flat().join(','));
  T('E8 技術錯誤代碼記入紀錄（network），且不影響之後的過關',/network/.test(r),r);await c.ctx.close()}
 /* ===== F：系統語音播放時不收音；「再聽一次」／完整示範後安全恢復 ===== */
 {const c=await open(b,{init:';window.__dur=900;'});await uiStart(c.p,{st:2,star:3,wait:300});
  await c.p.waitForTimeout(4500);
  const lg=await c.p.evaluate(()=>window.__srLog.filter(x=>x.ev==='start').map(x=>x.busy));
  T('F1 第一次開始辨識時，題目引導語音已經播完',lg.length>=1&&lg[0]===false,lg);
  await c.p.evaluate(()=>toWord('葡萄',2600));
  const r=await c.p.evaluate(async()=>{SK.give('P4v','button');await sl(150);const busy=MV.busy();__say('葡萄',true);await sl(300);const l1=G.lock;await sl(1500);return{busy,l1,gated:MV.cnt.gatedAsr||0}});
  T('F2 示範語音播放中：辨識到的聲音不採用（避免把系統聲音當成學生答案）',r.busy&&r.l1===false&&r.gated>=1,r);
  await c.p.evaluate(async()=>{for(let i=0;i<60&&(MV.busy()||!MV.gate()||ASR.paused||Date.now()<ASR.skipUntil);i++)await sl(100);await sl(200);__say('葡萄',true)});await c.p.waitForTimeout(2800);
  const r2=await c.p.evaluate(()=>{const r=lastRec();return{out:r.outcome,ind:r.independent,cls:r.ext.oral&&r.ext.oral.cls,hint:r.ext.oral&&r.ext.oral.hint,sk:r.ext&&r.ext.sk}});
  T('F3 示範結束後說出：可以過關，記為「提示後」而不是獨立完成',r2.out==='correct'&&r2.ind===false&&r2.hint===true,r2);
  T('F4 沒有頁面錯誤',c.errs.length===0,c.errs);await c.ctx.close()}
 /* ===== Z：麥克風串流存在、但完全收不到訊號（例如被系統占用、靜音） ===== */
 {const c=await open(b);await uiStart(c.p,{st:2,star:3});await c.p.evaluate(()=>__mic.zero(1));await c.p.waitForTimeout(4200);const s=await ST(c.p);
  T('Z1 收不到麥克風訊號：顯示「收不到麥克風的聲音」，不顯示假聲波',s.bx==='err'&&/收不到/.test(s.wst)&&Math.max(...s.bars)<=12,s);
  await c.p.evaluate(()=>__mic.zero(0));await c.p.waitForTimeout(600);const s2=await ST(c.p);T('Z2 訊號恢復後：自動回到「正在聆聽」',s2.bx==='listen',s2);await c.ctx.close()}
 /* ===== G：綜合練習口說步驟（V2）：不因停頓或沒聲音自動跳題 ===== */
 {const c=await open(b,{pre:()=>{S.set.oj='C';S.set.orQ='1,2,3,4,5';S.asrAgreed=1;save()}});await uiStart(c.p,{mode:'integ',st:2,star:4,wait:2500});
  const go=await c.p.evaluate(async()=>{if(!(G.orq||V2.lm()==='integ'))return{skip:'no orq'};G.o=G.o||{};V2.run({items:[],target:G.cur.text,kind:'word'},r=>{window.__v2res=r});await sl(1200);return{st:V2.stp&&V2.stp.state,j:V2.stp&&V2.stp.j}});
  for(let i=0;i<4;i++){await c.p.evaluate(()=>__srErr('no-speech'));await c.p.waitForTimeout(1500)}
  const g=await c.p.evaluate(()=>({res:window.__v2res||null,st:V2.stp&&V2.stp.state,miss:V2.stp&&V2.stp.miss}));
  T('G1 綜合練習口說：學生還沒開口（no-speech）不算失敗、不會自動略過',go.j==='C'&&g.res===null&&g.st&&g.st!=='stuck'&&(g.miss||0)===0,{go,g});
  await c.p.evaluate(()=>__say('香蕉',true));await c.p.waitForTimeout(1300);await c.p.evaluate(()=>__say('香蕉',true));await c.p.waitForTimeout(1300);await c.p.evaluate(()=>__say('香蕉',true));await c.p.waitForTimeout(5000);
  const g2=await c.p.evaluate(()=>({res:window.__v2res||null,st:V2.stp&&V2.stp.state}));
  T('G2 連續辨識不到：停在「請大人確認」，不會自動略過題目',g2.res===null&&g2.st==='stuck',g2);
  await c.p.evaluate(()=>V2.tc('ok'));await c.p.waitForTimeout(1200);const g3=await c.p.evaluate(()=>({res:window.__v2res,t:G.o.tconf}));
  T('G3 老師確認：記為教師確認（與辨識成功分開）',g3.res==='teacher'&&g3.t>=1,g3);
  await c.ctx.close()}
 /* ===== H：聽讀模式不要求麥克風；舊資料相容 ===== */
 {const c=await open(b);await c.p.locator(`[onclick="UI.pick('quiet')"]`).click();await c.p.waitForTimeout(400);await c.p.locator('[onclick="FL.open(2)"]').first().click();await c.p.waitForTimeout(300);
  await c.p.locator('.fstar').nth(0).click();await c.p.getByRole('button',{name:'自行選擇教材'}).click();await c.p.locator('#fl_go').click();await c.p.waitForTimeout(3000);
  const q=await c.p.evaluate(()=>({gum:window.__gum,sr:window.__sr.length,prep:!!$('#prep')}));T('H1 聽讀練習：不要求麥克風權限、不啟動語音辨識',q.gum===0&&q.sr===0&&!q.prep,q);await c.ctx.close()}
 {const c=await open(b,{pre:async()=>{const id=W('葡萄').id;S.recs.push({sv:1,id:'Rold1',itemId:id,itemKind:'word',game:'speak',outcome:'correct',independent:true,ts:Date.now()-864e5,asr:[{text:'葡萄',matched:true}],ext:{}});S.logs.push({t:Date.now()-864e5,cid:id,word:'葡萄',cat:'ind',mode:'speak',sp:{asr:1,asrOk:1}});await save()}});
  await c.p.reload();await ready(c.p);const ok=await c.p.evaluate(()=>{try{const h=typeof LA!=='undefined'&&LA.html?LA.html():'';return{n:S.recs.filter(r=>r.id==='Rold1').length,la:typeof h==='string'}}catch(e){return{err:e.message}}});
  T('H2 舊版紀錄（沒有新欄位）：讀取正常、學習分析不出錯',ok.n===1&&!ok.err,ok);
  await uiStart(c.p,{st:2,star:3});const s=await ST(c.p);T('H3 有舊紀錄的裝置：口語練習正常開始',s.mode==='speak'&&s.srOn===1,s);
  T('H4 沒有頁面錯誤',c.errs.length===0,c.errs);await c.ctx.close()}
 await b.close();console.log(`\n${BR}: ${P} 通過 / ${F} 失敗`);process.exit(F?1:0)})().catch(e=>{console.error('CRASH',e);process.exit(2)});
