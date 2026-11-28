# PATCH-README｜v22.6.8（GitHub 目前）→ v22.6.9 美術改版第三階段（V3 審核版素材）

- **更新前**：GitHub main 提交 `788da63`（v22.6.8，已部署）
- **更新後**：v22.6.9（建置 `20261128-NJ3`）
- **資料遷移**：沒有。預設畫面不變。

## 要上傳的網站檔案
| 檔案 | 說明 |
|---|---|
| `index.html` | P42：預覽主題的圖片載入器（天空、過關插圖） |
| `assets/themes/nature-journey/theme.css` | 天空圖的樣式 |
| `assets/themes/nature-journey/manifest.json` | 每個素材的審核狀態 |
| `assets/themes/nature-journey/manifest-batch-audited.json` | V3 審核紀錄（新增） |
| `assets/themes/nature-journey/backgrounds/sky.jpg` | 天空圖（新增，252 KB） |
| `assets/themes/nature-journey/scenes/countryside.jpg` | 過關畫面鄉村風景插圖（新增，261 KB） |

開發用的檔案也一起上傳，不影響網站：`tests/`、文件。

## 部署方式（GitHub Desktop）
1. 勾選全部變更。
2. Commit，例如「v22.6.9 天空圖預覽」。
3. Push origin。

## 更新後驗收
見 `THEME-NATURE-STAGE3-REPORT.md` 第 7 節。

## 測試結果
- jsdom：1821 通過／10 失敗（和修改前相同，是測試環境缺少舊版樣本檔）。完整回歸時 `t10` 有 1 項語音間隔計時偶發失敗（電腦忙碌時），單獨重跑 3 次都通過。
- e2e：663 通過／0 失敗，包含新增的 `theme-nature-stage3.js` 13 項。`theme-nature-preview` T7 的素材數量改為「至少 79 個」（新增過關插圖後為 80 個）。
- 尚未在 iPad、iPhone 上看過預覽。
