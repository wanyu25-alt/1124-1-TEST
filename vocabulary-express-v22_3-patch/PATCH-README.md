# PATCH-README｜第02批增量更新 v22.2 → v22.3

- **更新前版本**：v22.2　**更新後版本**：v22.3
- **依賴版本**：v22.2（= v22.1 完整專案 ＋ 第01批增量包 `vocabulary-express-v22_2-patch.zip`）。
- **您目前的情況**（線上仍是 v22.1、兩批一起推送）：請**先**套用第01批增量包，**再**套用本增量包（同名檔案以本包為準）。兩包都套好後再一起 Commit、Push。
- **資料遷移**：沒有格式遷移，不清除任何本機資料。只會在教師按「啟用／停用」時新增 `S.matSrc`、按「教材安全修復」時新增 `S.matFix`。
- **行為變更（請留意）**：舊版內建教材（18 張）與教師自訂教材**預設不進入學生練習**；需要時請到「教師專區 → 📖 詞彙庫 → 📚 教材來源管理」啟用。資料都還在。
- **未包含**：圖片、音檔、教材、音樂（都沒有修改）。

## 檔案清單
| 動作 | 檔案 |
|---|---|
| 覆蓋 | `index.html`、`CHANGELOG.md`、`KNOWN_ISSUES.md`、`PROJECT-HANDOFF.md`、`DEVELOPMENT-ROADMAP.md`、`PATCH-README.md`、`PATCH-MANIFEST.json`、`tests/t180.js`、`tests/t230.js`、`tests/t283.js`、`tests/e2e/batch01-material.js` |
| 新增 | `BATCH02-REPORT.md`、`tests/e2e/batch02-source.js` |
| 刪除 | **沒有需要刪除的檔案** |

校驗碼（SHA-256）見 `PATCH-MANIFEST.json`。

## 更新方式（GitHub Desktop）
1. 解壓縮 `vocabulary-express-v22_2-patch.zip`，把裡面全部內容複製到儲存庫最外層（取代）。
2. 解壓縮 `vocabulary-express-v22_3-patch.zip`，同樣複製到儲存庫最外層（取代）。
3. GitHub Desktop 確認變更只有兩份清單列出的檔案。
4. **您確認後**再 Commit（例如：`v22.3 第01、02批：教材讀取修復與教材來源管理`）→ Push。
5. 等 1～3 分鐘，`Ctrl`＋`F5`；Console 查版本應為 `'v22.3'`。

## 復原方式
- 還沒 Commit：GitHub Desktop 對變更按右鍵 → **Discard changes**。
- 已 Push：History → 該筆 Commit 按右鍵 → **Revert changes in commit** → Push。
- 不需要清除瀏覽器資料；v22.3 新增的欄位舊版會忽略。

## 更新後驗收
見 `BATCH02-REPORT.md` 第 4 節。
