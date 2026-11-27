# PATCH-README｜v22.6（GitHub 目前）→ v22.6.1 第05-B批

- **更新前**：GitHub main 提交 `5341a17`（v22.6，已部署）
- **更新後**：v22.6.1（建置 `20261127-05B`）
- **資料遷移**：沒有。學習紀錄、星星、收藏、個案設定、自訂教材都不變。

## 要上傳的網站檔案
| 檔案 | 說明 |
|---|---|
| `index.html` | P36：口語第2站五星「聽句子說詞」；「尚無教材」寫出原因 |
| `vocab/language-metadata.json` | 加入 157 句問句（`clz`） |
| `voice/tts/index.json` 與 157 個新的 `voice/tts/*.m4a` | iPhone／iPad 念問句用的預錄音檔 |

## 部署方式（GitHub Desktop）
1. 確認 Changes 有上面的檔案。開發用的檔案也可以一起勾選，不影響網站：`tools/`、`vocab/lang/`、`tests/`、文件。
2. Commit，例如「v22.6.1 聽句子說詞」。
3. Push origin。

## 更新後驗收
見 `BATCH05-REPORT.md` 第 8 節。
