# PROJECT-HANDOFF｜詞彙特快車（Vocabulary Express）

> **最新完整開發基準：v22.5.5（建置 20261127-04F）**，2026-11-27 第04-F批（v22.5.4 已推送部署，提交 0056d4b，iPhone 驗收通過）。
> **GitHub 部署基準**：`wanyu25-alt/1124-1-TEST` main 提交 `78932bb`（根目錄 index.html＝v22.4.1，SHA-256 d4cc68e6…，線上已部署並經教師 Chrome／Safari 驗收）。第04批尚未推送。
> **重要教訓**：增量包必須以 GitHub 實際提交為基準（不是舊 ZIP）；交付前比對校驗碼；部署後用 Console `APP.build+' '+APP.id` 確認版本。教師以 GitHub 網頁版「Add file → Upload files」上傳，**只能拖入檔案本身，不能拖整個資料夾**（曾因此產生子資料夾 vocabulary-express-v22_2-patch／v22_3-patch，待刪除）。
> 新對話請提供：GitHub 目前的實際檔案（或最新完整網站）＋本文件＋DEVELOPMENT-ROADMAP.md。

## 0-I. 第05-B批摘要（最新，v22.6.1，建置 20261127-05B，未推送）
- P36：口語第2站五星 → `speak` 子題型 `clz`「聽句子說詞」（FL.ladder 包裝替換第 5 個）。問句 `CLZ.q`＝教師 `S.cx[id].clz`＞正式 `clz`；showQ 包裝隱藏 #pic、念問句；第一次 SK.give 或等待（GV your_turn 之後的 tick）→ `CLZ.reveal` 顯示圖片並記 `RE.hint('P1',{what:'顯示圖片（聽句子說詞）'})`；`rec.ext.clz`。FL.setupHtml 加「為什麼有些難度尚無教材」。
- 問句來源：`tools/make-cloze.mjs`（FIX 人工句）→ `vocab/lang/cloze.json` → `tools/merge-lang.mjs`。iOS 預錄：`bash tools/make-tts-audio.sh 清單`。
- 新批次的包裝請放在 P36 之後、開機程式之前。

## 0-H. 第05批摘要（v22.6，建置 20261127-05，已推送 5341a17）
- 正式 1000 詞語言屬性：`vocab/language-metadata.json`（由 `tools/merge-lang.mjs` 合併 `vocab/lang/05-01～05-10.json`；撰寫稿 `tools/lang-src/`；驗證 `tools/validate-lang.mjs`）。欄位見 LANGUAGE-METADATA-SCHEMA.md，詳細見 BATCH05-REPORT.md。
- P35：`LM` 模組。`cxOf` 改為 `let`，P35 包裝成「正式資料＋教師 S.cx（優先）」；`LIB.load` 後載入；`PH.ok` 的 speak obj／newimg 以原始 S.cx 判斷（`LM.raw`）；`PICK.build` 的 use 題替換會同時成立的干擾選項（`LM.clash`）；`PICK.item`／`PH.sem` 用問句。審查狀態 `S.cx[id].lmrv`；needs_review 與 teacher_off 不用正式資料。後台：`LIB.view`／`LIB.detail`／`WD.panel` 包裝；`LM.exp`／`LM.imp`。
- 開放：第1站五星聽用途選圖、口語第2站四星看動作說詞、五星看情境說詞。
- 新批次的包裝請放在 P35 之後、開機程式之前。

## 0-G. 第04-H批摘要（v22.5.7）
- 「這是什麼」只在每回合第 1、2 題（P18 兩處 qi 條件 3→2）。
- P34：`gv_what`／`gv_turn` 播放中，辨識符合目標詞（SK.match／MV.judge 有 by）→ AM.cut、記為 asr 成功、`ext.oral.duringPrompt`。其他語音期間仍略過結果。新批次包裝放在 P34 之後。

## 0-F. 第04-G批摘要（v22.5.6）
- 教師決定：口語練習只有一星先念示範；二星以上新詞直接看圖說（SM.plan 包裝取消起點評量的兩題拆分、SM.pre 包裝將 expose 轉為 speak；題數＝詞彙數）。
- Mac Chrome 的 mic-test A～D 都正常（輸入裝置是接續互通的 iPhone 麥克風）；但口語練習「有聲波、辨識不到」（顯示「有聽到你的聲音」或「聽不清楚」）。2026-11-27 v22.5.6 部署後，教師回報 Mac Chrome 口語三星「一切正常」（有聲波、能辨識），沒有再出現辨識不到的情況；若再出現，用 BATCH04B-REPORT 12-3 的 Console 指令取得紀錄。

