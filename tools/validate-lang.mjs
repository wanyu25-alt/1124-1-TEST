// 第05批：語言屬性資料驗證工具（可重複執行；不修改任何檔案）
// 用法：node tools/validate-lang.mjs [檔案…]   （不指定時驗證 vocab/lang/*.json）
// 檢查：正式教材完整（1000 詞、20 Level×50、16 主題）、原始 ID 存在、詞彙文字相符、重複 ID、關聯 ID、
//       固定標籤清單、欄位格式、進階題型條件、「動詞＋名詞」語意合理性（內建正反測試案例）。
import fs from 'node:fs';import path from 'node:path';import url from 'node:url';
const ROOT=path.resolve(path.dirname(url.fileURLToPath(import.meta.url)),'..');
const J=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
export const POS=['名詞','動詞','形容詞','副詞','代名詞','數詞','量詞','方位詞','時間詞','連接詞','功能性詞語','固定短語','動詞性短語','其他'];
export const CLS=['人物','職業','身體','食物','飲料','水果蔬菜','動物','植物','自然','衣物','鞋子','配件','餐具','清潔用品','衛浴用品','文具','工具','家具家電','玩具遊戲','交通工具','地點','時間','方位','顏色','形狀','數量','動作','情緒','感覺','特徵','需求','禮貌用語','其他'];
export const SCENE=['家庭','教室','操場','廁所','餐廳','超商','市場','公園','醫院','交通工具','上學','放學','用餐','清潔','盥洗','穿衣','睡覺','遊戲','運動','購物','同儕互動','情緒調節','生病就醫','美勞','天氣','戶外','節日'];
export const COMM=['命名','要求物品','要求協助','選擇','拒絕','表達需求','表達感受','描述物品','描述動作','描述位置','描述時間','回應問題','分享經驗','提供資訊','詢問資訊','社交互動','理解及回應指令'];
export const REL=['上位','下位','同類','整體部分','用途','動作對象','人物職業','地點活動','物品特徵','可能情境','相反','生活事件','常一起出現'];
export const PHRASE=['動詞+名詞','形容詞+名詞','數量+量詞+名詞','人物+動作','人物+動作+物品','地點+活動','時間+活動','人物+情緒','副詞+形容詞','情緒+對象','名詞+方位詞','不要+物品','不要+動作','我想要+物品','我想要+動作','我需要+協助'];
export const TEACH=['詞彙認識','詞彙提取','語意關係','詞彙分類','短語組合','語句表達','生活溝通'];
export const REVIEW=['auto_ok','needs_review','teacher_ok','teacher_off'];
export const FIELDS=['pos','sem','hyper','feat','rel','acts','objs','use','scene','situ','comm','phrase','sent','teach'];
/* 「動詞＋名詞」合理性：動詞可以接的語意類別（沒有列出的動詞＝不檢查，只提示） */
export const VERB_OBJ={'吃':['食物','水果蔬菜'],'喝':['飲料'],'穿':['衣物','鞋子'],'脫':['衣物','鞋子','配件'],
 '剝皮':['水果蔬菜'],'煮':['食物','水果蔬菜'],'點':['食物','飲料'],'戴':['配件','衣物'],'撐':['配件'],'騎':['交通工具'],'搭':['交通工具'],'坐':['交通工具','家具家電','衛浴用品'],'剪':['文具','身體','衣物'],
 '拿':null,'買':null,'借':null,'用':null,'帶':null,'打開':null,'收':null,
 '閉上':['身體'],'張開':['身體'],'揉':['身體'],'摀住':['身體'],'摸':null,'擦':null,'刷':['身體','鞋子','衛浴用品','餐具'],'保護':null,'咬':['食物','水果蔬菜'],'倒':['飲料'],'背':['文具','配件'],'搬':['家具家電'],'煎':['食物'],'蓋':null,'摺':['衣物','家具家電','文具'],'開':null,'關':null,'敲':null,'擠':['衛浴用品','食物','清潔用品'],'抽':['清潔用品','衛浴用品'],'梳':['身體'],'餵':['動物','人物'],'抱':['動物','人物','家具家電','玩具遊戲'],'清潔':null,'沖水':['衛浴用品'],'抹':null,'按':null,'看':null,'等':null,'倒垃圾':null,'繫':['配件'],'扣':['配件','衣物'],'切':['食物','水果蔬菜'],'剝':['食物','水果蔬菜'],'拉':null,'掃':null,'拖':null,'貼':null,'畫':null,'走':null,'划':['交通工具'],'鋪':['家具家電'],'聞':['植物','食物','水果蔬菜','衛浴用品','飲料'],'綁':['配件','身體','工具'],'拔':['家具家電','植物','身體'],'插':['家具家電'],'換':null,'查':['文具'],'夾':['文具','食物','配件'],'玩':['玩具遊戲','交通工具'],'推':['交通工具','玩具遊戲','家具家電'],'轉':['玩具遊戲','文具','身體'],'疊':['玩具遊戲'],'拼':['玩具遊戲'],'彈':['玩具遊戲'],'丟':['玩具遊戲'],'踢':['玩具遊戲'],'放':null,'吹':['玩具遊戲','身體'],'跳':['玩具遊戲'],'打':['玩具遊戲'],'拍':['玩具遊戲','身體'],'搖':['玩具遊戲'],'爬':null,'提':['清潔用品','家具家電','配件','文具'],'洗':['水果蔬菜','衣物','家具家電','餐具','身體','鞋子','衛浴用品','清潔用品']};
