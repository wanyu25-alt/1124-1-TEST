# 詞彙特快車（Vocabulary Express）— Claude Code 專案說明

請一律用**繁體中文**回覆。使用者不是專業工程師，說明請白話、步驟清楚。

## 專案是什麼
國小特殊需求學生（自閉症、ADHD、低口語、詞彙提取困難等）的遊戲化詞彙學習網站。
純靜態網站，部署在 GitHub Pages：https://wanyu25-alt.github.io/1124-1-TEST/
沒有後端、資料庫、npm 建置流程。資料存在學生瀏覽器的 IndexedDB／localStorage。

詳細背景請在**需要時**才查閱（不要一開始全部讀）：
- `PROJECT-HANDOFF.md`：架構、模組、教材資料結構、已知問題、教育設計原則
- `DEVELOPMENT-ROADMAP.md`：12 批開發規劃與進度
- `DATA-STRUCTURE.md`、`MATERIAL-V22.md`：資料欄位

## 最重要：如何處理 index.html
`index.html` 約 1 MB、6000 多行，幾乎所有程式都在裡面（一個很大的 `<script>` 區塊）。
- **絕對不要整份讀取或整份重寫 index.html。** 先用搜尋（grep）找到相關函式或區段，只讀需要的行數範圍。
- 修改時只做精準的局部編輯（Edit），不要重新產生整個檔案。
- 程式以 `/*Pxx-BEGIN*/`、`/*Pxx-END*/` 等註解標記模組區段，可用來定位。
- 擴充既有功能的慣例：用包裝（wrap）既有函式的方式；新批次的包裝放在 `/*P25*/` 之後、開機程式之前。
- **版本號唯一來源**：主程式開頭的 `const APP={build:'v22.x'}`。升版只改這一處。

## 不要讀取的檔案和資料夾（很大或與修改無關，會浪費額度）
- `vocabulary-express-v22_2-patch/`、`vocabulary-express-v22_3-patch/`、`vocabulary-express-v22_4-patch/`（舊增量包副本，各含一份約 1 MB 的 index.html）
- `backup/`（備份檔）
- `TEST-REPORT*.md`、`TEST_REPORT.md`、`BATCH*-REPORT.md`（歷史報告，除非使用者要求）
- `vocab/images/`、`voice/`、`voice-original/`、`music/`（圖片和音檔）
- `lib/pinyin-pro.js`（外部函式庫，不修改）
- `vocab/vocabulary.json`（約 390 KB）：需要時只看前幾筆了解格式，或用程式查詢特定詞，不要整份讀入

## 開發原則（使用者已確認，必須遵守）
1. 保留所有已完成功能，不重新設計整個網站；不移除既有功能。
2. 不重新生成未修改的 1000 詞教材、961 張圖片、錄音及音樂。
3. 不刪除學習紀錄、教師自訂教材、星星、收藏及個案設定；資料遷移須先備份、保留穩定 ID、可回復。
4. 每次只處理使用者指定的範圍，不提前做其他批次。
5. 先讓現有功能正常，再增加新功能。
6. 學生端：操作簡單、正向、不加時間壓力；語音辨識失敗不算答錯；不需要麥克風的模式不得要求權限。
7. 改完後更新 `CHANGELOG.md`；有重大變動時更新 `PROJECT-HANDOFF.md` 和 `DEVELOPMENT-ROADMAP.md`。

## Git 與上傳
- **不要自行 commit 或 push。** 使用者會在確認後，自己用 GitHub Desktop 上傳。
- 改完請列出：改了哪些檔案、每個檔案改了什麼、使用者該怎麼在網站上測試。
- 學生真實資料與備份不得進入儲存庫（見 `.gitignore`）。

## 測試
- 測試在 `tests/`（jsdom + fake-indexeddb，需要 Node.js）與 `tests/e2e/`；全部執行：`tools/run-all-tests.sh`。
- 很多測試寫死了舊路徑（見 PROJECT-HANDOFF.md 第 7 節），執行前用環境變數 `IDX` 指向本專案的 `index.html`。
- 如果使用者電腦沒有 Node.js，就不要硬跑測試，改為列出手動測試步驟。
