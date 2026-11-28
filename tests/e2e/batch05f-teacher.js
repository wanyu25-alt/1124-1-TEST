// v22.6.5 第05-F批：後台更改整理（9 個分頁）、資料搬家（只帶教材）、學生名單、教學設定精簡
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),os=require('os');
const BASE='http://localhost:'+(process.env.E2E_PORT||8124)+'/1124-1-TEST/';let P=0,F=0;
const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x===undefined?null:x).slice(0,600))};
const AS=fs.readFileSync(path.join(__dirname,'lib','audio-stub.js'),'utf8');
const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
const open=async(b)=>{const ctx=await b.newContext({viewport:{width:1280,height:900},acceptDownloads:true});await ctx.addInitScript({content:AS});
 const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));await p.goto(BASE);
 await p.waitForFunction(()=>typeof S!=='undefined'&&S.cards&&S.cards.length>=1000&&S.lrn&&typeof P39!=='undefined',null,{timeout:60000});await p.waitForTimeout(800);
 await p.evaluate(()=>{window.confirm=()=>true;window.alert=()=>{};window.sl=ms=>new Promise(r=>setTimeout(r,ms))});return{ctx,p}};
(async()=>{const b=await chromium.launch();const {ctx,p}=await open(b);
 const tabs=await p.evaluate(async()=>{UI.navTo(2);await sl(400);return[...document.querySelectorAll('#tch .sub button')].map(x=>x.textContent.trim())});
 T('F1 後台分頁：9 個，順序正確',JSON.stringify(tabs)===JSON.stringify(['🖼 詞彙管理','📖 詞彙庫','🏷 分類管理','🧭 學習分析','📦 資料搬家與備份','👤 學生名單','⚙ 教學設定','🔒 密碼與隱私','✏ 自訂組合與句子（進階）']),tabs);
 const hid=await p.evaluate(async()=>{const o={};for(const k of ['lm','za','ob','as','rc','par','sec']){sub=k;tch();await sl(150);o[k]=sub}return o});
 T('F2 隱藏的分頁導到最接近的新分頁',JSON.stringify(hid)===JSON.stringify({lm:'set',za:'set',ob:'la',as:'la',rc:'la',par:'cards',sec:'io'}),hid);
 const grp=await p.evaluate(async()=>{const o={};P39.go('ana');await sl(200);o.ana=[...document.querySelectorAll('#tch .p39s button')].map(x=>x.textContent);sub='log';tch();await sl(200);o.log=!!document.querySelector('#tch .p39s button.on')&&document.querySelector('#tch .p39s button.on').textContent;
  P39.go('adv');await sl(200);o.adv=[...document.querySelectorAll('#tch .p39s button')].map(x=>x.textContent);o.note=/進階功能，平常不用設定/.test(document.getElementById('tch').textContent);return o});
 T('F3 學習分析合併熟悉度／儀表板／練習紀錄；進階頁合併詞彙組合與語句並附說明',JSON.stringify(grp.ana)===JSON.stringify(['熟悉度（Level／主題）','儀表板與報表','練習紀錄'])&&grp.log==='練習紀錄'&&JSON.stringify(grp.adv)===JSON.stringify(['詞彙組合','語句與情境'])&&grp.note,grp);
 const full=await p.evaluate(async()=>{P39.full=true;sub='rc';tch();await sl(200);const n=document.querySelectorAll('#tch .sub button').length,s=sub;P39.full=false;return{n,s}});
 T('F4 P39.full=true 可叫出原本 19 個分頁',full.n===19&&full.s==='rc',full);
 const lr=await p.evaluate(async()=>{P39.go('lr');await sl(300);const sp=document.getElementById('sp'),n0=S.lrn.list.length;const vis=[...sp.children].filter(e=>e.style.display!=='none');
  document.getElementById('lr_new').value='測試學生';[...sp.querySelectorAll('button')].find(x=>/新增個案/.test(x.textContent)).click();await sl(300);
  return{vis:vis.length,det:!!sp.querySelector('details'),closed:!(sp.querySelector('details')||{}).open,h:sp.querySelector('h3').textContent,add:S.lrn.list.length===n0+1&&S.lrn.list.some(x=>x.name==='測試學生')}});
 T('F5 學生名單：只顯示名單與摺疊的學習設定，可以新增學生',lr.vis===2&&lr.det&&lr.closed&&lr.h==='👤 學生名單'&&lr.add,lr);
 const s0=await p.evaluate(()=>JSON.stringify(S.set));
 const st=await p.evaluate(async()=>{P39.go('set');await sl(300);const sp=document.getElementById('sp'),t=sp.textContent;
  return{n:/每關題目數量/.test(t),hl:/提示階梯/.test(t),mus:/音樂來源/.test(t),name:/學生稱呼/.test(t),stage:/整個學習階段完成/.test(t),
   gone:['開啟音效','老師語音回饋','真人操作引導語音','音效音量','老師語音音量','背景音樂音量','詞語語音音量','麥克風靈敏度','動畫效果'].filter(x=>[...sp.querySelectorAll('label')].some(l=>l.textContent.includes(x))),
   vs:!!sp.querySelector('details #vsp'),last:sp.lastElementChild.tagName}});
 T('F6 教學設定只留老師才需要的項目，語音測試收進最後的摺疊區',st.n&&st.hl&&st.mus&&st.name&&st.stage&&!st.gone.length&&st.vs&&st.last==='DETAILS',st);
 T('F7 教學設定頁不改變任何設定值',s0===await p.evaluate(()=>JSON.stringify(S.set)));
 /* 資料搬家：A 電腦加一張自訂圖卡與一筆紀錄 → 匯出 */
 const io2=await p.evaluate(`(async()=>{S.cards.push({id:'p39card',text:'阿嬤',zy:'ㄚ ㄇㄚˊ',cats:[],img:'${PNG}',created:Date.now(),modified:Date.now()});S.logs.push({word:'阿嬤',cat:'ind',tries:0,mode:'key'});save();await sl(300);
  P39.go('io');await sl(300);const sp=document.getElementById('sp');return{two:!!sp.querySelector('#p39ex')&&!!sp.querySelector('#iof1'),adv:!!sp.querySelector('details #iopw')&&!!sp.querySelector('details #iof2'),closed:!sp.querySelector('details').open}})()`);
 T('F8 資料搬家頁：兩個大按鈕（匯出、放入），完整備份收進摺疊區',io2.two&&io2.adv&&io2.closed,io2);
 const [dl]=await Promise.all([p.waitForEvent('download',{timeout:30000}),p.click('#p39ex')]);
 const zp=path.join(os.tmpdir(),'p39-'+Date.now()+'.zip');await dl.saveAs(zp);const zb=fs.readFileSync(zp).toString('latin1');
 T('F9 匯出的教材檔有圖卡與圖片，沒有學生紀錄',zb.includes('cards.json')&&zb.includes('images/')&&!zb.includes('records.json')&&!zb.includes('progress.json'),{size:zb.length});
 /* B 電腦：原本有自己的圖卡與紀錄 → 放入 */
 const B=await open(b);const q=B.p;
 await q.evaluate(`(async()=>{S.cards.push({id:'p39mine',text:'外婆',zy:'ㄨㄞˋ ㄆㄛˊ',cats:[],created:Date.now(),modified:Date.now()});S.logs.push({word:'外婆',cat:'ind',tries:0,mode:'key'});save();await sl(300);UI.navTo(2);await sl(300);P39.go('io');await sl(300)})()`);
 await q.setInputFiles('#iof1',zp);await q.waitForFunction(()=>!!document.querySelector('#iopv input[name=iom]'),null,{timeout:30000});
 const pv=await q.evaluate(()=>(document.querySelector('input[name=iom]:checked')||{}).value);
 await q.evaluate(()=>[...document.querySelectorAll('#iopv button')].find(x=>x.textContent==='執行匯入').click());
 await q.waitForFunction(()=>S.cards.some(c=>c.id==='p39card'),null,{timeout:30000});await q.waitForTimeout(500);
 const r=await q.evaluate(()=>{const c=S.cards.find(x=>x.id==='p39card');return{img:!!(c&&c.img),mine:S.cards.some(x=>x.id==='p39mine'),logs:S.logs.map(l=>l.word)}});
 T('F10 放入：預設合併；新圖卡與圖片進來了，B 原有圖卡和紀錄還在，A 的紀錄沒有帶過來',pv==='merge'&&r.img&&r.mine&&r.logs.includes('外婆')&&!r.logs.includes('阿嬤'),{pv,...r});
 try{fs.unlinkSync(zp)}catch(e){}
 T('F11 沒有頁面錯誤',!p.errs.length&&!q.errs.length,[...p.errs,...q.errs]);await b.close();console.log(`\n${P} 通過 / ${F} 失敗`);process.exit(F?1:0)})().catch(e=>{console.error('CRASH',e);process.exit(2)});
