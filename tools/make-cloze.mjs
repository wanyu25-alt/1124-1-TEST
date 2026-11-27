// 口語第2站五星「聽句子說詞」：由正式語言屬性產生問句草稿 → vocab/lang/cloze-draft.json
// 用法：node tools/make-cloze.mjs → vocab/lang/cloze.json（再執行 node tools/merge-lang.mjs 併入正式檔）
// - 來源①：用途（use）改成問句，例如「用來寫字」→「我們用什麼寫字？」
// - 來源②：例句「我用＋詞＋動作」改成「我用什麼＋動作？」
// - 例外寫法放在 FIX（逐句人工撰寫）；不適合的放在 SKIP
// - 答案可能不只一個（用途相同或互相包含、或同類詞也說得通）→ 標為 amb，預設不出題，列給教師確認
import fs from 'node:fs';import {RIDDLES} from './lang-src/riddles.mjs';import path from 'node:path';import url from 'node:url';
const ROOT=path.resolve(path.dirname(url.fileURLToPath(import.meta.url)),'..');
const M=JSON.parse(fs.readFileSync(path.join(ROOT,'vocab/language-metadata.json'),'utf8')),V=JSON.parse(fs.readFileSync(path.join(ROOT,'vocab/vocabulary.json'),'utf8'));
const byId=new Map(V.map(v=>[v.id,v])),byW=new Map(M.words.map(w=>[w.word,w]));
/* 人工撰寫（覆蓋自動句） */
const FIX={
 '汽車':null,'公車':'哪一種車可以載很多人，要在站牌等？','火車':'哪一種交通工具在鐵軌上跑，載很多人去遠的地方？','飛機':'什麼交通工具在天上飛，載人到很遠的地方？',
 '機車':null,'腳踏車':'什麼交通工具要用腳踩著前進？','救護車':'有人生病受傷，要坐什麼車去醫院？','消防車':'發生火災時，什麼車會來滅火救人？','警車':'警察開什麼車巡邏、抓壞人？',
 '船':'什麼交通工具可以在水上載人？','卡車':null,'計程車':'要叫什麼車，司機就會載你去想去的地方？','校車':'學生上學、放學可以坐什麼車？','遊覽車':'校外教學時，大家坐什麼大車出去玩？',
 '垃圾車':'什麼車會來把垃圾載走？','高鐵':'什麼交通工具很快，可以載人去遠的城市？','捷運':null,'電車':null,'纜車':'什麼交通工具掛在纜繩上，載人上山？','帆船':'什麼船有大大的帆，靠風前進？',
 '遊艇':null,'渡輪':null,'潛水艇':'什麼船可以在海裡面航行？','獨木舟':'什麼小船要用槳划？','滑板車':'什麼東西可以用腳踩著滑著走？','三輪車':'什麼車有三個輪子，小朋友騎著玩？',
 '輪椅':'不方便走路的人，可以坐什麼移動？','安全帽':'騎車時，頭上要戴什麼保護頭？','安全帶':'坐車時，要繫上什麼保護身體？',
 '衣服':null,'褲子':'什麼衣服是穿在腿上的？','帽子':'什麼東西戴在頭上，可以遮太陽？','襪子':'穿鞋子之前，腳上要先穿什麼？','鞋子':'出門前，腳上要穿什麼保護腳？','外套':'天氣冷的時候，要在外面多穿什麼？',
 '短褲':null,'長褲':null,'制服':'上學時，大家穿一樣的什麼？','內衣':null,'內褲':null,'拖鞋':'在家裡或去廁所，腳上穿什麼鞋？','口罩':'感冒時，要戴什麼遮住嘴巴和鼻子？',
 '眼鏡':'看不清楚時，可以戴什麼讓眼睛看得更清楚？','太陽眼鏡':'太陽很大時，可以戴什麼擋住太陽光？','髮夾':'用什麼可以把頭髮夾好？','髮圈':'用什麼可以把頭髮綁起來？','皮帶':'褲子太鬆會掉，要繫什麼？',
 '鈕扣':null,'拉鍊':'外套上可以拉上拉下的是什麼？','枕頭':'睡覺時，頭要靠在什麼上面？','棉被':'睡覺時，身上要蓋什麼保暖？','床單':null,'門':'進出房間要經過什麼？','窗戶':'什麼可以打開，讓光和風進來？',
 '電燈':'房間太暗了，要打開什麼？','檯燈':'寫功課時，桌上可以打開什麼燈？','手電筒':'停電時，可以拿什麼照亮？','電風扇':'天氣熱時，什麼會轉來轉去吹出風？','冷氣':'天氣很熱，可以打開什麼讓房間變涼？',
 '暖氣':'天氣很冷，可以打開什麼讓房間變暖？','烘衣機':null,'熱水器':null,'插頭':null,'插座':null,'電線':null,'電池':'遙控器沒電了，要換什麼？','鬧鐘':'早上什麼會響，叫人起床？','雨傘':'下雨時，我們撐什麼遮雨？',
 '門鎖':null,'門鈴':'客人來了，會按門口的什麼？','地墊':null,'地毯':null,'餐巾紙':'吃完飯，可以用什麼擦嘴巴？','圍裙':'煮菜時，身上穿什麼才不會弄髒衣服？','水龍頭':'洗手時，要打開什麼讓水流出來？',
 '洗手台':'洗手、洗臉要在什麼地方？','馬桶':'上廁所時要坐在什麼上面？','肥皂':null,'洗手乳':null,'牙膏':'刷牙時，牙刷上要擠什麼？','浴巾':'洗完澡，用什麼大毛巾擦身體？','面紙':'流鼻涕時，可以用什麼擦？',
 '黑板':'老師上課時，在教室前面的什麼上面寫字？','白板':null,'筆芯':null,'聯絡簿':'老師和家長用什麼本子互相聯絡？','書籤':'看書看到一半，可以夾什麼記住頁數？','釘書針':null,
 '鉛筆':null,'原子筆':null,'自動鉛筆':null,'蠟筆':null,'圖畫紙':null,'畫筆':null,'故事書':null,'繪本':null,'書櫃':null,'書架':null,'時鐘':null,'手錶':null,'鍋子':null,'瓦斯爐':null,'塑膠袋':null,'紙袋':null,'垃圾桶':null,'畚斗':null,
 '牙刷':'我們用什麼刷牙？','毛巾':'洗完臉，用什麼擦乾？','剪刀':'我們用什麼剪紙？','橡皮擦':'寫錯字了，可以用什麼擦掉？','尺':'要畫直線，可以用什麼？','膠水':'要把紙黏起來，可以用什麼？','書包':'上學時，課本和鉛筆盒要放在什麼裡面？'
 ,'桌子':'寫功課時，課本要放在什麼上面？','椅子':'上課時，我們坐在什麼上面？','沙發':'客廳裡軟軟的、可以坐好幾個人的是什麼？','床':'晚上睡覺要躺在什麼上面？',
 '毯子':null,'抽屜':'桌子下面可以拉出來放東西的是什麼？','窗簾':'窗戶旁邊可以拉起來擋陽光的布是什麼？','抹布':'我們用什麼擦桌子？','海綿':null,
 '菜瓜布':'洗鍋子時，用什麼粗粗的東西刷？','洗碗精':'洗碗時，要擠什麼才會起泡泡？','碗':'吃飯時，飯要裝在什麼裡面？','盤子':'我們用什麼平平的餐具裝菜？',
 '杯子':'喝水時，要把水倒進什麼裡面？','水壺':'上學時，可以帶什麼裝水？','保溫瓶':null,'菜刀':'切菜要用什麼刀？','餐刀':'吃牛排時，用什麼刀切？','砧板':'切菜時，菜要放在什麼上面？',
 '箱子':'我們用什麼裝很多東西、搬來搬去？','盒子':null,'籃子':'野餐時，水果可以裝在什麼有提把的東西裡？','膠帶':'什麼一捲一捲，可以把東西黏住？','口紅膠':null,'雙面膠':null,
 '香皂':null,'彩色筆':null,'白紙':null,'粉筆':'老師用什麼在黑板上寫字？','水彩':null,'顏料':null,'筆記本':null,'作業本':'我們在什麼本子上寫功課？',
 '漏勺':'撈水餃可以用什麼有洞的勺子？','便當盒':'中午的飯菜，可以裝在什麼盒子裡帶去學校？','餐盒':null,'積木':'什麼玩具一塊一塊，可以疊高高？',
 '球拍':'打羽毛球要用什麼？','球棒':'打棒球要用什麼？','電磁爐':null,'烤箱':'烤麵包可以用什麼？','衛生紙':'上完廁所，要用什麼擦乾淨？','面紙':null,'貨車':null,'手指':'我們用什麼數一、二、三？','水桶':'拖地前，要用什麼裝水？'
};
const SKIP=new Set();
const q1=w=>{const u=(w.use||'').trim();if(!u)return null;let m;
 if((m=u.match(/^(.*?)時?用來(.+)$/))&&m[1])return m[1]+'時，我們用什麼'+m[2]+'？';
 if(/^用來/.test(u))return '我們用什麼'+u.slice(2)+'？';
 if(/^讓/.test(u))return '什麼東西可以'+u+'？';
 if(/^(穿|戴|鋪|蓋|掛)在/.test(u))return '什麼東西'+u+'？';
 return '什麼東西可以'+u+'？'};
