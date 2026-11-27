// 第05批第三階段：把 vocab/lang/05-01～05-10.json 合併成網站讀取的 vocab/language-metadata.json
// 用法：node tools/merge-lang.mjs
// - 先用 validate-lang.mjs 檢查全部小批次；有錯誤就停止，不產生檔案
// - 不修改 vocabulary.json；以原始詞彙 ID 連結
// - 教師在裝置上的修改（S.cx／審查狀態）不在這個檔案裡，網站讀取時以教師修改為優先
import fs from 'node:fs';import path from 'node:path';import url from 'node:url';
import {validate} from './validate-lang.mjs';
const ROOT=path.resolve(path.dirname(url.fileURLToPath(import.meta.url)),'..');
const files=Array.from({length:10},(_,i)=>'vocab/lang/05-'+String(i+1).padStart(2,'0')+'.json');
const miss=files.filter(f=>!fs.existsSync(path.join(ROOT,f)));if(miss.length){console.error('✘ 缺少：'+miss.join('、'));process.exit(1)}
const r=validate(files);
if(r.errors.length){console.error('✘ 驗證有 '+r.errors.length+' 個錯誤，未產生合併檔：\n  '+r.errors.slice(0,30).join('\n  '));process.exit(1)}
const V=JSON.parse(fs.readFileSync(path.join(ROOT,'vocab/vocabulary.json'),'utf8')),order=new Map(V.map((v,i)=>[v.id,i]));
const words=files.flatMap(f=>JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8')).words).sort((a,b)=>order.get(a.id)-order.get(b.id));
if(words.length!==V.length||new Set(words.map(w=>w.id)).size!==V.length){console.error('✘ 詞數不是 '+V.length+' 或有重複');process.exit(1)}
/* 口語第2站五星「聽句子說詞」問句（教師確認，vocab/lang/cloze.json）→ clz 欄位 */
const cz=path.join(ROOT,'vocab/lang/cloze.json');let nclz=0;
if(fs.existsSync(cz)){const C=new Map(JSON.parse(fs.readFileSync(cz,'utf8')).items.filter(x=>!x.amb&&!x.pending).map(x=>[x.id,x.q]));words.forEach(w=>{const q=C.get(w.id);if(q){if(q.includes(w.word)){console.error('✘ 問句含答案：'+w.word);process.exit(1)}w.clz=q;nclz++}})}
const out={schema:1,kind:'language-metadata',ver:'22.6',made:new Date().toISOString().slice(0,10),count:words.length,
 note:'正式 1000 詞語言屬性（第05批）。以原始詞彙 ID 連結，不修改 vocabulary.json。教師在裝置上的修改優先。欄位說明見 LANGUAGE-METADATA-SCHEMA.md。',
 stats:r.stats,words};
const f=path.join(ROOT,'vocab/language-metadata.json');fs.writeFileSync(f,JSON.stringify(out));
console.log('✔ 產生 vocab/language-metadata.json：'+words.length+' 詞，'+(fs.statSync(f).size/1024).toFixed(0)+' KB；聽句子說詞 '+nclz+' 句（提醒 '+r.warn.length+'）');
