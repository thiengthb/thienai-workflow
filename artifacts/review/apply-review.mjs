#!/usr/bin/env node
// Ghi kết quả một buổi ôn thẻ vào learning/cards.md: nhớ thì lên một hộp, quên thì về hộp 1, rồi tính lại ngày hỏi lại.
//
//   node artifacts/review/apply-review.mjs learning/cards.md <kết-quả.json> [--today YYYY-MM-DD]
//
// <kết-quả.json>: bản trang ôn lưu trong db (reviews/<ngày>, có "items": { F1: { verdict: "nho" } }),
// hoặc gọn { "F1": "nho", "B2": "quen" }. Ngày tính từ ngày ôn ("today" trong bản lưu) nếu có.
import { readFileSync, writeFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { applyReview } from './make-review.mjs';

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

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2), i = args.indexOf('--today'), forced = i < 0 ? null : args.splice(i, 2)[1];
  const [cardsFile, resultFile] = args;
  if (!cardsFile || !resultFile) { console.error('Cách dùng: node apply-review.mjs learning/cards.md <kết-quả.json> [--today YYYY-MM-DD]'); process.exit(1); }
  const saved = JSON.parse(readFileSync(resultFile, 'utf8'));
  const today = forced || saved.today || new Date().toISOString().slice(0, 10);
  const { text, changed } = applyReview(readFileSync(cardsFile, 'utf8'), verdicts(saved), today);
  writeFileSync(cardsFile, text);
  console.log(changed.length ? changed.join('\n') : 'Không có thẻ nào được chấm.');
}
