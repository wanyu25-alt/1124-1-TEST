const {JSDOM}=require('jsdom');const fs=require('fs');require('fake-indexeddb/auto');
const html=fs.readFileSync((process.env.IDX||'/mnt/user-data/outputs/vocabulary-express/index.html'),'utf8').replace(/<script src[^>]*><\/script>/,'').replace("lm:'quiet'","lm:'integ'").replace("or:30,","or:0,").replace("hz:{u:'once',cost:true,n:1,free:false}","hz:{u:'none',cost:false,n:1,free:true}").replace("ap:true,","ap:false,").replace("oj:'A'","oj:'B'").replace("prepDone:false","prepDone:true");
exports.sleep=ms=>new Promise(r=>setTimeout(r,ms));
exports.res={P:0,F:0};
exports.T=(n,c)=>{c?exports.res.P++:exports.res.F++;console.log(c?'PASS':'FAIL',n)};
exports.mk=()=>new JSDOM(html,{url:'http://localhost/?noseed',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
 w.indexedDB=indexedDB;w.alert=()=>{};w.confirm=()=>true;w.speechSynthesis={getVoices:()=>[],cancel(){},speak(u){setTimeout(()=>u.onend&&u.onend(),30)}};w.SpeechSynthesisUtterance=function(t){this.text=t};
 w.__osc=[];w.__gain=[];w.__log=[];w.__viol=0;w.__asr=[];w.__els=[];
 w.AudioContext=function(){this.currentTime=0;this.state='running';this.destination={};
  const P=(g)=>({value:0,peak:0,setValueAtTime(v){this.value=v;return this},exponentialRampToValueAtTime(v){this.peak=Math.max(this.peak,v)},setTargetAtTime(){},cancelScheduledValues(){}});
  this.createGain=()=>{const g={gain:P(),connect(x){return x},disconnect(){}};w.__gain.push(g);return g};
  this.createOscillator=()=>{const o={type:'sine',frequency:P(),connect(x){return x},start(){},stop(){}};w.__osc.push(o);return o};
  this.createBiquadFilter=()=>({type:'',frequency:P(),connect(x){return x}});this.resume=()=>{}};
 w.Audio=class{constructor(src){this.src=src||'';this.volume=1;this.muted=false;this.paused=true;this.currentTime=0;w.__els.push(this)}
  play(){if(this.src.startsWith('voice/')&&!this.muted){w.__els.forEach(e=>{if(e!==this&&e.src.startsWith('voice/')&&!e.paused&&!e.muted)w.__viol++})}
   this.paused=false;w.__log.push({src:this.src,vol:this.volume,muted:this.muted,el:this,t:Date.now()});return Promise.resolve()}
  pause(){this.paused=true}end(){this.paused=true;this.onended&&this.onended()}};
 w.SpeechRecognition=class{constructor(){w.__asr.push(this)}start(){this.started=true;this.onstart&&this.onstart()}abort(){this.aborted=true}stop(){}};
 w.navigator.mediaDevices={getUserMedia:async()=>({active:true,getTracks:()=>[{stop(){}}]})}}}).window;
exports.mkSetup=(w)=>{const E=s=>w.eval(s),d=w.document,q=s=>d.querySelector(s);
 const V=()=>w.__log.filter(x=>x.src.startsWith('voice/')&&!x.muted).map(x=>x.src.replace(/voice\/|\.m4a/g,''));
 const endV=()=>{const l=w.__log.filter(x=>x.src.startsWith('voice/')&&!x.muted);const e=w.__els.find(x=>x.src.startsWith('voice/')&&!x.paused&&!x.muted);if(e)e.end()};
 const setup=(n,k,extra='')=>{E(`S.set.stuName='世杰';S.set.keyVoice=false;S.cards=[${['火車','高鐵','公車','計程車'].map((t,i)=>`{id:'c${i}',text:'${t}',zy:'ㄏㄨㄛˇ ㄔㄜ',img:'',audio:'',cats:[]}`).join(',')}];S.cats=[];S.set.src='all';S.set.n=${n};S.set.sound=true;S.set.music=false;S.set.anim=true;S.set.fx='full';S.set.vf=true;S.set.stageMode='daily';S.set.stageN=3;S.asrDecl=1;S.logs=[];S.rw.stars=0;S.rw.badges=[];S.rw.veh=[];S.rw.journeys=[];S.rw.stageLog=[];S.rounds={started:0,completed:0};${extra};IDLE_MS=15000;save();home();goV('${k}')`);w.__log.length=0;w.__osc.length=0};
 const wrong=()=>{w.eval('KV.last={a:null,s:null,t:0}');d.dispatchEvent(new w.KeyboardEvent('keydown',{code:'KeyZ',key:'z',bubbles:true,cancelable:true}))};
 const right=()=>E('kPress(K.seq[K.ci][K.si],"physical_keyboard")');
 return {E,d,q,V,endV,setup,wrong,right}};

//LEGACY2

//LEGACY3
