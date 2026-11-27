# PATCH-README｜v22.5.1（GitHub 目前）→ v22.5.2 第04-C批

- **更新前**：GitHub `wanyu25-alt/1124-1-TEST` main 提交 `487d90f`（v22.5.1，已部署）
- **更新後**：v22.5.2（建置 `20261127-04C`）
- **資料遷移**：沒有。不需要清除瀏覽器資料。
  - 如果你曾經在語音診斷按過「使用這個」指定語音，那個指定仍然最優先；想回到自動選擇，按「恢復自動選擇」。

## 要上傳的網站檔案（兩個）
| 檔案 | 說明 |
|---|---|
| `index.html` | 網站主程式（語音挑選、語音卡住提示） |
| `tts-test.html` | 語音測試頁（多了美佳、趣味語音兩項，共 12 項） |

## 部署方式
- **GitHub Desktop（建議）**：確認變更清單 → Commit（例如「v22.5.2 語音挑選修正」）→ **Push origin**。
- **GitHub 網頁版**：解壓縮增量包，把 `1_upload-to-github-root` 裡的 `index.html`、`tts-test.html` 兩個檔案拖進儲存庫最上層（不要拖資料夾）→ Commit changes。
- 部署後，按 `Cmd`＋`Shift`＋`R` 重新整理，Console 輸入 `APP.build+' '+APP.id`，應顯示 `'v22.5.2 20261127-04C'`。

## 檔案清單（相對於 GitHub 提交 487d90f）
| 類別 | 動作 | 相對路徑 |
|---|---|---|
| A 網站 | 覆蓋 | `index.html`、`tts-test.html` |
| B 文件 | 覆蓋 | `BATCH04B-REPORT.md`、`CHANGELOG.md`、`DEVELOPMENT-ROADMAP.md`、`PROJECT-HANDOFF.md`、`PATCH-README.md`、`PATCH-MANIFEST.json` |
| B 測試 | 新增 | `tests/e2e/batch04c-voice.js` |
| B 測試 | 覆蓋 | `tests/e2e/batch04b-tts.js`、`tests/t230.js`（版本號、項目數）、`tests/e2e/batch03b-deploy.js`（新的語音順序） |
| — | 刪除 | **沒有需要刪除的檔案** |

## 復原
- 還沒 Commit：GitHub Desktop → 對變更按右鍵 → Discard changes。
- 已 Push：History → 這次的 Commit 按右鍵 → Revert changes in commit → Push。

## 更新後驗收
見 `BATCH04B-REPORT.md` 第 8-4 節。
