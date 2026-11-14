#!/usr/bin/env node
// Ghi kết quả một buổi ôn thẻ vào learning/cards.md: nhớ thì lên một hộp, quên thì về hộp 1, rồi tính lại ngày hỏi lại.
//
//   node artifacts/review/apply-review.mjs learning/cards.md <kết-quả.json> [--today YYYY-MM-DD]
//
// <kết-quả.json>: bản trang ôn lưu trong db (reviews/<ngày>, có "items": { F1: { verdict: "nho" } }),
// hoặc gọn { "F1": "nho", "B2": "quen" }. Ngày tính từ ngày ôn ("today" trong bản lưu) nếu có.
// Có usage.md cạnh file thẻ (learning/usage.md) thì thêm một dòng: Claude chấm mấy thẻ, nói thay gõ mấy lần.
import { readFileSync, writeFileSync, realpathSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyReview } from './make-review.mjs';
import { addUsage } from '../kit/usage.mjs';
// Windows checkouts (git core.autocrlf) and files saved by Windows editors use CRLF; every parser below expects LF.
const lf = (s) => s.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

/** Kết quả gọn { id: 'nho'|'quen' } từ bản lưu của trang hoặc từ dạng gọn. */
export function verdicts(saved) {
  const items = saved && saved.items && typeof saved.items === 'object' && !Array.isArray(saved.items) ? saved.items : saved;
  const out = {};
  for (const [id, v] of Object.entries(items || {})) {
    const r = typeof v === 'string' ? v : v && v.verdict;
    if (r === 'nho' || r === 'quen') out[id] = r;
  }
  return out;
}

/** Dòng cho learning/usage.md từ bản lưu của trang ôn (dạng gọn thì không biết, trả về null). */
export function reviewUsage(saved, today) {
  if (!saved || !saved.items || typeof saved.items !== 'object') return null;
  const v = Object.values(saved.items), r = verdicts(saved), vals = Object.values(r);
  return {
    'Ngày': today, 'Trang': 'review', 'Phút': '-', 'Hỏi Claude': '-', 'Claude giải thích câu sai': '-',
    'Claude nhận xét, chấm': v.filter((x) => x && x.ai).length, 'Nói thay gõ': saved.spoke || 0, 'Xem Claude làm': '-', 'Nghe': '-', 'Tình huống thêm': '-',
    'Ghi chú': `${vals.length} thẻ, nhớ ${vals.filter((x) => x === 'nho').length}, quên ${vals.filter((x) => x === 'quen').length}${saved.again ? ', có ôn lại thẻ quên' : ''}`,
  };
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2), i = args.indexOf('--today'), forced = i < 0 ? null : args.splice(i, 2)[1];
  const [cardsFile, resultFile] = args;
  if (!cardsFile || !resultFile) { console.error('Cách dùng: node apply-review.mjs learning/cards.md <kết-quả.json> [--today YYYY-MM-DD]'); process.exit(1); }
  const saved = JSON.parse(lf(readFileSync(resultFile, 'utf8')));
  const today = forced || saved.today || new Date().toISOString().slice(0, 10);
  const { text, changed } = applyReview(lf(readFileSync(cardsFile, 'utf8')), verdicts(saved), today);
  writeFileSync(cardsFile, text);
  console.log(changed.length ? changed.join('\n') : 'Không có thẻ nào được chấm.');
  const usageFile = join(dirname(cardsFile), 'usage.md'), row = reviewUsage(saved, today);
  if (row && existsSync(usageFile)) { writeFileSync(usageFile, addUsage(lf(readFileSync(usageFile, 'utf8')), row)); console.log(`Đã ghi một dòng vào ${usageFile}.`); }
}
