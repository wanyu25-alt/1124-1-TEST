// v22.6.9 美術改版第三階段（V3 審核版素材）：預覽主題只載入「預覽可用」的天空圖；其餘沿用原本 SVG
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const BASE='http://localhost:'+(process.env.E2E_PORT||8124)+'/1124-1-TEST/';let P=0,F=0;
const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x===undefined?null:x).slice(0,700))};
const AS=fs.readFileSync(path.join(__dirname,'lib','audio-stub.js'),'utf8');
const ready=p=>p.waitForFunction(()=>typeof S!=='undefined'&&S.cards&&S.cards.length>=1000&&typeof NJA!=='undefined',null,{timeout:60000}).then(()=>p.waitForTimeout(700));
const game=(p,v)=>p.evaluate(async v=>{const sl=t=>new Promise(r=>setTimeout(r,t));try{G.on=false}catch(e){}home();await sl(200);S.set.n=5;V2.prepDone=true;UI.micHide=true;UI.pick('quiet');await sl(200);goV(v);await sl(1200);for(let i=0;i<12&&S.set.mode==='expose';i++){EXP.done();await sl(500)}await sl(600)},v);
(async()=>{const b=await chromium.launch();const errs=[];
 const mk=async(o={})=>{const ctx=await b.newContext({viewport:{width:1180,height:820},...(o.ctx||{})});await ctx.addInitScript({content:AS});const req=[];ctx.on('request',r=>req.push(r.url()));if(o.block)await ctx.route(o.block,r=>r.abort());const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));return{ctx,p,req}};
 /* 一、預設畫面：不載入任何主題圖片 */
 {const {ctx,p,req}=await mk();await p.goto(BASE);await ready(p);await p.waitForTimeout(500);
  const d=await p.evaluate(()=>({sky:document.body.classList.contains('nj-sky'),v:document.body.style.getPropertyValue('--nj-img-sky')}));
  T('S1 預設畫面（沒有 ?theme）：不載入天空圖，也沒有 nj-sky',!d.sky&&!d.v&&!req.some(u=>/assets\/themes/.test(u)),{d,req:req.filter(u=>/themes/.test(u))});await ctx.close()}
 /* 二、預覽主題：天空圖載入、場景與過關畫面使用 */
 const {ctx,p,req}=await mk();await p.goto(BASE+'?theme=nature');await ready(p);await p.waitForFunction(()=>NJA.ok.sky&&NJA.ok['scene-countryside'],null,{timeout:15000});
 const h=await p.evaluate(()=>({sky:document.body.classList.contains('nj-sky'),v:document.body.style.getPropertyValue('--nj-img-sky'),home:getComputedStyle(document.getElementById('stu')).backgroundImage}));
 T('S2 ?theme=nature：天空圖（backgrounds/sky.jpg）載入成功，首頁上方出現天空帶',h.sky&&/backgrounds\/sky\.jpg/.test(h.v)&&/sky\.jpg/.test(h.home),h);
 const man=await p.evaluate(async()=>{const m=await THEME.load(),A=Object.entries(m.assets),withSrc=A.filter(([k,a])=>a.src);return{withSrc:withSrc.map(([k,a])=>k+':'+a.status+':'+a.src),badSrc:withSrc.filter(([k,a])=>/review-only|scene-references/.test(a.src)).length,srcs:['bicycle','train-engine','rabbit','star','bike-far','train-far'].map(THEME.src),redo:A.filter(([k,a])=>a.status==='redo').length,missing:A.filter(([k,a])=>a.status==='missing').map(([k])=>k)}});
 T('S3 素材索引：只有 sky 與過關插圖 scene-countryside 是「預覽可用」；腳踏車、火車、動物、星星等待重製或缺少的素材都回傳空值（沿用原本 SVG）',man.withSrc.join()==='sky:preview:backgrounds/sky.jpg,scene-countryside:preview:scenes/countryside.jpg'&&!man.badSrc&&man.srcs.every(x=>x===null)&&man.missing.join()==='train-far,train-mid',man);
 T('S4 沒有載入 review-only 或 scene-references 資料夾的任何圖片',!req.some(u=>/review-only|scene-references/.test(u)),req.filter(u=>/review|scene-ref/.test(u)));
 for(const v of ['bike','train']){await game(p,v);const g=await p.evaluate(()=>{const sc=getComputedStyle(document.getElementById('scene'));return{bg:sc.backgroundImage,th:document.getElementById('scene').dataset.th,veh:!!document.querySelector('#train svg'),c0:K.ci+':'+K.si}});
  const adv=await p.evaluate(async()=>{const c0=K.ci+':'+K.si;kPress(K.seq[K.ci][K.si],'t');await new Promise(r=>setTimeout(r,300));return K.ci+':'+K.si!==c0});
  T(`S5 ${v==='bike'?'腳踏車':'火車'}答題：場景天空使用新圖，交通工具仍是原本 SVG，注音輸入照常`,g.th===v&&/sky\.jpg/.test(g.bg)&&g.veh&&adv,{g,adv})}
 const px=await p.evaluate(async()=>{const a=document.getElementById('scene').style.getPropertyValue('--njx');G.done=2;scene();await new Promise(r=>setTimeout(r,200));return{a,b:document.getElementById('scene').style.getPropertyValue('--njx'),anim:S.set.anim}});
 T('S6 天空慢速視差：前進後天空位置跟著移動（速度只有前景的 5%）',px.anim===false?px.b==='0.0px':parseFloat(px.b)<parseFloat(px.a||0),px);
 const ar=await p.evaluate(async()=>{G.done=G.n;scene(1);arrive();await new Promise(r=>setTimeout(r,800));const s=document.querySelector('.arrsc');return{bg:s?getComputedStyle(s).backgroundImage:null,svg:!!document.querySelector('.arrsc svg, .arrsc .vv')}});
 T('S7 過關畫面：背景使用鄉村風景插圖（老師同意），交通工具與動畫沿用原本畫面',/countryside\.jpg/.test(ar.bg||'')&&ar.svg,ar);
 const off=await p.evaluate(async()=>{document.querySelectorAll('.ov').forEach(o=>o.remove());G.on=false;home();THEME.off();await new Promise(r=>setTimeout(r,200));return{sky:document.body.classList.contains('nj-sky'),cs:document.body.classList.contains('nj-scene-countryside'),v:document.body.style.getPropertyValue('--nj-img-sky'),bg:getComputedStyle(document.getElementById('stu')).backgroundImage}});
 T('S8 按「回到原本畫面」：天空圖與過關插圖立刻移除',!off.sky&&!off.cs&&!off.v&&!/sky\.jpg/.test(off.bg),off);await ctx.close();
 /* 三、天空圖載入失敗：沿用原本畫面 */
 {const {ctx,p}=await mk({block:'**/backgrounds/sky.jpg'});await p.goto(BASE+'?theme=nature');await ready(p);await p.waitForTimeout(1500);await game(p,'bike');
  const f=await p.evaluate(()=>({th:document.body.classList.contains('th-nature'),sky:document.body.classList.contains('nj-sky'),bg:getComputedStyle(document.getElementById('scene')).backgroundImage}));
  T('S9 天空圖載入失敗：預覽主題照常，場景使用原本的漸層天空，不會出錯',f.th&&!f.sky&&!/sky\.jpg/.test(f.bg)&&/gradient/.test(f.bg),f);await ctx.close()}
 /* 三之二、過關插圖載入失敗：過關畫面改用天空圖 */
 {const {ctx,p}=await mk({block:'**/scenes/countryside.jpg'});await p.goto(BASE+'?theme=nature');await ready(p);await p.waitForFunction(()=>NJA.ok.sky,null,{timeout:15000});await p.waitForTimeout(800);await game(p,'train');
  const f=await p.evaluate(async()=>{G.done=G.n;scene(1);arrive();await new Promise(r=>setTimeout(r,800));const s=document.querySelector('.arrsc');return{cs:document.body.classList.contains('nj-scene-countryside'),bg:s?getComputedStyle(s).backgroundImage:null}});
  T('S9b 過關插圖載入失敗：過關畫面自動改用天空圖，不會出錯',!f.cs&&/sky\.jpg/.test(f.bg||'')&&!/countryside/.test(f.bg||''),f);await ctx.close()}
 /* 四、減少動態：天空不移動 */
 {const {ctx,p}=await mk({ctx:{reducedMotion:'reduce'}});await p.goto(BASE+'?theme=nature');await ready(p);await p.waitForFunction(()=>NJA.ok.sky,null,{timeout:15000});await game(p,'bike');
  const r=await p.evaluate(async()=>{G.done=2;scene();await new Promise(r=>setTimeout(r,200));const sc=document.getElementById('scene');return{x:sc.style.getPropertyValue('--njx'),tr:getComputedStyle(sc).transitionDuration}});
  T('S10 系統設定「減少動態」：天空不做視差移動',r.x==='0.0px'&&/^0s/.test(r.tr),r);await ctx.close()}
 T('S11 沒有頁面錯誤',!errs.length,errs);
 await b.close();console.log(`\n${P} 通過 / ${F} 失敗`);process.exit(F?1:0)})().catch(e=>{console.error('CRASH',e);process.exit(2)});
