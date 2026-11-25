const {JSDOM}=require('jsdom');const fs=require('fs');require('fake-indexeddb/auto');
const html=fs.readFileSync((process.env.IDX||'/mnt/user-data/outputs/vocabulary-express/index.html'),'utf8').replace(/<script src[^>]*><\/script>/,'').replace("lm:'quiet'","lm:'integ'").replace("or:30,","or:0,").replace("hz:{u:'once',cost:true,n:1,free:false}","hz:{u:'none',cost:false,n:1,free:true}").replace("ap:true,","ap:false,").replace("oj:'A'","oj:'B'").replace("prepDone:false","prepDone:true");
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let P=0,F=0;const T=(n,c)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n)};
(async()=>{const w=new JSDOM(html,{url:'http://localhost/?noseed',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.indexedDB=indexedDB;w.alert=()=>{};w.confirm=()=>true}}).window;await sleep(400);const E=s=>w.eval(s);
E(`S.cards=[{id:'a',text:'火車',zy:'ㄏㄨㄛˇ ㄔㄜ',img:'',audio:'',cats:[]},{id:'b',text:'高鐵',zy:'ㄍㄠ ㄊㄧㄝˇ',img:'',audio:'',cats:[]}];(S.cats=[{id:'bk',name:'測'}],S.cards.forEach(c=>c.cats=['a','b'].includes(c.id)?['bk']:[]),S.set.src='c:bk');S.logs=[{t:1,cid:'a',word:'火車',cat:'ind',tries:0,mode:'key',t0:1000,te:6000,evs:[]},{t:2,cid:'a',word:'火車',cat:'zy',tries:1,mode:'speak',t0:1000,te:3000,evs:[]}];S.quits=[]`);
T('auto mistake: 火車 in set',E('mistakeCards().map(c=>c.id).join()')==='a');
E('mkAdd("b")');T('manual add 高鐵',E('mistakeCards().length')===2&&E('MF().b')===1);
E('mkDone("a")');T('mark mastered removes 火車',E('mistakeCards().map(c=>c.id).join()')==='b'&&E('mastered("a")'));
E('mkDone("b")');T('manual flag cleared on mastered',E('mistakeCards().length')===0);
E('mkReset("a")');T('reset returns auto status',E('mistakeCards().length')===1);
E('tLog()');const t=w.document.querySelector('#sp').textContent;
T('report shows panel, per-mode, avg time',t.includes('錯題集')&&t.includes('看圖說詞')&&t.includes('平均每題用時')&&t.includes('3.5 秒')&&t.includes('2.0 秒'));
E('mkAdd("b")');const bk=E('JSON.stringify(S.mflag)');T('mflag in ZIP full backup progress.json',E('ioExport.toString()').includes('mflag'));
console.log(P+' pass, '+F+' fail');process.exit(0)})().catch(e=>{console.log('ERR',e);process.exit(1)});

//LEGACY2

//LEGACY3
