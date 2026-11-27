// 第05批：把語言屬性撰寫稿轉成資料檔（vocab/lang/05-XX.json）
// - 只接受該小批次 Level 的實際成員；少了或多了都會停止
// - 關聯詞、動作、物品寫「詞彙文字」：在正式 1000 詞內 → 自動填正式 ID；不在 → 補充文字（ext）
// - 沒有填的欄位自動列為「不適用」（na）
// - 不修改 vocabulary.json
import fs from 'node:fs';import path from 'node:path';import url from 'node:url';
const ROOT=path.resolve(path.dirname(url.fileURLToPath(import.meta.url)),'../..');
const V=JSON.parse(fs.readFileSync(path.join(ROOT,'vocab/vocabulary.json'),'utf8')),byWord=new Map(),byId=new Map(V.map(v=>[v.id,v]));
V.forEach(v=>{if(!byWord.has(v.word))byWord.set(v.word,v)});
const FIELDS=['pos','sem','hyper','feat','rel','acts','objs','use','scene','situ','comm','phrase','sent'];
const lk=w=>{const v=byWord.get(w);return v?v.id:null};
export function build(batch,levels,rows,opt={}){
 const members=V.filter(v=>levels.includes(v.levelId)),out=[],errs=[],seen=new Set();
 const reuse=new Map();if(opt.reuse){const s=JSON.parse(fs.readFileSync(path.join(ROOT,'vocab/lang/sample-20.json'),'utf8'));s.words.filter(w=>opt.reuse.includes(w.id)).forEach(w=>reuse.set(w.id,w))}
 for(const[word,d]of rows){const v=members.find(m=>m.word===word);if(!v){errs.push('不是 '+levels.join('、')+' 的詞：'+word);continue}
  if(seen.has(v.id)){errs.push('重複：'+word);continue}seen.add(v.id);
  const o={id:v.id,word:v.word};
  for(const k of FIELDS){if(d[k]==null)continue;
   if(k==='rel')o.rel=d.rel.map(([t,w])=>{const id=lk(w);return id&&id!==v.id?{t,id}:{t,ext:w}});
   else if(k==='acts'||k==='objs')o[k]=d[k].map(w=>{const id=lk(w);return id&&id!==v.id?{w,id}:{w}});
   else o[k]=d[k]}
  o.teach={lv:d.lv||'core',use:d.use_||[],adv:{use:!!(d.use&&v.hasImage),scene:!!(d.sc&&v.hasImage),act:!!(d.act&&v.hasImage)}};
  o.review=d.review||'auto_ok';o.na=FIELDS.filter(k=>d[k]==null);if(d.note)o.note=d.note;out.push(o)}
 for(const id of reuse.keys()){if(seen.has(id))errs.push('沿用的樣本詞又寫了一次：'+id);else{out.push(reuse.get(id));seen.add(id)}}
 const miss=members.filter(m=>!seen.has(m.id));if(miss.length)errs.push('缺少 '+miss.length+' 詞：'+miss.map(m=>m.word).join('、'));
 if(errs.length){console.error('✘ 無法產生 '+batch+'：\n  '+errs.join('\n  '));process.exit(1)}
 out.sort((a,b)=>V.indexOf(byId.get(a.id))-V.indexOf(byId.get(b.id)));
 const f=path.join(ROOT,'vocab/lang/'+batch+'.json');
 fs.writeFileSync(f,JSON.stringify({schema:1,batch,made:new Date().toISOString().slice(0,10),levels,note:'第05批 '+batch+'：'+levels.join('、')+' 的實際成員（'+out.length+' 詞）。以原始詞彙 ID 連結，不修改 vocabulary.json。',words:out},null,1));
 console.log('✔ 產生 '+path.relative(ROOT,f)+'：'+out.length+' 詞（沿用樣本 '+reuse.size+' 詞）')}

