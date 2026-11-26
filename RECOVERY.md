# RECOVERY｜回復與還原方法

## 目前可執行狀態
- 分支 `dev/integration-stable`（由 `dev/phase-17-data-safety`／tag `v17.0-phase10` 往下）。
- **只動了：新增測試、新增文件、`materials/manifest.json` 的圖片 size／CRC 中繼資料；`index.html` 完全沒改。**
- 完整可執行版本＝交付 ZIP 內的 `index.html`（單檔）＋資料夾。

## 回復到整合前
1. 整合前備份：`pre-integration-backup.tgz`（整個專案，不含 .git）與 `pre-integration.bundle`（含所有 git 歷史）。
2. `git checkout v17.0-phase10` 即回到整合前程式。
3. 只想還原 manifest：`git checkout v17.0-phase10 -- materials/manifest.json`。

## 學生資料救援
- 資料在瀏覽器 IndexedDB（資料庫 `trafficHero`）。**清除網站資料會永久消失。**
- 每週在教師後台「資料安全」按「完整備份」，並把 ZIP 存在老師自己的電腦／隨身碟（**不要放公開 GitHub**）。
- 還原：教師後台→教材與資料管理→匯入，選「完整還原」；匯入前系統會自動留一份「還原前備份」。
- 備份損壞時會被完整性檢查擋下，不會悄悄匯入。

## 音檔還原
把 `voice-original/`（未處理原始錄音）複製回 `voice/` 覆蓋，再 Ctrl+F5。

## 推送前後
- v11.0–v17.1 **尚未推送到 GitHub**。推送前請先做 `ACCEPTANCE-CHECKLIST.md` 第 1–5 節。
- 推送後若發現問題：在 GitHub 把 main 還原到前一個 commit（或請我協助），舊 URL 不變。
