// 第05階段（Chromium 模擬，不是真機）：內建詞彙庫在 GitHub Pages 式子路徑下的實際讀取、後台操作、看圖題顯示、延遲載入
const {chromium}=require('playwright');let P=0,F=0;const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
const fs=require('fs');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1100,height:900}});const p=await ctx.newPage();const errs=[],imgReq=[],badRes=[];
p.on('pageerror',e=>errs.push(e.message));p.on('request',r=>{if(/\/vocab\/images\//.test(r.url()))imgReq.push(r.url())});p.on('response',r=>{if(r.status()>=400&&!/favicon/.test(r.url()))badRes.push(r.status()+' '+r.url())});
await p.goto('http://localhost:'+(process.env.E2E_PORT||8124)+'/1124-1-TEST/?libmode=optin');await p.waitForFunction(()=>typeof LIB!=='undefined'&&S&&S.cards,null,{timeout:40000});await p.waitForTimeout(1200);
await p.evaluate(()=>{window.confirm=()=>true;window.alert=m=>{window.__al=m};S.set.music=false;S.set.sound=false;V2.prepDone=true;S.set.ap=false;S.set.anim=false;save()});
const before=await p.evaluate(()=>({cards:S.cards.length,cats:S.cats.length}));
T('開啟網站時不會下載任何詞彙庫圖片（沒有啟用就不載入）',imgReq.length===0,imgReq.length);
// ① 後台詞彙庫頁
await p.evaluate(()=>{tab(2);sub='lib';tch()});await p.waitForFunction(()=>/內建詞彙庫/.test(document.querySelector('#sp').innerText)&&LIB.base,null,{timeout:15000});
const h=await p.evaluate(()=>document.querySelector('#sp').innerText);
T('後台顯示 1000 詞、16 分類、有圖 581、無圖 419、592 張',/共 1000 個詞彙、16 個分類/.test(h)&&/有圖 581 詞（共 592 張圖）/.test(h)&&/無圖 419/.test(h),h.slice(0,300));
await p.waitForTimeout(500);
T('清單第一頁只載入本頁圖片（≤30，延遲載入），不是 592 張',imgReq.length<=30&&imgReq.length>0,imgReq.length);
const rowImgs=await p.evaluate(()=>[...document.querySelectorAll('#sp img')].filter(i=>i.complete&&i.naturalWidth>0).length);
T('清單縮圖在子路徑（/1124-1-TEST/）下真的讀得到',rowImgs>=5,rowImgs);
// ② 篩選：分類＋有圖，全選、啟用、審核
await p.selectOption('#sp select >> nth=0',{label:/動物昆蟲/}).catch(async()=>{await p.evaluate(()=>LIB.set('cat','CAT05'))});
await p.evaluate(()=>LIB.set('cat','CAT05'));await p.evaluate(()=>LIB.set('img','has'));await p.waitForTimeout(300);
const cnt=await p.evaluate(()=>LIB.list().length);T('篩選：動物昆蟲且有圖片 = 85 個',cnt===85,cnt);
await p.click('text=勾選全部符合的');await p.click('#sp >> text=啟用 >> nth=0').catch(()=>{});
await p.evaluate(()=>{if(!LIB.selIds().length)LIB.allFiltered(true);LIB.act('on')});await p.waitForTimeout(300);
let en=await p.evaluate(()=>S.cards.filter(c=>c.lib).length);T('啟用 85 個動物詞彙',en===85,en);
T('尚未審核：看圖題用的圖片欄位是空的（不出題）',await p.evaluate(()=>S.cards.filter(c=>c.lib).every(c=>c.img==='')));
// 圖片牆批次預覽
await p.evaluate(()=>{LIB.ui.v='grid';LIB.re()});await p.waitForTimeout(600);
const g=await p.evaluate(()=>({cells:document.querySelectorAll('#sp input[type=checkbox]').length,ok:[...document.querySelectorAll('#sp img')].filter(i=>i.complete&&i.naturalWidth>0).length}));
T('圖片牆一頁 30 張可預覽',g.cells>=30&&g.ok>=20,g);
await p.evaluate(()=>{LIB.ui.sel={};LIB.allFiltered(true);LIB.act('ok')});await p.waitForTimeout(300);
T('批次審核後 85 個詞彙有圖片可出題',await p.evaluate(()=>S.cards.filter(c=>c.lib&&c.img&&c.img.startsWith('vocab/images/')).length)===85);
T('2 個以上圖片的詞彙（例如蟲類）保有全部圖片、主要圖片固定',await p.evaluate(()=>S.cards.filter(c=>c.lib&&c.imgs.length>1).every(c=>c.img===c.libPrim)));
// ③ 學生端看圖題（聽詞選圖）
await p.evaluate(()=>{UI.navTo(1);UI.pick('quiet')});await p.waitForTimeout(500);
await p.evaluate(()=>{const m=FL.mem();m.range='pick';m.cat='c:LIB-CAT05';m.n=5;save()});
await p.click('.stc >> nth=0 >> text=進入這一站');await p.waitForTimeout(300);await p.click('.fstar >> nth=1');
await p.evaluate(()=>{const m=FL.mem();m.range='pick';m.cat='c:LIB-CAT05'});await p.click('.fgob');await p.waitForTimeout(1500);
const q=await p.evaluate(()=>({on:G.on,n:G.n,lib:G.q.filter(c=>c.lib).length,all:G.q.length}));
T('學生端用動物分類開始：題目都是內建詞彙',q.on&&q.lib===q.all&&q.all>=3,q);
let shown=0,guard=0;while(guard++<60){if(await p.$('#arr'))break;
 const st=await p.evaluate(()=>({lock:G.lock,m:S.set.mode,n:document.querySelectorAll('.pko:not(.dis)').length}));
 if(!st.lock&&st.m==='pick'&&st.n>0){const ld=await p.evaluate(()=>[...document.querySelectorAll('.pko img')].filter(i=>i.complete&&i.naturalWidth>0).length);if(ld>=2)shown++;await p.evaluate(()=>PICK.choose(G.pk.ci))}
 else if(!st.lock&&st.m==='expose'){await p.evaluate(()=>EXP.done())}
 await p.waitForTimeout(500)}
T('看圖題的選項圖片實際顯示（內建詞彙圖，非破圖）',shown>=3,shown);
T('完成畫面出現，作答紀錄以詞彙 ID 儲存',!!(await p.$('#arr'))&&await p.evaluate(()=>S.recs.some(r=>/^VOC\d+$/.test(r.itemId))));
T('遊戲過程只載入用到的圖片（遠少於 592）',imgReq.length<150,imgReq.length);
await p.evaluate(()=>{leave()});
// ④ 無圖詞彙：啟用後不進看圖題、可用於看文字拼注音
const r2=await p.evaluate(()=>{const n=LIB.base.find(w=>!w.images.length&&w.categoryId==='CAT13');LIB.setEn([n.id],true);S.set.mode='pick';const a=pool().some(c=>c.id===n.id);S.set.mode='spell';const b=pool().some(c=>c.id===n.id);return{a,b,img:byId(n.id).img}});
T('無圖詞彙：看圖題不出現、拼注音可用、不顯示替代圖片',!r2.a&&r2.b&&r2.img==='',r2);
// ⑤ 資料持久化：重新整理後仍在，且不佔用資料庫大量空間
await p.reload();await p.waitForFunction(()=>typeof LIB!=='undefined'&&S&&S.cards&&S.cards.some(c=>c.lib),null,{timeout:30000});
const per=await p.evaluate(async()=>({lib:S.cards.filter(c=>c.lib).length,json:JSON.stringify(S.lib).length,fetched:!!LIB.base,keep:S.cards.length}));
T('重新整理後內建詞彙仍在、設定資料量小（無 Base64 圖片）',per.lib>=85&&per.json<20000,per);
// ⑥ 匯出 ZIP 不含內建圖片，含 library.json；匯入還原
const dl=p.waitForEvent('download');await p.evaluate(()=>{tab(2);sub='io';tch()});await p.click('text=⬇ 匯出完整教材 ZIP');const d=await dl;const fp='/tmp/lib-export.zip';await d.saveAs(fp);const sz=fs.statSync(fp).size;
T('匯出 ZIP 完成且很小（內建圖片不打包成 Base64／重複檔案）',sz>0&&sz<2e6,sz);
const zipTxt=fs.readFileSync(fp).toString('latin1');T('ZIP 內有 library.json',/library\.json/.test(zipTxt));
// ⑦ 更新匯入預覽
const nv=JSON.parse(fs.readFileSync('/home/claude/repo/vocab/vocabulary.json','utf8'));nv.push({id:'VOC9001',word:'新詞',zhuyin:'ㄒㄧㄣ ㄘˊ',category:'人物',categoryId:'CAT01',images:[],primaryImage:'',reviewStatus:'pending_teacher_review',pronunciationReview:'preliminary_not_dictionary_verified',hasImage:false});fs.writeFileSync('/tmp/upd.json',JSON.stringify(nv));
await p.evaluate(()=>{tab(2);sub='lib';tch()});await p.waitForTimeout(500);
await p.setInputFiles('#sp input[type=file][accept*=json]','/tmp/upd.json');await p.waitForFunction(()=>/更新預覽/.test(document.querySelector('#sp').innerText),null,{timeout:8000});
T('更新預覽：新詞彙 1',/新詞彙 1、/.test(await p.evaluate(()=>document.querySelector('#sp').innerText)));
await p.click('text=確認套用');await p.waitForTimeout(500);
T('套用後新詞彙加入、完成摘要出現',await p.evaluate(()=>LIB.idx.has('VOC9001'))&&/更新完成/.test(await p.evaluate(()=>document.querySelector('#sp').innerText)));
const unexp=badRes.filter(x=>!/default-library\.json|levels\.json/.test(x));T('沒有任何圖片或資源 404（網站尚未發布 default-library.json 時，default-library.json／levels.json 為選用檔，舊資料沒有時的 404 是預期的）',unexp.length===0,unexp.slice(0,3));
T('沒有頁面錯誤',errs.length===0,errs.slice(0,2));
console.log('e2e phase5:',P,'pass',F,'fail');await b.close();process.exit(F?1:0)})();