## 0-E. 第04-F批摘要（v22.5.5）
- 教師回報三台裝置口語練習「讀不到聲音、沒有聲波」。模擬環境中流程正常（聽詞認識→我知道了→口說題有聲波與辨識）。
- 新增 `mic-test.html`（A～E 真機麥克風／辨識診斷，唯讀讀取網站 IndexedDB trafficHero/kv/s，不建立資料庫）；P33：口語練習的聽詞認識畫面顯示聲波並暫停背景音樂。**等待教師的 mic-test 結果**，再依結果針對性修正（BATCH04B-REPORT 第 11 節）。新批次包裝放在 P33 之後。

## 0-D. 第04-E批摘要（v22.5.4）
- 教師同意（11 段試聽音檔尚未上傳即同意全部錄製，iPhone 聲音品質待本批上傳後驗收）：iPhone／iPad 改播預錄詞彙音檔。`voice/tts/`：1818 段 m4a（1000 詞彙＋818 單字，macOS Meijia、速度 131≈AI 0.75，AAC 32k 單聲道，約 15 MB），`index.json` 文字→檔名；重錄或補錄：`bash tools/make-tts-audio.sh 清單檔`（清單可由 ZG.charPlan 產生，見 BATCH04B-REPORT 第 10 節）。
- P32：iOS 時 `TTSX.say`／`speak` 遇到有音檔的文字就播音檔；無音檔或失敗退回 TTS＋P31 文字；`S.set.iosPre=false` 可關閉。新批次包裝放在 P32 之後。
- 限制：多音字依美佳預設讀音（同 TTS）；老師自訂教材在 iPhone 無聲（顯示文字），可補錄。
- **2026-11-27 已部署（0056d4b），教師 iPhone 驗收通過：可正常播放。** 語音問題告一段落：Mac Safari／Chrome 用合成語音（Chrome 卡住時 ⌘Q），iPhone／iPad 用預錄音檔。下一步：第04批口語練習真機驗收（BATCH04-REPORT 第 9 節）。

## 0-C. 第04-D批摘要（v22.5.3）
- iPhone（iOS 18.7）Safari 網頁合成語音：測試頁所有方式（含先播錄音／音效、audioSession playback／transient／ambient）都無聲，系統朗讀正常 → 網頁無法修正。教師**兩次決定暫不預錄詞彙音檔**。
- P31：iOS 念題目詞彙時直接顯示文字（聽詞選圖開啟顯示文字、打字／聽打顯示於圖片下方、口語不顯示），紀錄 `ext.tx={v:1,a:'ios-tts'}`。`S.set.iosTxt=false` 可關閉。新批次包裝放在 P31 之後。
- 另：念「空字串」會讓 iOS 語音佇列卡住（P29 已避開）。Mac Chrome 語音卡住時須 ⌘Q 重開（P30 會提示）。

## 0-B. 第04-C批摘要（v22.5.2）
- 教師實測 v22.5.1：Mac Safari 聲音怪（網站選到趣味語音 Shelley）；Mac Chrome 測試頁全部「沒有開始、speaking 一直 true」＝Chrome 本身語音卡住；iPhone 仍無聲（待測試頁結果，推測同為趣味語音）。
- P30：`TTSX.cands` 重新排序（老師指定→美佳→其他台灣中文→其他中文→趣味語音最後）；`P30.hit` 偵測卡住並提示大人一次；診斷標示趣味語音與卡住狀態。新批次包裝放在 P30 之後。

## 0-A. 第04-B批摘要（v22.5.1）
- 教師實測 v22.5：Mac Chrome、iPhone Safari 合成語音（AI 念詞彙）完全沒有聲音（連語音診斷試聽也沒有），Mac Safari 正常；真人錄音、音樂、音效正常。第04批真機口語驗收因此暫停。
- P29：非 iOS 不念音量 0／空白解鎖語音、iOS 改正常音量空格、只在暫停時 resume、非 iOS 開啟與首次點擊時 cancel 一次；`P29.last` 記錄最近一次回報；語音診斷加「合成語音檢查」。
- 新增 `tts-test.html`（獨立語音測試頁，11 項）。原因尚未證實，**等待教師用測試頁在 Chrome／iPhone 回報結果**，再做針對性修正（見 BATCH04B-REPORT.md 第 7 節）。新批次包裝放在 P29 之後。

## 0-0. 第04批摘要（v22.5）
- **根本原因**：智慧出題把新詞只排「聽詞認識」→ 口語練習第二回合起可能整回合只有「我知道了」、沒有聲波；「我知道了」被記成獨立完成。詳見 BATCH04-REPORT.md。
- **已修復**：口語練習新詞改為「先聽示範→自己說」（記為示範後仿說）；「我知道了」改存 `S.expLogs`；單音節詞嚴格比對；`rec.ext.oral`（A～F 分類、大人確認與電腦辨識分開記錄；示範後仿說不算獨立；**教師已確認：大人按「正確說出」仍算獨立說出**）；拒絕權限後不每題重問；收不到訊號偵測；聲波區狀態；說話／停頓中不插入提示、六站二星自動提示 6→10 秒；綜合練習口說不自動略過、no-speech 不算失敗、修正「✔ 完成」無效；口說等候預設 10 秒。
- **程式位置**：`/*P28*/`（P27 之後、開機程式之前），新批次的包裝請放在 P28 之後。
- **測試環境（本批新建，不上傳）**：`.testenv/`（Node v26、jsdom 27、fake-indexeddb、Playwright Chromium＋WebKit）；`bash .testenv/run-tests.sh [jsdom|e2e|all]`。測試中寫死的舊路徑由此腳本自動替換。
- **尚未確認**：真實麥克風與真實辨識引擎的口語表現（Chrome／Safari）；iPad。
- **第05批**：等教師完成第04批真機口語驗收後才開始，以 v22.5 為基準。

