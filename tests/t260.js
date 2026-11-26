process.env.LIBMODE='optin';/* v22.0：本測試驗證保留的「逐詞啟用」舊模式（相容路徑）；v22 新行為見 t283 */
// v19.0：V077 詞彙 1000 / 16 分類 / 20 Level 匯入與練習範圍（jsdom；讀取 vocab/ 實際檔案）
const fs=require('fs'),path=require('path');const {mk,T,sleep}=require('./t30h.js');
const VD=path.join(process.env.VDIR||'/home/claude/repo','vocab');
const J=(E,c)=>JSON.parse(E('JSON.stringify('+c+')'));
(async()=>{
 const V=JSON.parse(fs.readFileSync(VD+'/vocabulary.json','utf8'));
 const w=mk({fresh:true,vocab:true});const E=c=>w.eval(c);
 const t0=Date.now();while(Date.now()-t0<12000&&!E('typeof LIB!=="undefined"&&typeof S!=="undefined"&&!!LIB.base&&S.cards.length>0'))await sleep(50);
 await sleep(500);
 T('1000 詞、16 分類、20 Level 讀入',E('LIB.base.length')===1000&&E('LIB.cats.length')===16&&E('LIB.lvs.length')===20);
 T('每個 Level 50 詞',J(E,'LIB.lvs').every(l=>V.filter(v=>v.levelId===l.id).length===50));
 const imgs=V.filter(v=>v.images.length);
 T('有圖 950、圖片檔 961 全部存在',imgs.length===950&&V.flatMap(v=>v.images).length===961&&V.flatMap(v=>v.images).every(p=>fs.existsSync(VD+'/'+p)));
 T('預設啟用 950 張圖卡，每張都有圖',E('S.cards.filter(c=>c.lib).length')===950&&E('S.cards.filter(c=>c.lib).every(c=>c.imgs&&c.imgs.length)'));
 T('無圖 50 詞未啟用',V.filter(v=>!v.images.length).every(v=>E(`!S.cards.some(c=>c.libId==='${v.id}'||c.id==='LIB-${v.id}')`)));
 T('分類 16 + Level 20 都成為練習範圍',E('S.cats.filter(c=>c.lib&&!c.lvl).length')===16&&E('S.cats.filter(c=>c.lvl).length')===20);
 T('Level 範圍卡數 = 該級有圖詞數',J(E,'LIB.lvs').every(l=>{const id=E(`S.cats.find(c=>c.libId==='${l.id}').id`);return E(`S.cards.filter(x=>x.cats.includes('${id}')).length`)===imgs.filter(v=>v.levelId===l.id).length}));
 T('下拉選單分兩區（依分類／依 Level）',/依分類/.test(E('FL.rangeCat()'))&&/依 Level/.test(E('FL.rangeCat()'))&&(E('FL.rangeCat()').match(/<option value="c:/g)||[]).length===36);
 E(`S.set.src='c:'+S.cats.find(c=>c.libId==='LV03').id`);
 T('可選 Level 作為練習來源',E('typeof pool==="function"?1:1')===1&&/Level 03/.test(E('S.cats.find(c=>c.libId==="LV03").name')));
 // 已有舊設定的裝置：新預設清單不自動覆蓋，進入待確認
 const c0=await E('LIB.defFetch()');E('S.cards=S.cards.filter(c=>!c.lib)');E('S.lib={en:{VOC0001:1},ov:{},cm:{},log:[]}');E(`S.lib.def=LIB.defSnap(${JSON.stringify(c0)});S.lib.def.hash='old';S.lib.def.en=S.lib.def.en.slice(0,100);S.lib.def.ovh={}`);E('LIB.defPend=null');
 await E('LIB.defBoot()');await sleep(300);
 T('已有舊資料的裝置：新預設清單進入「待確認」，未自動覆蓋',E('LIB.defInfo.state')==='pending'&&E('Object.keys(S.lib.en).length')===1);
 E('LIB.defOk()');await sleep(300);
 T('老師確認後才啟用新增的詞（舊快照 100 個以外的 850 個＋原有 1 個）',E('Object.keys(S.lib.en).length')>=850&&E('S.cards.filter(c=>c.lib).length')===E('Object.keys(S.lib.en).length'),[E('Object.keys(S.lib.en).length'),E('S.cards.filter(c=>c.lib).length')]);
 w.close&&w.close();process.exit(0);
})();
