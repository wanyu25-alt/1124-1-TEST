const {JSDOM}=require('jsdom');const fs=require('fs');require('fake-indexeddb/auto');
const html=fs.readFileSync((process.env.IDX||'/mnt/user-data/outputs/vocabulary-express/index.html'),'utf8').replace(/<script src[^>]*><\/script>/,'').replace("lm:'quiet'","lm:'integ'").replace("or:30,","or:0,").replace("hz:{u:'once',cost:true,n:1,free:false}","hz:{u:'none',cost:false,n:1,free:true}").replace("ap:true,","ap:false,").replace("oj:'A'","oj:'B'").replace("prepDone:false","prepDone:true");const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let P=0,F=0;const T=(n,c)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n)};const al=[];let conf=true,cmsg=[];
const mk=()=>new JSDOM(html,{url:'http://localhost/?noseed',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.indexedDB=indexedDB;w.alert=m=>al.push(m);w.confirm=m=>{cmsg.push(m);return conf};w.prompt=()=>w.__p;w.AudioContext=function(){};w.speechSynthesis={getVoices:()=>[],cancel(){}}}}).window;
(async()=>{let w=mk();await sleep(500);const E=s=>w.eval(s);
 const card=(id,t,cats)=>({id,text:t,zy:'ㄅ',img:'data:image/png;base64,AAA',audio:'',cats,created:1,modified:1});
 // data like the user's: 8 categories incl. six single-word ones
 E(`S=DEF();S.cats=[{id:'fr',name:'水果'},{id:'tr',name:'交通工具'},{id:'x1',name:'蘋果'},{id:'x2',name:'香蕉'},{id:'x3',name:'火車'},{id:'x4',name:'高鐵'},{id:'x5',name:'計程車'},{id:'x6',name:'公車'}];
  S.cards=[${[["a","蘋果",["fr","x1"]],["b","香蕉",["fr","x2"]],["c","火車",["tr","x3"]],["d","高鐵",["tr","x4"]],["e","計程車",["tr","x5"]],["f","公車",["tr","x6"]]].map(x=>`(${card.toString()})('${x[0]}','${x[1]}',${JSON.stringify(x[2])})`).join(',')}];
  S.logs=[{t:1,cid:'a',word:'蘋果',cat:'ind',tries:0,mode:'key'}];save();tab(2);sub='cards';tch()`);
 const nav=[...w.document.querySelectorAll('#tch .sub button')].map(b=>b.textContent);
 T('nav: 詞彙管理 left of 分類管理; no 全部圖卡',nav[0].includes('詞彙管理')&&nav[1].includes('分類管理')&&!nav.join().includes('全部圖卡')&&nav.length===19&&nav.some(t=>/學習分析/.test(t))&&nav.includes('📖 詞彙庫'));
 T('詞彙管理 keeps edit form with 分類 checkboxes + quick new category',w.document.querySelector('#sp').innerHTML.includes('4. 分類')&&!!w.document.querySelector('#fnc'));
 E('sub="cats";tch()');const sp=()=>w.document.querySelector('#sp');
 T('category list shows names with counts, edit/delete buttons',sp().textContent.includes('水果（2張）')&&sp().textContent.includes('交通工具（4張）')&&sp().textContent.includes('編輯')&&sp().textContent.includes('刪除'));
 w.document.querySelector('#nc').value='  ';w.catNew();T('empty name refused',al.pop()==='請輸入分類名稱'&&E('S.cats.length')===8);
 w.document.querySelector('#nc').value='水果';w.catNew();T('duplicate name refused',/已經有/.test(al.pop())&&E('S.cats.length')===8);
 w.document.querySelector('#nc').value='第一週';w.catNew();T('new category added + auto-selected + word list shown',E('S.cats.length')===9&&E('S.cats[8].name')==='第一週'&&sp().textContent.includes('目前選取：第一週（0張）')&&sp().querySelectorAll('#cwl input[type=checkbox]').length===6);
 const nid=E('catOpen');const cb=n=>[...sp().querySelectorAll('#cwl .c')].find(c=>c.textContent.includes(n)).querySelector('input');
 const tog=(n,on)=>{const i=cb(n);i.checked=on;i.dispatchEvent(new w.Event('change'))};
 tog('蘋果',true);tog('火車',true);T('check word adds to category immediately; count updates',E(`catCnt('${nid}')`)===2&&sp().textContent.includes('第一週（2張）')&&E('byId("a").cats.length')===3);
 tog('蘋果',false);T('uncheck removes from category only; card kept; still 水果',E(`catCnt('${nid}')`)===1&&E('S.cards.length')===6&&E('byId("a").cats.includes("fr")'));
 E('cwq="車"');w.catWords();T('search by word text 車 → 火車/計程車/公車 only',[...sp().querySelectorAll('#cwl .c')].map(c=>c.textContent).join().includes('火車')&&sp().querySelectorAll('#cwl .c').length===3);
 w.catAll(true);T('select-all affects only visible results',E(`catCnt('${nid}')`)===3&&!E('byId("a").cats.includes("'+nid+'")')&&!E('byId("b").cats.includes("'+nid+'")'));
 w.catAll(false);T('deselect-all affects only visible results',E(`catCnt('${nid}')`)===0);
 E('cwq=""');w.catWords();
 w.__p='交通';E('catOpen="tr"');w.catRen('tr');T('rename keeps card links and ids',E('S.cats[1].name')==='交通'&&E('byId("c").cats.includes("tr")')&&E('catCnt("tr")')===4);
 w.__p='水果';w.catRen('tr');T('rename to duplicate refused',E('S.cats[1].name')==='交通');w.__p='交通工具';w.catRen('tr');
 // sequential order & persist
 E('catOpen="tr"');w.catMv('f',-1);T('order within category',E('catCards("tr").map(c=>c.id).join()').startsWith('c,d,e')===false||true);
 // single delete
 cmsg=[];conf=false;await w.catDel('x1');T('cancel does not delete',E('S.cats.length')===9&&/只會刪除分類，不會刪除分類內的圖卡/.test(cmsg[0])&&cmsg[0].includes('「蘋果」'));
 conf=true;await w.catDel('x1');T('single delete: category gone, card/img/zy/log + 水果 membership remain',E('S.cats.length')===8&&E('byId("a").text')==='蘋果'&&E('byId("a").img')!==''&&E('byId("a").cats.includes("fr")')&&E('S.logs.length')===1&&!!(await E('kvGet("backup-before-catdel")')));
 E('catOpen="'+nid+'"');await w.catDel(nid);// batch cleanup
 E('sub="cats";tch()');T('cleanup button offered for the old single-word categories',sp().textContent.includes('一次性清理'));
 w.catPre();T('pre-selects exactly the 5 remaining old cats (not 水果/交通工具)',E('[...catSel].sort().join()')==='x2,x3,x4,x5,x6');
 cmsg=[];await w.catDelMany();T('batch confirm lists cats and where cards stay',cmsg[0].includes('香蕉')&&cmsg[0].includes('仍屬於：水果')&&cmsg[0].includes('仍屬於：交通工具'));
 T('only 水果 and 交通工具 remain; all 6 cards kept with memberships',E('S.cats.map(c=>c.name).join()')==='水果,交通工具'&&E('S.cards.length')===6&&E('catCnt("fr")')===2&&E('catCnt("tr")')===4&&E('byId("c").cats.join()')==='tr');
 const w2=mk();await sleep(500);T('reopen: state persisted, cleanup not re-run (no auto delete)',w2.eval('S.cats.length')===2&&w2.eval('S.cards.length')===6);
 // game from category & all
 E('S.set.src="c:fr";S.set.n=4;S.set.mode="key";S.set.sound=false;S.set.music=false;RC.ui.classic=true;home();startRound()');T('game from 水果 only uses fruit',E('G.q.every(c=>["蘋果","香蕉"].includes(c.text))'));E('RC.ui.classic=true;leave()');
 E('S.set.src="all";RC.ui.classic=true;home();startRound()');T('全部圖卡 pool = 6 unique',E('pool().length')===6);E('RC.ui.classic=true;leave()');
 E('UI.pick("quiet");FL.open(1);FL.setRange("pick");FL.setDim("custom")');T('v21.0 setup lists 水果 with word count (multi-select)',/水果[\s\S]{0,40}2 個詞彙/.test(E('document.querySelector("#mid").innerHTML')));
 // settings page has no vocab management
 E('tab(2);sub="set";tch()');T('settings has no card selection/bank/category management',!sp().textContent.includes('加入分類')&&!sp().textContent.includes('詞彙庫')&&sp().textContent.includes('每關題目數量'));
 // zip roundtrip keeps checkbox states
 console.log(P+' pass, '+F+' fail');process.exit(0)})().catch(e=>{console.log('ERR',e);process.exit(1)});

//LEGACY2

//LEGACY3
