# 自然旅行繪本風改版｜第三階段報告：V3 審核版素材（v22.6.9，建置 20261128-NJ3）

## 1. 這一階段做了什麼
- 讀取 V3 審核版素材包（`nature-journey-claude-audited.zip`）的 `README-FIRST.md`、`audit.csv`、`priority-checklist.md`、素材索引。
- 依素材包規定，**正式載入器只加入 1 張「預覽可用」的天空圖**（`backgrounds/sky.jpg`）。
- 其他圖片都沒有通過審核（15 張待重製、2 張缺少），**一律沿用原本的 SVG 畫面**。
- `review-only/` 和 `scene-references/` 的圖片**沒有放進網站，也沒有放進載入器**。
- **預設畫面仍然不變**。只有網址加 `?theme=nature` 才看得到。

## 2. 天空圖用在哪裡
| 畫面 | 用法 |
|---|---|
| 首頁 | 最上方一條天空帶，往下淡出成紙白色，不會壓到標題文字 |
| 腳踏車、汽車、火車、高鐵、飛機答題 | 上方旅行場景的天空。原本的山丘、樹、車站和交通工具（SVG）照舊疊在上面 |
| 過關畫面（完成旅程） | 老師同意後，改用鄉村風景插圖 `scenes/countryside.jpg` 當小場景背景（見第 5 節）。交通工具與抵達動畫維持原本；插圖載入失敗時改用天空圖 |

其他處理：
- 天空會跟著前進**慢慢移動**（速度只有前景的 5%），看起來有遠近感。
- 「減少動態」或關閉動畫時，天空不移動。
- 天空蓋了一層很淡的白色，讓顏色接近整體的柔和色調。

## 3. 圖片處理
- 原始 `sky.png` 是 2400×600、1.6 MB，對網頁太大。
- 轉成 `sky.jpg`（品質 78），**尺寸不變**，檔案 252 KB，少了約 85%。天空沒有透明部分，所以用 JPEG 不影響畫質。
- 素材包的審核紀錄保留在 `manifest-batch-audited.json`。
- `manifest.json` 每個素材都記上審核結果：
  - `preview`：預覽可用（目前只有 sky）。
  - `redo`：待重製。
  - `missing`：缺少。
  - `pending`：還沒提供。

## 4. 安全規則（程式怎麼保護）
- 只會載入 `manifest.json` 中狀態是 `ready`（正式）或 `preview`（預覽可用）、而且有檔名的圖片。
- 圖片**載入成功後**才套用。沒有圖、網路失敗或關閉預覽時，畫面自動回到原本的漸層天空。
- 自動測試會檢查：沒有任何 `review-only` 或 `scene-references` 的圖片被下載。

## 5. 完整場景參考圖的評估（沒有放進網站）
規定是「可以評估用在首頁及過關畫面，但不可當成透明視差圖層」。我用 `countryside.png` 做了兩張**示意截圖**：
- **過關畫面**（`eval-arrive-countryside.png`）：
  - 效果很好，畫面立刻有繪本感。
  - 問題：原本的 SVG 腳踏車和水彩風景畫風不一致。等新的交通工具圖片做好，就會很協調。
  - **建議採用**。
- **首頁**（`eval-home-countryside.png`）：
  - 背景很漂亮，但「今天想怎麼練習？」的藍字放在樹和山上面，**不容易看清楚**。
  - 如果要用，需要在標題後面加一個奶油白底板。
  - **建議等老師看過再決定**。
- 其他參考圖：
  - `train-scene.png`、`landscape-latest.png` 圖裡**直接畫了文字**（幸福車站、高鐵車站）和交通工具，不適合當背景。
  - `airport.png`、`station.png` 同樣有固定的建築和交通工具。

**老師已同意（2026-11-28）**：`countryside.png` 轉成 `scenes/countryside.jpg`（1600×533，261 KB），在索引中標為 `scene-countryside`，狀態「預覽可用」，**只用在過關畫面**，不當視差圖層。

## 6. 剩餘需要重新製作的素材清單
規格見 `THEME-NATURE-STAGE1-REPORT.md` 第 7 節：
- 透明背景 PNG、圖中不要有文字、交通工具面向右邊。
- **每張都要單獨生成**，不能從組圖裁切；要達到原生解析度。

### A. 第一批優先 18 張（做完就能換上首頁、腳踏車、火車、過關畫面）
| 狀態 | 素材 |
|---|---|
| ✅ 預覽可用（之後最好重新生成原生 2400 寬） | sky |
| ❌ 缺少 | train-far（2400×400）、train-mid（2400×300） |
| 🔁 待重製 | bike-far（2400×400）、bike-mid（2400×300）、path（1200×120）、rail（1200×120） |
| 🔁 待重製 | bicycle（480×360）、train-engine（560×360）、train-carriage（420×300） |
| 🔁 待重製 | kid-wave（320×420）、conductor-flag（320×440） |
| 🔁 待重製 | rabbit、snail、bird（各 240×240） |
| 🔁 待重製 | star（200×200）、bunting（800×200）、badge（300×360） |

### B. 素材包裡有、但同樣要重製的（第二批）
- train-smoke（300×200）
- dog、cat、hedgehog、squirrel（各 240×240）
- tree、tree-blossom（各 360×440）
- fence（480×180）、signpost（240×320）、house、station（各 520×400）、lamp（160×320）
- trophy（300×340）

### C. 還沒提供的（第三批以後）
- 背景：car-far／car-mid、hsr-far／hsr-mid、plane-far／plane-mid。
- 道路：road、runway、viaduct。
- 交通工具：car、hsr-head、hsr-car、airplane。
- 人物：kid-suitcase、kid-binoculars、kid-jump、kid-ticket、kid-bench、kid-peek。
- 動物：butterfly、duck、frog、rabbit-hop、bird-fly、cat-peek。
- 裝飾：pine、flower-bush、flowers-small、grass-tuft、stump、mailbox。
- 獎勵：star-smile、confetti-1～4。
- 圖示：11 個，各 128×128，第 5 階段才需要。
- 紙張紋理：paper（512×512）。

## 7. 老師驗收步驟（上傳後）
1. 先用一般網址打開網站，確認畫面和以前一模一樣。
2. 打開 `https://wanyu25-alt.github.io/1124-1-TEST/?theme=nature`：
   - 首頁上方有一條藍天白雲。
   - 聽讀 → 開始腳踏車練習：上方場景天空換成水彩天空；答對前進時，天空會慢慢移動。
   - 換火車練習：同樣有天空。
   - 完成一輪：完成旅程畫面的天空也是新圖。
3. 按左下角「回到原本畫面」，天空圖消失，恢復原本畫面。

## 8. 測試
- 新增 `tests/e2e/theme-nature-stage3.js`，共 13 項（含過關插圖載入失敗時改用天空圖）：
  - 預設不載入。
  - 預覽主題載入天空圖。
  - 素材索引只有 sky 可用，審核未過的素材一律回傳空值。
  - 沒有下載 review-only 或 scene-references。
  - 腳踏車、火車答題照常。
  - 視差移動。
  - 過關畫面。
  - 關閉預覽。
  - 圖片載入失敗時使用備援。
  - 減少動態時不移動。
  - 沒有頁面錯誤。
- 舊測試：只改版本號（`t230`、`batch05-lang`）。
- 完整回歸結果：見 `PATCH-README.md`。
