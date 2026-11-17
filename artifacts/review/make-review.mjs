#!/usr/bin/env node
// Dựng trang ôn thẻ từ learning/cards.md (xem README.md trong thư mục này).
//
//   node artifacts/review/make-review.mjs [learning/cards.md] [--out <thư-mục>] [--max 10] [--today YYYY-MM-DD] [--url <link trang cũ>]
//
// Lấy các thẻ đến hạn (cột "Hỏi lại" là hôm nay hoặc đã qua), quá hạn lâu nhất trước, tối đa --max thẻ.
// Mỗi thẻ kèm đáp án tìm trong mục "Tự kiểm" của file bài (cột "Đáp án ở") và một đoạn ý chính của bài,
// để trang cho xem đáp án và để Claude chấm câu trả lời chỉ dựa trên bài. Ra <out>/index.html, preview.html, publish.json.
// --url: đăng đè lên trang ôn thẻ đã có (giữ một link cố định); link ghi trong README.md.
import { readFileSync, writeFileSync, mkdirSync, existsSync, realpathSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writePublish } from '../kit/publish.mjs';
// Windows checkouts (git core.autocrlf) and files saved by Windows editors use CRLF; every parser below expects LF.
const lf = (s) => s.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

const here = dirname(fileURLToPath(import.meta.url));
export const CAPABILITIES = { db: {}, comments: {}, sample: {}, dictation: {} };
export const INTERVALS = [1, 3, 7, 14, 30];   // hộp 1..5: số ngày tới lần hỏi lại (learning/cards.md)

const day = (d) => Math.floor(Date.parse(d + 'T00:00:00Z') / 864e5);
const iso = (n) => new Date(n * 864e5).toISOString().slice(0, 10);

/** Bảng thẻ trong cards.md: [{ id, subject, question, link, box, due, line }]. */
export function parseCards(text) {
  const lines = text.split('\n');
  const start = lines.findIndex((l) => /^\|\s*Thẻ\s*\|/.test(l));
  if (start < 0) return [];
  const head = lines[start].split('|').slice(1, -1).map((c) => c.trim());
  const at = (n) => head.indexOf(n);
  const out = [];
  for (let i = start + 2; i < lines.length && /^\|/.test(lines[i]); i++) {
    const c = lines[i].split('|').slice(1, -1).map((x) => x.trim());
    const m = /\[([^\]]*)\]\(([^)]+)\)/.exec(c[at('Đáp án ở')] || '');
    out.push({ id: c[at('Thẻ')], subject: c[at('Môn')], question: c[at('Câu hỏi')], linkText: m ? m[1] : '', link: m ? m[2] : '',
      box: +c[at('Hộp')] || 1, due: c[at('Hỏi lại')], line: i });
  }
  return out;
}

/** Thẻ đến hạn vào `today`, quá hạn lâu nhất trước (cùng ngày thì giữ thứ tự trong file). */
export function dueCards(cards, today, max = 10) {
  return cards.filter((c) => /^\d{4}-\d{2}-\d{2}$/.test(c.due) && day(c.due) <= day(today))
    .map((c, i) => ({ c, i })).sort((a, b) => day(a.c.due) - day(b.c.due) || a.i - b.i).slice(0, max).map((x) => x.c);
}

