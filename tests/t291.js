// v22.1：舊版 materials/ 教材移除（一次性清除、先備份、可還原、不再讀取、不影響正式詞與紀錄）
const {mk,T,sleep}=require('./t30h.js');
(async()=>{
 const A=mk({vocab:true});const E=c=>A.eval(c);
 for(let i=0;i<60&&!E('S.cards.filter(c=>c.lib).length>=1000');i++)await sleep(250);await sleep(300);
 E(`S.cats.push({id:'T-OLD',name:'舊版水果',order:[]},{id:'T-KEEP',name:'我的分類',order:[]});
  S.cards.push({id:'OLD1',text:'蘋果舊',zy:'ㄆ',img:'',audio:'',cats:['T-OLD'],created:1,modified:1},{id:'OLD2',text:'已改過',zy:'ㄆ',img:'',audio:'',cats:['T-OLD'],created:1,modified:1},{id:'MINE',text:'自己的',zy:'ㄗ',img:'',audio:'',cats:['T-KEEP'],created:1,modified:1});
  S.packIds=['OLD1','OLD2'];S.packCats=['T-OLD'];S.packSnap={OLD1:sigC(S.cards.find(c=>c.id==='OLD1')),OLD2:'x|changed'};delete S.legacyGone`);
 const n=await A.eval('LEG.purge()');
 T('A 清除未修改的舊版圖卡（1 張）',n===1&&!E('S.cards.some(c=>c.id==="OLD1")'));
 T('B 已被老師修改過的舊版圖卡保留（變成自訂）',E('S.cards.some(c=>c.id==="OLD2")&&MAT.origin(S.cards.find(c=>c.id==="OLD2"))==="custom"'));
 T('C 舊版分類移除，自己的分類與詞彙保留',!E('S.cats.some(c=>c.id==="T-OLD")')&&E('S.cats.some(c=>c.id==="T-KEEP")&&S.cards.some(c=>c.id==="MINE")'));
 T('D 正式 1000 詞不受影響',E('S.cards.filter(c=>c.lib).length')===1000);
 T('E 已備份可還原',await A.eval('kvGet("pre-legacy-remove").then(b=>!!b&&b.cards.length===1)'));
 T('F 只執行一次',await A.eval('LEG.purge()')===0);
 await A.eval('LEG.undo()');
 T('G 還原後舊圖卡與分類回來',E('S.cards.some(c=>c.id==="OLD1")&&S.cats.some(c=>c.id==="T-OLD")'));
 process.exit(require('./t30h.js').R.F?1:0);
})();
