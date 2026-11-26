// 整合驗收：A–H 功能「存在且接得到資料」的探測（不代表真機通過）。全新空白狀態啟動。
const {JSDOM}=require('jsdom');const fs=require('fs');const {IDBFactory}=require('fake-indexeddb');
const html=fs.readFileSync(process.env.IDX,'utf8').replace(/<script src[^>]*><\/script>/,'');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let P=0,F=0;const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
const w=new JSDOM(html,{url:'http://localhost/?noseed',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.indexedDB=new IDBFactory();w.alert=()=>{};w.confirm=()=>true;w.AudioContext=function(){};w.speechSynthesis={getVoices:()=>[],cancel(){},speak(u){setTimeout(()=>u.onend&&u.onend(),20)}};w.SpeechSynthesisUtterance=function(t){this.text=t};w.fetch=()=>Promise.reject(new Error('x'));w.URL.createObjectURL=()=>'blob:t';w.URL.revokeObjectURL=()=>{};w.Audio=class{play(){return Promise.resolve()}pause(){}};w.navigator.mediaDevices={getUserMedia:async()=>({active:true,getTracks:()=>[{stop(){}}]})}}}).window;
const E=s=>w.eval(s);
(async()=>{const t0=Date.now();while(Date.now()-t0<8000&&!E('typeof P17!=="undefined"&&S.set.ttsMig===3'))await sleep(50);await sleep(300);
 const has=(n,expr)=>T(n,(()=>{try{return !!E(expr)}catch(e){return false}})(),expr);
 // A 原有核心
 T('A 預設：AI 語音 0.75×、真人錄音 1.25×',E('S.set.ttsRate')===0.75&&E('S.set.recRate')===1.25);
 T('A 注音提示預設：部分注音＋完整注音（累進）',E('S.set.hl.p')===1&&E('S.set.hl.f')===1);
 has('A 注音錄音佇列（ZQ）與 37 個符號對照','ZQ&&ZSY.length===37&&typeof ZQ.symUrl==="function"');
 has('A 看圖說詞（說話題引擎 SK／PH）','typeof SK==="object"&&typeof PH==="object"&&typeof showS==="function"');
 has('A 聽詞選圖（PICK）、聽詞認識（EXP）','typeof PICK.build==="function"&&typeof EXP.done==="function"');
 has('A 鍵盤輸入：實體鍵盤＋觸控鍵盤','typeof showK==="function"&&S.set.input==="phys"');
 has('A 星星與火車／交通工具','S.rw.stars===0&&typeof FL.award==="function"&&Array.isArray(S.rw.veh)');
 has('A 匯入／匯出／備份／還原','typeof ioExport==="function"&&typeof ioApply==="function"&&typeof pkgFromZip==="function"&&typeof BK==="object"');
 has('A 原紀錄匯出（RE.csv）','typeof RE.csv==="function"&&typeof RE.dl==="function"');
 // B 新學習架構
 T('B 六個學習站',E('STG.length')===6);
 T('B 三種學習模式（安靜／口語／整合）',E('Object.keys(UI.LM).sort().join()')==='integ,oral,quiet',E('Object.keys(UI.LM)'));
 T('B 題數選項、星級 1–5 難度',E('FL.N.length')>=3&&E('FL.STAR!==undefined'),E('FL.N'));
 has('B 六站自由地圖／推薦站','typeof FL.mapHtml==="function"');
 has('B 星級階梯與簡單星星獎勵','typeof FL.ladder==="function"&&typeof FL.starFor==="function"');
 has('B 組合／語句／情境教材（CB／SE／SC）','Array.isArray(S.cb)&&typeof CB==="object"&&typeof SE==="object"&&typeof SCN!=="undefined"||typeof SE==="object"');
 // C 語音辨識與個別化
 has('C 麥克風迴圈／VAD／ASR 啟停','typeof micLoop==="function"&&typeof MVAD!=="undefined"&&typeof asrStart==="function"&&typeof stopAsr==="function"');
 has('C 語音失敗不直接算錯（未確認／無反應結果）','OUTN.unconfirmed&&OUTN.no_response&&OUTN.tech_error');
 has('C 人工確認（RE.man）、提示等級紀錄（RE.hint）','typeof RE.man==="function"&&typeof RE.hint==="function"');
 has('C 個別化輔助設定（音量／等待／提示／動畫／按鍵大小）','S.set.vol!==undefined&&S.set.hint&&S.set.anim!==undefined&&typeof LRN.cur().wait!=="undefined"');
 // D 熟悉度與推薦
 has('D 詞彙熟悉度／精熟 mst','typeof S.mst==="object"&&typeof VP==="object"');
 has('D 推薦引擎與目標（RC／GL）','typeof RC==="object"&&typeof GL==="object"');
 has('D 間隔複習資料 rv','typeof S.rv==="object"');
 // E 家長 F 教師
 has('E 家長專區模組','typeof PAR==="object"');
 E('ACL.unlocked=true;ACL.at=Date.now();tab(2)');await sleep(300);const tabs=E('[...document.querySelectorAll("#tch .sub button")].map(b=>b.textContent)');T('F 教師後台 18 個分頁（詞彙管理、儀表板、家長專區設定、資料安全…）',tabs.length===18&&tabs.some(t=>/儀表板/.test(t))&&tabs.some(t=>/資料安全/.test(t))&&tabs.some(t=>/生活觀察/.test(t)),tabs);
 has('F 七大能力評量與儀表板／報表','typeof AS==="object"&&typeof DSH==="object"&&typeof RPT==="object"&&IND.length>=7');
 has('F 錯誤類型分類（ERR）','typeof ERR==="object"&&ERR.CATS');
 has('F 多個案（新增／切換／封存）','typeof LRN.add==="function"&&typeof LRN.switchTo==="function"');
 // G/H
 has('G 版面：旋轉／首頁／返回函式','typeof home==="function"&&typeof leave==="function"&&typeof goHome==="function"');
 has('H 教師入口保護（ACL）與稽核','typeof ACL==="object"&&typeof ACL.unlock==="function"&&typeof ACL.need==="function"');
 has('H 資料版本與移轉（DV／migrate）','DV===3&&typeof migrate==="function"');
 has('H 雲端預留（SYNC／CLD）：只有預留、不連網','typeof SYNC==="object"&&typeof CLD==="object"&&typeof SYNC.push==="function"');
 console.log(`t242: ${P} pass ${F} fail`);process.exit(F?1:0)})();
