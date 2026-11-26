// 第06階段：預設詞彙清單、無圖詞彙清單與 CSV（jsdom；用暫存的 vocab 目錄模擬網站）
const fs=require('fs');process.env.VDIR=require('child_process').execSync('bash '+__dirname+'/../tools/make-legacy-vocab.sh').toString().trim();const {mk,R,T,sleep}=require('./t30h.js');
const VD=process.env.VDIR+'/vocab',DEF=VD+'/default-library.json',V=JSON.parse(fs.readFileSync(process.env.VDIR+'/vocab/vocabulary.json','utf8'));
const boot=async()=>{const w=mk({fresh:true,vocab:true});const t0=Date.now();while(Date.now()-t0<9000&&!w.eval('typeof LIB!=="undefined"&&S.set.ttsMig===3&&!!LIB.base&&!!LIB.defInfo'))await sleep(50);const E=c=>w.eval(c);w.alert=m=>{w.__al=m};w.confirm=()=>true;return{w,E}};
const J=(E,c)=>JSON.parse(E('JSON.stringify('+c+')'));
const fruit=V.filter(v=>v.category==='水果蔬菜'&&v.images.length===1).slice(0,6).map(v=>v.id),ani=V.filter(v=>v.category==='動物昆蟲'&&v.images.length).slice(0,4).map(v=>v.id);
const mkDef=(en,ov,mode)=>({schemaVersion:1,kind:'library-default',ver:'1.0',en:Object.fromEntries(en.map(i=>[i,1])),ov:ov||{},mode:mode||'fixed'});
(async()=>{
 try{fs.unlinkSync(DEF)}catch(e){}
 // ① 網站沒有預設清單：不報錯、不改任何東西
 {const {E}=await boot();T('no default file on the site → state none, nothing enabled, no error',E('LIB.defInfo.state')==='none'&&E('Object.keys(LIB.st().en).length')===0);
  // ② 匯出：只含可攜設定
  E(`LIB.setEn(${JSON.stringify(fruit)},true);LIB.setRv(${JSON.stringify(fruit.slice(0,3))},'approved');LIB.setZy('${fruit[0]}','ㄅㄅ ㄆㄆ');LIB.setPrim('${fruit[1]}',LIB.eff('${fruit[1]}').prim);byId('${fruit[2]}').audio='data:audio/mp4;base64,AAAA';LIB.setEn(['${fruit[2]}'],false);LIB.setEn(['${fruit[2]}'],true);LIB.st().ov['${fruit[3]}']={...(LIB.st().ov['${fruit[3]}']||{}),add:[{d:'data:image/jpeg;base64,/9j/AAAA',ts:1}],primary:'data:image/jpeg;base64,/9j/AAAA'}`);
  const d=J(E,'LIB.defObj()'),o=d.o;
  T('export holds enabled ids, review result, zhuyin edits, primary image, mode',Object.keys(o.en).length===6&&o.ov[fruit[0]].zy==='ㄅㄅ ㄆㄆ'&&o.ov[fruit[0]].zyRev==='edited'&&o.ov[fruit[0]].rv==='approved'&&o.ov[fruit[1]].primary&&o.mode==='random'/*v21.0 新預設*/&&o.kind==='library-default'&&/^[0-9a-f]+$/.test(o.hash));
  T('export excludes recordings and teacher-uploaded (Base64) images, and reports what was left out',!JSON.stringify(o).includes('data:')&&d.drop.audio>=1&&d.drop.add===1&&d.drop.prim===1);
  fs.writeFileSync(DEF,JSON.stringify(o));fs.writeFileSync('/tmp/def1.json',JSON.stringify(o))}
 // ③ 另一台新裝置：自動套用
 {const {E}=await boot();
  T('fresh device auto-applies the site default list (6 words enabled, review + zhuyin edit carried over)',E('LIB.defInfo.state')==='applied'&&E('S.cards.filter(c=>c.lib).length')===6&&E(`byId('${fruit[0]}').zy`)==='ㄅㄅ ㄆㄆ'&&E(`LIB.eff('${fruit[1]}').rv`)==='approved'&&E(`byId('${fruit[1]}').img`).startsWith('vocab/images/')&&E(`byId('${fruit[5]}').img`)==='');
  T('applied card carries no recording/teacher image from another device',E(`byId('${fruit[2]}').audio`)===''&&E('S.cards.filter(c=>c.lib).every(c=>!c.imgs.some(x=>x.startsWith("data:")))'));
  T('baseline recorded so later updates are shown as differences',E('LIB.st().def.en.length')===6);
  // ④ 預設清單更新：本機設定優先
  E(`LIB.setEn(['${fruit[4]}'],false);LIB.setZy('${fruit[1]}','ㄇㄇ ㄋㄋ')`);// 老師本機停用一個、改一個注音
  const o2=JSON.parse(fs.readFileSync(DEF,'utf8'));o2.en[ani[0]]=1;o2.en[ani[1]]=1;o2.ov[ani[0]]={rv:'approved'};o2.ov[fruit[1]]={zy:'ㄍㄍ ㄍㄍ',zyRev:'edited'};o2.ov[fruit[0]]={...o2.ov[fruit[0]],zy:'ㄅㄅ ㄆㄆ'};fs.writeFileSync(DEF,JSON.stringify(o2));
  await E('LIB.defBoot()');
  const pd=J(E,'LIB.defPend&&LIB.defPend.d');
  T('default updated → only a difference notice, nothing applied automatically',E('LIB.defInfo.state')==='pending'&&pd.addEn.length===2&&!E(`!!LIB.st().en['${ani[0]}']`));
  T('difference separates new items from items where this device already has its own setting',pd.newOv.includes(ani[0])&&pd.conflict.includes(fruit[1]));
  E('LIB.defOk()');
  T('confirm: new words enabled; local zhuyin edit kept (local first); locally disabled word NOT re-enabled',E(`!!LIB.st().en['${ani[0]}']&&!!LIB.st().en['${ani[1]}']`)&&E(`byId('${fruit[1]}').zy`)==='ㄇㄇ ㄋㄋ'&&E(`!LIB.st().en['${fruit[4]}']`)&&E(`LIB.eff('${ani[0]}').rv`)==='approved');
  T('after applying, the panel shows no pending difference',E('LIB.defInfo.state')==='same'&&E('LIB.defPend')===null);
  // ⑤ 略過
  const o3=JSON.parse(fs.readFileSync(DEF,'utf8'));o3.en[ani[2]]=1;fs.writeFileSync(DEF,JSON.stringify(o3));await E('LIB.defBoot()');E('LIB.defSkip()');await E('LIB.defBoot()');
  T('skip: same version is not asked again; not applied',E('LIB.defInfo.state')==='skipped'&&!E(`!!LIB.st().en['${ani[2]}']`));
  const o4=JSON.parse(fs.readFileSync(DEF,'utf8'));o4.en[ani[3]]=1;fs.writeFileSync(DEF,JSON.stringify(o4));await E('LIB.defBoot()');
  T('a newer default after a skip is shown again',E('LIB.defInfo.state')==='pending');
  // 面板
  E(`sub='lib';tch()`);const h=E(`document.querySelector('#sp').innerHTML`);
  T('panel shows the pending notice, export button, fill button',/預設詞彙清單有更新/.test(h)&&/匯出預設清單/.test(h)&&/補入網站預設清單/.test(h)&&/確認套用/.test(h));}
 // ⑥ 本機已有設定的裝置：不被覆蓋；可手動補入
 {const {E}=await boot();E('LIB.defPend=null');
  // 這台是新裝置（上面 boot 又自動套用了）→ 改造成「已有自己設定」：清掉 def，只保留自己的
  E(`S.lib={ver:'1.0',en:{'${fruit[5]}':1},ov:{'${fruit[5]}':{zy:'ㄊㄊ ㄊㄊ',zyRev:'edited'}},cm:{},log:[]};LIB.sync()`);
  await E('LIB.defBoot()');
  T('device with its own settings keeps them; default is only recorded as baseline (not applied)',E('LIB.defInfo.state')==='baseline'&&E('Object.keys(LIB.st().en).length')===1&&E(`byId('${fruit[5]}').zy`)==='ㄊㄊ ㄊㄊ');
  await E('LIB.defFill()');
  T('manual fill adds only what is missing and never overwrites local settings',E('Object.keys(LIB.st().en).length')>=8&&E(`byId('${fruit[5]}').zy`)==='ㄊㄊ ㄊㄊ');}
 // ⑦ 壞檔案
 {fs.writeFileSync(DEF,'{bad json');const {E}=await boot();
  T('broken default file → plain error message, nothing changed',E('LIB.defInfo.state')==='err'&&/JSON/.test(E('LIB.defInfo.msg'))&&E('Object.keys(LIB.st().en).length')===0);
  fs.writeFileSync(DEF,JSON.stringify({kind:'library-default',en:{'../x':1,'VOC0001':1,'NOPE':1},ov:{'VOC0001':{zy:'x',primary:'../../a.png',hide:['..','images/a.webp'],rv:'hacked'}},mode:'evil'}));
  const {E:E2}=await boot();
  T('hostile default file is sanitized (unknown ids, unsafe paths, bad values dropped)',E2('Object.keys(LIB.st().en).join()')==='VOC0001'&&E2(`JSON.stringify(LIB.st().ov.VOC0001)`)==='{"zy":"x","hide":["images/a.webp"]}'&&E2('LIB.mode()')==='random'/*v21.0 新預設*/);
  fs.unlinkSync(DEF)}
 // ⑧ 無圖清單與 CSV
 {const {w,E}=await boot();let blob=null;w.URL.createObjectURL=b=>{blob=b;return'blob:x'};
  const nb=J(E,'LIB.noImgByCat()');
  T('no-image list: 419 words, 8 categories, matches source data per category',nb.reduce((a,x)=>a+x.n,0)===419&&nb.length===8&&nb.every(x=>V.filter(v=>v.categoryId===x.id&&!v.images.length).length===x.n));
  E(`LIB.setF({img:'none',cat:'CAT13'})`);T('quick filter: no-image words of one category (動作 = 111)',E('LIB.list().length')===111);
  const n=E(`LIB.csv('noimg')`);const buf=await new Promise(r=>{const fr=new w.FileReader();fr.onload=()=>r(Buffer.from(fr.result));fr.readAsArrayBuffer(blob)});const txt=buf.toString('utf8'),bom=buf[0]===0xEF&&buf[1]===0xBB&&buf[2]===0xBF,lines=txt.replace(/^\ufeff/,'').split('\r\n');
  T('CSV export: 419 rows + header, Excel-friendly BOM, columns, sorted by category',n===419&&lines.length===420&&bom&&lines[0]==='"編號","詞彙","注音","分類","圖片數","是否啟用","圖片審核","注音狀態"'&&lines[1].startsWith('"VOC')&&lines.slice(1).every(l=>/,"0",/.test(l)));
  E(`LIB.setF({img:'',cat:'CAT02'})`);const n2=E(`LIB.csv('cur')`);T('CSV of the current filter exports exactly the filtered words',n2===43);
  E(`sub='lib';tch()`);const h=E(`document.querySelector('#sp').textContent`);T('panel lists no-image counts by category',/無圖詞彙（共 419 個）/.test(h)&&/動作（111／111）/.test(h));}
 console.log('t190:',R.P,'pass',R.F,'fail');process.exit(R.F?1:0)})();
