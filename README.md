# 詞彙特快車 v2（聽說讀打整合學習系統）

純靜態網頁遊戲：不需要後端、資料庫、學生登入，也不需要 Node.js、npm 或 GitHub Actions。
網址（以你實際的 GitHub Pages 網址為準）：**https://wanyu25-alt.github.io/1124-1-TEST/**

> v2 是在原本的專案上「升級」，不是重寫：原有詞彙、設定、學習紀錄、交通工具與老師錄音全部保留。

## 這個資料夾裡有什麼

```
index.html          遊戲本體（一定要放在最外層）
.nojekyll           告訴 GitHub Pages「不要用 Jekyll 處理」（開頭有點，是隱藏檔，一定要一起上傳）
materials/          網站內建教材：18 張圖卡、注音、圖片、分類、預設設定
voice/              老師錄音
  ├ ok / retry / cheer / again / pass .m4a   原有 5 個通用鼓勵錄音（保留）
  ├ zhuyin/   37 個注音符號老師錄音（zy_b.m4a … zy_yu.m4a，ASCII 檔名）
  └ guidance/ 4 個新引導語音（沒關係請慢慢來／再試試看你可以的／星星不夠囉請再聽一次／沒有聽清楚請再說一次喔）
AUDIO-MAPPING.md    注音符號 ↔ 檔名對照表、所有新音檔的用途與播放時機
CHANGELOG.md        這次升級改了什麼
music/              背景音樂資料夾（沒放 bgm.mp3 時，遊戲使用程式合成的原創旋律）
lib/                pinyin-pro（注音轉換套件，已放在本機，不需要連外部網站）
tools/              教材轉換工具（只有更新教材時才會用到，可選用）
```


## 零、v2 新功能：三種學習模式（首頁「學習模式」或 教師設定 →「🎓 學習模式與口語」）

| 模式 | 做什麼 | 麥克風 |
|---|---|---|
| **安靜學習**（預設） | 每題出現 1 秒後自動播放「詞語 → 各注音符號 → 完整音節 → 詞語」一次，學生用鍵盤打注音。保留「🔊 再聽一次」與花星星的「注音提示」。 | **完全不用**，不會跳出權限視窗 |
| **口語訓練** | 聽老師說 → 換你說。口語任務可由老師選：A 單獨注音跟讀、B 完整音節拼讀、C 完整詞彙仿說、D 看圖自主說詞（與仿說分開記錄）。不需要打字。 | 需要（或改用「老師確認」） |
| **聽說打字整合** | 每題都是「聽＋打」；依比例（10／20／30／50／75／100%，預設 30%，或老師指定第幾題）加上口說：聽符號→說→打→…→聽完整音節→說→聽詞語→說→得星星。 | 只有口語題才用 |

- **判定方式**（口語）：A 開口練習（只偵測有沒有開口，**不判斷發音對錯**）、B 老師確認（完成／再練習一次／略過）、C 電腦語音辨識（只用在詞語；單獨注音自動改用 A 或 B）。
- **不會卡關**：預設等待 6 秒、最多重試 2 次；失敗時先播「沒有聽清楚，請再說一次喔」，超過上限播「沒關係，請慢慢來」，由老師確認或自動略過。語音辨識失敗**不算答錯、不扣星星**；略過與偵測到聲音**不會記成發音正確**。
- **火車任務車廂**：場景左下角的 👂聽／🎤口／⌨打 會各自亮燈；全部做完才前進／到站。
- **再聽一次**（大、藍、在圖片旁）：不限次數、免費、不影響分數、不洩漏注音、保留已打的字。**注音提示**（小、灰、在右下角）：每題第一次花 1 顆星（可調），預設要先主動按「再聽一次」並播完才解鎖；星星不夠會播「星星不夠囉，請再聽一次」。老師可設為不限制／聽兩次／答錯後解鎖／關閉，或「免費開放」。
- **過關**：一關結束時依序：恭喜過關錄音 → 播完等 0.2 秒 → 1～2 秒歡慶音效（程式合成，無版權問題）→ 終點動畫。
- **星星動畫**：獲得（金星放大飛向收集區）、花費（−1 掉落後才顯示提示），皆可在設定關閉。

### 37 個注音符號錄音
- 老師的真人錄音，已修剪頭尾靜音、統一音量（發音內容未更動），檔名見 `AUDIO-MAPPING.md`。
- 詞語／完整音節的聲音優先順序：**老師上傳的錄音 > 台灣華語語音合成**；絕不會把「ㄆ」＋「ㄨ」拼接成「ㄆㄨˊ」。
- 教師設定 →「🔤 注音音檔」：查看 37 個符號狀態、試聽、**上傳替換**、還原內建、標記「老師已確認發音」，並列出目前還在用語音合成、**建議補錄**的音節與詞語。
- 注意：在後台「替換」的音檔**只存在這一台電腦的瀏覽器**（會包含在匯出 ZIP），**不會自動同步到網站**。要讓所有裝置都用新錄音，請把檔案用同樣的檔名放進專案 `voice/zhuyin/`，再 Commit + Push。

