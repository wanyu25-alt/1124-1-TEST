const {chromium}=require('playwright');
const URL='http://localhost:8124/1124-1-TEST/';let P=0,F=0;const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
(async()=>{const b=await chromium.launch({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
const ctx=await b.newContext({viewport:{width:820,height:1180},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(URL);await p.waitForFunction(()=>typeof UI!=='undefined'&&S&&S.cards&&S.cards.length&&S.lrn,null,{timeout:40000});await p.waitForTimeout(800);
await p.evaluate(()=>{S.set.music=false;S.set.sound=false;S.set.hz={...(S.set.hz||{}),free:true};V2.prepDone=true;UI.micHide=true;S.set.n=3;save();UI.pick('quiet');goV('bike')});await p.waitForTimeout(2500);
const a=await p.evaluate(()=>({tk:document.body.classList.contains('tk'),keys:document.querySelectorAll('.tkb').length,cap:!!document.querySelector('#cap'),m:UI.m}));
T('平板（觸控、無滑鼠）自動顯示觸控注音鍵盤',a.tk&&a.keys===43&&!a.cap,a);
// 外接實體鍵盤：按下實體鍵（ㄅ=數字1）
const first=await p.evaluate(()=>({sym:K.seq[0][0],rid:G.rid,i:G.i,w:G.cur.text}));
await p.keyboard.press('Digit1');await p.waitForTimeout(400);
const b1=await p.evaluate(()=>({hw:UI.hw,tk:document.body.classList.contains('tk'),keys:document.querySelectorAll('.tkb').length,cap:!!document.querySelector('#cap'),rid:G.rid,i:G.i,on:G.on,cls:document.body.className}));
T('偵測到實體鍵盤後切換為實體輸入，題目不重來',b1.hw&&!b1.tk&&b1.keys===0&&b1.cap&&b1.rid===first.rid&&b1.i===first.i&&b1.on,b1);
// 之後用實體鍵盤打一整題
const ans=await p.evaluate(()=>{const inv={};for(const[c,s]of Object.entries(ZK))inv[s]=c;return K.seq.flat().map(c=>c===' '?'Space':inv[c])});
for(const code of ans){await p.keyboard.press(code);await p.waitForTimeout(120)}
await p.waitForTimeout(2200);
const c1=await p.evaluate(()=>({done:G.done,recs:S.recs.length,stars:S.rw.stars,i:G.i}));
T('實體鍵盤可完成作答並產生紀錄與星星',c1.done>=1&&c1.recs>=1&&c1.stars>=1,c1);
// 規則（單元）：有觸控也有滑鼠的電腦→實體鍵盤；有實體鍵盤旗標→不顯示觸控
const u=await p.evaluate(()=>{UI.hw=false;S.set.input='phys';S.set.inputPicked=false;const o=UI.m;const r={};UI.m={w:1366,h:768,touch:true,fine:true};r.touchLaptop=UI.touchKb();UI.m={w:820,h:1180,touch:true,fine:false};r.tablet=UI.touchKb();UI.hw=true;r.tabletHw=UI.touchKb();UI.hw=false;S.set.input='touch';r.forceTouch=UI.touchKb();S.set.input='phys';S.set.inputPicked=true;r.forcePhys=UI.touchKb();UI.m=o;return r});
T('輸入方式規則：觸控筆電→實體；平板→觸控；平板+實體鍵盤→實體；手動指定優先',u.touchLaptop===false&&u.tablet===true&&u.tabletHw===false&&u.forceTouch===true&&u.forcePhys===false,u);
T('無頁面錯誤',errs.length===0,errs);console.log('PASS',P,'FAIL',F);await b.close()})();
