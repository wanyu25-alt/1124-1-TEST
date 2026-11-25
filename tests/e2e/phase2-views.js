// 第02階段版面（Chromium 模擬視窗，不是真機）：六站地圖、題數／難度設定、完成畫面、設定頁
const {chromium}=require('playwright');
const SZ=[['phoneP',360,640,1],['phoneP2',390,844,1],['phoneL',844,390,1],['tabP',768,1024,1],['tabL',1024,768,1],['tabL2',1180,820,1],['desk',1440,900,0]];
const only=process.argv[2]?process.argv[2].split(','):null;let fails=0;
(async()=>{const b=await chromium.launch({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
for(const [n,w,h,t] of SZ){if(only&&!only.includes(n))continue;
 const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:!!t,isMobile:!!t,deviceScaleFactor:1});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:8124/1124-1-TEST/');await p.waitForFunction(()=>typeof UI!=='undefined'&&typeof FL!=='undefined'&&S&&S.cards&&S.cards.length,null,{timeout:40000});await p.waitForTimeout(800);
 await p.evaluate(()=>{S.set.music=false;S.set.sound=false;V2.prepDone=true;UI.micHide=true});
 const views=[['map',()=>UI.pick('integ')],['setup',()=>{UI.pick('quiet');FL.open(1)}],['setupAdv',()=>{UI.pick('quiet');FL.open(1);document.querySelector('.fadv').open=true}],['settings',()=>tab(5)],['done',async()=>{UI.pick('quiet');FL.open(1);FL.setN(5);FL.setStar(1);FL.mem().range='pick';FL.mem().cat='all';FL.go();for(let i=0;i<5;i++){ok();G.i++;if(G.i<G.n)ask()}arrive()}]];
 for(const [vn,fn] of views){await p.evaluate(fn);await p.waitForTimeout(vn==='done'?2500:500);
  const r=await p.evaluate(()=>{const W=innerWidth,H=innerHeight,bad=[];document.querySelectorAll('#mid *, nav *, #arr *').forEach(e=>{const r=e.getBoundingClientRect();if(r.width&&(r.right>W+1||r.left<-1)&&getComputedStyle(e).position!=='fixed'&&!e.closest('.arrsc'))bad.push((e.className||e.tagName)+':'+Math.round(r.left)+'-'+Math.round(r.right))});
   const small=[...document.querySelectorAll('#mid button,#arr button,#mid select')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&(r.height<40||r.width<40)&&getComputedStyle(e).display!=='none'}).map(e=>(e.textContent||e.id).slice(0,10));
   return{hscroll:document.documentElement.scrollWidth>W+1,bad:bad.slice(0,4),small:small.slice(0,5)}});
  const ok=!r.hscroll&&!r.bad.length;if(!ok)fails++;console.log(ok?'PASS':'FAIL',n,vn,JSON.stringify(r));
  await p.screenshot({path:`/tmp/e2e/p9_${n}_${vn}.png`});await p.evaluate(()=>{const a=document.getElementById('arr');if(a)a.remove();try{leave()}catch(e){}})}
 console.log(n,'pageerrors',errs.slice(0,2));if(errs.length)fails++;await ctx.close()}
await b.close();console.log(fails?'E2E FAILURES '+fails:'E2E OK');process.exit(fails?1:0)})();
