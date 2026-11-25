const {chromium}=require('playwright');
const URL='http://localhost:8124/1124-1-TEST/';let P=0,F=0;const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
(async()=>{const b=await chromium.launch({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
const ctx=await b.newContext({viewport:{width:1100,height:800}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(URL);await p.waitForFunction(()=>typeof UI!=='undefined'&&S&&S.cards&&S.cards.length&&S.lrn,null,{timeout:40000});await p.waitForTimeout(1200);
await p.evaluate(()=>{window.confirm=()=>true;window.alert=()=>{};S.set.music=false;S.set.sound=false;S.set.hz={...(S.set.hz||{}),free:true};V2.prepDone=true;S.set.n=3;save()});
const navs=await p.$$eval('nav button',e=>e.map(x=>x.textContent.trim()));
T('功能列恰為 首頁／家長專區／設定／教師專區',JSON.stringify(navs)==='["🏠 首頁","👪 家長專區","⚙ 設定","🧑‍🏫 教師專區"]',navs);
const body=await p.evaluate(()=>document.body.innerText);T('畫面上沒有「學生遊戲」入口',!/學生遊戲/.test(body),null);
T('首頁只有三個主要學習入口',(await p.$$('.mc')).length===3&&(await p.$$('#mid .vc')).length===0,null);
const titles=await p.$$eval('.mc b',e=>e.map(x=>x.textContent));T('三入口名稱',JSON.stringify(titles)==='["聽讀練習","口語練習","綜合練習"]',titles);
const desc=await p.$$eval('.mc .ms',e=>e.map(x=>x.textContent));T('三入口簡短說明',JSON.stringify(desc)==='["聽一聽、認一認、拼一拼","想一想、說一說","聽、說、認、拼，一起練習"]',desc);
// 無效按鈕掃描
const scan=async(name)=>{const r=await p.evaluate(()=>{const bad=[];document.querySelectorAll('#mid [onclick],#mid [onchange],#mid [oninput],nav [onclick]').forEach(e=>{const code=e.getAttribute('onclick')||e.getAttribute('onchange')||e.getAttribute('oninput');const ids=(code.match(/[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*(?=\()/g)||[]).filter(x=>!/^(this|if|function|Math|\+)/.test(x)&&!/^(Math|document|S\.set|\$)\b/.test(x));ids.slice(0,2).forEach(n=>{try{if(typeof eval(n)!=='function')bad.push(n)}catch(e){bad.push(n+'!')}})});return bad});T('「'+name+'」按鈕事件皆指向存在的函式',r.length===0,r)};
await scan('首頁');
await p.click('#n4');await p.waitForTimeout(600);let v=await p.evaluate(()=>({tab:UI.curTab,on:[...document.querySelectorAll('nav button.on')].map(b=>b.id),txt:document.querySelector('#mid').innerText.slice(0,200),stuHidden:document.querySelector('#stu').classList.contains('hide')}));
T('家長專區：顯示今日學習與推薦、功能列高亮',v.tab===4&&v.on.join()==='n4'&&/今日|學習|推薦/.test(v.txt)&&!v.stuHidden,v);await scan('家長專區');
await p.click('#n5');await p.waitForTimeout(600);v=await p.evaluate(()=>({tab:UI.curTab,on:[...document.querySelectorAll('nav button.on')].map(b=>b.id),txt:document.querySelector('#mid').innerText}));
T('設定：聲音／學習輔助／輸入方式／麥克風／畫面',v.tab===5&&v.on.join()==='n5'&&['聲音','學習輔助','輸入方式','麥克風','畫面'].every(k=>v.txt.includes(k)),v.txt.slice(0,120));await scan('設定');
// 設定實際改變資料
await p.evaluate(()=>{FL.setDefN(10);const s=document.querySelector('#inmode');s.value='touch';s.dispatchEvent(new Event('change'))});
const st=await p.evaluate(()=>({n:FL.mem().n,input:S.set.input,picked:S.set.inputPicked}));T('設定頁修改預設題數與輸入方式會寫入設定',st.n===10&&st.input==='touch'&&st.picked===true,st);
await p.evaluate(()=>{S.set.input='phys';S.set.inputPicked=false;S.set.n=3;FL.mem().n=null;save()});
await p.click('#n2');await p.waitForTimeout(800);v=await p.evaluate(()=>({tab:UI.curTab,on:[...document.querySelectorAll('nav button.on')].map(b=>b.id),tch:!document.querySelector('#tch').classList.contains('hide'),txt:document.querySelector('#tch').innerText.slice(0,300)}));
T('教師專區可進入（顯示驗證或管理畫面）',v.tab===2&&v.on.join()==='n2'&&v.tch&&v.txt.length>5,v);
// 教師專區原有分頁都在
const subs=await p.evaluate(()=>{if(S.acl&&S.acl.h&&ACL.locked&&ACL.locked())return 'locked';return [...document.querySelectorAll('#tch .sub button')].map(b=>b.textContent.trim())});console.log('教師分頁',JSON.stringify(subs));
// 真實點擊流程：聽讀 → 六站地圖 → 第 1 站 → 開始練習 → 離開 → 回首頁
await p.click('#n1');await p.waitForTimeout(500);await p.click('.mc-quiet');await p.waitForTimeout(500);
v=await p.evaluate(()=>({view:UI.view,st:document.querySelectorAll('#mid .stc').length,vc:document.querySelectorAll('#mid .vc').length,lm:S.set.lm,back:!!document.querySelector('#mid .bk button')}));
T('點「聽讀練習」→ 顯示六站地圖（沒有交通工具選單），學習模式=安靜',v.view==='mode'&&v.st===6&&v.vc===0&&v.lm==='quiet'&&v.back,v);
await p.click('.stc >> nth=0 >> text=進入這一站');await p.waitForTimeout(400);await p.click('.fgob');await p.waitForTimeout(2500);
const g=await p.evaluate(()=>({on:G.on,mode:S.set.mode,micNow:!!MIC.st}));T('設定頁按「開始練習」後開始練習，且聽讀不開麥克風',g.on&&!g.micNow,g);
await p.click('#n1');await p.waitForTimeout(500);const ov=await p.evaluate(()=>!!document.querySelector('#hm'));T('練習中按首頁會先詢問',ov,null);
await p.click('#hm .btn.alt');await p.waitForTimeout(800);v=await p.evaluate(()=>({on:G.on,view:UI.view,mc:document.querySelectorAll('.mc').length,vc:document.querySelectorAll('#mid .vc').length}));
T('離開遊戲後遊戲已停止（不留在作答畫面）',!v.on,v);
await p.click('#n1');await p.waitForTimeout(500);v=await p.evaluate(()=>({view:UI.view,mc:document.querySelectorAll('.mc').length}));T('按首頁回到三入口',v.view==='home'&&v.mc===3,v);
// 練習中按設定：詢問後離開
await p.evaluate(()=>UI.pick('quiet'));await p.evaluate(()=>goV('car'));await p.waitForTimeout(2000);await p.click('#n5');await p.waitForTimeout(400);
T('練習中按設定也會先詢問',await p.evaluate(()=>!!document.querySelector('#hm')),null);await p.click('#hm .btn.go');await p.waitForTimeout(400);
T('選「繼續遊戲」後仍在原題',await p.evaluate(()=>G.on&&!G.paused&&!document.querySelector('#hm')),null);
await p.click('#n5');await p.click('#hm .btn.alt');await p.waitForTimeout(800);
T('選「離開」後進入設定',await p.evaluate(()=>!G.on&&UI.curTab===5),null);
T('無頁面錯誤',errs.length===0,errs);console.log('PASS',P,'FAIL',F);await b.close()})();
