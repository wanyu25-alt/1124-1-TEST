# PATCH-README｜v22.5.6（GitHub 目前）→ v22.5.7 第04-H批

- **更新前**：GitHub main 提交 `e8a0439`（v22.5.6，已部署）
- **更新後**：v22.5.7（建置 `20261127-04H`）
- **資料遷移**：沒有。

## 要上傳的網站檔案
| 檔案 | 說明 |
|---|---|
| `index.html` | 「這是什麼」只在第 1、2 題；引導語音播放中說對也算過關 |

## 部署方式
GitHub Desktop → Commit（例如「v22.5.7 這是什麼」）→ Push origin。或用 GitHub 網頁版上傳 `index.html` 一個檔案。

## 檔案清單（相對於 e8a0439）
| 動作 | 檔案 |
|---|---|
| 覆蓋 | `index.html`、`BATCH04B-REPORT.md`、`CHANGELOG.md`、`DEVELOPMENT-ROADMAP.md`、`PROJECT-HANDOFF.md`、`PATCH-README.md`、`PATCH-MANIFEST.json`、`tests/t230.js` |
| 新增 | `tests/e2e/batch04h-prompt.js` |
| 刪除 | 沒有 |

## 更新後驗收（Mac Chrome）
1. 口語練習第2站三星：第 1、2 題會說「這是什麼」，第 3 題起不再說。
2. 在「這是什麼」還沒說完時就說出答案：會停止引導語音、顯示「收到！」，然後接下一題。
3. 在「這是什麼」播放中說錯的詞：不會過關，也不會顯示答錯。
