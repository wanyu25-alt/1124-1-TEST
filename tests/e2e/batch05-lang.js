// v22.6 第05批：正式詞彙語言屬性（vocab/language-metadata.json）接入、進階題型開放、教師修正／審查／匯出入
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const BASE='http://localhost:'+(process.env.E2E_PORT||8124)+'/1124-1-TEST/';let P=0,F=0;
const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x===undefined?null:x).slice(0,600))};
const AS=fs.readFileSync(path.join(__dirname,'lib','audio-stub.js'),'utf8'),MS=fs.readFileSync(path.join(__dirname,'lib','mic-stub.js'),'utf8');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900}});await ctx.addInitScript({content:AS});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(BASE);
 await p.waitForFunction(()=>typeof S!=='undefined'&&S.cards&&S.cards.length>=1000&&S.lrn&&typeof LM!=='undefined',null,{timeout:60000});await p.waitForTimeout(800);
 await p.evaluate(()=>{window.confirm=()=>true;window.alert=()=>{}});
 const r0=await p.evaluate(()=>({n:LM.map.size,err:LM.err,ver:APP.build,cnt:LM.meta&&LM.meta.count}));
 T('L1 開機時讀入正式語言屬性 1000 詞；版本 v22.6.3',r0.n===1000&&!r0.err&&r0.ver==='v22.6.3',r0);
 const id=w=>S.cards.find(c=>c.text===w&&c.lib);
 const r1=await p.evaluate(()=>{const c=w=>S.cards.find(x=>x.text===w&&x.lib),pen=c('鉛筆'),run=c('刷牙'),red=c('紅色');const a=cxOf(pen),b=cxOf(run);
  return{use:a.use,sem:a.sem,posPen:a.pos,posRun:b.pos,raw:(S.cx[pen.id]||{}).use||'',scene:b.scene,verbs:a.rel.verbs,redScene:cxOf(red).scene}});
 T('L2 正式資料轉成進階欄位：鉛筆有用途、語意；刷牙詞性＝動詞、有生活情境；不寫入 S.cx',/寫字/.test(r1.use)&&r1.sem&&r1.posRun==='動詞'&&r1.scene&&r1.raw==='',r1);
 T('L3 不適合看情境說詞的詞（顏色）不填生活情境',r1.redScene==='',r1);
 const r2=await p.evaluate(()=>{const c=S.cards.find(x=>x.text==='鉛筆'&&x.lib),x=WD.x(c.id),keep=JSON.stringify(x);x.use='老師寫的用途';const a=cxOf(c).use;x.use='';const b=cxOf(c).use;
  LM.setRv(c.id,'teacher_off');const off=cxOf(c).use||'';const okUse=PH.ok(c,'pick','use');LM.setRv(c.id,'');const back=cxOf(c).use;return{a,b,off,okUse,back,keep}});
 T('L4 教師修改優先；留白時回到正式資料',r2.a==='老師寫的用途'&&/寫字/.test(r2.b),r2);
 T('L5 教師「停用」：該詞不使用正式資料（聽用途選圖不出這個詞），取消後恢復',r2.off===''&&r2.okUse===false&&/寫字/.test(r2.back),r2);
 const r2b=await p.evaluate(()=>{const c=S.cards.find(x=>x.text==='擔心'&&x.lib);const a=LM.rv(c.id),u0=cxOf(c).sem||'';LM.setRv(c.id,'teacher_ok');const u1=cxOf(c).sem||'';LM.setRv(c.id,'');return{a,u0,u1}});
 T('L5b「需要教師確認」的詞：確認前不使用正式資料，教師按「已確認」後才使用',r2b.a==='needs_review'&&r2b.u0===''&&r2b.u1!=='',r2b);
 const r3=await p.evaluate(()=>{const v=S.cards.filter(c=>c.lib&&c.img&&cxOf(c).pos==='動詞');return{n:v.length,obj:v.filter(c=>PH.ok(c,'speak','obj')).length,act:v.filter(c=>PH.ok(c,'speak','act')).length}});
 T('L6 動詞仍可用在「看圖說詞（物品）」（不因正式詞性被排除），也可用在「看動作圖片說詞」',r3.n>50&&r3.obj===r3.n&&r3.act===r3.n,r3);
 const r4=await p.evaluate(()=>{const ck=(st,m,i)=>{const c=FL.ladder(st,m)[i];return{t:c.t||c.na,...FL.chk(c,'pick','all')}};return{q5:ck(1,'quiet',4),o5:ck(1,'oral',4),s4:ck(2,'oral',3),s5:ck(2,'oral',4)}});
 T('L7 第1站五星（聽讀、口語）可用：聽用途選圖',r4.q5.ok&&r4.o5.ok&&/用途|新圖片/.test(r4.q5.t),r4);
 T('L8 口語第2站四星「看動作圖片說詞」、五星「聽句子說詞」可用',r4.s4.ok&&r4.s5.ok,r4);
 const r5=await p.evaluate(()=>{const L=S.cards.filter(c=>c.lib&&c.img&&PH.ok(c,'pick','use'));let bad=[],nul=0,n=0;const o=S.set.pkN;
  for(const c of L){for(let k=0;k<3;k++){const pk=PICK.build({...c,_sub:'use'});if(!pk){nul++;continue}n++;pk.opts.filter(x=>!x.correct).forEach(x=>{const d=byId(x.cid);if(LM.clash(c,d))bad.push(c.text+'/'+d.text)})}}
  const pen=S.cards.find(x=>x.text==='鉛筆'&&x.lib),sib=['原子筆','自動鉛筆'].map(w=>S.cards.find(x=>x.text===w&&x.lib)).filter(Boolean);
  return{L:L.length,n,nul,bad:bad.slice(0,10),nb:bad.length,penClash:sib.map(d=>LM.clash(pen,d))}});
 T('L9 聽用途選圖：干擾選項不會同時成立（用途相同或同類的詞不一起出現）',r5.L>100&&r5.nb===0&&r5.penClash.every(Boolean),r5);
 const r6=await p.evaluate(()=>{const c=S.cards.find(x=>x.text==='鉛筆'&&x.lib);G.pk={sub:'use'};const it=PICK.item(c);G.pk=null;return{tts:it.tts,sem:PH.sem(c)}});
 T('L10 題目說成完整問句「哪一個是用來…的？」；語意提示不含答案',/^哪一個是用來寫字的？$/.test(r6.tts)&&/用來寫字/.test(r6.sem)&&!/鉛筆/.test(r6.sem),r6);
 /* 實際進入第1站五星（聽讀練習）作答一題 */
 await p.locator(`[onclick="UI.pick('quiet')"]`).click();await p.waitForTimeout(400);await p.locator('[onclick="FL.open(1)"]').first().click();await p.waitForTimeout(300);
 await p.locator('.fstar').nth(4).click();await p.waitForTimeout(200);await p.locator('#fl_go').click();await p.waitForTimeout(1500);
 /* 新詞會先出現「聽詞認識」（既有教學流程）：按「我知道了」直到出現選圖題 */
 const r7=await p.evaluate(async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));let ex=0;for(let i=0;i<80&&!(S.set.mode==='pick'&&G.pk&&!G.lock);i++){if(S.set.mode==='expose'&&!G.lock){EXP.done();ex++}await sl(250)}
  return{mode:S.set.mode,sub:G.pk&&G.pk.sub,n:G.pk&&G.pk.opts.length,ex,mic:!!(navigator.mediaDevices&&window.__gum)}});
 T('L11 第1站五星開始：聽用途選圖、4 個選項',r7.mode==='pick'&&r7.sub==='use'&&r7.n===4,r7);
 const r8=await p.evaluate(async()=>{const ci=G.pk.ci;PICK.choose(ci);await new Promise(r=>setTimeout(r,600));const r=S.recs.filter(x=>x.game==='pick').pop();return r&&{sub:r.sub,out:r.outcome,task:r.task&&r.task.id}});
 T('L12 作答紀錄：題型 S1.pick.use、答對',r8&&r8.sub==='use'&&r8.out==='correct',r8);
 /* 後台：查看、修正、審查、匯出入 */
 const r9=await p.evaluate(async()=>{const c=S.cards.find(x=>x.text==='擔心'&&x.lib);LIB.ui.w=c.id;const h=LIB.detail(c.id),v=LIB.view();
  LIB.ui.w=c.id;document.body.insertAdjacentHTML('beforeend','<div id="lmt">'+LM.panel(c.id)+'</div>');$('#lm_use').value='心裡一直想著不好的事';LM.saveEd(c.id);LM.setRv(c.id,'teacher_ok');
  const x=S.cx[c.id],ex=LM.expo();document.getElementById('lmt').remove();
  return{det:/正式語言屬性/.test(h)&&/需要教師確認/.test(h),ov:/正式語言屬性（第05批/.test(v)&&/匯出語言屬性修正/.test(v),use:x.use,rv:x.lmrv,ex:ex.words[c.id],kind:ex.kind,st:LM.rv(c.id),id:c.id}});
 T('L13 內建詞彙庫：詞彙詳細頁顯示正式語言屬性與審查狀態；總覽有匯出／匯入',r9.det&&r9.ov,r9);
 T('L14 教師修正與審查存在裝置（S.cx），匯出檔只含修正內容',r9.use==='心裡一直想著不好的事'&&r9.rv==='teacher_ok'&&r9.st==='teacher_ok'&&r9.kind==='language-metadata-edits'&&r9.ex&&r9.ex.use&&r9.ex.review==='teacher_ok',r9);
 const r10=await p.evaluate(async id=>{const ex=LM.expo();const x=WD.x(id);x.use='';delete x.lmrv;const f=new File([JSON.stringify({...ex,words:{...ex.words,BAD:{use:'x'}}})],'e.json',{type:'application/json'});
  document.body.insertAdjacentHTML('beforeend','<small id="lm_io"></small>');await LM.imp(f);const m=document.getElementById('lm_io').textContent;
  const keys=await new Promise(r=>{const q=indexedDB.open('trafficHero');q.onsuccess=()=>{const t=q.result.transaction('kv').objectStore('kv').getAllKeys();t.onsuccess=()=>r(t.result.map(String))}});
  return{use:S.cx[id].use,rv:S.cx[id].lmrv,m,bk:keys.some(k=>/^backup-pre-lm-import-/.test(k))}},r9.id);
 T('L15 匯入：套用修正、略過無法辨識的詞，套用前先備份',r10.use==='心裡一直想著不好的事'&&r10.rv==='teacher_ok'&&/略過 1/.test(r10.m)&&r10.bk,r10);
 const r11=await p.evaluate(()=>{const n=Object.keys(S.cx||{}).length;return{n,vocab:S.cards.filter(c=>c.lib).length}});
 T('L16 正式詞彙仍為 1000 詞（沒有新增或刪除圖卡）',r11.vocab===1000,r11);
 /* 口語第2站四星：看動作圖片說詞（模擬麥克風與辨識） */
 const c2=await b.newContext({viewport:{width:1280,height:900}});await c2.addInitScript({content:AS+';window.__dur=800;'});await c2.addInitScript({content:MS});const q=await c2.newPage();q.on('pageerror',e=>errs.push(e.message));await q.goto(BASE);
 await q.waitForFunction(()=>typeof S!=='undefined'&&S.cards&&S.cards.length>=1000&&S.lrn&&typeof LM!=='undefined'&&LM.map.size,null,{timeout:60000});await q.waitForTimeout(800);await q.evaluate(()=>{window.confirm=()=>true;window.alert=()=>{}});
 await q.locator(`[onclick="UI.pick('oral')"]`).click();await q.waitForTimeout(400);await q.locator('[onclick="FL.open(2)"]').first().click();await q.waitForTimeout(300);
 await q.locator('.fstar').nth(3).click();await q.waitForTimeout(200);await q.locator('#fl_go').click();await q.waitForTimeout(900);
 if(await q.locator('#prep').count())await q.locator('#prep button',{hasText:'啟用麥克風並開始'}).click();
 const r12=await q.evaluate(async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<80&&!(S.set.mode==='speak'&&G.cur&&ASR.on&&!G.lock);i++)await sl(150);
  const cur=G.cur&&{t:G.cur.text,sub:G.cur._sub||S.set.sps,pos:cxOf(G.cur).pos};await sl(600);__say(G.cur.text,true);await sl(1500);const r=S.recs.filter(x=>x.game==='speak').pop();return{cur,mode:S.set.mode,rec:r&&{sub:r.sub,out:r.outcome}}});
 T('L17 口語第2站四星開始：看動作圖片說詞（題目是動作詞），說對記為答對',r12.cur&&r12.cur.sub==='act'&&r12.cur.pos==='動詞'&&r12.rec&&r12.rec.sub==='act'&&r12.rec.out==='correct',r12);
 /* 口語第2站五星：聽句子說詞 */
 await q.evaluate(()=>{G.on=false;try{endRound&&endRound()}catch(e){}});await q.goto(BASE);
 await q.waitForFunction(()=>typeof S!=='undefined'&&S.cards&&S.cards.length>=1000&&S.lrn&&typeof CLZ!=='undefined'&&LM.map.size,null,{timeout:60000});await q.waitForTimeout(800);await q.evaluate(()=>{window.confirm=()=>true;window.alert=()=>{}});
 const r13=await q.evaluate(()=>{const L=S.cards.filter(c=>c.lib&&PH.ok(c,'speak','clz'));const an=['大象','香蕉','粽子','彩虹'].map(w=>S.cards.find(c=>c.lib&&c.text===w)).filter(c=>c&&PH.ok(c,'speak','clz')).length;const lad=FL.ladder(2,'oral')[4];return{an,n:L.length,t:lad.t,leak:L.filter(c=>CLZ.q(c).includes(c.text)).map(c=>c.text),obj:P15.objOf(lad)&&P15.objOf(lad)[0]}});
 T('L19 五星改為「聽句子說詞」：有問句的詞可出題（物品＋猜謎 300 句以上）、問句不含答案、有學習目標說明',/聽句子說詞/.test(r13.t)&&r13.n>=300&&r13.an===4&&r13.leak.length===0&&/聽句子/.test(r13.obj||''),r13);
 await q.locator(`[onclick="UI.pick('oral')"]`).click();await q.waitForTimeout(400);await q.locator('[onclick="FL.open(2)"]').first().click();await q.waitForTimeout(300);
 await q.locator('.fstar').nth(4).click();await q.waitForTimeout(200);await q.evaluate(()=>{window.__al.length=0});await q.locator('#fl_go').click();await q.waitForTimeout(900);
 if(await q.locator('#prep').count())await q.locator('#prep button',{hasText:'啟用麥克風並開始'}).click();
 const r14=await q.evaluate(async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<80&&!(CLZ.is()&&ASR.on&&!G.lock&&G.clz&&G.clz.played);i++)await sl(150);await sl(1200);
  const s=G.clz,pic=document.getElementById('pic');const a={sub:PH.sub(),q:s&&s.q,played:s&&s.played,tts:window.__al.filter(x=>x.tts===(s&&s.q)).length,picHidden:!!pic&&pic.style.display==='none',btn:!!document.querySelector('#clzq button')};
  SK.next('button');await sl(300);const pic2=document.getElementById('pic');a.shown=G.clz.shown&&pic2.style.display!=='none';a.hint=(RE.cur.hints||[]).map(h=>h.type+':'+(h.what||''));
  const n0=S.recs.length,cid=G.cur.id,i0=G.i;a.said=[];for(let k=0;k<12&&!G.lock;k++){a.said.push(__say(G.cur.text,true));await sl(700)}let r;for(let i=0;i<150;i++){await sl(150);r=S.recs.slice(n0).filter(x=>x.game==='speak'&&x.sub==='clz').pop();if(r&&G.i!==i0)break}a.rec=r&&{sub:r.sub,out:r.outcome,ind:r.independent,clz:r.ext&&r.ext.clz};return a});
 T('L20 開始後先念問句（語音），不顯示圖片，有「再聽一次」',r14.sub==='clz'&&r14.q&&r14.tts>=1&&r14.picHidden&&r14.btn,r14);
 T('L21 按「提示」先顯示圖片（記為提示 P1「顯示圖片」）',r14.shown&&r14.hint.some(h=>/^P1:顯示圖片/.test(h)),r14);
 T('L22 看圖後說對：答對、不算獨立完成，紀錄問句與「看過圖片」',r14.rec&&r14.rec.sub==='clz'&&r14.rec.out==='correct'&&r14.rec.ind===false&&r14.rec.clz&&r14.rec.clz.pic===true&&r14.rec.clz.q===r14.q,r14);
 const r15=await q.evaluate(async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<80&&!(CLZ.is()&&ASR.on&&!G.lock&&G.clz&&G.clz.played&&!(RE.cur&&RE.cur.hints.length));i++)await sl(150);await sl(1500);
  const hid=document.getElementById('pic').style.display==='none',n0=S.recs.length,cid=G.cur.id,i0=G.i;for(let k=0;k<12&&!G.lock;k++){__say(G.cur.text,true);await sl(700)}let r;for(let i=0;i<150;i++){await sl(150);r=S.recs.slice(n0).filter(x=>x.game==='speak'&&x.sub==='clz').pop();if(r)break}return{hid,rec:r&&{out:r.outcome,ind:r.independent,clz:r.ext&&r.ext.clz}}});
 T('L23 下一題不看圖直接說對：獨立完成',r15.hid&&r15.rec&&r15.rec.out==='correct'&&r15.rec.ind===true&&r15.rec.clz&&r15.rec.clz.pic===false,r15);
 const r16=await q.evaluate(()=>{const st=FL.st;FL.st=4;let h='';try{h=FL.setupHtml()}catch(e){h='ERR '+e}FL.st=st;const off=S.cards.filter(c=>c.lib&&PH.ok(c,'pick','use'));return{why:/為什麼有些難度「尚無教材」/.test(h),msg:/目前沒有題型/.test(h),need:PH.need.use}});
 T('L24 有難度無法使用時，星星下方寫出原因（例：第4站口語五星）；聽用途選圖的原因說明「動物、水果沒有用途」',r16.why&&r16.msg&&/動物、水果/.test(r16.need),r16);
 T('L25 沒有頁面錯誤',errs.length===0,errs);await b.close();console.log(`\n${P} 通過 / ${F} 失敗`);process.exit(F?1:0)})().catch(e=>{console.error('CRASH',e);process.exit(2)});
