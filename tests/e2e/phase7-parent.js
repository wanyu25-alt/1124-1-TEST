// 新版第05階段（Chromium 模擬，不是真機）：家長專區實際點擊——六個分頁、日期篩選、一鍵複習建立實際遊戲、生活觀察、教師設定模板、匯出入
const {chromium}=require('playwright');const fs=require('fs');let P=0,F=0;const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:900,height:900},acceptDownloads:true});await ctx.addInitScript(()=>{window.__P39FULL=true});/*v22.6.5：用原本 19 個後台分頁*/const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8124/1124-1-TEST/');await p.waitForFunction(()=>typeof PAR!=='undefined'&&S&&S.cards&&S.cards.length>=8,null,{timeout:40000});await p.waitForTimeout(1200);
await p.evaluate(()=>{window.confirm=()=>true;window.alert=m=>{window.__al=m};S.set.music=false;S.set.sound=false;V2.prepDone=true;S.set.ap=false;S.set.anim=false;S.set.lm='quiet';save();
 window.__n=0;const t=d=>Date.now()-d*864e5-36e5,cs=S.cards.filter(c=>c.img&&!c.part).slice(0,8);
 const add=(w,game,o)=>{o=o||{};const out=o.out||'correct';S.recs.push({sv:1,id:'E'+(window.__n++),learnerId:LRN.id(),itemId:w,itemKind:'word',itemText:byId(w).text,game,outcome:out,independent:out==='correct'&&!(o.h),hints:o.h?[{type:'P1'}]:[],first:{result:out==='correct'?'correct':'wrong'},final:{},ts:t(o.d||0),session:{id:'s'+(o.d||0)},ext:{aid:{hint:'none'}},purpose:'assess',stage:2,tries:0,durMs:25000,pk:game==='pick'?{sub:'word',n:3}:undefined})};
 for(let i=0;i<4;i++){add(cs[0].id,'key',{d:i});add(cs[0].id,'pick',{d:i})}add(cs[1].id,'speak',{d:1,h:1});add(cs[2].id,'pick',{d:1,out:'wrong'});add(cs[3].id,'pick',{d:2});add(cs[5].id,'pick',{d:12});add(cs[4].id,'pick',{d:3});VP._k=null;save();window.__ws=cs.map(c=>c.id)});
