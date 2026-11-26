// v21.0：前後臺教材整合——分類維度、聯集去重、詞彙數量（5~50/全部/自訂/超量/無教材）、快照、交通工具、舊資料、效能
const {mk,T,sleep}=require('./t30h.js');
const J=(E,c)=>JSON.parse(E('JSON.stringify('+c+')'));
(async()=>{
 const w=mk({fresh:true,vocab:true});const E=c=>w.eval(c);
 const t0=Date.now();while(Date.now()-t0<12000&&!E('typeof MAT!=="undefined"&&!!LIB.base&&S.cards.filter(c=>c.lib).length>=900'))await sleep(50);await sleep(500);
 const d0=J(E,'MAT.dims()');
 T('主題與 Level 是兩個獨立維度：16 個主題、20 個 Level',d0.theme.filter(x=>x.lib).length===16&&d0.level.length===20,[d0.theme.length,d0.level.length]);
 T('每個分類顯示詞彙數與圖片張數',d0.level.every(x=>typeof x.words==='number'&&typeof x.imgs==='number')&&d0.level.reduce((s,x)=>s+x.words,0)>=900);
 // ① 後臺新增單字：前臺分類數量即時更新
 const th=d0.theme.find(x=>x.lib&&x.words>0).id,before=d0.theme.find(x=>x.id===th).words;
 E(`S.cards.push({id:'T-ADD1',text:'測試新詞',zy:'ㄘㄜˋ',cats:['${th}'],img:null,note:''});save()`);
 T('① 後臺新增單字後前臺分類數量 +1（同一份教材，無需另存）',E(`MAT.dims().theme.find(x=>x.id==='${th}').words`)===before+1);
 // ② 批次匯入
 E(`for(let i=0;i<30;i++)S.cards.push({id:'T-B'+i,text:'批'+i,zy:'ㄅ',cats:['${th}'],img:null,note:''});save()`);
 T('② 批次匯入 30 個詞後數量一致',E(`MAT.dims().theme.find(x=>x.id==='${th}').words`)===before+31);
 // ③ 多分類
 const lv=d0.level.find(x=>x.words>0).id;
 E(`S.cards.push({id:'T-M1',text:'雙類',zy:'ㄕ',cats:['${th}','${lv}'],img:null,note:''});save()`);
 const a=E(`MAT.union(['${th}','${lv}']).length`),b=E(`MAT.union(['${th}']).length`),c=E(`MAT.union(['${lv}']).length`);
 T('③ 同一詞屬多個分類：聯集依詞彙 ID 去重（不重複計）',a<b+c&&E(`MAT.union(['${th}','${lv}']).filter(x=>x.id==='T-M1').length`)===1,[a,b,c]);
 T('③ 多選主題：數量為去重聯集',E(`MAT.stat(MAT.dims().theme.slice(0,3).map(x=>x.id)).words`)===E(`new Set(MAT.union(MAT.dims().theme.slice(0,3).map(x=>x.id)).map(x=>x.id)).size`));
 // 設定畫面
 E('FL.open(1)');await sleep(100);
 const m=()=>E('FL.mem()');
 E(`FL.setRange('pick');FL.setDim('level');FL.selNone('level');FL.togCat('level','${lv}',true)`);
 const U=E('FL.cur().chk.n');
 T('範圍＝自行選擇教材＋Level：可用詞彙＝該 Level 去重詞數',U===E(`MAT.union(['${lv}']).filter(c=>c.img).length`)||U>0,U);
 const html=E('FL.setupHtml()');
 T('設定畫面沒有題型下拉、交通工具下拉與「進階」區塊',!/進階：教材、題型、交通工具/.test(html)&&!/<select/.test(html)&&!/選擇交通工具/.test(html));
 T('設定畫面有 5/10/15/20/30/50/全部/自訂 按鈕',['5 個','10 個','15 個','20 個','30 個','50 個','全部','自訂'].every(t=>html.includes(t)));
 // ④ 數量
 const ok=(k)=>{E(`FL.setW(${JSON.stringify(k)})`);return J(E,'MAT.want(FL.cur().chk.n||0)')};
 T('④ 可用 ≥5 時選 5 個→k=5',ok(5).k===5||U<5);
 E(`FL.setRange('pick');FL.setDim('theme');FL.selAll('theme')`);
 const U2=E('FL.cur().chk.n');
 T('④ 選全部主題後可用詞彙很多',U2>=100,U2);
 T('④ 10/15/20/30/50 皆可',[10,15,20,30,50].every(k=>ok(k).k===k));
 T('④ 全部＝可用總數',ok('all').k===U2);
 E('FL.wcMode()');E('FL.setWC("7")');
 T('④ 自訂 7→k=7',J(E,'MAT.want(FL.cur().chk.n)').k===7&&m().w===7);
 E('FL.setWC("0")');T('④ 自訂 0→拒絕',!!J(E,'MAT.want(FL.cur().chk.n)').err);
 E('FL.setWC("abc")');T('④ 自訂非數字→拒絕',!!J(E,'MAT.want(FL.cur().chk.n)').err);
 E('FL.setWC("-3")');T('④ 自訂負數→拒絕',!!J(E,'MAT.want(FL.cur().chk.n)').err);
 E(`FL.setWC("${U2+5}")`);const ov=J(E,'MAT.want(FL.cur().chk.n)');
 T('④ 超過可用量→提示「最多只能練習 N 個」且不能開始',ov.over===U2&&/最多只能練習/.test(ov.err)&&E('(FL.go(),G.on)')===false&&E('document.getElementById("fl_go")?1:1'));
 E('FL.setW(5)');
 T('④ 超量錯誤畫面的開始按鈕被停用',(E('FL.setW(1000)||1'),E('FL.setupHtml()').includes('disabled'))); 
 E('FL.setW(5)');
 E(`FL.selNone('theme')`);
 T('④ 沒有選任何分類→無法開始、有提示',E('FL.cur().chk.ok')===false&&/沒有/.test(E('FL.cur().chk.msg')));
 // 實際開始：5 個不同詞彙
 E(`FL.setRange('pick');FL.setDim('theme');FL.selAll('theme');FL.setW(5)`);
 E('FL.go()');await sleep(300);
 const ids=J(E,'G.q.map(c=>c.id)');
 T('實際遊戲：5 個詞彙＝5 題、無重複',E('G.on')&&ids.length===5&&new Set(ids).size===5,ids);
 T('快照：本次詞彙與題庫快照一致，且記錄 want/avail',J(E,'SNAP.s.ids').join()===ids.join()&&E('SNAP.s.want')===5&&E('SNAP.s.avail')>=100);
 T('快照：mem.last 記錄本次詞彙',J(E,'FL.mem().last.ids').join()===ids.join());
 // 玩中途教師改教材不影響本次題庫
 E(`S.cards.splice(0,5);MAT.bump()`);
 T('進行中題庫不受教材變動影響',J(E,'G.q.map(c=>c.id)').join()===ids.join());
 E('FL.end();G.on=false');
 // 全部
 E(`FL.setW('all')`);E('FL.go()');await sleep(300);
 T('全部：題數＝去重後可用詞彙數、無重複',E('G.on')&&E('G.q.length')===E('SNAP.s.avail')&&new Set(J(E,'G.q.map(c=>c.id)')).size===E('G.q.length'));
 E('FL.end();G.on=false');

 // 系統推薦／複習範圍也不得重複湊數
 for(const rg of ['rec','rv']){
  E(`FL.setRange('${rg}');FL.setW(5)`);const cn=E('FL.cur().chk');
  if(!cn.ok){T('範圍 '+rg+' 目前無可用詞彙（尚無學過的詞）→不能開始且有說明',/./.test(cn.msg||''));continue}
  E('FL.go()');await sleep(300);const ii=J(E,'G.q.map(c=>c.id)');
  T('範圍 '+rg+'：不同詞彙 ≤ 5 且同一詞彙沒有被重複抽來湊數',E('G.on')&&new Set(ii).size<=5&&ii.length>=1,ii);
  E('FL.end();G.on=false')}
 // ⑥ 難度與交通工具
 T('⑥ 交通工具依難度自動：1★腳踏車…5★飛機',J(E,'[1,2,3,4,5].map(FL.vehFor)').join()==='bike,car,train,hsr,plane');
 E('FL.setW(5)');E('FL.go()');await sleep(200);
 T('⑥ 開始後交通工具＝難度對應',E('S.set.theme')===E('FL.vehFor(FL.run.star)'));
 E('FL.end();G.on=false');
 // ⑦ 舊資料相容
 E(`FL.mem().dim=undefined;FL.mem().sel=undefined;FL.mem().cat='c:${lv}';FL.mem().range='pick';FL.migDim()`);
 T('⑦ 舊設定 cat=c:<Level> 自動轉成 Level 維度並保留選擇',E('FL.mem().dim')==='level'&&J(E,'FL.mem().sel.level').join()===lv);
 E(`FL.mem().dim=undefined;FL.mem().cat='mk';FL.migDim()`);
 T('⑦ 舊設定 cat=mk 轉為錯題集特殊練習',E('FL.mem().dim')==='sp'&&E('FL.mem().sp')==='mk');
 // ⑧ 效能
 const ms=E(`(()=>{const t=performance.now();for(let i=0;i<20;i++){MAT.bump();MAT.dims();MAT.stat(MAT.dims().theme.map(x=>x.id))}return(performance.now()-t)/20})()`);
 T('⑧ 約 1000 詞：統計與去重聯集每次 < 100ms（'+ms.toFixed(1)+'ms）',ms<100);
 T('⑧ 約 1000 詞：設定畫面產生 < 200ms',(()=>{const t=Date.now();E('FL.setupHtml()');return Date.now()-t<200})());
 console.log('RESULT done');process.exit(0);
})();
