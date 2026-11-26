// v20.0：學習分析 LA 計算（三階段熟悉度、指標分母、範圍、複習推薦、舊紀錄、無 NaN）
const fs=require('fs'),path=require('path');const {mk,T,sleep}=require('./t30h.js');
const J=(E,c)=>JSON.parse(E('JSON.stringify('+c+')'));
(async()=>{
 const w=mk({fresh:true,vocab:true});const E=c=>w.eval(c);
 const t0=Date.now();while(Date.now()-t0<12000&&!E('typeof LA!=="undefined"&&!!LIB.base&&S.cards.filter(c=>c.lib).length>=900'))await sleep(50);await sleep(400);
 const DAY=864e5,NOW=Date.now();let seq=0;
 const rec=(id,o)=>Object.assign({id:'R'+(++seq),learnerId:'x',itemId:id,itemKind:'word',itemText:'',game:'pick',outcome:'correct',independent:true,hints:[],first:{result:'correct'},ts:NOW-DAY,stage:1,ext:{fl:{st:1}},pk:{sub:'word',n:3},sub:'word'},o||{});
 const set=a=>{w.__a=a;E('S.recs=window.__a')};
 // ① 全新學生
 set([]);
 let d=J(E,'LA.dist(LA.words())');
 T('全新學生：1000 詞、啟用 950、尚未補圖 50、尚未練習 950；熟悉度分母 0、沒有 NaN',d.tot===1000&&d.on===950&&d.noimg===50&&d.none===950&&d.judged===0&&d.cover===0&&!/NaN|Infinity/.test(JSON.stringify(d)),d);
 T('熟悉度比例分母為 0 時顯示「—」',E('LA.fp(LA.pct(0,0))')==='—');
 // ② 少量紀錄：不足
 set([rec('VOC0001'),rec('VOC0001',{ts:NOW-2*DAY})]);
 T('只有 2 筆有效紀錄＝學習紀錄不足（不是待加強）',E('LA.wstat(LA.words().find(w=>w.id==="VOC0001")).d')==='few');
 // ③ 已熟悉：獨立 3 次、2 個不同日期、最近全獨立
 set([0,1,2].map(i=>rec('VOC0002',{ts:NOW-(i+1)*DAY*(i?1:0.2)})));
 T('獨立 3 次、跨 3 天、無錯誤＝已熟悉',E('LA.wstat(LA.words().find(w=>w.id==="VOC0002")).f')==='fa');
 // 同一天 3 次獨立→只在單日，不算已熟悉
 set([0,1,2].map(i=>rec('VOC0003',{ts:NOW-1000*(i+1)})));
 T('同一天 3 次獨立（只有一天）＝學習中，不是已熟悉',E('LA.wstat(LA.words().find(w=>w.id==="VOC0003")).f')==='mid');
 // 待加強：需提示、完整示範
 set([0,1,2].map(i=>rec('VOC0004',{ts:NOW-(i+1)*DAY,independent:false,hints:[{type:'P1',order:1}]})));
 const s4=E('LA.wstat(LA.words().find(w=>w.id==="VOC0004")).f');
 T('3 次都靠提示完成＝學習中或待加強（沒有獨立完成→待加強）',s4==='weak',s4);
 set([rec('VOC0005',{ts:NOW-5*DAY}),rec('VOC0005',{outcome:'wrong',independent:false,ts:NOW-4*DAY}),rec('VOC0005',{outcome:'wrong',independent:false,ts:NOW-3*DAY}),rec('VOC0005',{ts:NOW-2*DAY})]);
 T('最近 4 次有 2 次錯誤＝待加強',E('LA.wstat(LA.words().find(w=>w.id==="VOC0005")).f')==='weak');
 // ④ 技術問題不列入
 set([rec('VOC0006',{outcome:'tech_error'}),rec('VOC0006',{outcome:'tech_error'}),rec('VOC0006',{outcome:'tech_error'}),rec('VOC0006',{outcome:'skipped'})]);
 T('麥克風／網路異常、略過不計入答錯，也不列入熟悉度',E('LA.wstat(LA.words().find(w=>w.id==="VOC0006")).d')==='none'&&J(E,'LA.metrics(["VOC0006"]).valid')===0);
 // ⑤ 不同站表現不同、不跨站推論
 set([...[0,1,2].map(i=>rec('VOC0007',{ts:NOW-(i+1)*DAY*(i?1:.2)})),...[0,1,2].map(i=>rec('VOC0007',{game:'key',stage:1,ext:{fl:{st:2}},ts:NOW-(i+1)*DAY,independent:false,first:{result:'wrong'}}))]);
 const D7=J(E,'LA.detail(LA.words().find(w=>w.id==="VOC0007"))');
 T('同一詞彙在不同站不同表現：第 1 站已熟悉、第 2 站不是；沒有紀錄的站為空（不推定）',D7.st[1].s==='fa'&&D7.st[2].s!=='fa'&&D7.st[3]===null&&D7.st[6]===null,D7.st);
 // ⑥ 指標分母
 set([rec('VOC0008'),rec('VOC0008',{outcome:'wrong',independent:false}),rec('VOC0008',{game:'key',hints:[{type:'zy_stage'}],independent:false,rtFirstInput:3000}),rec('VOC0008',{game:'key',hints:[{type:'zy_full'}],independent:false,rtFirstInput:5000}),rec('VOC0008',{outcome:'tech_error'})]);
 const m=J(E,'LA.metrics(["VOC0008"])');
 T('指標：有效作答 4、正確率 75%、獨立完成率 25%、注音題 2 題中部分提示 50%／完整提示 50%、平均反應 4 秒',m.valid===4&&m.correct===75&&m.indep===25&&m.typed===2&&m.partial===50&&m.full===50&&m.rt===4,m);
 T('練習覆蓋與重複練習：同一詞 4 次有效作答＝重複 3 次',m.repeat===3);
 // ⑦ 口語：辨識失敗不計錯；教師確認
 set([rec('VOC0009',{game:'speak',outcome:'unconfirmed',independent:false,asr:[{text:'x',matched:false}]}),rec('VOC0009',{game:'speak',outcome:'correct',independent:false,asr:[],manual:{used:true,choices:['ok']},sp:{}}),rec('VOC0009',{game:'speak',outcome:'correct',asr:[{text:'ok',matched:true}]})]);
 const ms=J(E,'LA.metrics(["VOC0009"])');
 T('口語：辨識成功率 50%（2 次有辨識結果、1 次成功）、教師確認 33.3%，辨識失敗不算答錯',ms.asr===50&&ms.conf===33.3&&ms.valid===2,ms);
 // ⑧ Level／主題範圍
 const lv=J(E,'LA.groups("lv")'),cat=J(E,'LA.groups("cat")');
 T('20 個 Level 各 50 詞、16 個主題；詞彙以 ID 對應不重複',lv.length===20&&lv.every(g=>g.ids.length===50)&&cat.filter(g=>!/^U:/.test(g.k)).length===16&&cat.reduce((a,g)=>a+g.ids.length,0)===1000);
 // ⑨ Level 部分啟用、尚未練習
 const L1=J(E,'LA.dist(LA.groups("lv")[0].ids)');
 T('Level 01：50 詞中有圖已啟用、無圖尚未補圖，兩者分開統計',L1.tot===50&&L1.on+L1.noimg+L1.off===50&&L1.noimg>0,L1);
 // ⑩ 舊版紀錄缺新欄位
 set([{id:'Rold1',itemId:'VOC0010',itemKind:'word',game:'pick',outcome:'correct',independent:true,hints:[],ts:NOW-DAY},{id:'Rold2',itemId:'VOC0010',game:'pick',outcome:'correct',ts:NOW-DAY}]);
 let ok=true;try{E('LA.metrics(["VOC0010"]);LA.detail(LA.words().find(w=>w.id==="VOC0010"));LA.rec({},10)')}catch(e){ok=false}
 T('舊版紀錄缺少 ext／first／hints 等欄位也能計算，不當機',ok);
 // ⑪ 複習推薦
 set([...[0,1,2].map(i=>rec('VOC0022',{ts:NOW-(i+1)*DAY,independent:false,hints:[{type:'P2'}]})),...[0,1,2].map(i=>rec('VOC0024',{ts:NOW-(i+1)*DAY*0.1}))]);
 const rc=J(E,'LA.rec({},10)');
 T('複習推薦：待加強詞排前面，已熟悉的詞不在「待加強」推薦；推薦含理由',rc.length>=1&&rc[0].id==='VOC0022'&&!rc.some(x=>x.id==='VOC0024')&&rc[0].why.length>5,rc);
 const lvOf=J(E,'LA.words().find(w=>w.id==="VOC0022").lv');
 T('依 Level 推薦只含該 Level 的詞',J(E,`LA.rec({lv:"${lvOf}"},10)`).every(x=>x.id==='VOC0022')&&J(E,'LA.rec({lv:"LV20"},10)').length===0);
 // ⑫ 日期篩選
 set([rec('VOC0013',{ts:NOW-40*DAY}),rec('VOC0013',{ts:NOW-39*DAY}),rec('VOC0013',{ts:NOW-38*DAY})]);
 T('日期篩選：近 30 天沒有紀錄時不納入',J(E,'LA.metrics(["VOC0013"],{days:"30"}).valid')===0&&J(E,'LA.metrics(["VOC0013"],{days:"all"}).valid')===3);
 // ⑬ 教師自訂詞彙
 E('S.cats.push({id:"mycat",name:"我的分類",order:[]});S.cards.push({id:"my1",text:"自訂詞",zy:"ㄗˋ",img:"data:image/png;base64,AA",audio:"",cats:["mycat"],created:1,modified:1})');
 T('教師自訂詞彙與分類納入分析（自訂分類獨立一組）',J(E,'LA.groups("cat")').some(g=>g.k==='U:mycat'&&g.ids.length===1));
 // ⑭ 提示褪除建議
 set(Array.from({length:6},(_,i)=>rec('VOC0001',{game:'key',hints:[{type:'zy_stage'}],independent:false,ts:NOW-i*1000})));
 T('提示褪除：最近都完成但仍用提示→只提出建議（需確認）',J(E,'LA.fade()').ok===true&&/確認/.test(J(E,'LA.fade()').text));
 set(Array.from({length:6},(_,i)=>rec('VOC0001',{game:'key',hints:[{type:'zy_full'}],independent:false,ts:NOW-i*1000})));
 T('常用完整提示時不建議減少提示',J(E,'LA.fade()').ok===false);
 // ⑮ 全部輸出不含 NaN
 set([rec('VOC0014'),rec('VOC0014',{outcome:'wrong',independent:false})]);
 const all=JSON.stringify([J(E,'LA.groups("lv").map(g=>LA.dist(g.ids))'),J(E,'LA.groups("lv").map(g=>LA.metrics(g.ids))')]);
 T('各 Level 的統計與指標沒有 NaN／Infinity／null 百分比錯誤',!/NaN|Infinity/.test(all));
 process.exit(0);
})();
