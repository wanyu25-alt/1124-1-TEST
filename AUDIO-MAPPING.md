# AUDIO-MAPPING｜音檔對照表（語音優化版）

**檢查結果：37 個注音符號齊全，無缺漏、無重複、無損毀；4 個引導語音與 5 個通用語音也都存在。** 缺少的音檔：**無**（聲調沒有教學音檔，所以聲調不播放；詞彙／音節沒有老師錄音者用 AI 合成語音備援，並明確標示為 AI）。

處理方式（不改變發音）：依「開始發聲點」偵測，把每個檔案開頭的靜音修到約 0.3 秒（以 1.25× 播放約 0.24～0.27 秒），不剪到送氣音 ㄆㄊㄎㄑㄔㄘㄏ 的起始；響度統一 −18 LUFS；AAC 單聲道 44.1 kHz。**原始錄音完整保留在 `voice-original/`**（未處理版本，可隨時還原）；處理腳本在 `tools/process-audio.py`。

還原方法：把 `voice-original/zhuyin/` 的檔案複製回 `voice/zhuyin/` 覆蓋即可（引導語音、通用語音同理），再 Ctrl+F5。

## 注音符號（`voice/zhuyin/`）

| 符號 | Unicode | 檔名 | 原始→處理後 | 檔案前導靜音 | 播放時前導（1.25×） | 被移除開頭最大音量 |
|---|---|---|---|---|---|---|
| ㄅ | U+3105 | `voice/zhuyin/zy_b.m4a` | 2.24 s → 1.16 s | 0.30 s | 0.24 s | -39.4 dB |
| ㄆ | U+3106 | `voice/zhuyin/zy_p.m4a` | 1.81 s → 1.28 s | 0.30 s | 0.24 s | -40.3 dB |
| ㄇ | U+3107 | `voice/zhuyin/zy_m.m4a` | 1.90 s → 1.49 s | 0.30 s | 0.24 s | -41.0 dB |
| ㄈ | U+3108 | `voice/zhuyin/zy_f.m4a` | 2.24 s → 1.42 s | 0.30 s | 0.24 s | -38.7 dB |
| ㄉ | U+3109 | `voice/zhuyin/zy_d.m4a` | 2.15 s → 1.49 s | 0.30 s | 0.24 s | -43.2 dB |
| ㄊ | U+310A | `voice/zhuyin/zy_t.m4a` | 2.07 s → 1.58 s | 0.30 s | 0.24 s | -42.7 dB |
| ㄋ | U+310B | `voice/zhuyin/zy_n.m4a` | 2.15 s → 1.70 s | 0.30 s | 0.24 s | -39.4 dB |
| ㄌ | U+310C | `voice/zhuyin/zy_l.m4a` | 2.15 s → 1.51 s | 0.30 s | 0.24 s | -41.5 dB |
| ㄍ | U+310D | `voice/zhuyin/zy_g.m4a` | 2.07 s → 1.42 s | 0.30 s | 0.24 s | -44.1 dB |
| ㄎ | U+310E | `voice/zhuyin/zy_k.m4a` | 2.07 s → 1.90 s | 0.30 s | 0.24 s | -43.1 dB |
| ㄏ | U+310F | `voice/zhuyin/zy_h.m4a` | 2.07 s → 1.72 s | 0.31 s | 0.25 s | -42.8 dB |
| ㄐ | U+3110 | `voice/zhuyin/zy_j.m4a` | 2.07 s → 1.49 s | 0.33 s | 0.26 s | -43.4 dB |
| ㄑ | U+3111 | `voice/zhuyin/zy_q.m4a` | 2.07 s → 1.67 s | 0.32 s | 0.26 s | -43.7 dB |
| ㄒ | U+3112 | `voice/zhuyin/zy_x.m4a` | 2.32 s → 1.62 s | 0.30 s | 0.24 s | -41.6 dB |
| ㄓ | U+3113 | `voice/zhuyin/zy_zh.m4a` | 2.15 s → 1.62 s | 0.31 s | 0.25 s | -42.7 dB |
| ㄔ | U+3114 | `voice/zhuyin/zy_ch.m4a` | 2.41 s → 1.65 s | 0.30 s | 0.24 s | -44.7 dB |
| ㄕ | U+3115 | `voice/zhuyin/zy_sh.m4a` | 1.98 s → 1.60 s | 0.32 s | 0.26 s | -41.5 dB |
| ㄖ | U+3116 | `voice/zhuyin/zy_r.m4a` | 2.15 s → 1.51 s | 0.30 s | 0.24 s | -37.4 dB |
| ㄗ | U+3117 | `voice/zhuyin/zy_z.m4a` | 2.24 s → 1.46 s | 0.34 s | 0.27 s | -41.8 dB |
| ㄘ | U+3118 | `voice/zhuyin/zy_c.m4a` | 2.41 s → 1.65 s | 0.30 s | 0.24 s | -42.6 dB |
| ㄙ | U+3119 | `voice/zhuyin/zy_s.m4a` | 2.07 s → 1.70 s | 0.34 s | 0.27 s | -47.3 dB |
| ㄚ | U+311A | `voice/zhuyin/zy_a.m4a` | 2.32 s → 1.44 s | 0.30 s | 0.24 s | -43.4 dB |
| ㄛ | U+311B | `voice/zhuyin/zy_o.m4a` | 1.98 s → 1.46 s | 0.32 s | 0.25 s | -44.4 dB |
| ㄜ | U+311C | `voice/zhuyin/zy_e.m4a` | 2.07 s → 1.39 s | 0.30 s | 0.24 s | -39.6 dB |
| ㄝ | U+311D | `voice/zhuyin/zy_eh.m4a` | 1.90 s → 1.44 s | 0.30 s | 0.24 s | -43.1 dB |
| ㄞ | U+311E | `voice/zhuyin/zy_ai.m4a` | 2.49 s → 1.46 s | 0.30 s | 0.24 s | -43.0 dB |
| ㄟ | U+311F | `voice/zhuyin/zy_ei.m4a` | 2.41 s → 1.30 s | 0.30 s | 0.24 s | -38.1 dB |
| ㄠ | U+3120 | `voice/zhuyin/zy_ao.m4a` | 1.98 s → 1.44 s | 0.30 s | 0.24 s | -41.7 dB |
| ㄡ | U+3121 | `voice/zhuyin/zy_ou.m4a` | 1.98 s → 1.35 s | 0.30 s | 0.24 s | -41.2 dB |
| ㄢ | U+3122 | `voice/zhuyin/zy_an.m4a` | 1.90 s → 1.44 s | 0.30 s | 0.24 s | -43.1 dB |
| ㄣ | U+3123 | `voice/zhuyin/zy_en.m4a` | 2.32 s → 1.39 s | 0.30 s | 0.24 s | -44.6 dB |
| ㄤ | U+3124 | `voice/zhuyin/zy_ang.m4a` | 2.24 s → 1.49 s | 0.30 s | 0.24 s | -45.8 dB |
| ㄥ | U+3125 | `voice/zhuyin/zy_eng.m4a` | 2.32 s → 1.35 s | 0.30 s | 0.24 s | -41.1 dB |
| ㄦ | U+3126 | `voice/zhuyin/zy_er.m4a` | 2.75 s → 1.32 s | 0.30 s | 0.24 s | -40.7 dB |
| ㄧ | U+3127 | `voice/zhuyin/zy_i.m4a` | 2.32 s → 1.65 s | 0.30 s | 0.24 s | -41.5 dB |
| ㄨ | U+3128 | `voice/zhuyin/zy_u.m4a` | 2.15 s → 1.51 s | 0.30 s | 0.24 s | -40.5 dB |
| ㄩ | U+3129 | `voice/zhuyin/zy_yu.m4a` | 2.41 s → 1.56 s | 0.30 s | 0.24 s | -41.7 dB |

