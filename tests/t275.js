// v20.0：設定頁「使用注音提示要扣星星」開關確實影響扣星（原本沒有作用）
const {mk,T,sleep}=require('./t30h.js');
(async()=>{
 const w=mk({fresh:true});const E=c=>w.eval(c);await sleep(1200);
 E('ACL.unlocked=true;ACL.at=Date.now();tab(2);sub="lm";tch()');await sleep(300);
 const box=()=>[...w.document.querySelectorAll('#sp label')].find(l=>/使用注音提示要扣星星/.test(l.textContent));
 T('設定頁有「使用注音提示要扣星星」，預設不勾選（簡化星星）',!!box()&&!box().querySelector('input').checked&&E('V2.unit()')===0);
 const i=box().querySelector('input');i.checked=true;i.dispatchEvent(new w.Event('change'));
 T('勾選後實際生效：每次部分提示扣 1 顆（V2.unit()===1），並存入設定',E('S.set.legacyCost')===true&&E('V2.unit()')===1);
 const j=(()=>{E('tch()');return box().querySelector('input')})();
 T('重新開啟設定頁時維持勾選',j.checked===true);
 j.checked=false;j.dispatchEvent(new w.Event('change'));
 T('取消勾選後不再扣星',E('V2.unit()')===0);
 process.exit(0);
})();