## 0. 第03-B批摘要
- **已修復**：GitHub 部署落差（v22.3→v22.4.1 累積更新，只需上傳 index.html）；舊版示範教材方案A（備份後移除、老師改過的保留、分類保守處理、可復原）；materials/ 兩個 404 與錯誤教材警告；合成語音候選順序與有限次數備援；語音診斷可試聽與指定語音；版本與建置識別碼。
- **教材清理決策**：方案A（教師確認）。只移除與原始簽章相同的示範圖卡；老師改過的改屬教師自訂；舊分類僅在無保留圖卡時移除；備份在裝置本機 `pre-legacy-remove`；`S.legacyGone` 防止重複；`?legacypack=1` 停用。與 GitHub 15:30 的 P23B 差異：分類保留規則更保守（t291 已更新）。
- **Chrome／Safari 真機結果（教師回報，修復前 v22.3）**：Mac Safari：背景音樂、答對音效、真人注音、完整詞彙朗讀都正常。Mac Chrome：可取得 24 個中文語音，但 Console 直接 speak 與部分遊戲詞彙沒有聲音。v22.4.1 修復後**尚待教師實測**。註：Chrome 需點擊頁面後才能播放合成語音，Console 測試可能被擋。
- **尚未確認**：Chrome 實際能否發聲（需用語音診斷試聽指定）；Safari 是否維持正常；WebKit 自動測試缺環境；輕聲輸入順序待教師確認。
- **本次修改檔案**：網站：`index.html`（P27 區段、`APP`、TTSX.say 可指定語音並保留參照、speak() 改用 TTSX.pick、教材版本面板顯示建置）。開發：BATCH03B-REPORT.md、CHANGELOG.md、KNOWN_ISSUES.md、DEVELOPMENT-ROADMAP.md、PROJECT-HANDOFF.md、PATCH-README.md、PATCH-MANIFEST.json、tests/e2e/batch03b-deploy.js、tests/e2e/lib/voice-stub.js、tests/t291.js、tests/t22.js、tests/t230.js、tests/e2e/batch01-material.js、batch02-source.js、batch03-guide.js（另含 v22.4 尚未上傳 GitHub 的文件與測試）。
- **第04批待執行**：v22.5 麥克風與語音辨識優化（等待 v22.4.1 部署驗收後開始）；口語流程 V2.run／V2.gate；沿用 TTSX 語音備援。


> 給下一個 Claude 對話的交接文件。新對話請同時提供「最新版網站 ZIP」與本文件。
> 本文件依實際程式與文件撰寫，最近更新：**v22.4（第03批）2026-11-26**。開發採 12 批增量更新，進度見 DEVELOPMENT-ROADMAP.md。
> 新對話請提供：最新完整網站（v22.1 ZIP＋之後各批增量包，或已更新的專案資料夾）＋本文件＋DEVELOPMENT-ROADMAP.md。

## 1. 專案目的
國小特殊需求學生（自閉症、ADHD、低口語、詞彙提取困難、仿說等）的遊戲化詞彙學習網站：聽覺理解、圖詞連結、詞彙提取、注音輸入、口語表達、語意組織、短語／語句組合、生活溝通。教師端提供學習歷程分析，家長端提供家庭複習。系統紀錄是教學參考，**不是臨床評估或診斷**。

## 2. 目前版本
- 程式 build：`v22.6.1`，建置 `20261127-05B`。**版本唯一來源**：index.html 主程式開頭 `const APP={build:'v22.6.1',id:''}`（建置 id 在 P27 設定）（備份清單、教師後臺、完整性檢查、診斷都讀它；升版只改這一處）。
- 開發方式：分批增量更新；v22.4＝v22.1 完整 ZIP＋第01、02、03批增量包（依序覆蓋）。線上 GitHub Pages 仍為 v22.1（使用者確認，兩批預定一起推送）。
- 正式教材：V077_merged（1000 詞／16 主題／20 Level／961 張 WebP／950 有圖詞／50 缺圖詞）。
- v22.1 基準 ZIP SHA-256：`8b5a66a1208b29175279e12ed61da84a8fc516f63efa20d8c24feec2f6bef9ce`；各批檔案校驗見 PATCH-MANIFEST.json。

