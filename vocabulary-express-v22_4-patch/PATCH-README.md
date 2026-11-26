# PATCH-README｜第03批增量更新 v22.3 → v22.4

- **更新前版本**：v22.3　**更新後版本**：v22.4
- **依賴版本**：v22.3（= v22.1 完整 ZIP ＋ 第01批 `vocabulary-express-v22_2-patch.zip` ＋ 第02批 `vocabulary-express-v22_3-patch.zip`）。
- **您目前的情況**（線上仍是 v22.1）：依序套用 v22_2 → v22_3 → **v22_4** 三個增量包（同名檔案以後面的為準），全部套好後一起 Commit、Push。
- **資料遷移**：沒有格式遷移，不清除任何資料。只有一次性修正：個案設定中剛好是 0.5 倍的 AI 語音速度改回 0.75 倍（原因見 BATCH03-REPORT.md 第 6 節）；之後老師自己調整的速度不受影響。
- **行為變更**：設定畫面不再顯示「本次學習任務」；打字題改為單一步驟逐音引導；聲調改念國字讀音；輕聲改為最後輸入。
- **未包含**：圖片、音檔、教材、音樂（都沒有修改）。

## 檔案清單
| 動作 | 檔案 |
|---|---|
| 覆蓋 | `index.html`、`CHANGELOG.md`、`KNOWN_ISSUES.md`、`PROJECT-HANDOFF.md`、`DEVELOPMENT-ROADMAP.md`、`PATCH-README.md`、`PATCH-MANIFEST.json`、`tests/t17.js`、`tests/t19b.js`、`tests/t30.js`、`tests/t230.js`、`tests/e2e/phase14-setup-v21.js`、`tests/e2e/batch01-material.js`、`tests/e2e/batch02-source.js` |
| 新增 | `BATCH03-REPORT.md`、`TONE-READING-REVIEW.csv`、`tests/e2e/batch03-guide.js`、`tests/e2e/lib/audio-stub.js` |
| 刪除 | **沒有需要刪除的檔案** |

校驗碼（SHA-256）見 `PATCH-MANIFEST.json`。`tests/e2e/lib/audio-stub.js` 只在測試時使用，網站不會載入。

## 更新方式（GitHub Desktop）
1. 依序解壓縮 `vocabulary-express-v22_2-patch.zip`、`vocabulary-express-v22_3-patch.zip`、`vocabulary-express-v22_4-patch.zip`，每一包都把裡面全部內容複製到儲存庫最外層（取代）。
2. GitHub Desktop 確認變更只有三份清單列出的檔案。
3. **您確認後**再 Commit（例如：`v22.4 第01～03批`）→ Push。
4. 等 1～3 分鐘，`Ctrl`＋`F5`；Console 查版本應為 `'v22.4'`。

## 復原方式
- 還沒 Commit：GitHub Desktop → 對變更按右鍵 → **Discard changes**。
- 已 Push：History → 該筆 Commit 按右鍵 → **Revert changes in commit** → Push。
- 不需要清除瀏覽器資料。

## 更新後驗收
見 `BATCH03-REPORT.md` 第 10 節。
