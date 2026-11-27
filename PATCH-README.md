# PATCH-README｜v22.5.4（GitHub 目前）→ v22.5.5 第04-F批

- **更新前**：GitHub `wanyu25-alt/1124-1-TEST` main 提交 `0056d4b`（v22.5.4，已部署）
- **更新後**：v22.5.5（建置 `20261127-04F`）
- **資料遷移**：沒有。不需要清除瀏覽器資料。

## 要上傳的網站檔案
| 檔案 | 說明 |
|---|---|
| `index.html` | 口語練習「聽詞認識」畫面也顯示麥克風聲波 |
| `mic-test.html` | **新增**：麥克風測試頁 |

## 部署方式
- **GitHub Desktop（建議）**：Commit（例如「v22.5.5 麥克風測試頁」）→ **Push origin**。
- **GitHub 網頁版**：把 `1_upload-to-github-root` 裡的兩個檔案拖進儲存庫最上層 → Commit changes。
- 部署後，教師專區 →「📖 詞彙庫 → 📚 教材版本」應顯示 v22.5.5、建置 20261127-04F。

## 檔案清單（相對於 GitHub 提交 0056d4b）
| 類別 | 動作 | 相對路徑 |
|---|---|---|
| A 網站 | 覆蓋 | `index.html` |
| A 網站 | 新增 | `mic-test.html` |
| B 文件 | 覆蓋 | `BATCH04B-REPORT.md`、`CHANGELOG.md`、`DEVELOPMENT-ROADMAP.md`、`PROJECT-HANDOFF.md`、`PATCH-README.md`、`PATCH-MANIFEST.json` |
| B 測試 | 新增 | `tests/e2e/batch04f-mic.js` |
| B 測試 | 覆蓋 | `tests/t230.js`（版本號） |
| — | 刪除 | **沒有需要刪除的檔案** |

## 復原
- 還沒 Commit：GitHub Desktop → 對變更按右鍵 → Discard changes。
- 已 Push：History → 這次的 Commit 按右鍵 → Revert changes in commit → Push。

## 更新後驗收
見 `BATCH04B-REPORT.md` 第 11-4 節：Mac Chrome、Mac Safari、iPhone 各開一次 `mic-test.html`，做完 A～E 後複製結果。
