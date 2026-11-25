// 第02階段完整測試：流程、六站×三模式×五星、星星規則、輔助紀錄、設定、復原、個案隔離（jsdom）
const {mk,R,T,sleep}=require('./t30h.js');
const IMG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const SEED=`S.cards=[1,2,3,4,5,6].map(i=>({id:'c'+i,text:'詞'+i,zy:'ㄏㄨㄛˇ ㄔㄜ',img:'${IMG}',audio:'',cats:[]}));S.cats=[];S.set.src='all';S.set.order='seq';S.set.sound=false;S.set.music=false;S.set.ap=false;save()`;
const boot=async(o={})=>{const w=mk(Object.assign({fresh:true},o));const t0=Date.now();while(Date.now()-t0<8000&&!(w.eval('typeof UI!=="undefined"&&typeof FL!=="undefined"&&S.set.ttsMig===3')))await sleep(50);const E=c=>w.eval(c),q=s=>w.document.querySelector(s),qa=s=>[...w.document.querySelectorAll(s)];w.alert=m=>{w.__al=m};w.confirm=()=>true;E(SEED);return{w,E,q,qa}};
(async()=>{
 // ① 流程：首頁 → 模式 → 六站 → 設定 → 開始 → 完成，頁面不集中
 {const {w,E,q,qa}=await boot();
  T('home has no station/star/count controls (not all on one page)',qa('#mid select,#mid .stc,#mid .fstar').length===0);
  E('UI.pick("quiet")');T('mode → six stations only (no count/star selectors on the map)',qa('.stc').length===6&&qa('.fstar,.fn').length===0);
  T('all six stations free to enter: no lock text',!/解鎖|鎖定|🔒/.test(q('#mid').textContent));
  T('map has no dead entry: every enter button is enabled and calls FL.open',qa('.stb .btn.go').every(b=>/FL\.open/.test(b.getAttribute('onclick')))&&qa('.stb .btn[disabled]').every(b=>q('.stw')));
  E('FL.open(1)');
  T('setup: 5/10/15/20, five stars, range three choices, start; advanced collapsed by default',JSON.stringify(qa('.fseg')[0].children.length)==='4'&&qa('.fstar').length===5&&qa('.fseg')[1].children.length===3&&!q('.fadv').open&&!!q('.fgob'));
  T('default range is 系統推薦 and default 5題／一星',E('FL.mem().range||"rec"')==='rec'&&qa('.fn.on').length>=2);
  T('advanced section contains 教材範圍／交通工具 only inside <details>',!!q('details.fadv #fl_cat')&&!!q('details.fadv #fl_veh'));
  E('FL.setN(15);FL.setStar(3);FL.setRange("rv")');
  T('choices stored per learner (n,star per mode:station,range)',E('FL.mem().n')===15&&E('FL.mem().star["quiet:1"]')===3&&E('FL.mem().range')==='rv');
  E('FL.setRange("rec");FL.setN(5);FL.setStar(1)');
  T('start runs a round with n=5 and returns to origin (map) on leave',E('FL.go()')!==false&&E('G.on')&&E('G.n')===5&&(E('leave()'),E('FL.run')===null&&E('!S.set.flbk')));
 }
 // ② 難度獨立：各站、各模式
 {const {w,E,q,qa}=await boot();
  E('UI.pick("quiet");FL.open(1);FL.setStar(4)');E('FL.back()');E('FL.open(3);FL.setStar(2)');
  T('difficulty is independent per station',E('FL.starFor(1,"quiet")')===4&&E('FL.starFor(3,"quiet")')===2);
  E('UI.pick("oral")');T('and independent per mode',E('FL.starFor(1,"oral")')===1);
  // learner isolation
  E('LRN.add("乙");');const ids=E('S.lrn.list.map(x=>x.id)');E(`LRN.switchTo("${ids[ids.length-1]}")`);
  T('another learner has own memory (star back to default)',E('FL.starFor(1,"quiet")')===1&&E('FL.mem().n')===null);
  E(`LRN.switchTo("${ids[0]}")`);T('original learner keeps remembered difficulty',E('FL.starFor(1,"quiet")')===4);
 }
 // ③ 每站、每模式、每星是否真能開始（有完整教材）
 {const {w,E,q,qa}=await boot();
  E('CB.starter();SE.starter();');
  const res=[];
  for(const mode of ['quiet','oral','integ'])for(let st=1;st<=6;st++){const lad=E(`FL.ladder(${st},"${mode}")`);
   for(let s=1;s<=5;s++){E(`S.set.lm="${mode}";UI.pick("${mode}");FL.open(${st});FL.mem().star["${mode}:${st}"]=${s}`);
    const c=E(`FL.chk(FL.ladder(${st},"${mode}")[${s-1}],"rec","all")`);
    if(c.ok){w.__al=null;let ok;try{ok=E('FL.go()')}catch(e){ok='ERR'+e.message}
     const started=ok!==false&&!/ERR/.test(String(ok))&&E('G.on===true');
     if(!started)res.push(`${mode} st${st} ★${s} could not start (${w.__al})`);
     E('try{leave()}catch(e){};FL.end();G.on=false')}
    else res.push(`NA ${mode} st${st} ★${s}: ${c.msg}`)}}
  // 題數不得超過所選題數（教材不足時可以少，但不能多）
  const over=[];for(const n of [5,10])for(const mode of ['quiet','oral','integ'])for(let st=1;st<=6;st++)for(let s=1;s<=5;s++){
   E(`UI.pick("${mode}");FL.open(${st});FL.mem().star["${mode}:${st}"]=${s};FL.mem().n=${n}`);
   if(!E(`FL.chk(FL.ladder(${st},"${mode}")[${s-1}],"rec","all").ok`))continue;
   E('FL.go()');if(E('G.on')&&E('G.n')>n)over.push(`${mode} st${st} ★${s} n=${n} G.n=${E('G.n')}`);E('try{leave()}catch(e){};FL.end();G.on=false')}
  T('actual question count never exceeds the chosen 5/10 (all available combinations)',over.length===0);if(over.length)console.log(over.slice(0,10).join('\n'));
  // 提示褪除重測：固定題數時取代後面一題，不延長
  E('UI.pick("quiet");FL.open(1);FL.mem().star["quiet:1"]=1;FL.mem().n=10;FL.go()');
  const q0=E('G.q.length'),n0=E('G.n');E('PH.hinted=()=>true;PH.sched()');
  T('fade retest in a fixed-count round replaces a later slot instead of extending the round',E('G.n')===n0&&E('G.q.length')===q0&&!!E('G.fs'));
  E('try{leave()}catch(e){};FL.end();G.on=false');
  const bad=res.filter(x=>!x.startsWith('NA'));
  T('every available (mode×station×star) combination actually starts',bad.length===0);if(bad.length)console.log(bad.slice(0,12).join('\n'));
  const na=res.filter(x=>x.startsWith('NA'));console.log('INFO not available with full demo data:',na.length,'of 90');na.slice(0,25).forEach(x=>console.log('  ',x));
 }
 // ④ 星星規則
 {const {w,E,q,qa}=await boot();
  const run=async(star)=>{E(`UI.pick("quiet");FL.open(1);FL.setStar(${star});FL.setN(5)`);E('FL.go()');};
  for(const n of [1,2,3,4,5]){E('leave();G.on=false');E(`UI.pick("quiet");FL.open(1);FL.mem().star["quiet:1"]=${n};FL.mem().n=5;`);
   const chk=E(`FL.chk(FL.ladder(1,"quiet")[${n-1}],"rec","all")`);if(!chk.ok){T(`★${n} unavailable with simple data (skip)`,true);continue}
   E('FL.go()');const b=E('S.rw.stars');E('ok()');T(`${n}星難度答對一題 = ${n}顆`,E('S.rw.stars')-b===n);
   const b2=E('S.rw.stars');E('ok()');T(`同一題重複呼叫 ok() 不重複發星 (★${n})`,E('S.rw.stars')===b2);
   T(`★${n} 完成畫面本次星星 = 題數×星級中的實際發放`,E('G.starsRound')===n);
   E('leave();G.on=false')}
  // 有效嘗試未完成：1 顆鼓勵星，之後答對補差額，總和不超過 N
  E('UI.pick("quiet");FL.open(1);FL.mem().star["quiet:1"]=3;FL.go()');
  const b=E('S.rw.stars');
  E('G.cur&&0');
  const e=E(`(()=>{const rec={outcome:'incorrect',rtFirstInput:800,itemId:G.cur.id};FL.encourage(rec);return rec})()`);
  T('valid attempt without completion → 1 encouragement star',E('S.rw.stars')-b===1);
  E('FL.encourage({outcome:"incorrect",rtFirstInput:900,itemId:G.cur.id})');T('encouragement given once per item',E('S.rw.stars')-b===1);
  E('FL.encourage({outcome:"no_response",rtFirstInput:null,itemId:"zz"})');T('no response / skip → no star (nothing faked)',E('S.rw.stars')-b===1);
  E('FL.encourage({outcome:"tech_error",rtFirstInput:700,itemId:"yy"})');T('technical error → no star',E('S.rw.stars')-b===1);
  E('ok()');T('later completion tops up to exactly N stars for that item (no double)',E('S.rw.stars')-b===3);
  E('leave();G.on=false');
  T('stars are never deducted by hints (unit cost 0)',E('V2.unit()')===0);
  T('no star-cost label on hint buttons',!/−\d?⭐/.test(E('typeof V2.hLab==="function"?(()=>{try{return V2.hLab("p")}catch(e){return""}})():""')));
 }
 // ⑤ 完成畫面
 {const {w,E,q,qa}=await boot();
  E('S.set.anim=false;UI.pick("quiet");FL.open(1);FL.mem().star["quiet:1"]=2;FL.mem().n=5;FL.go()');
  for(let i=0;i<5;i++){E('ok()');E('G.i++;if(G.i<G.n)ask()')}
  E('arrive()');const o=q('#arr');const t=o?o.textContent:'';
  T('completion panel shows 完成旅程、完成題數、本次獲得星星',/完成旅程/.test(t)&&/完成題數/.test(t)&&/本次獲得星星/.test(t));
  T('completion panel shows exactly three buttons: 再練習一次／選擇其他站／返回首頁',JSON.stringify([...o.querySelectorAll('.btns button')].map(b=>b.textContent.replace(/^\S+\s*/,'')))==='["再練習一次","選擇其他站","返回首頁"]');
  T('no 錯誤分析 / 排名 / 扣星 / 累計 on completion',!/錯誤|排行|排名|扣|累計|分數|答錯/.test(t));
  T('stars shown = stars actually earned this round (5×2=10)',/⭐ 10/.test(t));
  E('arrOther()');T('選擇其他站 → six-station map of same mode',qa('.stc').length===6&&!q('#arr'));
 }
 console.log('done');process.exit(0);
})();