const q2=w=>{for(const s of w.sent||[]){const e=s.ex||'',m=e.match(new RegExp('^我用'+w.word+'(.+)$'));if(m)return '我用什麼'+m[1]+'？'}return null};
/* 答案可能不只一個：用途相同或互相包含 */
const nu=u=>String(u||'').replace(/^(用來|可以|讓|幫助)/,'').replace(/[，,。、\s的]/g,'');
const uses=M.words.filter(w=>w.use).map(w=>[w.word,nu(w.use)]);
const ambOf=w=>{const a=nu(w.use);if(!a)return[];return uses.filter(([x,b])=>x!==w.word&&b&&(a===b||a.includes(b)||b.includes(a))).map(([x])=>x)};
const out=[],skipped=[];
for(const w of M.words){const v=byId.get(w.id);if(!v.images||!v.images.length||w.review==='needs_review')continue;
 if(!(w.pos||[]).includes('名詞'))continue;
 const fix=Object.prototype.hasOwnProperty.call(FIX,w.word)?FIX[w.word]:undefined;
 if(fix===null){if(w.use)skipped.push(w.word);continue}
 let q=fix||q1(w)||q2(w),src=fix?'fix':q1(w)?'use':'sent';if(!q)continue;
 if(q.includes(w.word)){skipped.push(w.word+'（句子含答案）');continue}
 const amb=fix?[]:ambOf(w);out.push({id:w.id,word:w.word,q,src,lv:v.levelId,...(amb.length?{amb}:{})})}
