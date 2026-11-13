#!/usr/bin/env node
// Dựng một vòng duyệt giao diện từ file mô tả (xem README.md trong thư mục này).
//
//   node artifacts/compare/make-round.mjs <round.json> <out-dir>
//
// round.json: { id, title, intro?, scenarios?: [..], items: [{ id, label, group?, note?,
//               sides: [{ key, name, file, scale? }] }] }   (file: đường dẫn ảnh, tương đối với round.json;
//               scale: số điểm ảnh trên 1px CSS, ví dụ 2 cho ảnh chụp deviceScaleFactor 2; mặc định 1)
// Ra: <out-dir>/index.html (trang để đăng, đã gộp kit), <out-dir>/shots/*, <out-dir>/preview.html (mở thử trên máy),
// và in ra danh sách file cần đăng kèm trang.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, realpathSync } from 'node:fs';
import { dirname, join, extname, resolve } from 'node:path';
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

export function build(spec, specDir, out) {
  mkdirSync(join(out, 'shots'), { recursive: true });
  const files = {};
  const round = {
    id: spec.id, title: spec.title, intro: spec.intro || '', scenarios: spec.scenarios || [],
    items: spec.items.map((it) => ({
      id: safe(it.id), label: it.label, group: it.group || '', note: it.note || '',
      sides: it.sides.map((s) => {
        const src = resolve(specDir, s.file);
        const buf = readFileSync(src);
        const { w, h } = imageSize(buf);
        const k = s.scale || 1;
        const name = `shots/${safe(it.id)}__${safe(s.key)}${extname(src).toLowerCase()}`; // "__" cannot appear in a safe id, so names never collide
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
  const [specPath, out] = process.argv.slice(2);
  if (!specPath || !out) { console.error('Cách dùng: node make-round.mjs <round.json> <out-dir>'); process.exit(1); }
  const spec = JSON.parse(readFileSync(specPath, 'utf8'));
  const { round, files } = build(spec, dirname(resolve(specPath)), resolve(out));
  console.log(`Đã dựng ${round.items.length} màn vào ${resolve(out)}/index.html`);
  console.log('File đăng kèm trang (tham số files của Artifact):');
  console.log(JSON.stringify(files, null, 2));
}