## 3. 系統架構
- 純靜態網站，GitHub Pages：`wanyu25-alt/1124-1-TEST` → `https://wanyu25-alt.github.io/1124-1-TEST/`。無後端、無 Service Worker。
- `index.html`（約 950 KB，全部程式在單一檔案，以 `/*Pxx*/` 區段標記模組）。
- 主要模組：`S`（全域狀態，存 IndexedDB／localStorage）、`UI`、`FL`（六站流程：`FL.ladder`／`FL.chk`／`FL.extras`／`FL.setAct`）、`LIB`（正式詞彙庫）、`MAT`（前臺教材統一存取層，`MAT.origin()` 判斷來源）、`SNAP`（練習快照）、`CB`（詞彙組合）、`SE`／`SCN`（語句／生活情境）、`LA`（學習分析）、`VP`（五階段學習履歷，保留）、`GV`（真人引導語音）、`AM`（語音管理）、`TTSX`／`VF`／`VDX`（v22.1 合成語音備援、文字備援、語音診斷）、`ACL`（教師入口鎖）、`MATFIX`（v22.2 教材讀取修復與唯讀診斷，`/*P24*/`，包裝 FL.chk／FL.migDim／LIB.sync／LIB.v22Boot）、`SRC`（v22.3 教材來源管理、安全修復、六站可用題數，`/*P25*/`）、`ZG`（v22.4 單一步驟逐音引導，`/*P26*/`）、`LEG`／語音備援／語音診斷擴充（v22.4.1，`/*P27*/`）。`P28`（v22.5 口語練習、辨識判定 A～F、`rec.ext.oral`、聲波區狀態、V2 不自動略過）。P24～P28 都位於開機程式之前，是最後一層包裝；新批次的包裝請放在 P28 之後。
- 語音（v22.4.1）：所有合成語音經 `TTSX.say`（P23＋P27 包裝）；候選 `TTSX.cands()`（教師指定 `S.set.ttsVoice`→本機 zh-TW→原規則 `TTSX.voice0`→其他 zh-TW→zh-Hant/HK→其他中文）；失敗換語音最多 2 次，`TTSX.bad` 本次略過；`TTSX.pick()` 給舊逐字語音用。舊版教材：`LEG.purge`／`LEG.undo`，`packLoad` 已改為不讀 materials/。
- 打字題語音流程（v22.4）：`ask()`→`V2.ask`→`V2.auto`（延遲 `S.set.apd`）→`V2.playQ`→（打字題）`ZG.start`＝念詞＋依層級的目前一個注音。按鍵：`kPress`（最外層 ZG 包裝）→KV 按鍵回音→原 kPress（判斷、`wrongHit` 鼓勵語音）→`ZG.after` 等 KV 與 AM 語音結束再 `ZG.prompt`。聲調提示用 `ZG.charPlan`（上傳音節錄音＞單字合成＞同音字＞整個詞）。完成：`V2.word` 先排隊念詞，`AM.say`／`AM.after` 在 `ZG.wp` 期間排隊。層級：`ZG.level()` 依 `FL.run.star`。紀錄：`v2.zg`。所有聲音共用 ZQ（單一 Audio＋序號），新播放會中止舊的。
- 題庫篩選鏈（重要）：`deck()`→`LRN.words(pool())`；`pool()` 依 `S.set.src` 取來源（`sel`＝`MAT.selPool`＝個案範圍 `ext.fl.sel` 的分類聯集），再依序經過：排除詞彙零件 `part`→個案排除 `ext.excl`→個別學生詞彙範圍 `LIB.selEff()`→非拼音模式排除沒有圖片的正式詞→**停用來源 `SRC.cardOn`**（v22.3）。
- 教材來源：`S.matSrc={legacy:0|1,custom:0|1,log[]}`，未設定＝預設不使用（正式教材無法使用時自動備援）；`SRC.on(k)`、`SRC.cardOn(card)`、`SRC.catOn(catId)`；來源依 `MAT.origin`（builtin／legacy／custom）。`FL.chk` 以 `FL.withSrc` 暫時切換來源計算各站可用數。
- 入口：首頁（聽讀／口語／綜合三入口）、家長專區（6 分頁）、設定、教師專區（19 分頁）。
- 外部函式庫：`lib/pinyin-pro.js`（本機）。

