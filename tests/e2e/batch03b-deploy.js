// v22.4.1 第03-B批：部署基準、舊版教材移除、materials/ 依賴、語音備援、版本識別（Chromium 模擬；不是真機、不是 Safari）
// 從學生端首頁實際點擊進入；聲音以測試替身記錄「程式要求播放什麼」，不是喇叭的真實聲音。
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const URL='http://localhost:'+(process.env.E2E_PORT||8124)+'/1124-1-TEST/';let P=0,F=0;
const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
const AS=fs.readFileSync(path.join(__dirname,'lib','audio-stub.js'),'utf8'),VS=fs.readFileSync(path.join(__dirname,'lib','voice-stub.js'),'utf8');
const ready=async p=>{await p.waitForFunction(()=>typeof S!=='undefined'&&S.cards&&S.cards.length>=1000&&S.lrn&&typeof LEG!=='undefined',null,{timeout:60000});await p.waitForTimeout(1500);
 await p.evaluate(()=>{window.confirm=()=>true;window.alert=()=>{};window.sl=ms=>new Promise(r=>setTimeout(r,ms));
  window.take=()=>window.__al.splice(0).filter(x=>x.tts||/zhuyin/.test(x.a||'')).map(x=>x.tts?'T:'+x.tts:(x.tag==='E'?'e:':'p:')+x.a.replace(/^.*zy_/,'').replace('.m4a',''))})};
