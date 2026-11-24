# 測試報告：詞彙特快車 GitHub Pages 正式發布版

## 一、原本發現的問題

| # | 問題 | 影響 |
|---|---|---|
| 1 | 上傳的檔案外面多包一層 `traffic-hero/`，`index.html` 不在發布根目錄 | 網址打開是 **404** |
| 2 | 使用自訂 GitHub Actions（`upload-pages-artifact` + `deploy-pages`，Node 20），打包與發布放在同一個流程 | 出現 `No artifacts named "github-pages"`、Node 20 deprecated；網站無法發布。這個遊戲不需要建置，不該依賴 Actions |
| 3 | **`materials/images/*.jpg` 與 `manifest.json` 的 CRC／大小對不上**（18 張全部）。我用 CRC 檢查重現了這個問題；實際是哪個步驟讓檔案被改變，我沒能查出來 | 網頁的完整性檢查會判定教材損壞，不載入詞彙 → 即使發布成功也可能是空白教材 |
| 4 | 注音套件 `pinyin-pro` 從 `cdn.jsdelivr.net` 載入 | 依賴外部網站，離線或被擋時注音自動轉換失效 |
| 5 | 預設音樂來源為 `music/bgm.mp3`，但專案沒有這個檔案 | 開啟音樂時 Network 出現 **404** |
| 6 | 沒有 favicon | 瀏覽器自動請求 `/favicon.ico`，出現 404 |
| 7 | 後台說明文字仍寫「放進 incoming 資料夾、網站自動更新」 | 改成 Deploy from a branch 後會誤導 |
| 8 | 缺少 `.nojekyll` | 以 branch 方式發布時，GitHub 會多跑一次 Jekyll 處理 |

## 二、實際修正內容

1. **重新整理結構**：`index.html` 在最外層，沒有重複嵌套資料夾；資源放在 `materials/`、`voice/`、`music/`、`lib/`。
2. **移除 GitHub Actions**（刪除 `.github/`、`incoming/`、`.gitignore`）。改用 **Settings → Pages → Deploy from a branch → main → / (root)**，並加入 `.nojekyll`。沒有任何 Node／npm 依賴。
3. **用你這次上傳的教材 ZIP 重新產生 `materials/`**，逐檔比對與原 ZIP 位元組一致，且 `manifest.json` 的大小與 CRC32 全部相符（0 個不符）。
4. **`pinyin-pro@3.26.0` 改為本機檔案** `lib/pinyin-pro.js`（附授權檔），不再連外部網站。
5. **預設音樂改為程式合成旋律**（`builtin`）；教材設定裡舊的 `project` 值若使用者沒有手動選過，會自動改為 `builtin`，因此不再請求不存在的 `bgm.mp3`。放入 `music/bgm.mp3` 並在後台選「專案內建音樂檔」仍可使用。
6. 加入內嵌 favicon（不需要額外檔案）。
7. 更新後台「網站內建教材」說明文字為新的更新流程。
8. 隱私：公開資料夾只含 5 個通用鼓勵錄音；含學生姓名的 2 個錄音不在內（`index.html` 內已無學生姓名，後台「學生稱呼」預設為空）。
9. 新增 `README.md`（初學者操作說明）與本報告。

### 修改的檔案
- 修改：`index.html`（注音套件路徑、favicon、音樂預設值與設定遷移、教材更新說明文字）
- 重新產生：`materials/*`（manifest.json、cards.json、categories.json、settings.json、pack.js、images/）
- 新增：`.nojekyll`、`lib/pinyin-pro.js`、`lib/pinyin-pro.LICENSE.txt`、`music/README.txt`、`README.md`、`TEST-REPORT.md`
- 刪除：`.github/workflows/pages.yml`、`incoming/`、`.gitignore`、`music/請把音樂放這裡.txt`（中文檔名）

## 三、已通過的測試（實際執行）

