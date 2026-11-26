const {JSDOM}=require('jsdom');const fs=require('fs');require('fake-indexeddb/auto');
const html=fs.readFileSync((process.env.IDX||'/mnt/user-data/outputs/vocabulary-express/index.html'),'utf8').replace(/<script src[^>]*><\/script>/,'').replace('gv:true,','gv:false,')/* 這支測試專測既有收音／閒置行為；真人操作引導語音另由 t250／t251 測 */.replace("lm:'quiet'","lm:'integ'").replace("or:30,","or:0,").replace("hz:{u:'once',cost:true,n:1,free:false}","hz:{u:'none',cost:false,n:1,free:true}").replace("ap:true,","ap:false,").replace("oj:'A'","oj:'B'").replace("prepDone:false","prepDone:true");
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let P=0,F=0;const T=(n,c)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n)};
const mk=(opt={})=>{const st={gum:0,tracksStopped:0,spoken:[],canc:0,amp:128,cur:null};
 const w=new JSDOM(html,{url:'http://localhost/?noseed',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.indexedDB=indexedDB;w.alert=()=>{};w.Audio=class{constructor(s){this.src=s;this.volume=1}play(){setTimeout(()=>this.onended&&this.onended(),60);return Promise.resolve()}pause(){}};w.confirm=()=>true;
  class An{constructor(){this.fftSize=256;this.frequencyBinCount=128}getByteTimeDomainData(a){a.fill(st.amp)}getByteFrequencyData(a){a.fill(Math.min(255,Math.abs(st.amp-128)*2))}}
  w.AudioContext=function(){this.currentTime=0;this.state='running';this.destination={};this.resume=()=>{};this.createGain=()=>({gain:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}},connect:x=>x,disconnect(){}});this.createOscillator=()=>({frequency:{},connect:x=>x,start(){},stop(){}});this.createAnalyser=()=>new An;this.createMediaStreamSource=()=>({connect(){},disconnect(){}})};
  w.navigator.mediaDevices=opt.nomic?undefined:{getUserMedia:async()=>{st.gum++;if(opt.deny){const e=new Error('x');e.name='NotAllowedError';throw e}if(opt.none){const e=new Error('x');e.name='NotFoundError';throw e}const tr={stop(){st.tracksStopped++}};return {active:true,getTracks:()=>[tr]}}};
  w.speechSynthesis={getVoices:()=>[],cancel(){st.canc++;if(st.cur){const u=st.cur;st.cur=null;u.onerror&&u.onerror()}},speak(u){st.cur=u;st.spoken.push({t:Date.now(),text:u.text,rate:u.rate});setTimeout(()=>{if(st.cur===u){st.cur=null;u.onend&&u.onend()}},60)}};
  w.SpeechSynthesisUtterance=function(t){this.text=t}}}).window;return {w,st}};
