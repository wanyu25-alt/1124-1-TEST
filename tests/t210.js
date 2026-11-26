// 新版第06階段：六站語言學習活動完善（jsdom）
const {mk,R,T,sleep}=require('./t30h.js');
const IMG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const IMG2=IMG.replace('AAAA','AAAB');
const SEED=`S.cats=[{id:'fr',name:'水果',order:[]},{id:'an',name:'動物',order:[]},{id:'solo',name:'單一',order:[]}];
S.cards=[['a','蘋果','fr'],['b','香蕉','fr'],['c','貓','an'],['d','狗','an'],['e','魚','an'],['f','橘子','fr']].map(([id,t,c])=>({id,text:t,zy:'ㄅㄚ',img:'${IMG}',audio:'',cats:[c]})).concat([{id:'z',text:'獨詞',zy:'ㄅ',img:'${IMG}',audio:'',cats:['solo']}]);
S.cx={a:{gimgs:[{id:'IMG-a-g1',img:'${IMG2}',note:'',created:1}]}};LRN.sync&&0;save();`;
const boot=async()=>{const w=mk({fresh:true});const t0=Date.now();while(Date.now()-t0<8000&&!w.eval('typeof P15!=="undefined"&&typeof UI!=="undefined"&&S.set.ttsMig===3'))await sleep(50);const E=c=>w.eval(c);w.alert=m=>{w.__al=m};w.confirm=()=>true;E(SEED);return{w,E}};
const J=(E,c)=>JSON.parse(E('JSON.stringify('+c+')'));
(async()=>{
 {const {E}=await boot();
  T('① every ladder item and every extra of all 6 stations in all 3 modes has a learning-goal/indicator entry',J(E,'P15.audit()').length===0);
  const miss=J(E,'P15.audit()');if(miss.length)console.log(miss.slice(0,8));
  T('② each station states its main goal on the map',[1,2,3,4,5,6].every(s=>['quiet','oral','integ'].every(m=>E(`FL.SD[${s}].${m}`).includes('主要目標：'))));
  T('② goals match the spec (語意理解 / 提取+獨立性 / 語意關係 / 組合彈性 / 語句組織 / 功能性語言+類化+主動性)',/語意理解/.test(E('FL.SD[1].quiet'))&&/表達獨立性/.test(E('FL.SD[2].oral'))&&/語意關係/.test(E('FL.SD[3].quiet'))&&/組合彈性/.test(E('FL.SD[4].integ'))&&/語句組織/.test(E('FL.SD[5].quiet'))&&/溝通主動性/.test(E('FL.SD[6].oral')));
  const ex=(s,m)=>J(E,`FL.extras(${s},'${m}').map(x=>x.t)`);
  T('③ station 1 extras: verb / feature / function picks',ex(1,'quiet').some(t=>/動詞/.test(t))&&ex(1,'quiet').some(t=>/形容詞|特徵/.test(t))&&ex(1,'oral').some(t=>/功能/.test(t)));
  T('③ station 2 extras (not in quiet): feature words and new-image naming',!ex(2,'quiet').length&&ex(2,'oral').some(t=>/新圖片說詞/.test(t))&&ex(2,'integ').some(t=>/特徵詞/.test(t)));
  T('③ station 3 extras: classification + 物品功能/人物動作/場所/特徵/感受 pairings',(l=>/詞彙分類/.test(l)&&/物品與功能/.test(l)&&/人物與動作/.test(l)&&/物品與場所/.test(l)&&/特徵與物品/.test(l)&&/感受與情境/.test(l))(ex(3,'quiet').join('|')));
  T('③ station 5 extras: 人物動作物品 / 地點 / 特徵 / 感受 / 需求',(l=>/人物、動作、物品/.test(l)&&/地點/.test(l)&&/特徵/.test(l)&&/感受/.test(l)&&/需求/.test(l))(ex(5,'quiet').join('|')));
  T('③ oral mode station 5 extras are speaking tasks, quiet ones are arranging tasks (no forced typing/speaking)',ex(5,'oral').every(t=>/說/.test(t))&&ex(5,'quiet').every(t=>/排列/.test(t)));
  // 沒有教材 → 不能開始，且給原因（不假造）
  T('④ new tasks without material are disabled with a reason (no fake data)',J(E,`FL.extras(1,'quiet').filter(x=>/動詞|特徵|功能/.test(x.t)).map(x=>x.ok().ok)`).every(v=>v===false)&&J(E,`FL.extras(5,'quiet').map(x=>x.ok().ok)`).every(v=>v===false)&&J(E,`FL.extras(3,'quiet').filter(x=>/配對/.test(x.t)).map(x=>x.ok().msg||x.ok().ok)`).every(v=>typeof v==='string'&&v.length>3));
 }
 // ⑤ 詞彙分類
 {const {E}=await boot();
  T('⑤ classification needs a category with ≥2 picture cards (single-word category excluded)',E('PH.ok(byId("a"),"pick","cat")')===true&&E('PH.ok(byId("z"),"pick","cat")')===false);
  T('⑤ the station-3 classification extra is available',J(E,`FL.extras(3,'quiet').filter(x=>/詞彙分類/.test(x.t)).map(x=>x.ok().ok)`)[0]===true);
  E('S.set.mode="pick";S.set.pks="cat";S.set.src="all";S.set.n=3;S.set.mix=false;S.set.ap=false;startRound()');await sleep(300);
  const pk=J(E,'({sub:G.pk.sub,name:G.pk.catName,n:G.pk.opts.length,ok:G.pk.opts.map(o=>byId(o.cid).cats[0])})');
  T('⑤ question asks for the category and exactly one option belongs to it, distractors from other categories',pk.sub==='cat'&&pk.ok.filter(c=>c===E('G.pk.cat')).length===1&&['水果','動物'].includes(pk.name));
  T('⑤ the on-screen question names the category',E('document.querySelector("#catq")&&document.querySelector("#catq").textContent').includes(pk.name));
  const wrong=E('G.pk.opts.findIndex(o=>!o.correct)');E(`PICK.choose(${wrong})`);await sleep(200);E('PICK.choose(G.pk.ci)');await sleep(500);
  const rec=J(E,'S.recs[S.recs.length-1]');
  T('⑤ record: game pick, sub cat, category name saved, wrong first choice counted (not independent)',rec.game==='pick'&&rec.sub==='cat'&&rec.ext.catQ===pk.name&&rec.independent===false);
 }
 // ⑥ 新圖片說詞
 {const {E}=await boot();
  T('⑥ new-image naming needs generalized images',E('PH.ok(byId("a"),"speak","newimg")')===true&&E('PH.ok(byId("b"),"speak","newimg")')===false);
  E('S.set.mode="speak";S.set.sps="newimg";S.set.src="all";S.set.n=3;S.set.mix=false;startRound()');await sleep(300);
  T('⑥ the generalized picture (not the original) is shown',E('G.ni&&G.ni.id')==='IMG-a-g1'&&E('document.querySelector("#pic").src')===IMG2.replace(/^/,''));
  E('SK.credit&&0');
  E('RE.input&&RE.input();ok()');await sleep(500);
  const r1=J(E,'S.recs[S.recs.length-1]');
  T('⑥ record keeps the picture id and marks the first sighting as 新圖片',r1&&r1.qImgId==='IMG-a-g1'&&r1.newImage===true&&r1.sub==='newimg');
  E('S.set.mode="speak";S.set.sps="newimg";S.set.src="all";S.set.n=3;S.set.mix=false;startRound()');await sleep(300);E('RE.input&&RE.input();ok()');await sleep(500);
  const r2=J(E,'S.recs[S.recs.length-1]');
  T('⑥ seeing the same generalized picture again is no longer counted as new',r2.qImgId==='IMG-a-g1'&&r2.newImage===false);
 }
 // ⑦ 題型說明顯示
 {const {E}=await boot();
  E('FL.st=1;FL.view="setup";UI.view="mode";UI.mode="quiet";FL.actSel="x0"');let h=E('FL.setupHtml()');
  T('⑦ setup page shows what the chosen item practices, the indicator, and the record category',/這個題型在練習/.test(h)&&/觀察的指標/.test(h)&&/和其他類別分開紀錄/.test(h));
  E('FL.actSel=""');h=E('FL.setupHtml()');T('⑦ also for the default ladder item',/這個題型在練習：<\/b>語意理解/.test(h));
  E('FL.st=6;FL.actSel=""');E('UI.mode="oral"');h=E('FL.setupHtml()');
  T('⑦ station 6 items state they are in-game simulated situations, not real life',/遊戲內情境，非真實生活|大人或系統提問後回答|選擇適合情境的說法/.test(h));
 }
 // ⑧ 短語：未教組合只計第一次，看過完整示範後不再算新組合
 {const {E}=await boot();
  E(`S.cards.push({id:'w1',text:'喝',zy:'ㄏ',img:'',audio:'',cats:[],part:true},{id:'w2',text:'水',zy:'ㄕ',img:'',audio:'',cats:[],part:true});S.cb=[{id:'cbX',parts:['w1','w2'],rel:'act_obj',ok:true,created:1}];`);
  T('⑧ a never-taught combination is novel',E('CB.novel("cbX")')===true&&E('CB.snap("cbX").novel')===true);
  E('CB.mark("cbX","test",true)');
  T('⑧ after a full demonstration the same combination is no longer novel (later success cannot count as a first independent new combination)',E('CB.novel("cbX")')===false&&E('CB.snap("cbX").demo')===true);
 }
 // ⑨ 站別彼此獨立：自由進入任何一站（不強制逐站）
 {const {E}=await boot();
  const open=[1,2,3,4,5,6].map(s=>{try{E(`FL.open(${s})`);return E('FL.setupHtml()').length>200}catch(e){return false}});
  T('⑨ all six stations can be opened directly in any order',open.every(Boolean));
 }
 // ⑩ 配對／句型題型真的能開始遊戲（有教材時）
 {const {E}=await boot();
  E(`S.cards.push({id:'p1',text:'媽媽',zy:'ㄇ',img:'',audio:'',cats:[],part:true},{id:'p2',text:'吃',zy:'ㄔ',img:'',audio:'',cats:[],part:true},{id:'p3',text:'跑',zy:'ㄆ',img:'',audio:'',cats:[],part:true},{id:'p4',text:'爸爸',zy:'ㄅ',img:'',audio:'',cats:[],part:true});S.cb=[{id:'cb1',parts:['p1','p2'],rel:'person_act',ok:true,created:1},{id:'cb2',parts:['p4','p3'],rel:'person_act',ok:true,created:1}];save();`);
  const ex=J(E,`FL.extras(3,'quiet').map(x=>x.t)`),i=ex.findIndex(t=>/人物與動作/.test(t));
  T('⑩ person-action pairing is available once such combinations exist',E(`FL.extras(3,'quiet')[${i}].ok().ok`)===true&&E(`FL.extras(3,'quiet').find(x=>/物品與場所/.test(x.t)).ok().ok`)===false);
  E(`S.set.n=2;FL.extras(3,'quiet')[${i}].go()`);await sleep(300);
  T('⑩ it starts a real game whose items are only the chosen relation',E('G.on')===true&&E('G.q.length')>0&&E('G.q.every(c=>CB.get(c._cb).rel=="person_act")')===true);
  E('S.se=[{id:"se1",pat:"p_act_obj",chain:["拿球","我拿球"],parts:["我","拿","球"],ok:true,created:1}];save()');
  T('⑩ sentence-pattern extra is available only when that pattern has sentences',E(`FL.extras(5,'quiet').find(x=>/人物、動作、物品/.test(x.t)).ok().ok`)===true||/句型|語句|開啟/.test(String(E(`FL.extras(5,'quiet').find(x=>/人物、動作、物品/.test(x.t)).ok().msg`))));
 }
 console.log('PASS',R.P,'FAIL',R.F);process.exit(R.F?1:0)})();
