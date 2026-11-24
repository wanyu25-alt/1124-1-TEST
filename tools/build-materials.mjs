#!/usr/bin/env node
// 把「匯出完整教材 ZIP」轉成網站內建教材資料夾 materials/
// 用法：node tools/build-materials.mjs <教材.zip> [--out materials] [--no-pack]
// 不需要安裝任何套件（只用 Node 內建模組）。
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';

const args = process.argv.slice(2);
const flag = n => args.includes(n);
const val = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const zipPath = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--out');
const OUT = path.resolve(val('--out', 'materials'));
const die = m => { console.error('✗ ' + m); process.exit(1); };
if (!zipPath) die('請指定教材 ZIP：node tools/build-materials.mjs 詞彙特快車_完整教材_日期.zip');
if (!fs.existsSync(zipPath)) die('找不到檔案：' + zipPath);

// ---- CRC32 ----
const T = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc32 = b => { let c = -1; for (let i = 0; i < b.length; i++) c = T[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };

// ---- 最小 ZIP 讀取（支援 stored / deflate）----
function readZip(buf) {
  let e = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) if (buf.readUInt32LE(i) === 0x06054b50) { e = i; break; }
  if (e < 0) die('這不是有效的 ZIP 檔（找不到結尾資訊），檔案可能損壞或下載不完整');
  const n = buf.readUInt16LE(e + 10); let p = buf.readUInt32LE(e + 16); const files = new Map();
  if (n > 5000) die('ZIP 內檔案過多');
  for (let i = 0; i < n; i++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) die('ZIP 目錄損壞');
    const flags = buf.readUInt16LE(p + 8), method = buf.readUInt16LE(p + 10), crc = buf.readUInt32LE(p + 16), csz = buf.readUInt32LE(p + 20), usz = buf.readUInt32LE(p + 24);
    const nl = buf.readUInt16LE(p + 28), el = buf.readUInt16LE(p + 30), cl = buf.readUInt16LE(p + 32), off = buf.readUInt32LE(p + 42);
    const name = buf.toString(flags & 0x800 ? 'utf8' : 'utf8', p + 46, p + 46 + nl); p += 46 + nl + el + cl;
    if (name.endsWith('/')) continue;
    if (/(^|\/)\.\.(\/|$)|^\/|\\/.test(name)) die('ZIP 內有不安全的路徑：' + name);
    const lo = off, lnl = buf.readUInt16LE(lo + 26), lel = buf.readUInt16LE(lo + 28), ds = lo + 30 + lnl + lel;
    let data = buf.subarray(ds, ds + csz);
    if (method === 8) data = zlib.inflateRawSync(data); else if (method !== 0) die('不支援的壓縮方式：' + name);
    if (data.length !== usz || crc32(data) !== crc) die('檔案內容與 ZIP 記錄不符（損壞）：' + name);
    files.set(name, data);
  }
  return files;
}

const jget = (m, n, req = true) => { const b = m.get(n); if (!b) { if (req) die('ZIP 缺少必要檔案：' + n); return null; } try { return JSON.parse(b.toString('utf8')); } catch { die(n + ' 不是有效的 JSON'); } };

const zip = readZip(fs.readFileSync(zipPath));
const man = jget(zip, 'manifest.json');
if (man.format !== '詞彙特快車') die('這不是「詞彙特快車」匯出的教材 ZIP');
if (!(man.schemaVersion >= 1) || man.schemaVersion > 1) die('不支援的教材格式版本：' + man.schemaVersion);
// 安全：網站是公開的，絕不能把學習紀錄放上去
if (man.kind === 'full' || zip.has('records.json') || zip.has('progress.json'))
  die('這是「完整資料備份」，內含學生學習紀錄，不能發布到公開網站。請改用「匯出完整教材 ZIP」。');
