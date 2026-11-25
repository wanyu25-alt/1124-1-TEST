const {chromium}=require('playwright');
const URL='http://localhost:8124/1124-1-TEST/';let P=0,F=0;const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(URL);await p.waitForFunction(()=>typeof UI!=='undefined'&&S&&S.cards&&S.cards.length,null,{timeout:40000});await p.waitForTimeout(800);
await p.evaluate(()=>{S.set.music=false;tab(5);const i=document.createElement('input');i.type='number';i.id='vk_probe';document.querySelector('#mid .st3').appendChild(i)});await p.waitForTimeout(400);
await p.focus('#vk_probe');await p.waitForTimeout(200);
await p.setViewportSize({width:390,height:430});await p.waitForTimeout(500);   // 模擬虛擬鍵盤佔掉下半部
const k=await p.evaluate(()=>{const e=document.querySelector('#vk_probe').getBoundingClientRect();return {cls:document.body.className,kb:UI.m.kb,H:innerHeight,inputTop:Math.round(e.top),inputBottom:Math.round(e.bottom),navH:document.querySelector('nav').getBoundingClientRect().height,hscroll:document.documentElement.scrollWidth>innerWidth}});
T('虛擬鍵盤彈出（模擬）：偵測為 kb-open，輸入欄仍在可見範圍，無橫向捲動',k.kb&&/kb-open/.test(k.cls)&&k.inputBottom<=k.H&&!k.hscroll,k);
await p.setViewportSize({width:390,height:844});await p.waitForTimeout(500);await p.evaluate(()=>document.activeElement.blur());await p.waitForTimeout(300);
T('鍵盤收起後恢復',await p.evaluate(()=>!UI.m.kb&&!/kb-open/.test(document.body.className)),null);
// 安全區域：meta 與 CSS
const meta=await p.evaluate(()=>document.querySelector('meta[name=viewport]').content);T('viewport-fit=cover 與 interactive-widget',/viewport-fit=cover/.test(meta)&&/interactive-widget=resizes-content/.test(meta),meta);
const css=await p.evaluate(()=>[...document.styleSheets].flatMap(s=>[...s.cssRules]).map(r=>r.cssText).join('\n'));
T('CSS 使用 env(safe-area-inset-*)',/safe-area-inset-bottom/.test(css)&&/safe-area-inset-left/.test(css),null);
T('無頁面錯誤',errs.length===0,errs);console.log('PASS',P,'FAIL',F);await b.close()})();
