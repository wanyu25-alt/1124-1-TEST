const {JSDOM}=require('jsdom');const fs=require('fs');const {IDBFactory}=require('fake-indexeddb');
const html=fs.readFileSync((process.env.IDX||'/mnt/user-data/outputs/vocabulary-express/index.html'),'utf8').replace(/<script src[^>]*><\/script>/g,'').replace("lm:'quiet'","lm:'integ'").replace("or:30,","or:0,").replace("hz:{u:'once',cost:true,n:1,free:false}","hz:{u:'none',cost:false,n:1,free:true}").replace("ap:true,","ap:false,").replace("oj:'A'","oj:'B'").replace("prepDone:false","prepDone:true");
const packSrc=fs.readFileSync('/mnt/user-data/outputs/vocabulary-express/materials/pack.js','utf8');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let P=0,F=0;const T=(n,c)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n)};
const mk=(idb,q='',pack=packSrc)=>new JSDOM(html,{url:'http://localhost/'+q,runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.indexedDB=idb;w.alert=()=>{};w.confirm=()=>true;w.AudioContext=function(){};w.speechSynthesis={getVoices:()=>[],cancel(){}};if(pack)w.eval(pack)}}).window;
(async()=>{const idb=new IDBFactory();let w=mk(idb);await sleep(600);let E=s=>w.eval(s);
 T('first open: pack loaded (18 cards, 4 categories)',E('S.cards.length')===18&&E('S.cats.length')===4);
 T('cards keep original ids/text/zhuyin, images are data URLs',E('S.cards.find(c=>c.id==="88ywvqo").text')==='火車'&&E('S.cards.find(c=>c.id==="88ywvqo").zy')==='ㄏㄨㄛˇ ㄔㄜ'&&E('S.cards.every(c=>/^data:image\\/jpeg/.test(c.img))'));
 T('categories & multi-category link (飯 in 民生用品 + 三餐)',E('S.cats.map(c=>c.name+catCards(c.id).length).join()')==='水果5,交通工具6,民生用品7,三餐1'&&E('S.cards.find(c=>c.text==="飯").cats.length')===2);
 T('portable settings applied (mode listen, n 3)',E('S.set.mode')==='listen'&&E('S.set.n')===3);
 for(const k of ['bike','car','train','hsr','plane']){E(`S.set.sound=false;S.set.music=false;S.asrDecl=1;S.set.n=5;goV('${k}')`);await sleep(60);if(!(E('G.q.length')>=3&&E('deck().cards.length')===18))T('vehicle '+k+' loads',false);E('leave()')}
 T('five vehicles build rounds from pack cards',true);
 await sleep(200);w=mk(idb);await sleep(600);E=s=>w.eval(s);T('reopen: same 18 cards, no duplicates',E('S.cards.length')===18);
 // teacher adds own card; pack unchanged → kept
 E('S.cards.push({id:"mine",text:"自己的",zy:"ㄗˋ ㄐㄧˇ",img:"",audio:"",cats:[],created:1,modified:1});save()');await sleep(200);w=mk(idb);await sleep(600);E=s=>w.eval(s);
 T('teacher-made card kept across reopen',E('S.cards.length')===19);
 // new pack version: one removed, one edited, one added
 const np=eval('('+packSrc.replace('window.TH_PACK=','').replace(/;\s*$/,'')+')');np.ver='2027-01-01T00:00:00Z';np.cards=np.cards.filter(c=>c.text!=='毛巾');np.cards.find(c=>c.text==='香蕉').zy='ㄒㄧㄤ ㄐㄧㄠ';np.cards.find(c=>c.text==='香蕉').modified=Date.now()+1e6;np.cards.find(c=>c.text==='香蕉').text='香蕉X';np.cards.push({id:'new1',text:'新詞',zy:'ㄒㄧㄣ ㄘˊ',img:np.cards[0].img,audio:'',cats:['9itk60p'],created:5,modified:5});np.cats.find(c=>c.id==='9itk60p').order.push('new1');
 await sleep(200);w=mk(idb,'',  'window.TH_PACK='+JSON.stringify(np));await sleep(600);E=s=>w.eval(s);
 T('new pack version: 毛巾 removed, 香蕉 updated, 新詞 added, own card kept',!E('S.cards.some(c=>c.text==="毛巾")')&&E('S.cards.some(c=>c.text==="香蕉X")')&&E('S.cards.some(c=>c.id==="new1")')&&E('S.cards.some(c=>c.id==="mine")')&&E('S.cards.length')===19);
 T('category order updated & contains new card',E('S.cats.find(c=>c.id==="9itk60p").order.includes("new1")')&&E('S.cats.find(c=>c.id==="741jh8d").order.length')===6);
 // no pack file → nothing breaks
 const w2=mk(new IDBFactory(),'',null);await sleep(600);T('no pack.js: opens empty without error',w2.eval('S.cards.length')===0);
 const w3=mk(new IDBFactory(),'?noseed');await sleep(600);T('?noseed disables pack',w3.eval('S.cards.length')===0);
 // unpublished-status + name privacy
 w=mk(new IDBFactory());await sleep(700);E=s=>w.eval(s);T('status: clean after first load',E('packDirty().n')===0);
 E('S.cards.find(c=>c.text==="火車").zy="ㄏㄨㄛˇ";S.cards.pop();save()');T('status: edit+delete counted as unpublished',E('packDirty().chg')===1&&E('packDirty().del')===1);
 T('no student name by default; done/push voices map to generic',E('S.set.stuName')===''&&E('(AM.say("done",{}),AM.cur&&AM.cur.k)')==='pass');
 console.log(P+' pass, '+F+' fail');process.exit(0)})().catch(e=>{console.log('ERR',e);process.exit(1)});

//LEGACY2

//LEGACY3
