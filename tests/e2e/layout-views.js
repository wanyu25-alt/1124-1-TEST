const {chromium,devices}=require('playwright');
const SZ=[['phoneP',360,640,1],['phoneP2',390,844,1],['phoneL',844,390,1],['phoneL2',667,375,1],['tabP',768,1024,1],['tabL',1024,768,1],['tabP2',820,1180,1],['tabL2',1180,820,1],['lap',1366,768,0],['desk',1920,1080,0]];
const only=process.argv[2]?process.argv[2].split(','):null;
(async()=>{const b=await chromium.launch({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
for(const [n,w,h,t] of SZ){if(only&&!only.includes(n))continue;
 const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:!!t,isMobile:!!t,deviceScaleFactor:1});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:8124/1124-1-TEST/');await p.waitForFunction(()=>typeof UI!=='undefined'&&S&&S.cards&&S.cards.length,null,{timeout:40000});await p.waitForTimeout(800);
 await p.evaluate(()=>{S.set.music=false;S.set.sound=false;V2.prepDone=true;UI.micHide=false});
 const views=[['home',()=>{UI.view='home';home()}],['mode',()=>UI.pick('quiet')],['settings',()=>tab(5)],['parent',()=>tab(4)]];
 for(const [vn,fn] of views){await p.evaluate(fn);await p.waitForTimeout(500);
  const r=await p.evaluate(()=>{const W=innerWidth,H=innerHeight;const bad=[];document.querySelectorAll('#mid *, nav *').forEach(e=>{const r=e.getBoundingClientRect();if(r.width&&r.right>W+1&&getComputedStyle(e).position!=='fixed'&&!e.closest('[style*="overflow"]'))bad.push((e.id||e.className||e.tagName)+':'+Math.round(r.right))});
   return {hscroll:document.documentElement.scrollWidth>W,bad:bad.slice(0,4),mc:[...document.querySelectorAll('.mc')].map(e=>{const r=e.getBoundingClientRect();return Math.round(r.top)+'-'+Math.round(r.bottom)}),midScroll:(()=>{const m=document.querySelector('#mid');return m.scrollHeight>m.clientHeight+2})()}});
  console.log(n,vn,JSON.stringify(r));
  await p.screenshot({path:`/tmp/e2e/p8_${n}_${vn}.png`})}
 console.log(n,'errs',errs.slice(0,2));await ctx.close()}
await b.close()})();
