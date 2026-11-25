const {JSDOM}=require('jsdom');const fs=require('fs');require('fake-indexeddb/auto');
const html=fs.readFileSync((process.env.IDX||'/mnt/user-data/outputs/vocabulary-express/index.html'),'utf8').replace(/<script src[^>]*><\/script>/,'').replace("lm:'quiet'","lm:'integ'").replace("or:30,","or:0,").replace("hz:{u:'once',cost:true,n:1,free:false}","hz:{u:'none',cost:false,n:1,free:true}").replace("ap:true,","ap:false,").replace("oj:'A'","oj:'B'").replace("prepDone:false","prepDone:true");
const w=new JSDOM(html,{url:'http://localhost/?noseed',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.indexedDB=indexedDB;w.alert=()=>{};w.confirm=()=>true;w.AudioContext=function(){throw 0}}}).window;
const d=w.document,E=s=>w.eval(s),sleep=ms=>new Promise(r=>setTimeout(r,ms));let P=0,F=0;const T=(n,c)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n)};
const kd=(code,key,rep)=>d.dispatchEvent(new w.KeyboardEvent('keydown',{code,key,repeat:!!rep,bubbles:true,cancelable:true}));
(async()=>{await sleep(300);
 E(`S.cards=[{id:'h',text:'火車',zy:'ㄏㄨㄛˇ ㄔㄜ',img:'data:image/jpeg;base64,AAA',audio:'',cats:[]},{id:'o',text:'車',zy:'ㄔㄜ一聲',img:'',audio:'',cats:[]}];(S.cats=[{id:'bk',name:'測'}],S.cards.forEach(c=>c.cats=['h'].includes(c.id)?['bk']:[]),S.set.src='c:bk');S.set.n=1;S.set.sound=false;S.set.music=false;S.set.mode='key';home();startRound()`);await sleep(50);
 const zs=()=>[...d.querySelectorAll('.zs')],dm=()=>[...d.querySelectorAll('.dm')].map(x=>x.textContent);
 T('A 一聲: 火=4 boxes, 車=3 boxes (last is space)',zs().length===7&&E('JSON.stringify(K.seq)')===JSON.stringify([['ㄏ','ㄨ','ㄛ','ˇ'],['ㄔ','ㄜ',' ']]));
 T('A2 card data untouched (no space/一聲 stored)',E("byId('h').zy")==='ㄏㄨㄛˇ ㄔㄜ');
 T('A3 all boxes blank grey at start',zs().every(z=>z.textContent===''&&!z.classList.contains('ok')));
 T('align: every column has demo cell above box (same parent)',[...d.querySelectorAll('.sc')].length===7&&[...d.querySelectorAll('.sc')].every(c=>c.children.length===2&&c.children[0].classList.contains('dm')&&c.children[1].classList.contains('zs')));
 T('align: demo row text per column',dm().join('|')==='ㄏ|ㄨ|ㄛ|ˇ|ㄔ|ㄜ|');
 T('align: groups separate per kanji',d.querySelectorAll('.ac').length===2);
 for(const [c,k] of [['KeyC','c'],['KeyJ','j'],['KeyI','i'],['Digit3','3'],['KeyT','t'],['KeyK','k']])kd(c,k);
 T('space box still grey before Space',!zs()[6].classList.contains('ok')&&E('K.si')===2);
 kd('Space',' ',true);T('held space ignored',E('K.si')===2);
 kd('Space',' ');
 T('Space turns box blue, stays empty (no 一聲/Space text)',E('S.logs.length')===1&&E('S.logs[0].evs.filter(v=>v.a===" ").length')===1&&!d.querySelector('#mid').textContent.includes('一聲')&&!d.querySelector('#mid').textContent.includes('Space'));
 await sleep(1500);
 // box content after space when mid-word (use 2-syllable word)
 E(`S.cards.push({id:'z',text:'車火',zy:'ㄔㄜ ㄏㄨㄛˇ',img:'',audio:'',cats:[]});(S.cats=[{id:'bk',name:'測'}],S.cards.forEach(c=>c.cats=['z'].includes(c.id)?['bk']:[]),S.set.src='c:bk');startRound()`);await sleep(50);
 kd('KeyT','t');kd('KeyK','k');kd('Digit1','1');T('wrong key at space slot rejected, no progress',E('K.si')===2&&E('G.tries')===1);
 kd('Space',' ');T('space box blue + empty text, kanji 車 unlocked',zs()[2].classList.contains('ok')&&zs()[2].textContent===''&&d.querySelector('#c0').textContent==='車'&&d.querySelector('#c1').textContent==='');
 kd('Backspace','Backspace');T('backspace after kanji: stays in next syllable (no change)',E('K.ci')===1&&E('K.si')===0);
 // toggles in listen mode
 E(`(S.cats=[{id:'bk',name:'測'}],S.cards.forEach(c=>c.cats=['h'].includes(c.id)?['bk']:[]),S.set.src='c:bk');S.set.mode='listen';startRound()`);await sleep(50);
 T('listen: no demo zhuyin initially',dm().every(x=>x===''));
 E("kHint('p')");T('partial ON → first symbol of each syllable only',dm().join('|')==='ㄏ|||||ㄔ||'.replace('|||||ㄔ||','|||ㄔ||')||dm().filter(x=>x).join('')==='ㄏㄔ');
E("kHint('p')");T('partial: next stage appends (no toggle-off)',dm().some(x=>x!==''));
E('G.repDone=1');E("kHint('f')");await sleep(900);T('full → all symbols shown (一聲 hint shows 空白鍵)',dm().filter(x=>x).join('')==='ㄏㄨㄛˇㄔㄜ空白鍵');
E('G.repDone=1');E("kHint('f')");await sleep(300);T('full again → stays shown (no toggle-off)',dm().filter(x=>x).join('')==='ㄏㄨㄛˇㄔㄜ空白鍵');
E("kHint('p')");E("kHint('p')");E("kHint('p')");T('repeat presses harmless; no extra hint counted after fully shown',E('G.h.p')<=2);
T('button shows 已完整提示',d.querySelector('#bot').textContent.includes('已完整提示'));
 // spell = 看字拼音打字
 E(`S.set.mode='spell';home()`);T('home label renamed, old label gone',d.body.textContent.includes('看字拼音打字')&&!d.body.textContent.includes('看圖拼音'));
 E('startRound()');await sleep(50);
 T('spell: no photo, kanji shown in hint area, answer blank',!d.querySelector('#pic')&&d.querySelector('.hz').textContent==='火車'&&zs().every(z=>z.textContent==='')&&d.querySelector('#c0').textContent==='');
 E(`S.set.mode='key';startRound()`);await sleep(50);T('mode1 keeps photo',!!d.querySelector('#pic'));
 // touch space
 E(`S.set.input='touch';startRound()`);await sleep(50);
 const b=[...d.querySelectorAll('.tkb')].find(x=>x.textContent.includes('空白'));T('touch kb has space button',!!b);
 const tp=s=>{const x=[...d.querySelectorAll('.tkb')].find(y=>y.textContent===s);x.dispatchEvent(new w.Event('pointerdown',{bubbles:true,cancelable:true}))};
 ['ㄏ','ㄨ','ㄛ','ˇ','ㄔ','ㄜ'].forEach(tp);b.dispatchEvent(new w.Event('pointerdown',{bubbles:true,cancelable:true}));
 T('touch space completes word',E('S.logs.length')===2&&E('S.logs[S.logs.length-1].im')==='touch_keyboard');
 await sleep(1500);E(`S.set.input='phys';home();ktOpen()`);
 [['Digit1','1'],['KeyQ','q'],['KeyA','a'],['KeyZ','z'],['Digit6','6'],['Digit3','3'],['Digit4','4'],['Digit7','7'],['Space',' '],['Backspace','Backspace']].forEach(k=>kd(k[0],k[1]));
 T('keyboard test incl. space: 10 checks',d.querySelectorAll('#kl .ok').length===10);
 console.log(P+' pass, '+F+' fail');process.exit(0)})().catch(e=>{console.log('ERR',e);process.exit(1)});

//LEGACY2

//LEGACY3
