// 新版第07階段：教師專區補齊（jsdom）
const {mk,R,T,sleep}=require('./t30h.js');
const IMG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const SEED=`S.cats=[{id:'k1',name:'日常',order:[]}];S.cards=[1,2,3,4,5,6].map(i=>({id:'c'+i,text:'詞'+i+'詞',zy:'ㄅㄚ ㄆㄚ',img:'${IMG}',audio:'',cats:['k1']}));save();`;
const HELP=`window.__n=0;window.__t=d=>Date.now()-d*864e5-36e5;
window.__add=(wid,game,o)=>{o=o||{};const out=o.out||'correct',ts=o.ts!=null?o.ts:__t(o.d||0);__n++;
 const r={sv:1,id:'T'+__n,learnerId:LRN.id(),itemId:wid,itemKind:'word',itemText:(byId(wid)||{}).text,game,outcome:out,independent:out==='correct'&&o.ind!==false&&!(o.hints&&o.hints.length),hints:o.hints||[],ts,iso:new Date(ts).toISOString(),stage:o.stage||2,taskId:o.task||('S2.'+game),purpose:o.purpose||'assess',first:{result:out},tech:[]};
 if(game==='speak')r.sp={cls:out==='correct'?'ok_indep':'wrong'};S.recs.push(r);VP._k=null;return r};`;
