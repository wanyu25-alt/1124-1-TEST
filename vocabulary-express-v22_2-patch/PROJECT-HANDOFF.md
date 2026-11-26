# PROJECT-HANDOFF｜詞彙特快車（Vocabulary Express）

> 給下一個 Claude 對話的交接文件。新對話請同時提供「最新版網站 ZIP」與本文件。
> 本文件依實際程式與文件撰寫，最近更新：**v22.2（第01批）2026-11-26**。開發採 12 批增量更新，進度見 DEVELOPMENT-ROADMAP.md。
> 新對話請提供：最新完整網站（v22.1 ZIP＋之後各批增量包，或已更新的專案資料夾）＋本文件＋DEVELOPMENT-ROADMAP.md。

## 1. 專案目的
國小特殊需求學生（自閉症、ADHD、低口語、詞彙提取困難、仿說等）的遊戲化詞彙學習網站：聽覺理解、圖詞連結、詞彙提取、注音輸入、口語表達、語意組織、短語／語句組合、生活溝通。教師端提供學習歷程分析，家長端提供家庭複習。系統紀錄是教學參考，**不是臨床評估或診斷**。

## 2. 目前版本
- 程式 build：`v22.2`（index.html 內 `build:'v22.2'`）；CHANGELOG 最上方為 v22.2（未推送）。
- 開發方式：分批增量更新；v22.2＝v22.1 完整 ZIP＋第01批增量包（只改 index.html 與文件、測試）。
- 正式教材：V077_merged（1000 詞／16 主題／20 Level／961 張 WebP／950 有圖詞／50 缺圖詞）。
- v22.1 基準 ZIP SHA-256：`8b5a66a1208b29175279e12ed61da84a8fc516f63efa20d8c24feec2f6bef9ce`；各批檔案校驗見 PATCH-MANIFEST.json。

## 3. 系統架構
- 純靜態網站，GitHub Pages：`wanyu25-alt/1124-1-TEST` → `https://wanyu25-alt.github.io/1124-1-TEST/`。無後端、無 Service Worker。
- `index.html`（約 950 KB，全部程式在單一檔案，以 `/*Pxx*/` 區段標記模組）。
- 主要模組：`S`（全域狀態，存 IndexedDB／localStorage）、`UI`、`FL`（六站流程：`FL.ladder`／`FL.chk`／`FL.extras`／`FL.setAct`）、`LIB`（正式詞彙庫）、`MAT`（前臺教材統一存取層，`MAT.origin()` 判斷來源）、`SNAP`（練習快照）、`CB`（詞彙組合）、`SE`／`SCN`（語句／生活情境）、`LA`（學習分析）、`VP`（五階段學習履歷，保留）、`GV`（真人引導語音）、`AM`（語音管理）、`TTSX`／`VF`／`VDX`（v22.1 合成語音備援、文字備援、語音診斷）、`ACL`（教師入口鎖）、`MATFIX`（v22.2 教材讀取修復與唯讀診斷，`/*P24*/`，位於開機程式之前，包裝 FL.chk／FL.migDim／LIB.sync／LIB.v22Boot）。
- 題庫篩選鏈（重要）：`deck()`→`LRN.words(pool())`；`pool()` 依 `S.set.src` 取來源（`sel`＝`MAT.selPool`＝個案範圍 `ext.fl.sel` 的分類聯集），再依序經過：排除詞彙零件 `part`→個案排除 `ext.excl`→個別學生詞彙範圍 `LIB.selEff()`→非拼音模式排除沒有圖片的正式詞。`FL.chk` 以 `FL.withSrc` 暫時切換來源計算各站可用數。
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

## 6. 尚未完成的功能
- 教材來源預設開關（學生端預設只用正式教材）`S.matSrc`：**未實作**（目前前臺題庫含 18 張舊版圖卡）。
- 教材安全修復按鈕、六站可用題數表。
- 延伸活動入口（K-44）：`FL.extras` 程式存在，畫面無入口。
- 第 3～6 站與 1000 正式詞的連結教材（組合、語句、情境）。
- 正式詞缺詞性／情境／多圖／功能資料 → 第 1 站 5★、口語第 2 站 4★／5★ 無法使用。
- 智慧複習依教材來源過濾、20 Level 分析補強、麥克風新優化、效能實測。
- 聲調音檔未錄；AI 音量 1.5× 受瀏覽器上限 1.0 限制。

## 7. 已知問題（接手檢查發現）
0. （v22.2 已修）刪除分類後第1、2站 0 個詞彙；**您電腦的實際原因尚待診斷結果確認**。
1. 全新裝置第 3～6 站所有星級顯示「尚無教材」（三模式皆然）。
2. 前臺預設題庫含舊版 18 張圖卡（968＝950＋18）。
3. 教師後臺「教材版本」面板寫死「程式版本 v20.0」（實際 v22.1）。
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
下一批＝**第02批 教材來源管理（v22.3）**，以 v22.2 為基礎。注意：舊版 18 張目前仍在預設範圍（`MATFIX.defSel`），改來源預設時調整同一函式；來源停用後的失效範圍也要經過 `MATFIX.selFix`；修正教材版本面板寫死的「程式版本 v20.0」。

（以下為接手時的整體建議，已併入 DEVELOPMENT-ROADMAP.md 12 批規劃）
1. 實機驗證 v22.1 iPhone／iPad 語音（後臺「語音診斷」回報）。
2. 教材來源預設開關（學生端預設只用正式教材，舊版／自訂可由教師啟用；停用≠刪除）。
3. 第 3～6 站教材：以 VOC 正式 ID 建立組合／語句／情境教材，或至少預設載入 11 個情境模板；提供六站可用題數表。
4. 延伸活動放進教師後臺入口（K-44）。
5. 智慧複習排除停用來源；20 Level 分析補強。
6. 小修：教材版本面板版本字樣、t33 斷言、測試路徑改用環境變數、README 舊網址。

## 12. GitHub 部署狀態
- v11.0～v22.2 依文件記載**皆尚未推送**；線上版本未能從此環境確認（無法連到網站），請用 DIAG-CONSOLE 診斷的「1 版本」欄位確認各裝置實際版本。
- 規則：未經使用者確認不得推送。使用者以 GitHub Desktop 自行更新。

## 13. 最近一次修改的檔案及原因
- v22.2 第01批（2026-11-26）：`index.html`（新增 P24 區段、`pool` 個別詞彙範圍改用 `LIB.selEff`、build 字串）；`tests/e2e/batch01-material.js`（新增）；`tests/t230.js`（版本字串）；文件：CHANGELOG、KNOWN_ISSUES、PROJECT-HANDOFF、DEVELOPMENT-ROADMAP、BATCH01-REPORT、DIAG-CONSOLE、PATCH-README、PATCH-MANIFEST。原因：修復刪除分類後正式教材 0 詞。
- 接手檢查（2026-11-26）：未修改程式，只新增本文件。
- 上一版 v22.1：index.html（TTSX／VF／VDX、顯示文字、`ext.tx`）、tests/t290.js、CHANGELOG.md、BUG-FIX-REPORT.md、FEATURE-STATUS.md 頂部。
