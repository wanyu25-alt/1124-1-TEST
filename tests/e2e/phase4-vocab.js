// 第04階段（Chromium 模擬，不是真機）：後台「詞彙履歷」頁、學習地圖「複習學過的詞彙」、智慧出題實際點擊作答
const {chromium}=require('playwright');let P=0,F=0;const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1100,height:800}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8124/1124-1-TEST/');await p.waitForFunction(()=>typeof VP!=='undefined'&&S&&S.cards&&S.cards.length>=8,null,{timeout:40000});await p.waitForTimeout(1200);
await p.evaluate(()=>{window.confirm=()=>true;window.alert=m=>{window.__al=m};S.set.music=false;S.set.sound=false;V2.prepDone=true;S.set.ap=false;S.set.anim=false;save()});
// 造資料：6 個詞彙「聽詞選圖」已熟悉、4 個練習中、其餘沒接觸過
const ids=await p.evaluate(()=>{const cs=S.cards.filter(c=>c.img&&!c.part).slice(0,14).map(c=>c.id);const D=n=>new Date(2026,9,1+n,12).getTime();let k=0;
 const add=(w,d,sid)=>{S.recs.push({sv:1,id:'E'+(k++),learnerId:LRN.id(),itemId:w,itemKind:'word',itemText:byId(w).text,game:'pick',outcome:'correct',independent:true,hints:[],first:{result:'correct'},final:{},ts:D(d),session:{id:sid},ext:{aid:{hint:'none'}},pk:{sub:'word',n:3},purpose:'assess',tries:0})};
 cs.slice(0,6).forEach(w=>{add(w,0,'a');add(w,1,'b');add(w,2,'c')});cs.slice(6,10).forEach(w=>add(w,2,'a'));VP._now=D(3);VP._k=null;save();return cs});
T('有教材與造出的紀錄',ids.length>=10);
// ① 後台
await p.evaluate(()=>{tab(2);sub='dash';DSH.ui.view='vp';tch()});await p.waitForTimeout(400);
const h1=await p.evaluate(()=>document.querySelector('#sp').innerText);
T('後台出現「詞彙履歷」頁與十項能力欄位',/詞彙學習履歷/.test(h1)&&['聽詞理解','圖片辨認','自主說詞','提示後說詞','注音拼打','詞彙聽打','短語組合','語句表達','不同圖片及情境','生活口語運用'].every(x=>h1.includes(x)));
T('有「已熟悉」與「練習中」，沒有紀錄的能力寫「尚未評量」',/已熟悉/.test(h1)&&/練習中/.test(h1)&&/尚未評量/.test(h1));
await p.locator('#sp table tr').nth(1).click();await p.waitForTimeout(300);
const h2=await p.evaluate(()=>document.querySelector('#sp').innerText);T('點一列顯示判定依據、規則版本',/的學習履歷/.test(h2)&&/有效紀錄 3 次/.test(h2)&&/規則版本 1\.0/.test(h2));
await p.click('text=建立信心（60／30／10）');await p.waitForTimeout(300);
T('按「建立信心」→ 比例改成 60/30/10',await p.evaluate(()=>{const r=SM.cfg().ratio;return r.fam===60&&r.need===30&&r.new===10}));
await p.click('text=預設（40％熟悉／50％待加強／10％新詞彙）');await p.waitForTimeout(200);
await p.fill('#vr_famN','2');await p.click('text=套用規則');await p.waitForTimeout(300);
T('調整規則 → 版本變 1.0-t1 並留下版本紀錄',await p.evaluate(()=>VP.rules().ver==='1.0-t1'&&VP.ext().rh.length===1&&VP.ext().rh[0].changes[0].includes('famN')));
await p.click('text=恢復預設');await p.waitForTimeout(200);
T('恢復預設規則',await p.evaluate(()=>VP.rules().famN===3));
// ② 學生端：地圖有快捷、推薦
await p.evaluate(()=>{UI.navTo(1);UI.pick('quiet')});await p.waitForTimeout(400);
const q=await p.$('text=複習學過的詞彙（');T('學習地圖有「複習學過的詞彙（N 個）」',!!q);
// ③ 智慧出題實際作答：第1站聽詞選圖，5 題
await p.evaluate(()=>{FL.mem().n=5;FL.mem().range='rec';save()});
await p.click('.stc >> nth=0 >> text=進入這一站');await p.waitForTimeout(300);await p.click('.fstar >> nth=1');await p.click('.fgob');await p.waitForTimeout(1500);
const pl=await p.evaluate(()=>({n:G.n,flow:G.flow,sm:G.sm&&{a:G.sm.actual,t:G.sm.target,w:G.sm.words.length,fb:G.sm.fallback}}));
T('實際出題：5 題、使用智慧出題並記下實際比例',pl.n===5&&pl.flow&&pl.sm&&pl.sm.w===5&&pl.sm.a.fam+pl.sm.a.need+pl.sm.a.new===5,pl);
let guard=0;while(guard++<60){if(await p.$('#arr'))break;
 const st=await p.evaluate(()=>({lock:G.lock,m:S.set.mode,n:document.querySelectorAll('.pko:not(.dis)').length}));
 if(!st.lock&&st.m==='pick'&&st.n>0){await p.evaluate(()=>PICK.choose(G.pk.ci))}
 else if(!st.lock&&st.m==='expose'){await p.evaluate(()=>EXP.done())}
 await p.waitForTimeout(500)}
T('完成畫面出現',!!(await p.$('#arr')));
const out=await p.evaluate(()=>({recs:S.recs.filter(r=>r.ext&&r.ext.vp&&r.ext.vp.sm).length,pid:VP.ext().plans.length,log:VP.ext().log.length}));
T('作答後新紀錄帶有規則版本與出題資訊、後台留下出題紀錄與狀態變更',out.recs>=1&&out.pid>=1&&out.log>=1,out);
// ④ 複習學過的詞彙
await p.click('#arr .btns button >> text=選擇其他站').catch(()=>{});await p.waitForTimeout(400);
await p.evaluate(()=>{UI.navTo(1);UI.pick('quiet')});await p.waitForTimeout(400);
await p.click('text=複習學過的詞彙（');await p.waitForTimeout(1200);
const rv=await p.evaluate(()=>({on:G.on,k:G.sm&&G.sm.kind,items:G.q.map(c=>[c._step,c._sm&&c._sm.b])}));
T('複習學過的詞彙：只出學過的詞彙，沒有新詞彙／示範卡',rv.on&&rv.k==='review'&&rv.items.length>=1&&rv.items.every(x=>x[1]!=='new'&&x[0]!=='expose'),rv);
await p.evaluate(()=>{leave()});
T('沒有頁面錯誤',errs.length===0,errs.slice(0,2));
console.log(`E2E ${P} pass / ${F} fail`);await b.close();process.exit(F?1:0)})();
