// 第06階段（Chromium 模擬，不是真機）：從「一台裝置」到「另一台全新裝置」的完整流程
// ①A 裝置：加一張自訂圖卡（圖片＋注音＋錄音）、啟用並審核內建詞彙 → 匯出教材 ZIP、匯出預設清單
// ②用 tools/build-materials.mjs 轉成 materials，連同 default-library.json 放進一份網站副本
// ③B 裝置（全新瀏覽器）開啟副本網站 → 自訂圖卡、原本 18 張、預設詞彙清單都自動出現
const {chromium}=require('playwright');const fs=require('fs');const cp=require('child_process');let P=0,F=0;const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',AUD='data:audio/mp4;base64,AAAAGGZ0eXBtcDQyAAAAAG1wNDJpc29t';
(async()=>{const b=await chromium.launch();const A=await (await b.newContext({viewport:{width:1100,height:900},acceptDownloads:true})).newPage();const errs=[];A.on('pageerror',e=>errs.push('A:'+e.message));
await A.goto('http://localhost:'+(process.env.E2E_PORT||8124)+'/1124-1-TEST/');await A.waitForFunction(()=>typeof LIB!=='undefined'&&S&&S.cards&&S.cards.length>=18&&LIB.base,null,{timeout:40000});await A.waitForTimeout(1200);
await A.evaluate(([png,aud])=>{window.confirm=()=>true;window.alert=m=>{window.__al=m};S.cards.push({id:'mycard1',text:'我的自訂',zy:'ㄨㄛˇ ㄉㄜ˙ ㄗˋ ㄧㄥˇ',img:png,audio:aud,cats:[],created:1,modified:1});
 const ids=LIB.base.filter(w=>w.categoryId==='CAT05'&&w.images.length===1).slice(0,3).map(w=>w.id);LIB.setEn(ids,true);LIB.setRv(ids,'approved');LIB.setZy(ids[0],'ㄅㄅ ㄆㄆ');save();window.__ids=ids},[PNG,AUD]);
const base=await A.evaluate(()=>S.cards.filter(c=>!c.lib).length);
// 匯出預設清單
const d1=A.waitForEvent('download');await A.evaluate(()=>{tab(2);sub='lib';tch()});await A.waitForSelector('text=匯出預設清單');await A.click('text=⬇ 匯出預設清單');const dl1=await d1;await dl1.saveAs('/tmp/e2e-default.json');
const dj=JSON.parse(fs.readFileSync('/tmp/e2e-default.json','utf8'));
T('匯出預設清單：檔名 default-library.json、啟用 3 個、不含 Base64',dl1.suggestedFilename()==='default-library.json'&&dj.counts.enabled===3&&!JSON.stringify(dj).includes('data:'),dl1.suggestedFilename());
// 匯出教材 ZIP
const d2=A.waitForEvent('download');await A.evaluate(()=>{sub='io';tch()});await A.click('text=⬇ 匯出完整教材 ZIP');const dl2=await d2;await dl2.saveAs('/tmp/e2e-materials.zip');
T('匯出教材 ZIP 成功',fs.statSync('/tmp/e2e-materials.zip').size>1000);
// 做一份網站副本
cp.execSync('rm -rf /tmp/site2 && mkdir /tmp/site2 && cd /home/claude/repo && git archive HEAD 2>/dev/null | tar x -C /tmp/site2 && cp index.html /tmp/site2/index.html && rm -rf /tmp/site2/vocab && cp -r $(bash tools/make-legacy-vocab.sh)/vocab /tmp/site2/vocab && cp -r tools /tmp/site2/ 2>/dev/null; true',{shell:'/bin/bash'});
const out=cp.execSync('cd /tmp/site2 && node tools/build-materials.mjs /tmp/e2e-materials.zip 2>&1',{encoding:'utf8'});
const cj=JSON.parse(fs.readFileSync('/tmp/site2/materials/cards.json','utf8'));const mine=cj.cards.find(c=>c.id==='mycard1');
T('轉成 materials：自訂圖卡帶圖片與錄音、共 '+base+' 張、不含內建詞彙卡',!!mine&&!!mine.image&&!!mine.audio&&cj.cards.length===base&&!cj.cards.some(c=>/^VOC/.test(c.id)),{n:cj.cards.length,base,out:out.slice(-200)});
T('原本 18 張示範圖卡仍在 materials',['j70gjdd','dlgoxik','88ywvqo'].every(id=>cj.cards.some(c=>c.id===id)));
fs.copyFileSync('/tmp/e2e-default.json','/tmp/site2/vocab/default-library.json');
const srv=cp.spawn('node',['sv4.mjs','/tmp/site2','8125'],{cwd:'/tmp/e2e',stdio:'ignore'});await new Promise(r=>setTimeout(r,1200));
// B 裝置：全新瀏覽器
const Bc=await b.newContext({viewport:{width:900,height:900}});const B=await Bc.newPage();B.on('pageerror',e=>errs.push('B:'+e.message));
await B.goto('http://localhost:8125/1124-1-TEST/');await B.waitForFunction(()=>typeof LIB!=='undefined'&&S&&S.cards&&S.cards.some(c=>c.id==='mycard1')&&S.cards.some(c=>c.lib),null,{timeout:40000});await B.waitForTimeout(800);
const r=await B.evaluate(()=>{const c=byId('mycard1');return{n:S.cards.filter(x=>!x.lib).length,lib:S.cards.filter(x=>x.lib).length,img:!!(c.img&&c.img.startsWith('data:image/')),aud:!!(c.audio&&c.audio.startsWith('data:audio/')),zy:c.zy,zyEdit:byId(__ids0()).zy,state:LIB.defInfo.state,imgs:S.cards.filter(x=>x.lib).every(x=>x.img.startsWith('vocab/images/'))};function __ids0(){return S.cards.find(x=>x.lib&&x.zy==='ㄅㄅ ㄆㄆ')?S.cards.find(x=>x.lib&&x.zy==='ㄅㄅ ㄆㄆ').id:S.cards.find(x=>x.lib).id}});
T('B 裝置：自訂圖卡（圖片、錄音、注音）自動出現，原本 18 張也在',r.n===base&&r.img&&r.aud&&r.zy==='ㄨㄛˇ ㄉㄜ˙ ㄗˋ ㄧㄥˇ',r);
T('B 裝置：預設詞彙清單自動套用（3 個詞彙、審核與注音修改帶過來、圖片是網站圖）',r.lib===3&&r.state==='applied'&&r.zyEdit==='ㄅㄅ ㄆㄆ'&&r.imgs,r);
// 看圖題實際顯示
await B.evaluate(()=>{window.confirm=()=>true;S.set.music=false;S.set.sound=false;V2.prepDone=true;S.set.anim=false;S.set.mode='pick';S.set.src='c:LIB-CAT05';save()});
const shown=await B.evaluate(()=>{const p=pool().filter(c=>c.lib);return p.length});
T('B 裝置：看圖題範圍包含這 3 個已審核的詞彙',shown===3,shown);
// 本機已有設定 → 不覆蓋
await B.evaluate(()=>{const id=S.cards.find(x=>x.lib).id;LIB.setEn([id],false);return save()});await B.waitForTimeout(500);await B.reload();await B.waitForFunction(()=>typeof LIB!=='undefined'&&LIB.defInfo&&LIB.defInfo.state!==undefined&&S.cards.some(c=>c.id==='mycard1'),null,{timeout:30000});await B.waitForTimeout(1500);
T('重新整理後不會把老師在本機停用的詞彙再打開（本機優先）',await B.evaluate(()=>S.cards.filter(x=>x.lib).length)===2);
T('沒有頁面錯誤',errs.length===0,errs.slice(0,3));
console.log('e2e phase6:',P,'pass',F,'fail');await b.close();srv.kill();process.exit(F?1:0)})();