## 4. 教材資料結構
| 來源 | 位置 | 識別 |
|---|---|---|
| 正式內建 builtin | `vocab/vocabulary.json`、`categories.json`、`levels.json`、`default-library.json`、`images/VOCxxxx_NN.webp` | `card.lib=1`，ID＝VOCxxxx |
| 教師自訂 custom | 瀏覽器本機 | 其他圖卡，本機唯一碼 |
| 舊版內建 legacy | `materials/`（18 張圖卡、4 分類：水果／交通工具／民生用品／三餐） | `S.packIds`／`S.packCats` |
- 正式詞彙欄位：`id, word, zhuyin, category, categoryId, images[], primaryImage, hasImage, levelId, levelRank, reviewStatus, pronunciationReview`。**沒有詞性、語意、情境、功能、關係等欄位**（影響第 2～6 站部分題型）。
- 正式詞彙圖片只有在審核為 approved 時才出現（`ov.rv`＞`LIB.defRv`（default-library.json，v22.2 起另存 `S.lib.defRv` 快取）＞vocabulary.json）。
- 每個正式詞只有 1 個主題（categoryId）＋1 個 Level；Level 以分類 `LIB-LVxx`（`lvl:1`）掛在 `card.cats`。
- 第 3～6 站教材另存：`S.cb`（組合）、`S.mx`（矩陣）、`S.se`（語句）、`S.sc`（情境）。**全新裝置預設皆為 0 筆**；「載入示範教材」會另建約 35 個文字「詞彙零件」與約 22 個組合，不連結 VOC 正式詞。
- 詳細欄位見 `DATA-STRUCTURE.md`、`MATERIAL-V22.md`。

## 5. 已完成的功能（模擬測試通過，多數尚未實機）
六站×三模式×五星階梯；交通工具動畫、星星、成就；注音逐音引導、實體／觸控注音鍵盤、一聲空白鍵、自行修正紀錄；真人錄音 1.25×、AI 0.75×；37 注音音檔、11 個引導語音；麥克風自適應 VAD、回音消除／噪音抑制／自動增益；口語辨識結果分級、教師確認；正式教材一律載入（v22.0）＋遷移備份；教材完整性檢查；學習分析（20 Level／16 主題／六站／能力、三階段熟悉度、尚無學習紀錄另列）；智慧複習；家長專區；完整備份／還原（含 SHA-256）；v22.1 合成語音備援＋顯示文字＋語音診斷（`ext.tx`）。

## 5-1. v22.2（第01批）已完成
- 失效練習範圍自動修正（刪除分類後不再 0 詞）、個別學生詞彙範圍失效時不排除全部正式詞、審核預設值快取、教材初始化後重算、訊息更正、唯讀診斷 `MATFIX.diag()`／DIAG-CONSOLE.md。詳見 BATCH01-REPORT.md。

## 5-2. v22.3（第02批）已完成
- 教材來源管理（舊版／自訂預設不使用、可啟用停用）、所有練習範圍與家長直接複習排除停用來源、正式詞彙／主題／Level 刪除保護、教材安全修復（備份＋復原）、六站可用題數、完整性檢查補強、版本字樣統一。詳見 BATCH02-REPORT.md。

## 5-3. v22.4（第03批）已完成
- 設定畫面移除任務摘要；單一步驟逐音引導與星級引導層級；聲調改播國字讀音；輕聲輸入順序改為最後；AI 語音速度被舊版教材改成 0.5 的錯誤已修；語音佇列避免重疊與過時提示。詳見 BATCH03-REPORT.md。

## 6. 尚未完成的功能
- 延伸活動入口（K-44）：`FL.extras` 程式存在，畫面無入口。
- 第 3～6 站與 1000 正式詞的連結教材（組合、語句、情境）。
- 正式詞缺詞性／情境／多圖／功能資料 → 第 1 站 5★、口語第 2 站 4★／5★ 無法使用。
- 智慧複習依教材來源過濾、20 Level 分析補強、麥克風新優化、效能實測。
- 聲調音檔未錄；AI 音量 1.5× 受瀏覽器上限 1.0 限制。

## 7. 已知問題（接手檢查發現）
0. （v22.2 已修）刪除分類後第1、2站 0 個詞彙；使用者已更換電腦，舊電腦實際原因無法再診斷（新電腦正常）。
1. 全新裝置第 3～6 站所有星級顯示「尚無教材」（三模式皆然）。
2. （v22.3 已修）前臺預設題庫含舊版 18 張圖卡。
3. （v22.3 已修）教師後臺「教材版本」面板寫死「程式版本 v20.0」。
4. 測試 `t33` 斷言 `voice-original/guidance` 應為 4 個，實際 10 個（v18.0 新增 6 個後未更新）。
5. 多支測試寫死路徑（`/mnt/user-data/outputs/vocabulary-express`、`/home/claude/repo`、`/tmp/e2e/sv4.mjs`）；`t180`／`t190`／e2e `phase5`／`phase6` 需要 git 提交 `a4b8444` 的舊版樣本，ZIP 沒有 `.git`，無法重現；`t19a` 需要不公開的私人錄音資料夾。
6. README 中段仍有舊儲存庫名 `1124-express` 的說明（6 處）；FEATURE-STATUS 標題仍為 v21.0；`TEST-REPORT.md`／`TEST_REPORT.md` 兩份並存。
7. iPhone／iPad 語音問題：v22.1 已加修復，**尚未實機驗證**。

