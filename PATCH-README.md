# PATCH-README｜v22.5.3（GitHub 目前）→ v22.5.4 第04-E批

- **更新前**：GitHub `wanyu25-alt/1124-1-TEST` main 提交 `a30b943`（v22.5.3，已部署）
- **更新後**：v22.5.4（建置 `20261127-04E`）
- **資料遷移**：沒有。不需要清除瀏覽器資料。

## 要上傳的網站檔案
| 檔案 | 說明 |
|---|---|
| `index.html` | iPhone／iPad 改播預錄詞彙音檔 |
| `voice/tts/`（1818 個 `.m4a`＋`index.json`，約 15 MB） | **新增**：美佳語音預錄的 1000 個詞彙＋818 個單字讀音 |
| `tts-test.html` | 語音測試頁（新增「🎧 預錄音檔試聽」與 V 項） |

## 部署方式
- **GitHub Desktop（建議）**：變更清單會很長（因為有 1818 個音檔），這是正常的。確認後 Commit（例如「v22.5.4 iPhone 預錄音檔」）→ **Push origin**。上傳約 15 MB，需要一點時間。
- **GitHub 網頁版不建議**：一次最多只能上傳 100 個檔案，音檔太多。
- 部署後，按 `Cmd`＋`Shift`＋`R` 重新整理，Console 輸入 `APP.build+' '+APP.id`，應顯示 `'v22.5.4 20261127-04E'`。

## 檔案清單（相對於 GitHub 提交 a30b943）
| 類別 | 動作 | 相對路徑 |
|---|---|---|
| A 網站 | 覆蓋 | `index.html`、`tts-test.html` |
| A 網站 | 新增 | `voice/tts/`（1818 個 `.m4a`、`index.json`） |
| B 工具 | 新增 | `tools/make-tts-audio.sh`（錄音工具，網站不會讀取） |
| B 文件 | 覆蓋 | `BATCH04B-REPORT.md`、`CHANGELOG.md`、`DEVELOPMENT-ROADMAP.md`、`PROJECT-HANDOFF.md`、`PATCH-README.md`、`PATCH-MANIFEST.json` |
| B 測試 | 新增 | `tests/e2e/batch04e-ios-pre.js` |
| B 測試 | 覆蓋 | `tests/e2e/batch04b-tts.js`、`tests/e2e/batch04d-ios-text.js`、`tests/t230.js` |
| — | 刪除 | **沒有需要刪除的檔案** |

## 復原
- 還沒 Commit：GitHub Desktop → 對變更按右鍵 → Discard changes。
- 已 Push：History → 這次的 Commit 按右鍵 → Revert changes in commit → Push。

## 更新後驗收（iPhone Safari）
1. 語音測試頁 `tts-test.html` →「🎧 預錄音檔試聽」：逐一試聽，確認聲音與速度。
2. 聽讀第1站：聽得到題目詞彙；按「聽題目」也聽得到。
3. 聽讀第2站：題目詞彙、聲調提示的單字讀音都聽得到。
4. Mac Safari、Chrome：沒有變化。
