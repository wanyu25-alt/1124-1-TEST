# AUDIO-MAPPING｜音檔對照表

來源：老師提供的 `e67d010f-attachments.zip`（41 個 .m4a）。檢查結果：**37 個注音符號齊全、無缺漏、無重複、無無法讀取**；符號檔名使用的是 Unicode 注音區字元（U+3105–U+3129）；「ㄧ」為 **U+3127（不是漢字「一」U+4E00）**。

處理方式（不改變發音）：用 ffmpeg 修剪頭尾靜音（門檻 −45 dB，前後保留約 0.06～0.08 秒）、響度統一到 −18 LUFS（峰值上限 −2 dB）、轉單聲道 44.1 kHz AAC 96 kbps。每個原檔前面約 1 秒是底噪，語音本身完整保留（已逐檔檢查能量曲線）。原始檔未被刪除，保存在您提供的 ZIP 內。

## 一、37 個注音符號（`voice/zhuyin/`）

| 符號 | Unicode | 檔名 | 原始長度→處理後 |
|---|---|---|---|
| ㄅ | U+3105 | `voice/zhuyin/zy_b.m4a` | 2.28 s → 0.96 s |
| ㄆ | U+3106 | `voice/zhuyin/zy_p.m4a` | 1.86 s → 1.03 s |
| ㄇ | U+3107 | `voice/zhuyin/zy_m.m4a` | 1.94 s → 1.26 s |
| ㄈ | U+3108 | `voice/zhuyin/zy_f.m4a` | 2.28 s → 1.3 s |
| ㄉ | U+3109 | `voice/zhuyin/zy_d.m4a` | 2.2 s → 1.26 s |
| ㄊ | U+310A | `voice/zhuyin/zy_t.m4a` | 2.11 s → 1.29 s |
| ㄋ | U+310B | `voice/zhuyin/zy_n.m4a` | 2.2 s → 1.42 s |
| ㄌ | U+310C | `voice/zhuyin/zy_l.m4a` | 2.2 s → 1.4 s |
| ㄍ | U+310D | `voice/zhuyin/zy_g.m4a` | 2.11 s → 1.14 s |
| ㄎ | U+310E | `voice/zhuyin/zy_k.m4a` | 2.11 s → 1.47 s |
| ㄏ | U+310F | `voice/zhuyin/zy_h.m4a` | 2.11 s → 1.37 s |
| ㄐ | U+3110 | `voice/zhuyin/zy_j.m4a` | 2.11 s → 1.22 s |
| ㄑ | U+3111 | `voice/zhuyin/zy_q.m4a` | 2.11 s → 1.38 s |
| ㄒ | U+3112 | `voice/zhuyin/zy_x.m4a` | 2.37 s → 1.37 s |
| ㄓ | U+3113 | `voice/zhuyin/zy_zh.m4a` | 2.2 s → 1.42 s |
| ㄔ | U+3114 | `voice/zhuyin/zy_ch.m4a` | 2.45 s → 1.25 s |
| ㄕ | U+3115 | `voice/zhuyin/zy_sh.m4a` | 2.03 s → 1.41 s |
| ㄖ | U+3116 | `voice/zhuyin/zy_r.m4a` | 2.2 s → 1.26 s |
| ㄗ | U+3117 | `voice/zhuyin/zy_z.m4a` | 2.28 s → 1.25 s |
| ㄘ | U+3118 | `voice/zhuyin/zy_c.m4a` | 2.45 s → 1.4 s |
| ㄙ | U+3119 | `voice/zhuyin/zy_s.m4a` | 2.11 s → 1.43 s |
| ㄚ | U+311A | `voice/zhuyin/zy_a.m4a` | 2.37 s → 1.29 s |
| ㄛ | U+311B | `voice/zhuyin/zy_o.m4a` | 2.03 s → 1.17 s |
| ㄜ | U+311C | `voice/zhuyin/zy_e.m4a` | 2.11 s → 1.12 s |
| ㄝ | U+311D | `voice/zhuyin/zy_eh.m4a` | 1.94 s → 1.23 s |
| ㄞ | U+311E | `voice/zhuyin/zy_ai.m4a` | 2.54 s → 1.18 s |
| ㄟ | U+311F | `voice/zhuyin/zy_ei.m4a` | 2.45 s → 1.03 s |
| ㄠ | U+3120 | `voice/zhuyin/zy_ao.m4a` | 2.03 s → 1.16 s |
| ㄡ | U+3121 | `voice/zhuyin/zy_ou.m4a` | 2.03 s → 1.08 s |
| ㄢ | U+3122 | `voice/zhuyin/zy_an.m4a` | 1.94 s → 1.23 s |
| ㄣ | U+3123 | `voice/zhuyin/zy_en.m4a` | 2.37 s → 1.1 s |
| ㄤ | U+3124 | `voice/zhuyin/zy_ang.m4a` | 2.28 s → 1.21 s |
| ㄥ | U+3125 | `voice/zhuyin/zy_eng.m4a` | 2.37 s → 1.07 s |
| ㄦ | U+3126 | `voice/zhuyin/zy_er.m4a` | 2.79 s → 1.06 s |
| ㄧ | U+3127 | `voice/zhuyin/zy_i.m4a` | 2.37 s → 1.37 s |
| ㄨ | U+3128 | `voice/zhuyin/zy_u.m4a` | 2.2 s → 1.23 s |
| ㄩ | U+3129 | `voice/zhuyin/zy_yu.m4a` | 2.45 s → 1.3 s |