## 8. 已確認的教育設計原則
- 學生端操作簡單、正向、不加時間壓力；反應慢不判失敗；語音辨識失敗不算答錯；偵測到聲音不等於答對。
- 技術異常備援不扣星、不算學生主動提示、不降低熟悉度；文字輔助不計入純聽覺獨立完成率。
- 注音部分提示依序聲母→介音→韻母→聲調，每新增 −1 星，完整 −4，已給不重扣（**目前扣星預設關閉**，待使用者決定）。
- 熟悉度只用三階段（待加強／學習中／已熟悉）；「尚無學習紀錄」≠待加強。
- 教師確認完成與學生獨立完成分開記錄；預設不存學生原始錄音。
- 不新增麥克風設定區塊；不新增過多教師設定。
- 不需要麥克風的模式不得要求權限。
- 不自行重配交通工具與題型對應；不移除既有功能。

## 9. 重要的程式開發決策
- 單一 index.html；新增模組以 `/*Pxx*/` 標記，用包裝（wrap）既有函式的方式擴充。
- 正式詞彙一律載入，只排除教師明確停用（`off`）；首次遷移先備份到 IndexedDB `lib-pre-v22`。
- 主題與 Level 兩維度獨立，多選依詞彙 ID 去重聯集；題數＝不同詞彙數，不重複湊數。
- 練習快照 SNAP：遊戲中教材變動不影響本次練習。
- 教材資料以 no-cache 讀取；index.html 受 Pages 快取約 10 分鐘。
- 不把清除網站資料當修復方法；資料遷移須備份、保留穩定 ID、可回復。

## 10. 最新測試結果
### v22.4（第03批）
- 新增 e2e `batch03-guide.js` 39 通過（音訊以 `tests/e2e/lib/audio-stub.js` 替身記錄播放順序，非真實聲音）。
- jsdom 1905 通過，失敗項與基準相同；e2e 23 檔 321 通過／0 失敗。
- 因規格調整：t30、t19b、t17、phase14、batch01、batch02、t230。

### v22.3（第02批）
- 新增 e2e `batch02-source.js` 32 通過；`batch01-material.js` 29 通過。
- jsdom 完整回歸 1905 通過，失敗項與基準相同（t180 9、t33 1；t190／t19a 無法執行）。
- e2e 完整回歸 22 檔 282 通過／0 失敗（phase5／phase6 缺樣本）。
- 因規格變更調整：t283（新增 G0、啟用自訂來源後測出題）、t180 ⑫（啟用自訂來源）、t230（版本）。

### v22.2（第01批）
- 新增 e2e `batch01-material.js` 29 通過／0 失敗（同測試在 v22.1 失敗，確認能抓到錯誤）。
- jsdom 完整回歸 1904 通過，失敗項與 v22.1 基準完全相同（t180 9、t33 1；t190／t19a 無法執行）。
- e2e 完整回歸 250 通過／0 失敗（phase5／phase6 缺樣本未執行）。
- 測試執行方式：jsdom 需 `NODE_PATH` 含 jsdom、fake-indexeddb，`IDX`／`VDIR` 指向專案，並把測試中的 `/mnt/user-data/outputs/vocabulary-express` 換成專案路徑、建立 `/home/claude/repo` 連結；e2e 需本機伺服器提供 `/1124-1-TEST/` 路徑（埠 8124）。

### v22.1 接手檢查
- 環境：Node 22、jsdom＋fake-indexeddb、Playwright Chromium；本機靜態伺服器模擬 `/1124-1-TEST/`。
- jsdom：61 檔，1904 通過／1 失敗（t33 舊斷言）；另 t180 9 項失敗、t190／t19a 無法執行——皆因 ZIP 缺 git 歷史樣本或私人錄音，不是程式錯誤。路徑需替換後才可執行。
- e2e：20 檔 231 通過／0 失敗；phase5／phase6 因缺舊版樣本未執行。
- 文件宣稱 v22.1 為 jsdom 1972／e2e 262 全通過，差異來自上述無法重現的檔案。
- **沒有任何 iPhone／iPad／Android／Windows／macOS 實機或真實學生測試。**

## 11. 下一階段開發建議
第05批（v22.6）已完成，待教師上傳驗收。下一批＝**第06批 第3、4站教材（v22.7）**：等教師驗收 v22.6 並同意後才開始；先提架構與示例，確認後才大量生成；優先引用 `vocab/language-metadata.json` 的 acts／objs／rel。（以下為舊紀錄）口語相關：口語練習走 SK（`asrRes`／`SK.match`／`MV.judge`）、綜合練習口說步驟走 V2（`V2.run`／`V2.asr`），兩者已共用 P28 的判定與紀錄。待教師確認：輕聲輸入順序（已改為最後）。升版只改 `APP.build`。

