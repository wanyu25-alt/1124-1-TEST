# PATCH-README｜v22.4.1（GitHub 目前）→ v22.5 第04批

- **更新前**：GitHub `wanyu25-alt/1124-1-TEST` main 提交 `78932bb`（根目錄 index.html＝v22.4.1，SHA-256 `d4cc68e6…`；已部署並經教師驗收）
- **更新後**：v22.5（建置 `20261126-04`）
- **資料遷移**：沒有格式遷移，不刪除任何資料。
  - 新增可缺省欄位：`rec.ext.oral`（口語辨識分類）、`S.expLogs`（「我知道了」的聽過紀錄）、`S.set.p28ow`（一次性調整旗標）。
  - 一次性調整：口說等候仍是舊預設 6 秒的裝置，改為 10 秒；老師之後自己改的值不受影響。
  - 舊的學習紀錄照常讀取。
- **不需要清除瀏覽器資料。**

## 壓縮檔內容
| 資料夾 | 內容 | 要不要上傳 |
|---|---|---|
| `1_upload-to-github-root/` | `index.html`（**唯一需要部署的網站檔案**） | **必須上傳**，覆蓋 GitHub 根目錄的 index.html |
| `2_optional-dev-docs-tests/` | 報告、交接文件、測試程式、`.gitignore` | 可選；不影響網站 |
| `PATCH-README.md`、`PATCH-MANIFEST.json`（最外層） | 本說明與檔案清單、校驗碼 | 不用另外上傳（`2_` 裡已有一份） |

## 部署方式

### 方式一：GitHub Desktop（建議；專案資料夾就是這次開發的版本）
1. 打開 GitHub Desktop，左邊會列出這次修改的檔案（清單見下面）。
2. 確認沒問題後填寫 Commit 訊息（例如「v22.5 第04批」）→ Commit → **Push origin**。
3. 等 1～3 分鐘，網站按 `Cmd`＋`Shift`＋`R` 重新整理。
4. Console 輸入 `APP.build+' '+APP.id`，應顯示 `'v22.5 20261126-04'`。

### 方式二：GitHub 網頁版
1. 解壓縮，打開 `1_upload-to-github-root`。
2. 到儲存庫**最上層**，按 Add file → Upload files。
3. 只拖 `index.html` **這一個檔案**（不要拖資料夾）→ Commit changes。

## 檔案清單（相對於 GitHub 提交 78932bb）
| 類別 | 動作 | 相對路徑 |
|---|---|---|
| A 網站 | 覆蓋 | `index.html` |
| B 文件 | 覆蓋 | `CHANGELOG.md`、`DEVELOPMENT-ROADMAP.md`、`PROJECT-HANDOFF.md`、`PATCH-README.md`、`PATCH-MANIFEST.json`、`.gitignore` |
| B 文件 | 新增 | `BATCH04-REPORT.md` |
| B 測試 | 新增 | `tests/e2e/batch04-oral.js`、`tests/e2e/lib/mic-stub.js` |
| B 測試 | 覆蓋 | `tests/t31.js`、`tests/t230.js`、`tests/e2e/batch03-guide.js`、`tests/e2e/batch03b-deploy.js`（版本號與「不自動略過」的新規格） |
| — | 刪除 | **沒有需要刪除的檔案** |
| — | 保留 | 其他所有檔案（vocab/、voice/、voice-original/、music/、lib/、tools/、其他文件與測試），沒有修改 |

`.testenv/`（本機測試環境）與 `dist/`（交付檔）已加入 `.gitignore`，**不會**被上傳。

## 復原
- 還沒 Commit：GitHub Desktop → 對變更按右鍵 → Discard changes。
- 已 Push：History → 這次的 Commit 按右鍵 → Revert changes in commit → Push。
- 不需要清除瀏覽器資料；v22.5 新增的欄位，舊版會直接忽略。

## 更新後驗收
見 `BATCH04-REPORT.md` 第 9 節（Chrome、Safari 各做一次）。
