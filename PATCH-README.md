# PATCH-README｜語音測試頁更新（網站程式仍為 v22.5.2）

- **更新前**：GitHub `wanyu25-alt/1124-1-TEST` main 提交 `a174fb3`（v22.5.2，已部署）
- **這次只更新語音測試頁**，網站主程式 `index.html` 沒有修改，版本仍然是 `v22.5.2 20261127-04C`。

## 要上傳的檔案
| 檔案 | 說明 |
|---|---|
| `tts-test.html` | 語音測試頁，新增 iPhone 專用的 7 項（M、N、P、L、Q、R、T），共 19 項 |

## 部署方式
- **GitHub Desktop**：Commit → Push origin。
- **GitHub 網頁版**：把 `tts-test.html` 拖進儲存庫最上層 → Commit changes。

## 檔案清單（相對於 a174fb3）
| 動作 | 檔案 |
|---|---|
| 覆蓋 | `tts-test.html`、`BATCH04B-REPORT.md`、`CHANGELOG.md`、`PATCH-README.md`、`PATCH-MANIFEST.json`、`tests/e2e/batch04b-tts.js` |
| 刪除 | 沒有 |

## 測試方法（iPhone Safari）
1. 開啟 `https://wanyu25-alt.github.io/1124-1-TEST/tts-test.html`。
2. 按 `↻ 重新整理`，確認看得到 M、N、P、L、Q、R、T 這幾項。
3. **從 M 開始往下測**，每一項都按「有聽到」或「沒聽到」。
4. 最後按「📋 複製結果」，把文字貼給開發者。
