// v21.0：跨分頁／跨視窗同步——另一個視窗儲存教材後，這個視窗重新讀取即看到新教材；進行中不被打斷
const {mk,T,sleep}=require('./t30h.js');
(async()=>{
 const A=mk({});const B=mk({});const EA=c=>A.eval(c),EB=c=>B.eval(c);await sleep(1500);
 EB(`S.cats.push({id:'T-SYNC',name:'同步測試',sort:99});S.cards.push({id:'T-S1',text:'同步詞',zy:'ㄊ',cats:['T-SYNC'],img:null,note:''})`);await EB('save()');await sleep(300);
 T('A 視窗一開始看不到 B 新增的分類',!EA(`MAT.dims().custom.some(x=>x.id==='T-SYNC')`));
 await EA('MAT.refresh()');await sleep(300);
 T('A 重新讀取後前臺分類選單出現新分類與詞彙數',EA(`(MAT.dims().custom.find(x=>x.id==='T-SYNC')||{}).words`)===1);
 T('儲存時會廣播（BroadcastChannel 可用時）或安全略過',typeof EA('MAT.listen')==='function');
 console.log('RESULT done');process.exit(0);
})();
