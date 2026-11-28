const {JSDOM}=require('jsdom');const fs=require('fs');const {IDBFactory}=require('fake-indexeddb');
const html=fs.readFileSync((process.env.IDX||'/mnt/user-data/outputs/vocabulary-express/index.html'),'utf8').replace(/<script src[^>]*><\/script>/,'').replace("lm:'quiet'","lm:'integ'").replace("or:30,","or:0,").replace("hz:{u:'once',cost:true,n:1,free:false}","hz:{u:'none',cost:false,n:1,free:true}").replace("ap:true,","ap:false,").replace("oj:'A'","oj:'B'").replace("prepDone:false","prepDone:true");
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let P=0,F=0;const T=(n,c)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n)};
const mk=(idb)=>{const w=new JSDOM(html,{url:'http://localhost/?noseed',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.__P39FULL=true;/*v22.6.5：用原本 19 個後台分頁檢查舊功能*/
 w.indexedDB=idb;w.alert=m=>{w.__alert=m};w.confirm=()=>true;w.AudioContext=function(){};w.speechSynthesis={getVoices:()=>[],cancel(){},speak(u){setTimeout(()=>u.onend&&u.onend(),20)}};w.SpeechSynthesisUtterance=function(t){this.text=t};
 w.__dl=[];w.__aud=[];w.URL.createObjectURL=b=>{w.__blob=b;return 'blob:t'};w.URL.revokeObjectURL=()=>{};
 w.HTMLAnchorElement.prototype.click=function(){w.__dl.push(this.download)};
 w.Audio=class{constructor(s){this.src=s||'';this.volume=1;this.paused=true;w.__aud.push(this)}play(){this.paused=false;setTimeout(()=>this.onended&&this.onended(),20);return Promise.resolve()}pause(){}};
 w.navigator.mediaDevices={getUserMedia:async()=>({active:true,getTracks:()=>[{stop(){}}]})}}}).window;return w};
