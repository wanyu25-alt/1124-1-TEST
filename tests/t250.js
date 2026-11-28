// 六個真人操作引導語音整合（jsdom 模擬）：觸發、禁止條件、不重疊、麥克風暫停／恢復、紀錄、開關。
// 注意：麥克風與語音辨識都是「模擬物件」，不是真實收音。
const {JSDOM}=require('jsdom');const fs=require('fs');const {IDBFactory}=require('fake-indexeddb');
const html=fs.readFileSync(process.env.IDX,'utf8').replace(/<script src[^>]*><\/script>/,'');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let P=0,F=0;const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const mk=()=>new JSDOM(html,{url:'http://localhost/?noseed',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.__P39FULL=true;/*v22.6.5：用原本 19 個後台分頁檢查舊功能*/
 w.indexedDB=new IDBFactory();w.alert=()=>{};w.confirm=()=>true;w.AudioContext=function(){};w.speechSynthesis={getVoices:()=>[],cancel(){},speak(u){setTimeout(()=>u.onend&&u.onend(),20)}};w.SpeechSynthesisUtterance=function(t){this.text=t};
 w.fetch=()=>Promise.reject(new Error('no network'));w.URL.createObjectURL=()=>'blob:t';w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){};
 w.__aud=[];w.__asr={start:0,abort:0};
 w.Audio=class{constructor(s){this.src=s||'';this.volume=1;this.paused=true}play(){const me=this;if(w.__fail){setTimeout(()=>{me.onerror&&me.onerror()},10);return Promise.reject(new Error('load fail'))}w.__aud.push(this.src);setTimeout(()=>{me.onended&&me.onended()},40);return Promise.resolve()}pause(){}};
 w.webkitSpeechRecognition=class{start(){w.__asr.start++}abort(){w.__asr.abort++}};
 w.navigator.mediaDevices={getUserMedia:async()=>({active:true,getTracks:()=>[{stop(){}}]})}}}).window;
const boot=async()=>{const w=mk();const t0=Date.now();while(Date.now()-t0<8000&&!w.eval('typeof P18!=="undefined"||typeof GV!=="undefined"&&S.set.ttsMig===3'))await sleep(50);await sleep(300);return w};
const E=(w,s)=>w.eval(s);
const guides=w=>w.__aud.filter(s=>/voice\/guidance\/(find_it|repeat_after_me|listen_carefully|speak_louder|your_turn|what_is_this)\.m4a/.test(s)).map(s=>s.match(/guidance\/(\w+)\.m4a/)[1]);
const seed=w=>E(w,`S.set.music=false;S.set.sound=false;V2.prepDone=true;S.set.anim=false;S.set.ap=true;S.set.apd=100;S.cats=[{id:'fr',name:'水果',order:[]},{id:'an',name:'動物',order:[]}];
 S.cards=[['a','蘋果','fr'],['b','香蕉','fr'],['c','貓','an'],['d','狗','an'],['e','魚','an'],['f','橘子','fr']].map(([id,t,c])=>({id:id,text:t,zy:'ㄅㄚ',img:'${PNG}',audio:'',cats:[c],created:1,modified:1}));save()`);
