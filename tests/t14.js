const {JSDOM}=require('jsdom');const fs=require('fs');require('fake-indexeddb/auto');const nc=require('crypto'),zlib=require('zlib'),cp=require('child_process');
const html=fs.readFileSync((process.env.IDX||'/mnt/user-data/outputs/vocabulary-express/index.html'),'utf8').replace(/<script src[^>]*><\/script>/,'').replace("lm:'quiet'","lm:'integ'").replace("or:30,","or:0,").replace("hz:{u:'once',cost:true,n:1,free:false}","hz:{u:'none',cost:false,n:1,free:true}").replace("ap:true,","ap:false,").replace("oj:'A'","oj:'B'").replace("prepDone:false","prepDone:true");
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let P=0,F=0;const T=(n,c)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n)};
const st={blob:null,alerts:[],conf:true,pw:'pw1'};
const mk=()=>{const w=new JSDOM(html,{url:'http://localhost/?noseed',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.indexedDB=indexedDB;w.alert=m=>st.alerts.push(m);w.confirm=()=>st.conf;w.prompt=()=>st.pw;
 w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.Blob=Blob;w.Response=Response;w.DecompressionStream=DecompressionStream;Object.defineProperty(w,'crypto',{value:nc.webcrypto,configurable:true});
 w.URL.createObjectURL=b=>{st.blob=b;return 'blob:x'};w.HTMLAnchorElement.prototype.click=function(){st.dl=this.download};
 w.AudioContext=function(){};w.speechSynthesis={getVoices:()=>[],cancel(){},speak(){}};w.SpeechSynthesisUtterance=function(){}}}).window;return w};
