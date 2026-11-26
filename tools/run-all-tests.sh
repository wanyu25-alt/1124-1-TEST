#!/bin/bash
# 完整回歸：jsdom 單元/整合 + Chromium e2e。輸出完整記錄到 test-logs/，並彙總。
cd "$(dirname "$0")/.."
mkdir -p test-logs
export IDX=$PWD/index.html NODE_PATH=/home/claude/jt/node_modules:$(npm root -g)
: > test-logs/summary.txt
for f in tests/t*.js; do
  b=$(basename $f); case $b in t30h.js|t19h.js) continue;; esac
  timeout 290 node $f > test-logs/$b.log 2>&1
  echo "$b pass=$(grep -c '^PASS' test-logs/$b.log) fail=$(grep -c '^FAIL' test-logs/$b.log) broken=$(grep -c '^ERR\|^CRASH\|Cannot find module\|SyntaxError\|triggerUncaught' test-logs/$b.log)" >> test-logs/summary.txt
done
echo "== done ==" >> test-logs/summary.txt
