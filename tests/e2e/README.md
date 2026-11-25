# Chromium 模擬測試（Playwright）

這些腳本在 **模擬** 的手機／平板／電腦視窗（含觸控、旋轉、斷線、虛擬鍵盤縮小）中跑，不是真機。
執行：先在專案資料夾啟動任一靜態伺服器（網址路徑需為 `/1124-1-TEST/`，或自行修改腳本頂端的 URL），再 `node 檔名.js`。
- layout-views.js：10 種視窗尺寸 × 首頁／選車／設定／家長專區，檢查橫向溢出與按鈕位置
- layout-game.js：同尺寸下的打字遊戲（觸控鍵盤是否超出畫面、圖片與作答區是否重疊）
- rotate-refresh-offline.js：旋轉不重來、重新整理後接續、離線寫入、聽讀不要求麥克風
- mic-permission.js：拒絕／授權／離開題目後停止收音／綜合練習逐題收音
- hw-keyboard.js：平板偵測到實體鍵盤後切換輸入方式
- nav-screens.js：四項功能列、三入口、真實點擊流程、無效按鈕掃描
- vkeyboard-safearea.js：虛擬鍵盤縮小視窗（模擬）與安全區域設定
