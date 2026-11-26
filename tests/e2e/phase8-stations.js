// 第06階段（新版）（Chromium 模擬，不是真機）：六站新增題型從畫面實際操作
const {chromium}=require('playwright');let P=0,F=0;const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',PNG2=PNG.replace('AAAA','AAAB');
(async()=>{const b=await chromium.launch();const pg=await (await b.newContext({viewport:{width:820,height:1000}})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:8124/1124-1-TEST/');await pg.waitForFunction(()=>typeof P15!=='undefined'&&S&&S.cards&&S.cards.length>=1,null,{timeout:40000});await pg.waitForTimeout(1200);
await pg.evaluate(([png,png2])=>{window.confirm=()=>true;window.alert=m=>{window.__al=m};S.set.music=false;S.set.sound=false;V2.prepDone=true;S.set.anim=false;S.set.ap=false;
 S.cats=[{id:'fr',name:'水果',order:[]},{id:'an',name:'動物',order:[]}];
 S.cards=[['a','蘋果','fr'],['b','香蕉','fr'],['c','貓','an'],['d','狗','an'],['e','魚','an'],['f','橘子','fr']].map(([id,t,c])=>({id:id,text:t,zy:'ㄅㄚ',img:png,audio:'',cats:[c],created:1,modified:1}));
 S.cx={a:{gimgs:[{id:'IMG-a-g1',img:png2,note:'',created:1}]}};save();UI.pick('quiet')},[PNG,PNG2]);
// 第 3 站：自選題型「詞彙分類」
await pg.evaluate(()=>{FL.open(3)});await pg.waitForSelector('.fgob',{state:'attached'});
const xs=async()=>pg.evaluate(()=>FL.extras(FL.st,FL.modeOf()).map(x=>x.t));const sel=async re=>{const l=await xs();const i=l.findIndex(t=>re.test(t));await pg.evaluate(i=>FL.setAct('x'+i),i);return i};const opts=await xs();
T('第 3 站「進階」延伸活動清單（v21.0：畫面不再手動選題型，改以程式層級驗證）有詞彙分類與各種配對',opts.some(t=>/詞彙分類/.test(t))&&opts.some(t=>/人物與動作/.test(t))&&opts.some(t=>/感受與情境/.test(t)),opts);

await sel(/詞彙分類/);await pg.waitForTimeout(200);
T('選了題型後，畫面說明這個題型在練習什麼、觀察什麼指標',/這個題型在練習/.test(await pg.textContent('body'))&&/詞彙分類/.test(await pg.textContent('.fobj')));
await pg.click('.fgob');await pg.waitForTimeout(500);await pg.evaluate(()=>{if(S.set.mode==='expose')EXP.done()});await pg.waitForSelector('#catq',{timeout:8000});
const q=await pg.textContent('#catq');T('題目顯示「哪一個是○○」',/哪一個是「(水果|動物)」/.test(q),q);
const right=await pg.evaluate(()=>G.pk.ci);await pg.click(`.pko >> nth=${right}`);await pg.waitForTimeout(1500);
const rec=await pg.evaluate(()=>S.recs[S.recs.length-1]);
T('點選正確圖片後留下紀錄（選圖、分類、答對）',rec&&rec.game==='pick'&&rec.sub==='cat'&&rec.outcome==='correct'&&!!rec.ext.catQ,rec&&{g:rec.game,s:rec.sub,o:rec.outcome});
await pg.evaluate(()=>{if(G.on){try{leave()}catch(e){}}});await pg.waitForTimeout(400);
// 第 2 站（口語）：新圖片說詞
await pg.evaluate(()=>{UI.pick('oral');FL.open(2)});await pg.waitForSelector('.fgob',{state:'attached'});
const o2=await xs();T('第 2 站（口語）有新圖片說詞與看圖說特徵詞',o2.some(t=>/新圖片說詞/.test(t)),o2);
await sel(/新圖片說詞/);await pg.evaluate(()=>FL.setW('all'));/*v21.0：可用詞彙少於預設 5 個時，改用「全部」*/
await pg.click('.fgob');await pg.waitForTimeout(500);await pg.evaluate(()=>{if(S.set.mode==='expose')EXP.done()});await pg.waitForFunction(()=>S.set.mode==='speak'&&G.ni,null,{timeout:8000});await pg.waitForTimeout(300);
T('說詞題顯示的是類化圖片，不是原圖',await pg.evaluate(()=>G.ni&&G.ni.id==='IMG-a-g1'&&document.querySelector('#pic').src===G.ni.img));
await pg.evaluate(()=>{try{leave()}catch(e){}});
// 沒教材的題型：按鈕停用並說原因
await pg.evaluate(()=>{UI.pick('quiet');FL.open(5)});await pg.waitForSelector('.fgob',{state:'attached'});
const o5=await xs();await sel(/人物、動作、物品/);await pg.evaluate(()=>FL.setW('all'));/*v21.0：可用詞彙少於預設 5 個時，改用「全部」*/
const msg=await pg.evaluate(()=>{FL.go();return window.__al||''});
T('第 5 站的句型題型沒有語句教材時不會開空遊戲，會說明原因',!(await pg.evaluate(()=>G.on))&&msg.length>3,msg);
T('沒有頁面錯誤',errs.length===0,errs.slice(0,3));
console.log('PASS',P,'FAIL',F);await b.close();process.exit(F?1:0)})();
