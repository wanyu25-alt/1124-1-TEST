# PATCH-README｜v22.3（GitHub 目前）→ v22.4.1 累積更新

- **更新前**：GitHub `wanyu25-alt/1124-1-TEST` main 提交 `c1a2721`（根目錄 index.html＝v22.3）
- **更新後**：v22.4.1（建置 `20261126-03B`）
- **不需要**先套用 v22.4 或其他任何舊增量包；本包已包含 v22.4 全部修改與第03-B批修復。
- **資料遷移**：沒有格式遷移。每台裝置第一次開啟時，自動移除「未修改的舊版示範圖卡」一次（先在該裝置備份、可在教材來源管理按「復原」）。學習紀錄、星星、收藏、教師自訂教材、正式 1000 詞都不受影響。不需要清除瀏覽器資料。

## 壓縮檔內容
| 資料夾 | 內容 | 要不要上傳 |
|---|---|---|
| `1_upload-to-github-root/` | `index.html`（**唯一需要部署的網站檔案**） | **必須上傳**，覆蓋 GitHub 根目錄的 index.html |
| `2_optional-dev-docs-tests/` | 開發報告、交接文件、測試程式（保留原始相對路徑） | 可選。不影響網站；上傳可以讓 GitHub 上的文件保持最新 |
| `PATCH-README.md`、`PATCH-MANIFEST.json`（最外層） | 本說明與檔案清單、校驗碼 | 不用上傳（`2_` 資料夾裡已有一份） |

**不要上傳**：整個解壓縮後的外層資料夾、`1_…`／`2_…` 資料夾本身（請上傳資料夾「裡面」的東西）。本包裡沒有任何私人備份或學生資料。

## GitHub 網頁版部署步驟（一次完成）
1. 解壓縮 `vocabulary-express-v22_3-to-v22_4_1-patch.zip`。
2. 打開 `1_upload-to-github-root` 資料夾，裡面只有 `index.html`。
3. 到 https://github.com/wanyu25-alt/1124-1-TEST ，確認畫面上方路徑是儲存庫**最上層**（看得到 `index.html`、`vocab`、`voice` 的那一層，不是在任何子資料夾裡）。
4. 按 **Add file → Upload files**。
5. 把 `index.html` 這**一個檔案**拖進上傳區。不要拖資料夾。
6. 上傳清單應該只顯示 `index.html`。
7. 按 **Commit changes**。
8. 等 1～3 分鐘：儲存庫頁面上方的 Actions 或 Deployments 出現綠色勾勾，代表 GitHub Pages 部署成功。
9. 開啟 https://wanyu25-alt.github.io/1124-1-TEST/ ，按 `Cmd`＋`Shift`＋`R`（Windows 按 `Ctrl`＋`F5`）強制重新整理，然後確認版本：
   - F12 → Console，貼上（第一次可能要先輸入 `allow pasting`）：`APP.build+' '+APP.id`，應顯示 `'v22.4.1 20261126-03B'`；
   - 或者到教師專區 → 📖 詞彙庫，「📚 教材版本」應顯示「程式版本 v22.4.1，建置 20261126-03B」。
10. 實機確認（見 BATCH03B-REPORT.md）：首頁沒有「無法連到網站教材」，設定畫面沒有「本次學習任務」，第2站一星逐音引導正常。Chrome 與 Safari 各聽一次完整詞彙。Chrome 聽不到時：教師專區 → 📖 詞彙庫 → 🔊 語音診斷 → 中文語音清單 → 逐一「▶ 試聽」，選一個聽得到的語音按「使用這個」。

（可選）上傳開發文件：打開 `2_optional-dev-docs-tests`，選取**裡面全部的檔案和 `tests` 資料夾**，拖進 GitHub 根目錄的上傳區，再 Commit。GitHub 會依照 `tests/…` 的路徑放進對應位置。

## 檔案清單
| 類別 | 動作 | 相對路徑 |
|---|---|---|
| A 網站 | 覆蓋 | `index.html` |
| B 文件 | 覆蓋 | `CHANGELOG.md`、`DEVELOPMENT-ROADMAP.md`、`KNOWN_ISSUES.md`、`PROJECT-HANDOFF.md`、`PATCH-README.md`、`PATCH-MANIFEST.json` |
| B 文件 | 新增 | `BATCH01-REPORT.md`、`BATCH03-REPORT.md`、`BATCH03B-REPORT.md`、`DIAG-CONSOLE.md`、`TONE-READING-REVIEW.csv` |
| B 測試 | 覆蓋 | `tests/t17.js`、`tests/t19b.js`、`tests/t22.js`、`tests/t230.js`、`tests/t291.js`、`tests/t30.js`、`tests/e2e/batch01-material.js`、`tests/e2e/batch02-source.js`、`tests/e2e/phase14-setup-v21.js` |
| B 測試 | 新增 | `tests/e2e/batch03-guide.js`、`tests/e2e/batch03b-deploy.js`、`tests/e2e/lib/audio-stub.js`、`tests/e2e/lib/voice-stub.js` |
| — | 部署前必須刪除 | **沒有** |
| — | 網站確認正常後建議刪除 | `vocabulary-express-v22_2-patch/`（11 個檔案）、`vocabulary-express-v22_3-patch/`（12 個檔案）：先前誤上傳的增量包子資料夾。網站不讀取它們，刪除不影響功能；只是讓儲存庫保持整潔，不急。GitHub 網頁版要進資料夾逐一刪除檔案，用 GitHub Desktop 比較方便 |
| — | 保留 | 其他所有檔案（vocab/、voice/、voice-original/、music/、lib/、tools/、其他文件與測試） |
| — | 已不存在、不要補回 | `materials/`（舊版示範教材，已依方案A移除） |

校驗碼見 `PATCH-MANIFEST.json`。

## 復原
- GitHub 網頁版：儲存庫 → Commits → 找到這次的 Commit → 在 GitHub Desktop 選 Revert；或重新上傳先前的 index.html（`c1a2721` 版本）。
- 舊版示範教材：教師專區 → 📖 詞彙庫 → 📚 教材來源管理 → 「復原」。
