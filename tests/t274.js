// v20.0：大量教材與紀錄的效能（jsdom；時間為本機模擬環境量測，不代表平板實機）與錄音靜音檢查
const fs=require('fs'),cp=require('child_process');const {mk,T,sleep}=require('./t30h.js');
(async()=>{
 const w=mk({fresh:true,vocab:true});const E=c=>w.eval(c);
 const t0=Date.now();while(Date.now()-t0<12000&&!E('typeof LA!=="undefined"&&!!LIB.base&&S.cards.filter(c=>c.lib).length>=900'))await sleep(50);await sleep(400);
 const NOW=Date.now(),D=864e5,recs=[];let q=0;
 for(let i=0;i<5000;i++){const id='VOC'+String(1+(i*7)%1000).padStart(4,'0');recs.push({id:'P'+(++q),learnerId:'x',itemId:id,itemKind:'word',game:['pick','key','speak','listen'][i%4],outcome:i%5===0?'wrong':'correct',independent:i%3!==0,hints:i%7===0?[{type:'zy_stage'}]:[],first:{result:'correct'},ts:NOW-(i%40)*D-i,stage:1+(i%6),ext:{fl:{st:1+(i%6)}},rtFirstInput:1000+(i%30)*100,asr:i%4===2?[{text:'x',matched:i%8===2}]:[]})}
 w.__r=recs;E('S.recs=window.__r');
 let t=Date.now();E('LA.ui.view="lv";LA.ui.open=null;LA.view()');const a=Date.now()-t;
 t=Date.now();E('LA.view()');const b=Date.now()-t;
 t=Date.now();E('LA.ui.open="LV05";LA.view()');const c=Date.now()-t;
 t=Date.now();E('LA.ui.view="rv";LA.view()');const d=Date.now()-t;
 const evN=E('LA.idx().ev.length'),valid=E('LA.metrics(LA.words().map(w=>w.id)).valid');T('測試資料確實被計入（事件數與有效作答數）',evN>=4000&&valid>=3500,{evN,valid});
 console.log('timing(ms): first',a,'again',b,'expanded',c,'review',d);
 T('5000 筆紀錄＋1000 詞：Level 總覽首次計算 < 5 秒、再次 < 3 秒',a<5000&&b<3000,{a,b});
 T('展開單一 Level、智慧複習 < 5 秒',c<5000&&d<5000,{c,d});
 T('大量紀錄下所有百分比正常（無 NaN）',!/NaN|Infinity/.test(E('LA.view()')));
 // 詞彙庫篩選
 t=Date.now();E('LIB.set("lv","LV05");LIB.list().length');T('詞彙庫 Level 篩選 < 500 ms',Date.now()-t<500);
 // 真人錄音前方靜音
 let ff=true;try{cp.execSync('which ffmpeg',{stdio:'ignore'})}catch(e){ff=false}
 if(!ff){console.log('SKIP 錄音前方靜音檢查（沒有 ffmpeg）');}
 else{const files=cp.execSync('find /home/claude/repo/voice -name "*.m4a"').toString().trim().split('\n');const bad=[];
  files.forEach(f=>{const o=cp.spawnSync('ffmpeg',['-hide_banner','-i',f,'-af','silencedetect=noise=-45dB:d=0.05','-f','null','-'],{encoding:'utf8'}).stderr;const s=o.match(/silence_start: (-?[\d.]+)/),e=o.match(/silence_end: ([\d.]+)/);const lead=s&&parseFloat(s[1])<=0.02&&e?parseFloat(e[1]):0;if(lead>0.3)bad.push(f.split('/voice/')[1]+':'+lead)});
  T('全部 '+files.length+' 個真人錄音（含 37 個注音）前方靜音 ≤ 0.3 秒（−45 dB 門檻）',bad.length===0&&files.length>=50,bad)}
 process.exit(0);
})();
