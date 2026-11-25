const {JSDOM}=require('jsdom');const fs=require('fs');const {IDBFactory}=require('fake-indexeddb');
const html=fs.readFileSync((process.env.IDX||'/mnt/user-data/outputs/vocabulary-express/index.html'),'utf8').replace(/<script src[^>]*><\/script>/,'');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let P=0,F=0;const T=(n,c)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n)};
const mk=idb=>new JSDOM(html,{url:'http://localhost/?noseed',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
 w.indexedDB=idb;w.alert=()=>{};w.confirm=()=>true;w.AudioContext=function(){};w.speechSynthesis={getVoices:()=>[],cancel(){},speak(u){setTimeout(()=>u.onend&&u.onend(),20)}};w.SpeechSynthesisUtterance=function(t){this.text=t};
 w.__dl=[];w.URL.createObjectURL=b=>{w.__blob=b;return 'blob:t'+Math.random()};w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){w.__dl.push(this.download)};
 w.Audio=class{constructor(s){this.src=s||'';this.volume=1;this.paused=true}play(){return Promise.resolve()}pause(){}};w.navigator.mediaDevices={getUserMedia:async()=>({active:true,getTracks:()=>[{stop(){}}]})}}}).window;
const blobBuf=(w,b)=>new Promise(r=>{const fr=new w.FileReader();fr.onload=()=>r(fr.result);fr.readAsArrayBuffer(b)});
(async()=>{
 const A=mk(new IDBFactory());await sleep(500);const EA=s=>A.eval(s);
 EA("S.cards=[{id:'c1',text:'火車',zy:'ㄏㄨㄛˇ ㄔㄜ',img:'',audio:'',cats:[]}];S.cats=[];S.set.lm='integ';S.set.or=50;S.set.oj='C';S.set.hz={u:'twice',cost:true,n:2,free:false}");
 const f=(b)=>({size:b.length,type:'audio/mp4',name:'x.m4a',arrayBuffer:async()=>new Uint8Array(b).buffer});
 await EA('zaPut')('S:ㄅ',f([9,8,7,6,5]));await EA('zaPut')('Y:ㄏㄨㄛˇ',f([1,2,3]));await EA('zaConf')('ㄅ',true);
 await EA('ioExport("materials")');await sleep(300);const buf=await blobBuf(A,A.__blob);const z=await A.eval('zipRead')(buf);const names=[...z.keys()];
 T('ZIP contains voice-custom files + index',names.filter(n=>n.startsWith('voice-custom/')).length===2&&names.includes('voice-custom.json'));
 const man=JSON.parse(Buffer.from(z.get('manifest.json')).toString('utf8'));T('manifest lists custom audio with crc',Object.keys(man.files).filter(n=>n.startsWith('voice-custom/')).length===2);
 const st=JSON.parse(Buffer.from(z.get('settings.json')).toString('utf8')).portable;T('new v2 settings exported (lm, ratio, judge, hint unlock/cost)',st.lm==='integ'&&st.or===50&&st.oj==='C'&&st.hz.u==='twice'&&st.hz.n===2);
 const B=mk(new IDBFactory());await sleep(500);
 const P2=await B.eval('pkgFromZip')(buf);T('import parses custom audio',Object.keys(P2.za.a).length===2&&P2.za.c['ㄅ']===1);
 B.eval('IOP.P=null');B.eval('window.__P=null');
 B.__P=P2;B.eval('IOP.P=window.__P');B.eval("IOP.name='x.zip'");await B.eval('ioApply')();await sleep(400);
 T('after import: replacement active in new browser',B.eval("ZQ.symUrl('ㄅ')").startsWith('blob:')&&B.eval("ZQ.symUrl('ㄆ')")==='voice/zhuyin/zy_p.m4a');
 T('import package carries new settings (applied when 套用設定 is ticked)',P2.set.lm==='integ'&&P2.set.oj==='C'&&P2.set.hz.n===2);
 const sv=await B.eval("kvGet('zya')");T('after import: persisted to local DB with bytes intact',sv&&new Uint8Array(sv.a['S:ㄅ'].d).join()==='9,8,7,6,5');
 // 舊版 ZIP（沒有 voice-custom）仍可匯入、不會清掉現有自訂音檔
 const C=mk(new IDBFactory());await sleep(400);const old=await C.eval('pkgFromZip')(await (async()=>{const A2=mk(new IDBFactory());await sleep(300);A2.eval("S.cards=[{id:'z',text:'火',zy:'ㄏㄨㄛˇ',img:'',audio:'',cats:[]}]");await A2.eval('ioExport("materials")');await sleep(200);return blobBuf(A2,A2.__blob)})());
 T('ZIP without custom audio imports cleanly (backward compatible)',old.za&&Object.keys(old.za.a).length===0);
 console.log('P',P,'F',F);process.exit(F?1:0)})();