const open=async(b,o={})=>{const ctx=await b.newContext({viewport:o.vp||{width:1280,height:850}});await ctx.addInitScript({content:AS});if(o.voice)await ctx.addInitScript({content:VS+';window.__dur=600;'});
 const p=await ctx.newPage();const net={mat:[],e404:[]},errs=[];p.on('request',r=>{if(/\/materials\//.test(r.url()))net.mat.push(r.url())});p.on('response',r=>{if(r.status()===404)net.e404.push(r.url())});p.on('pageerror',e=>errs.push(e.message));
 await p.goto(URL);await ready(p);return{ctx,p,net,errs}};
/* 從首頁點擊：聽讀練習 → 第2站 → 指定星級 → 自行選擇教材 → 開始練習 */
const uiStart=async(p,star)=>{await p.locator(`[onclick="UI.pick('quiet')"]`).click();await p.waitForTimeout(400);await p.locator('[onclick="FL.open(2)"]').first().click();await p.waitForTimeout(400);
 await p.locator('.fstar').nth(star-1).click();await p.getByRole('button',{name:'自行選擇教材'}).click();await p.waitForTimeout(200);const txt=await p.locator('#mid').innerText();await p.evaluate(()=>window.__al.length=0);await p.locator('#fl_go').click();return txt};
const ZKC=p=>p.evaluate(()=>{const o={};for(const[c,s]of Object.entries(ZK))o[s]=c;o[' ']='Space';return o});
(async()=>{const b=await chromium.launch();
 /* ===== A：網站載入、materials/ 依賴 ===== */
 {const c=await open(b);const h=await c.p.evaluate(()=>({home:document.body.innerText,pk:PK.state,pp:packPanel(),ver:(document.documentElement.innerHTML.match(/build:'(v[\d.]+)'/)||[])[1],id:APP.id,lib:S.cards.filter(x=>x.lib).length,th:S.cats.filter(k=>k.lib&&!k.lvl).length,lv:S.cats.filter(k=>k.lvl).length}));
  T('A1 首頁沒有「無法連到網站教材」警告；正式 1000 詞、16 主題、20 Level 正常',!/無法連到網站教材/.test(h.home)&&h.pk==='ok'&&h.lib===1000&&h.th===16&&h.lv===20,h.pk);
  await c.p.locator(`[onclick="UI.pick('quiet')"]`).click();await c.p.waitForTimeout(500);const map=await c.p.locator('#mid').innerText();
  T('A2 六站地圖正常顯示、沒有教材警告',/第 1 站/.test(map)&&/第 2 站/.test(map)&&!/無法連到網站教材/.test(map),map.slice(0,200));
  T('A3 不再請求 materials/（原本 manifest.json、pack.js 兩個 404）',c.net.mat.length===0&&c.net.e404.length===0,c.net);
  T('A4 版本（v22.4.1 以後）、建置識別碼存在；Console 版本指令可讀到版本（v22.5 起版本另由 batch04 檢查）',/^v22\.(4\.1|5(\.\d+)?)$/.test(h.ver)&&/^\d{8}-\w+$/.test(h.id),h);
  T('A5 沒有頁面錯誤',c.errs.length===0,c.errs);await c.ctx.close()}
 /* ===== B：正式詞彙庫真的讀不到時，仍顯示正確警告並可重新載入 ===== */
 {const ctx=await b.newContext();await ctx.addInitScript({content:AS});const p=await ctx.newPage();await p.goto(URL);await ready(p);await p.waitForTimeout(300);
  await ctx.route('**/vocab/vocabulary.json*',r=>r.abort());await p.reload();await p.waitForFunction(()=>typeof S!=='undefined'&&S.lrn&&typeof PK!=='undefined'&&PK.state!=='loading'&&PK.state!=='idle',null,{timeout:60000});await p.waitForTimeout(800);
  const w=await p.evaluate(()=>({t:document.body.innerText,pk:PK.state,msg:PK.msg,cards:S.cards.filter(x=>x.lib).length}));
  T('B1 正式詞彙庫讀取失敗：首頁顯示警告與原因，仍可用這台電腦已儲存的教材',/無法連到網站教材/.test(w.t)&&w.pk==='warn'&&/正式詞彙庫讀取失敗/.test(w.msg)&&w.cards===1000,w.msg);
  await ctx.unroute('**/vocab/vocabulary.json*');await p.evaluate(()=>packRetry());await p.waitForTimeout(2500);const r=await p.evaluate(()=>({pk:PK.state,t:document.body.innerText}));
  T('B2 網路恢復後按「重新載入」：警告消失',r.pk==='ok'&&!/無法連到網站教材/.test(r.t),r.pk);await ctx.close()}
 /* ===== C：舊裝置的舊版示範教材清理（重新整理後由網站自動執行一次） ===== */
 {const c=await open(b);await c.p.evaluate(async()=>{const mk=(id,t,cat)=>({id,text:t,zy:'ㄏㄨㄛˇ ㄔㄜ',img:'',audio:'',cats:[cat],created:1,modified:1});
   S.cats.push({id:'lk1',name:'水果',order:[]},{id:'lk2',name:'交通工具',order:[]},{id:'myc',name:'老師的分類',order:[]});const L=[mk('l1','火車','lk2'),mk('l2','汽車','lk2'),mk('l3','蘋果','lk1'),mk('l4','香蕉','lk1')];S.cards.push(...L);
   S.packIds=L.map(c=>c.id);S.packCats=['lk1','lk2'];S.packSnap=Object.fromEntries(L.map(c=>[c.id,sigC(c)]));S.packVer='x';S.cards.find(c=>c.id==='l4').text='香蕉（老師改過）';
   S.cards.push({id:'my1',text:'火車',zy:'ㄏㄨㄛˇ ㄔㄜ',img:'',audio:'',cats:['myc'],created:2,modified:2});S.recs.push({id:'rl1',ts:Date.now(),itemId:'l1',game:'pick',outcome:'correct'});S.rw.stars=(S.rw.stars||0)+3;delete S.legacyGone;await save()});
  await c.p.waitForTimeout(600);await c.p.reload();await ready(c.p);
  const r=await c.p.evaluate(async()=>({ids:S.cards.filter(c=>/^(l\d|my1)$/.test(c.id)).map(c=>c.id).sort().join(),cats:S.cats.filter(k=>/^(lk|myc)/.test(k.id)).map(k=>k.id).sort().join(),gone:S.legacyGone,rec:S.recs.some(x=>x.id==='rl1'),stars:S.rw.stars,bk:await kvGet('pre-legacy-remove'),l4:MAT.origin(S.cards.find(c=>c.id==='l4')),html:SRC.html()}));
  T('C1 只移除未修改的示範圖卡（以原始簽章判斷，不看名稱）；老師改過的與老師同名的圖卡都保留',r.ids==='l4,my1'&&r.gone.n===3&&r.gone.kept===1,r);
  T('C2 已無保留圖卡的舊分類移除；仍有老師改過圖卡的分類與老師自己的分類保留',r.cats==='lk1,myc',r.cats);
  T('C3 學習紀錄與星星保留；老師改過的舊圖卡改屬教師自訂教材',r.rec&&r.stars>=3&&r.l4==='custom',r);
  T('C4 清理前已在本機備份（不在網站檔案中）；來源管理顯示移除結果與「復原」',r.bk&&r.bk.cards.length===3&&/已於 .* 移除 3 張/.test(r.html)&&/LEG\.undo/.test(r.html),r.bk&&r.bk.cards.length);
  await c.p.reload();await ready(c.p);const again=await c.p.evaluate(()=>({n:S.cards.filter(c=>/^(l\d|my1)$/.test(c.id)).length,ts:S.legacyGone.ts}));T('C5 重新整理不會再執行清理',again.n===2&&again.ts===r.gone.ts,again);
  const u=await c.p.evaluate(async()=>{await LEG.undo();return S.cards.filter(c=>/^l\d$/.test(c.id)).map(c=>c.id).sort().join()});T('C6 「復原」可加回移除的示範圖卡',u==='l1,l2,l3,l4',u);await c.ctx.close()}
 /* ===== D：第03批功能，從首頁點擊進入、實體鍵盤 ===== */
 {const c=await open(b);const setup=await uiStart(c.p,1);T('D1 設定畫面：難度→範圍→選擇教材→數量→開始，沒有「本次學習任務」',!/本次學習任務/.test(setup)&&/挑戰難度[\s\S]*練習範圍[\s\S]*選擇教材[\s\S]*本次練習數量/.test(setup),setup.slice(0,200));
  await c.p.waitForTimeout(2600);const q=await c.p.evaluate(()=>({w:G.cur.text,seq:K.seq,m:S.set.mode,snap:SNAP.on()}));const zk=await ZKC(c.p);const start=await c.p.evaluate(()=>take());
  const exp0=q.seq[0][0];const sym=y=>/^[ㄅ-ㄩ]$/.test(y);
  T('D2 題目開始：念完整詞彙，再只提示第一個注音（SNAP 仍啟用）',start[0]==='T:'+q.w&&start.length===2&&start[1].startsWith('p:')&&q.snap,{start,w:q.w});
  let okAll=true;const log=[];const flat=[];q.seq.forEach((tk,ci)=>tk.forEach((x,si)=>flat.push({x,ci,si})));
  for(let i=0;i<flat.length;i++){await c.p.keyboard.press(zk[flat[i].x]);await c.p.waitForTimeout(950);const a=await c.p.evaluate(()=>take());log.push(flat[i].x+'→'+a.join('+'));
   const nx=flat[i+1];const prompts=a.filter(x=>!x.startsWith('e:'));if(nx){const want=sym(nx.x)?'p:':'T:';if(!(prompts.length===1&&prompts[0].startsWith(want)))okAll=false}else if(!(prompts[0]==='T:'+q.w))okAll=false}
  T('D3 實體鍵盤：每次正確只提示下一個（注音或聲調前的國字讀音），完成後念完整詞彙',okAll,{w:q.w,log});
  await c.ctx.close()}
 /* ===== E：觸控注音鍵盤、再聽一次 ===== */
 {const c=await open(b,{vp:{width:820,height:1180}});await c.p.evaluate(()=>{S.set.input='touch';S.set.inputPicked=1;save()});await uiStart(c.p,1);await c.p.waitForTimeout(2600);
  const q=await c.p.evaluate(()=>({w:G.cur.text,seq:K.seq,kb:document.querySelectorAll('.tkb').length}));await c.p.evaluate(()=>take());
  const first=q.seq[0][0];await c.p.locator('.tkb',{hasText:new RegExp('^'+first+'$')}).first().click();await c.p.waitForTimeout(900);const a=await c.p.evaluate(()=>({ci:K.ci,si:K.si,al:take()}));
  T('E1 觸控注音鍵盤輸入正確：前進一格並提示下一個',q.kb>30&&a.si===1&&a.al.some(x=>x.startsWith('p:')||x.startsWith('T:')),{a,first});
  await c.p.locator('#rep').click();await c.p.waitForTimeout(1600);const rep=await c.p.evaluate(()=>take());T('E2 「再聽一次」重播完整詞彙＋目前一個提示',rep[0]==='T:'+q.w&&rep.length===2,rep);
  /* 第一聲：找一個第一聲的字，用觸控「空白（一聲）」 */
  const fs1=await c.p.evaluate(async()=>{const c=S.cards.find(x=>x.lib&&x.img&&/^[ㄅ-ㄩ]+$/.test((x.zy||'').split(' ')[0]));AM.stop();ZQ.stop();G.q[G.i]=c;ask();await sl(300);const seq=K.seq[0];for(const y of seq.slice(0,-1))kPress(y,'touch_keyboard');return{w:c.text,seq,si:K.si}});
  await c.p.locator('.tkb',{hasText:'空白（一聲）'}).click();await c.p.waitForTimeout(300);const st=await c.p.evaluate(()=>{const e=document.getElementById('z0_'+(K.seq[0].length-1));return{ci:K.ci,ok:e&&e.classList.contains('ok'),txt:e&&e.textContent}});
  T('E3 第一聲用觸控「空白（一聲）」完成，方格正確但不顯示符號',st.ci>=1&&st.ok&&st.txt==='',{fs1,st});await c.ctx.close()}
 /* ===== F：語音備援（模擬不同語音的行為；真機是否有聲音無法由此驗證） ===== */
 {const c=await open(b,{voice:1});const r=await c.p.evaluate(async()=>{const o={};o.cands=TTSX.cands().map(v=>v.name);
   window.__vb={'美佳':'error'};AM.stop();ZQ.stop();const card=S.cards.find(x=>x.text==='葡萄');const m=FL.mem();m.range='pick';m.dim='theme';m.sel={theme:S.cats.filter(k=>k.lib&&!k.lvl).map(k=>k.id),level:[],custom:[]};m.cat='sel';m.star['quiet:2']=1;UI.mode='quiet';FL.open(2);FL.go();AM.stop();ZQ.stop();G.q[G.i]=card;window.__al.length=0;ask();await sl(3500);
   o.al=window.__al.splice(0).filter(x=>x.tts).map(x=>x.tts+'@'+x.voice+':'+x.beh);o.lock=G.lock;o.tries=G.tries;o.msg=(document.getElementById('msg')||{}).textContent;
   kPress('ㄆ','physical_keyboard');await sl(1200);o.after=window.__al.splice(0).map(x=>x.tts?x.tts+'@'+x.voice:'zy');
   /* 語音診斷：清單、試聽、指定 */
   const h=VDX.html();o.list=/中文語音清單（\d+ 個）/.test(h)&&/試聽/.test(h)&&/使用這個/.test(h)&&/建置 /.test(h);
   VDX.use('tingting');o.pref=S.set.ttsVoice;window.__vb={};window.__al.length=0;await new Promise(r=>TTSX.say('棉被',{onend:r,onfail:r}));o.used=window.__al.filter(x=>x.tts).map(x=>x.voice);
   VDX.auto();o.prefAfter=S.set.ttsVoice||null;
   window.__vb={'Google 國語（臺灣）':'notallowed','美佳':'notallowed','Eddy (中文（台灣）)':'notallowed'};TTSX.bad.clear();window.__al.length=0;o.na=await new Promise(r=>TTSX.say('棉被',{onend:()=>r('ok'),onfail:r}));o.naTries=window.__al.filter(x=>x.tts).length;
   return o});
  T('F1 候選順序：本機 zh-TW 優先，網路語音在後',r.cands[0]==='美佳'&&r.cands.indexOf('Google 國語（臺灣）')>r.cands.indexOf('Eddy (中文（台灣）)'),r.cands);
  T('F2 題目中的語音明確錯誤 → 自動改用下一個中文語音念出完整詞彙，不鎖住、不算錯',r.al[0]==='葡萄@美佳:error'&&/^葡萄@Eddy/.test(r.al[1])&&!r.lock&&r.tries===0,r);
  T('F3 備援後逐音引導照常（輸入ㄆ後提示下一個）',r.after.includes('zy'),r.after);
  T('F4 語音診斷：中文語音清單、試聽、「使用這個」、版本與建置識別碼',r.list,r.list);
  T('F5 教師在這台裝置指定的語音會優先使用；可恢復自動選擇',r.pref==='Tingting'&&r.used[0]==='Tingting'&&r.prefAfter===null,r);
  T('F6 瀏覽器擋播放（not-allowed）時不連續換語音，交給「再聽一次」',r.na==='tts-not-allowed'&&r.naTries===1,r);await c.ctx.close()}
 await b.close();console.log('PASS',P,'FAIL',F);process.exit(F?1:0)})();