### 麥克風（只有口語訓練／整合模式需要）
- 開始前會出現「裝置準備」畫面（權限狀態、麥克風測試、語音辨識測試、播放測試、「啟用麥克風並開始」）。只在這一次點擊取得麥克風，練習中不會一直詢問；離開／結束／換成安靜學習就會釋放。
- 老師用的各瀏覽器開啟方式請見後台「🎓 學習模式與口語」最下方的教學（Windows Chrome／Edge、macOS Safari、iPad Safari）。
- **隱私**：不錄音、不上傳音訊。選「C 電腦語音辨識」時，瀏覽器可能把聲音傳到外部伺服器（例如 Google）辨識；不想使用就選 A 或 B（完全在本機運作）。

## 零之二、用 GitHub Desktop 更新到 v2（不用重建儲存庫、網址不變）

1. 解壓縮 `vocabulary-express-v2.zip`。
2. GitHub Desktop 選你的儲存庫 → **Show in Explorer（Finder）**。
3. 把解壓後**裡面的全部內容**複製進去，選「取代同名檔案」（資料夾最外層要直接看到 `index.html`，不要多一層；`.nojekyll` 是隱藏檔，要一起複製）。`materials/` 若你這幾天沒有改過教材，可以不動。
4. 回 GitHub Desktop：Summary 填「v2 聽說讀打整合」→ **Commit to main** → **Push origin**。
5. 等 1～3 分鐘，**Ctrl + F5** 重新整理。Settings → Pages 保持 Deploy from a branch / main / (root) 即可。
6. 學生電腦上已有的詞彙、設定、學習紀錄都會保留（自動升級，不需要重新匯入）。

## 一、第一次發布／替換舊版（最簡單做法）

你的舊版有兩個問題：外面多包了一層 `traffic-hero/` 資料夾，而且用 GitHub Actions 發布（會失敗）。
新版 **不需要 Actions**，改用 GitHub 內建的「Deploy from a branch」。

### 方法 A：用 GitHub Desktop（你已經安裝了）

1. 開啟 GitHub Desktop，左上選 `1124-express`，按上方 **Show in Explorer**（Mac 是 Show in Finder）打開本機資料夾。
2. **把資料夾裡「除了 `.git` 以外」的所有東西全部刪掉**（`.git` 是隱藏資料夾，不要動它；包含舊的 `traffic-hero`、`.github`、`incoming`、舊的 `README.md` 等都要刪）。
3. 解壓縮 `vocabulary-express-github-ready.zip`，把解壓後**裡面的全部內容**（`index.html`、`.nojekyll`、`materials`、`voice`、`music`、`lib`、`tools`、`README.md`、`TEST-REPORT.md`）複製進這個資料夾。
   - 檢查：資料夾最外層要直接看到 `index.html`，**不可以**再多一層資料夾。
   - `.nojekyll` 是隱藏檔：Windows 檔案總管「檢視 → 顯示 → 隱藏的項目」打勾；Mac 按 `Command + Shift + .`。
4. 回到 GitHub Desktop，左邊會列出很多變更。下方 Summary 填「正式發布版」→ **Commit to main** → 上方 **Push origin**。

### 方法 B：直接在 github.com 操作

1. 進入 `https://github.com/wanyu25-alt/1124-express` → **Settings → 最下方 Danger Zone → Delete this repository**（照指示輸入名稱確認）。
2. 重新建立一個同名 `1124-express`，選 **Public**。
3. 按 **uploading an existing file**，把解壓後「裡面的全部內容」拖進去（包含 `.nojekyll`），按 **Commit changes**。
   - 網站網址會維持 `https://wanyu25-alt.github.io/1124-express/`。

## 二、設定 GitHub Pages（只要一次）

1. 到儲存庫 **Settings → Pages**。
2. **Build and deployment → Source** 選 **Deploy from a branch**（如果原本是 GitHub Actions，要改掉）。
3. **Branch** 選 `main`，資料夾選 **/ (root)**，按 **Save**。

## 三、確認部署成功

1. 點儲存庫上方的 **Actions** 分頁，會看到「pages-build-deployment」，出現綠色勾勾就成功（約 1～3 分鐘）。
   - 這是 GitHub 自己的發布流程，不是你的檔案，不需要也不能修改。
2. 回到 **Settings → Pages**，上方會出現「Your site is live at …」。
3. 開啟 https://wanyu25-alt.github.io/1124-express/ ：
   - 首頁一開始會有「教材載入中」，之後出現 18 張圖卡。
   - 到「教師設定 → 教材與資料管理」，應看到「✅ 已讀取網站教材」。
