#!/usr/bin/env node
// Giữ repo nhẹ khi học nhiều (docs/plans/2026-11-15-lean-learning.md, đợt 1). CI chạy ở mọi PR.
//
//   node .github/scripts/check-lesson-sources.mjs                         kiểm mọi trang bài trong learning/*/pages/
//   node .github/scripts/check-lesson-sources.mjs --pr <base-ref> --title "<tiêu đề PR>"   thêm luật tách bài với kit
//
// Báo LỖI khi:
//   1. Trang bài trong repo còn mang kit đã điền hay dữ liệu trận chép lần hai. Trang trong repo là nguồn;
//      bản đầy đủ do make-lesson.mjs dựng ra thư mục tạm. Sửa: chạy make-lesson.mjs trên trang đó, script tự làm gọn.
//   2. (--pr) Một PR vừa đổi bài học (learning/<môn>/pages, battles, lessons) vừa đổi kit (artifacts/), mà tiêu đề
//      không có chữ "kit". Bài cần khả năng mới của sa bàn hay sân khấu thì mở PR kit riêng, có test, rồi bài mới dùng.
// Cảnh báo khi phần riêng của một trang (nguồn) quá 60 KB: có thể đó là thứ nên vào kit dùng chung.
// Trang khung cũ (trước 2026-11-14, không có thẻ kit-js) đã đóng băng: không kiểm.
import { readdirSync, readFileSync, existsSync, realpathSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { filledIn } from '../../artifacts/lesson/make-lesson.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const OWN_WARN_KB = 60;

/** Mọi trang bài trong learning/*\/pages/ của root. */
export function lessonPages(base = root) {
  const l = join(base, 'learning');
  if (!existsSync(l)) return [];
  return readdirSync(l, { withFileTypes: true }).filter((d) => d.isDirectory() && existsSync(join(l, d.name, 'pages')))
    .flatMap((d) => readdirSync(join(l, d.name, 'pages')).filter((f) => f.endsWith('.html')).sort().map((f) => join(l, d.name, 'pages', f)));
}

/** Luật 1 và cảnh báo kích thước. Trả về { fails, warns } là các dòng chữ. */
export function checkSources(files, base = root) {
  const fails = [], warns = [];
  for (const f of files) {
    const html = readFileSync(f, 'utf8'), rel = relative(base, f).replace(/\\/g, '/');
    const parts = filledIn(html);
    if (parts.length) fails.push(`${rel}: còn mang ${parts.join(', ')} đã điền. Chạy node artifacts/lesson/make-lesson.mjs ${rel} để làm gọn nguồn.`);
    else if (/<script id="kit-js">/.test(html) && Buffer.byteLength(html) > OWN_WARN_KB * 1024) warns.push(`${rel}: phần riêng ${Math.round(Buffer.byteLength(html) / 1024)} KB, quá ${OWN_WARN_KB} KB. Xem phần nào nên chuyển vào kit.`);
  }
  return { fails, warns };
}

const LESSON = /^learning\/[^/]+\/(pages|battles|lessons)\//;
/** Luật 2: danh sách file đổi trong PR và tiêu đề PR. Trả về dòng lỗi, hoặc '' khi đạt. */
export function checkSplit(changed, title = '') {
  const lesson = changed.filter((f) => LESSON.test(f)), kit = changed.filter((f) => f.startsWith('artifacts/'));
  if (!lesson.length || !kit.length || /\bkit\b/i.test(title)) return '';
  return `PR vừa đổi bài (${lesson.slice(0, 3).join(', ')}${lesson.length > 3 ? '…' : ''}) vừa đổi kit (${kit.slice(0, 3).join(', ')}${kit.length > 3 ? '…' : ''}). `
    + 'Tách phần kit sang một PR riêng có test, hoặc nếu PR này chủ yếu là sửa kit thì thêm chữ "kit" vào tiêu đề.';
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  const opt = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : undefined; };
  const pages = lessonPages();
  const { fails, warns } = checkSources(pages);
  const base = opt('pr');
  if (base) {
    const changed = execFileSync('git', ['-C', root, 'diff', '--name-only', `${base}...HEAD`], { encoding: 'utf8' }).split('\n').filter(Boolean);
    const split = checkSplit(changed, opt('title') || '');
    if (split) fails.push(split);
  }
  for (const w of warns) console.log('cảnh báo: ' + w);
  for (const f of fails) console.error('LỖI: ' + f);
  console.log(fails.length ? `check-lesson-sources: ${fails.length} lỗi` : `check-lesson-sources: ổn (${pages.length} trang${base ? ', luật tách bài với kit' : ''})`);
  process.exit(fails.length ? 1 : 0);
}
