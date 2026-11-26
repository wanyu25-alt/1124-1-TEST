#!/bin/bash
# Chromium 端到端（模擬）全部：新教材站台（8124）＋舊版詞彙樣本站台（8130，phase5/phase6 驗證詞彙庫機制）
cd "$(dirname "$0")/.."; R=$PWD; mkdir -p test-logs/e2e; : > test-logs/e2e-summary.txt
export NODE_PATH=$(npm root -g):/tmp/e2e/node_modules
pkill -f "sv4.mjs" 2>/dev/null; sleep 1
(cd /tmp/e2e && setsid nohup node sv4.mjs $R 8124 > /tmp/sv4.log 2>&1 &)
D=$(bash tools/make-legacy-vocab.sh); rm -rf /tmp/legacysite; mkdir /tmp/legacysite
for f in $(ls $R | grep -v '^vocab$\|^test-logs$\|^backup$'); do ln -s $R/$f /tmp/legacysite/$f; done; ln -s $D/vocab /tmp/legacysite/vocab
(cd /tmp/e2e && setsid nohup node sv4.mjs /tmp/legacysite 8130 > /tmp/sv5.log 2>&1 &); sleep 2
for f in $R/tests/e2e/*.js; do b=$(basename $f); port=8124; case $b in phase5-library.js|phase6-default.js) port=8130;; esac
 out=$(cd /tmp/e2e && E2E_PORT=$port timeout 280 node $f 2>&1); echo "$out" > test-logs/e2e/$b.log
 echo "$b pass=$(echo "$out"|grep -c "^PASS") fail=$(echo "$out"|grep -c "^FAIL") broken=$(echo "$out"|grep -c "triggerUncaught\|TimeoutError")" >> test-logs/e2e-summary.txt
 echo "$out"|grep '^FAIL'|cut -c1-220|sed 's/^/   /' >> test-logs/e2e-summary.txt; done
echo "== done ==" >> test-logs/e2e-summary.txt
