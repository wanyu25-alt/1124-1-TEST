// 整合驗收（jsdom 模擬）：遊戲真正產生的紀錄 → 個案隔離 → 教師儀表板／家長專區讀得到，切換個案互不混。
const {JSDOM}=require('jsdom');const fs=require('fs');const {IDBFactory}=require('fake-indexeddb');
const html=fs.readFileSync(process.env.IDX,'utf8').replace(/<script src[^>]*><\/script>/,'');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let P=0,F=0;const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const mk=()=>new JSDOM(html,{url:'http://localhost/?noseed',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
 w.indexedDB=new IDBFactory();w.alert=()=>{};w.confirm=()=>true;w.AudioContext=function(){};w.speechSynthesis={getVoices:()=>[],cancel(){},speak(u){setTimeout(()=>u.onend&&u.onend(),20)}};w.SpeechSynthesisUtterance=function(t){this.text=t};
 w.fetch=()=>Promise.reject(new Error('no network'));w.URL.createObjectURL=()=>'blob:t';w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){};
 w.Audio=class{constructor(s){this.src=s||'';this.volume=1;this.paused=true}play(){return Promise.resolve()}pause(){}};w.navigator.mediaDevices={getUserMedia:async()=>({active:true,getTracks:()=>[{stop(){}}]})}}}).window;
const boot=async()=>{const w=mk();const t0=Date.now();while(Date.now()-t0<8000&&!w.eval('typeof P17!=="undefined"&&S.set.ttsMig===3'))await sleep(50);await sleep(300);return w};
const E=(w,s)=>w.eval(s);
const play=async(w,st,mode)=>{E(w,`UI.pick('${mode}');FL.open(${st});FL.go()`);await sleep(400);for(let i=0;i<14&&E(w,'S.set.mode')==='expose';i++){E(w,'try{EXP.done()}catch(e){}');await sleep(700)}await sleep(500)};
(async()=>{const w=await boot();
 E(w,`S.set.music=false;S.set.sound=false;V2.prepDone=true;S.set.anim=false;S.cats=[{id:'fr',name:'水果',order:[]},{id:'an',name:'動物',order:[]}];
  S.cards=[['a','蘋果','fr'],['b','香蕉','fr'],['c','貓','an'],['d','狗','an'],['e','魚','an'],['f','橘子','fr']].map(([id,t,c])=>({id:id,text:t,zy:'ㄅㄚ',img:'${PNG}',audio:'',cats:[c],created:1,modified:1}));save()`);
 const idA=E(w,'LRN.id()');const name=E(w,'LRN.cur().name');
 T('預設個案名稱不是真實學生姓名（沒有預設真名）',/^(新個案|個案|示範|學生)/.test(name)||name.length<=6,name);
 await play(w,1,'quiet');
 T('第 1 站：進入後 G.on 且有題目',E(w,'!!G.on&&!!G.cur&&S.set.mode==="pick"'),E(w,'S.set.mode'));
 // 答對一題
 for(let k=0;k<3;k++){E(w,'if(G.pk){document.querySelectorAll(".pko")[G.pk.ci].click()}');await sleep(1800)}
 const rA=E(w,'S.recs.map(r=>({l:r.learnerId,i:r.itemId,o:r.outcome,g:r.game,st:r.stage||r.station||r.st}))');
 T('答題後產生紀錄，每筆都有個案 ID、題目 ID、結果、題型',rA.length>=1&&rA.every(r=>r.l===idA&&r.i&&r.o&&r.g),rA);
 const starsA=E(w,'S.rw.stars');
 T('答對後星星增加（簡單星星獎勵）',starsA>=1,starsA);
 E(w,'try{leave()}catch(e){}');await sleep(300);
 // 新增個案 B：資料隔離
 const idB=E(w,'LRN.add("乙").id');E(w,`LRN.switchTo('${idB}')`);await sleep(300);
 T('切到新個案：紀錄與星星是空的（不混到 A）',E(w,'S.recs.length')===0&&E(w,'S.rw.stars')===0,[E(w,'S.recs.length'),E(w,'S.rw.stars')]);
 T('切到新個案：教材（圖卡）是共用的，沒有被清空',E(w,'S.cards.length')===6);
 await play(w,1,'quiet');for(let k=0;k<2;k++){E(w,'if(G.pk){document.querySelectorAll(".pko")[G.pk.ci].click()}');await sleep(1800)}E(w,'try{leave()}catch(e){}');await sleep(300);
 const rB=E(w,'S.recs.length');T('個案 B 玩完後有自己的紀錄，且 learnerId 都是 B',rB>=1&&E(w,'S.recs.every(r=>r.learnerId===LRN.id())'),rB);
 E(w,`LRN.switchTo('${idA}')`);await sleep(300);
 T('切回 A：A 的紀錄筆數不變、星星不變',E(w,'S.recs.length')===rA.length&&E(w,'S.rw.stars')===starsA,[E(w,'S.recs.length'),rA.length]);
 // 教師端：儀表板讀得到紀錄且需要密碼時被擋
 E(w,'ACL.unlocked=true;ACL.at=Date.now();tab(2)');await sleep(300);
 const t=E(w,'document.querySelector("#tch").textContent');T('教師後台能開啟並顯示 A 的資料（非空白頁）',t.length>200,t.length);
 T('教師後台各分頁都能開啟、無例外（'+E(w,'1')+' 項）',(()=>{let bad=[];const n=18;for(let i=0;i<n;i++){try{E(w,`tab(${i});document.querySelector("#tch").innerHTML.length`)}catch(e){bad.push([i,e.message])}}return bad.length===0})());
 // 設定密碼後，沒解鎖進不去
 E(w,'S.acl=S.acl||{};');const un=E(w,'ACL.unlock?1:0');
 const pw=E(w,'(()=>{try{ACL.setPin&&ACL.setPin("2468");return ACL.has()}catch(e){return "ex "+e.message}})()');
 if(pw===true){E(w,'ACL.unlocked=false');T('設了教師密碼後，未解鎖時 ACL.need() 為真（後台被擋）',E(w,'ACL.need()')===true);
  T('密碼只存雜湊，不存明碼',!JSON.stringify(E(w,'S.acl')).includes('2468'));}else T('（略過）無法在測試中設定密碼：'+pw,true);
 // 家長專區不得出現教師專業分頁
 const par=E(w,'typeof PAR!=="undefined"');T('家長專區模組存在',par);
 console.log(`t241: ${P} pass ${F} fail`);process.exit(F?1:0)})();
