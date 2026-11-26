process.env.LIBMODE='optin';/* v22.0：本測試驗證保留的「逐詞啟用」舊模式（相容路徑）；v22 新行為見 t283 */
// 第05階段：內建詞彙庫整合（jsdom；讀取 vocab/ 實際檔案）
const fs=require('fs'),path=require('path');const {mk,R,T,sleep}=require('./t30h.js');
process.env.VDIR=process.env.VDIR||require('child_process').execSync('bash '+__dirname+'/../tools/make-legacy-vocab.sh').toString().trim();
const VD=path.join(process.env.VDIR,'vocab');
const boot=async(o={})=>{const w=mk(Object.assign({fresh:true,vocab:true},o));const t0=Date.now();while(Date.now()-t0<8000&&!(w.eval('typeof LIB!=="undefined"&&typeof UI!=="undefined"&&S.set.ttsMig===3&&!!LIB.base')))await sleep(50);const E=c=>w.eval(c);w.alert=m=>{w.__al=m};w.confirm=()=>true;return{w,E}};
const J=(E,c)=>JSON.parse(E('JSON.stringify('+c+')'));
(async()=>{
 const V=JSON.parse(fs.readFileSync(VD+'/vocabulary.json','utf8')),C=JSON.parse(fs.readFileSync(VD+'/categories.json','utf8'));
 const {w,E}=await boot();
 // ①～⑦ 資料讀取
 T('① 1,000 words read by the app',E('LIB.base.length')===1000&&E('LIB.rep.words')===1000);
 T('② 16 categories built from categories.json (names not hard-coded)',E('LIB.cats.length')===16&&J(E,'LIB.cats.map(c=>c.name)').join()===C.map(c=>c.name).join()&&!/"水果蔬菜"|'水果蔬菜'/.test(fs.readFileSync(process.env.IDX||'index.html','utf8').replace(/<!--[\s\S]*?-->/g,'')));
 T('③ 581 words with images mapped',E('LIB.rep.withImg')===581&&E('LIB.base.filter(w=>w.images.length).length')===581);
 T('④ 592 images read (paths) and every file exists, exact-case',E('LIB.rep.imgs')===592&&(()=>{const names=new Set(fs.readdirSync(VD+'/images'));return J(E,'LIB.base.flatMap(w=>w.images)').every(p=>names.has(p.replace('images/','')))})());
 T('⑤ 419 words without images are kept',E('LIB.rep.noImg')===419&&E('LIB.base.filter(w=>!w.images.length).length')===419);
 T('⑥ no duplicate IDs',E('LIB.rep.dupId.length')===0&&E('new Set(LIB.base.map(w=>w.id)).size')===1000);
 T('⑦ no invalid image paths; archive/ not part of official bank',E('LIB.rep.badPath.length')===0&&!fs.existsSync(VD+'/archive')&&E('LIB.base.every(w=>w.images.every(p=>/^images\\/VOC\\d+_\\d+\\.webp$/.test(p)))'));
 T('every word keeps ID, name, zhuyin, category, categoryId, primary image (data integrity vs source file)',V.every(v=>{const b=E(`LIB.idx.get('${v.id}')`);return b&&b.word===v.word&&b.zhuyin===v.zhuyin&&b.categoryId===v.categoryId&&b.primaryImage===v.primaryImage}));
 T('all words start pending review / pending dictionary check (nothing auto-approved)',E('LIB.base.every(b=>LIB.eff(b.id).rv==="pending"&&LIB.eff(b.id).zyRev==="pending")'));
 // 既有教材與紀錄
 E(`S.cards=[{id:'my1',text:'老師詞',zy:'ㄌㄠˇ ㄕ',img:'data:image/png;base64,AAAA',audio:'data:audio/mp4;base64,BBBB',cats:['mycat'],created:1,modified:1}];S.cats=[{id:'mycat',name:'水果蔬菜',order:['my1']}];S.logs=[{cid:'my1',ts:1,tries:0,cat:'ind'}];S.set.src='all'`);
 const before=J(E,'({c:S.cards[0],l:S.logs,n:S.cats.length})');
 // ⑬ 啟用、同名分類合併
 const fruit=V.filter(v=>v.category==='水果蔬菜'&&v.word!=='蘋果'&&v.images.length===1),ids=fruit.slice(0,10).map(v=>v.id);
 E(`LIB.setEn(${JSON.stringify(ids)},true)`);
 T('enable adds only the chosen words as cards (relative-URL images, no Base64)',E('S.cards.filter(c=>c.lib).length')===10&&E('S.cards.filter(c=>c.lib&&c.imgs.length).every(c=>!c.imgs.some(x=>x.startsWith("data:")))')&&E('S.cards.filter(c=>c.lib).every(c=>!c.img||c.img.startsWith("vocab/images/"))'));
 const after=J(E,'({c:S.cards.find(x=>x.id==="my1"),l:S.logs,n:S.cats.length})');
 T('⑬ teacher cards, recordings, logs untouched by library activation',JSON.stringify(after.c)===JSON.stringify(before.c)&&JSON.stringify(after.l)===JSON.stringify(before.l));
 T('same-name existing category is merged (no duplicate 水果蔬菜); library words join it; teacher card still there',E('S.cats.filter(c=>c.name==="水果蔬菜").length')===1&&E(`S.cards.filter(c=>c.lib).every(c=>c.cats.includes("mycat"))`)&&E('LIB.st().merged.CAT03')==='mycat');
 E(`LIB.setEn(${JSON.stringify(V.filter(v=>v.category==='動物昆蟲').slice(0,3).map(v=>v.id))},true)`);
 T('categories without enabled words are not created (student side shows no empty categories); category created from categories.json when used',E('S.cats.some(c=>c.id==="LIB-CAT05"&&c.name==="動物昆蟲"&&c.lib)')&&!E('S.cats.some(c=>c.id==="LIB-CAT02")'));
 T('card ids equal original library ids (learning-record links keep working)',E(`S.cards.filter(c=>c.lib).every(c=>/^VOC\\d+$/.test(c.id))`));
 // ⑧ 中文與注音顯示
 E(`sub='lib';tch()`);const html=w.document.querySelector('#sp').innerHTML;
 T('⑧ teacher library page renders Chinese words and zhuyin, lazy images, paging 30',html.includes(V[0].word)&&html.includes(V[0].zhuyin)&&/loading="lazy"/.test(html)&&(html.match(/<tr><td><input type="checkbox"/g)||[]).length===30);
 // ⑨ 多圖
 const ap=V.find(v=>v.word==='蘋果');
 T('⑨ 蘋果 has 2 images under one word ID',ap.images.length===2&&E(`LIB.eff('${ap.id}').imgs.length`)===2&&V.filter(v=>v.images.length>1).length===E('LIB.base.filter(w=>w.images.length>1).length'));
 E(`LIB.setEn(['${ap.id}'],true);LIB.setRv(['${ap.id}'],'approved')`);
 T('approved word gets its primary image; unapproved word has none (blocked from picture questions)',E(`byId('${ap.id}').img`)==='vocab/'+ap.primaryImage&&E(`byId('${ids[0]}').img`)==='');
 // ⑩ 固定／輪流／隨機
 const seq=m=>{E(`LIB.ext().mode='${m}';LIB.ext().rot={};LIB.ext().last={}`);const r=[];for(let i=0;i<6;i++){r.push(E(`(()=>{G.rid=1;G.i=${i};const q={...byId('${ap.id}')};G.q=[q];LIB.pick(q);return q.img})()`))}return r};
 const fx=seq('fixed'),ro=seq('rotate'),rd=seq('random');
 T('⑩ fixed mode always shows the teacher-chosen primary image',fx.every(x=>x==='vocab/'+ap.primaryImage));
 T('⑩ rotate mode alternates through all images in order',ro.join()===[0,1,0,1,0,1].map(i=>'vocab/'+ap.images[i]).join());
 T('⑩ random mode uses both images and never repeats the same image twice in a row',new Set(rd).size===2&&rd.every((x,i)=>i===0||x!==rd[i-1]));
 E(`LIB.ext().mode='rotate';LIB.ext().rot={};LIB.ext().last={}`);
 const same=J(E,`(()=>{G.rid=7;G.i=2;const q={...byId('${ap.id}')};LIB.pick(q);const a=q.img;const q2={...byId('${ap.id}')};LIB.pick(q2);const b=q2.img;G.i=3;const q3={...byId('${ap.id}')};LIB.pick(q3);return[a,b,q3.img]})()`);
 T('⑩ the image never changes while the same question is being re-asked; changes only at the next question',same[0]===same[1]&&same[2]!==same[0]);
 T('usage statistics are keyed by word ID with the image file recorded',E(`Object.keys(LIB.ext().use['${ap.id}']).every(k=>/^VOC\\d+_\\d+\\.webp$/.test(k))`));
 E(`LIB.ext().mode='fixed'`);
 // ⑱ 無圖／未審核不出現在看圖題
 const noimg=V.find(v=>!v.images.length);E(`LIB.setEn(['${noimg.id}'],true)`);
 E(`S.set.src='all';S.set.mode='pick'`);const pp=J(E,'pool().filter(c=>c.lib).map(c=>c.id)');
 T('⑱ picture mode: no-image words and unreviewed words are excluded from the pool; approved image word included',!pp.includes(noimg.id)&&!pp.includes(ids[0])&&pp.includes(ap.id));
 E(`S.set.mode='spell'`);const sp=J(E,'pool().filter(c=>c.lib).map(c=>c.id)');
 T('⑱ text-only mode (看文字拼注音): enabled no-image words may be used',sp.includes(noimg.id)&&sp.includes(ids[0]));
 E(`S.set.mode='key'`);const kp=J(E,'pool().filter(c=>c.lib).map(c=>c.id)');
 T('⑱ 看圖注音打字 also excludes no-image words; no placeholder / other-word image is substituted',!kp.includes(noimg.id)&&E(`byId('${noimg.id}').img`)===''&&E(`byId('${noimg.id}').imgs.length`)===0);
 T('PICK distractor fallback cannot pick an image-less/unreviewed library word',E(`S.cards.filter(x=>x.img&&x.lib).every(x=>x.libRv==='approved')`));
 // ⑪ 教師編輯
 E(`LIB.setZy('${ids[0]}','ㄆㄧㄥˊ ㄍㄨㄛˇ')`);
 T('⑪ teacher can correct zhuyin: stored as override, original kept, status 老師已修改, card updated',E(`byId('${ids[0]}').zy`)==='ㄆㄧㄥˊ ㄍㄨㄛˇ'&&E(`LIB.eff('${ids[0]}').zyRev`)==='edited'&&E(`LIB.eff('${ids[0]}').zyOrig`)===V.find(v=>v.id===ids[0]).zhuyin);
 E(`LIB.setEn(['${ids[0]}'],false);LIB.setEn(['${ids[0]}'],true)`);
 T('zhuyin edit survives disable → enable',E(`byId('${ids[0]}').zy`)==='ㄆㄧㄥˊ ㄍㄨㄛˇ');
 E(`byId('${ap.id}').audio='data:audio/mp4;base64,ZZZZ';LIB.setEn(['${ap.id}'],false);LIB.setEn(['${ap.id}'],true)`);
 T('teacher recording kept across disable → enable',E(`byId('${ap.id}').audio`)==='data:audio/mp4;base64,ZZZZ');
 E(`LIB.addToCat(['${ap.id}'],'LIB-CAT05')`);
 T('a word can belong to several categories (library + teacher-added)',E(`byId('${ap.id}').cats.length`)>=2);
 E(`LIB.hideImg('${ap.id}','${ap.images[1]}')`);
 T('teacher can remove an image (built-in is only hidden; restorable), and set a primary image',E(`LIB.eff('${ap.id}').imgs.length`)===1&&(E(`LIB.restoreImgs('${ap.id}')`),E(`LIB.eff('${ap.id}').imgs.length`)===2)&&(E(`LIB.setPrim('${ap.id}','${ap.images[1]}')`),E(`byId('${ap.id}').img`)==='vocab/'+ap.images[1]));
 // ⑫ 每位學生的範圍
 E(`S.set.mode='spell'`);const n0=E('pool().filter(c=>c.lib).length');
 E(`LIB.setSel(['${ids[1]}','${ids[2]}'],true)`);

 E(`LIB.ext().mode='random'`);const idA=E('LRN.cur().id');E(`LRN.add('測試乙');LRN.switchTo(LRN.list?LRN.list()[LRN.list().length-1].id:S.lrn.list[S.lrn.list.length-1].id)`);
 T('⑫ a second learner has its own range and image mode (independent of learner 1)',E('LRN.cur().id')!==idA&&E('LIB.sel()')===null&&E('LIB.mode()')==='random'/*v21.0 新預設：隨機*/&&E('pool().filter(c=>c.lib).length')===n0);
 E(`LRN.switchTo('${idA}')`);T('switching back keeps learner 1 settings',E('LIB.mode()')==='random');E(`LIB.ext().mode='fixed'`);
 E(`LRN.cur().ext.libSel=['${ids[1]}','${ids[2]}']`);
 T('⑫ range filter applies (2 chosen words) and teacher card stays',E('pool().filter(c=>c.lib).length')===2&&E('pool().some(c=>c.id==="my1")')&&n0>2);
 E('LIB.clearSel()');T('range can be reset to all enabled words',E('pool().filter(c=>c.lib).length')===n0);
 // 注音檢查
 const iss=id=>J(E,`LIB.zyIssues('${id}').map(x=>x.k+':'+x.m)`);
 const bad=E(`(()=>{const o=[];LIB.base.forEach(b=>{if(LIB.zyIssues(b.id).some(x=>x.k==='fmt'))o.push(b.id)});return o.length})()`);
 T('zhuyin format check runs over all 1,000 words (reports list; does not auto-change zhuyin)',typeof bad==='number'&&E('LIB.base.every(b=>LIB.eff(b.id).zy===b.zhuyin||LIB.st().ov[b.id])'));
 T('format validator flags tone-1 mark, wrong syllable count and light-tone dot at the end',(()=>{E(`LIB.idx.set('TST1',{id:'TST1',word:'蘋果',zhuyin:'ㄆㄧㄥˉ ㄍㄨㄛˇ',category:'x',categoryId:'CAT03',images:[]});LIB.idx.set('TST2',{id:'TST2',word:'蘋果',zhuyin:'ㄆㄧㄥˊ',category:'x',categoryId:'CAT03',images:[]});LIB.idx.set('TST3',{id:'TST3',word:'桌子',zhuyin:'ㄓㄨㄛ ㄗ',category:'x',categoryId:'CAT06',images:[]})`);
  return iss('TST1').some(x=>/ˉ/.test(x))&&iss('TST2').some(x=>/音節數/.test(x))&&iss('TST3').some(x=>/輕聲/.test(x))})());
 T('polyphone / 一不 sandhi / consecutive 3rd tone are listed for human confirmation with reasons',(()=>{E(`LIB.idx.set('TST4',{id:'TST4',word:'長',zhuyin:'ㄔㄤˊ',category:'x',categoryId:'CAT13',images:[]});LIB.idx.set('TST5',{id:'TST5',word:'一樣',zhuyin:'ㄧˊ ㄧㄤˋ',category:'x',categoryId:'CAT13',images:[]});LIB.idx.set('TST6',{id:'TST6',word:'洗腳',zhuyin:'ㄒㄧˇ ㄐㄧㄠˇ',category:'x',categoryId:'CAT13',images:[]})`);
  return iss('TST4').some(x=>/多音字/.test(x))&&iss('TST5').some(x=>/一／不/.test(x))&&iss('TST6').some(x=>/連續三聲/.test(x))})());
 E(`['TST1','TST2','TST3','TST4','TST5','TST6'].forEach(i=>LIB.idx.delete(i))`);
 T('9 provider pronunciation corrections are applied in source data (血液/長 etc.) and still pending review',V.find(v=>v.word==='血液').zhuyin==='ㄒㄩㄝˋ ㄧㄝˋ'&&E(`LIB.eff('${V.find(v=>v.word==='血液').id}').zyRev`)==='pending');
 // ⑰ 更新機制
 const nv=JSON.parse(JSON.stringify(V));nv.push({id:'VOC9001',word:'新詞',zhuyin:'ㄒㄧㄣ ㄘˊ',category:'人物',categoryId:'CAT01',images:[],primaryImage:'',reviewStatus:'pending_teacher_review',pronunciationReview:'preliminary_not_dictionary_verified',hasImage:false});
 const w1=nv.find(v=>v.id===ap.id);w1.images=[...w1.images,'images/VOC0087_03.webp'];
 const v2=nv.find(v=>v.id===ids[0]);v2.zhuyin='ㄆㄧㄥˊ ㄍㄨㄛ';// teacher edited this one
 const v3=nv.find(v=>v.id===ids[3]);v3.zhuyin='ㄗㄗ';
 const v4=nv.find(v=>v.id===ids[4]);v4.categoryId='CAT04';v4.category='食物飲料';
 const miss=nv.pop();nv.splice(nv.findIndex(v=>v.id===V[5].id),1);nv.push(miss);
 const d=J(E,`LIB.diff(${JSON.stringify(nv)},LIB.cats)`);
 T('⑰ update preview: new word, new image on same ID, zhuyin diff, category diff, missing words listed but not deleted',d.newW.length===1&&d.img.length===1&&d.zy.length===2&&d.cat.length===1&&d.missing.length===1&&d.dupImg>0);
 T('⑰ teacher-modified zhuyin flagged and protected',d.zy.find(x=>x.id===ids[0]).teacherEdited===true&&d.zy.find(x=>x.id===ids[3]).teacherEdited===false);
 E(`LIB._d=${JSON.stringify(d)};LIB.pend={nv:${JSON.stringify(nv)},d:LIB._d}`);
 const r=J(E,`(()=>{const ap=LIB.eff('${ap.id}');return LIB.applyUpd(LIB.pend.nv,null,LIB.pend.d,{zy:{'${ids[3]}':true}})})()`);
 T('⑰ apply: ok; new word added; image appended once (no duplicates); old words not deleted; teacher zhuyin kept; chosen zhuyin updated; teacher categories kept',r.ok===1&&E(`LIB.idx.has('VOC9001')`)&&E(`LIB.eff('${ap.id}').imgs.length`)===3&&E(`LIB.idx.has('${V[5].id}')`)&&E(`byId('${ids[0]}').zy`)==='ㄆㄧㄥˊ ㄍㄨㄛˇ'&&E(`byId('${ids[3]}').zy`)==='ㄗㄗ'&&E(`byId('${ap.id}').cats.includes('LIB-CAT05')`));
 T('⑰ learning records and teacher cards unaffected by the update',JSON.stringify(J(E,'S.logs'))===JSON.stringify(before.l)&&E('byId("my1").audio')==='data:audio/mp4;base64,BBBB');
 const bad2=J(E,`LIB.diff([{id:'A',word:'x',zhuyin:'ㄅ',categoryId:'CAT01',images:['images/a.webp']},{id:'A',word:'y',zhuyin:'ㄅ',categoryId:'CAT01',images:['../evil.png']}],LIB.cats)`);
 T('⑰ bad update data (duplicate ID / unsafe path) stops safely with a message; nothing changed',!!bad2.error&&E('LIB.idx.has("A")')===false);
 // 匯出入來回
 const ex=J(E,'LIB.expo()');
 T('library settings export holds enabled ids, review, zhuyin edits, image choices — but no built-in images (no Base64 bulk)',Object.keys(ex.en).length>=10&&!JSON.stringify(ex).includes('data:image/')&&JSON.stringify(ex).length<400000);
 const {w:w2,E:E2}=await boot();
 E2(`LIB.impo(${JSON.stringify(ex)},'full');LIB.sync()`);
 T('import restores the library state (enabled words, teacher zhuyin) on a fresh app',E2('S.cards.filter(c=>c.lib).length')===E('S.cards.filter(c=>c.lib).length')&&E2(`byId('${ids[0]}').zy`)==='ㄆㄧㄥˊ ㄍㄨㄛˇ');
 const hostile=E2(`LIB.impo({kind:'library',en:{'../x':1,'ok1':1},ov:{'bad/..':{zy:'x'},'a':{add:[{d:'javascript:1'}],hide:5}}},'merge')`);
 T('import sanitizes hostile ids / non-image data',E2(`!Object.keys(LIB.st().en).includes('../x')&&!LIB.st().ov['bad/..']&&!(LIB.st().ov.a&&LIB.st().ov.a.add&&LIB.st().ov.a.add.length)`));
 // 載入失敗要明確
 const {w:w3,E:E3}=await boot();E3(`LIB.base=null;LIB.err='';window.fetch=async()=>({ok:false,status:404})`);
 await E3('LIB.load(true)');
 T('load failure is reported plainly (not assumed to succeed) and teacher page explains',E3('LIB.base')===null&&/404/.test(E3('LIB.err'))&&(E3(`sub='lib';tch();document.querySelector('#sp').innerHTML`)).includes('讀取失敗'));
 console.log('t180:',R.P,'pass',R.F,'fail');process.exit(R.F?1:0)})();
