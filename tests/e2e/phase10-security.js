// 第08階段（新版）（Chromium 模擬，不是真機）：本機儲存、備份檔內容、重新整理後保留、不同瀏覽器不共用資料
const {chromium}=require('playwright');const cp=require('child_process');let P=0,F=0;const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1000,height:900},acceptDownloads:true});const pg=await ctx.newPage();const errs=[],reqs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('request',r=>reqs.push(r.url()));
await pg.goto('http://localhost:8124/1124-1-TEST/');await pg.waitForFunction(()=>typeof P17!=='undefined'&&S&&S.cards&&S.cards.length>=1,null,{timeout:40000});await pg.waitForTimeout(1200);
await pg.evaluate(()=>{window.confirm=()=>true;window.alert=m=>{window.__al=m};V2.prepDone=true;S.cards.push({id:'pa',text:'喝',zy:'ㄏ',img:'',audio:'',cats:[],part:true},{id:'pb',text:'水',zy:'ㄕ',img:'',audio:'',cats:[],part:true});S.cb=[{id:'cbx',parts:['pa','pb'],rel:'act_obj',ok:true,created:1}];
 S.ob=[{id:'ob1',learnerId:LRN.id(),ts:Date.now(),text:'我要水',src:'real_life'}];S.recs.push({id:'RR1',learnerId:LRN.id(),itemId:S.cards[0].id,game:'pick',outcome:'correct',ts:Date.now()});save()});
await pg.waitForTimeout(600);await pg.reload();await pg.waitForFunction(()=>typeof P17!=='undefined'&&S&&S.cb&&S.cb.length===1,null,{timeout:40000});
T('重新整理後，資料還在（自動儲存）：組合、生活觀察、作答紀錄',await pg.evaluate(()=>S.cb.length===1&&S.ob.length===1&&S.recs.some(r=>r.id==='RR1')));
// 安全頁
await pg.evaluate(()=>{window.confirm=()=>true;sub='sec';tab(2)});await pg.waitForSelector('text=教師入口保護（本機原型）');
const t=await pg.textContent('#sp');
T('資料安全頁：原型說明、跨裝置不同步、雲端預留未啟用、上線前未完成清單',/不能取代正式的帳號驗證與伺服器端權限控制/.test(t)&&/不會在不同裝置/.test(t)&&/目前全部未啟用/.test(t)&&/尚未完成/.test(t)&&/檢查通過/.test(t));
T('頁面有顯示備份提醒（有紀錄、還沒備份）',/還沒有做過完整備份/.test(t));
// 匯出完整備份
const dl=pg.waitForEvent('download');await pg.evaluate(()=>ioExport('full'));const d=await dl;await d.saveAs('/tmp/e2e-full.zip');
const names=cp.execSync('unzip -Z1 /tmp/e2e-full.zip').toString().split('\n');
T('完整備份 ZIP 內有教材（組合）、生活觀察、評量修正、個案紀錄',['manifest.json','teaching.json','observations.json','assessment.json','learners.json','records.json'].every(n=>names.includes(n)),names);
const man=JSON.parse(cp.execSync('unzip -p /tmp/e2e-full.zip manifest.json').toString());
T('備份清單有資料版本與 SHA-256',man.dataVersion===3&&man.files['teaching.json']&&/^[0-9a-f]{64}$/.test(man.files['teaching.json'].sha256),man.build);
await pg.evaluate(()=>{sub='sec';tab(2)});await pg.waitForTimeout(400);
T('備份後提醒消失，並記錄備份時間',!/還沒有做過完整備份/.test(await pg.textContent('#sp'))&&await pg.evaluate(()=>S.lastFullBackupAt>0));
// 不同瀏覽器（新的 context）不共用資料：沒有跨裝置同步
const ctx2=await b.newContext();const p2=await ctx2.newPage();await p2.goto('http://localhost:8124/1124-1-TEST/');await p2.waitForFunction(()=>typeof P17!=='undefined'&&S&&S.cards,null,{timeout:40000});await p2.waitForTimeout(1200);
T('另一個瀏覽器環境看不到這份資料（目前沒有跨裝置同步）',await p2.evaluate(()=>!(S.cb||[]).length&&!(S.ob||[]).length&&!S.recs.some(r=>r.id==='RR1')));
// 網路：除了本站靜態檔案，沒有任何對外連線
const ext=reqs.filter(u=>!u.startsWith('http://localhost:8124/')&&!u.startsWith('data:')&&!u.startsWith('blob:'));
T('整個過程沒有任何對外網路連線（沒有把資料傳給第三方）',ext.length===0,ext.slice(0,3));
T('沒有頁面錯誤',errs.length===0,errs.slice(0,3));
console.log('PASS',P,'FAIL',F);await b.close();process.exit(F?1:0)})();