（以下為接手時的整體建議，已併入 DEVELOPMENT-ROADMAP.md 12 批規劃）
1. 實機驗證 v22.1 iPhone／iPad 語音（後臺「語音診斷」回報）。
2. 教材來源預設開關（學生端預設只用正式教材，舊版／自訂可由教師啟用；停用≠刪除）。
3. 第 3～6 站教材：以 VOC 正式 ID 建立組合／語句／情境教材，或至少預設載入 11 個情境模板；提供六站可用題數表。
4. 延伸活動放進教師後臺入口（K-44）。
5. 智慧複習排除停用來源；20 Level 分析補強。
6. 小修：教材版本面板版本字樣、t33 斷言、測試路徑改用環境變數、README 舊網址。

## 12. GitHub 部署狀態
- 2026-11-27：v22.6（提交 5341a17）教師已推送；v22.6.1 尚未推送。
- 2026-11-27：v22.5.7 已推送（提交 569cdbc），教師 Mac Chrome／Safari 驗收；v22.6（第05批）尚未推送。
- 2026-11-27：v22.5.1（提交 487d90f）已推送；v22.5.2 尚未推送。
- 2026-11-26：v22.5（提交 f12b715）已推送部署；教師實測發現 Chrome／iPhone 合成語音無聲 → 第04-B批 v22.5.1（未推送）。
- 2026-11-26：v22.4.1（提交 78932bb）已推送並部署，教師完成 Chrome／Safari 驗收。舊增量包子資料夾 v22_2／v22_3／v22_4 已從儲存庫移除。v22.5 尚未推送。
- v11.0～v22.3 **皆尚未推送**。2026-11-26 使用者以 Console 確認線上為 **v22.1**；決定第01、02批一起推送。網址：https://wanyu25-alt.github.io/1124-1-TEST/ 。查版本：Console 執行 `(document.documentElement.innerHTML.match(/build:'(v[\d.]+)'/)||[])[1]`。
- 規則：未經使用者確認不得推送。使用者以 GitHub Desktop 自行更新。

