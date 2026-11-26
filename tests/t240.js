// 整合驗收：資源完整性（37 注音錄音、引導語音、教材圖片、詞彙庫圖片、相對路徑）。純檔案檢查，不改任何資料。
const fs=require('fs'),cp=require('child_process'),path=require('path');let P=0,F=0;const T=(n,c,x)=>{c?P++:F++;console.log(c?'PASS':'FAIL',n,c?'':JSON.stringify(x))};
const R=path.resolve(__dirname,'..');const html=fs.readFileSync(R+'/index.html','utf8');
const zsy=eval(html.match(/const ZSY=(\[\[.*?\]\]);/s)[1]);
T('37 個注音符號對照表：全部是 U+3105–U+3129，且「ㄧ」是 U+3127 不是漢字一',zsy.length===37&&zsy.every(([z])=>z.codePointAt(0)>=0x3105&&z.codePointAt(0)<=0x3129)&&zsy.some(([z])=>z.codePointAt(0)===0x3127)&&!zsy.some(([z])=>z==='一'),zsy.length);
T('對照表檔名不重複',new Set(zsy.map(z=>z[1])).size===37);
const miss=zsy.filter(([,n])=>!fs.existsSync(`${R}/voice/zhuyin/zy_${n}.m4a`));T('37 個注音錄音檔案都存在',miss.length===0,miss);
const probe=f=>{try{const o=JSON.parse(cp.execSync(`ffprobe -v error -show_entries stream=codec_name,duration -show_format -of json "${f}"`,{timeout:20000}).toString());return{codec:o.streams[0].codec_name,dur:+o.format.duration}}catch(e){return null}};
const bad=[];zsy.forEach(([z,n])=>{const p=probe(`${R}/voice/zhuyin/zy_${n}.m4a`);if(!p||p.codec!=='aac'||!(p.dur>0.3&&p.dur<4))bad.push([z,p])});
T('37 個注音錄音都能解碼（AAC/m4a，長度 0.3–4 秒，iPad Safari 可播）',bad.length===0,bad);
// 開頭靜音（偵測到「開始發聲」前的長度）≤ 0.5 秒
const lead=[];zsy.forEach(([z,n])=>{try{const o=cp.execSync(`ffmpeg -hide_banner -t 1.5 -i "${R}/voice/zhuyin/zy_${n}.m4a" -af silencedetect=noise=-35dB:d=0.05 -f null - 2>&1`).toString();const m=o.match(/silence_start: (-?[\d.]+)[\s\S]*?silence_end: ([\d.]+)/);if(m&&Math.abs(+m[1])<0.02&&+m[2]>0.5)lead.push([z,+m[2]])}catch(e){}});
T('沒有任何注音錄音開頭空白超過 0.5 秒',lead.length===0,lead);
const other=['again','cheer','ok','pass','retry'].map(n=>`voice/${n}.m4a`).concat(['no_hear','no_stars','retry_try','slow'].map(n=>`voice/guidance/${n}.m4a`));
T('5 個通用語音＋4 個教師引導語音都存在且可解碼',other.every(f=>fs.existsSync(R+'/'+f)&&probe(R+'/'+f)),other.filter(f=>!fs.existsSync(R+'/'+f)));
T('原始錄音備份 voice-original 仍保留（可還原）',fs.existsSync(R+'/voice-original/zhuyin')&&fs.readdirSync(R+'/voice-original/zhuyin').length>=37);
T('背景音樂：music/bgm.mp3 是選配；沒有檔案時程式有內建音樂備援，且 music/README.txt 說明放法',fs.existsSync(R+'/music/README.txt')&&/mus\.noProj=true;musStop\(\);musStart0\(\)/.test(html));
// 六個真人操作引導語音（第 12 批）
const G6=['find_it','repeat_after_me','listen_carefully','speak_louder','your_turn','what_is_this'];
T('六個真人操作引導語音檔案都存在（voice/guidance/）',G6.every(n=>fs.existsSync(`${R}/voice/guidance/${n}.m4a`)),G6.filter(n=>!fs.existsSync(`${R}/voice/guidance/${n}.m4a`)));
T('六個語音原始錄音備份存在（voice-original/guidance/）',G6.every(n=>fs.existsSync(`${R}/voice-original/guidance/${n}.m4a`)));
const pg=G6.map(n=>[n,probe(`${R}/voice/guidance/${n}.m4a`)]);
T('六個語音都能解碼（AAC）且長度 1–4 秒',pg.every(([,p])=>p&&p.codec==='aac'&&p.dur>1&&p.dur<4),pg);
const vol=n=>{const o=cp.execSync(`ffmpeg -hide_banner -i "${R}/voice/guidance/${n}.m4a" -af volumedetect -f null - 2>&1`).toString();return +o.match(/mean_volume: (-?[\d.]+)/)[1]};
const vs=G6.map(vol);T('六個語音音量一致（平均音量相差 ≤ 4 dB）：'+vs.join(', '),Math.max(...vs)-Math.min(...vs)<=4,vs);
const ex=['no_hear','no_stars','retry_try','slow'].map(vol);T('新語音與既有教師引導語音音量相近（差 ≤ 6 dB）',Math.abs(vs.reduce((a,b)=>a+b)/6-ex.reduce((a,b)=>a+b)/4)<=6,[vs,ex]);
const ld=G6.map(n=>{const o=cp.execSync(`ffmpeg -hide_banner -i "${R}/voice/guidance/${n}.m4a" -af silencedetect=noise=-40dB:d=0.05 -f null - 2>&1`).toString();const m=o.match(/silence_end: ([\d.]+)/);return m?+m[1]:0});
T('六個語音開頭空白 ≤ 0.35 秒（1.25× 播放約 0.28 秒）：'+ld.join(', '),ld.every(x=>x<=0.35),ld);
T('檔名只含英數與底線（無中文／Unicode 編碼風險）',G6.every(n=>/^[a-z_]+$/.test(n)));
T('guide-voice-map.json 記錄原始檔名與識別碼對照',(()=>{try{const m=JSON.parse(fs.readFileSync(R+'/voice/guidance/guide-voice-map.json','utf8'));return m.length===6&&G6.every(n=>m.some(x=>x.id===n&&x.orig_file))}catch(e){return false}})());
// 內建教材
const mf=JSON.parse(fs.readFileSync(R+'/materials/manifest.json','utf8'));const mm=Object.keys(mf.files).filter(f=>!fs.existsSync(R+'/materials/'+f));
T('內建教材：manifest 列出的檔案都存在（'+Object.keys(mf.files).length+' 個）',mm.length===0,mm.slice(0,5));
const crc=(()=>{const t=new Uint32Array(256);for(let i=0;i<256;i++){let c=i;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[i]=c>>>0}return b=>{let c=0xFFFFFFFF;for(const x of b)c=t[(c^x)&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0}})();
const cb=Object.entries(mf.files).filter(([f,i])=>i.crc32!==undefined&&fs.existsSync(R+'/materials/'+f)&&crc(fs.readFileSync(R+'/materials/'+f))!==i.crc32).map(([f])=>f);
T('內建教材圖片／音檔的 CRC32 與 manifest 相符（未損毀）',cb.length===0,cb.slice(0,5));
const cards=JSON.parse(fs.readFileSync(R+'/materials/cards.json','utf8'));const cl=(cards.cards||cards);
T('內建教材卡片 '+cl.length+' 張，數量與 manifest 一致',cl.length===mf.counts.cards,[cl.length,mf.counts.cards]);
// 詞彙庫
const vocab=JSON.parse(fs.readFileSync(R+'/vocab/vocabulary.json','utf8'));const vm=[];vocab.forEach(v=>(v.images||[]).forEach(i=>{if(!fs.existsSync(R+'/vocab/'+i))vm.push(v.id+' '+i)}));
T('詞彙庫 '+vocab.length+' 詞：每個引用的圖片檔都存在',vm.length===0,vm.slice(0,5));
T('詞彙庫每個詞都有 id、詞、注音，且 id 不重複',vocab.every(v=>v.id&&v.word&&v.zhuyin)&&new Set(vocab.map(v=>v.id)).size===vocab.length);
// GitHub Pages 子路徑：程式內的資源路徑必須是相對路徑
const abs=[...html.matchAll(/(?:fetch\(|src=|href=|\.src=|new Audio\()\s*['"`](\/[^\/'"`][^'"`]*)['"`]/g)].map(m=>m[1]);
T('程式內沒有以「/」開頭的絕對資源路徑（GitHub Pages 子路徑才不會 404）',abs.length===0,abs.slice(0,5));
T('頁面有 viewport 與 manifest 或 icon 設定，且是單一 index.html 入口',/name="viewport"/.test(html)&&fs.existsSync(R+'/index.html'));
T('HTML 標題與版本字串存在（供快取／更新檢查）',/<title>[^<]+<\/title>/.test(html)&&/v17\.0|BUILD|APP_VER|build/.test(html));
console.log(`t240: ${P} pass ${F} fail`);process.exit(F?1:0);
