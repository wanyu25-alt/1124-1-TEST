const {JSDOM}=require('jsdom');const fs=require('fs');require('fake-indexeddb/auto');
const html=fs.readFileSync((process.env.IDX||'/mnt/user-data/outputs/vocabulary-express/index.html'),'utf8').replace(/<script src[^>]*><\/script>/,'').replace("lm:'quiet'","lm:'integ'").replace("or:30,","or:0,").replace("hz:{u:'once',cost:true,n:1,free:false}","hz:{u:'none',cost:false,n:1,free:true}").replace("ap:true,","ap:false,").replace("oj:'A'","oj:'B'").replace("prepDone:false","prepDone:true");const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const db=await new Promise(ok=>{const r=indexedDB.open('trafficHero',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>ok(r.result)});
 const old={v:2,cards:[{id:'a',text:'火車',zy:'ㄏㄨㄛˇ ㄔㄜ',img:'',audio:'',cats:['k']},{id:'b',text:'蘋果',zy:'ㄆㄧㄥˊ ㄍㄨㄛˇ',img:'',audio:'',cats:[]}],cats:[{id:'k',name:'交通'}],banks:[{id:'b1',name:'我的詞庫',ids:['a','b']},{id:'b2',name:'交通',ids:['a']}],mst:{},logs:[{t:1,cid:'a',word:'火車',deck:'我的詞庫',cat:'ind',tries:0,mode:'key'}],rw:{stars:3,badges:[],veh:[],journeys:[]},quits:[],rounds:{started:1,completed:1},set:{src:'b:b2',n:5}};
 await new Promise(ok=>{const t=db.transaction('kv','readwrite');t.objectStore('kv').put(old,'s');t.oncomplete=ok});
 const run=async()=>{const w=new JSDOM(html,{url:'http://localhost/?noseed',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.indexedDB=indexedDB;w.alert=()=>{};w.AudioContext=function(){};w.speechSynthesis={getVoices:()=>[],cancel(){}}}}).window;await sleep(600);return w};
 let w=await run();const E=s=>w.eval(s);let ok=true;const T=(n,c)=>{console.log(c?'PASS':'FAIL',n);ok=ok&&c};
 T('upgrade: default 我的詞庫 (= all cards) makes no duplicate category; same-members bank shares 交通',E('S.cats.length')===1&&E('S.cats[0].name')==='交通');
 T('src b:b2 → existing same-members 交通',E('S.set.src')==='c:k');T('cards/logs/stars kept',E('S.cards.length')===2&&E('S.logs.length')===1&&E('S.rw.stars')===3);
 T('pre-migration backup saved incl. banks',E('kvGet("backup-pre-bankmig").then(x=>x.banks.length)')!==undefined&&(await E('kvGet("backup-pre-bankmig").then(x=>x.banks.length)'))===2);
 T('banks archived, not shown',E('S.banks.length')===2&&!w.document.body.innerHTML.includes('練習詞彙庫'));
 const c1=E('S.cats.length');w=await run();T('reopen: no duplicate categories',E('S.cats.length')===c1);
 process.exit(ok?0:1)})();

//LEGACY2

//LEGACY3
