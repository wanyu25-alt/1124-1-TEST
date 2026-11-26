const {JSDOM}=require('jsdom');const fs=require('fs');require('fake-indexeddb/auto');
const html=fs.readFileSync((process.env.IDX||'/mnt/user-data/outputs/vocabulary-express/index.html'),'utf8').replace(/<script src[^>]*><\/script>/,'').replace("lm:'quiet'","lm:'integ'").replace("or:30,","or:0,").replace("hz:{u:'once',cost:true,n:1,free:false}","hz:{u:'none',cost:false,n:1,free:true}").replace("ap:true,","ap:false,").replace("oj:'A'","oj:'B'").replace("prepDone:false","prepDone:true");const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let P=0,F=0;const T=(n,c)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n)};
const mk=(red)=>new JSDOM(html,{url:'http://localhost/?noseed',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.indexedDB=indexedDB;w.alert=()=>{};w.confirm=()=>true;w.AudioContext=function(){};w.speechSynthesis={getVoices:()=>[],cancel(){}};
 w.navigator.mediaDevices={getUserMedia:async()=>({active:true,getTracks:()=>[{stop(){}}]})};if(red)w.matchMedia=q=>({matches:/reduce/.test(q),addListener(){},addEventListener(){}})}}).window;
(async()=>{let w=mk();await sleep(500);const E=s=>w.eval(s),d=w.document;
 E(`S=DEF();S.cards=[{id:'a',text:'火車',zy:'ㄏㄨㄛˇ ㄔㄜ',img:'data:image/png;base64,AAA',audio:'',cats:['fr']},{id:'b',text:'蘋果',zy:'ㄆㄧㄥˊ ㄍㄨㄛˇ',img:'data:image/png;base64,AAA',audio:'',cats:['fr']},{id:'c',text:'公車',zy:'ㄍㄨㄥ ㄔㄜ',img:'data:image/png;base64,AAA',audio:'',cats:['tr']}];S.cats=[{id:'fr',name:'水果'},{id:'tr',name:'交通工具'}];S.set.sound=false;S.set.music=false;S.set.n=4;S.asrDecl=1;save();RC.ui.classic=true;home()`);
 E('UI.pick("integ");FL.open(1)');/* v21.0：交通工具依難度自動安排，不再手動下拉；仍保留五種交通工具資產 */const cards=E('FL.VEH.map(k=>TH[k].e+" "+TH[k].n)');
 T('home: five vehicle cards in order 腳踏車→汽車→火車→高鐵→飛機',cards.length===5&&['腳踏車','汽車','火車','高鐵','飛機'].every((n,i)=>cards[i].includes(n)));
 /* v22.4（第03批）：教師要求移除「本次學習任務」摘要（原本在摘要中顯示交通工具）；交通工具仍依難度自動安排，沒有手動選單 */
 T('setup: no manual vehicle select; vehicle is auto-assigned by difficulty (summary block removed in v22.4)',!d.querySelector('#fl_veh')&&!/本次學習任務/.test(d.querySelector('#mid').textContent)&&!!E('TH[FL.vehFor(1)]')&&E('FL.vehFor(1)')!==E('FL.vehFor(5)'));
 const mid=d.querySelector('#mid').textContent;T('no separate 旅程 / mode buttons / 開始旅程 on home',!mid.includes('旅程')&&!mid.includes('開始旅程')&&!/🧩|👂/.test(d.querySelector('#mid').innerHTML.replace(/<svg.*?<\/svg>/gs,'')));
 E('UI.pick("quiet");FL.open(1)');E('FL.setRange("pick");FL.setDim("custom")');T('v21.0 category multi-select in setup (checkbox, counts)',!!d.querySelector('#mid input[type=checkbox]')&&/水果[\s\S]{0,40}2 個詞彙/.test(d.querySelector('#mid').textContent));E('UI.view="mode";UI.mode="integ";home()');
 // each vehicle → mode
 const cfg=[['bike','key'],['car','listen'],['train','spell'],['hsr','speak']];
 for(const [k,m] of cfg){E(`S.set.src='all';goV('${k}')`);await sleep(150);
  T(`${k} → starts ${m} directly, theme applied`,E('G.on')===true&&E('S.set.mode')===m&&E('S.set.mix')===false&&d.querySelector('#scene').dataset.th===k&&!!d.querySelector('#train svg.vh'));
  if(k==='train')T('train(spell): no photo shown',!d.querySelector('#mid img'));if(k==='bike')T('bike(key): photo shown',!!d.querySelector('#mid img'));
  E('leave()');}
 E(`goV('plane')`);await sleep(150);T('plane → comprehensive (mix) started',E('G.on')&&E('S.set.mix')===true&&d.querySelector('#scene').dataset.th==='plane');
 T('mix: current question mode badge shown',d.querySelector('#mbd').style.display==='block'&&d.querySelector('#mbd').textContent.includes('目前題目：'));
 const seen=new Set();for(let i=0;i<30;i++){E('ask()');seen.add(E('S.set.mode'))}T('mix randomises modes',seen.size>=3);E('leave()');
 T('badge hidden outside mix',d.querySelector('#mbd').style.display==='none');
 // category used
 E(`S.set.src='c:tr';goV('bike')`);await sleep(100);T('category respected when starting from vehicle',E('G.q.every(c=>c.id==="c")'));E('leave()');
 E(`S.set.src='c:fr';goV('bike')`);await sleep(100);T('fruit only',E('G.q.every(c=>c.id!=="c")'));
 // parallax
 const lays=[...d.querySelectorAll('.lay')];T('3–4 parallax layers (incl. foreground grass) with different factors',lays.length>=3&&lays.length<=4&&new Set(lays.map(l=>l.dataset.f)).size===lays.length);
 E('G.done=2;scene(false)');const tx=[...d.querySelectorAll('.lay')].map(l=>-parseFloat(l.style.transform.match(/translate3d\(([-\d.]+)px/)[1]));
 T('parallax: near layer moves more than mid > far (camera moved)',tx[0]>0&&tx[1]>tx[0]&&tx[2]>tx[1]&&Math.abs(tx[2]/tx[0]-(+lays[2].dataset.f)/(+lays[0].dataset.f))<.01);
 E('leave()');
 // speeds ordered, no time limit
 T('visual speed: bike slowest → plane fastest (spd decreasing)',E('Object.values(TH).map(t=>t.spd).every((v,i,a)=>!i||v<a[i-1])'));
 E(`S.set.src='all';goV('plane')`);await sleep(100);await sleep(2500);T('no countdown / auto-fail: question stays open',E('G.on')&&!E('G.lock')&&E('G.tries')===0&&E('G.done')===0);E('leave()');
 // full game bike with keys
 E(`S.set.n=2;goV('bike')`);await sleep(100);
 for(let q=0;q<2;q++){const k=E('K.seq.flat().map(s=>s===" "?"Space":Object.entries(ZK).find(e=>e[1]===s)[0])');for(const c of k)d.dispatchEvent(new w.KeyboardEvent('keydown',{code:c,key:c==='Space'?' ':'',bubbles:true,cancelable:true}));await sleep(1700)}
 T('bike round completes: logs have mode key, stars, arrival overlay with 公園 text',E('S.logs.filter(l=>l.mode==="key").length')>=2&&E('S.rw.stars')>=2&&/公園/.test(d.body.textContent));
 // arrival text per theme
 for(const [k,txt] of [['bike','公園'],['car','城市'],['train','月台'],['hsr','平穩停靠'],['plane','降落機場']]){d.querySelectorAll('.ov').forEach(o=>o.remove());E(`S.set.theme='${k}';G.n=3;ARR.rid=0;arrive()`);T(`arrival panel for ${k}`,d.querySelector('.ov h1').textContent.includes('完成旅程')&&!!d.querySelector('.ov .arrsc.v-'+'${k}'.replace('${k}',k)))}
 d.querySelectorAll('.ov').forEach(o=>o.remove());E('RC.ui.classic=true;home()');
 // plane fly class
 E(`S.set.theme='plane';S.set.anim=true;RC.ui.classic=true;home();G={...G,on:true,n:4,done:1};scene(false)`);T('plane stays airborne mid-journey',d.querySelector('#train').classList.contains('fly'));E('G.done=4;scene(true)');T('plane lands at the end',!d.querySelector('#train').classList.contains('fly'));E('G.on=false');
 // reduced motion
 E('S.set.anim=false;scene()');T('anim off → body.noanim & no moving class',d.body.classList.contains('noanim')&&!d.querySelector('#train').classList.contains('mv'));
 const w2=mk(true);await sleep(500);w2.eval(`S=DEF();S.cards=[{id:'a',text:'火車',zy:'ㄏㄨㄛˇ ㄔㄜ',img:'',audio:'',cats:[]}];S.set.sound=false;S.set.music=false;S.set.n=3;goV('car');G.done=1;scene(true)`);
 T('prefers-reduced-motion respected (noanim, no mv/boost)',w2.document.body.classList.contains('noanim')&&!w2.document.querySelector('#train').classList.contains('mv')&&(w2.eval('boost()'),!w2.document.querySelector('#train').classList.contains('boost')));
 // settings page
 E('S.set.anim=true;tab(2);sub="set";tch()');T('settings explains fixed mapping, no theme selector',d.querySelector('#sp').textContent.includes('交通工具與學習模式固定對應')&&!d.querySelector('#sp').innerHTML.includes('setTheme'));
 // portable
 T('theme portable; invalid dropped',E('S.set.theme="hsr";portableSet(S.set).theme')==='hsr'&&E('"theme" in portableSet({theme:"evil"})')===false);
 E('save()');await sleep(100);const w3=mk();await sleep(500);T('reopen keeps last vehicle theme',w3.eval('thNow()')===E('S.set.theme'));
 console.log(P+' pass, '+F+' fail');process.exit(0)})().catch(e=>{console.log('ERR',e);process.exit(1)});

//LEGACY2

//LEGACY3