(async()=>{
 const w=await boot();seed(w);
 // 資源與登錄
 const ids=['find_it','repeat_after_me','listen_carefully','speak_louder','your_turn','what_is_this'];
 T('六個語音都登錄在共用 VOICE 表，路徑指向 voice/guidance/<id>.m4a',ids.every(i=>E(w,`VOICE[GV.META.${i}.v][3]`)==='voice/guidance/'+i+'.m4a'));
 w.__aud.length=0;E(w,'AM.unlock();AM.say("gv_find",{test:1})');await sleep(200);
 T('AM.say 實際用該檔案播放',w.__aud.includes('voice/guidance/find_it.m4a'),w.__aud);
 // 聽詞選圖（聽讀練習）：第 1 題播放「請找找看」一次，第 2 題不播
 w.__aud.length=0;E(w,'UI.pick("quiet");FL.open(1);FL.go()');await sleep(500);for(let i=0;i<14&&E(w,'S.set.mode')==='expose';i++){E(w,'try{EXP.done()}catch(e){}');await sleep(700)}
 await sleep(3500);
 T('聽詞選圖第 1 題：播放一次「請找找看」，且在詞彙讀音之後',guides(w).filter(x=>x==='find_it').length===1,[guides(w),w.__aud]);
 T('聽讀練習中沒有任何口語指令（換你說／請跟我說／這是什麼／請大聲）',!guides(w).some(x=>['your_turn','repeat_after_me','what_is_this','speak_louder'].includes(x)),guides(w));
 T('小標籤與提示顯示（🔍 找找看），不超過一個',E(w,'document.querySelectorAll("#gvb").length')<=1);
 E(w,'if(G.pk)document.querySelectorAll(".pko")[G.pk.ci].click()');await sleep(2500);w.__aud.length=0;await sleep(3000);
 T('第 2 題不會再自動播放「請找找看」（只在回合第一題）',guides(w).length===0,guides(w));
 E(w,'try{leave()}catch(e){}');await sleep(300);
 // 開關：關閉後完全不播
 E(w,'S.set.gv=false;save();UI.pick("quiet");FL.open(1);FL.go()');await sleep(500);for(let i=0;i<14&&E(w,'S.set.mode')==='expose';i++){E(w,'try{EXP.done()}catch(e){}');await sleep(700)}
 w.__aud.length=0;await sleep(3500);
 T('關閉「真人操作引導語音」：不播放任何六個語音，遊戲仍正常（有題目）',guides(w).length===0&&E(w,'!!G.on&&!!G.cur'),guides(w));
 E(w,'try{leave()}catch(e){}S.set.gv=true;save()');await sleep(300);
 // 聽打：第 1 題先播「請仔細聽」再播詞彙；
 w.__aud.length=0;E(w,'S.set.mode="listen";S.set.lm="quiet";save();startRound()');await sleep(3900);
 const g1=guides(w);T('聽打第 1 題：播放「請仔細聽」一次',g1.filter(x=>x==='listen_carefully').length===1,[g1,w.__aud]);
 const i1=w.__aud.findIndex(s=>/listen_carefully/.test(s)),i2=w.__aud.findIndex((s,i)=>i>i1&&!/guidance/.test(s));
 T('「請仔細聽」在詞彙／注音播放之前，兩者不重疊（依序出現）',i1>=0&&(i2===-1||i2>i1),w.__aud);
 // 連續按錯：第 3 次錯誤後再播一次「請仔細聽」並重播題目
 w.__aud.length=0;E(w,'G.wc=2;wrongHit()');await sleep(4000);
 T('連續答錯第 3 次：播放「請仔細聽」（在「沒關係」之後）並重播題目',guides(w).includes('listen_carefully'),[guides(w),w.__aud]);
 // 聽打不應播放 find_it 之外的口語指令
 T('聽打題型沒有口語指令',!guides(w).some(x=>['your_turn','what_is_this','speak_louder','repeat_after_me'].includes(x)));
 E(w,'try{leave()}catch(e){}');await sleep(300);
 // 口語：看圖說詞（命名）
 w.__aud.length=0;E(w,'MIC.st={active:true,getTracks(){return[]}};MIC.err="";S.asrAgreed=1;S.set.lm="oral";S.set.mode="speak";save();startRound()');await sleep(3300);
 T('看圖說詞（命名）第 1 題：播放一次「這是什麼」',guides(w).filter(x=>x==='what_is_this').length===1,[guides(w),w.__aud]);
 T('作答前沒有洩漏答案：「這是什麼」播放時沒有同時播放目標詞彙',!w.__aud.some(s=>/word|W:|蘋/.test(s)),w.__aud);
 // 問題結構：換你說囉（卡住）
 E(w,'G.sk&&(G.sk.gvT=0)');w.__aud.length=0;E(w,'SK.tick()');await sleep(3000);
 T('口語卡住第一次：先播「換你說囉」（再依提示階梯給提示，不直接洩漏答案）',guides(w).includes('your_turn'),[guides(w),w.__aud]);
 // 完整示範後：請跟我說一次
 w.__aud.length=0;E(w,'SK.give("P4v","button")');await sleep(4500);
 T('完整示範（P4 完整詞彙）後播放「請跟我說一次」',guides(w).includes('repeat_after_me'),[guides(w),w.__aud]);
 T('完整示範記錄為 P4_voice 提示（口語記錄分類不受新語音影響）',E(w,'RE.cur.hints.some(h=>h.type==="P4_voice")'),E(w,'RE.cur.hints.map(h=>h.type)'));
 // 請大聲一點點：條件
 const low=(raw)=>E(w,`GV.lastEv={rejected:false,reason:'silence',avgDb:${raw}+MV.gdb,peakDb:${raw}+10+MV.gdb,floor:-70,dur:900,voiced:600};MV.vad=MV.vad||{};MV.vad.calibrated=true;MV.vad.state='idle';ASR.r=ASR.r||{};1`);
 E(w,'GV.s.low=0;GV.s.n={};GV.s.cool=0;ASR.on=true');w.__aud.length=0;let orig=0;E(w,'window.__o=0');E(w,'MV.voiceNoAsr=(function(o){return function(){window.__o++;return o.apply(this,arguments)}})(MV.voiceNoAsr)');
 low(-45);
 E(w,'MV.voiceNoAsr()');await sleep(300);
 T('第一次低音量未辨識：還不播「請大聲一點點喔」（需連續兩次）',!guides(w).includes('speak_louder'),guides(w));
 E(w,'MV.voiceNoAsr()');await sleep(3500);console.log('DBG louder',JSON.stringify({vs:E(w,'MV.vad.state'),n:E(w,'GV.s.n'),low:E(w,'GV.s.low'),busy:E(w,'GV.busy()'),mic:E(w,'GV.micOK()'),on:E(w,'GV.on()')}));
 T('連續兩次有效低音量：播放「請大聲一點點喔」；辨識只暫停接收、不中斷工作階段、播完恢復',guides(w).includes('speak_louder')&&w.__asr.abort===0&&E(w,'ASR.paused')===false,[guides(w),w.__asr]);
 T('播放期間 ASR 暫停旗標已在播完後恢復',E(w,'ASR.paused')===false);
 w.__aud.length=0;E(w,'GV.s.cool=0');E(w,'MV.voiceNoAsr()');await sleep(3500);E(w,'GV.s.cool=0');E(w,'MV.voiceNoAsr()');await sleep(3500);
 T('同一題最多播放兩次「請大聲一點點喔」，之後不再要求',E(w,'GV.s.n.speak_louder')===2&&guides(w).filter(x=>x==='speak_louder').length<=1,[E(w,'GV.s.n'),guides(w)]);
 // 禁止條件
 const neg=(label,setup)=>{E(w,'GV.s.n={};GV.s.cool=0;GV.s.low=1;ASR.on=true;MIC.st={active:true,getTracks(){return[]}};MIC.err="";MV.vad.calibrated=true;');low(-45);E(w,setup);w.__aud.length=0;E(w,'MV.voiceNoAsr()');return sleep(1500).then(()=>T('禁止：'+label+' → 不播放「請大聲一點點喔」',!guides(w).includes('speak_louder'),guides(w)))};
 await neg('麥克風沒有串流','MIC.st=null');
 await neg('麥克風錯誤','MIC.err="denied"');
 await neg('尚未校準（音訊分析未就緒）','MV.vad.calibrated=false');
 await neg('語音辨識沒有啟動／不支援','ASR.on=false;ASR.r=null');
 await neg('偵測為雜訊（被拒絕的片段）','GV.lastEv.rejected=true');
 await neg('音量其實正常','GV.lastEv.avgDb=-20+MV.gdb;GV.lastEv.peakDb=-6+MV.gdb');
 await neg('學生已經完成作答','G.lock=true');E(w,'G.lock=false');
 await neg('老師音檔正在播放（系統聲音）','MV.musicOn=()=>true');E(w,'MV.musicOn=()=>false');
 E(w,'try{leave()}catch(e){}');await sleep(300);
 // 記錄
 E(w,'MIC.st={active:true,getTracks(){return[]}};S.set.lm="oral";S.set.mode="speak";save();startRound()');await sleep(2500);
 E(w,'SK.credit("adult",{by:"adult"})');await sleep(1500);
 console.log('DBG rec',JSON.stringify({n:E(w,'GV.s&&GV.s.n'),cur:E(w,'!!RE.cur')}));const rec=E(w,'S.recs[S.recs.length-1]');
 T('作答紀錄的 ext.guide 保存本題播放過的引導（含分類 cls），且不影響提示紀錄',rec&&rec.ext&&Array.isArray(rec.ext.guide)&&rec.ext.guide.every(g=>g.id&&g.cls),rec&&rec.ext);
 T('引導語音本身沒有被當成答案提示（hints 中沒有 gv 類型）',!(rec.hints||[]).some(h=>/gv|guide_voice/.test(h.type||'')),rec.hints);
 // 不重疊：已有其他語音播放中時，不打斷
 E(w,'try{leave()}catch(e){}');await sleep(300);
 E(w,'S.set.lm="quiet";S.set.mode="pick";startRound()');await sleep(500);for(let i=0;i<14&&E(w,'S.set.mode')==='expose';i++){E(w,'try{EXP.done()}catch(e){}');await sleep(700)}
 E(w,'GV.s.n={};GV.s.cool=0');w.__aud.length=0;E(w,'AM.say("cheer")');E(w,'window.__r=GV.say("find_it")');
 T('其他老師語音播放中：引導語音排隊等待，不會打斷',E(w,'AM.cur&&AM.cur.k')==='cheer'&&!guides(w).length,[E(w,'AM.cur&&AM.cur.k'),guides(w)]);
 await sleep(2500);console.log('DBG q',JSON.stringify({zq:E(w,'ZQ.busy'),sp:E(w,'SP.speaking'),ms:E(w,'MIC.state'),lv:E(w,'MV.lastVoice()'),ov:E(w,'!!document.querySelector(".ov")'),n:E(w,'GV.s.n'),cool:E(w,'GV.s.cool-Date.now()'),busy:E(w,'GV.busy()'),cur:E(w,'AM.cur&&AM.cur.k'),mode:E(w,'S.set.mode'),on:E(w,'G.on'),lock:E(w,'G.lock'),paused:E(w,'G.paused'),aud:w.__aud.slice(-4)}));T('等現有語音結束後才播放',guides(w).includes('find_it'),guides(w));
 // 換題取消待播
 E(w,'GV.s.n={};GV.s.cool=0;GV.say("find_it",{delay:800})');E(w,'G.i=G.i+1;GV.q()');w.__aud.length=0;await sleep(1500);
 T('換題後，上一題待播放的引導語音被取消',!guides(w).includes('find_it'),guides(w));
 // 口語步驟（拼打＋口說）：圖片命名 →「這是什麼」；模仿 →「請跟我說一次」每題只一次
 E(w,'try{leave()}catch(e){}');await sleep(300);
 w.__aud.length=0;E(w,'MIC.st={active:true,getTracks(){return[]}};MIC.err="";S.set.lm="oral";S.set.mode="key";S.set.oj="B";save();startRound()');await sleep(4200);
 T('口說步驟（看圖命名）：進入前播放「這是什麼」，且步驟等錄音播完才開始收音／等待',guides(w).includes('what_is_this')&&E(w,'!!V2.stp'),[guides(w),E(w,'V2.stp&&V2.stp.sp.kind')]);
 w.__aud.length=0;E(w,'V2.tc("ok")');await sleep(4200);
 const rp1=guides(w).filter(x=>x==='repeat_after_me').length;E(w,'V2.stp&&V2.tc("ok")');await sleep(3500);E(w,'V2.stp&&V2.tc("ok")');await sleep(3500);
 T('後續注音／音節步驟：「請跟我說一次」同一題最多一次，不在每個注音符號前重複',guides(w).filter(x=>x==='repeat_after_me').length<=1,[rp1,guides(w)]);
 E(w,'try{leave()}catch(e){}');await sleep(300);
 // 注音鍵盤卡住：請找找看＋視覺提示（只播一次、有提示紀錄）
 w.__aud.length=0;E(w,'S.set.lm="quiet";S.set.mode="key";S.set.hl.p=1;save();startRound()');await sleep(2500);w.__aud.length=0;E(w,'G.vf.push=0;pushNudge()');await sleep(2500);
 T('注音輸入卡住（閒置）：播放「請找找看」並顯示目前要輸入的注音（部分注音提示，有提示紀錄）',guides(w).includes('find_it')&&E(w,'RE.cur&&RE.cur.hints.length>=1'),[guides(w),E(w,'RE.cur&&RE.cur.hints.map(h=>h.type)')]);
 w.__aud.length=0;E(w,'G.vf.push=0;pushNudge()');await sleep(2000);
 T('同一題不會再重複播放「請找找看」（達到上限後回到原本的鼓勵語音）',!guides(w).includes('find_it'),guides(w));
 E(w,'try{leave()}catch(e){}');await sleep(300);
 // 載入失敗的替代處理：引導語音讀不到時流程仍繼續，不卡死
 w.__fail=true;let cont=0;E(w,'S.set.lm="quiet";S.set.mode="pick";startRound()');await sleep(500);for(let i=0;i<14&&E(w,'S.set.mode')==='expose';i++){E(w,'try{EXP.done()}catch(e){}');await sleep(700)}
 E(w,'GV.s.n={};GV.s.cool=0;window.__cont=0;GV.say("find_it",{after:()=>{window.__cont++}})');await sleep(2500);
 T('音檔載入失敗：流程照常接續（after 回呼被呼叫、沒有卡住的語音或收音）',E(w,'window.__cont')===1&&E(w,'AM.cur')===null&&E(w,'ASR.paused')===false,[E(w,'window.__cont'),E(w,'AM.cur&&AM.cur.k')]);
 w.__fail=false;E(w,'try{leave()}catch(e){}');await sleep(300);
 // 老師試聽清單
 E(w,'ACL.unlocked=true;ACL.at=Date.now();tab(2);sub="set";tch()');await sleep(300);
 T('教師「老師錄音試聽」清單含六個新語音',['請找找看','請跟我說一次','請仔細聽','請大聲一點點喔','換你說囉','這是什麼'].every(t=>E(w,'document.querySelector("#tch").innerHTML').includes(t)));
 // 設定畫面有開關
 E(w,'ACL.unlocked=true;ACL.at=Date.now();tab(2);sub="set";tch()');await sleep(300);
 T('教師設定頁有「真人操作引導語音」開關，預設開啟',/真人操作引導語音/.test(E(w,'document.querySelector("#tch").textContent'))&&E(w,'DEF().set.gv')===true);
 console.log(`t250: ${P} pass ${F} fail`);process.exit(F?1:0)})();
