process.env.LIBMODE='optin';/* v22.0：本測試驗證保留的「逐詞啟用」舊模式（相容路徑）；v22 新行為見 t283 */
// v20.0：學習分析介面（jsdom：畫面內容、篩選、展開、從分析建立練習範圍）
const {mk,T,sleep}=require('./t30h.js');
(async()=>{
 const w=mk({fresh:true,vocab:true});const E=c=>w.eval(c);
 const t0=Date.now();while(Date.now()-t0<12000&&!E('typeof LA!=="undefined"&&!!LIB.base&&S.cards.filter(c=>c.lib).length>=900'))await sleep(50);await sleep(400);
 w.alert=m=>{w.__al=m};w.confirm=()=>true;
 const DAY=864e5,NOW=Date.now();let q=0;
 const rec=(id,o)=>Object.assign({id:'R'+(++q),learnerId:'x',itemId:id,itemKind:'word',game:'pick',outcome:'correct',independent:true,hints:[],first:{result:'correct'},ts:NOW-DAY,stage:1,ext:{fl:{st:1}},pk:{sub:'word',n:3},sub:'word'},o||{});
 w.document.body.insertAdjacentHTML('beforeend','<div id="tch"><div id="sp"></div></div>');
 const html=()=>w.document.getElementById('sp').innerHTML;
 const show=()=>{E('LA.re()');return html()};
 let h=show();
 T('全新學生：畫面顯示 20 個 Level、無 NaN／Infinity／undefined',(h.match(/Level \d\d｜/g)||[]).length>=20&&!/NaN|Infinity|undefined/.test(h));
 T('資料狀態與熟悉度分開顯示（尚未補圖、尚未練習；可判定 0 不顯示比例）',/尚未補圖 50/.test(h)&&/尚未練習 950/.test(h)&&/可判定熟悉度的詞彙：0/.test(h));
 T('已說明分母與判定規則（保守初始規則、未經大量學生驗證）',/練習覆蓋率.+已練習詞數÷已啟用詞數/.test(h)&&/保守的初始規則/.test(h));
 w.__a=[...[0,1,2].map(i=>rec('VOC0001',{ts:NOW-(i+1)*DAY*(i?1:.2)})),...[0,1,2].map(i=>rec('VOC0002',{ts:NOW-(i+1)*DAY,independent:false,hints:[{type:'P2'}]}))];E('S.recs=window.__a');
 E('LA.ui.view="lv";LA.ui.open="LV01"');h=show();
 T('展開 Level 01：顯示指標表、各站表現、詞彙清單',/有效作答次數/.test(h)&&/各學習站表現/.test(h)&&/詞彙清單/.test(h)&&/部分注音提示使用率/.test(h));
 const dl=h.match(/可判定 \d+ 個詞[^<]*/g)||[];T('Level 01 分布：2 個可判定詞＝待加強 1（50%）、已熟悉 1（50%）',dl.some(x=>/可判定 2 個詞：待加強 1（50%）／學習中 0（0%）／已熟悉 1（50%）/.test(x)),dl);
 E('LA.ui.word="VOC0001"');h=show();
 T('點詞彙看詳細：各站、各能力、建議',/詞彙認識站/.test(h)&&/聽覺理解/.test(h)&&/建議：/.test(h));
 E('LA.ui.fam="weak"');h=show();
 const t1=E('LA.words().find(w=>w.id==="VOC0001").text'),t2=E('LA.words().find(w=>w.id==="VOC0002").text'),lst=h.split('詞彙清單')[1]||'';T('熟悉度篩選：只列待加強的詞（VOC0002 在、已熟悉的 VOC0001 不在）',lst.includes('<b>'+t2+'</b>')&&!lst.includes('<b>'+t1+'</b>'),[t1,t2]);
 E('LA.ui.fam="";LA.ui.view="cat";LA.ui.open=null');h=show();
 T('主題分類 16 組＋自訂（若有）',(h.match(/展開<\/button>/g)||[]).length>=16);
 E('LA.ui.view="ab"');h=show();
 T('六站與能力：5 項能力、6 個學習站',/聽覺理解/.test(h)&&/注音拼讀與輸入/.test(h)&&/詞彙認識站/.test(h)&&/生活溝通站/.test(h)&&!/NaN/.test(h));
 E('LA.ui.view="rv"');h=show();
 T('智慧複習：顯示推薦清單、開始練習按鈕、站別建議、提示褪除說明',/用這 \d+ 個詞開始練習/.test(h)&&/建議的學習站/.test(h)&&/不會自動取消提示/.test(h));
 // 從分析開始練習
 const ids=JSON.parse(E('JSON.stringify(LA.rec({},10).map(x=>x.id))'));
 E(`LA.go(${JSON.stringify(ids)},"待加強")`);
 T('從分析建立練習範圍：來源為「分析推薦」、題庫只含這些詞、選單出現該選項',E('S.set.src')==='la'||E('FL.mem().cat')==='la',[E('S.set.src'),E('FL.mem().cat')]);
 E('S.set.src="la"');
 T('pool() 只含推薦的詞',E('pool().length')===ids.length&&E('pool().every(c=>S.set.laIds.includes(c.id))'),[E('pool().length'),ids.length]);
 T('下拉選單有「分析推薦的詞彙」',/分析推薦的詞彙/.test(E('FL.rangeCat()')));
 // Level 範圍待加強
 E('LA.ui.view="lv"');E('LA.goScope("LV01","lv")');
 T('Level 範圍待加強詞可直接建立練習範圍',E('S.set.laIds.length')>=1&&E('S.set.laIds.every(id=>LA.words().find(w=>w.id===id).lv==="LV01")'));
 process.exit(0);
})();
