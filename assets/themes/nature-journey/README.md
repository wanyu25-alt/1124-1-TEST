# 自然旅行繪本風主題（nature-journey）

這個資料夾是網站的**美術主題**，和詞彙圖卡（`vocab/images/`）、錄音（`voice/`）完全分開。

## 怎麼開啟預覽
- 在網址後面加 `?theme=nature`，例如：
  `https://wanyu25-alt.github.io/1124-1-TEST/?theme=nature`
- 這台裝置會記住設定，之後打開網站都會是新主題。
- 要回到原本畫面：按左下角「回到原本畫面」，或在網址後面加 `?theme=default`。

## 檔案
| 檔案 | 用途 |
|---|---|
| `theme.css` | 色彩變數與共用元件樣式。只在預覽主題開啟時套用 |
| `manifest.json` | 素材索引：每個圖片一個英文 ID |
| 各子資料夾 | 之後放入重新生成的圖片：backgrounds、tracks、vehicles、characters、animals、decorations、rewards、icons、ui |

## 放入新圖片的方法
1. 依 `THEME-NATURE-STAGE1-REPORT.md` 第 7 節的規格製作圖片。
2. 把圖片放進對應的資料夾，檔名用英文，例如 `animals/rabbit.png`。
3. 在 `manifest.json` 找到同名 ID，把 `src` 改成 `"animals/rabbit.png"`，`status` 改成 `"ready"`。
4. 之後要換圖，只要用同一個檔名覆蓋即可。

`src` 是空的，或 `status` 不是 `ready` 的素材，網站會自動使用原本的畫面，不會出錯。