## 引導語音與通用語音

| 檔案 | 原始→處理後 | 前導（播放） |
|---|---|---|
| `voice/guidance/retry_try.m4a` | 3.18 s → 2.11 s | 0.24 s |
| `voice/guidance/no_stars.m4a` | 3.60 s → 2.81 s | 0.26 s |
| `voice/guidance/no_hear.m4a` | 4.03 s → 3.09 s | 0.24 s |
| `voice/guidance/slow.m4a` | 3.77 s → 3.00 s | 0.24 s |
| `voice/ok.m4a` | 2.67 s → 1.72 s | 0.24 s |
| `voice/retry.m4a` | 2.32 s → 2.25 s | 0.01 s |
| `voice/cheer.m4a` | 1.98 s → 1.56 s | 0.24 s |
| `voice/again.m4a` | 3.18 s → 2.04 s | 0.23 s |
| `voice/pass.m4a` | 2.67 s → 1.79 s | 0.22 s |

## 聲調
聲調（ˊˇˋ˙、一聲）沒有教學音檔，程式不會用 AI 單獨念符號，也不會拼接。若要補錄，建議檔名：`tone_2.m4a`、`tone_3.m4a`、`tone_4.m4a`、`tone_5.m4a`（目前程式未使用，補錄後需要老師告知再接上）。

## 需補錄清單
無。
