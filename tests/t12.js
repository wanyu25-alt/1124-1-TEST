const {JSDOM}=require('jsdom');const fs=require('fs');require('fake-indexeddb/auto');
const html=fs.readFileSync((process.env.IDX||'/mnt/user-data/outputs/vocabulary-express/index.html'),'utf8').replace(/<script src[^>]*><\/script>/,'').replace('gv:true,','gv:false,')/* 這支測試專測既有收音／閒置行為；真人操作引導語音另由 t250／t251 測 */.replace("lm:'quiet'","lm:'integ'").replace("or:30,","or:0,").replace("hz:{u:'once',cost:true,n:1,free:false}","hz:{u:'none',cost:false,n:1,free:true}").replace("ap:true,","ap:false,").replace("oj:'A'","oj:'B'").replace("prepDone:false","prepDone:true");
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let P=0,F=0;const T=(n,c)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n)};
const mk=o=>{const st={asr:[],say:[],conf:0,notes:0,res:'火車',err:null};
 const w=new JSDOM(html,{url:'http://localhost/?noseed',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.indexedDB=indexedDB;w.alert=()=>{};w.Audio=class{constructor(s){this.src=s;this.volume=1}play(){setTimeout(()=>this.onended&&this.onended(),60);return Promise.resolve()}pause(){}};w.confirm=()=>{st.conf++;return o.agree!==false};
  w.AudioContext=function(){this.currentTime=0;this.state='running';this.destination={};this.resume=()=>{};this.createGain=()=>({gain:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}},connect:x=>x,disconnect(){}});this.createOscillator=()=>({frequency:{},connect:x=>x,start(){st.notes++},stop(){}});this.createAnalyser=()=>({fftSize:256,frequencyBinCount:128,getByteTimeDomainData(a){a.fill(128)},getByteFrequencyData(a){a.fill(0)}});this.createMediaStreamSource=()=>({connect(){},disconnect(){}})};
  w.navigator.mediaDevices={getUserMedia:async()=>({active:true,getTracks:()=>[{stop(){}}]})};
  w.speechSynthesis={getVoices:()=>[],cancel(){},speak(u){st.say.push({t:Date.now(),x:u.text});setTimeout(()=>u.onend&&u.onend(),30)}};w.SpeechSynthesisUtterance=function(t){this.text=t};
  if(!o.noasr)w.webkitSpeechRecognition=function(){const me=this;st.inst=me;st.asr.push(Date.now());this.start=()=>{st.starts=(st.starts||0)+1;if(st.err)setTimeout(()=>{me.onerror&&me.onerror({error:st.err});me.onend&&me.onend()},10);else me.onstart&&me.onstart()};this.abort=()=>{me.dead=1};
   me.emit=(txt,fin=true,idx=0,all)=>{const rs=all||[Object.assign([{transcript:txt}],{isFinal:fin})];me.onresult&&me.onresult({resultIndex:idx,results:rs})}}}}).window;return {w,st}};
