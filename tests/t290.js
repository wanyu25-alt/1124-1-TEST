// v22.1：語音備援（TTSX／ZQ.one／VF）與文字備援（顯示文字、紀錄、不扣星）
const {mk,T,sleep}=require('./t30h.js');
(async()=>{
 const A=mk({vocab:true});const E=c=>A.eval(c);
 await sleep(1500);
 T('A TTSX／VF／VDX 模組存在',E('typeof TTSX.say==="function"&&typeof VF.fail==="function"&&typeof VDX.run==="function"'));
 // 成功
 E('window.__r=null;TTSX.say("蘋果",{onend:()=>window.__r="ok",onfail:e=>window.__r="f:"+e})');await sleep(300);
 T('B 合成語音成功→onend',E('window.__r')==='ok');
 // utterance error
 const sp=A.speechSynthesis;const old=sp.speak;
 sp.speak=function(u){setTimeout(()=>u.onerror&&u.onerror({error:'synthesis-failed'}),20)};
 E('window.__r=null;TTSX.say("蘋果",{onend:()=>window.__r="ok",onfail:e=>window.__r="f:"+e})');await sleep(200);
 T('C 合成錯誤→onfail（不會卡住）',/^f:tts-/.test(E('window.__r')),E('window.__r'));
 // 完全不開始 → watchdog
 sp.speak=function(){};
 E('window.__r=null;TTSX.say("蘋果",{startMs:80,onend:()=>window.__r="ok",onfail:e=>window.__r="f:"+e})');await sleep(700);
 T('D 一直沒有開始→重試一次後回報失敗（不無限等待）',/^f:(blocked|no-start)$/.test(E('window.__r')),E('window.__r'));
 sp.speak=old;
 // 不支援
 const SU=A.SpeechSynthesisUtterance;A.SpeechSynthesisUtterance=undefined;
 E('window.__r=null;TTSX.say("蘋果",{onend:()=>window.__r="ok",onfail:e=>window.__r="f:"+e})');await sleep(100);
 T('E 瀏覽器不支援合成語音→onfail unsupported',E('window.__r')==='f:unsupported');A.SpeechSynthesisUtterance=SU;
 // 收尾：取消不應觸發 onfail
 sp.speak=function(){};
 E('window.__r=null;window.__c=TTSX.say("蘋果",{startMs:5000,onend:()=>window.__r="ok",onfail:e=>window.__r="f:"+e});window.__c()');await sleep(100);
 T('F 取消後不會觸發成功或失敗回呼',E('window.__r')===null);sp.speak=old;
 // 聽詞選圖：顯示文字
 E('S.set.mode="pick";S.set.pks="word";S.set.src="all";S.set.n=3;S.set.mix=false;save();startRound()');await sleep(500);
 T('G 聽詞選圖有「顯示文字」按鈕、文字預設隱藏',E('!!document.getElementById("pkt")&&document.getElementById("pkw").classList.contains("hide")'));
 E('PICK.txt()');
 T('H 按下後顯示目標詞',!E('document.getElementById("pkw").classList.contains("hide")')&&E('document.getElementById("pkw").textContent')===E('G.cur.text'));
 E('PICK.txt()');
 T('I 再按一次隱藏，但「曾用文字輔助」仍保留',E('G.pk.txt')===0&&E('G.pk.aidM')===1);
 E('PICK.choose(G.pk.ci)');await sleep(600);
 const rec=JSON.parse(E('JSON.stringify(S.recs[S.recs.length-1])'));
 T('J 紀錄 ext.tx.m=1（手動文字輔助）',rec&&rec.ext&&rec.ext.tx&&rec.ext.tx.m===1,rec&&rec.ext);
 // 語音失敗→自動文字、不算答錯
 E('startRound()');await sleep(500);
 E('VF.fail("tts-synthesis-failed",G.cur)');
 T('K 語音失敗→自動顯示文字與提示訊息',!E('document.getElementById("pkw").classList.contains("hide")')&&/語音暫時無法播放/.test(E('document.getElementById("msg").textContent')));
 const st=E('S.stars||0');const wi=E('G.pk.opts.findIndex(o=>!o.correct)');
 E(`PICK.choose(${wi})`);await sleep(200);
 T('L 語音異常下的錯選不增加答錯／不扣星',E('S.stars||0')===st&&E('G.pk.techWrong')===1);
 E('PICK.choose(G.pk.ci)');await sleep(600);
 const r2=JSON.parse(E('JSON.stringify(S.recs[S.recs.length-1])'));
 T('M 紀錄 ext.tx.v=1 標示系統語音異常',r2.ext&&r2.ext.tx&&r2.ext.tx.v===1&&r2.ext.tx.a==='tts-synthesis-failed',r2.ext);
 T('N 語音異常紀錄不產生能力證據（不影響熟悉度）',E(`VP.evOf(${JSON.stringify(r2)}).length`)===0);
 // ZQ.one：無錄音檔→合成語音
 E('window.__d=0;ZQ.id=77;ZQ.one({tts:"香蕉"},77,()=>window.__d=1)');await sleep(300);
 T('O 沒有錄音檔→改用合成語音完成',E('window.__d')===1&&A.__ttsLog.some(x=>x.t==='香蕉'));
 // 診斷
 await E('VDX.run()');await sleep(100);
 T('P 語音診斷產生結果並列出項目',E('VDX.res&&VDX.res.items.length>=6'));
 process.exit(require('./t30h.js').R.F?1:0);
})();
