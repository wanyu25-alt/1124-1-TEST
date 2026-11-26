// 測試用麥克風與語音辨識替身（只在 e2e 測試中注入，不是網站程式；不是真的麥克風、不是真的辨識引擎）
// 麥克風：getUserMedia 回傳 Web Audio 產生的「模擬人聲」（160 Hz 鋸齒波＋低通，每 0.25 秒開合一次），音量可調；也可加背景噪音。
//   __mic.voice(x)：模擬人聲音量（0＝不說話，0.02＝很小聲，0.3＝正常）；__mic.noise(x)：背景噪音；__mic.zero(1)：串流沒有任何訊號
//   __micDeny=1：拒絕麥克風權限；__gum：getUserMedia 被呼叫的次數
// 語音辨識：__sr（所有辨識物件）、__srLog（start/stop/abort 與當時是否有系統聲音）、__say(文字, 是否最後結果)、__srErr(代碼)、__srEnd()
window.__gum=0;window.__srLog=[];window.__sr=[];window.__micN=window.__micN==null?.0005:window.__micN;/* 預設有很小的環境底噪（約 −70 dB），接近真實麥克風 */
(()=>{const md=navigator.mediaDevices||(navigator.mediaDevices={});let ctx=null,vg=null,ng=null,zg=null;
 window.__mic={voice(x){if(vg)vg.gain.value=x;window.__micV=x},noise(x){if(ng)ng.gain.value=x;window.__micN=x},zero(z){if(zg)zg.gain.value=z?0:1;window.__micZ=z}};
 const gum=async c=>{window.__gum++;if(window.__micDeny)throw Object.assign(new Error('Permission denied'),{name:'NotAllowedError'});
  ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();try{await ctx.resume()}catch(e){}
  const dest=ctx.createMediaStreamDestination();zg=ctx.createGain();zg.gain.value=window.__micZ?0:1;zg.connect(dest);
  const o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=160;const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2400;
  const am=ctx.createGain();am.gain.value=0;const lfo=ctx.createOscillator();lfo.type='square';lfo.frequency.value=2;const lg=ctx.createGain();lg.gain.value=.5;const lb=ctx.createConstantSource?ctx.createConstantSource():null;
  lfo.connect(lg);lg.connect(am.gain);if(lb){lb.offset.value=.5;lb.connect(am.gain);lb.start()}
  vg=ctx.createGain();vg.gain.value=window.__micV||0;o.connect(lp);lp.connect(am);am.connect(vg);vg.connect(zg);o.start();lfo.start();
  const len=ctx.sampleRate*2,buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  const ns=ctx.createBufferSource();ns.buffer=buf;ns.loop=true;ng=ctx.createGain();ng.gain.value=window.__micN||0;ns.connect(ng);ng.connect(zg);ns.start();
  return dest.stream};
 /* WebKit：getUserMedia 定義在 MediaDevices.prototype，直接指定實例屬性無效，需同時覆寫原型 */
 try{Object.defineProperty(Object.getPrototypeOf(md),'getUserMedia',{value:gum,configurable:true,writable:true})}catch(e){}
 try{Object.defineProperty(md,'getUserMedia',{value:gum,configurable:true,writable:true})}catch(e){md.getUserMedia=gum}
 md.getSupportedConstraints=md.getSupportedConstraints||(()=>({echoCancellation:true,noiseSuppression:true,autoGainControl:true}));
 const busy=()=>{try{return !!(MV.busy())}catch(e){return null}};
 class SR{constructor(){this.res=[];this.on=false;window.__sr.push(this)}
  start(){if(this.on)throw Object.assign(new Error('already started'),{name:'InvalidStateError'});this.on=true;window.__srLog.push({ev:'start',t:Math.round(performance.now()),busy:busy(),cont:this.continuous});setTimeout(()=>this.onstart&&this.onstart({}),20)}
  stop(){window.__srLog.push({ev:'stop',t:Math.round(performance.now())});if(!this.on)return;this.on=false;setTimeout(()=>this.onend&&this.onend({}),20)}
  abort(){window.__srLog.push({ev:'abort',t:Math.round(performance.now())});if(!this.on)return;this.on=false;setTimeout(()=>this.onend&&this.onend({}),10)}}
 window.SpeechRecognition=window.webkitSpeechRecognition=SR;
 window.__srCur=()=>window.__sr.filter(r=>r.on).pop()||null;
 window.__say=(txt,fin=true,alts)=>{const r=window.__srCur();if(!r)return false;const a=[txt,...(alts||[])].map(t=>({transcript:t,confidence:.8}));const res=Object.assign(a,{isFinal:fin});
  if(!r.continuous)r.res=[];if(r.res.length&&!r.res[r.res.length-1].isFinal)r.res[r.res.length-1]=res;else r.res.push(res);
  r.onresult&&r.onresult({resultIndex:r.res.length-1,results:r.res});if(!r.continuous&&fin){r.on=false;setTimeout(()=>r.onend&&r.onend({}),20)}return true};
 window.__srErr=code=>{const r=window.__srCur();if(!r)return false;r.onerror&&r.onerror({error:code});r.on=false;setTimeout(()=>r.onend&&r.onend({}),20);return true};
 window.__srEnd=()=>{const r=window.__srCur();if(!r)return false;r.on=false;r.onend&&r.onend({});return true};
})();
