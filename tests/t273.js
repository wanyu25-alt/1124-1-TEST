// v20.0：教材資料完整性（實際讀取 vocab/ 檔案；圖片可讀取≠內容正確≠人工審核）
const fs=require('fs'),path=require('path'),cp=require('child_process');
let P=0,F=0;const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
const VD=path.join(process.env.VDIR||'/home/claude/repo','vocab'),J=f=>JSON.parse(fs.readFileSync(path.join(VD,f),'utf8'));
const V=J('vocabulary.json'),C=J('categories.json'),L=J('levels.json').levels,M=J('manifest.json'),D=J('default-library.json');
const E=Array.isArray(D.en)?D.en:Object.keys(D.en);
T('1000 個詞彙、ID 唯一且格式穩定（VOC＋4 位數）',V.length===1000&&new Set(V.map(w=>w.id)).size===1000&&V.every(w=>/^VOC\d{4}$/.test(w.id)));
T('沒有非預期的重複詞彙文字',new Set(V.map(w=>w.word)).size===1000);
T('注音只含注音符號與聲調符號、每詞都有注音',V.every(w=>w.zhuyin&&/^[ㄅ-ㄩˉˊˇˋ˙ˊˇˋ˙ˉ ]+$/.test(w.zhuyin)));
const imgs=V.flatMap(w=>w.images);
T('961 張圖片全部存在、檔名純 ASCII、無重複參照、無未使用圖片',imgs.length===961&&new Set(imgs).size===961&&imgs.every(p=>/^images\/VOC\d{4}_\d{2}\.webp$/.test(p)&&fs.existsSync(path.join(VD,p)))&&fs.readdirSync(path.join(VD,'images')).length===961);
T('950 個有圖詞彙、50 個無圖；其中 11 個詞有多張圖（一詞多圖），沒有共用圖片',V.filter(w=>w.images.length).length===950&&V.filter(w=>!w.images.length).length===50&&V.filter(w=>w.images.length>1).length===11);
T('圖片檔是有效 WebP（RIFF/WEBP 標頭）',imgs.every(p=>{const b=fs.readFileSync(path.join(VD,p));return b.slice(0,4).toString()==='RIFF'&&b.slice(8,12).toString()==='WEBP'}));
T('16 個主題、20 個 Level、每個 Level 50 詞；兩套分類互相獨立',C.length===16&&L.length===20&&L.every(l=>V.filter(w=>w.levelId===l.id).length===50)&&V.every(w=>C.some(c=>c.id===w.categoryId)&&L.some(l=>l.id===w.levelId)));
T('Level 排序與 levelRank 一致（每級 rank 連續 50 個）',L.every(l=>{const r=V.filter(w=>w.levelId===l.id).map(w=>w.levelRank).sort((a,b)=>a-b);return r.length===50&&r[49]-r[0]===49}));
T('manifest 數字與實際資料一致',M.words===V.length&&M.withImages===950&&M.images===961&&M.categories===16&&M.levels===20&&M.missingImageWords===50);
T('預設清單：只啟用有圖詞（950）、無圖 50 詞不啟用、啟用的 ID 都存在',E.length===950&&E.every(id=>V.find(w=>w.id===id&&w.images.length))&&V.filter(w=>!w.images.length).every(w=>!E.includes(w.id)));
T('預設清單不含 Base64、錄音、姓名或學習紀錄',!/data:(image|audio)|recs|learner|password/i.test(JSON.stringify(D)));
T('音檔：詞彙以瀏覽器語音合成（沒有逐詞音檔欄位）；教師錄音另存本機，不在公開資料中',V.every(w=>!('audio' in w)));
// 注音音檔 37 個
const zy=fs.existsSync('/home/claude/repo/voice/zhuyin')?fs.readdirSync('/home/claude/repo/voice/zhuyin'):[];
T('37 個注音符號音檔存在（voice/zhuyin/zy_*.m4a），副檔名與檔名一致',zy.filter(f=>/^zy_[a-z]+\.m4a$/.test(f)).length>=37,zy.length);
T('聲調音檔缺漏已如實列出（不假裝存在）',fs.existsSync('/home/claude/repo/AUDIO-ASSETS.md')&&/聲調/.test(fs.readFileSync('/home/claude/repo/AUDIO-ASSETS.md','utf8')));
console.log('P',P,'F',F);process.exit(F?1:0);