const blobBuf=(w,b)=>new Promise(r=>{const fr=new w.FileReader();fr.onload=()=>r(fr.result);fr.readAsArrayBuffer(b)});
const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const jpg=i=>'data:image/jpeg;base64,'+Buffer.from([0xff,0xd8,0xff,0xe0,0,16,0x4a,0x46,0x49,0x46,0,1,1,0,0,1,0,1,0,0,i,i+1,i+2,0xff,0xd9]).toString('base64');
const aud=i=>'data:audio/mpeg;base64,'+Buffer.from(Array.from({length:300},(_,k)=>(k*7+i)&255)).toString('base64');
const CARDS=[['c1','蘋果','ㄆㄧㄥˊ ㄍㄨㄛˇ',png,aud(1),['fruit']],['c2','香蕉','ㄒㄧㄤ ㄐㄧㄠ',jpg(2),'',['fruit']],['c3','火車','ㄏㄨㄛˇ ㄔㄜ',png,aud(3),['veh']],['c4','高鐵','ㄍㄠ ㄊㄧㄝˇ',jpg(4),'',['veh']],['c5','計程車','ㄐㄧˋ ㄔㄥˊ ㄔㄜ',png,aud(5),['veh']],['c6','公車','ㄍㄨㄥ ㄔㄜ',jpg(6),aud(6),['veh']]];
(async()=>{
 const idbA=new IDBFactory(),idbB=new IDBFactory();
 // ===== 電腦 A =====
 const A=mk(idbA);await sleep(500);const EA=s=>A.eval(s);
 EA(`S.cards=${JSON.stringify(CARDS.map(c=>({id:c[0],text:c[1],zy:c[2],img:c[3],audio:c[4],cats:c[5],created:1700000000000+1,modified:1700000000000+2})))};S.cats=[{id:'fruit',name:'水果',order:['c1','c2']},{id:'veh',name:'交通工具',order:['c3','c4','c5','c6']}];S.set.n=7;S.set.order='seq';S.set.ttsRate=.8;S.set.hint='partial';S.set.mv=.55;S.set.vs=.35;S.set.vv=.6;S.set.fx='low';S.set.stageN=4;S.set.showText=true;S.logs=[{t:1,cid:'c1',word:'蘋果',cat:'ind'}];S.rw.stars=99;S.mst={c1:1};save()`);await sleep(150);
 EA("tab(3);sub='io';tch();tIO()");
 T('teacher page: plain-language warning that data lives in this browser + counts',A.document.body.textContent.includes('這台電腦的這個瀏覽器')&&A.document.body.textContent.includes('6 張圖卡'));
 await EA('ioExport("materials")');await sleep(200);
 T('download filename = 詞彙特快車_完整教材_YYYYMMDD.zip',/^詞彙特快車_完整教材_\d{8}\.zip$/.test(A.__dl[0]||''));
 const buf=await blobBuf(A,A.__blob);const z=await A.eval('zipRead')(buf);const names=[...z.keys()];
 T('zip is standard (EOCD, parseable) with manifest, cards, categories, settings',['manifest.json','cards.json','categories.json','settings.json'].every(n=>names.includes(n)));
 T('zip has 6 real images + 3... audio files as binary files (not blob/URL)',names.filter(n=>n.startsWith('images/')).length===6&&names.filter(n=>n.startsWith('audio/')).length===4);
 const man=JSON.parse(Buffer.from(z.get('manifest.json')).toString());
 T('manifest: version, date, counts of cards/cats/images/audio, type',man.schemaVersion===1&&!!man.exportedAt&&man.counts.cards===6&&man.counts.categories===2&&man.counts.images===6&&man.counts.audio===4&&man.kind==='materials');
 const cj=JSON.parse(Buffer.from(z.get('cards.json')).toString());
 T('cards.json: ids, 詞彙, full 注音 with tone marks (Traditional + bopomofo intact), no data:/blob: URLs',cj.cards.length===6&&cj.cards[2].zy==='ㄏㄨㄛˇ ㄔㄜ'&&cj.cards[0].text==='蘋果'&&!JSON.stringify(cj).includes('data:')&&!JSON.stringify(cj).includes('blob:'));
 const imgBytes=z.get(cj.cards[0].image);T('image file is real PNG bytes (89 50 4E 47)',imgBytes[0]===0x89&&imgBytes[1]===0x50&&imgBytes[2]===0x4E);
 T('audio file is the real uploaded bytes',Buffer.compare(Buffer.from(z.get(cj.cards[0].audio)),Buffer.from(aud(1).split(',')[1],'base64'))===0);
 const cat=JSON.parse(Buffer.from(z.get('categories.json')).toString());T('categories: names, ids, sort, card links',cat.categories.length===2&&cat.categories[0].name==='水果'&&cat.categories[1].cardOrder.join()==='c3,c4,c5,c6'&&cj.cards[2].cats[0]==='veh');
 const st=JSON.parse(Buffer.from(z.get('settings.json')).toString()).portable;
 T('settings: 題數/順序/語音速度/提示/音量/音樂/動畫 all included',st.n===7&&st.order==='seq'&&st.ttsRate===.8&&st.hint==='partial'&&st.mv===.55&&st.vs===.35&&st.vv===.6&&st.fx==='low'&&st.stageN===4&&'anim' in st&&'sound' in st&&'music' in st&&'hl' in st);
 T('NO student records in materials zip (no records/progress files, no logs)',!names.some(n=>/records|progress|students/.test(n))&&!JSON.stringify(st).includes('logs'));
 // ===== 電腦 B（全新空白） =====
 const B=mk(idbB);await sleep(500);const EB=s=>B.eval(s);
 T('computer B starts empty (reproduces the original problem)',EB('S.cards.length')===0&&EB('S.cats.length')===0);
 const file=(w,b,name)=>({name,size:b.byteLength,arrayBuffer:async()=>b});
 EB("tab(3);sub='io';tch();tIO()");await EB('ioPick')(file(B,buf,'x.zip'));
 const pv=B.document.querySelector('#iopv').textContent;
 T('preview shows real counts: 6 cards, 2 cats, 6 images, 4 audio, settings',/圖卡：6 張/.test(pv)&&/分類：2 個/.test(pv)&&/圖片：6 張/.test(pv)&&/音檔：4 個/.test(pv)&&/教學設定：已包含/.test(pv));
 T('nothing written before confirming',EB('S.cards.length')===0);
 B.document.querySelector('input[name=iom][value=replace]').checked=true;await EB('ioApply()');await sleep(300);
 T('import done: 6 cards restored with text + 注音',EB('S.cards.length')===6&&EB('S.cards.map(c=>c.text+c.zy).join()')===CARDS.map(c=>c[1]+c[2]).join());
 T('all 6 images restored identically',EB('S.cards.every(c=>c.img.startsWith("data:image/"))')&&EB('S.cards[0].img')===png&&EB('S.cards[1].img')===jpg(2));
 T('uploaded audio restored (4) identically',EB('S.cards.filter(c=>c.audio).length')===4&&EB('S.cards[0].audio')===aud(1)&&EB('S.cards[5].audio')===aud(6));
 T('categories + card links restored (水果:2, 交通工具:4, order kept)',EB('S.cats.map(c=>c.name).join()')==='水果,交通工具'&&EB('catCards("fruit").length')===2&&EB('catCards("veh").map(c=>c.text).join()')==='火車,高鐵,計程車,公車');
 T('settings restored (n, order, speed, hint, volumes, fx)',EB('S.set.n')===7&&EB('S.set.order')==='seq'&&EB('S.set.ttsRate')===.8&&EB('S.set.hint')==='partial'&&EB('S.set.vs')===.35&&EB('S.set.fx')==='low');
 T('no student records on B (logs empty, stars 0)',EB('S.logs.length')===0&&EB('S.rw.stars')===0);
 T('success message: no reload needed',/不需要重新整理/.test(B.document.querySelector('#iop').textContent));
 // 五種交通工具
 EB('S.set.src="all";S.set.sound=false;S.set.music=false;S.set.vf=false;S.asrDecl=1;save()');
 const modes={};for(const k of ['bike','car','train','hsr','plane']){EB(`S.set.mix=false;goV('${k}')`);await sleep(80);
  const pic=B.document.querySelector('#pic');const m=EB('S.set.mode');
  if(k==='plane'){EB("S.set.mode='key';ask()");}
  const ok=EB('G.q.length')===7&&EB('deck().cards.length')===6;
  let pr=true;if(EB('typed()')){while(!EB('G.lock'))EB('kPress(K.seq[K.ci][K.si],"physical_keyboard")');pr=EB('G.done')===1}else{EB('sOk(1)');pr=EB('G.done')===1}
  const picOk=k==='car'||k==='train'||k==='plane'?true:!!pic&&pic.src.startsWith('data:image/');modes[k]=ok&&pr&&picOk;EB('leave()');await sleep(30)}
 T('five vehicles read imported cards: bike/car/train/hsr/plane (7 questions, images show, answering works)',Object.values(modes).every(Boolean));
 EB('S.set.mode="key";S.set.mix=false;S.set.src="c:veh";startRound()');const q=EB('G.q.every(c=>["火車","高鐵","計程車","公車"].includes(c.text))');EB('leave()');T('category-based question selection works',q);
 EB('S.cards[0].audio&&speak(S.cards[0])');await sleep(60);T('teacher audio plays from restored data (Audio src = data:audio)',B.__aud.some(a=>a.src.startsWith('data:audio/mpeg')));
 EB('E_=0');
 // 重新整理
 await sleep(200);const B2=mk(idbB);await sleep(600);T('after reload (new page, same browser storage): 6 cards, 2 cats, images, settings still there',B2.eval('S.cards.length')===6&&B2.eval('S.cats.length')===2&&B2.eval('S.cards.filter(c=>c.img).length')===6&&B2.eval('S.set.n')===7);
 // ===== 重複匯入 =====
 const EB2=s=>B2.eval(s);EB2("tab(3);sub='io';tch();tIO()");
 await EB2('ioPick')(file(B2,buf,'x.zip'));B2.document.querySelector('input[name=iom][value=merge]').checked=true;
 T('repeat import preview: all 6 recognised as same (no new), by ID',/預計新增 0 張、內容相同略過 6 張/.test(B2.document.querySelector('#iopv').textContent));
 await EB2('ioApply()');await sleep(300);T('repeat merge import adds no duplicates',EB2('S.cards.length')===6&&EB2('S.cats.length')===2);
 await EB2('ioApply()');
 // ===== ID 衝突 =====
 EB2('S.cards[0].zy="ㄆㄧㄥˊ"; S.cards[0].text="蘋果";save()');await EB2('ioPick')(file(B2,buf,'x.zip'));
 const pv2=B2.document.querySelector('#iopv').textContent;T('ID conflict detected by id+content (not by word): shows conflict & choices',/衝突 1 張/.test(pv2)&&/不同：注音/.test(pv2)&&!!B2.document.querySelector('#cf0'));
 B2.document.querySelector('input[name=iom][value=merge]').checked=true;B2.document.querySelector('#cf0').value='both';await EB2('ioApply()');await sleep(300);
 T('conflict choice "both": original kept + imported saved as new card',EB2('S.cards.length')===7&&EB2('S.cards.filter(c=>c.text==="蘋果").length')===2);
 EB2('S.cards=S.cards.slice(0,6);S.cards[0].zy="ㄆㄧㄥˊ";save()');await EB2('ioPick')(file(B2,buf,'x.zip'));B2.document.querySelector('input[name=iom][value=merge]').checked=true;B2.document.querySelector('#cf0').value='keep';await EB2('ioApply()');await sleep(300);T('conflict choice "keep": local version unchanged',EB2('S.cards[0].zy')==='ㄆㄧㄥˊ'&&EB2('S.cards.length')===6);
 await EB2('ioPick')(file(B2,buf,'x.zip'));B2.document.querySelector('input[name=iom][value=merge]').checked=true;B2.document.querySelector('#cf0').value='over';await EB2('ioApply()');await sleep(300);T('conflict choice "over": imported version wins',EB2('S.cards[0].zy')==='ㄆㄧㄥˊ ㄍㄨㄛˇ');
 // ===== ZIP 損壞 =====
 const before=JSON.stringify(EB2('S.cards.map(c=>c.id+c.text)'));
 const bad=new Uint8Array(buf.slice(0));bad[400]^=0xff;bad[401]^=0xff;await EB2('ioPick')(file(B2,bad.buffer,'bad.zip'));T('corrupted ZIP: rejected with clear error, local data untouched',/匯入失敗/.test(B2.document.querySelector('#iop').textContent)&&!EB2('IOP.P')&&JSON.stringify(EB2('S.cards.map(c=>c.id+c.text)'))===before);
 await EB2('ioPick')(file(B2,buf.slice(0,Math.floor(buf.byteLength/2)),'cut.zip'));T('truncated ZIP: rejected, data untouched',/匯入失敗/.test(B2.document.querySelector('#iop').textContent)&&EB2('S.cards.length')===6);
 await EB2('ioPick')(file(B2,new TextEncoder().encode('hello').buffer,'x.txt'));T('not a zip/json: rejected',/匯入失敗/.test(B2.document.querySelector('#iop').textContent));
 // ===== 缺少圖片 =====
 const zr=await B2.eval('zipRead')(buf);const files=[...zr.entries()].filter(([n])=>n!=='images/card_002.jpg').map(([name,data])=>({name,data}));
 const miss=await blobBuf(B2,B2.eval('zipMake')(files));await EB2('ioPick')(file(B2,miss,'miss.zip'));
 const pv3=B2.document.querySelector('#iopv').textContent;T('ZIP missing an image: detected (integrity + 缺少圖片), preview warns, no crash',/缺少圖片|完整性檢查/.test(pv3)&&EB2('IOP.P.cards.length')===6&&EB2('IOP.P.cards.filter(c=>c.img).length')===5);
 // ===== 匯入過程中斷 =====
 await EB2('ioPick')(file(B2,buf,'x.zip'));B2.document.querySelector('input[name=iom][value=replace]').checked=true;EB2('S.cards[1].text="香蕉改";save()');await sleep(100);
 const real=B2.indexedDB;B2.indexedDB={open(){throw new Error('模擬：儲存空間已滿')}};await EB2('ioApply()');B2.indexedDB=real;
 T('interrupted import (storage fails): error shown, in-memory data NOT replaced',/匯入失敗，原有資料沒有被改動/.test(B2.document.querySelector('#iop').textContent)&&EB2('S.cards[1].text')==='香蕉改');
 await sleep(100);const B3=mk(idbB);await sleep(600);T('interrupted import: stored data still the original after reload',B3.eval('S.cards.length')===6&&B3.eval('S.cards[1].text')==='香蕉改'&&B3.eval('S.cards.filter(c=>c.img).length')===6);
 // ===== 舊格式 =====
B3.eval("tab(3);sub='io';tch()");
 const old={v:2,cards:[{id:'o1',text:'月亮',zy:'ㄩㄝˋ ㄌㄧㄤˋ',img:png,audio:'',cats:['k1'],created:1,modified:1}],cats:[{id:'k1',name:'天空'}],banks:[],set:{n:6}};
 await B3.eval('ioPick')(file(B3,new TextEncoder().encode(JSON.stringify(old)).buffer,'old.json'));T('legacy JSON (old format) imports through the same preview',/舊版格式/.test(B3.document.querySelector('#iopv').textContent)&&B3.eval('IOP.P.cards.length')===1);
 B3.document.querySelector('input[name=iom][value=merge]').checked=true;await B3.eval('ioApply()');await sleep(300);T('legacy import merged: 7 cards, new category present',B3.eval('S.cards.length')===7&&B3.eval('S.cats.some(c=>c.name==="天空")'));
 const oldFull={kind:'full-backup',data:{...old,logs:[],quits:[],rounds:{started:0,completed:0}}};await B3.eval('ioPick')(file(B3,new TextEncoder().encode(JSON.stringify(oldFull)).buffer,'oldfull.json'));T('legacy full-backup JSON accepted',B3.eval('IOP.P&&IOP.P.kind')==='full');
 console.log(P+' pass, '+F+' fail');process.exit(0)})().catch(e=>{console.log('ERR',e);process.exit(1)});

//LEGACY2

//LEGACY3
