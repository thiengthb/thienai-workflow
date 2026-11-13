#!/usr/bin/env node
// Dựng một vòng duyệt giao diện từ file mô tả (xem README.md trong thư mục này).
//
//   node artifacts/compare/make-round.mjs <round.json | thư-mục-ảnh> <out-dir> [--id x] [--title "..."] [--intro "..."]
//
// Cách nhanh: đưa một thư mục ảnh tên <màn>__<bản>[@2x].png (ví dụ history-1180__old@2x.png, history-1180__new@2x.png),
// không cần viết round.json. Muốn chụp luôn từ hai địa chỉ thì dùng shoot.mjs cạnh file này.
//
// round.json: { id, title, intro?, scenarios?: [..], items: [{ id, label, group?, note?,
//               sides: [{ key, name, file, scale? }] }] }   (file: đường dẫn ảnh, tương đối với round.json;
//               scale: số điểm ảnh trên 1px CSS, ví dụ 2 cho ảnh chụp deviceScaleFactor 2; mặc định 1)
// Ra: <out-dir>/index.html (trang để đăng, đã gộp kit), <out-dir>/shots/*, <out-dir>/preview.html (mở thử trên máy),
// và in ra danh sách file cần đăng kèm trang.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, realpathSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, extname, resolve } from 'node:path';
import { writePublish } from '../kit/publish.mjs';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/** Pixel size of a PNG or JPEG file. */
export function imageSize(buf) {
  if (buf.readUInt32BE(0) === 0x89504e47) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let p = 2;
    while (p < buf.length) {
      if (buf[p] !== 0xff) { p++; continue; }
      const m = buf[p + 1];
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { w: buf.readUInt16BE(p + 7), h: buf.readUInt16BE(p + 5) };
      p += 2 + buf.readUInt16BE(p + 2);
    }
  }
  throw new Error('Chỉ đọc được PNG hoặc JPEG');
}

const safe = (s) => String(s).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');

export const CAPABILITIES = { comments: { customAnchors: true }, db: {}, downloads: true };
const SIDE_NAMES = { old: 'Cũ', new: 'Mới', before: 'Trước', after: 'Sau' };
const sideName = (k) => SIDE_NAMES[k] || (/^[a-z]$/.test(k) ? 'Phác ' + k.toUpperCase() : k.charAt(0).toUpperCase() + k.slice(1));
const sideRank = (k) => (k === 'old' || k === 'before' ? 0 : k === 'new' || k === 'after' ? 2 : 1);

/** A round spec from a folder of images named <screen>__<side>[@Nx].png|jpg; a trailing -<width> in <screen> groups
 *  the screens (≤ 500 is a phone). Sides sort old/before first, new/after last. */
export function specFromDir(dir, { id, title, intro } = {}) {
  const shots = readdirSync(dir).map((f) => [f, /^(.+?)__([a-z0-9-]+?)(?:@(\d+(?:\.\d+)?)x)?\.(png|jpe?g)$/i.exec(f)]).filter(([, m]) => m);
  if (!shots.length) throw new Error(`Không thấy ảnh tên <màn>__<bản>.png trong ${dir}`);
  const screens = new Map();
  for (const [f, m] of shots) {
    const [, screen, side, scale] = m;
    if (!screens.has(screen)) screens.set(screen, []);
    screens.get(screen).push({ key: side.toLowerCase(), name: sideName(side.toLowerCase()), file: f, scale: scale ? +scale : 1 });
  }
  const items = [...screens].sort(([a], [b]) => a.localeCompare(b)).map(([screen, sides]) => {
    const w = /-(\d{3,4})$/.exec(screen), base = w ? screen.slice(0, -w[0].length) : screen;
    const label = base.replace(/[-_]+/g, ' ').replace(/^./, (c) => c.toUpperCase());
    const group = w ? (+w[1] <= 500 ? `Điện thoại (${w[1]})` : `Khung rộng (${w[1]})`) : '';
    return { id: screen, label: w ? `${label} · ${+w[1] <= 500 ? 'điện thoại' : w[1]}` : label, group,
      sides: sides.sort((a, b) => sideRank(a.key) - sideRank(b.key) || a.key.localeCompare(b.key)) };
  });
  items.sort((a, b) => a.group.localeCompare(b.group) || 0);
  return { id: id || 'round-' + new Date().toISOString().slice(0, 16).replace(/[-:T]/g, ''), title: title || 'Duyệt giao diện', intro: intro || '', items };
}

export function build(spec, specDir, out) {
  mkdirSync(join(out, 'shots'), { recursive: true });
  const files = {};
  const seen = new Set();
  const once = (what, key) => { if (seen.has(key)) throw new Error(`${what} trùng sau khi chuẩn hóa tên: ${key}`); seen.add(key); };
  const round = {
    id: spec.id, title: spec.title, intro: spec.intro || '', scenarios: spec.scenarios || [],
    items: spec.items.map((it) => (once('Màn', 'item:' + safe(it.id)), {
      id: safe(it.id), label: it.label, group: it.group || '', note: it.note || '',
      sides: it.sides.map((s) => {
        const src = resolve(specDir, s.file);
        const buf = readFileSync(src);
        const { w, h } = imageSize(buf);
        const k = s.scale || 1;
        once(`Bản của màn ${it.id}`, `side:${safe(it.id)}:${safe(s.key)}`);
        const name = `shots/${safe(it.id)}__${safe(s.key)}${extname(src).toLowerCase()}`; // "__" cannot appear in a safe id, and ids are unique above
        copyFileSync(src, join(out, name));
        files[name] = join(out, name);
        return { key: safe(s.key), name: s.name, src: name, w: Math.round(w / k), h: Math.round(h / k) };
      }),
    })),
  };
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const html = readFileSync(join(here, 'template.html'), 'utf8')
    .replace('__TITLE__', () => esc(spec.title))
    .replace('/*KIT_CSS*/', () => readFileSync(join(here, '../kit/kit.css'), 'utf8'))
    .replace('/*KIT_JS*/', () => readFileSync(join(here, '../kit/kit.js'), 'utf8'))
    .replace('/*COMPARE_JS*/', () => readFileSync(join(here, 'compare.js'), 'utf8'))
    .replace('__ROUND__', () => JSON.stringify(round).replace(/</g, '\\u003c'));
  writeFileSync(join(out, 'index.html'), html);
  writeFileSync(join(out, 'preview.html'), `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>\n${html}\n</body></html>\n`);
  return { round, files };
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2), flag = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
  const opts = { id: flag('id'), title: flag('title'), intro: flag('intro') };
  const [specPath, out] = args;
  if (!specPath || !out) { console.error('Cách dùng: node make-round.mjs <round.json | thư-mục-ảnh> <out-dir> [--id x] [--title "..."]'); process.exit(1); }
  const isDir = statSync(specPath).isDirectory();
  const spec = isDir ? specFromDir(specPath, opts) : JSON.parse(readFileSync(specPath, 'utf8'));
  const { round, files } = build(spec, isDir ? resolve(specPath) : dirname(resolve(specPath)), resolve(out));
  console.log(`Đã dựng ${round.items.length} màn vào ${resolve(out)}/index.html (vòng ${round.id})`);
  for (const l of writePublish(resolve(out), { files, capabilities: CAPABILITIES, icon: 'compare', description: round.title })) console.log(l);
}
