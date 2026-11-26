# PATCH-README｜v22.5（GitHub 目前）→ v22.5.1 第04-B批

- **更新前**：GitHub `wanyu25-alt/1124-1-TEST` main 提交 `f12b715`（v22.5，已部署）
- **更新後**：v22.5.1（建置 `20261126-04B`）
- **資料遷移**：沒有，不改變任何資料；不需要清除瀏覽器資料。

## 這次要上傳的網站檔案（兩個）
| 檔案 | 說明 |
|---|---|
| `index.html` | 網站主程式（合成語音修正） |
| `tts-test.html` | **新增**的語音測試頁（教師測試用；學生不會看到） |

## 部署方式

### GitHub Desktop（建議）
1. 確認左邊的變更清單（見下表）→ 填寫 Commit 訊息（例如「v22.5.1 語音修正」）→ Commit → **Push origin**。
2. 等 1～3 分鐘，網站按 `Cmd`＋`Shift`＋`R`；Console 輸入 `APP.build+' '+APP.id`，應顯示 `'v22.5.1 20261126-04B'`。

### GitHub 網頁版
1. 解壓縮增量包，打開 `1_upload-to-github-root`，裡面有 `index.html`、`tts-test.html` 兩個檔案。
2. 到儲存庫**最上層** → Add file → Upload files → 拖入**這兩個檔案**（不要拖資料夾）→ Commit changes。

## 檔案清單（相對於 GitHub 提交 f12b715）
| 類別 | 動作 | 相對路徑 |
|---|---|---|
| A 網站 | 覆蓋 | `index.html` |
| A 網站 | 新增 | `tts-test.html` |
| B 文件 | 覆蓋 | `CHANGELOG.md`、`DEVELOPMENT-ROADMAP.md`、`PROJECT-HANDOFF.md`、`PATCH-README.md`、`PATCH-MANIFEST.json` |
| B 文件 | 新增 | `BATCH04B-REPORT.md` |
| B 測試 | 新增 | `tests/e2e/batch04b-tts.js` |
| B 測試 | 覆蓋 | `tests/t230.js`（版本號）、`tests/e2e/batch04-oral.js`（B 段改用固定詞） |
| — | 刪除 | **沒有需要刪除的檔案** |

## 復原
- 還沒 Commit：GitHub Desktop → 對變更按右鍵 → Discard changes。
- 已 Push：History → 這次的 Commit 按右鍵 → Revert changes in commit → Push。

## 更新後驗收
見 `BATCH04B-REPORT.md` 第 6 節：Mac Chrome、iPhone Safari 開啟 `tts-test.html` 逐項測試並複製結果；Mac Safari 確認沒有退步。