**A. 模擬 GitHub Pages 子路徑 `/1124-express/`（本機 HTTP 伺服器 + Chromium）**
- 全新瀏覽器開啟後自動載入 18 張圖卡、4 個分類、18 張圖片，不需匯入 ZIP。
- 所有請求（index、lib/pinyin-pro.js、materials/*.json、圖片、voice/ok.m4a、voice/pass.m4a）皆成功；**404／失敗請求 0 個**。
- 瀏覽器 Console **error／warning 0 個**，無 pageerror。
- 五種交通工具（腳踏車、汽車、火車、高鐵、飛機）各完整跑完一趟並出現終點動畫。
- 老師語音 `ok`、`pass` 的檔案請求成功（HTTP 200）。
- 教師後台「網站內建教材」顯示「已讀取網站教材：版本 e7d6551a，18 張圖卡」。
- 匯出完整教材 ZIP 成功下載（約 789 KB）。
- 教材版本更新、教材檔缺漏、檔案損壞（CRC 不符）、網站教材清單不見等情況：不動原有資料，顯示錯誤與重新載入（先前以模擬伺服器測過 15 項，這次更換教材後再次通過）。

**B. 其他載入方式**
- 根路徑 `/`（沒有子路徑）：18 張圖卡載入，0 個 404。
- 直接雙擊 `index.html`（`file://`）：靠 `materials/pack.js` 備援載入 18 張圖卡與圖片，無錯誤。

**C. 自動化回歸測試（jsdom，17 組、共 461 項斷言，全部通過）**
答題判斷、注音輸入（含一聲空白鍵）、五種交通工具、語音辨識流程、語音回饋與音效時機（答對／答錯／連錯／辨識失敗／停頓 15 秒／單關完成／整體任務完成）、Audio Manager（優先順序、背景音樂降音、不重疊）、動畫設定與終點動畫、教師管理、教材 ZIP 匯出匯入（含合併／取代、損壞 ZIP、缺圖、ID 衝突、舊格式）、網站教材自動載入與版本更新。

**D. 教材轉換工具**
`tools/build-materials.mjs` 以你的 ZIP 產生 `materials/`：18 張圖卡、4 個分類、18 張圖片，檔案完整性全數通過；損壞 ZIP、含學習紀錄的備份檔會被拒絕。

## 四、尚未確認（需要你實際操作或真機）

- ⚠️ **實際在 GitHub 上發布**：我沒有你的 GitHub 權限，未能實際部署。請依 README 操作後，再確認 `https://wanyu25-alt.github.io/1124-express/` 能開啟。
- ⚠️ **iPad Safari、Windows、macOS、手機瀏覽器實機**：只在 Chromium 上測試，未用真機驗證。
- ⚠️ **老師錄音的實際播放與對應**：測試環境只確認檔案請求成功與播放時機，沒有真的聽到聲音。AAC（.m4a）在各瀏覽器的解碼、iPad 靜音開關與自動播放限制，需要實機確認。另外 `ok.m4a`（答對囉）與 `pass.m4a`（恭喜過關）長度相近，我是依辨識結果對應，請你實際聽一次確認沒有放反。
- ⚠️ **麥克風權限與語音辨識**：需真實瀏覽器與麥克風，未測。
- ⚠️ **動畫流暢度**（尤其 iPad）只做過截圖檢查，沒有實機效能測試。
- ⚠️ GitHub Pages 的快取約 10 分鐘，更新後若仍看到舊版，請強制重新整理。

## 五、最終專案資料夾結構

```
vocabulary-express-github-ready.zip（解壓後最外層就是下列內容）
├── index.html
├── .nojekyll
├── README.md
├── TEST-REPORT.md
├── lib/
│   ├── pinyin-pro.js
│   └── pinyin-pro.LICENSE.txt
├── materials/
│   ├── manifest.json
│   ├── cards.json
│   ├── categories.json
│   ├── settings.json
│   ├── pack.js            （本機雙擊開啟用的備援檔；網站正常載入時不會請求它）
│   ├── images/card_001.jpg … card_018.jpg
│   └── audio/             （目前沒有上傳音檔；有音檔時轉換工具會自動建立）
├── voice/
│   ├── ok.m4a  retry.m4a  cheer.m4a  again.m4a  pass.m4a
├── music/
│   └── README.txt
└── tools/
    └── build-materials.mjs
```
