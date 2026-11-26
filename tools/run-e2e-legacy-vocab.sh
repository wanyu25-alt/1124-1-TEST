cd /home/claude/repo; D=$(bash tools/make-legacy-vocab.sh)
rm -rf /tmp/legacysite; mkdir /tmp/legacysite; for f in $(ls /home/claude/repo | grep -v '^vocab$\|^test-logs$\|^backup$\|^\.'); do ln -s /home/claude/repo/$f /tmp/legacysite/$f; done; ln -s $D/vocab /tmp/legacysite/vocab
(cd /tmp/e2e && setsid nohup node sv4.mjs /tmp/legacysite 8130 > /tmp/sv5.log 2>&1 &); sleep 2
for f in phase5-library phase6-default; do (cd /tmp/e2e && E2E_PORT=8130 NODE_PATH=$(npm root -g):/tmp/e2e/node_modules timeout 280 node /home/claude/repo/tests/e2e/$f.js 2>&1) > test-logs/e2e/$f.js.log; echo "$f pass=$(grep -c '^PASS' test-logs/e2e/$f.js.log) fail=$(grep -c '^FAIL' test-logs/e2e/$f.js.log)"; grep '^FAIL' test-logs/e2e/$f.js.log|cut -c1-200; done