4. 用另一台電腦或 iPad 開同一個網址，應該看到同樣的教材，不需要匯入。

## 四、日常更新

### 更新教材（新增／修改詞彙）
1. 在平常編輯的那台電腦，網頁後台 **教材與資料管理 → ⬇ 產生網站教材更新檔（ZIP）**。
   - 畫面會顯示哪些修改「已儲存在這台電腦，但尚未發布到網站」。
2. 把 ZIP 轉成 `materials` 資料夾，二選一：
   - **請 Claude 轉換**：把 ZIP 傳給 Claude，會得到新的 `materials` 資料夾。
   - **自己轉換**（需安裝 Node.js）：在專案資料夾開啟終端機，執行
     `node tools/build-materials.mjs 你的教材.zip`
     （會先檢查 ZIP 完整性，成功才取代 `materials`；它會拒絕含學習紀錄的備份檔）。
3. 用新的 `materials` 資料夾**整個取代**專案裡舊的 `materials`，GitHub Desktop Commit + Push。
4. 等 1～3 分鐘，其他裝置**重新整理**網頁就會讀到新版（網頁每次開啟都會檢查教材版本）。

### 更新老師錄音
把新的錄音用**相同的檔名**覆蓋 `voice/` 裡的檔案：`ok.m4a`（答對）、`retry.m4a`（再一次喔）、`cheer.m4a`（加油）、`again.m4a`（請再說一次）、`pass.m4a`（過關）；注音符號放 `voice/zhuyin/zy_*.m4a`；引導語音放 `voice/guidance/`（對照見 AUDIO-MAPPING.md）。Commit + Push。

### 加入背景音樂
把音樂檔改名為 `bgm.mp3` 放進 `music/`，到後台「音樂來源」選「專案內建音樂檔」。

### 更新遊戲功能
把新版 `index.html` 覆蓋舊的，Commit + Push。

## 五、隱私說明

網站與儲存庫是**公開**的，任何人拿到網址都能看到裡面的檔案。
- 本版不含學生姓名、學習紀錄、密碼或金鑰。含學生姓名的錄音（恭喜○○完成啦、○○加油）**不在這個壓縮檔裡**；網站會自動改播「恭喜過關」「加油加油」。
- 學習紀錄、星星、徽章只存在各裝置自己的瀏覽器，**不會同步**，也沒有雲端功能。
- 教材圖片如果來自網路，公開前請確認授權。

## 六、常見問題

**打開網址是 404**
- Settings → Pages 的 Source 是不是 **Deploy from a branch / main / (root)**？
- 儲存庫最外層有沒有直接看到 `index.html`？如果看到的是一個資料夾（例如 `traffic-hero`），表示多包了一層，要把裡面的檔案移到最外層。
- 網址要完整、大小寫一致：`https://wanyu25-alt.github.io/1124-express/`（帳號和儲存庫名稱要跟 GitHub 上完全相同）。
- 剛 Push 完要等 1～3 分鐘；到 Actions 看 pages-build-deployment 是不是綠色。

**Actions 紅色叉叉／出現 "github-pages" artifact 錯誤**
舊版的 `.github/workflows` 還在。把 `.github` 資料夾刪掉再 Push，並確認 Pages 的 Source 是 Deploy from a branch。

**看得到遊戲但沒有詞彙**
- 後台「教材與資料管理」會顯示錯誤原因與「重新檢查網站教材」按鈕。
- 通常是 `materials` 資料夾沒有一起上傳，或 `materials/images` 缺檔；重新上傳整個 `materials` 資料夾。
- 這台電腦已儲存的教材不會因為讀取失敗而被清掉。

**沒有聲音**
- 瀏覽器規定要「先點一下畫面」才能播放聲音：先按「開始」或任何按鈕。
- iPad：關閉側邊的靜音開關、調高音量；Safari 要在點擊後才會出聲。
- 後台「設定」確認老師語音、音效沒有被關掉，音量不是 0。
- 檔名必須完全一樣（小寫）：`ok.m4a`、`retry.m4a`、`cheer.m4a`、`again.m4a`、`pass.m4a`。
- 按 `Ctrl + F5`（Mac：`Command + Shift + R`）強制重新整理，避免讀到舊快取。
- 沒有背景音樂是正常的：沒有放 `bgm.mp3` 時使用程式合成的旋律。

**麥克風／語音辨識不能用**
需要 HTTPS（GitHub Pages 是 HTTPS，OK）並在跳出詢問時按「允許」。語音辨識是否支援取決於瀏覽器（Chrome／Edge 較穩，iPad Safari 依版本而異）；遊戲內保留「老師確認」備援。
