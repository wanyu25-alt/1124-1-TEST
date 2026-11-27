# PATCH-README｜v22.5.2（GitHub 目前）→ v22.5.3 第04-D批

- **更新前**：GitHub `wanyu25-alt/1124-1-TEST` main 提交 `842bc64`（v22.5.2＋語音測試頁，已部署）
- **更新後**：v22.5.3（建置 `20261127-04D`）
- **資料遷移**：沒有。不需要清除瀏覽器資料。

## 要上傳的網站檔案（一個）
| 檔案 | 說明 |
|---|---|
| `index.html` | iPhone／iPad 念題目時同時顯示題目文字 |

## 部署方式
- **GitHub Desktop（建議）**：確認變更清單 → Commit（例如「v22.5.3 iPhone 顯示文字」）→ **Push origin**。
- **GitHub 網頁版**：把 `1_upload-to-github-root/index.html` 拖進儲存庫最上層 → Commit changes。
- 部署後，按 `Cmd`＋`Shift`＋`R` 重新整理，Console 輸入 `APP.build+' '+APP.id`，應顯示 `'v22.5.3 20261127-04D'`。

## 檔案清單（相對於 GitHub 提交 842bc64）
| 類別 | 動作 | 相對路徑 |
|---|---|---|
| A 網站 | 覆蓋 | `index.html` |
| B 文件 | 覆蓋 | `BATCH04B-REPORT.md`、`CHANGELOG.md`、`DEVELOPMENT-ROADMAP.md`、`PROJECT-HANDOFF.md`、`PATCH-README.md`、`PATCH-MANIFEST.json` |
| B 測試 | 新增 | `tests/e2e/batch04d-ios-text.js` |
| B 測試 | 覆蓋 | `tests/t230.js`（版本號） |
| — | 刪除 | **沒有需要刪除的檔案** |

## 復原
- 還沒 Commit：GitHub Desktop → 對變更按右鍵 → Discard changes。
- 已 Push：History → 這次的 Commit 按右鍵 → Revert changes in commit → Push。

## 更新後驗收
見 `BATCH04B-REPORT.md` 第 9-4 節（iPhone Safari）。