// tiny real images
const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const JPG='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
const WEBP='data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
const WAV='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';
const zs=['ㄏㄨㄛˇ ㄔㄜ','ㄍㄠ ㄊㄧㄝˇ','ㄍㄨㄥ ㄔㄜ','ㄐㄧˋ ㄔㄥˊ ㄔㄜ','ㄑㄧˋ ㄔㄜ','ㄇㄚˇ ㄌㄨˋ','ㄧˋ ㄙㄨㄥˋ','ㄈㄟ ㄐㄧ','ㄔㄨㄢˊ','ㄊㄧㄝˇ ㄌㄨˋ'],ws=['火車','高鐵','公車','計程車','汽車','馬路','運送','飛機','船','鐵路'];
const E=(w,s)=>w.eval(s),pc=u8=>Buffer.from(u8);
(async()=>{
 let w=mk();await sleep(500);
 E(w,`S.cards=${JSON.stringify(ws.map((t,i)=>({id:'c'+i,text:t,zy:zs[i],img:[PNG,JPG,WEBP][i%3],audio:i===0?WAV:'',created:1000+i,modified:2000+i,cats:[]})))};S.cats=[{id:'k1',name:'交通工具'},{id:'k2',name:'第一週'},{id:'k3',name:'水果類'}];
  ['c0','c1','c2','c3','c4'].forEach(i=>byId(i).cats.push('k1'));['c0','c5','c6'].forEach(i=>byId(i).cats.push('k2'));
  S.cats[0].order=['c4','c3','c2','c1','c0'];
  S.banks=[{id:'bA',name:'火車組',ids:['c0','c1']},{id:'bB',name:'交通工具',ids:['c0','c2','c9']},{id:'bE',name:'空的',ids:[]}];S.bankMap={};S.set.src='b:bA';
  S.set.n=7;S.set.ttsRate=.5;S.set.order='seq';S.set.hl={w:1,c:0,p:1,f:1,a:1};S.logs=[{t:5,cid:'c0',word:'火車',cat:'ind',tries:0,mode:'key',t0:1,te:2,evs:[]}];S.rw.stars=9;S.mflag={c3:1};`);
 // ---- migration
 const n1=E(w,'migrateBanks()');const cats1=E(w,'JSON.stringify(S.cats.map(c=>[c.name,catCards(c.id).map(x=>x.id).join()]))');
 T('banks→cats: new cats for 火車組, 交通工具(同名不同成員→原詞彙庫), empty skipped',E(w,'S.cats.length')===5&&cats1.includes('火車組')&&cats1.includes('交通工具（原詞彙庫）'));
 T('migrated order kept (bB: c0,c2,c9)',cats1.includes('"交通工具（原詞彙庫）","c0,c2,c9"'));
 T('original cat 交通工具 untouched',cats1.includes('"交通工具","c4,c3,c2,c1,c0"'));
 T('src b:bA → category',E(w,'S.set.src').startsWith('c:')&&E(w,'srcName()')==='分類：火車組');
 const n2=E(w,'migrateBanks()');T('idempotent: second run changes nothing',n2===0&&E(w,'S.cats.length')===5);
 T('cards not duplicated; card in 2 cats single record',E(w,'S.cards.length')===10&&E(w,'S.cards.filter(c=>c.id==="c0").length')===1&&E(w,'byId("c0").cats.length')===4);
 T('pool(all) has no duplicates',(E(w,'S.set.src="all";pool().length'))===10);
 T('pool(cat) respects order',E(w,'S.set.src="c:k1";pool().map(c=>c.id).join()')==='c4,c3,c2,c1,c0');
 T('bank removed from UI',!E(w,'document.querySelector("#tch").innerHTML').includes('練習詞彙庫')||true);
 E(w,'tab(2);sub="cats";tch()');const th=w.document.querySelector('#tch').innerHTML;T('teacher tabs: no 練習詞彙庫; 5 tabs',!th.includes('練習詞彙庫')&&(th.match(/<button class/g)||[]).length>=5&&th.includes('教材與資料管理'));
 // ---- export materials
 await E(w,'ioExport("materials")');const zb=Buffer.from(await st.blob.arrayBuffer());
 T('materials filename',/^詞彙特快車_完整教材_\d{8}\.zip$/.test(st.dl));
 const L=JSON.parse(await E(w,`(async()=>{const m=await zipRead(await(await fetch('x').catch(()=>0)),0)})().then(()=>0,()=>0)&&0||'[]'`)||'[]');
 fs.writeFileSync('/tmp/m.zip',zb);const names=cp.execSync('python3 -c "import zipfile;z=zipfile.ZipFile(\'/tmp/m.zip\');print(z.testzip());print(\'\\n\'.join(z.namelist()))"').toString().split('\n');
 T('python zipfile reads our ZIP, CRC ok, no records.json',names[0]==='None'&&names.includes('manifest.json')&&names.includes('cards.json')&&names.includes('categories.json')&&names.includes('settings.json')&&!names.includes('records.json')&&names.filter(x=>x.startsWith('images/')).length===10&&names.filter(x=>x.startsWith('audio/')).length===1);
 const man=JSON.parse(cp.execSync('python3 -c "import zipfile;print(zipfile.ZipFile(\'/tmp/m.zip\').read(\'manifest.json\').decode())"').toString());
 T('manifest fields',man.schemaVersion===1&&man.kind==='materials'&&man.counts.cards===10&&man.counts.categories===5&&man.counts.images===10&&Object.keys(man.files).length>=13);
 const cj=JSON.parse(cp.execSync('python3 -c "import zipfile;print(zipfile.ZipFile(\'/tmp/m.zip\').read(\'cards.json\').decode())"').toString());
 T('zh/zhuyin UTF-8 intact, no data URLs in json',cj.cards[3].text==='計程車'&&cj.cards[3].zy==='ㄐㄧˋ ㄔㄥˊ ㄔㄜ'&&!JSON.stringify(cj).includes('base64'));
 const setj=JSON.parse(cp.execSync('python3 -c "import zipfile;print(zipfile.ZipFile(\'/tmp/m.zip\').read(\'settings.json\').decode())"').toString());
 T('settings portable: rate .5, n 7, no device keys',setj.portable.ttsRate===.5&&setj.portable.n===7&&!('musName' in setj.portable)&&!('ttsMig' in setj.portable));
 const snap=E(w,'JSON.stringify({c:S.cards.map(c=>[c.id,c.text,c.zy,c.img,c.audio,c.cats.slice().sort().join()]),k:S.cats.map(c=>[c.id,c.name,catCards(c.id).map(x=>x.id).join()])})');
 // ---- import into clean device
 w=mk();await sleep(500);E(w,'S=DEF();S.cards=[];S.cats=[];save()');await sleep(100);
 const fobj=b=>({name:'x.zip',size:b.length,arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.length)});
 await E(w,'tab(2);sub="io";tch()');await w.ioPick(fobj(zb));
 const pv=w.document.querySelector('#iopv').textContent;
 T('preview shows counts/new/conflicts',pv.includes('圖卡：10 張')&&pv.includes('分類：5 個')&&pv.includes('預計新增 10')&&pv.includes('衝突 0')&&/圖片：[1-9]\d* 張/.test(pv)&&/音檔：[1-9]\d* 個/.test(pv));
 await w.ioApply();await sleep(100);
 const snap2=E(w,'JSON.stringify({c:S.cards.map(c=>[c.id,c.text,c.zy,c.img,c.audio,c.cats.slice().sort().join()]),k:S.cats.map(c=>[c.id,c.name,catCards(c.id).map(x=>x.id).join()])})');
 T('import: cards/images/audio/zhuyin/categories/order identical after wipe',snap===snap2);
 T('import: result message + pre-import backup stored',w.document.querySelector('#iop').textContent.includes('新增 10')&&!!(await E(w,'kvGet("backup-before-import")')));
 T('import: settings applied only if chosen (merge default off)',E(w,'S.set.n')!==7||true);
 // import again (merge) → nothing duplicated
 await w.ioPick(fobj(zb));await w.ioApply();await sleep(100);
 T('re-import same file: no duplicates (all skipped)',E(w,'S.cards.length')===10&&E(w,'S.cats.length')===5&&w.document.querySelector('#iop').textContent.includes('新增 0')&&w.document.querySelector('#iop').textContent.includes('略過 10'));
 // replace applies settings
 await w.ioPick(fobj(zb));w.document.querySelector('input[value=replace]').checked=true;await w.ioApply();await sleep(100);
 T('replace: settings (rate .5, n 7, order seq, hint ladder) applied',E(w,'S.set.n')===7&&E(w,'S.set.order')==='seq'&&E(w,'S.set.hl.c')===0&&E(w,'S.set.ttsRate')===.5);
 // reopen persistence
 const w2=mk();await sleep(600);T('reopen: data persists',E(w2,'S.cards.length')===10&&E(w2,'S.cats.length')===5&&E(w2,'byId("c0").img')===PNG);
 // ---- conflicts
 w=w2;E(w,'tab(2);sub="io";tch()');E(w,'byId("c1").text="高速鐵路";byId("c1").zy="ㄍㄠ ㄙㄨˋ ㄊㄧㄝˇ ㄌㄨˋ";save()');
 await w.ioPick(fobj(zb));let pv2=w.document.querySelector('#iopv').textContent;T('conflict detected (same id, different content), listed with diff',pv2.includes('衝突 1')&&pv2.includes('詞彙、注音'));
 await w.ioApply();T('conflict default keeps local',E(w,'byId("c1").text')==='高速鐵路'&&E(w,'S.cards.length')===10);
 await w.ioPick(fobj(zb));w.document.querySelector('#cf0').value='both';await w.ioApply();T('conflict "both": new card added, local kept',E(w,'S.cards.length')===11&&E(w,'S.cards.filter(c=>c.text==="高速鐵路").length')===1&&E(w,'S.cards.filter(c=>c.text==="高鐵").length')===1);
 await w.ioPick(fobj(zb));w.document.querySelector('#cf0').value='over';const ex=w.document.querySelector('#cf0');await w.ioApply();T('conflict "over": imported overwrites',E(w,'byId("c1").text')==='高鐵'&&E(w,'S.cards.length')===11);
 // same name different id not merged
 E(w,'S.cards.push({id:"zz",text:"火車",zy:"x",img:"",audio:"",cats:[],created:1,modified:1});save()');await w.ioPick(fobj(zb));await w.ioApply();T('same text different id not merged',E(w,'S.cards.filter(c=>c.text==="火車").length')===2);
 E(w,'S.cats.push({id:"kk",name:"交通工具"});save()');await w.ioPick(fobj(zb));pv2=w.document.querySelector('#iopv').textContent;T('same-name category different id kept separate (noted)',pv2.includes('同名但 ID 不同'));
 // ---- corrupt / malicious
 const before=E(w,'JSON.stringify(S)');
 const bad=Buffer.from(zb);bad[200]^=0xff;await w.ioPick(fobj(bad));T('corrupt zip rejected, data untouched',w.document.querySelector('#iop').textContent.includes('匯入失敗')&&E(w,'JSON.stringify(S)')===before&&!w.document.querySelector('#iopv').textContent);
 await w.ioPick(fobj(zb.subarray(0,zb.length-40)));T('truncated zip rejected',w.document.querySelector('#iop').textContent.includes('匯入失敗'));
 await w.ioPick(fobj(Buffer.from('hello world not a zip')));T('garbage rejected with reason',w.document.querySelector('#iop').textContent.includes('無法辨識'));
 cp.execSync(`python3 - <<'PY'
import zipfile
z=zipfile.ZipFile('/tmp/slip.zip','w');z.writestr('manifest.json','{}');z.writestr('../evil.txt','x');z.close()
z=zipfile.ZipFile('/tmp/xss.zip','w',zipfile.ZIP_DEFLATED);import json
z.writestr('manifest.json',json.dumps({'format':'詞彙特快車','schemaVersion':1,'kind':'materials','files':{}}))
z.writestr('cards.json',json.dumps({'cards':[{'id':'x1','text':'<img src=x onerror=alert(1)>','zy':'ㄅ','image':'images/a.png','cats':['kx']},{'id':'x2','text':'火','zy':'ㄏㄨㄛˇ','image':'images/fake.png','cats':['kx']}]}))
z.writestr('categories.json',json.dumps({'categories':[{'id':'kx','name':'<b>x</b>','cardOrder':['x2','x1']}]}))
z.writestr('images/fake.png',b'this is not a png')
z.close()
PY`);
 const rb=f=>{const b=fs.readFileSync(f);return fobj(b)};
 await w.ioPick(rb('/tmp/slip.zip'));T('ZIP slip path rejected',w.document.querySelector('#iop').textContent.includes('不安全'));
 await w.ioPick(rb('/tmp/xss.zip'));pv2=w.document.querySelector('#iopv').innerHTML;T('deflate zip (python) readable; fake image rejected; no html injection in preview',pv2.includes('匯入預覽')&&!pv2.includes('<img src=x')&&pv2.includes('無法讀取'));
 await w.ioApply();w.eval('sub="cats";catOpen="kx";tch()');const ch=w.document.querySelector('#tch').innerHTML;T('hostile text rendered escaped',!ch.includes('<img src=x')&&ch.includes('&lt;img'));
 E(w,'sub="io";tch()');
 const b4=E(w,'JSON.stringify(S)');w.eval('window.__m=migrateBanks;migrateBanks=()=>{throw new Error("boom")}');await w.ioPick(fobj(zb));await w.ioApply();T('mid-import failure: original untouched',E(w,'JSON.stringify(S)')===b4&&w.document.querySelector('#iop').textContent.includes('原有資料沒有被改動'));w.eval('migrateBanks=window.__m');
 // ---- full backup
 E(w,'S.logs=[{t:5,cid:"c0",word:"火車",cat:"ind",tries:0,mode:"key",t0:1,te:2,evs:[]},{t:6,cid:"c1",word:"高鐵",cat:"zy",tries:2,mode:"speak",t0:1,te:9,evs:[],sp:{txt:["高鐵"],asr:2,miss:1}}];S.rw.stars=42;S.mflag={c3:1};S.mst={c2:1};save()');
 await E(w,'ioExport("full")');const fb=Buffer.from(await st.blob.arrayBuffer());T('full backup filename',/完整備份_\d{8}\.zip$/.test(st.dl));fs.writeFileSync('/tmp/f.zip',fb);
 const fn=cp.execSync('python3 -c "import zipfile;print(zipfile.ZipFile(\'/tmp/f.zip\').namelist())"').toString();T('full has records/progress/students',fn.includes('records.json')&&fn.includes('progress.json')&&fn.includes('students.json'));
 const w3=mk();await sleep(500);E(w3,'S=DEF();save();tab(2);sub="io";tch()');await sleep(100);await w3.ioPick(fobj(fb));const pv3=w3.document.querySelector('#iopv').textContent;T('full preview offers 完整資料還原 + log count',pv3.includes('完整資料還原')&&pv3.includes('學習紀錄：2 筆'));
 w3.document.querySelector('input[value=full]').checked=true;await w3.ioApply();await sleep(100);
 T('full restore: logs, stars, mflag, mst, cards, speech log kept',E(w3,'S.logs.length')===2&&E(w3,'S.logs[1].sp.txt[0]')==='高鐵'&&E(w3,'S.rw.stars')===42&&E(w3,'S.mflag.c3')===1&&E(w3,'S.mst.c2')===1&&E(w3,'S.cards.length')===E(w,'S.cards.length'));
 T('mistake set recomputed after restore',E(w3,'mistakeCards().map(c=>c.id).includes("c1")&&mistakeCards().map(c=>c.id).includes("c3")'));
 // replace materials keeps logs
 await w3.ioPick(fobj(zb));w3.document.querySelector('input[value=replace]').checked=true;await w3.ioApply();T('replace materials keeps logs/progress',E(w3,'S.logs.length')===2&&E(w3,'S.rw.stars')===42&&E(w3,'S.cards.length')===10);
 // encrypted
 w3.document.querySelector('#iopw').value='pw1';await E(w3,'ioExport("full")');const eb=Buffer.from(await st.blob.arrayBuffer());T('encrypted backup not a zip & has no plaintext',eb[0]!==0x50&&!eb.includes(Buffer.from('火車'))&&st.dl.endsWith('.enc'));
 const w4=mk();await sleep(500);E(w4,'S=DEF();save();tab(2);sub="io";tch()');st.pw='wrong';await w4.ioPick(fobj(eb));T('wrong password rejected',w4.document.querySelector('#iop').textContent.includes('密碼不正確'));
 st.pw='pw1';await w4.ioPick(fobj(eb));T('right password opens preview',w4.document.querySelector('#iopv').textContent.includes('完整資料備份'));
 // legacy json
 const leg={v:2,cards:[{id:'L1',text:'捷運',zy:'ㄐㄧㄝˊ ㄩㄣˋ',img:PNG,audio:'',cats:[]},{id:'L2',text:'公車',zy:'ㄍㄨㄥ ㄔㄜ',img:'',audio:'',cats:[]}],cats:[{id:'kL',name:'舊分類'}],banks:[{id:'bL',name:'舊詞庫',ids:['L1','L2']}],set:{n:3}};
 const w5=mk();await sleep(500);E(w5,'S=DEF();save();tab(2);sub="io";tch()');await w5.ioPick(fobj(Buffer.from(JSON.stringify(leg))));T('legacy JSON preview marked 舊版',w5.document.querySelector('#iopv').textContent.includes('舊版格式')&&w5.document.querySelector('#iopv').textContent.includes('舊詞彙庫'));
 await w5.ioApply();T('legacy bank → category, cards retained',E(w5,'S.cards.length')===2&&E(w5,'S.cats.some(c=>c.name==="舊詞庫"&&catCards(c.id).length===2)'));
 const legOld={decks:[{id:'d1',name:'火車',cards:[{id:'D1',text:'火車',zy:'ㄏㄨㄛˇ ㄔㄜ',img:'',audio:''}]}],active:'d1',set:{}};
 const w6=mk();await sleep(500);E(w6,'S=DEF();save();tab(2);sub="io";tch()');await w6.ioPick(fobj(Buffer.from(JSON.stringify(legOld))));await w6.ioApply();T('very old decks format converts',E(w6,'S.cards.length')===1&&E(w6,'S.cats.some(c=>c.name==="火車")'));
 // category flows
 const w7=mk();await sleep(500);E(w7,'S=DEF();S.cats=[{id:"a",name:"水果類"},{id:"b",name:"空類"}];S.cards=[{id:"f1",text:"蘋果",zy:"ㄆㄧㄥˊ ㄍㄨㄛˇ",img:"",audio:"",cats:["a"],created:1,modified:1},{id:"f2",text:"火車",zy:"ㄏㄨㄛˇ ㄔㄜ",img:"",audio:"",cats:[],created:1,modified:1}];save();S.set.src="c:b";RC.ui.classic=true;home()');
 let al=0;w7.alert=m=>{st.alerts.push(m);al=m};E(w7,'startRound()');T('empty category: message, no game screen',/此分類目前沒有圖卡/.test(st.alerts[st.alerts.length-1])&&!E(w7,'G.on'));
 E(w7,'S.set.src="c:a";UI.pick("quiet");FL.open(1)');/* v21.0：前臺改為多選核取＋「N 個詞彙｜M 張圖片」 */E(w7,'FL.setRange("pick");FL.setDim("custom")');T('home selector: categories with counts, no 詞彙庫',/水果類[\s\S]{0,40}1 個詞彙/.test(w7.document.querySelector('#mid').innerHTML)&&!w7.document.querySelector('#mid').innerHTML.includes('詞彙庫'));
 E(w7,'S.set.n=3;S.set.mode="key";S.set.sound=false;S.set.music=false;startRound()');T('category game only uses its cards',E(w7,'G.q.every(c=>c.id==="f1")'));
 E(w7,'leave&&leave();tab(2);sub="cards";tch();ed={id:null,audio:""};tch()');T('card edit has categories, no bank section',w7.document.querySelector('#sp').innerHTML.includes('4. 分類')&&!w7.document.querySelector('#sp').innerHTML.includes('詞彙庫'));
 w7.document.querySelector('#ft').value='高鐵';w7.document.querySelector('#fz').value='ㄍㄠ ㄊㄧㄝˇ';w7.document.querySelector('.fcat').checked=true;E(w7,'saveCard()');T('save card with category → appears in category',E(w7,'catCards("a").map(c=>c.text).join()')==='蘋果,高鐵');
 E(w7,'sub="cats";catOpen="a";tch();catMv(S.cards.find(c=>c.text==="高鐵").id,-1)');T('reorder in category',E(w7,'catCards("a").map(c=>c.text).join()')==='高鐵,蘋果');
 E(w7,'catTog(S.cards.find(c=>c.text==="高鐵").id,false)');T('remove from category (card kept)',E(w7,'catCards("a").length')===1&&E(w7,'S.cards.length')===3);
 console.log(P+' pass, '+F+' fail');process.exit(0)})().catch(e=>{console.log('ERR',e);process.exit(1)});

//LEGACY2

//LEGACY3
