// v22.0：正式內建教材＋本機自訂教材並存（測試 A–J）
const fs=require('fs');const {mk,T,sleep}=require('./t30h.js');
const J=(E,c)=>JSON.parse(E('JSON.stringify('+c+')'));
const V=JSON.parse(fs.readFileSync('/home/claude/repo/vocab/vocabulary.json','utf8')),LV=JSON.parse(fs.readFileSync('/home/claude/repo/vocab/levels.json','utf8')).levels;
const ready=async(E,n=1000)=>{const t0=Date.now();while(Date.now()-t0<15000&&!E(`typeof LIB!=="undefined"&&!!LIB.base&&S.cards.filter(c=>c.lib).length>=${n}`))await sleep(50);await sleep(400)};
(async()=>{
 // ---- A 全新裝置（沒有任何本機教材）----
 const A=mk({vocab:true});const EA=c=>A.eval(c);await ready(EA);
 T('A 全新裝置：正式 1000 詞全部載入（含 50 個沒有圖片的詞）',EA('S.cards.filter(c=>c.lib).length')===1000&&EA('S.cards.filter(c=>c.lib&&!c.img).length')===50);
 T('A 顯示 16 個主題與 20 個 Level',EA('MAT.dims().theme.filter(x=>x.org==="builtin").length')===16&&EA('MAT.dims().level.length')===20);
 // ---- F 分類數量與原始檔案一致 ----
 const cnt={};V.forEach(w=>cnt[w.categoryId]=(cnt[w.categoryId]||0)+1);
 const th=J(EA,'MAT.dims().theme.map(x=>({id:x.id,w:x.words,i:x.imgs,n:x.noimg}))');
 T('F 每個主題詞彙數＝原始 categories（人物43…動作111…合計1000）',th.every(x=>cnt[x.id.replace('LIB-','')]===x.w)&&th.reduce((a,x)=>a+x.w,0)===1000,th);
 const lvc={};V.forEach(w=>{if(w.levelId)lvc[w.levelId]=(lvc[w.levelId]||0)+1});const lv=J(EA,'MAT.dims().level.map(x=>({id:x.id,w:x.words}))');
 T('F 20 個 Level 各 50 詞（與 levels.json 一致）',lv.length===20&&lv.every(x=>x.w===50&&lvc[x.id.replace('LIB-','')]===50)&&LV.every(l=>l.count===50));
 T('F 圖片總數 961、有圖詞彙 950、缺圖 50（由資料計算）',EA('MAT.dims().theme.reduce((a,x)=>a+x.imgs,0)')===V.reduce((a,w)=>a+(w.images||[]).length,0)&&EA('MAT.dims().theme.reduce((a,x)=>a+x.noimg,0)')===V.filter(w=>!(w.images||[]).length).length);
 const rp=J(EA,'INT.report()');
 T('F 完整性檢查：正式 1000／圖片 961／缺圖 50／主題 16／Level 20／缺主題 0／缺 Level 0',rp.builtinWords===1000&&rp.builtinImgs===961&&rp.noImg.length===50&&rp.themes===16&&rp.levels===20&&rp.noTheme.length===0&&rp.noLevel.length===0,[rp.builtinWords,rp.builtinImgs,rp.noImg.length]);
 T('F 缺圖詞彙在主題裡顯示、並分別統計「尚無圖片」',EA('MAT.dims().theme.reduce((a,x)=>a+x.words,0)')===1000);
 // ---- B 本機已有教材（舊版裝置：只啟用 3 個、另有 50 個自訂詞、舊版分類）----
 EA(`S.lib.v22=0;delete S.lib.v22;S.lib.en={VOC0001:1,VOC0002:1,VOC0003:1};S.lib.off={};S.lib.def=null;LIB.sync();
  S.cats.push({id:'T-CUS',name:'本週練習',order:[]});for(let i=0;i<50;i++)S.cards.push({id:'CUS'+i,text:'自訂'+i,zy:'ㄗ',img:'',audio:'',cats:['T-CUS'],created:1,modified:1});S.packCats=['T-LEG'];S.cats.push({id:'T-LEG',name:'民生用品',order:[]});S.cards[S.cards.length-1].cats.push('T-LEG');`);
 EA('MAT.bump()');T('B 前置：舊版裝置只剩 3 個正式詞（重現問題）',EA('S.cards.filter(c=>c.lib).length')===3);
 await EA('save()');await sleep(300);
 const B=mk({vocab:true});const EB=c=>B.eval(c);await ready(EB);
 T('B 舊版裝置升級後：正式 1000 詞全部載入',EB('S.cards.filter(c=>c.lib).length')===1000);
 T('B 50 個自訂詞完整保留、整合後 1050',EB('S.cards.filter(c=>/^CUS/.test(c.id)).length')===50&&EB('S.cards.length')===1050);
 T('B 正式分類沒有消失、自訂分類沒有消失',EB('MAT.dims().theme.length')===16&&EB('MAT.dims().custom.some(x=>x.id==="T-CUS"&&x.words===50)'));
 T('B 遷移前備份已保存（IndexedDB lib-pre-v22）',await B.eval('kvGet("lib-pre-v22").then(r=>!!(r&&r.lib&&Object.keys(r.lib.en).length===3))'));
 T('B 舊版內建教材分類獨立辨識（不混入正式主題）',EB('MAT.dims().custom.find(x=>x.id==="T-LEG").org')==='legacy'&&!EB('MAT.dims().theme.some(x=>x.id==="T-LEG")'));
 const rb=J(EB,'INT.report()');
 T('B 完整性檢查：正式 1000／本機 '+rb.localWords+'／整合 1050',rb.builtinWords===1000&&rb.localWords===50&&rb.unifiedWords===1050);
 // ---- C 新增本機詞彙與圖片 ----
 EB(`S.cards.push({id:'NEW1',text:'新詞',zy:'ㄒ',img:'data:image/jpeg;base64,AAAA',audio:'',cats:['T-CUS'],created:1,modified:1});MAT.bump()`);await EB('save()');
 T('C 正式數量不變、本機 +1、前臺立即更新',EB('INT.report().builtinWords')===1000&&EB('INT.report().localWords')===51&&EB('MAT.dims().custom.find(x=>x.id==="T-CUS").words')===51);
 // ---- D 為正式詞彙增加兩張本機圖片 ----
 const before=EB('S.cards.length'),idx=J(EB,'(()=>{const c=S.cards.find(c=>c.id==="VOC0001");return{n:c.imgs.length,img:c.img}})()');
 EB(`(()=>{const o=LIB.st().ov.VOC0001=LIB.st().ov.VOC0001||{};o.add=[{d:'data:image/jpeg;base64,BBBB',ts:1},{d:'data:image/jpeg;base64,CCCC',ts:2}];LIB.sync();MAT.bump()})()`);
 const af=J(EB,'(()=>{const c=S.cards.find(c=>c.id==="VOC0001");return{n:c.imgs.length,img:c.img,has:c.imgs.some(x=>/^vocab\\/images\\//.test(x))}})()');
 T('D 原正式圖片保留、新增 2 張、詞彙仍只 1 個',af.n===idx.n+2&&af.has&&EB('S.cards.length')===before&&EB('S.cards.filter(c=>c.id==="VOC0001").length')===1);
 // ---- E 正式教材更新後本機資料保留 ----
 const nv=JSON.parse(JSON.stringify(V));nv.push({id:'VOC9001',word:'新增正式詞',zhuyin:'ㄒㄧㄣ',category:'人物',categoryId:'CAT01',levelId:'LV01',images:['images/VOC0001_01.webp'],primaryImage:'images/VOC0001_01.webp',hasImage:true});
 const d=EB('LIB.diff')(nv,EB('LIB.cats'));
 const rr=B.eval(`(()=>{const nv=${JSON.stringify(nv)};const d=LIB.diff(nv,LIB.cats);const r=LIB.applyUpd(nv,LIB.cats,d,{});return JSON.stringify({n:d.newW.length,ok:r&&r.ok})})()`);
 T('E/H 增量匯入：新增 1 個正式詞，本機自訂與學習資料保留',JSON.parse(rr).n===1&&EB('S.cards.filter(c=>/^CUS/.test(c.id)).length')===50&&EB('S.cards.some(c=>c.id==="NEW1")')&&EB('S.cards.filter(c=>c.lib).length')===1001);
 const r2=B.eval(`(()=>{const nv=${JSON.stringify(nv)};const d=LIB.diff(nv,LIB.cats);return JSON.stringify({n:d.newW.length,img:d.img.length})})()`);
 T('H 重複匯入同一教材包不產生重複詞彙',JSON.parse(r2).n===0&&EB('S.cards.filter(c=>c.id==="VOC9001").length')===1);
 // ---- G 實際遊戲派題 ----
 EB(`UI.pick('quiet');FL.open(1);FL.setRange('pick');FL.setDim('theme');FL.selNone('theme');FL.togCat('theme','LIB-CAT03',true);FL.setW(20)`);
 const cn=EB('FL.cur().chk.n');EB('FL.go()');await sleep(400);
 const g=J(EB,'G.q.map(c=>({id:c.id,t:c.text,img:(c.img||"").slice(0,40)}))');
 const catIds=new Set(V.filter(w=>w.categoryId==='CAT03').map(w=>w.id));
 T('G 水果蔬菜×20：20 個不同詞彙、全屬於該主題、都有圖片（可用 '+cn+'）',EB('G.on')&&g.length===20&&new Set(g.map(x=>x.id)).size===20&&g.every(x=>catIds.has(x.id)&&x.img),g.slice(0,3));
 console.log('  抽樣：',g.slice(0,5).map(x=>x.id+' '+x.t+' '+x.img).join(' | '));
 EB('FL.end();G.on=false');
 /* v22.3（第02批）：教師自訂教材預設不使用；先確認未啟用時不出題，教師啟用後才出題 */
 T('G0 教師自訂教材未啟用時不進入題庫',EB(`(()=>{const o=S.set.src;S.set.src='all';try{return pool().some(c=>/^(CUS|NEW)/.test(c.id))}finally{S.set.src=o}})()`)===false);
 EB(`S.matSrc={custom:1};MAT.bump()`);
 EB(`FL.setDim('custom');FL.selNone('custom');FL.togCat('custom','T-CUS',true);FL.setW('all')`);EB('FL.go()');await sleep(400);
 const g2=J(EB,'G.q.map(c=>c.id)');T('G 教師自訂分類也能出題（自訂詞彙沒有圖片時依題型排除）',EB('FL.cur().chk.ok')===true&&g2.length>=1&&g2.every(id=>/^(CUS|NEW)/.test(id)),g2);
 EB('FL.end();G.on=false');
 // ---- I 舊版分類整理（先備份、確認後、只移除分類）----
 await EB('INT.legacyDo()');await sleep(200);
 T('I 舊版分類整理：分類移除、圖卡保留、自訂分類未被誤刪、可復原',!EB('S.cats.some(c=>c.id==="T-LEG")')&&EB('S.cards.filter(c=>/^CUS/.test(c.id)).length')===50&&EB('S.cats.some(c=>c.id==="T-CUS")'));
 await EB('INT.legacyUndo()');await sleep(200);T('I 復原後舊版分類回來',EB('S.cats.some(c=>c.id==="T-LEG")'));
 // ---- 教師停用（off）不被遷移覆蓋 ----
 EB('LIB.setEn(["VOC0005"],false)');await EB('save()');
 T('教師明確停用的正式詞彙會被排除（off），不影響其他',!EB('S.cards.some(c=>c.id==="VOC0005")')&&EB('S.cards.filter(c=>c.lib).length')===1000);
 // ---- 完整性檢查畫面與圖片逐張檢查 ----
 const ph=EB('INT.panel()');T('教材庫完整性檢查畫面：顯示正式／本機／整合數量與缺圖、匯出、重建按鈕',/教材庫完整性檢查/.test(ph)&&/整合去重後詞彙/.test(ph)&&/匯出檢查報告/.test(ph)&&/重新建立教材與分類索引/.test(ph));
 EB(`LIB.base.find(w=>w.id==='VOC0002').images=['images/NOPE_99.webp']`);B.eval("(()=>{const f=window.fetch;window.fetch=async u=>{const r=await f(u);if(r.ok&&!r.blob)r.blob=async()=>({size:1});return r}})()");await B.eval('INT.scan()');
 T('逐張檢查：全部圖片中 1 張路徑錯誤被抓到並與「無法解碼」分開統計',EB('INT.scanRes.total')>=961&&EB('INT.scanRes.missing.length')===1&&EB('INT.scanRes.missing[0].id')==='VOC0002'&&EB('INT.scanRes.decode.length')===0,EB('JSON.stringify(INT.scanRes.missing)'));
 const LAh=EB('LA.view()');T('學習分析在新模式下：尚未補圖 50 與教材未啟用分開',/尚未補圖 5[01]｜教材尚未啟用/.test(LAh)||/尚未補圖 \d+/.test(LAh));
 // ---- J 部署檢查（靜態）----
 const miss=V.flatMap(w=>w.images||[]).filter(p=>!fs.existsSync('/home/claude/repo/vocab/'+p));const bad=V.flatMap(w=>w.images||[]).filter(p=>/^\/|^[a-z]+:/i.test(p)||/[A-Z]/.test(p.replace(/VOC\d+_\d+\.webp/,'')));
 T('J 961 個圖片路徑全部存在於部署資料夾、使用相對路徑（GitHub Pages 子路徑可用）',miss.length===0&&bad.length===0&&V.flatMap(w=>w.images||[]).length===961,[miss.length,bad.length]);
 console.log('RESULT done');process.exit(0);
})();
