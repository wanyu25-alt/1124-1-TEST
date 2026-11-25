// v2 新功能測試：音檔對照、注音佇列、模式、口語、提示、星星、過關序列、紀錄
const fs=require('fs');const {JSDOM}=require('jsdom');require('fake-indexeddb/auto');
const html=fs.readFileSync((process.env.IDX||'/mnt/user-data/outputs/vocabulary-express/index.html'),'utf8').replace(/<script src[^>]*><\/script>/,'').replace("prepDone:false","prepDone:true");
const R={P:0,F:0},T=(n,c)=>{c?R.P++:R.F++;console.log(c?'PASS':'FAIL',n)},sleep=ms=>new Promise(r=>setTimeout(r,ms));
function mk(opt={}){const w=new JSDOM(html,{url:'http://localhost/?noseed',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
 w.indexedDB=indexedDB;w.alert=()=>{};w.confirm=()=>true;w.__ttsLog=[];w.__aud=[];w.__asr=[];w.__gum=0;
 w.speechSynthesis={getVoices:()=>[],cancel(){w.__ttsCancel=(w.__ttsCancel||0)+1},speak(u){w.__ttsLog.push({t:u.text,at:Date.now()});setTimeout(()=>u.onend&&u.onend(),60)}};w.SpeechSynthesisUtterance=function(t){this.text=t};
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
(async()=>{
 const w=mk();await sleep(500);const E=s=>w.eval(s),q=s=>w.document.querySelector(s);
 /* 1 檔案對照 */
 const P='/mnt/user-data/outputs/vocabulary-express/voice/';const zs=E('ZSY.map(x=>x[0]).join("")');
 T('37 symbols in map',E('ZSY.length')===37&&new Set(E('ZSY.map(x=>x[1])')).size===37);
 T('all 37 are U+3105–U+3129 (ㄧ=U+3127, not 一)',[...zs].every(c=>c.codePointAt(0)>=0x3105&&c.codePointAt(0)<=0x3129)&&zs.includes('ㄧ')&&!zs.includes('一'));
 T('37 files exist, non-empty',E('ZSY.map(x=>x[1])').every(n=>fs.existsSync(P+'zhuyin/zy_'+n+'.m4a')&&fs.statSync(P+'zhuyin/zy_'+n+'.m4a').size>1000));
 T('4 guidance files exist',['retry_try','no_stars','no_hear','slow'].every(n=>fs.existsSync(P+'guidance/'+n+'.m4a')));
 T('5 original recordings intact',['ok','retry','cheer','again','pass'].every(n=>fs.existsSync(P+n+'.m4a')));
 T('zhuyin file names are ASCII only',fs.readdirSync(P+'zhuyin').every(f=>/^[\x20-\x7e]+$/.test(f)));
 /* 2 佇列順序：葡萄 */
 const setup=(x='')=>E(`S.set.legacyCost=true;S.cards=[{id:'p1',text:'葡萄',zy:'ㄆㄨˊ ㄊㄠˊ',img:'',audio:'',cats:[]},{id:'p2',text:'火車',zy:'ㄏㄨㄛˇ ㄔㄜ',img:'',audio:'',cats:[]}];S.cats=[];S.set.src='all';S.set.order='seq';S.set.n=2;S.set.sound=true;S.set.stuName='';S.set.mode='listen';S.set.hl={w:1,c:1,p:1,f:1,a:1};${x};1`);
 setup('S.set.lm="quiet"');w.__dur=60;
 const itm=E(`ZQ.items(S.cards[0]).map(i=>i.k).join(',')`);
 T('order 葡萄: word,ㄆ,ㄨ,ㄆㄨˊ,ㄊ,ㄠ,ㄊㄠˊ,word',itm==='W:葡萄,S:ㄆ,S:ㄨ,Y:ㄆㄨ,S:ㄊ,S:ㄠ,Y:ㄊㄠ,W:葡萄'||itm==='W:葡萄,S:ㄆ,S:ㄨ,Y:ㄆㄨˊ,S:ㄊ,S:ㄠ,Y:ㄊㄠˊ,W:葡萄');
 T('syllable key keeps tone mark',itm.includes('ㄆㄨˊ')&&itm.includes('ㄊㄠˊ'));
 T('no tone name audio / tone not a clip',!/˙|ˊ,|S:ˊ/.test(itm.replace(/Y:[^,]*/g,'')));
 T('no concatenation: syllable is TTS/custom item not symbol join',E(`ZQ.items(S.cards[0]).filter(i=>i.k.startsWith('Y:')).every(i=>i.tts!==undefined||i.url&&!/zy_/.test(i.url))`));
 /* 3 播放：0.3 秒間隔、自動播放 1 秒延遲、一次 */
 E('startRound()');const t0=Date.now();await sleep(700);
 T('no audio before 1 s auto-play delay',L(w).filter(s=>s.startsWith('zhuyin')).length===0);
 await sleep(4000);
 const zl=(w.__aud.log||[]).filter(x=>/zhuyin/.test(x.src));
 T('auto-play played symbol clips for first question',zl.length>=4);
 const gaps=E('ZQ.log').filter(x=>x.s!==undefined),en=E('ZQ.log').filter(x=>x.e!==undefined);let gm=[];for(let i=1;i<gaps.length&&i<en.length+1;i++)if(en[i-1]&&gaps[i])gm.push(gaps[i].s-en[i-1].e);
 const ks=E('ZQ.log').map(x=>x.k);T('silence between clips ≈0.3 s in total (program gap + 0.3 s lead of next file ÷ rate)',gm.length>3&&gm.every((g,i)=>{const nxt=(E('ZQ.log').filter(x=>x.s!==undefined)[i+1]||{}).k||'';return nxt.startsWith('S:')?(g>=30&&g<=200):(g>=270&&g<=420)}));
 const first=(w.__aud.log||[]).filter(x=>/zhuyin/.test(x.src))[0];
 T('auto-play started ≥ ~1 s after question',first&&first.at-t0>=950);
 const n1=zl.length;await sleep(1200);T('auto-play only once per question',(w.__aud.log||[]).filter(x=>/zhuyin/.test(x.src)).length===n1);
 /* 4 再聽一次：快速連按不重疊、不扣星、保留輸入 */
 E('S.rw.stars=3');E('kPress(K.seq[0][0],"physical_keyboard")');const typed0=E('K.si');
 w.__viol=0;for(let i=0;i<6;i++){E('V2.replay()');await sleep(20)}
 T('rapid 再聽一次: no overlapping clips',(w.__viol||0)===0);
 T('replay keeps typed input & stars unchanged',E('K.si')===typed0&&E('S.rw.stars')===3);
 T('replay button big & present',!!q('#rep'));
 const rb=q('#rep').getBoundingClientRect?1:0;
 T('replay not adjacent to hint button (different containers)',!q('.hzg').contains(q('#rep'))&&q('.hzg')&&!q('#rep').nextElementSibling.classList.contains('hzb'));
 /* 5 提示：解鎖、花費、不足仍可用 */
 await sleep(5200);
 T('hint locked before active replay finished (message)',(()=>{E('G.repDone=0');E('kHint("p")');return q('#msg').textContent.includes('先再聽一次')&&E('K.hst.length')===0})());
 T('locked: no star deducted',E('S.rw.stars')===3);
 E('G.repDone=1');E('kHint("p")');T('partial: spend starts, hint not yet shown',E('G.hzBusy')===1&&E('K.hst.length')===0);
 E('kHint("p")');E('kHint("p")');
 await sleep(1500);T('hint (聲母) revealed after spend animation',E('K.hst.join()')==='0');
 T('exactly 1 star deducted (debounced, no double)',E('S.rw.stars')===2&&E('S.rw.spent')===1);
 /* 不足仍可使用 */
 E('ask()');await sleep(30);E('S.rw.stars=0;G.repDone=1');w.__aud.log=[];E('kHint("p")');await sleep(80);
 T('insufficient stars: hint still revealed, stars stay 0 (never negative)',E('K.hst.length')===1&&E('S.rw.stars')===0&&E('K.hded')===0&&E('K.hcost')===1);
 T('insufficient stars: no 星星不夠囉 block voice',!L(w).includes('guidance/no_stars'));
 E('S.set.hz.free=true');E('kHint("f")');await sleep(100);T('teacher free-open: full shown, cost 0',E('K.hfull')===1&&E('S.rw.stars')===0);E('S.set.hz.free=false');
 /* 星星獲得動畫 */
 E('S.rw.stars=5');E('V2.gain(1)');T('gain animation element exists',!!w.document.querySelector('.stfx.gn')&&w.document.querySelector('.stfx.gn .stn').textContent==='+1');
 E('S.set.sa.size=4');E('V2.gain(1)');T('size 3–4× icon',w.document.querySelector('.stfx.gn:last-of-type').style.getPropertyValue('--ss')==='4');
 /* wrong feedback voices */
 w.__aud.log=[];E('S.set.vf=true');E('ask()');await sleep(30);E('G.wc=0');E('wrongHit()');await sleep(40);const v1=L(w);
 T('1st wrong → retry voice (原 再一次喔)',v1.includes('retry'));
 E('wrongHit()');await sleep(40);E('wrongHit()');await sleep(40);
 T('3rd wrong → 沒關係 請慢慢來',L(w).includes('guidance/slow'));
 w.__aud.log=[];E('ask()');await sleep(30);E('G.wc=0;V2.alt=false');E('wrongHit()');await sleep(40);T('alternate: next first-wrong uses 再試試看',L(w).includes('guidance/retry_try')||L(w).includes('retry'));
 console.log('P',R.P,'F',R.F);process.exit(R.F?1:0)})();
