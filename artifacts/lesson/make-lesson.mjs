#!/usr/bin/env node
// Gắn lõi chung và khung buổi học vào một trang học (xem README.md trong thư mục này). Chạy lại được: thay bản cũ.
//
//   node artifacts/lesson/make-lesson.mjs learning/<môn>/pages/lesson-NN.html [lesson-id]
//
// Trang phải có các thẻ rỗng (hoặc bản cũ) với id: kit-css, lesson-css (style), kit-js, lesson-js, lesson-kit (script).
// lesson-id: tham số, hoặc "id" trong <script id="lesson">, hoặc đoán từ đường dẫn (frontend-06).
import { readFileSync, writeFileSync, realpathSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(join(here, p), 'utf8');
const PARTS = {
  'kit-css': ['style', '../kit/kit.css'],
  'lesson-css': ['style', 'lesson.css'],
  'kit-js': ['script', '../kit/kit.js'],
  'lesson-js': ['script', 'lesson.js'],
  'lesson-kit': ['script', '../../learning/teaching/kit/kit.js'],   // tự lưu chỗ đang học, chế độ học lại
};

export function guessId(file) {
  const m = file.replace(/\\/g, '/').match(/learning\/([^/]+)\/pages\/lesson-(\d+)/);
  return m ? `${m[1]}-${m[2].padStart(2, '0')}` : basename(file, '.html');
}

/** Returns the page with every kit part filled in and the lesson-id meta set. */
export function fill(html, id) {
  for (const [part, [tag, src]] of Object.entries(PARTS)) {
    const re = new RegExp(`<${tag} id="${part}">[\\s\\S]*?</${tag}>`);
    if (!re.test(html)) throw new Error(`Thiếu <${tag} id="${part}"> trong trang`);
    const body = read(src);
    if (body.includes(`</${tag}`)) throw new Error(`${src} chứa </${tag}>`);
    html = html.replace(re, () => `<${tag} id="${part}">\n${body}</${tag}>`);
  }
  const conf = html.match(/<script type="application\/json" id="lesson">([\s\S]*?)<\/script>/);
  let jsonId = '';
  if (conf) { try { jsonId = JSON.parse(conf[1]).id || ''; } catch (e) { throw new Error('<script id="lesson"> không phải JSON hợp lệ'); } }
  const lid = id || (jsonId && !/^__.*__$/.test(jsonId) ? jsonId : '');
  if (!lid) throw new Error('Thiếu lesson-id: ghi "id" trong <script id="lesson"> hoặc truyền làm tham số');
  // Ghi cùng một id vào cấu hình của bài, để lesson.js (sessions/<id>) và phần tự lưu (drafts/<id>) không lệch nhau.
  if (conf) {
    const obj = Object.assign(JSON.parse(conf[1]), { id: lid });
    html = html.replace(conf[0], () => `<script type="application/json" id="lesson">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`);
  }
  html = html.replace(/<meta name="lesson-id"[^>]*>\n?/, '');
  html = html.replace(/<meta name="viewport"[^>]*>/, (m) => `${m}\n<meta name="lesson-id" content="${lid.replace(/"/g, '')}">`);
  return html;
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const [file, id] = process.argv.slice(2);
  if (!file) { console.error('Cách dùng: node artifacts/lesson/make-lesson.mjs <trang.html> [lesson-id]'); process.exit(1); }
  const html = readFileSync(file, 'utf8');
  let lid = id;
  if (!lid) { const m = html.match(/<script type="application\/json" id="lesson">([\s\S]*?)<\/script>/); try { lid = m && JSON.parse(m[1]).id; } catch (e) { lid = ''; } if (!lid || /^__/.test(lid)) lid = guessId(file); }
  writeFileSync(file, fill(html, lid));
  console.log(`Đã gắn bộ khung vào ${file} (id ${lid}). Đăng trang với capabilities {"db": {}, "comments": {}}.`);
}
