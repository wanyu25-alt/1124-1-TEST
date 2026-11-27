#!/bin/bash
# 用 macOS 內建「美佳（Meijia）」語音，把網站要念的詞彙／單字預先錄成音檔（給 iPhone／iPad 使用；網頁合成語音在 iOS Safari 沒有聲音）。
# 只用 macOS 內建的 say 與 afconvert，免費、不連網。不修改既有教材、圖片與錄音。
# 用法：bash tools/make-tts-audio.sh 清單檔（每行一段文字） [速度，預設 131≈網站 AI 語速 0.75]
# 產出：voice/tts/<每個字的 Unicode 十六進位以 _ 連接>.m4a，以及 voice/tts/index.json（文字 → 檔名）
set -eu
cd "$(dirname "$0")/.."; LIST=$1; RATE=${2:-131}; OUT=voice/tts; mkdir -p "$OUT"; TMP=$(mktemp -d)
say -v '?' | grep -q '^Meijia ' || { echo '這台 Mac 沒有 Meijia（美佳）語音：系統設定 → 輔助使用 → 朗讀內容 → 系統語音 → 管理語音 → 中文（台灣）→ 美佳'; exit 1; }
name(){ printf '%s' "$1" | iconv -f UTF-8 -t UTF-32BE | xxd -p -c4 | sed 's/^0*//' | paste -sd_ -; }
n=0; new=0
while IFS= read -r t || [ -n "$t" ]; do t=$(printf '%s' "$t" | tr -d '\r'); [ -z "$t" ] && continue; n=$((n+1)); f=$(name "$t")
  if [ ! -s "$OUT/$f.m4a" ]; then say -v Meijia -r "$RATE" -o "$TMP/a.aiff" -- "$t" && afconvert -f m4af -d aac -b 32000 -c 1 "$TMP/a.aiff" "$OUT/$f.m4a" && new=$((new+1)); fi
done < "$LIST"
# 重新產生索引（依目前資料夾內的音檔）：文字 → 檔名
export PATH=/usr/local/bin:$PATH
node -e "const fs=require('fs');const d='$OUT';const m={};for(const f of fs.readdirSync(d).filter(x=>x.endsWith('.m4a'))){const t=f.replace('.m4a','').split('_').map(h=>String.fromCodePoint(parseInt(h,16))).join('');m[t]=f}fs.writeFileSync(d+'/index.json',JSON.stringify({v:1,voice:'Meijia',rate:$RATE,made:new Date().toISOString().slice(0,10),files:m}))"
rm -rf "$TMP"; echo "清單 $n 筆，新錄 $new 筆；資料夾共 $(ls $OUT/*.m4a | wc -l | tr -d ' ') 個音檔，$(du -sh $OUT | cut -f1)"