/* ---------- 撰寫輔助（05-03 起使用）：各類詞的預設寫法，個別內容仍逐詞撰寫 ---------- */
const U_N=['詞彙認識','詞彙提取','語意關係','短語組合','生活溝通'],U_A=['詞彙認識','詞彙提取','語句表達','生活溝通'];
const one=w=>[...w].length===1?'單音節詞：口語辨識只接受單獨說出「'+w+'」。':undefined;
const nt=(...a)=>a.filter(Boolean).join(' ')||undefined;
/* 名詞：o = {sem, hyper, feat, rel, acts, use, scene, comm, phrase, sent, sc(預設 1), note, lv} */
export const N=(w,o)=>[w,{pos:o.pos||['名詞'],sem:o.sem,hyper:o.hyper,feat:o.feat,rel:o.rel||[],acts:o.acts,objs:o.objs,use:o.use,scene:o.scene,situ:o.situ,comm:o.comm||['命名','要求物品'],phrase:o.phrase,sent:o.sent,sc:o.sc===0?0:1,lv:o.lv,review:o.review,note:nt(one(w),o.note),use_:o.use_||U_N}];
/* 動作（動詞性短語）：可用於看動作說詞 */
export const A=(w,o)=>[w,{pos:o.pos||['動詞性短語','動詞'],sem:['動作'],hyper:o.hyper,feat:o.feat,rel:o.rel||[],objs:o.objs,scene:o.scene,comm:o.comm||['描述動作','理解及回應指令'],phrase:o.phrase||[{p:'人物+動作',with:['我','大家']}],sent:o.sent,sc:o.sc===0?0:1,act:1,lv:o.lv,review:o.review,note:nt(one(w),o.note),use_:o.use_||U_A}];
/* 單一動詞（可接很多對象）：objs 為可接的對象 */
export const VB=(w,o)=>[w,{pos:o.pos||['動詞'],sem:['動作'],hyper:o.hyper,feat:o.feat,rel:o.rel||[],objs:o.objs,scene:o.scene,comm:o.comm||['描述動作','理解及回應指令'],phrase:[{p:'動詞+名詞',obj:o.objs||[]}],sent:o.sent,sc:0,act:1,lv:o.lv,review:o.review,note:nt(one(w),o.note),use_:o.use_||['詞彙提取','短語組合','語句表達']}];
/* 形容詞／特徵 */
export const ADJ=(w,o)=>[w,{pos:o.pos||['形容詞'],sem:o.sem||['特徵'],hyper:o.hyper,feat:o.feat,rel:o.rel||[],situ:o.situ,scene:o.scene,comm:o.comm||['描述物品','表達感受'],phrase:o.phrase||[{p:'副詞+形容詞',with:['很','好','有點']}],sent:o.sent,sc:o.sc?1:0,lv:o.lv,review:o.review,note:nt(one(w),o.note),use_:o.use_||['詞彙認識','語意關係','短語組合','生活溝通']}];
/* 情緒 */
export const EMO=(w,o)=>[w,{pos:o.pos||['形容詞'],sem:['情緒'],hyper:'情緒',feat:o.feat,rel:o.rel||[],situ:o.situ,scene:o.scene||['情緒調節','同儕互動'],comm:o.comm||['表達感受','分享經驗'],phrase:[{p:'人物+情緒',with:['我','他']},{p:'副詞+形容詞',with:['很','好','有點']}],sent:[{s:'我覺得+情緒',ex:'我覺得'+(o.adv||'很')+w}],lv:o.lv,review:o.review,note:nt('「可能情境」只是例子，不是唯一答案。',o.note),use_:o.use_||['詞彙認識','詞彙提取','語意關係','語句表達','生活溝通']}];
/* 方位 */
export const LOC=(w,o)=>[w,{pos:['方位詞'],sem:['方位'],hyper:'位置',feat:o.feat,rel:o.rel||[],scene:o.scene||['教室','家庭'],comm:['描述位置','理解及回應指令','詢問資訊'],phrase:[{p:'名詞+方位詞',ex:o.ph}],sent:[{s:'物品+在+名詞+方位',ex:o.ex}],lv:o.lv,note:o.note,use_:['詞彙認識','語意關係','語句表達','生活溝通']}];
/* 時間 */
export const TM=(w,o)=>[w,{pos:['時間詞'],sem:['時間'],hyper:o.hyper||'時間',feat:o.feat,rel:o.rel||[],scene:o.scene||['家庭','教室'],comm:['描述時間','分享經驗','回應問題'],phrase:[{p:'時間+活動',with:o.acts}],sent:[{s:'時間+活動',ex:o.ex}],lv:o.lv,note:o.note,use_:['詞彙認識','語意關係','語句表達','生活溝通']}];
/* 功能性用語（多半無圖） */
export const FN=(w,o)=>[w,{pos:o.pos||['功能性詞語','固定短語'],sem:o.sem||['禮貌用語'],hyper:o.hyper||'禮貌用語',feat:o.feat,rel:o.rel||[],situ:o.situ,scene:o.scene,comm:o.comm,sent:o.sent,lv:o.lv,note:nt(o.note),use_:o.use_||['生活溝通','語句表達']}];