/* v22.6.4：學習分析頁只顯示兩個分頁；原本六個分頁的函式都保留，這個測試切回原本六個分頁，繼續檢查它們的功能 */
await p.evaluate(()=>{PAR.TABS=PAR.TABS0;PAR.sec=Object.assign(PAR.sec,PAR.sec0);tab(4)});await p.waitForTimeout(600);
let h=await p.evaluate(()=>document.querySelector('#mid').innerText);
T('家長專區：六個分頁、孩子名字、今日推薦（優先目標、預計時間、建議題數、開始按鈕）',['今天練習','學習成果','待複習詞彙','能力說明','陪伴建議','生活觀察'].every(t=>h.includes(t))&&/第一優先/.test(h)&&/預計約/.test(h)&&/建議題數/.test(h)&&/開始今日學習|繼續今日學習/.test(h),h.slice(0,200));
T('家長頁沒有專業統計術語（沒有「獨立率」「P0」「標準差」）',!/獨立率|P0|標準差|信賴區間|顯著/.test(h));
// 近期成果
await p.click('#mid button:has-text("學習成果")');await p.waitForTimeout(300);
h=await p.evaluate(()=>document.querySelector('#mid').innerText);
T('學習成果：近 7 天預設，列出練習次數／時間／詞彙數，不含星星',/練習次數/.test(h)&&/累積練習時間/.test(h)&&/練習過的詞彙/.test(h)&&!/⭐/.test(h.split('小提醒')[0].replace('星星是遊戲獎勵，不代表語言能力進步，這裡不使用',''))&&/近 7 天/.test(h),h.slice(0,300));
const w7=await p.evaluate(()=>PAR.stats().words);await p.click('#mid button:has-text("近 30 天")');await p.waitForTimeout(300);
const w30=await p.evaluate(()=>PAR.stats().words);T('切換近 30 天：詞彙數增加（近 12 天的紀錄納入）',w30>w7,[w7,w30]);
await p.click('#mid button:has-text("自選日期")');await p.waitForTimeout(300);T('自選日期：出現兩個日期欄位',(await p.$$('#mid input[type=date]')).length===2);
// 待複習
await p.click('#mid button:has-text("待複習詞彙")');await p.waitForTimeout(300);
h=await p.evaluate(()=>document.querySelector('#mid').innerText);
T('待複習：顯示詞彙、原因、建議、最近練習日期，並有七種直接複習入口',/最近練習：/.test(h)&&/建議：/.test(h)&&['一鍵複習全部待加強','複習勾選的','最近答錯的','最近需要提示的','其他模式學過','依學習模式','依教材分類'].every(t=>h.includes(t)),h.slice(0,400));
T('待複習清單有詞彙圖片',(await p.$$('#mid img')).length>=2);
// 一鍵複習
await p.click('#mid button:has-text("一鍵複習全部待加強")');await p.waitForTimeout(1500);
const g=await p.evaluate(()=>({on:G.on,n:G.q&&G.q.length,flow:G.flow,txt:(document.querySelector('#mid')||{}).innerHTML.length,ids:G.q.map(q=>q.id)}));
T('按一下就進入實際遊戲題目（不是回到首頁重選設定）',g.on&&g.n>=2&&g.flow&&g.txt>200,g);
T('題目都來自待複習清單',await p.evaluate(()=>G.q.every(q=>PAR.review().some(w=>w.id===q.id))));
// 作答第一題（若是選圖題）後離開
await p.evaluate(()=>{if(document.querySelectorAll('.pko:not(.dis)').length&&G.pk)PICK.choose(G.pk.ci)});await p.waitForTimeout(800);
await p.evaluate(()=>{leave()});await p.waitForTimeout(500);
T('離開遊戲後作答紀錄寫入（新增紀錄且以詞彙 ID 儲存）',await p.evaluate(()=>S.recs.length)>=14);
// 口語模式複習：切換學習模式
await p.evaluate(()=>{tab(4);PAR.ui.sec='rev';home()});await p.waitForTimeout(400);
await p.click('#mid button:has-text("口語練習")');await p.waitForTimeout(1500);
T('依學習模式（口語）直接開始：學習模式已切換、題目為說詞',await p.evaluate(()=>V2.lm()==='oral'&&G.on&&G.q.every(q=>q._step==='speak')));
await p.evaluate(()=>{leave();S.set.lm='quiet';save()});await p.waitForTimeout(300);
// 能力說明、陪伴建議
await p.evaluate(()=>{tab(4);PAR.ui.sec='ab';home()});await p.waitForTimeout(300);
h=await p.evaluate(()=>document.querySelector('#mid').innerText);
T('能力說明：七項家長版名稱與四種狀態用語',['語意理解','詞彙提取','語意組織','組合彈性','表達獨立性','語言類化','溝通主動性'].every(t=>h.includes(t))&&/尚未觀察/.test(h)&&/聽得懂詞彙/.test(h));
await p.evaluate(()=>{PAR.ui.sec='tip';home()});await p.waitForTimeout(300);
h=await p.evaluate(()=>document.querySelector('#mid').innerText);T('陪伴建議：每項附依據',/先等待幾秒/.test(h)&&/依據：/.test(h)&&/延遲必要的協助/.test(h));
// 生活觀察（實際填表）
await p.evaluate(()=>{PAR.ui.sec='ob';home()});await p.waitForTimeout(300);
await p.fill('#par_txt','我要喝水');await p.selectOption('#par_how','asked');await p.fill('#par_place','客廳');await p.fill('#par_who','媽媽');await p.fill('#par_note','午餐時');
const nr=await p.evaluate(()=>S.recs.length);await p.click('#mid button:has-text("儲存這筆觀察")');await p.waitForTimeout(400);
T('生活觀察存入：內容、方式、地點、對象；遊戲紀錄數不變',await p.evaluate(([n])=>{const o=OB.all().slice(-1)[0];return o.text==='我要喝水'&&o.how==='asked'&&o.settingNote==='客廳'&&o.partner==='媽媽'&&o.initiated==='n'&&S.recs.length===n&&o.by==='parent'},[nr]));
T('儲存後頁面出現確認文字與最近紀錄',/已儲存/.test(await p.evaluate(()=>document.querySelector('#mid').innerText))&&/我要喝水/.test(await p.evaluate(()=>document.querySelector('#mid').innerText)));
// 教師設定模板
await p.evaluate(()=>{tab(2);sub='par';tch()});await p.waitForTimeout(300);
await p.fill('#pt_title','吃飯時');await p.fill('#pt_text','吃飯時請孩子拿{詞}，先等他自己說');await p.click('#sp button:has-text("新增模板")');await p.waitForTimeout(300);
T('教師新增生活情境模板',await p.evaluate(()=>PAR.st().tpl.length===1));
await p.evaluate(()=>{tab(4);PAR.ui.sec='tip';home()});await p.waitForTimeout(300);
T('家長陪伴建議出現模板（{詞} 換成孩子最近練習的詞彙）',/吃飯時請孩子拿詞|吃飯時請孩子拿/.test(await p.evaluate(()=>document.querySelector('#mid').innerText))&&!/\{詞\}/.test(await p.evaluate(()=>document.querySelector('#mid').innerText)));
// 權限：新增第二位個案，家長頁看不到
await p.evaluate(()=>{LRN.add('別人家的孩子');home()});await p.waitForTimeout(300);
T('其他個案名稱不出現在家長專區與切換清單',!/別人家的孩子/.test(await p.evaluate(()=>document.querySelector('#mid').innerText+document.body.innerHTML.slice(0,100000).match(/<select[^>]*>[\s\S]*?<\/select>/g)?.join('')))); 
// 匯出入：模板隨教材 ZIP
const dl=p.waitForEvent('download');await p.evaluate(()=>{tab(2);sub='io';tch()});await p.click('text=⬇ 匯出完整教材 ZIP');const d=await dl;await d.saveAs('/tmp/par-export.zip');
T('教材 ZIP 含 parent.json（模板）',/parent\.json/.test(fs.readFileSync('/tmp/par-export.zip').toString('latin1')));
const c2=await b.newContext({viewport:{width:900,height:900}});await c2.addInitScript(()=>{window.__P39FULL=true});const p2=await c2.newPage();p2.on('pageerror',e=>errs.push('B:'+e.message));
await p2.goto('http://localhost:8124/1124-1-TEST/');await p2.waitForFunction(()=>typeof PAR!=='undefined'&&S&&S.cards&&S.cards.length>=8,null,{timeout:40000});await p2.waitForTimeout(800);
await p2.evaluate(()=>{window.confirm=()=>true;window.alert=()=>{};tab(2);sub='io';tch()});await p2.setInputFiles('#iof1','/tmp/par-export.zip');await p2.waitForSelector('text=確認匯入',{timeout:15000}).catch(()=>{});
await p2.evaluate(()=>{const e=document.querySelector('input[name=iom][value=merge]');if(e)e.checked=true});await p2.click('button:has-text("確認匯入")').catch(async()=>{await p2.evaluate(()=>ioApply())});await p2.waitForTimeout(2500);
T('另一台裝置匯入後，老師的生活情境模板還在',await p2.evaluate(()=>(S.par&&S.par.tpl||[]).some(t=>t.title==='吃飯時')));
T('沒有頁面錯誤',errs.length===0,errs.slice(0,3));
console.log('e2e phase7:',P,'pass',F,'fail');await b.close();process.exit(F?1:0)})();