for (const [p, i] of Object.entries(man.files || {})) {
  const d = zip.get(p); if (!d || d.length !== i.size || crc32(d) !== i.crc32) die('完整性檢查失敗：' + p);
}
const cards = jget(zip, 'cards.json'), cats = jget(zip, 'categories.json'), sets = jget(zip, 'settings.json', false) || { schemaVersion: 1, portable: {} };
if (!Array.isArray(cards.cards)) die('cards.json 結構不正確');
if (!Array.isArray(cats.categories)) die('categories.json 結構不正確');
const ids = new Set();
for (const c of cards.cards) {
  if (!c.id || typeof c.text !== 'string' || !c.text) die('有圖卡缺少 id 或詞彙文字');
  if (ids.has(c.id)) die('圖卡 ID 重複：' + c.id); ids.add(c.id);
  for (const k of ['image', 'audio']) if (c[k]) {
    if (!/^(images|audio)\/[\w.\-]+$/.test(c[k])) die('「' + c.text + '」的 ' + k + ' 路徑不合法：' + c[k]);
    if (!zip.has(c[k])) die('「' + c.text + '」缺少檔案：' + c[k]);
  }
}

// ---- 寫入（先寫到暫存資料夾，成功後才換掉舊的 materials/，失敗不會弄壞原本的）----
const tmp = OUT + '.tmp-' + process.pid;
fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(path.join(tmp, 'images'), { recursive: true }); fs.mkdirSync(path.join(tmp, 'audio'), { recursive: true });
const fileInfo = {};
for (const c of cards.cards) for (const k of ['image', 'audio']) if (c[k] && !fileInfo[c[k]]) {
  const d = zip.get(c[k]); fs.writeFileSync(path.join(tmp, c[k]), d); fileInfo[c[k]] = { size: d.length, crc32: crc32(d) };
}
const w = (n, o) => { const s = JSON.stringify(o, null, 1); fs.writeFileSync(path.join(tmp, n), s); return s; };
const sC = w('cards.json', cards), sK = w('categories.json', cats), sS = w('settings.json', sets);
const hash = crypto.createHash('sha256').update(sC).update(sK).update(sS).update(JSON.stringify(Object.keys(fileInfo).sort().map(k => [k, fileInfo[k].crc32]))).digest('hex').slice(0, 12);
const manifest = {
  format: '詞彙特快車', schemaVersion: 1, kind: 'materials',
  version: hash,                                  // 內容有變才會改變；網頁用它判斷是否要更新
  updatedAt: man.exportedAt || new Date().toISOString(),
  builtAt: new Date().toISOString(),
  counts: { cards: cards.cards.length, categories: cats.categories.length, images: Object.keys(fileInfo).filter(p => p.startsWith('images/')).length, audio: Object.keys(fileInfo).filter(p => p.startsWith('audio/')).length },
  files: fileInfo,
  hashes: { 'cards.json': { size: Buffer.byteLength(sC) }, 'categories.json': { size: Buffer.byteLength(sK) }, 'settings.json': { size: Buffer.byteLength(sS) } },
};
w('manifest.json', manifest);

if (!flag('--no-pack')) {   // 本機直接雙擊 index.html（file://）時用的備援檔
  const mime = p => /\.png$/i.test(p) ? 'image/png' : /\.webp$/i.test(p) ? 'image/webp' : /\.gif$/i.test(p) ? 'image/gif' : /\.m4a$/i.test(p) ? 'audio/mp4' : /\.mp3$/i.test(p) ? 'audio/mpeg' : /\.(wav)$/i.test(p) ? 'audio/wav' : /\.(ogg|oga)$/i.test(p) ? 'audio/ogg' : /\.(jpe?g)$/i.test(p) ? 'image/jpeg' : 'application/octet-stream';
  const du = p => p ? 'data:' + mime(p) + ';base64,' + zip.get(p).toString('base64') : '';
  const P = { ver: hash, updatedAt: manifest.updatedAt, cards: cards.cards.map(c => ({ id: c.id, text: c.text, zy: c.zy || '', img: du(c.image), audio: du(c.audio), cats: c.cats || [], created: c.created, modified: c.modified })), cats: cats.categories.map(c => ({ id: c.id, name: c.name, order: c.cardOrder || [] })), set: sets.portable || {} };
  fs.writeFileSync(path.join(tmp, 'pack.js'), 'window.TH_PACK=' + JSON.stringify(P) + ';\n');
}
fs.rmSync(OUT, { recursive: true, force: true });
fs.renameSync(tmp, OUT);
console.log(`✓ 已產生 ${path.relative(process.cwd(), OUT) || OUT}/  版本 ${hash}`);
console.log(`  圖卡 ${manifest.counts.cards}、分類 ${manifest.counts.categories}、圖片 ${manifest.counts.images}、音檔 ${manifest.counts.audio}`);