## 13. 最近一次修改的檔案及原因
- v22.6.1 第05-B批（2026-11-27）：`index.html`（P36、`APP.build`、P27 的 `APP.id`）；`vocab/language-metadata.json`（clz）；新增 `vocab/lang/cloze.json`、`tools/make-cloze.mjs`、`BATCH05-CLOZE-REVIEW.md`、`voice/tts/` 157 段問句；`tools/merge-lang.mjs`；`tests/e2e/batch05-lang.js`、`tests/t230.js`；文件 CHANGELOG、本文件、ROADMAP、BATCH05-REPORT、PATCH-README、PATCH-MANIFEST。
- v22.6 第05批（2026-11-27）：`index.html`（`cxOf` const→let、P35、`APP.build`、P27 的 `APP.id`）；新增 `vocab/language-metadata.json`、`vocab/lang/`、`tools/lang-src/`、`tools/validate-lang.mjs`、`tools/merge-lang.mjs`、`tools/lang-review-md.mjs`、`tests/e2e/batch05-lang.js`；`tests/t230.js`；文件 BATCH05-REPORT、BATCH05-REVIEW、BATCH05-PROGRESS、BATCH05-SAMPLE、BATCH05-01-REVIEW、LANGUAGE-METADATA-SCHEMA、CHANGELOG、ROADMAP、本文件、PATCH-README、PATCH-MANIFEST。
- v22.5.7 第04-H批（2026-11-27）：`index.html`（P18 兩處「這是什麼」題數、P34、`APP.build`、P27 的 `APP.id`）；新增 `tests/e2e/batch04h-prompt.js`；`tests/t230.js`；文件 BATCH04B-REPORT（第 13 節）、CHANGELOG、PROJECT-HANDOFF、DEVELOPMENT-ROADMAP、PATCH-README、PATCH-MANIFEST。原因：教師需求。
- v22.5.6 第04-G批（2026-11-27）：`index.html`（P28 的 SM.pre 包裝、`APP.build`、P27 的 `APP.id`）；新增 `tests/e2e/batch04g-noread.js`；`tests/t230.js`；文件 BATCH04B-REPORT（第 12 節）、CHANGELOG、PROJECT-HANDOFF、DEVELOPMENT-ROADMAP、PATCH-README、PATCH-MANIFEST。原因：教師決定口語二星以上不先念題目。
- v22.5.5 第04-F批（2026-11-27）：`index.html`（P33、`APP.build`、P27 的 `APP.id`）；新增 `mic-test.html`、`tests/e2e/batch04f-mic.js`；`tests/t230.js`；文件 BATCH04B-REPORT（第 11 節）、CHANGELOG、PROJECT-HANDOFF、DEVELOPMENT-ROADMAP、PATCH-README、PATCH-MANIFEST。原因：教師回報口語練習沒有聲波、讀不到聲音。
- v22.5.4 第04-E批（2026-11-27）：`index.html`（P32、`APP.build`、P27 的 `APP.id`）；新增 `voice/tts/`（1818 段＋index.json）、`tools/make-tts-audio.sh`、`tests/e2e/batch04e-ios-pre.js`；調整 `tests/e2e/batch04d-ios-text.js`、`tests/t230.js`；文件 BATCH04B-REPORT（第 10 節）、CHANGELOG、PROJECT-HANDOFF、DEVELOPMENT-ROADMAP、PATCH-README、PATCH-MANIFEST。原因：iPhone 網頁語音無聲，改播預錄音檔。
- v22.5.3 第04-D批（2026-11-27）：`index.html`（P31、`APP.build`、P27 的 `APP.id`）；新增 `tests/e2e/batch04d-ios-text.js`；`tests/t230.js`；文件 BATCH04B-REPORT（第 9 節）、CHANGELOG、PROJECT-HANDOFF、DEVELOPMENT-ROADMAP、PATCH-README、PATCH-MANIFEST。原因：iPhone 網頁語音無聲，先顯示文字。
- v22.5.2 第04-C批（2026-11-27）：`index.html`（P30、`APP.build`、P27 的 `APP.id`）；`tts-test.html`（12 項）；新增 `tests/e2e/batch04c-voice.js`；`tests/e2e/batch04b-tts.js`、`tests/t230.js`（版本、項目數）；文件 BATCH04B-REPORT（第 8 節）、CHANGELOG、PROJECT-HANDOFF、DEVELOPMENT-ROADMAP、PATCH-README、PATCH-MANIFEST。原因：Safari 選到趣味語音、Chrome 語音卡住。
- v22.5.1 第04-B批（2026-11-26）：`index.html`（P29、`APP.build`、P27 的 `APP.id`）；新增 `tts-test.html`、`BATCH04B-REPORT.md`、`tests/e2e/batch04b-tts.js`；`tests/t230.js`（版本）；文件 CHANGELOG、PROJECT-HANDOFF、DEVELOPMENT-ROADMAP、PATCH-README、PATCH-MANIFEST。原因：Mac Chrome、iPhone Safari 聽不到 AI 念詞彙。
- v22.5 第04批（2026-11-26）：`index.html`（新增 P28 區段、`APP.build`、P27 的 `APP.id`、預設設定 `ow:10`、開機呼叫 `P28.init()`）；新增 `BATCH04-REPORT.md`、`tests/e2e/batch04-oral.js`、`tests/e2e/lib/mic-stub.js`；文件 CHANGELOG、PROJECT-HANDOFF、DEVELOPMENT-ROADMAP、PATCH-README、PATCH-MANIFEST；`.gitignore` 加入 `.testenv/`、`node_modules/`。原因：教師回報口語練習只能按「我知道了」、沒有聲波、辨識困難。
- v22.4 第03批（2026-11-26）：`index.html`（P26 區段、`V2.pass` 等待條件、`APP.build`）；新增 `TONE-READING-REVIEW.csv`、`tests/e2e/batch03-guide.js`、`tests/e2e/lib/audio-stub.js`；調整 `tests/t30.js`、`t19b.js`、`t17.js`、`t230.js`、`e2e/phase14-setup-v21.js`、`e2e/batch01-material.js`、`e2e/batch02-source.js`；文件 CHANGELOG、KNOWN_ISSUES、PROJECT-HANDOFF、DEVELOPMENT-ROADMAP、BATCH03-REPORT、PATCH-README、PATCH-MANIFEST。原因：教師實測回饋（設定畫面、聽覺記憶負荷、聲調引導）。
- v22.3 第02批（2026-11-26）：`index.html`（新增 P25 區段、`APP.build`、移除 3 處寫死版本）；`tests/e2e/batch02-source.js`（新增）；`tests/t283.js`、`tests/t180.js`、`tests/t230.js`、`tests/e2e/batch01-material.js`（依新規格調整）；文件：CHANGELOG、KNOWN_ISSUES、PROJECT-HANDOFF、DEVELOPMENT-ROADMAP、BATCH02-REPORT、PATCH-README、PATCH-MANIFEST。原因：教材來源管理。
- v22.2 第01批（2026-11-26）：`index.html`（新增 P24 區段、`pool` 個別詞彙範圍改用 `LIB.selEff`、build 字串）；`tests/e2e/batch01-material.js`（新增）；`tests/t230.js`（版本字串）；文件：CHANGELOG、KNOWN_ISSUES、PROJECT-HANDOFF、DEVELOPMENT-ROADMAP、BATCH01-REPORT、DIAG-CONSOLE、PATCH-README、PATCH-MANIFEST。原因：修復刪除分類後正式教材 0 詞。
- 接手檢查（2026-11-26）：未修改程式，只新增本文件。
- 上一版 v22.1：index.html（TTSX／VF／VDX、顯示文字、`ext.tx`）、tests/t290.js、CHANGELOG.md、BUG-FIX-REPORT.md、FEATURE-STATUS.md 頂部。
