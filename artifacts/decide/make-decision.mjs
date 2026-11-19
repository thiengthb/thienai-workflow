#!/usr/bin/env node
// Dựng một trang chọn phương án từ file mô tả (xem README.md trong thư mục này).
//
//   node artifacts/decide/make-decision.mjs <decision.json> <out-dir>
//
// decision.json: { id, question, context?, title?,                 nhiều câu: thay options/criteria/recommend bằng
//   parts: [{ key, name?, question, context?, options, criteria?, recommend? }]   (2–6 câu, ảnh ra img/<câu>-<phương án>)
//   options: [{ key, name, short?, summary?, image?, scale?, shot?, pros?: [..], cons?: [..], links?: [{ text, url, note? }] }],   (2–4 phương án; image tương đối với file json)
//   shotSize?: "1180x760",                    shot: link hoặc file html của phương án; script tự chụp @2x ở shotSize thay cho image
//   criteria?: [{ name, values: { <key>: "tốt" | "vừa" | "kém" | { text, tone: "good"|"bad"|"" } } }],
//   recommend?: { key, why } }                                                                (ẩn trên màn tới khi thien chọn)
// Ra: <out-dir>/index.html (trang để đăng, đã gộp kit), <out-dir>/img/*, <out-dir>/preview.html, và in danh sách file cần đăng.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, realpathSync } from 'node:fs';
import { packHtml } from '../kit/pack.mjs';
import { dirname, join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { imageSize } from '../compare/make-round.mjs';
import { writePublish } from '../kit/publish.mjs';
import { shoot, toUrl, parseSizes } from '../kit/shoot.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const safe = (s) => String(s).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');
const TONES = { 'tốt': 'good', 'cao': '', 'thấp': '', 'vừa': '', 'kém': 'bad', 'ít': '', 'nhiều': '' };

/** A rating as { text, tone }: a plain word takes its tone from the word list (tốt = good, kém = bad, other words neutral). */
export function rating(v) {
  if (v && typeof v === 'object') return { text: String(v.text ?? ''), tone: ['good', 'bad'].includes(v.tone) ? v.tone : '' };
  const text = String(v ?? '');
  return { text, tone: TONES[text.toLowerCase()] ?? '' };
}

/** Một bộ phương án (cả trang, hay một câu khi có "parts"): kiểm 2–4 phương án, khóa, tiêu chí, đề xuất; chép ảnh vào img/. */
function makePart(spec, specDir, out, files, where = '', prefix = '') {
  const fail = (m) => { throw new Error(where + m); };
  const options = spec.options || [];
  if (options.length < 2 || options.length > 4) fail('Cần 2 đến 4 phương án');
  const seen = new Set();
  const part = {
    options: options.map((o) => {
      const key = safe(o.key);
      if (!key || seen.has(key)) fail(`Khóa phương án trống hoặc trùng sau khi chuẩn hóa: ${o.key}`);
      seen.add(key);
      let image = null;
      if (o.image) {
        const src = resolve(specDir, o.image);
        const { w, h } = imageSize(readFileSync(src));
        const k = o.scale || 1;
        const name = `img/${prefix}${key}${extname(src).toLowerCase()}`;
        mkdirSync(dirname(join(out, name)), { recursive: true });
        copyFileSync(src, join(out, name));
        files[name] = join(out, name);
        image = { src: name, w: Math.round(w / k), h: Math.round(h / k) };
      }
      return { key, name: String(o.name || key), short: String(o.short || String(o.name || key).split(' · ')[0]), summary: o.summary || '',
        image, pros: (o.pros || []).map(String), cons: (o.cons || []).map(String),
        links: (o.links || []).map((l) => {
          let u = null;
          try { u = new URL(String(l.url || '')); } catch { /* báo lỗi ngay dưới */ }
          if (!u || u.protocol !== 'https:') fail(`Link của phương án ${key} phải là https và mở được: ${l.url}`);
          return { text: String(l.text || l.url), url: String(l.url), note: String(l.note || '') };
        }) };
    }),
    criteria: (spec.criteria || []).map((c) => {
      const values = {};
      for (const [k, v] of Object.entries(c.values || {})) { if (!seen.has(safe(k))) fail(`Tiêu chí "${c.name}" nhắc phương án không có: ${k}`); values[safe(k)] = rating(v); }
      return { name: String(c.name), values };
    }),
    recommend: null,
  };
  if (spec.recommend) {
    const key = safe(spec.recommend.key);
    if (!seen.has(key)) fail(`Đề xuất trỏ tới phương án không có: ${spec.recommend.key}`);
    part.recommend = { key, why: String(spec.recommend.why || '') };
  }
  return part;
}

