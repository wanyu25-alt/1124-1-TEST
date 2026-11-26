// 測試用音訊替身（只在 e2e 測試中注入，不是網站程式）：記錄每段「開始播放」並在 __dur 毫秒後自動結束；__failAudio／__failTts 模擬播放失敗。
// 在頁面載入前替換音訊：記錄每一段「開始播放」，固定 dur 毫秒後自動結束（模擬播放，不是真的聲音）
window.__al=[];window.__dur=180;
(()=>{const P=HTMLMediaElement.prototype;P.play=function(){const el=this;const src=(el.getAttribute('src')||el.src||el.currentSrc||'').replace(location.origin,'').replace(/^.*1124-1-TEST\//,'');if(el.muted){return Promise.resolve()}if(window.__failAudio&&/zhuyin|guidance/.test(src))return Promise.reject(new Error('stub-fail'));let tag='E';try{if(typeof AM!=='undefined'&&el===AM.a)tag='P'}catch(e){}window.__live=(window.__live||[]).filter(x=>x.__pl&&!x.muted);if(window.__live.length&&window.__live.some(x=>x!==el))window.__ov=(window.__ov||0)+1;window.__live.push(el);window.__al.push({t:Math.round(performance.now()),a:src,tag});
 el.__pl=true;try{Object.defineProperty(el,'paused',{configurable:true,get:()=>!el.__pl})}catch(e){}clearTimeout(el.__tm);el.__tm=setTimeout(()=>{if(!el.__pl)return;el.__pl=false;try{el.dispatchEvent(new Event('ended'))}catch(e){}if(el.onended)try{el.onended()}catch(e){}},window.__dur);
 setTimeout(()=>{try{el.dispatchEvent(new Event('playing'));el.onplaying&&el.onplaying()}catch(e){}},5);return Promise.resolve()};
 P.pause=function(){this.__pl=false;clearTimeout(this.__tm)};
 const st={cur:null,speaking:false};const SP=window.SpeechSynthesis&&SpeechSynthesis.prototype;
 if(SP){const def=(k,g)=>{try{Object.defineProperty(SP,k,{configurable:true,get:g})}catch(e){}};def('speaking',()=>st.speaking);def('pending',()=>false);def('paused',()=>false);
  SP.getVoices=function(){return[]};SP.pause=function(){};SP.resume=function(){};
  SP.cancel=function(){if(st.cur){clearTimeout(st.cur.tm);st.cur=null}st.speaking=false};
  SP.speak=function(u){const txt=u.text;if(window.__failTts&&txt&&txt.trim()){setTimeout(()=>u.onerror&&u.onerror({error:'synthesis-failed'}),10);return}if(txt===''||txt===' '){setTimeout(()=>u.onend&&u.onend({}),5);return}window.__al.push({t:Math.round(performance.now()),tts:txt,rate:u.rate,vol:u.volume});st.speaking=true;const c={u};st.cur=c;setTimeout(()=>{if(st.cur!==c)return;u.onstart&&u.onstart({})},10);c.tm=setTimeout(()=>{if(st.cur!==c)return;st.cur=null;st.speaking=false;u.onend&&u.onend({})},window.__dur)}}
 if(!window.SpeechSynthesisUtterance)window.SpeechSynthesisUtterance=function(t){this.text=t}})();