播放時：符號 → 該檔；**完整音節**（例：ㄆㄨˊ）與**詞語**不是由符號檔拼接而成，來源優先順序為：老師上傳的錄音（後台「注音音檔」上傳，或圖卡錄音）＞ 台灣華語（zh-TW）語音合成。聲調只靠音節／詞語的發音呈現，**沒有念聲調名稱**，也不需要聲調錄音。

## 二、4 個引導語音（`voice/guidance/`）

| 檔名 | 內容 | 原始→處理後 | 播放時機（事件） |
|---|---|---|---|
| `voice/guidance/retry_try.m4a` | 再試試看，你可以的 | 3.22 s → 1.99 s | 輸入錯誤、需要重試時，與原有「再一次喔」(retry.m4a) 交替使用 |
| `voice/guidance/no_stars.m4a` | 星星不夠囉，請再聽一次 | 3.65 s → 2.64 s | 想用需要星星的「注音提示」但星星不夠：不顯示、不扣星，並閃動「再聽一次」 |
| `voice/guidance/no_hear.m4a` | 沒有聽清楚，請再說一次喔 | 4.07 s → 2.83 s | 口語練習沒有偵測到有效聲音／語音辨識沒有確認（辨識失敗，不是答錯） |
| `voice/guidance/slow.m4a` | 沒關係，請慢慢來 | 3.82 s → 2.71 s | 同一題連續答錯第 3 次、口語重試超過上限、或語音辨識重複失敗後；語氣安撫，之後由老師確認或自動略過 |

## 三、事件 → 語音 總表（同一時間只會有一個老師聲音）

| 事件 | 語音 | 優先 |
|---|---|---|
| 每題出現 1 秒後（安靜／整合非口語題） | 詞語→符號→音節→詞語（注音佇列，每段間隔 0.3 秒） | 低（任何老師回饋可中斷） |
| 按「🔊 再聽一次」 | 同上，立即重新開始 | — |
| 答對一題 | `ok.m4a` 答對囉 | 1 |
| 答錯第 1 次 | `retry.m4a` 再一次喔 ⇄ `guidance/retry_try` 再試試看你可以的（交替） | 2 |
| 答錯第 2 次 | `cheer.m4a` 加油加油（並自動給部分注音） | 2 |
| 答錯第 3 次 | `guidance/slow` 沒關係請慢慢來 | 3 |
| 閒置太久 | 加油（`cheer`／含姓名者見隱私說明） | 1 |
| 注音提示但星星不夠 | `guidance/no_stars` | 3 |
| 口語沒偵測到／辨識不到 | `guidance/no_hear` | 3 |
| 口語重試超過上限 | `guidance/slow` | 3 |
| 老師按「再練習一次」 | `again.m4a` 請再說一次 | 3 |
| 一關結束 | `pass.m4a` 恭喜過關 →（播完 0.2 秒）→ 歡慶音效 1.65 秒 → 終點動畫 | 4 |
| 整個學習階段完成 | 恭喜（姓名）完成啦（僅在本機設定姓名時；公開版改播 pass） | 5 |

> 原有 5 個通用錄音全部保留；含學生姓名的錄音依先前決定**不放進公開專案**。
> 歡慶音效、星星音效、提示音皆由程式即時合成，沒有外部音檔，無版權問題。
> 待老師確認：`ok.m4a` 與 `pass.m4a`（長度相近）請實際聽一次，確認內容是「答對囉」與「恭喜過關」；若相反，把兩個檔名對調即可。
