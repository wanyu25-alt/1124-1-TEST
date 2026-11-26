// 測試用語音替身（只在 e2e 測試注入）：建立假的語音清單，並依語音名稱模擬「正常／錯誤／太快結束／一直不開始」。
// 必須在 audio-stub.js 之後載入。真實喇叭是否有聲音無法用此方式驗證。
(()=>{window.__voices=window.__voices||[
 {name:'Google 國語（臺灣）',lang:'zh-TW',localService:false,voiceURI:'g-tw'},
 {name:'美佳',lang:'zh-TW',localService:true,voiceURI:'meijia'},
 {name:'Eddy (中文（台灣）)',lang:'zh-TW',localService:true,voiceURI:'eddy-tw'},
 {name:'Tingting',lang:'zh-CN',localService:true,voiceURI:'tingting'},
 {name:'Samantha',lang:'en-US',localService:true,voiceURI:'samantha'}];
 window.__vb=window.__vb||{};/* 名稱 → ok | error | fast | nostart */
 try{Object.defineProperty(SpeechSynthesisUtterance.prototype,'voice',{configurable:true,get(){return this.__v||null},set(v){this.__v=v}})}catch(e){}
 const SP=SpeechSynthesis.prototype,st={cur:null};
 SP.getVoices=function(){return window.__voices};
 try{Object.defineProperty(SP,'speaking',{configurable:true,get:()=>!!st.cur})}catch(e){}
 SP.cancel=function(){if(st.cur){clearTimeout(st.cur.tm);clearTimeout(st.cur.t1);st.cur=null}};
 SP.speak=function(u){const txt=u.text;if(!txt||!txt.trim()){setTimeout(()=>u.onend&&u.onend({}),5);return}
  const vn=u.voice?u.voice.name:'(預設)',b=window.__vb[vn]||'ok';window.__al.push({t:Math.round(performance.now()),tts:txt,voice:vn,beh:b});
  const c={u};st.cur=c;
  if(b==='error'){c.t1=setTimeout(()=>{if(st.cur===c){st.cur=null;u.onerror&&u.onerror({error:'synthesis-failed'})}},20);return}
  if(b==='nostart')return;
  if(b==='notallowed'){c.t1=setTimeout(()=>{if(st.cur===c){st.cur=null;u.onerror&&u.onerror({error:'not-allowed'})}},10);return}
  const dur=b==='fast'?20:(window.__dur||180);c.t1=setTimeout(()=>{if(st.cur===c)u.onstart&&u.onstart({})},5);c.tm=setTimeout(()=>{if(st.cur!==c)return;st.cur=null;u.onend&&u.onend({})},dur)}})();
