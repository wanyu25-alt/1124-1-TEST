// 第02階段：六站地圖、題數／難度／範圍、五星、星星、完成畫面、設定（jsdom 煙霧測試）
const {mk,R,T,sleep}=require('./t30h.js');
const CARDS=`S.cards=[1,2,3,4,5,6].map(i=>({id:'c'+i,text:'詞'+i,zy:'ㄏㄨㄛˇ ㄔㄜ',img:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',audio:'',cats:[]}));S.cats=[];S.set.src='all';S.set.order='seq';S.set.sound=false;S.set.music=false;save()`;
const boot=async(o={})=>{const w=mk(Object.assign({fresh:true},o));const t0=Date.now();while(Date.now()-t0<8000&&!(w.eval('typeof UI!=="undefined"&&typeof FL!=="undefined"&&S.set.ttsMig===3'))) await sleep(50);const E=c=>w.eval(c),q=s=>w.document.querySelector(s),qa=s=>[...w.document.querySelectorAll(s)];E(CARDS);return{w,E,q,qa}};
(async()=>{
 const {w,E,q,qa}=await boot();
 T('FL module loaded, STG[1] renamed',E('typeof FL')==='object'&&E('STG[1].n')==='詞彙練習站');
 E('UI.pick("quiet")');
 T('map shows six stations in order',JSON.stringify(qa('.stc .stt b').map(b=>b.textContent.replace(/^第 \d 站｜/,'')))==='["詞彙認識站","詞彙練習站","詞彙連結站","短語組合站","語句表達站","生活溝通站"]');
 T('no vehicle grid in map',qa('.vgrid,.vc').length===0);
 E('FL.open(1)');
 T('setup shows 5/10/15/20, five stars, range, start',qa('.fn').length>=7&&qa('.fstar').length===5&&/開始練習/.test(q('#mid').textContent));
 T('default 5 questions, star 1',E('FL.mem().n||5')===5&&E('FL.starFor(1,"quiet")')===1);
 E('FL.setN(10);FL.setStar(2)');
 T('choice remembered per learner',E('FL.mem().n')===10&&E('FL.mem().star["quiet:1"]')===2);
 E('FL.setN(5);FL.setStar(2)');
 const ok=E('FL.go()');
 T('FL.go starts a round',ok!==false&&E('G.on')===true&&E('FL.run.star')===2&&E('G.n')===5);
 // 完成一題
 E('G.cur&&0');
 const add=E('(()=>{const b=S.rw.stars;try{ok()}catch(e){return "ERR"+e.message}return S.rw.stars-b})()');
 T('star 2 correct → +2 stars',add===2);
 E('FL.end()');
 T('end restores S.set',E('!S.set.flbk')&&E('FL.run')===null);
 E('tab(5)');
 T('settings has 聲音/學習輔助/畫面 and restore defaults',['聲音','學習輔助','畫面','恢復'].every(k=>q('#mid').textContent.includes(k)));
 E('FL.set("waitSec",10)');T('wait 10 s applied to IDLE_MS',E('IDLE_MS')===10000);
 E('FL.set("waitSec",0)');T('unlimited wait → IDLE_MS Infinity',E('IDLE_MS')===Infinity);
 E('FL.set("hintMode","none")');T('hint none stored per learner',E('LRN.cur().ext.pref.hintMode')==='none');
 w.confirm=()=>true;E('FL.reset()');T('restore defaults clears pref',Object.keys(E('LRN.cur().ext.pref||{}')).length===0&&E('IDLE_MS')===15000);
 console.log('done');process.exit(0);
})();