const boot=async()=>{const w=mk({fresh:true});const t0=Date.now();while(Date.now()-t0<8000&&!w.eval('typeof P16!=="undefined"&&typeof UI!=="undefined"&&S.set.ttsMig===3'))await sleep(50);const E=c=>w.eval(c);w.alert=m=>{w.__al=m};w.confirm=()=>true;E(SEED);E(HELP);return{w,E}};
(async()=>{
 {const {E}=await boot();
  E('sub="dash";tab(2)');
  const views=['ovw','dash','heat','hint','obs','vp','trend','err','hist','goal','rpt'];
  const out=views.map(v=>{try{E(`DSH.ui.view='${v}';tch()`);return E('document.querySelector("#sp").innerHTML')}catch(e){return 'ERR '+e.message}});
  T('① every teacher analysis view renders with no records and no errors (incl. new 總覽)',out.every(h=>h.length>150&&!/^ERR|undefined|NaN|\[object/.test(h)));
  T('① 總覽 tab exists and no-data fields show "—" not zero',/學習總覽/.test(out[0])&&/不計算能力分數/.test(out[0])&&!/>0<\/td><td>0<\/td>/.test(out[0]));
  E(`DSH.ui.view='dash';tch()`);const h=E('document.querySelector("#sp").innerHTML');
  T('② dashboard shows 語文延伸 separately, with 注音辨識／注音拼組／聲調／詞彙拼打聽打／短語／句子 rows',/語文延伸能力（獨立分析/.test(h)&&['注音辨識','注音拼組','聲調辨識及輸入','詞彙拼打','詞彙聽打','短語／句子拼打','短語／句子聽打'].every(x=>h.includes(x)));
  T('② 語文延伸 is explicitly NOT counted as oral ability',/不計入七大核心，也不計入自主口語/.test(h));
  T('② no-data → 尚未評量, never 0%; no total score across the seven abilities',(h.match(/尚未評量/g)||[]).length>=7&&!/總分|加總後|綜合分數/.test(h.replace(/不加總|不會加總|不加總成單一分數/g,'')));
  T('③ calc table lists formula / numerator / denominator / valid n / date range / task type & difficulty / hint condition / source / pending for every ability',/指標計算說明/.test(h)&&['計算方式','分子','分母','有效資料筆數','評量日期範圍','題型及難度','提示條件','資料來源','待確認'].every(x=>h.includes(x)));
  T('③ calc text states denominator rule: wrong & no-response count; tech/skip/unconfirmed separate; teaching vs assessment separate',/真正答錯、有效機會中沒有出現反應都算在分母/.test(h)&&/技術異常、跳過、尚未確認的辨識結果<b>不算錯誤/.test(h)&&/教學題與評量題分開/.test(h));
  T('③ communication initiative: only counts, no percentage when opportunities unknown',/只呈現「紀錄次數」/.test(h)&&/不計算百分比/.test(h));
 }
 {const {E}=await boot();
  E(`for(let i=0;i<6;i++)__add('c1','speak',{d:i%3});for(let i=0;i<5;i++)__add('c2','pick',{d:1,task:'S1.pick.word',stage:1});__add('c3','speak',{out:'unconfirmed',d:1});
   S.ob=[{id:'o1',learnerId:LRN.id(),ts:Date.now()-864e5,text:'我要喝水',initiated:'y',prompted:'none',mode:'oral',observer:'家長',src:'real_life'}];save()`);
  E('LRN.add("乙");');const B=E('S.lrn.list.find(p=>p.name==="乙").id'),A=E('S.lrn.list.find(p=>p.name!=="乙").id');
  E(`LRN.switchTo("${A}")`);
  E(`DSH.ui.view='ovw';sub='dash';tab(2);tch()`);const o=E('document.querySelector("#sp").innerHTML');
  T('④ overview lists every active learner (A with records, B without)',o.includes('乙')&&(o.match(/DSH\.sw\('L/g)||[]).length===2);
  const ra=JSON.parse(E(`JSON.stringify(P16.row(LRN.get("${A}")))`)),rb=JSON.parse(E(`JSON.stringify(P16.row(LRN.get("${B}")))`));
  T('④ overview numbers come from each learner\'s own records (A: 12 answers incl. unconfirmed; B: none)',ra.n===12&&ra.pend===1&&ra.ob===1&&rb.n===0&&rb.last===null&&rb.ob===0);
  E(`LRN.switchTo("${B}")`);const rA=JSON.parse(E(`JSON.stringify(P16.row(LRN.get("${A}")))`));
  T('④ after switching, learner A\'s row is still read correctly from the stored slice',rA.n===12&&rA.pend===1);
  E(`LRN.switchTo("${A}")`);
  E(`DSH.ui.view='heat';DSH.ui.filt={};tch()`);const hm=E('document.querySelector("#sp").innerHTML');
  T('⑤ heat map has 詞彙熟悉度 and 下一次複習 columns plus 最近練習',/詞彙熟悉度/.test(hm)&&/下一次複習/.test(hm)&&/最近練習/.test(hm)&&/理解：/.test(hm));
  const sh=JSON.parse(E('JSON.stringify(RPT.sheets())'));
  T('⑥ Excel/CSV still 9 sheets; 摘要 has 識別資料／熟悉度／近期進步／建議教學方式；七大能力 sheet has 語文延伸；熱力表 has 熟悉度與複習日期',sh.length===9&&(r=>/基本識別資料/.test(r)&&/詞彙熟悉度/.test(r)&&/近期學習進步/.test(r)&&/建議教學方式/.test(r))(JSON.stringify(sh[0].rows))&&/語文延伸能力/.test(JSON.stringify(sh[1].rows))&&/下一次複習日期/.test(JSON.stringify(sh[2].rows)));
  const rp=E('RPT.html()');
  T('⑥ print report has: 識別資料、七大能力、語文延伸、熟悉度、提示依賴、近期進步、待加強、建議教學方式、生活觀察、不得宣稱診斷',['基本識別資料','七大核心語言能力','語文延伸能力','詞彙熟悉度','提示依賴','近期學習進步','待加強能力','建議教學方式','生活觀察紀錄'].every(x=>rp.includes(x))&&/不具臨床診/.test(rp));
  T('⑥ report life observations list the real observation (no invented rows)',/我要喝水/.test(rp));
  T('⑥ report/csv for learner A contain no data of learner B',!JSON.stringify(sh).includes('乙')&&!rp.includes('乙'));
 }
 // ⑦ 錯誤分類拆分
 {const {E}=await boot();
  E(`__add('c1','cbo',{out:'wrong',task:'S4.cbo',stage:4});__add('c1','sxo',{out:'wrong',task:'S5.sxo',stage:5});__add('c2','cbm',{out:'wrong',task:'S3.cbm',stage:3});__add('c2','speak',{out:'correct',hints:[{type:'P4_voice'}],ind:false});`);
  const er=JSON.parse(E(`JSON.stringify(ERR.run(DSH.inp(),0,Date.now()+1e9,false).tab)`));
  T('⑦ error analysis separates 詞彙組合困難 (phrase) from 語句排列困難 (sentence)',er.combo.sys===2&&er.sent.sys===1);
  T('⑦ 完整示範後才說出 is shown as an observed pattern ("可能依賴示範"), not a diagnosis',er.imit.sys===1&&/可能依賴示範/.test(E('ERR.CATS.imit')));
  T('⑦ every category in the spec exists: 語意混淆／提取困難／可能的發音問題／依賴示範／組合／排列／未反應／操作／辨識異常／待確認',['sem','retr','artic','imit','combo','sent','noresp','oper','asr','pending'].every(k=>E(`!!ERR.CATS.${k}`)));
  T('⑦ unclear causes stay 疑似／待教師確認 (no automatic clinical judgement)',E('ERR.CERTAIN.includes("sem")')===false&&E('ERR.CERTAIN.includes("retr")')===false&&E('ERR.CERTAIN.includes("artic")')===false);
 }
 console.log('PASS',R.P,'FAIL',R.F);process.exit(R.F?1:0)})();
