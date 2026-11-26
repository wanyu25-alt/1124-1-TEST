// 新版第07階段（Chromium 模擬，不是真機）：教師專區各分析頁、學習總覽、報表
const {chromium}=require('playwright');let P=0,F=0;const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
(async()=>{const b=await chromium.launch();const pg=await (await b.newContext({viewport:{width:1100,height:900}})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:8124/1124-1-TEST/');await pg.waitForFunction(()=>typeof P16!=='undefined'&&S&&S.cards&&S.cards.length>=1,null,{timeout:40000});await pg.waitForTimeout(1200);
await pg.evaluate(()=>{window.confirm=()=>true;window.alert=m=>{window.__al=m};V2.prepDone=true;LRN.add('乙');S.ob=[{id:'o1',learnerId:LRN.id(),ts:Date.now()-864e5,text:'我要喝水',initiated:'y',prompted:'none',mode:'oral',observer:'家長',src:'real_life'}];save();sub='dash';DSH.ui.view='ovw';tab(2);tch()});
await pg.waitForSelector('text=學習總覽（全部個案）');
T('教師後台有「學習總覽」分頁，列出全部個案與開啟分析按鈕',(await pg.$$('button:has-text("開啟分析")')).length===2);
await pg.click('button:has-text("開啟分析") >> nth=1');await pg.waitForSelector('text=語文延伸能力（獨立分析');
T('按「開啟分析」會切到該個案並進入能力儀表板（語文延伸另外呈現）',await pg.evaluate(()=>S.lrn.cur===S.lrn.list[1].id&&!!document.body.innerText.match(/指標計算說明/)));
for(const [v,k] of [['heat','詞彙熟悉度'],['hint','提示'],['err','詞彙組合困難'],['rpt','報表']]){await pg.evaluate(v=>{DSH.ui.view=v;tch()},v);T('分頁「'+v+'」可顯示',(await pg.textContent('#sp')).includes(k)&&!/undefined|NaN/.test(await pg.textContent('#sp')));}
await pg.evaluate(()=>{LRN.switchTo(S.lrn.list[0].id);DSH.ui.view='rpt';tch();RPT.open()});await pg.waitForSelector('#prt');
const t=await pg.textContent('#prt');
T('列印摘要含識別資料、語文延伸、熟悉度、近期進步、待加強、建議教學方式、生活觀察，並聲明非診斷報告',['基本識別資料','語文延伸能力','詞彙熟悉度','近期學習進步','待加強能力','建議教學方式','生活觀察紀錄','我要喝水'].every(x=>t.includes(x))&&/不具臨床診/.test(t));
T('沒有頁面錯誤',errs.length===0,errs.slice(0,3));
console.log('PASS',P,'FAIL',F);await b.close();process.exit(F?1:0)})();
