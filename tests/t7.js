const {JSDOM}=require('jsdom');const fs=require('fs');require('fake-indexeddb/auto');
const html=fs.readFileSync((process.env.IDX||'/mnt/user-data/outputs/vocabulary-express/index.html'),'utf8').replace(/<script src[^>]*><\/script>/,'').replace("lm:'quiet'","lm:'integ'").replace("or:30,","or:0,").replace("hz:{u:'once',cost:true,n:1,free:false}","hz:{u:'none',cost:false,n:1,free:true}").replace("ap:true,","ap:false,").replace("oj:'A'","oj:'B'").replace("prepDone:false","prepDone:true");
const mk=()=>new JSDOM(html,{url:'http://localhost/?noseed',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.indexedDB=indexedDB;w.alert=()=>{};w.confirm=()=>true;w.prompt=()=>null;w.AudioContext=function(){throw 0}}}).window;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let P=0,F=0;const T=(n,c)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n)};
const put=(k,v)=>new Promise(r=>{const q=indexedDB.open('trafficHero',1);q.onupgradeneeded=()=>q.result.createObjectStore('kv');q.onsuccess=()=>{const t=q.result.transaction('kv','readwrite');t.objectStore('kv').put(v,k);t.oncomplete=()=>r()}});
(async()=>{
 await put('s',{decks:[{id:'d1',name:'第一週',cards:[{id:'x1',text:'香蕉',zy:'ㄒㄧㄤ ㄐㄧㄠ',img:'data:image/jpeg;base64,AAA',audio:''},{id:'x2',text:'火車',zy:'ㄏㄨㄛˇ ㄔㄜ',img:'',audio:''}]}],active:'d1',set:{n:2,sound:false,mode:'key'},logs:[{cid:'x1',word:'香蕉',cat:'ind',tries:0,t:1,mode:'key',evs:[]}],rounds:{started:1,completed:1},quits:[]});
 const w=mk();await sleep(500);const E=s=>w.eval(s),d=w.document,kd=(c,k)=>d.dispatchEvent(new w.KeyboardEvent('keydown',{code:c,key:k,bubbles:true,cancelable:true}));
 T('old data after rename: cards/banks/logs intact',E('S.cards.length')===2&&E('S.banks[0].name')==='第一週'&&E('S.logs[0].cid')==='x1'&&E('S.cards[0].img')==='data:image/jpeg;base64,AAA');
 E(`S.set.music=false;S.set.src='b:d1';S.set.mode='key';S.set.n=1;home();startRound()`);await sleep(50);
 const cur=E('G.cur.text'),m=d.querySelector('#mid').textContent;
 T('mode1: hint area shows kanji+zhuyin, answer area still blank',m.includes(cur)&&[...d.querySelectorAll('.zs')].every(z=>z.textContent===''&&!z.classList.contains('ok'))&&d.querySelector('#c0').textContent==='');
 E(`S.set.mode='listen';startRound()`);await sleep(50);
 T('mode2: no kanji/zhuyin shown',![...'香蕉火車ㄒㄧㄤㄐㄠㄏㄨㄛㄔㄜ'].some(c=>d.querySelector('#mid').textContent.includes(c)));
 E('kHint("f")');T('mode2: zhuyin hint appears only after button',[...d.querySelectorAll('.dm')].some(x=>/[ㄅ-ㄩ]/.test(x.textContent))&&[...d.querySelectorAll('.zs')].every(z=>z.textContent===''));
 E(`S.set.mode='spell';startRound()`);await sleep(50);
 T('mode3 看字: no photo, no zhuyin, answer blank',!d.querySelector('#pic')&&![...'ㄒㄧㄤㄐㄠㄏㄨㄛㄔㄜ'].some(c=>d.querySelector('#mid').textContent.includes(c))&&d.querySelector('#c0').textContent==='');
 E(`S.set.mode='speak';startRound()`);await sleep(50);E('sOk(1)');T('mode4: teacher confirm logs',E('S.logs[S.logs.length-1].sp.teacher')===1);
 await sleep(1500);E('goHome()');if(d.querySelector('#hm'))E('hmGo(0)');T('back to home',!E('G.on'));
 E(`sub='cats';tab(2)`);E(`sub='cards';tab(2)`);T('teacher tabs render',d.querySelector('#sp').textContent.includes('搜尋'));
 await sleep(200);const w2=mk();await sleep(500);T('reopen keeps data',w2.eval('S.cards.length')===2&&w2.eval('S.logs.length')>=2);
 console.log(P+' pass, '+F+' fail');process.exit(0)})().catch(e=>{console.log('ERR',e);process.exit(1)});

//LEGACY2

//LEGACY3