const plain = (s) => s.replace(/<[^>]+>/g, ' ').replace(/\*\*|__|`/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ').trim();
const words = (s) => new Set(plain(s).toLowerCase().normalize('NFC').split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 1));

/** Câu tự kiểm trong file bài: [{ q, a }] lấy từ "1. câu hỏi" + <details><summary>…</summary>đáp án</details>. */
export function selfCheck(md) {
  const sec = /^## Tự kiểm\s*$([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(md);
  if (!sec) return [];
  const out = [];
  const re = /^\d+\.\s+([\s\S]*?)<details>\s*<summary>[^<]*<\/summary>([\s\S]*?)<\/details>/gm;
  for (let m; (m = re.exec(sec[1]));) out.push({ q: plain(m[1]), a: plain(m[2]) });
  return out;
}

/** Câu tự kiểm gần nhất với câu hỏi của thẻ (trùng chữ nhiều nhất), hoặc null nếu quá ít chữ trùng. */
export function matchAnswer(question, checks) {
  const qw = words(question);
  let best = null, score = 0;
  for (const c of checks) {
    const cw = words(c.q), common = [...qw].filter((w) => cw.has(w)).length;
    const s = common / Math.max(1, Math.min(qw.size, cw.size));
    if (s > score) { score = s; best = c; }
  }
  return score >= 0.34 ? best : null;
}

/** Đoạn bài để Claude chấm: các mục trước "Tự kiểm", bỏ mục "Nguồn" và "Bạn đã nói", tối đa n ký tự. */
export function lessonExcerpt(md, n = 1600) {
  // Bỏ tiêu đề và dòng ngày học, link trang ở đầu file. Không cắt tới mục "## " đầu tiên: bài không có mục nào
  // trước "Tự kiểm" (BA 3, 4, 5) thì cắt vậy ra đoạn rỗng (CI đỏ ở PR #111, thẻ B8).
  const body = md.replace(/^# .*$/m, '').replace(/^Học ngày.*$/m, '').split(/^## Tự kiểm/m)[0];
  return plain(body.replace(/^##\s+/gm, '')).slice(0, n);
}

/** Môn đang học, từ bảng "Môn đang học" của learning/README.md: { dir: { name, file, prefix } }. */
export function subjects(readme, cards = '') {
  const out = {};
  for (const m of readme.matchAll(/^\| ([^|]+?) \| [^|]+ \| \[([a-z0-9-]+)\.md\]\(\2\.md\) \|/gm)) {
    const name = m[1].trim(), dir = m[2];
    const ids = [...cards.matchAll(new RegExp(`^\\| ([A-Z]+)\\d+ \\| ${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\|`, 'gm'))].map((x) => x[1]);
    out[dir] = { name, file: dir + '.md', prefix: ids[0] || dir[0].toUpperCase() };
  }
  return out;
}

/** Số thẻ ôn đầu mỗi buổi học (learning/README.md, "Khung một buổi"). */
export const REVIEW_CARDS = 3;

/**
 * REVIEW_CARDS thẻ đến hạn, mỗi thẻ kèm đáp án trong mục "Tự kiểm" của bài (null nếu không thấy).
 * Thiếu thẻ đến hạn thì thêm thẻ hạn sớm nhất của môn khác `subject` (learning/README.md, "Khung một buổi"), đánh dấu filler: true.
 */
export function reviewCards(cardsText, base, today, max = REVIEW_CARDS, subject = '') {
  const all = parseCards(cardsText), due = dueCards(all, today, max);
  const ids = new Set(due.map((c) => c.id));
  const fill = all.filter((c) => !ids.has(c.id) && c.subject !== subject && /^\d{4}-\d{2}-\d{2}$/.test(c.due))
    .map((c, i) => ({ c, i })).sort((a, b) => a.c.due.localeCompare(b.c.due) || a.i - b.i).slice(0, Math.max(0, max - due.length)).map((x) => ({ ...x.c, filler: true }));
  return [...due, ...fill].map((c) => {
    const file = c.link ? resolve(base, c.link) : '';
    const md = file && existsSync(file) ? lf(readFileSync(file, 'utf8')) : '';
    const hit = md ? matchAnswer(c.question, selfCheck(md)) : null;
    return { ...c, answer: hit ? hit.a : null };
  });
}

/** Dữ liệu trang ôn: mỗi thẻ đến hạn kèm đáp án và đoạn bài. `base` là thư mục chứa cards.md. */
export function buildReview(cardsText, base, today, max = 10) {
  const items = dueCards(parseCards(cardsText), today, max).map((c) => {
    const file = c.link ? resolve(base, c.link) : '';
    const md = file && existsSync(file) ? lf(readFileSync(file, 'utf8')) : '';
    const hit = md ? matchAnswer(c.question, selfCheck(md)) : null;
    return { id: c.id, subject: c.subject, question: c.question, box: c.box, due: c.due, source: c.linkText || c.link,
      answer: hit ? hit.a : '', ref: md ? lessonExcerpt(md) : '' };
  });
  return { id: 'review-' + today, today, items };
}

/** Sau buổi ôn: sửa cột Hộp và Hỏi lại trong cards.md. results: { <id>: 'nho' | 'quen' }. Trả về chữ mới và các dòng đã đổi. */
export function applyReview(cardsText, results, today) {
  const lines = cardsText.split('\n');
  const cards = parseCards(cardsText);
  const at = lines.findIndex((l) => /^\|\s*Thẻ\s*\|/.test(l));
  if (at < 0) return { text: cardsText, changed: [] };   // không có bảng thẻ: không có gì để sửa
  const head = lines[at].split('|').slice(1, -1).map((c) => c.trim());
  const boxAt = head.indexOf('Hộp'), dueAt = head.indexOf('Hỏi lại');
  const changed = [];
  for (const [id, r] of Object.entries(results)) {
    const c = cards.find((x) => x.id === id);
    if (!c || !['nho', 'quen'].includes(r)) continue;
    const box = r === 'nho' ? Math.min(5, c.box + 1) : 1;
    const due = iso(day(today) + INTERVALS[box - 1]);
    const cells = lines[c.line].split('|');
    cells[boxAt + 1] = ` ${box} `; cells[dueAt + 1] = ` ${due} `;
    lines[c.line] = cells.join('|');
    changed.push(`${id}: ${r === 'nho' ? 'nhớ' : 'quên'}, hộp ${c.box} → ${box}, hỏi lại ${due}`);
  }
  return { text: lines.join('\n'), changed };
}

export function render(review) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return lf(readFileSync(join(here, 'template.html'), 'utf8'))
    .replace('__TITLE__', () => esc(`Ôn thẻ ${review.today}`))
    .replace('/*KIT_CSS*/', () => lf(readFileSync(join(here, '../kit/kit.css'), 'utf8')))
    .replace('/*KIT_JS*/', () => lf(readFileSync(join(here, '../kit/kit.js'), 'utf8')))
    .replace('/*REVIEW_JS*/', () => lf(readFileSync(join(here, 'review.js'), 'utf8')))
    .replace('__REVIEW__', () => JSON.stringify(review).replace(/</g, '\\u003c'));
}

export function build(cardsFile, out, { today = new Date().toISOString().slice(0, 10), max = 10 } = {}) {
  const review = buildReview(lf(readFileSync(cardsFile, 'utf8')), dirname(resolve(cardsFile)), today, max);
  mkdirSync(out, { recursive: true });
  const html = render(review);
  writeFileSync(join(out, 'index.html'), html);
  writeFileSync(join(out, 'preview.html'), `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>\n${html}\n</body></html>\n`);
  return review;
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2), opt = (n) => { const i = args.indexOf('--' + n); return i < 0 ? undefined : args.splice(i, 2)[1]; };
  const today = opt('today') || new Date().toISOString().slice(0, 10);
  const max = +(opt('max') || 10), url = opt('url');
  const out = resolve(opt('out') || join(here, '../../build/review-' + today));
  const cardsFile = args[0] || 'learning/cards.md';
  const review = build(cardsFile, out, { today, max });
  const noAnswer = review.items.filter((x) => !x.answer).map((x) => x.id);
  console.log(`Đã dựng ${review.items.length} thẻ đến hạn vào ${out}/index.html${noAnswer.length ? ` (chưa tìm được đáp án riêng cho ${noAnswer.join(', ')}: trang cho xem đoạn bài thay thế)` : ''}`);
  for (const l of writePublish(out, { url, capabilities: CAPABILITIES, icon: 'cards', description: `Ôn ${review.items.length} thẻ đến hạn ngày ${review.today}` })) console.log(l);
}
