const {JSDOM}=require('jsdom');const fs=require('fs');require('fake-indexeddb/auto');
const html=fs.readFileSync((process.env.IDX||'/mnt/user-data/outputs/vocabulary-express/index.html'),'utf8').replace(/<script src[^>]*><\/script>/,'').replace("lm:'quiet'","lm:'integ'").replace("or:30,","or:0,").replace("hz:{u:'once',cost:true,n:1,free:false}","hz:{u:'none',cost:false,n:1,free:true}").replace("ap:true,","ap:false,").replace("oj:'A'","oj:'B'").replace("prepDone:false","prepDone:true");
const w=new JSDOM(html,{url:'http://localhost/?noseed',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.indexedDB=indexedDB;w.alert=()=>{};w.confirm=()=>true;w.AudioContext=function(){throw 0}}}).window;
const d=w.document,E=s=>w.eval(s),sleep=ms=>new Promise(r=>setTimeout(r,ms));let P=0,F=0;const T=(n,c)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n)};
const kd=(code,key,rep)=>d.dispatchEvent(new w.KeyboardEvent('keydown',{code,key,repeat:!!rep,bubbles:true,cancelable:true}));
(async()=>{await sleep(300);
 E(`S.cards=[{id:'j',text:'計程車',zy:'ㄐㄧˋ ㄔㄥˊ ㄔㄜ',img:'',audio:'',cats:[]},{id:'k',text:'車',zy:'ㄔㄜ一聲',img:'',audio:'',cats:[]}];(S.cats=[{id:'bk',name:'測'}],S.cards.forEach(c=>c.cats=['j'].includes(c.id)?['bk']:[]),S.set.src='c:bk');S.set.n=1;S.set.sound=false;S.set.mode='spell';S.set.music=false;home();startRound()`);await sleep(50);
 const zs=()=>[...d.querySelectorAll('.zs')];
 T('1 blank grey boxes: 3+3+3=9, no text',zs().length===9&&zs().every(z=>z.textContent===''&&!z.classList.contains('ok')));
 T('2 no kanji/zhuyin anywhere in DOM at start',![...'ㄐㄧˋㄔㄥˊㄜ'].some(c=>d.querySelector('#mid').textContent.includes(c))&&[0,1,2].every(i=>d.querySelector('#c'+i).textContent==='')&&!d.querySelector('#mid').textContent.includes('一聲'));
 kd('Digit1','1');T('8 wrong key: no reveal, tries counted',zs()[0].textContent===''&&E('G.tries')===1&&zs()[0].classList.contains('bad'));
 kd('KeyR','r');T('3 correct → only box1 blue+symbol',zs()[0].textContent==='ㄐ'&&zs()[0].classList.contains('ok')&&zs()[1].textContent==='');
 kd('KeyR','r',true);T('long-press repeat ignored',zs()[1].textContent==='');
 kd('KeyU','u');kd('KeyJ','j');T('wrong tone key rejected, no kanji yet',zs()[2].textContent===''&&d.querySelector('#c0').textContent==='');
 kd('Backspace','Backspace');T('9 backspace clears last box, progress consistent',zs()[1].textContent===''&&zs()[0].textContent==='ㄐ'&&E('K.si')===1);
 kd('KeyU','u');kd('Digit4','4');
 T('4-5 kanji 計 appears only after its zhuyin; 程/車 hidden',d.querySelector('#c0').textContent==='計'&&d.querySelector('#c1').textContent===''&&d.querySelector('#c2').textContent==='');
 T('4b kanji reveal animation class',d.querySelector('#c0').classList.contains('in'));
 kd('Space',' ');T('space ignored',E('K.si')===0&&E('K.ci')===1);
 ['KeyT','Slash','Digit6'].forEach(c=>kd(c,{KeyT:'t',Slash:'/',Digit6:'6'}[c]));
 T('7 二聲 ˊ via key 6; 程 revealed',d.querySelector('#c1').textContent==='程'&&d.querySelector('#c2').textContent==='');
 kd('KeyT','t');kd('KeyK','k');
 kd('Space',' ');T('6 一聲: 車 needs 3 presses incl. Space',E('S.logs.length')===1&&E('S.logs[0].im')==='physical_keyboard');
 const L=E('S.logs[0]');T('record: events logged once',L.evs.filter(v=>v.ok).length===10&&L.evs.filter(v=>v.e&&!v.ok).length===3&&L.corr===1);
 await sleep(1500);
 E(`S.set.n=2;startRound()`);await sleep(50);kd('','r');T('fallback to e.key when code missing',zs()[0].textContent==='ㄐ');
 E(`(S.cats=[{id:'bk',name:'測'}],S.cards.forEach(c=>c.cats=['k'].includes(c.id)?['bk']:[]),S.set.src='c:bk');startRound()`);await sleep(50);
 T('legacy 一聲 text normalised, card data untouched',zs().length===3&&E("byId('k').zy")==='ㄔㄜ一聲');
 E(`(S.cats=[{id:'bk',name:'測'}],S.cards.forEach(c=>c.cats=['j'].includes(c.id)?['bk']:[]),S.set.src='c:bk');S.set.input='touch';startRound()`);await sleep(50);
 T('touch kb shown, physical hint hidden',!!d.querySelector('.tkb')&&!d.querySelector('#cap')&&d.body.classList.contains('tk'));
 const tp=s=>{const b=[...d.querySelectorAll('.tkb')].find(x=>x.textContent===s);b.dispatchEvent(new w.Event('pointerdown',{bubbles:true,cancelable:true}))};
 tp('ㄐ');tp('ㄧ');tp('ㄌ');T('touch: same logic',zs()[0].classList.contains('ok')&&zs()[2].textContent===''&&E('G.tries')===1);
 tp('ˋ');['ㄔ','ㄥ','ˊ','ㄔ','ㄜ'].forEach(tp);tp('空白（一聲）');
 T('touch logs inputMethod+deviceType',E('S.logs[S.logs.length-1].im')==='touch_keyboard'&&E('S.logs[S.logs.length-1].dev')==='desktop');
 await sleep(1500);
 E(`S.set.input='phys';home();ktOpen()`);[['Digit1','1'],['KeyQ','q'],['KeyA','a'],['KeyZ','z'],['Digit6','6'],['Digit3','3'],['Digit4','4'],['Digit7','7'],['Backspace','Backspace']].forEach(k=>kd(k[0],k[1]));
 T('keyboard test',d.querySelectorAll('#kl .ok').length===9);
 E('ktClose()');
 E(`sub='log';S.set.lf='touch_keyboard';tab(2)`);T('log filter by input method',d.querySelector('#sp').textContent.includes('輸入方式篩選'));
 T('rename done',d.title==='詞彙特快車'&&!html.includes('交通小勇士'));
 E(`tab(1)`);T('home subtitle',d.body.textContent.includes('注音 × 詞彙 × 鐵道探索'));
 console.log(P+' pass, '+F+' fail');process.exit(0)})().catch(e=>{console.log('ERR',e);process.exit(1)});

//LEGACY2

//LEGACY3
