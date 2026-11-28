// v22.6.7 美術改版第二階段：自然旅行繪本風「預覽主題」（只用 CSS；預設畫面不變）
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const BASE='http://localhost:'+(process.env.E2E_PORT||8124)+'/1124-1-TEST/';let P=0,F=0;
const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x===undefined?null:x).slice(0,700))};
const AS=fs.readFileSync(path.join(__dirname,'lib','audio-stub.js'),'utf8');
const ready=p=>p.waitForFunction(()=>typeof S!=='undefined'&&S.cards&&S.cards.length>=1000&&typeof THEME!=='undefined',null,{timeout:60000}).then(()=>p.waitForTimeout(700));
const CON=`window.__con=(a,b)=>{const L=c=>{const m=c.match(/\\d+(\\.\\d+)?/g).map(Number);return m.slice(0,3).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0)};const x=L(a),y=L(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};`;
(async()=>{const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:1180,height:820}});await ctx.addInitScript({content:AS});await ctx.addInitScript({content:CON});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 /* 一、預設：完全不變 */
 await p.goto(BASE);await ready(p);
 const d0=await p.evaluate(()=>({cls:document.body.classList.contains('th-nature'),css:!!document.getElementById('nj-css'),nav:getComputedStyle(document.querySelector('nav')).backgroundColor,chip:!!document.querySelector('.nj-chip'),ls:localStorage.getItem('vx-theme')}));
 T('T1 預設（網址沒有 ?theme）：沒有主題 class、沒有載入主題樣式，上方選單維持原本深色',!d0.cls&&!d0.css&&!d0.chip&&d0.nav==='rgb(31, 58, 77)'&&d0.ls===null,d0);
 /* 二、開啟預覽 */
 await p.goto(BASE+'?theme=nature');await ready(p);await p.waitForFunction(()=>THEME.ready,null,{timeout:10000});
 const d1=await p.evaluate(()=>{const c=document.querySelector('.nj-chip');return{cls:document.body.classList.contains('th-nature'),ready:THEME.ready,nav:getComputedStyle(document.querySelector('nav')).backgroundColor,bg:getComputedStyle(document.body).backgroundColor,chip:c&&getComputedStyle(c).display,ls:localStorage.getItem('vx-theme')}});
 T('T2 ?theme=nature：套用主題（奶油紙白背景、米白選單），左下角顯示「預覽」標籤，這台裝置記住設定',d1.cls&&d1.ready&&d1.nav==='rgb(233, 229, 214)'&&d1.bg==='rgb(248, 245, 235)'&&d1.chip==='flex'&&d1.ls==='nature',d1);
 await p.goto(BASE);await ready(p);
 T('T3 重新打開網站（網址沒有參數）仍是預覽主題',await p.evaluate(()=>document.body.classList.contains('th-nature')));
 /* 三、文字對比度 ≥ 4.5 */
 const cr=await p.evaluate(async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms)),o={},bgOf=e=>{while(e){const c=getComputedStyle(e).backgroundColor;if(c&&c!=='rgba(0, 0, 0, 0)'&&c!=='transparent')return c;e=e.parentElement}return'rgb(255,255,255)'},chk=(k,e)=>{if(e)o[k]=+__con(getComputedStyle(e).color,bgOf(e)).toFixed(2)};
  chk('nav.on',document.querySelector('nav button.on'));chk('nav',document.querySelector('nav button:not(.on)'));chk('hq',document.querySelector('.hm3 .hq'));
  ['quiet','oral','integ'].forEach(k=>chk('mc-'+k,document.querySelector('.mc-'+k+' .mk')||document.querySelector('.mc-'+k)));
  UI.pick('quiet');await sl(300);FL.open(2);await sl(300);chk('btn.alt',document.querySelector('.btn.alt'));chk('fstar.on',document.querySelector('.fstar.on'));chk('fn.on',document.querySelector('.fn.on'));chk('lmband',document.querySelector('.lmband'));
  FL.setStar(1);await sl(200);document.getElementById('fl_go').click();await sl(800);for(let i=0;i<12&&S.set.mode==='expose';i++){EXP.done();await sl(500)}await sl(1000);
  o.chipInGame=getComputedStyle(document.querySelector('.nj-chip')).display;
  const c0=K.ci+':'+K.si;kPress(K.seq[0][0],'t');await sl(300);o.adv=K.ci+':'+K.si!==c0;const z=document.getElementById('z0_0');chk('zs.ok',z);
  const zs=getComputedStyle(z),za=getComputedStyle(z,'::after');o.ok={bs:zs.borderTopStyle,bc:zs.borderTopColor,after:za.content};
  kPress(K.seq[K.ci][K.si]==='ㄈ'?'ㄅ':'ㄈ','t');await sl(60);const bad=document.querySelector('.zs.bad');o.bad=bad?{bs:getComputedStyle(bad).borderTopStyle,bc:getComputedStyle(bad).borderTopColor}:null;
  const dm=[...document.querySelectorAll('.dm')].find(e=>e.textContent.trim());chk('dm',dm);chk('rep',document.getElementById('rep'));chk('stc',document.getElementById('stc'));
  G.on=false;return o});
 const low=Object.entries(cr).filter(([k,v])=>typeof v==='number'&&v<4.5);
 T('T4 主要文字與底色的對比度都至少 4.5:1（選單、按鈕、模式卡、星級、注音格、提示、再聽一次、星星）',!low.length&&Object.values(cr).filter(v=>typeof v==='number').length>=12,{low,cr});
 T('T5 練習中不顯示「預覽」標籤；注音逐符號輸入照常（打對會前進）',cr.chipInGame==='none'&&cr.adv,cr);
 T('T6 注音格狀態不只靠顏色：正確＝實線深藍框＋✓；錯誤＝虛線橘框',cr.ok.bs==='solid'&&cr.ok.bc==='rgb(35, 71, 107)'&&/✓/.test(cr.ok.after)&&cr.bad&&cr.bad.bs==='dashed'&&cr.bad.bc==='rgb(122, 68, 22)',{ok:cr.ok,bad:cr.bad});
 /* 四、素材索引：目前都是待製作，THEME.src 一律回傳 null（使用原本畫面） */
 const mf=await p.evaluate(async()=>{const m=await THEME.load();return{n:Object.keys(m.assets).length,ready:Object.values(m.assets).filter(a=>a.status==='ready').length,src:THEME.src('rabbit'),src2:THEME.src('不存在')}});
 T('T7 素材索引可讀取（至少 79 個素材 ID）；尚未有圖片時 THEME.src 回傳 null，畫面使用原本樣式',mf.n>=79&&mf.ready===0&&mf.src===null&&mf.src2===null,mf);
 /* 五、回到原本畫面 */
 const off=await p.evaluate(async()=>{UI.navTo(1);home();await new Promise(r=>setTimeout(r,300));document.querySelector('.nj-chip button').click();return{cls:document.body.classList.contains('th-nature'),ls:localStorage.getItem('vx-theme'),nav:getComputedStyle(document.querySelector('nav')).backgroundColor}});
 await p.goto(BASE);await ready(p);const off2=await p.evaluate(()=>document.body.classList.contains('th-nature'));
 T('T8 按「回到原本畫面」立刻恢復原本樣式，重新打開也維持原本畫面',!off.cls&&off.ls===null&&off.nav==='rgb(31, 58, 77)'&&!off2,{off,off2});
 await p.goto(BASE+'?theme=nature');await ready(p);await p.goto(BASE+'?theme=default');await ready(p);
 T('T9 網址加 ?theme=default 也能關閉預覽',await p.evaluate(()=>!document.body.classList.contains('th-nature')&&localStorage.getItem('vx-theme')===null));
 /* 六、樣式檔或素材索引載入失敗：網站照常 */
 const c2=await b.newContext({viewport:{width:1000,height:800}});await c2.addInitScript({content:AS});await c2.route('**/assets/themes/**',r=>r.abort());
 const q=await c2.newPage();const e2=[];q.on('pageerror',e=>e2.push(e.message));await q.goto(BASE+'?theme=nature');await ready(q);await q.waitForTimeout(800);
 const fb=await q.evaluate(async()=>{const m=await THEME.load();UI.pick('quiet');await new Promise(r=>setTimeout(r,300));return{cls:document.body.classList.contains('th-nature'),nav:getComputedStyle(document.querySelector('nav')).backgroundColor,man:Object.keys(m.assets).length,src:THEME.src('rabbit'),map:!!document.querySelector('.stc')}});
 T('T10 主題檔案載入失敗時，自動使用原本畫面，網站照常操作',!fb.cls&&fb.nav==='rgb(31, 58, 77)'&&fb.man===0&&fb.src===null&&fb.map&&!e2.length,{fb,e2});
 /* 七、設定與學習資料不受影響 */
 const s1=await p.evaluate(()=>JSON.stringify(S.set));await p.goto(BASE+'?theme=nature');await ready(p);const s2=await p.evaluate(()=>JSON.stringify(S.set));
 T('T11 開關預覽主題不改變任何設定值',s1===s2);
 T('T12 沒有頁面錯誤',!errs.length,errs);await b.close();console.log(`\n${P} 通過 / ${F} 失敗`);process.exit(F?1:0)})().catch(e=>{console.error('CRASH',e);process.exit(2)});
