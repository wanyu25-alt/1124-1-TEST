// 第05批：把語言屬性資料轉成教師審查用的 Markdown（不修改資料）
// 用法：node tools/lang-review-md.mjs 資料檔 [輸出檔] [只列這些 ID，以逗號分隔] [標題]
import fs from 'node:fs';
const [,,src,dst,pick,title]=process.argv,V=JSON.parse(fs.readFileSync('vocab/vocabulary.json','utf8')),by=new Map(V.map(v=>[v.id,v]));
const L=Object.fromEntries(JSON.parse(fs.readFileSync('vocab/levels.json','utf8')).levels.map(l=>[l.id,l.label]));
const d0=JSON.parse(fs.readFileSync(src,'utf8')),d={...d0,words:pick?pick.split(',').map(id=>d0.words.find(w=>w.id===id)).filter(Boolean):d0.words},nm=r=>r.id?(by.get(r.id)||{}).word+'（'+r.id+'）':r.ext+'（補充文字）',j=a=>(a||[]).join('、')||'—';
const FN={hyper:'上位概念',feat:'語意特徵',acts:'相關動作',objs:'相關物品',use:'物品用途',situ:'可能情境',phrase:'短語結構',sent:'句型',scene:'生活情境',comm:'溝通功能'};
const RV={auto_ok:'✅ 自動驗證通過（待教師審查）',needs_review:'🟡 需要教師確認',teacher_ok:'✔ 教師已確認',teacher_off:'⛔ 教師停用'};
let o=`# ${title||'第05批 語言屬性樣本（'+d.words.length+' 詞）｜教師審查用'}\n\n> 由 \`${src}\` 產生（\`node tools/lang-review-md.mjs\`）。原始詞彙、注音、主題、Level **都沒有修改**。\n> 請看每個詞的內容是否自然、正確、適合國小學生；有問題的直接寫下「詞＋要改成什麼」即可。\n\n`;
o+='| # | ID | 詞彙 | 主題 | Level | 圖片 | 詞性 | 審查 |\n|---|---|---|---|---|---|---|---|\n';
d.words.forEach((w,i)=>{const v=by.get(w.id);o+=`| ${i+1} | ${w.id} | **${w.word}** | ${v.category} | ${v.levelId} | ${v.hasImage?'有':'**無**'} | ${j(w.pos)} | ${RV[w.review]} |\n`});
d.words.forEach((w,i)=>{const v=by.get(w.id),t=w.teach||{},a=t.adv||{};
 o+=`\n---\n### ${i+1}. ${w.word}（${w.id}）\n- **原始資料**：主題「${v.category}」｜${L[v.levelId]}｜注音 ${v.zhuyin}｜圖片 ${v.hasImage?'有':'無'}\n`;
 o+=`- **詞性**：${j(w.pos)}　**語意類別**：${j(w.sem)}　**上位概念**：${w.hyper||'—'}\n- **語意特徵**：${j(w.feat)}\n`;
 o+=`- **語意關聯**：${(w.rel||[]).map(r=>r.t+'：'+nm(r)).join('；')||'—'}\n`;
 if(w.acts)o+=`- **相關動作**：${w.acts.map(x=>x.w).join('、')}\n`;if(w.objs)o+=`- **相關物品（動作對象）**：${w.objs.map(x=>x.w).join('、')}\n`;
 if(w.use)o+=`- **物品用途**：${w.use}\n`;if(w.situ)o+=`- **可能情境（不是唯一答案）**：${w.situ.join('、')}\n`;
 o+=`- **生活情境**：${j(w.scene)}　**溝通功能**：${j(w.comm)}\n`;
 o+=`- **可搭配的短語**：${(w.phrase||[]).map(p=>p.p+(p.with?'（'+p.with.join('、')+'）':p.obj?'（對象：'+p.obj.join('、')+'）':p.cl?'（量詞：'+p.cl.join('、')+'）':p.ex?'（例：'+p.ex+'）':'')).join('；')||'—'}\n`;
 o+=`- **可搭配的句型**：${(w.sent||[]).map(s=>s.s+(s.ex?'：「'+s.ex+'」':'')).join('；')||'—'}\n`;
 o+=`- **教學適用**：${({core:'核心（低口語優先）',ext:'延伸',adv:'進階'})[t.lv]}｜${j(t.use)}\n- **可用於進階題型**：${[a.use&&'聽用途選圖（第1站五星）',a.scene&&'看情境說詞（口語第2站五星）',a.act&&'看動作說詞（口語第2站四星）'].filter(Boolean).join('、')||'無'}\n`;
 o+=`- **不適用欄位**：${(w.na||[]).map(k=>FN[k]||k).join('、')||'—'}\n`;if(w.note)o+=`- **待教師確認／提醒**：${w.note}\n`});
fs.writeFileSync(dst||'BATCH05-SAMPLE.md',o);console.log('寫入',dst||'BATCH05-SAMPLE.md',o.length,'字元');
