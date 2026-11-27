# PATCH-README｜v22.6.2（GitHub 目前）→ v22.6.3 第05-D批

- **更新前**：GitHub main 提交 `acfb357`（v22.6.2，已部署）
- **更新後**：v22.6.3（建置 `20261128-05D`）
- **資料遷移**：沒有。

## 要上傳的網站檔案
| 檔案 | 說明 |
|---|---|
| `index.html` | 版本號與「尚無教材」說明文字 |
| `vocab/language-metadata.json` | 加入 156 句猜謎問句（共 313 句） |
| `voice/tts/index.json` 與 156 個新的 `voice/tts/*.m4a` | iPhone／iPad 念猜謎問句用 |

開發用的檔案也一起上傳，不影響網站：`tools/`、`vocab/lang/`、`tests/`、文件。

## 部署方式（GitHub Desktop）
1. 勾選全部變更。
2. Commit，例如「v22.6.3 猜謎問句」。
3. Push origin。

## 更新後驗收
見 `BATCH05-REPORT.md` 第 10 節。
