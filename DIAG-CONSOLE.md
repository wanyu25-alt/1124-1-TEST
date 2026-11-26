# DIAG-CONSOLE｜教材讀取唯讀診斷（v22.1／v22.2 皆可用）

**用途**：在「題庫顯示 0 個詞彙」的那台電腦上，找出是哪一個環節讓正式教材變成 0。
**安全**：只讀取資料，**不寫入、不清除**任何本機資料；不輸出學生姓名或學習內容，只有數量與是否有效。

## 電腦（Chrome／Edge）
1. 用平常的網址開啟網站，等首頁出現。
2. 按 `F12`（Mac：`Cmd`＋`Option`＋`J`）→ 點「Console／主控台」。
3. 第一次貼上時，Chrome 可能要求先輸入 `allow pasting` 再按 Enter（這是瀏覽器的安全提示）。
4. 把下面整段貼上，按 Enter。
5. 把出現的整段文字（從 `{` 到 `}`）複製回傳給我。

```js
(()=>{const o={};try{const S0=window.S||S,cards=S0.cards||[],lib=cards.filter(c=>c.lib),cats=S0.cats||[],live=new Set(cats.map(c=>c.id)),pk=new Set(S0.packIds||[]),L=(S0.lrn&&S0.lrn.list)||[],cur=L.find(p=>p.id===(S0.lrn&&S0.lrn.cur))||L[0]||{},e=cur.ext||{},fl=e.fl||{},s=S0.lib||{},B=(typeof LIB!=='undefined'&&LIB.base)||null,b=(document.documentElement.innerHTML.match(/build:'(v[\d.]+)'/)||[])[1]||'?';
o['1 版本']={程式:b,網址:location.origin+location.pathname,時間:new Date().toLocaleString()};
o['2 正式教材']={讀到詞彙庫:!!B,詞彙庫詞數:B?B.length:0,讀取錯誤:(typeof LIB!=='undefined'&&LIB.err)||'',已遷移v22:!!s.v22,教師停用:Object.keys(s.off||{}).length,審核預設值:(typeof LIB!=='undefined'&&LIB.defRv)?Object.keys(LIB.defRv).length:0,明確退回待審:Object.values(s.ov||{}).filter(v=>v&&v.rv==='pending').length,本機設定沒有審核欄位:Object.values(s.ov||{}).filter(v=>v&&!v.rv).length};
o['3 本機教材']={圖卡總數:cards.length,正式詞彙:lib.length,正式有圖:lib.filter(c=>c.img).length,舊版內建:cards.filter(c=>!c.lib&&pk.has(c.id)).length,教師自訂:cards.filter(c=>!c.lib&&!c.part&&!pk.has(c.id)).length,分類總數:cats.length,正式主題:cats.filter(c=>c.lib&&!c.lvl).length,Level:cats.filter(c=>c.lvl).length,沒有分類的正式詞:lib.filter(c=>!(c.cats||[]).some(id=>live.has(id))).length};
const sel=fl.dim&&fl.sel?(fl.sel[fl.dim]||[]):[],u=(typeof MAT!=='undefined'&&MAT.union)?MAT.union(sel):[];
o['4 目前個案（不含姓名）']={個案數:L.length,第幾位:L.indexOf(cur)+1,個別詞彙範圍:Array.isArray(e.libSel)?e.libSel.length:'未設定',其中仍有效:Array.isArray(e.libSel)?e.libSel.filter(id=>lib.some(c=>c.id===id)).length:'—',排除詞彙:(e.excl||[]).length,練習範圍:fl.range||'rec(系統推薦)',範圍類型:fl.dim||'未設定',已選分類數:fl.dim?sel.length:'—',其中仍存在:fl.dim?sel.filter(id=>live.has(id)||id==='__none').length:'—',範圍內詞彙:u.length,範圍內有圖:u.filter(c=>c.img).length,題目字數上限:(()=>{try{return LRN.maxLen()}catch(x){return'?'}})()};
const k=[];if(!B)k.push('A 沒有讀到正式詞彙庫');if(lib.length&&!lib.some(c=>c.img))k.push('B 正式詞彙全部沒有圖片');if(Array.isArray(e.libSel)&&!e.libSel.filter(id=>lib.some(c=>c.id===id)).length)k.push('C 個別學生詞彙範圍沒有有效詞彙');if((fl.range==='pick')&&fl.dim&&fl.dim!=='sp'&&!u.length)k.push('D 自行選擇教材的分類已不存在或沒有詞彙');
o['5 判斷']=k.length?k:['沒有發現會造成 0 個詞彙的設定']}catch(x){o.錯誤=String(x&&x.message||x)}console.log(JSON.stringify(o,null,1));return'診斷完成（唯讀，沒有修改任何資料）。請把上面的文字複製回傳。'})()
```

v22.2 之後也可以直接輸入：`MATFIX.diag()`

## 手機
手機的瀏覽器沒有方便的 Console。手機目前正常，**不需要**在手機上跑；若要比對，請在手機開啟後臺「教材庫完整性檢查」截圖即可。

## 結果怎麼看
| 欄位 | 正常值 | 不正常時代表 |
|---|---|---|
| 1 版本．程式 | v22.2（更新後） | 顯示舊版本＝這台電腦讀到的是 GitHub Pages 舊快取，請 `Ctrl`＋`F5` |
| 2 正式教材．詞彙庫詞數 | 1000 | 0＝沒有讀到 vocab/ 資料夾 |
| 3 本機教材．正式有圖 | 950（扣除您停用的） | 0＝審核預設值沒有讀到，或圖片被退回待審 |
| 4 目前個案．其中仍存在 | 等於「已選分類數」 | 0＝「自行選擇教材」選到的分類都被刪掉了（本批修復的主因） |
| 4 目前個案．個別詞彙範圍／其中仍有效 | 未設定，或＞0 | 有設定但 0＝這位學生的個別詞彙範圍沒有有效詞彙 |
| 5 判斷 | 沒有發現… | 列出 A～D 項原因 |
