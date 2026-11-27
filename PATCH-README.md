# PATCH-README｜v22.5.7（GitHub 目前）→ v22.6 第05批

- **更新前**：GitHub main 提交 `569cdbc`（v22.5.7，已部署）
- **更新後**：v22.6（建置 `20261127-05`）
- **資料遷移**：沒有。
  - 新增唯讀資料檔 `vocab/language-metadata.json`。
  - 教師的審查狀態存在原本的進階教材欄位裡（`S.cx[詞彙ID].lmrv`）。
  - 學習紀錄、星星、收藏、個案設定、自訂教材都不變。

## 要上傳的網站檔案（兩個都要）
| 檔案 | 說明 |
|---|---|
| `index.html` | P35：讀取正式語言屬性；開放第1站五星、口語第2站四五星；後台審查、修正、匯出入 |
| `vocab/language-metadata.json`（新增） | 正式 1000 詞語言屬性（約 640 KB） |

只上傳 `index.html`、沒有上傳 `vocab/language-metadata.json` 也不會壞：網站照舊運作，只是新題型沒有正式教材可用。

## 部署方式
GitHub Desktop：
1. 確認 Changes 列出 `index.html` 與 `vocab/language-metadata.json`。
2. Commit，例如「v22.6 第05批語言屬性」。
3. Push origin。

開發用的檔案也可以一起上傳，不影響網站：`vocab/lang/`、`tools/`、`tests/`、文件。

## 檔案清單
見 `PATCH-MANIFEST.json`：A＝網站必要檔，B＝開發文件、工具、測試。

## 更新後驗收（Mac Chrome）
見 `BATCH05-REPORT.md` 第 6 節。

摘要：
1. Console 輸入 `APP.build+' '+APP.id`，應顯示 `v22.6 20261127-05`。
2. 聽讀練習第1站五星：聽用途選圖，只有一個正確選項。
3. 口語練習第2站四星、五星：可以開始，說對會過關。
4. 教師後台 → 內建詞彙庫：最下方有「🧩 正式語言屬性」。
