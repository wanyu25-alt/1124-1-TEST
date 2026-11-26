// v20.0：舊裝置教材更新（版本偵測、保留教師資料與紀錄、避免重複、失敗自動回復、可手動回復）
const {mk,T,sleep}=require('./t30h.js');
(async()=>{
 const w=mk({fresh:true,vocab:true});const E=c=>w.eval(c);
 const t0=Date.now();while(Date.now()-t0<12000&&!E('typeof LA!=="undefined"&&!!LIB.base&&S.cards.filter(c=>c.lib).length>=900'))await sleep(50);await sleep(400);
 w.alert=()=>{};w.confirm=()=>true;
 const c0=await E('LIB.defFetch()');
 // 建立「舊裝置」：已啟用少數詞、教師自己改過注音與審核、自訂詞彙／分類、學習紀錄、星星
 E('S.cards=S.cards.filter(c=>!c.lib)');
 E(`S.cats=S.cats.filter(c=>!c.lib);S.cats.push({id:"mycat",name:"我的分類",order:["my1"]});S.cards.push({id:"my1",text:"自訂詞",zy:"ㄗˋ ㄉㄧㄥˋ",img:"data:image/png;base64,AAAA",audio:"data:audio/mp4;base64,BBBB",cats:["mycat"],created:1,modified:1})`);
 E(`S.recs=[{id:"Rk1",learnerId:LRN.id(),itemId:"VOC0001",itemKind:"word",game:"pick",outcome:"correct",independent:true,hints:[],ts:Date.now()-1e5,stage:1}];S.stars=37;S.logs=[{cid:"my1",ts:1,tries:0,cat:"ind",corr:2,t:1}]`);
 E('S.lib={en:{VOC0001:1,VOC0002:1},ov:{VOC0001:{zy:"ㄅㄅ ㄆㄆ",zyRev:"approved"},VOC0002:{rv:"rejected"}},cm:{},log:[]}');
 E(`S.lib.def=LIB.defSnap(${JSON.stringify(c0)});S.lib.def.hash="old";S.lib.def.ver="V073";S.lib.def.en=["VOC0001"];S.lib.def.ovh={}`);
 E('LIB.defPend=null');await E('LIB.defBoot()');await sleep(300);
 T('舊裝置：偵測到新教材，進入待確認（不自動覆蓋）',E('LIB.defInfo.state')==='pending'&&E('Object.keys(S.lib.en).length')===2);
 const view=E('LIB.view()');
 T('教師端顯示教材版本（網站版本與本機上次套用版本）',/教材版本/.test(view)&&/V077_merged/.test(view)&&/V073/.test(view));
 const snap=JSON.stringify(E('JSON.stringify({c:S.cards.filter(c=>!c.lib),cats:S.cats.filter(c=>!c.lib),recs:S.recs,stars:S.stars,logs:S.logs})'));
 E('LIB.defOk()');await sleep(500);
 T('確認後：啟用 950 個詞（含原本 2 個）、沒有重複',E('S.cards.filter(c=>c.lib).length')===950,E('S.cards.filter(c=>c.lib).length'));
 T('教師自訂詞彙、圖片、錄音、自訂分類、學習紀錄、星星、舊紀錄全部不變',JSON.stringify(E('JSON.stringify({c:S.cards.filter(c=>!c.lib),cats:S.cats.filter(c=>!c.lib),recs:S.recs,stars:S.stars,logs:S.logs})'))===snap);
 T('教師自己設定的注音修改與審核結果保留（不被預設覆蓋）',E('S.lib.ov.VOC0001.zy')==='ㄅㄅ ㄆㄆ'&&E('S.lib.ov.VOC0002.rv')==='rejected');
 T('詞彙編號不變：學習紀錄仍對得上詞彙',E('S.cards.some(c=>c.id==="VOC0001")')&&E('S.recs[0].itemId')==='VOC0001'&&E('LA.words().find(w=>w.id==="VOC0001").on'));
 T('卡片 ID 沒有重複',E('new Set(S.cards.map(c=>c.id)).size')===E('S.cards.length'));
 T('教材版本記錄到本機（之後不再提示）',E('S.lib.def.ver')==='V077_merged');
 // 再套用一次：不重複
 await E('LIB.defBoot()');await sleep(200);const n1=E('S.cards.length');E('LIB.defFill&&LIB.defFill()');await sleep(300);
 T('重複套用不會產生重複詞彙',E('S.cards.length')===n1&&E('LIB.defInfo.state')==='same');
 // 手動回復
 await E('LIB.defUndo()');await sleep(300);
 T('「回復到更新前」恢復舊的詞彙設定（只啟用原本 2 個詞）',E('Object.keys(S.lib.en).length')===2&&E('S.cards.filter(c=>c.lib).length')===2&&E('S.cards.some(c=>c.id==="my1")'));
 // 失敗自動回復
 E(`S.lib.def=LIB.defSnap(${JSON.stringify(c0)});S.lib.def.hash="old2";S.lib.def.en=["VOC0001"];S.lib.def.ovh={}`);E('LIB.defPend=null');await E('LIB.defBoot()');await sleep(200);
 E('window.__sy=LIB.sync;LIB.sync=function(){throw new Error("boom")}');E('LIB.defOk()');await sleep(300);E('LIB.sync=window.__sy;');
 T('更新過程發生錯誤：自動回復到更新前，沒有資料被改動',E('Object.keys(S.lib.en).length')===2&&E('S.cards.some(c=>c.id==="my1")')&&E('S.recs.length')===1&&/自動回復/.test(E('LIB.defMsg||""')));
 // 固定數量不寫死
 const src=require('fs').readFileSync(process.env.IDX,'utf8');
 T('正式程式沒有寫死舊版詞彙數（581／592）',!/\b581\b|\b592\b/.test(src));
 process.exit(0);
})();