(async()=>{
 const setup=`S.cards=[{id:'a',text:'火車',zy:'ㄏㄨㄛˇ ㄔㄜ',img:'',audio:'',cats:[]},{id:'b',text:'高鐵',zy:'ㄍㄠ ㄊㄧㄝˇ',img:'',audio:'',cats:[]}];(S.cats=[{id:'bk',name:'測'}],S.cards.forEach(c=>c.cats=['a','b'].includes(c.id)?['bk']:[]),S.set.src='c:bk');S.set.order='seq';S.set.n=2;S.set.sound=false;S.set.music=true;S.set.mix=false;S.asrAgreed=0;S.asrDecl=0;`;
 let {w,st}=mk({});await sleep(400);let E=s=>w.eval(s);
 E(setup+`S.set.mode='speak';home();startRound()`);await sleep(100);
 T('music OFF in 看圖說詞',!E('mus.t')&&!E('mus.a'));
 T('ASR is main (big mic button), consent asked once at start',!!w.document.querySelector('#asrb')&&st.conf===1&&E('S.asrAgreed')===1);
 T('ASR started once inside the start click',st.asr.length===1&&st.starts===1);
 await sleep(300);st.inst.emit('我覺得是火車',true);await sleep(100);
 T('continuous ASR: matching speech completes automatically',E('S.logs.length')>=1&&E('S.logs[S.logs.length-1].sp.choice')==='asr'&&E('S.logs[S.logs.length-1].sp.asrOk')===1);
 T('duplicate result right after success is ignored (one log)',(st.inst.emit('火車',true),st.inst.emit('火車',true),E('S.logs.length')===1));
 await sleep(2000);
 T('auto-advance + NO new recognition start / no new mic prompt for question 2',st.asr.length===1&&st.starts===1&&E('G.i')>=1&&!E('G.lock'));
 st.inst.emit('隨便說',true,1,[Object.assign([{transcript:'火車'}],{isFinal:true}),Object.assign([{transcript:'隨便說'}],{isFinal:true})]);
 await sleep(50);
 T('non-matching = advisory only, not wrong/fail',E('G.tries')===0&&!E('G.lock')&&w.document.querySelector('#msg').textContent.includes('聽到')&&!/錯|失敗/.test(w.document.querySelector('#msg').textContent)&&E('G.sp.miss')===1);
 await sleep(500);T('ASR miss → 請再說一次 pause, then recognition reopened (new session after voice)',E('ASR.paused')===false&&E('ASR.on')===true);E('G.cur.text="高鐵"');E('ASR.lockUntil=0;ASR.skipUntil=0');E('SP.speaking=true');st.inst.emit('高鐵',true,0,[Object.assign([{transcript:'x'}],{isFinal:true}),Object.assign([{transcript:'高鐵'}],{isFinal:true})]);
 T('results while game TTS speaking are ignored',!E('G.lock')&&E('G.sp.asrOk')===0);E('SP.speaking=false');
 const nl=E('S.logs.length');E('sDone("ind")');T('teacher can still confirm after ASR miss',E('S.logs.length')===nl+1);
 st.inst.onend();await sleep(400);T('browser end → auto-restart silently (same permission, no consent)',st.starts>=2&&st.conf===1);
 await sleep(3500);E("document.querySelectorAll('.ov').forEach(o=>o.remove());home()");
 // other modes keep music
 E(`S.set.mode='key';startRound()`);await sleep(100);T('other modes keep music',!!E('mus.t')||!!E('mus.a'));E('leave()');
 // mix switches music per question
 E(`S.set.mix=true;S.set.n=12;startRound()`);await sleep(60);let on=0,off=0;
 for(let i=0;i<12;i++){const m=E('S.set.mode'),pl=!!E('mus.t')||!!E('mus.a');if(m==='speak'){if(!pl)off++;else off-=100}else{if(pl)on++;else on-=100}
  if(m==='speak')E('sOk(1)');else for(const s of JSON.parse(E('JSON.stringify(K.seq.flat().map(s=>s===" "?"Space":Object.entries(ZK).find(e=>e[1]===s)[0]))')))w.document.dispatchEvent(new w.KeyboardEvent('keydown',{code:s,key:s==='Space'?' ':'',bubbles:true,cancelable:true}));
  await sleep(1450)}
 T('mix: music off on speak questions, on for the others',on>0&&off>=0);E('leave()');
 // unsupported
 ({w,st}=mk({noasr:1}));await sleep(400);E=s=>w.eval(s);E(setup+`S.set.mode='speak';home();startRound()`);await sleep(100);
 T('no ASR support: no crash, no big mic button, notice + teacher confirm',!w.document.querySelector('#asrb')&&w.document.querySelector('#bot').textContent.includes('不支援語音辨識')&&(E('sDone("ind")'),E('S.logs.length')>=1));
 // declined
 ({w,st}=mk({agree:false}));await sleep(400);E=s=>w.eval(s);E(setup+`S.set.mode='speak';home();startRound()`);await sleep(1200);
 T('declined consent: never records/sends, falls back to teacher confirm',st.asr.length===0&&E('S.asrDecl')===1&&w.document.querySelector('#bot').textContent.includes('不使用語音辨識'));
 // gap 0.1s
 ({w,st}=mk({}));await sleep(400);E=s=>w.eval(s);E(`S.set.music=false;speak({text:'計程車'})`);await sleep(600);
 T('speech gap ~0.03s (3 chars)',st.say.length===3&&st.say[1].t-st.say[0].t<200&&st.say[1].t-st.say[0].t>=60&&st.say[2].t-st.say[1].t<200);
 ({w,st}=mk({}));await sleep(400);E=s=>w.eval(s);st.err='not-allowed';E(setup+`S.asrAgreed=1;S.set.mode='speak';home();startRound()`);await sleep(300);
 T('permission denied: no restart loop, notice + teacher confirm',st.starts===1&&/無法使用語音辨識/.test(w.document.querySelector('#msg').textContent));
 ({w,st}=mk({}));await sleep(400);E=s=>w.eval(s);E(setup+`S.asrAgreed=1;S.set.mode='speak';home();startRound()`);await sleep(100);for(let k=0;k<6;k++){st.inst.onend&&st.inst.onend();await sleep(300)}
 T('restart limit: stops after rapid ends, shows button',st.starts<=6&&E('ASR.gave')===true);
 ({w,st}=mk({}));await sleep(400);E=s=>w.eval(s);E(setup+`S.asrAgreed=1;S.set.mode='speak';home();startRound()`);await sleep(100);E('goHome&&goHome()');E('leave()');await sleep(100);
 T('leave releases recognition',E('ASR.on')===false&&st.inst.dead===1);
 console.log(P+' pass, '+F+' fail');process.exit(0)})().catch(e=>{console.log('ERR',e);process.exit(1)});

//LEGACY2

//LEGACY3
