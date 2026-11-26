#!/bin/bash
# 舊版內建詞彙樣本（v12.0，1000 詞／592 圖，全部待審）供 t180/t190 驗證「詞彙庫機制」用；不進發佈包
D=${LEGACY_VDIR:-/tmp/vdlegacy}
[ -f "$D/vocab/vocabulary.json" ] || { rm -rf "$D"; mkdir -p "$D"; git -C "$(dirname "$0")/.." archive a4b8444 vocab | tar -x -C "$D"; }
echo "$D"