export function build(spec, specDir, out) {
  const fail = (m) => { throw new Error(m); };
  if (!spec.id || !spec.question) fail('Thiếu id hoặc question');
  mkdirSync(join(out, 'img'), { recursive: true });
  const files = {};
  const decision = { id: spec.id, title: spec.title || spec.question, question: spec.question, context: spec.context || '' };
  if (spec.parts) {
    // Nhiều câu trên một trang (KH9 ga 3): mỗi câu có key, question, options, criteria?, recommend? riêng.
    if (!Array.isArray(spec.parts) || spec.parts.length < 2 || spec.parts.length > 6) fail('parts cần 2 đến 6 câu');
    const keys = new Set();
    decision.parts = spec.parts.map((p, i) => {
      const key = safe(p.key);
      if (!key || keys.has(key)) fail(`Khóa câu trống hoặc trùng sau khi chuẩn hóa: ${p.key}`);
      if (!p.question) fail(`Câu ${key} thiếu question`);
      keys.add(key);
      return { key, name: String(p.name || p.question), question: String(p.question), context: String(p.context || ''),
        ...makePart(p, specDir, out, files, `Câu ${i + 1} (${key}): `, key + '/') };   // một thư mục mỗi câu: khóa nối bằng "-" có thể trùng
    });
  } else Object.assign(decision, makePart(spec, specDir, out, files));
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const html = packHtml(readFileSync(join(here, 'template.html'), 'utf8')
    .replace('__TITLE__', () => esc(decision.title))
    .replace('/*KIT_CSS*/', () => readFileSync(join(here, '../kit/kit.css'), 'utf8'))
    .replace('/*KIT_JS*/', () => readFileSync(join(here, '../kit/kit.js'), 'utf8'))
    .replace('/*DECIDE_JS*/', () => readFileSync(join(here, 'decide.js'), 'utf8'))
    .replace('__DECISION__', () => JSON.stringify(decision).replace(/</g, '\\u003c')));
  writeFileSync(join(out, 'index.html'), html);
  writeFileSync(join(out, 'preview.html'), `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>\n${html}\n</body></html>\n`);
  return { decision, files };
}

/** Options with "shot" (a link or html file) and no image get screenshotted @2x into <out>/src; image and scale are set in place. */
export async function shootOptions(spec, specDir, out, shootFn = shoot) {
  const groups = spec.parts ? spec.parts.map((p) => [safe(p.key) + '/', p.options || []]) : [['', spec.options || []]];
  const todo = groups.flatMap(([pre, os]) => os.filter((o) => o.shot && !o.image).map((o) => Object.assign(o, { _pre: pre })));
  if (!todo.length) return;
  const [size] = parseSizes(spec.shotSize || '1180x760');
  if (!size) throw new Error(`shotSize không đúng dạng rộngxcao: ${spec.shotSize}`);
  mkdirSync(join(out, 'src'), { recursive: true });
  const shots = todo.map((o) => {
    const target = /^[a-z][a-z0-9+.-]+:/i.test(o.shot) ? o.shot : resolve(specDir, o.shot);
    const path = join(out, 'src', `${o._pre}${safe(o.key)}@2x.png`);
    mkdirSync(dirname(path), { recursive: true });
    delete o._pre;
    return { o, url: toUrl(target), path };
  });
  await shootFn([size], () => shots, { wait: spec.shotWait ?? 600 });
  for (const { o, path } of shots) Object.assign(o, { image: path, scale: 2 });
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const [specPath, out] = process.argv.slice(2);
  if (!specPath || !out) { console.error('Cách dùng: node make-decision.mjs <decision.json> <out-dir>'); process.exit(1); }
  const spec = JSON.parse(readFileSync(specPath, 'utf8'));
  const specDir = dirname(resolve(specPath));
  await shootOptions(spec, specDir, resolve(out)).catch((e) => { console.error(e.message); process.exit(1); });
  const { decision, files } = build(spec, specDir, resolve(out));
  console.log(decision.parts ? `Đã dựng ${decision.parts.length} câu (${decision.parts.map((p) => p.options.length).join(', ')} phương án) vào ${resolve(out)}/index.html`
    : `Đã dựng ${decision.options.length} phương án vào ${resolve(out)}/index.html`);
  for (const l of writePublish(resolve(out), { files, capabilities: { comments: {}, db: {}, sample: {} }, icon: 'choice', description: decision.question })) console.log(l);
}
