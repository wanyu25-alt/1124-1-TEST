# DEPLOY-GITHUB-PAGES｜GitHub Pages 部署說明（整合穩定版）

- 網址：`https://wanyu25-alt.github.io/1124-1-TEST/`（帳號 wanyu25-alt，分支 main，根目錄）。
- 專案是靜態網站：`index.html` ＋ `materials/`（內建教材）＋ `vocab/`（1000 詞庫與 592 張圖）＋ `voice/`（注音與引導語音）＋ `music/`（選配）＋ `lib/`。
- 所有資源路徑都是**相對路徑**（`t240` 測試確認沒有 `/` 開頭的路徑），所以放在子路徑 `/1124-1-TEST/` 也能讀到。
- **請勿上傳**：`backup/`、`*.bundle`、`詞彙特快車_完整備份*`、`個案資料_*.json`、`學習報表_*`（已在 `.gitignore`）。真實學生資料與密碼不得進公開庫。

## 推送步驟（等您確認後）
1. 先完成 `ACCEPTANCE-CHECKLIST.md` 第 1–5 節。
2. 告訴我「可以推送」，我才會 push；或您自己在 GitHub 網頁上傳整個資料夾覆蓋。
3. 等 1–10 分鐘，開網址按 Ctrl+F5。
4. 做清單第 7 節。

## 更新教材
教師後台匯出「完整教材 ZIP」→ `node tools/build-materials.mjs 檔案.zip` → 提交 `materials/`。網頁以 `manifest.json` 的 `version` 判斷是否更新。
