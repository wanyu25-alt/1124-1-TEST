const {chromium}=require('playwright');
const SZ=[['phoneP',360,640,1],['phoneP2',390,844,1],['phoneL',844,390,1],['phoneL2',667,375,1],['tabP',768,1024,1],['tabL',1024,768,1],['tabL2',1180,820,1],['lap',1366,768,0],['desk',1920,1080,0]];
const only=process.argv[2]?process.argv[2].split(','):null;const veh=process.argv[3]||'bike';
(async()=>{const b=await chromium.launch({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
for(const [n,w,h,t] of SZ){if(only&&!only.includes(n))continue;
 const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:!!t,isMobile:!!t});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:8124/1124-1-TEST/');await p.waitForFunction(()=>typeof UI!=='undefined'&&S&&S.cards&&S.cards.length,null,{timeout:40000});await p.waitForTimeout(800);
 await p.evaluate((v)=>{S.set.music=false;S.set.sound=false;S.set.hz={...(S.set.hz||{}),free:true};V2.prepDone=true;UI.micHide=true;S.set.n=5;UI.pick(v==='hsr'?'oral':'quiet');goV(v)},veh);await p.waitForTimeout(2500);
 const r=await p.evaluate(()=>{const W=innerWidth,H=innerHeight,q=s=>document.querySelector(s),rc=e=>e?e.getBoundingClientRect():null;
  const kb=[...document.querySelectorAll('.tkb')].map(rc),out=kb.filter(r=>r.right>W+1||r.left<-1||r.bottom>H+1);
  const pic=rc(q('#pic')),bot=rc(q('#bot')),mid=rc(q('#mid')),sc=rc(q('#scene')),cap=rc(q('#cap'));
  const m=q('#mid');const inter=(a,b)=>a&&b&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
  return {tk:document.body.classList.contains('tk'),cls:document.body.className,keys:kb.length,keysOut:out.length,minKeyW:kb.length?Math.round(Math.min(...kb.map(r=>r.width))):0,minKeyH:kb.length?Math.round(Math.min(...kb.map(r=>r.height))):0,picVis:pic?[Math.round(pic.top),Math.round(pic.bottom),Math.round(pic.width)]:null,picOverBot:inter(pic,bot),botTop:bot&&Math.round(bot.top),botBottom:bot&&Math.round(bot.bottom),H,sceneH:Math.round(sc.height),midScroll:m.scrollHeight>m.clientHeight+2,hscroll:document.documentElement.scrollWidth>W,docScroll:document.documentElement.scrollHeight>H+1,nextBtns:[...document.querySelectorAll('#bot button')].filter(b=>b.getBoundingClientRect().bottom>H+1).length}});
 console.log(n,JSON.stringify(r),errs.slice(0,2));
 await p.screenshot({path:`/tmp/e2e/p8g_${veh}_${n}.png`});await ctx.close()}
await b.close()})();
