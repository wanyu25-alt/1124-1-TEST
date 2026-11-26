const fs=require('fs');const {JSDOM}=require('jsdom');require('fake-indexeddb/auto');
const html=fs.readFileSync(''+(process.env.IDX||(process.env.IDX||'/mnt/user-data/outputs/vocabulary-express/index.html'))+'','utf8').replace(/<script src[^>]*><\/script>/,'').replace('prepDone:false','prepDone:true');
const R={P:0,F:0},T=(n,c)=>{c?R.P++:R.F++;console.log(c?'PASS':'FAIL',n)},sleep=ms=>new Promise(r=>setTimeout(r,ms));
function mk(opt={}){const w=new JSDOM((opt.prep?html.replace('prepDone:true','prepDone:false'):html),{url:'http://localhost/?noseed'+(process.env.LIBMODE?'&libmode='+process.env.LIBMODE:''),runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
 if(opt.vocab)w.fetch=async u=>{const p=require('path').join(process.env.VDIR||'/home/claude/repo',String(u).split('?')[0]);if(!fs.existsSync(p))return{ok:false,status:404};const b=fs.readFileSync(p);return{ok:true,status:200,json:async()=>JSON.parse(b.toString('utf8')),text:async()=>b.toString('utf8')}};
 w.indexedDB=opt.fresh?new (require('fake-indexeddb').IDBFactory)():indexedDB;w.alert=()=>{};w.confirm=()=>true;w.__ttsLog=[];w.__aud=[];w.__asr=[];w.__gum=0;
 w.speechSynthesis={getVoices:()=>[],cancel(){w.__ttsCancel=(w.__ttsCancel||0)+1},speak(u){w.__ttsLog.push({t:u.text,at:Date.now(),rate:u.rate,vol:u.volume});setTimeout(()=>u.onend&&u.onend(),60)}};w.SpeechSynthesisUtterance=function(t){this.text=t};
 w.AudioContext=function(){this.currentTime=0;this.state='running';this.destination={};const P=()=>({value:0,setValueAtTime(){return this},exponentialRampToValueAtTime(){},setTargetAtTime(){},cancelScheduledValues(){}});
  this.createGain=()=>({gain:P(),connect(x){return x},disconnect(){}});this.createOscillator=()=>({type:'sine',frequency:P(),connect(x){return x},start(){},stop(){}});this.createBiquadFilter=()=>({type:'',frequency:P(),connect(x){return x}});
  this.createAnalyser=()=>({fftSize:0,frequencyBinCount:128,smoothingTimeConstant:0,getByteTimeDomainData(b){b.fill(128+(w.__loud?60:0))},getByteFrequencyData(b){b.fill(0)}});this.createMediaStreamSource=()=>({connect(){},disconnect(){}});this.resume=()=>{}};
 /* Audio：每段播 durMs 後自動 ended（模擬真實播放時間） */
 w.Audio=class{constructor(src){this.src=src||'';this.volume=1;this.muted=false;this.paused=true;this.currentTime=0;this.id=w.__aud.length;w.__aud.push(this)}
  play(){this.paused=false;const e=this,at=Date.now();w.__aud.log=w.__aud.log||[];w.__aud.log.push({src:e.src,at,el:e});if(w.__aud.live&&w.__aud.live!==e&&!w.__aud.live.paused&&w.__aud.live.src.startsWith('voice/')&&e.src.startsWith('voice/')&&!e.muted)w.__viol=(w.__viol||0)+1;
   w.__aud.live=e;clearTimeout(e._t);e._t=setTimeout(()=>{if(!e.paused&&e.src===e._s){e.paused=true;e.onended&&e.onended()}},w.__dur||120);e._s=e.src;return Promise.resolve()}
  pause(){this.paused=true;clearTimeout(this._t)}};
 w.SpeechRecognition=class{constructor(){w.__asr.push(this)}start(){this.started=true;this.onstart&&this.onstart()}abort(){this.aborted=true}stop(){}};
 w.navigator.mediaDevices={getUserMedia:async()=>{w.__gum++;if(opt.deny)throw Object.assign(new Error('x'),{name:'NotAllowedError'});return {active:true,getTracks:()=>[{stop(){}}]}}}}}).window;return w}
const L=w=>(w.__aud.log||[]).map(x=>x.src.replace(/^voice\//,'').replace(/\.m4a$/,''));
module.exports={mk,L,R,T,sleep,html};
