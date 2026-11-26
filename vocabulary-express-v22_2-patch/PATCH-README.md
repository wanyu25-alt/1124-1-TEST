# PATCH-README｜第01批增量更新 v22.1 → v22.2

- **更新前版本**：v22.1　**更新後版本**：v22.2
- **依賴版本**：必須套用在 v22.1 完整專案上（`vocabulary-express-v22_1.zip`，SHA-256 `8b5a66a1…f6bef9ce`）。
- **資料遷移**：沒有格式遷移，不清除任何本機資料。開啟後只會：①把個案練習範圍裡「已刪除的分類 ID」改成有效分類（畫面偏好）；②新增圖片審核預設值快取欄位 `S.lib.defRv`。學習紀錄、星星、收藏、個案設定、教師自訂教材、停用狀態都不動。
- **未包含**：圖片、音檔、教材、音樂（都沒有修改，不必重新上傳）。

## 檔案清單
| 動作 | 檔案 |
|---|---|
| 覆蓋 | `index.html` |
| 覆蓋 | `CHANGELOG.md`、`KNOWN_ISSUES.md`、`tests/t230.js` |
| 新增 | `PROJECT-HANDOFF.md`、`DEVELOPMENT-ROADMAP.md`、`BATCH01-REPORT.md`、`DIAG-CONSOLE.md`、`PATCH-README.md`、`PATCH-MANIFEST.json`、`tests/e2e/batch01-material.js` |
| 刪除 | **沒有需要刪除的檔案** |

校驗碼（SHA-256）見 `PATCH-MANIFEST.json`。

## 更新方式（GitHub Desktop）
1. **更新前（建議）**：在出問題的電腦先跑一次 `DIAG-CONSOLE.md` 的診斷，把結果存下來。
2. 解壓縮 `vocabulary-express-v22_2-patch.zip`。
3. GitHub Desktop → 您的儲存庫 → **Show in Explorer／Finder**。
4. 把壓縮檔**裡面的全部內容**複製到儲存庫最外層（和 `index.html` 同一層），選「取代」。`tests/` 的檔案會進到原本的 `tests/` 資料夾。
5. 回到 GitHub Desktop，確認變更只有上表列出的檔案（index.html 會顯示大量差異是正常的，因為是單一檔案）。
6. **您確認後**再 Commit（例如：`v22.2 第01批 教材讀取修復`）→ Push。
7. 等 1～3 分鐘，電腦按 `Ctrl`＋`F5`，手機重新整理。

## 復原方式
- **還沒 Commit**：GitHub Desktop 對變更按右鍵 → **Discard changes**。
- **已 Commit／Push**：GitHub Desktop → History → 在 v22.2 這筆按右鍵 → **Revert changes in commit** → Push。
- 不需要清除瀏覽器資料。v22.2 新增的欄位 v22.1 會忽略；失效分類被改成有效分類，不影響 v22.1 運作。

## 更新後驗收
見 `BATCH01-REPORT.md` 第 6 節。
