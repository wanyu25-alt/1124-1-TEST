# TEST_PLAN｜整合測試計畫（第一至第八階段）

## 原則
1. 測試資料與真實學生資料**完全隔離**：全部使用記憶體 IndexedDB（fake-indexeddb）或全新 Chromium 瀏覽器設定檔，個案名稱用「甲／乙／新個案」。
2. 模擬測試不等於真機；假辨識結果不等於真實語音。凡未實測者在 `REQUIREMENTS.md` 標明。
3. 「按鈕存在」不算通過；要有斷言（資料有寫入、畫面有出現、數字相符）。
4. 每批次修完後重跑回歸。

## 層級
| 層 | 工具 | 檔案 | 範圍 |
|---|---|---|---|
| 單元／整合（jsdom） | `tools/run-all-tests.sh` | `tests/t*.js`（47 個含 t240–t242） | 資料結構、紀錄、推薦、備份、教師／家長、個案隔離、資源完整性 |
| 瀏覽器（Chromium 模擬） | `/tmp/rune2e.sh`（Playwright）；伺服器模擬 `/1124-1-TEST/` 子路徑 | `tests/e2e/*.js`（19 個） | 畫面實際點擊、鍵盤、旋轉、重新整理、離線寫入、版面尺寸 |
| 資源 | `tests/t240.js` | — | 37 注音錄音可解碼、引導語音、教材 CRC、詞庫圖片、相對路徑 |
| 實機／真人 | `ACCEPTANCE-CHECKLIST.md` | — | **由您執行** |

## 六批次
| 批 | 內容 | 產出 |
|---|---|---|
| 1 | 盤點、備份、測試計畫 | 備份 tgz／bundle、`REQUIREMENTS.md`、本檔、`tools/run-all-tests.sh` |
| 2 | 核心功能（A）修復 | `t240`（資源）、A 區復驗 |
| 3 | 新學習功能（B–D） | `t242`（存在＋資料連動）、`phase11`（六站×模式×星級） |
| 4 | 家長／教師（E–F） | `t241`（紀錄→個案隔離→教師端）、教師 18 分頁 |
| 5 | 跨裝置、資料安全、GitHub Pages（G–H） | `phase11` 5 種視窗、重新整理、離開；t230／phase10 復驗 |
| 6 | 完整回歸與驗收 | `TEST_REPORT.md`、`KNOWN_ISSUES.md`、`DEFECT-REPORT.md`、ZIP |

## 通過標準
- jsdom 全部檔案 FAIL＝0 且沒有 `Cannot find module`／語法錯誤（0 通過數的檔案視為無效，不算通過）。
- Chromium 全部腳本 FAIL＝0 且沒有 JS 例外；**輸出 0 個 PASS 的腳本視為診斷輸出，不算通過證據**。
- 未實測者不得標「通過」。