export const okVO=(verb,sem)=>{const a=VERB_OBJ[verb];if(a===undefined)return 'unknown';if(a===null)return true;return (sem||[]).some(s=>a.includes(s))};
/* 內建正反測試案例（說明書指定） */
export const CASES=[['吃',['水果蔬菜'],true,'吃＋葡萄'],['喝',['飲料'],true,'喝＋牛奶'],['喝',['工具'],false,'喝＋剪刀'],['穿',['鞋子'],true,'穿＋鞋子'],['穿',['水果蔬菜'],false,'穿＋西瓜']];
export function validate(files){
 const V=J('vocab/vocabulary.json'),byId=new Map(V.map(v=>[v.id,v])),out={errors:[],warn:[],review:[],stats:{}};
 const E=(id,m)=>out.errors.push((id?id+' ':'')+m),W=(id,m)=>out.warn.push((id?id+' ':'')+m);
 /* 正式教材完整性 */
 const lv={},cat=new Set();V.forEach(v=>{lv[v.levelId]=(lv[v.levelId]||0)+1;cat.add(v.categoryId)});
 if(V.length!==1000)E('','正式詞彙不是 1000 個：'+V.length);if(new Set(V.map(v=>v.id)).size!==V.length)E('','vocabulary.json 有重複 ID');
 if(Object.keys(lv).length!==20||!Object.values(lv).every(n=>n===50))E('','Level 不是 20 個各 50 詞');if(cat.size!==16)E('','主題不是 16 個：'+cat.size);
 /* 測試案例 */
 for(const[v,s,exp,name]of CASES){if(okVO(v,s)!==exp)E('','合理性測試案例失敗：'+name)}
 const seen=new Map();let n=0;const cnt={auto_ok:0,needs_review:0,teacher_ok:0,teacher_off:0},advN={use:0,scene:0,act:0};
 for(const f of files){let d;try{d=JSON.parse(fs.readFileSync(f,'utf8'))}catch(e){E('',f+' 不是正確的 JSON：'+e.message);continue}
  if(d.schema!==1)E('',f+' schema 不是 1');if(!Array.isArray(d.words))E('',f+' 沒有 words 陣列');
  for(const w of d.words||[]){n++;const id=w.id,v=byId.get(id);
   if(!v){E(id,'原始 ID 不存在');continue}
   if(seen.has(id))E(id,'重複 ID（也在 '+seen.get(id)+'）');seen.set(id,path.basename(f));
   if(w.word!==v.word)E(id,'詞彙文字和原始資料不同：'+w.word+' ≠ '+v.word);
   if(!Array.isArray(w.pos)||!w.pos.length)E(id,'缺少詞性');else w.pos.forEach(p=>POS.includes(p)||E(id,'詞性不在清單：'+p));
   (w.sem||[]).forEach(s=>CLS.includes(s)||E(id,'語意類別不在清單：'+s));
   (w.scene||[]).forEach(s=>SCENE.includes(s)||E(id,'生活情境不在清單：'+s));
   (w.comm||[]).forEach(s=>COMM.includes(s)||E(id,'溝通功能不在清單：'+s));
   (w.rel||[]).forEach(r=>{if(!REL.includes(r.t))E(id,'關係類型不在清單：'+r.t);if(!!r.id===!!r.ext)E(id,'關聯必須是「id」或「ext」其中一個');
    if(r.id){if(!byId.has(r.id))E(id,'關聯 ID 不存在：'+r.id);else if(r.id===id)E(id,'關聯到自己')}});
   for(const k of ['acts','objs'])(w[k]||[]).forEach(o=>{if(!o.w)E(id,k+' 缺少文字');if(o.id&&!byId.has(o.id))E(id,k+' 的 ID 不存在：'+o.id);if(o.id&&byId.get(o.id)&&byId.get(o.id).word!==o.w)W(id,k+' 文字「'+o.w+'」和 '+o.id+'「'+byId.get(o.id).word+'」不同')});
   (w.phrase||[]).forEach(p=>{if(!PHRASE.includes(p.p))E(id,'短語結構不在清單：'+p.p);
    if(p.p==='動詞+名詞'&&p.with)p.with.forEach(vb=>{const r=okVO(vb,w.sem);if(r===false)E(id,'不合理的組合：'+vb+'＋'+w.word);else if(r==='unknown')W(id,'動詞「'+vb+'」沒有合理性規則（未檢查）')})});
   (w.sent||[]).forEach(s=>{if(!s.s||!s.s.includes('+'))E(id,'句型格式不正確：'+JSON.stringify(s));if(s.ex&&!s.ex.includes(w.word)&&!/[這那]/.test(s.ex))W(id,'例句沒有包含詞彙：'+s.ex)});
   const t=w.teach||{};if(!['core','ext','adv'].includes(t.lv))E(id,'teach.lv 不正確');(t.use||[]).forEach(x=>TEACH.includes(x)||E(id,'教學活動不在清單：'+x));
   const a=t.adv||{};if(a.use&&!(w.use&&w.use.trim()))E(id,'adv.use 需要 use');if(a.scene&&!(w.scene||[]).length)E(id,'adv.scene 需要 scene');
   if(a.act&&!(w.pos||[]).some(p=>p==='動詞'||p==='動詞性短語'))E(id,'adv.act 需要動詞');if((a.use||a.scene||a.act)&&!v.hasImage)E(id,'沒有圖片的詞不能用於圖片進階題');
   if(a.use)advN.use++;if(a.scene)advN.scene++;if(a.act)advN.act++;
   if(!REVIEW.includes(w.review))E(id,'review 不正確');else cnt[w.review]++;
   (w.na||[]).forEach(k=>{if(!FIELDS.includes(k))E(id,'na 欄位名稱不正確：'+k);else if(w[k]!==undefined&&!(Array.isArray(w[k])&&!w[k].length))E(id,'na 列了「'+k+'」但有填資料')});
   const empty=FIELDS.filter(k=>w[k]===undefined&&!(w.na||[]).includes(k));if(empty.length)W(id,'沒有填、也沒有列在 na：'+empty.join('、'));
   if(w.review==='needs_review'){if(!w.note)E(id,'needs_review 需要 note');out.review.push(id+' '+w.word+'：'+(w.note||''))}else if(w.note)out.review.push(id+' '+w.word+'（提醒）：'+w.note);
  }}
 out.stats={檔案:files.length,詞數:n,...cnt,可用於聽用途選圖:advN.use,可用於看情境說詞:advN.scene,可用於看動作說詞:advN.act,多詞性:[...seen.keys()].length?files.reduce((s,f)=>s+(JSON.parse(fs.readFileSync(f,'utf8')).words||[]).filter(w=>(w.pos||[]).length>1).length,0):0};
 return out}
if(import.meta.url===url.pathToFileURL(process.argv[1]).href){
 let files=process.argv.slice(2);if(!files.length){const d=path.join(ROOT,'vocab/lang');files=fs.existsSync(d)?fs.readdirSync(d).filter(f=>f.endsWith('.json')).map(f=>path.join(d,f)):[]}
 const r=validate(files);
 console.log('【語言屬性驗證】'+new Date().toISOString().slice(0,10));console.log('統計：',JSON.stringify(r.stats,null,1));
 console.log('\n錯誤（'+r.errors.length+'）');r.errors.forEach(x=>console.log('  ✘ '+x));
 console.log('\n提醒（'+r.warn.length+'）');r.warn.forEach(x=>console.log('  ⚠ '+x));
 console.log('\n需要教師確認（'+r.review.length+'）');r.review.forEach(x=>console.log('  ☐ '+x));
 process.exit(r.errors.length?1:0)}