(async()=>{
 let {w,st}=mk();await sleep(400);const E=s=>w.eval(s),d=w.document;
 E(`S.cards=[{id:'a',text:'計程車',zy:'ㄐㄧˋ ㄔㄥˊ ㄔㄜ一聲',img:'',audio:'',cats:[]},{id:'b',text:'高鐵',zy:'ㄍㄠ ㄊㄧㄝˇ',img:'',audio:'',cats:[]}];(S.cats=[{id:'bk',name:'測'}],S.cards.forEach(c=>c.cats=['a','b'].includes(c.id)?['bk']:[]),S.set.src='c:bk');S.set.n=3;S.set.order='seq';S.set.sound=false;S.set.music=false;S.set.mode='speak';S.set.mix=false;home()`);
 E('LRN.cur().ps={fade:0}');E('startRound()');await sleep(100);
 T('1 mic requested once when entering 看圖說詞',st.gum===1&&E('!!MIC.st'));
 E('sDone("ind")');await sleep(1500);E('sDone("prompt")');await sleep(1500);
 T('2-3 switching questions never re-requests mic; still active',st.gum===1&&E('!!MIC.st')&&E('G.i')===2);
 // wave reacts to real level
 const hs=()=>[...d.querySelectorAll('#wave i')].map(i=>parseFloat(i.style.height)||0);
 st.amp=128;await sleep(120);const quiet=Math.max(...hs());
 st.amp=128+60;await sleep(600);const loud=Math.max(...hs());
 T('9-10 quiet bars low, loud bars higher (follows volume)',loud>quiet+30&&d.querySelector('#wst').textContent==='我正在聽你說話…');
 E('S.set.micSens=3');st.amp=128+6;await sleep(120);const soft=Math.max(...hs());E('S.set.micSens=5');await sleep(120);const soft5=Math.max(...hs());
 T('12 small voice still gives visible response; higher sensitivity larger',soft>quiet+8&&soft5>=soft);
 const gl=parseFloat(E("$('#train').style.getPropertyValue('--gl')"));T('train headlight glows with voice',gl>.12);
 st.amp=128;await sleep(2700);
 T('11 after speech stops: bars shrink + 說完了嗎 message, not judged wrong',Math.max(...hs())<quiet+10&&d.querySelector('#wst').textContent.includes('說完了嗎')&&E('G.tries')===0);
 const ts=E("S.logs.length");E("sDone(\"adult\")");
 T('15 teacher confirm works; choice recorded',E('S.logs.length')===ts+1&&E('S.logs[S.logs.length-1].sp.choice')==='adult'&&E('S.logs[S.logs.length-1].cat')==='adult');
 await sleep(3500);
 T('4/5 finishing round: overlay; leaving releases mic',(E("document.querySelectorAll('.ov').forEach(o=>o.remove());goHome();1"),E('!MIC.st')&&st.tracksStopped>=1));
 const g1=st.gum;E('S.set.mode="speak";startRound()');await sleep(100);T('re-enter 看圖說詞: asked once more only at new session',st.gum===g1+1);
 E('goHome()');E('hmGo(0)');T('4 back to home stops mic',!E('MIC.st'));
 // retry + visibility
 E('startRound()');await sleep(100);E('sDone("retry")');T('retry does not complete or count wrong',E('G.lock')===false&&E('G.sp.retry')===1&&E('G.tries')===0);
 Object.defineProperty(d,'hidden',{value:true,configurable:true});d.dispatchEvent(new w.Event('visibilitychange'));T('switch app: mic released',!E('MIC.st'));
 Object.defineProperty(d,'hidden',{value:false,configurable:true});d.dispatchEvent(new w.Event('visibilitychange'));T('back to app: shows enable button (needs a tap)',d.querySelector('#mnote').textContent.includes('啟用麥克風'));
 await E('micStart()');T('tap to re-enable works',E('!!MIC.st'));E('leave()');
 // denied
 ({w,st}=mk({deny:1}));await sleep(400);const e2=s=>w.eval(s);
 e2(`S.cards=[{id:'a',text:'火車',zy:'ㄏㄨㄛˇ ㄔㄜ',img:'',audio:'',cats:[]}];(S.cats=[{id:'bk',name:'測'}],S.cards.forEach(c=>c.cats=['a'].includes(c.id)?['bk']:[]),S.set.src='c:bk');S.set.n=2;S.set.sound=false;S.set.music=false;S.set.mode='speak';S.set.mix=false;home();startRound()`);await sleep(100);
 T('6 denied: clear message, teacher confirm still completes',w.document.querySelector('#mnote').textContent.includes('目前無法使用麥克風，可以開啟權限或改由老師確認')&&(()=>{const b=e2('S.logs.length');e2('sDone("ind")');return e2('S.logs.length')===b+1})());
 ({w,st}=mk({nomic:1}));await sleep(400);
 w.eval(`S.cards=[{id:'a',text:'火車',zy:'ㄏㄨㄛˇ ㄔㄜ',img:'',audio:'',cats:[]}];(S.cats=[{id:'bk',name:'測'}],S.cards.forEach(c=>c.cats=['a'].includes(c.id)?['bk']:[]),S.set.src='c:bk');S.set.n=1;S.set.sound=false;S.set.music=false;S.set.mode='speak';S.set.mix=false;home();startRound()`);await sleep(100);
 T('8 no mic / unsupported: no crash, teacher confirm works',w.document.querySelector('#mnote').textContent.includes('不支援')&&(()=>{const b=w.eval('S.logs.length');w.eval('sDone("ind")');return w.eval('S.logs.length')===b+1})());
 // ---- speech ----
 ({w,st}=mk());await sleep(400);const e3=s=>w.eval(s);
 e3(`S.set.music=false;S.cards=[{id:'a',text:'計程車',zy:'',img:'',audio:'',cats:[]}]`);
 const run=async t=>{st.spoken=[];e3(`speak({text:'${t}'})`);await sleep(60*t.length+30*(t.length-1)+400);return st.spoken};
 let sp=await run('高鐵');T('16 two chars: 2 utterances, ~0.03s gap',sp.length===2&&sp[1].t-sp[0].t>=85&&sp[1].t-sp[0].t<200&&sp[0].text==='高'&&sp[1].text==='鐵');
 sp=await run('計程車');T('17 three chars: 2 gaps each ~0.1s',sp.length===3&&sp[1].t-sp[0].t>=85&&sp[2].t-sp[1].t>=85&&sp[2].t-sp[1].t<200);
 sp=await run('一二三四');T('18 four chars: 3 gaps',sp.length===4&&[1,2,3].every(i=>sp[i].t-sp[i-1].t>=85&&sp[i].t-sp[i-1].t<200));
 T('rate is 0.75 (new default)',sp.every(x=>Math.abs(x.rate-.75)<.01));
 await sleep(200);T('19 no extra wait after last char (idle)',!d.querySelector('#sayst')||w.document.querySelector('#sayst').classList.contains('hide'));
 // overlap / cancel
 st.spoken=[];e3(`speak({text:'高鐵'})`);await sleep(40);e3(`speak({text:'火車'})`);await sleep(1500);
 T('20 new click cancels previous: no old 鐵 after restart, no pile-up',st.spoken.map(x=>x.text).join('')==='高火車');
 st.spoken=[];e3(`speak({text:'計程車'})`);await sleep(40);e3(`ask=ask;stopSpeak()`);await sleep(2500);
 T('21 stopSpeak (question switch/home) halts remaining chars',st.spoken.length===1);
 st.spoken=[];e3(`speak({text:'計程車'})`);await sleep(200);e3(`mus.d=0;dk(1)`);
 e3(`speak({text:'高鐵'})`);T('22 music ducked while speaking, to 25% (spec: 20–30%)',e3('mus.d')===1&&e3('S.set.mv=.4;musVol()')===.1);
 await sleep(1200);T('22b music restored after speech ends',e3('mus.d')===0);
 // teacher audio is not split
 e3(`window.__a=[];Audio=function(u){this.u=u;this.pause=()=>{};this.play=()=>{__a.push(u);return Promise.resolve()}}`);st.spoken=[];e3(`speak({text:'高鐵',audio:'data:audio/x'})`);await sleep(100);
 T('teacher recording played whole (not cut into characters)',e3('__a.length')===1&&st.spoken.length===0);
 // in-game hint buttons use slow speech
 e3(`S.cards=[{id:'a',text:'高鐵',zy:'ㄍㄠ ㄊㄧㄝˇ',img:'',audio:'',cats:[]}];(S.cats=[{id:'bk',name:'測'}],S.cards.forEach(c=>c.cats=['a'].includes(c.id)?['bk']:[]),S.set.src='c:bk');S.set.mode='listen';S.set.n=1;S.set.hl={w:1,c:1,p:1,f:1,a:1};home();startRound()`);await sleep(50);
 st.spoken=[];e3("kHint('w')");await sleep(1200);T('聽一聽 button speaks per character',st.spoken.length===2);
 console.log(P+' pass, '+F+' fail');process.exit(0)})().catch(e=>{console.log('ERR',e);process.exit(1)});

//LEGACY2

//LEGACY3
