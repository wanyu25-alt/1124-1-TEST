#!/usr/bin/env node
// 把「增量教材包」合併進網站正式教材資料夾 vocab/（之後再用 GitHub Desktop 更新網站）
// 用法：node tools/merge-vocab-pack.mjs <解壓後的教材包資料夾> [--vocab vocab] [--apply]
//   不加 --apply 只預覽（不改任何檔案）。可重複執行：同一個包再合併一次不會產生重複詞彙或圖片。
// 規則：依詞彙 ID 比對；不改既有 ID、不覆蓋既有圖片、不刪除任何東西；圖片依 SHA-256 去重；
//       新詞彙才會加入；既有詞彙只會「補上新圖片」。注音／分類不一致只會列出，不自動改。
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const a = process.argv.slice(2), has = n => a.includes(n), val = (n, d) => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : d };
const pack = a.find((x, i) => !x.startsWith('--') && a[i - 1] !== '--vocab');
const V = path.resolve(val('--vocab', 'vocab')), APPLY = has('--apply');
const die = m => { console.error('✗ ' + m); process.exit(1) };
if (!pack || !fs.existsSync(pack) || !fs.statSync(pack).isDirectory()) die('請指定「解壓後」的教材包資料夾（內含 vocabulary.json 與 images/）。若是 ZIP，請先解壓縮。');
const rd = (d, f) => JSON.parse(fs.readFileSync(path.join(d, f), 'utf8'));
for (const f of ['vocabulary.json', 'categories.json']) if (!fs.existsSync(path.join(pack, f))) die('教材包缺少 ' + f);
if (!fs.existsSync(path.join(V, 'vocabulary.json'))) die('找不到網站教材 ' + V + '/vocabulary.json');
const nv = rd(pack, 'vocabulary.json'), nc = rd(pack, 'categories.json'), cur = rd(V, 'vocabulary.json'), cc = rd(V, 'categories.json');
if (!Array.isArray(nv) || !Array.isArray(cur)) die('vocabulary.json 格式不正確（需要詞彙清單）');
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const shaFile = path.join(V, 'image-sha256.json'), shaMap = fs.existsSync(shaFile) ? JSON.parse(fs.readFileSync(shaFile, 'utf8')) : {};
const known = new Set(Object.values(shaMap)), byId = new Map(cur.map(w => [w.id, w]));
const rep = { newWords: [], newImgs: [], dupImgs: 0, missingFiles: [], diffZy: [], diffCat: [], badId: [] };
const plan = [];
for (const w of nv) {
  if (!w || !/^[\w-]{1,40}$/.test(w.id || '') || !w.word) { rep.badId.push(w && w.id); continue }
  const imgs = (w.images || []).map(p => ({ src: path.join(pack, p), name: path.basename(p) }));
  const ok = [];
  for (const im of imgs) {
    if (!fs.existsSync(im.src)) { rep.missingFiles.push(w.id + ':' + im.name); continue }
    const h = sha(im.src); if (known.has(h) || ok.some(o => o.h === h)) { rep.dupImgs++; continue } ok.push({ ...im, h });
  }
  const b = byId.get(w.id);
  if (!b) { rep.newWords.push(w.id); plan.push({ w, ok, isNew: true }) }
  else {
    if (b.zhuyin !== w.zhuyin) rep.diffZy.push(w.id + ' ' + b.zhuyin + ' → ' + w.zhuyin);
    if (b.categoryId !== w.categoryId) rep.diffCat.push(w.id + ' ' + b.categoryId + ' → ' + w.categoryId);
    if (ok.length) plan.push({ w, ok, isNew: false });
  }
  ok.forEach(o => rep.newImgs.push(w.id + ':' + o.name));
}
console.log(`教材包：${nv.length} 詞；網站目前：${cur.length} 詞`);
console.log(`新增詞彙 ${rep.newWords.length}｜新增圖片 ${rep.newImgs.length}｜重複圖片（略過）${rep.dupImgs}｜缺少圖片檔 ${rep.missingFiles.length}｜ID 不合格 ${rep.badId.length}`);
if (rep.diffZy.length) console.log('注音不同（不會自動改）：\n  ' + rep.diffZy.slice(0, 20).join('\n  '));
if (rep.diffCat.length) console.log('分類不同（不會自動改）：\n  ' + rep.diffCat.slice(0, 20).join('\n  '));
if (rep.badId.length || rep.missingFiles.length) console.log('⚠ 有問題的項目會被略過，不會寫入。');
if (!APPLY) { console.log('\n（預覽模式，沒有改任何檔案。確認後加上 --apply 才會合併）'); process.exit(0) }
const stamp = new Date().toISOString().replace(/[:.]/g, '-'), bk = path.join(V, '..', 'backup-vocab-' + stamp);
fs.mkdirSync(bk, { recursive: true }); for (const f of ['vocabulary.json', 'categories.json', 'image-sha256.json', 'manifest.json', 'levels.json']) if (fs.existsSync(path.join(V, f))) fs.copyFileSync(path.join(V, f), path.join(bk, f));
fs.mkdirSync(path.join(V, 'images'), { recursive: true });
for (const { w, ok, isNew } of plan) {
  const paths = [];
  for (const o of ok) { let n = o.name, dst = path.join(V, 'images', n); if (fs.existsSync(dst) && sha(dst) !== o.h) { n = w.id + '_' + o.h.slice(0, 8) + path.extname(o.name); dst = path.join(V, 'images', n) } fs.copyFileSync(o.src, dst); shaMap[n] = o.h; known.add(o.h); paths.push('images/' + n) }
  if (isNew) cur.push({ ...w, images: paths, primaryImage: paths[0] || '', hasImage: paths.length > 0 });
  else { const b = byId.get(w.id); b.images = [...(b.images || []), ...paths]; if (!b.primaryImage) b.primaryImage = paths[0]; b.hasImage = true }
}
const cm = new Map(cc.map(c => [c.id, c])); (nc || []).forEach(c => { if (!cm.has(c.id)) cc.push(c) });
fs.writeFileSync(path.join(V, 'vocabulary.json'), JSON.stringify(cur, null, 1)); fs.writeFileSync(path.join(V, 'categories.json'), JSON.stringify(cc, null, 1)); fs.writeFileSync(shaFile, JSON.stringify(shaMap, null, 1));
if (fs.existsSync(path.join(V, 'manifest.json'))) { const m = rd(V, 'manifest.json'); m.words = cur.length; m.withImages = cur.filter(w => (w.images || []).length).length; m.images = cur.reduce((s, w) => s + (w.images || []).length, 0); m.missingImageWords = cur.length - m.withImages; m.mergedAt = new Date().toISOString(); fs.writeFileSync(path.join(V, 'manifest.json'), JSON.stringify(m, null, 1)) }
console.log(`\n✓ 已合併。備份在 ${bk}\n  網站教材現在：${cur.length} 詞。請用 GitHub Desktop 檢查變更後再提交；網站更新後，其他裝置重新整理即可取得新教材（不需清除本機資料）。`);