/* 猜謎問句（動物、水果蔬菜、食物、植物自然）：教師確認前標 pending，不併入網站 */
const RIDDLE_OK=true;/* 2026-11-28 教師確認 BATCH05-RIDDLE-REVIEW.md */
for(const [word,q] of Object.entries(RIDDLES)){const w=byW.get(word);if(!w||out.some(x=>x.id===w.id))continue;if(q.includes(word)){skipped.push(word+'（猜謎含答案）');continue}
 out.push({id:w.id,word,q,src:'riddle',lv:byId.get(w.id).levelId,...(RIDDLE_OK?{}:{pending:true})})}
out.sort((a,b)=>a.id<b.id?-1:1);
fs.writeFileSync(path.join(ROOT,'vocab/lang/cloze.json'),JSON.stringify({schema:1,kind:'cloze',made:new Date().toISOString().slice(0,10),note:'口語第2站五星「聽句子說詞」問句；2026-11-27 教師確認（BATCH05-CLOZE-REVIEW.md）。amb＝答案可能不只一個，不出題。由 merge-lang.mjs 併入 language-metadata.json 的 clz 欄位。',items:out},null,1));
console.log('問句',out.length,'（猜謎待確認',out.filter(x=>x.pending).length,'）','（答案可能不只一個',out.filter(x=>x.amb).length,'）略過',skipped.length);
console.log(out.map(x=>(x.amb?'⚠':'')+x.word+'｜'+x.q).join('\n'));
