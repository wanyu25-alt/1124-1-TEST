詞彙特快車 V077 合併教材庫
詞彙 1000；已配置 950；WebP 961；待補 50。
保留原始 ID、分類、注音及圖片位元組。未新增或重新編碼圖片。
未含 PNG 瀏覽版；清冊 PNG 欄留空。
圖片語意與注音仍待教師複核，尚未測試網站匯入。
missing_images.csv 為待補清單。

[v19.0 程式端說明]
- 程式讀取 vocabulary.json / categories.json / levels.json / manifest.json / default-library.json。
- default-library.json：啟用 950 個有圖詞，全部圖片視為已審核；50 個無圖詞不啟用（見 missing_images.csv）。補圖後更新 vocabulary.json、圖片與 default-library.json 的 en 即可。
