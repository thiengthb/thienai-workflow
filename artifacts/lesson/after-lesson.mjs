#!/usr/bin/env node
// Việc sau buổi học (đề xuất P1, T4, P3). Đọc kết quả buổi mà trang lưu trong db (sessions/<id>-<thời điểm>),
// soạn nháp mọi thứ cần ghi, và kiểm xem đã ghi đủ chưa.
//
//   node artifacts/lesson/after-lesson.mjs <session.json> [--page <trang.html>] [--today YYYY-MM-DD] [--write]
//       In nháp: số liệu, dòng nhật ký, chỗ còn vướng, thẻ mới, dòng "Trạng thái".
//       --write: ghi luôn phần máy làm được: thêm dòng vào mục "Chỗ còn vướng" của learning/<môn>.md (câu ôn sai
//       của môn khác thì vào file của môn đó), thêm dòng nhật ký nháp (AI sửa phần <…>), chuyển nhật ký cũ sang
//       learning/<môn>/log.md để file môn chỉ giữ 3 dòng, một dòng vào learning/usage.md, và kết quả 3 thẻ ôn đầu buổi
//       vào cột Hộp, Hỏi lại của learning/cards.md (đúng lên một hộp, sai về hộp 1; chỉ thẻ đã đến hạn vào ngày học, nên chạy lại không lên hai lần).
//       Phần còn lại (thẻ, Trạng thái, roadmap) AI viết từ nháp.
//       Nháp còn in góp ý của thien trong buổi và nơi ghi (bảng "Góp ý của thien" trong profile/MAP.md): câu gu của buổi
//       frontend vào hàng chờ learning/frontend/taste-queue.md, từ mới vào learning/glossary.md.
//   node artifacts/lesson/after-lesson.mjs --check <lesson-id>
//       Kiểm đã ghi đủ chưa: dòng nhật ký, file bài, thẻ mới, Trạng thái, roadmap, dòng usage, file môn gọn, dòng "Từ mới:"
//       trong file bài và các từ đó đã có trong learning/glossary.md. Thiếu thì thoát mã 1.
//   node artifacts/lesson/after-lesson.mjs --check-all
//       CI: mọi bài trong learning/<môn>/lessons/ đều có dòng nhật ký, có thẻ, có trong roadmap; file môn nào cũng gọn
//       (tối đa 3 dòng nhật ký, 6 dòng chỗ còn vướng, không còn chỗ <…> chưa viết).
//   node artifacts/lesson/after-lesson.mjs --trim-log
//       Chuyển nhật ký cũ của mọi môn sang learning/<môn>/log.md, giữ 3 dòng gần nhất.
//
// <session.json>: bản ArtifactData đọc được ở sessions/<id>-<thời điểm> (R của lesson.js), lưu ra file.
import { readFileSync, writeFileSync, readdirSync, existsSync, realpathSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { addUsage, usageRows } from '../kit/usage.mjs';
import { guessId, stuckPoints, STUCK } from './make-lesson.mjs';
import { subjects, parseCards, applyReview } from '../review/make-review.mjs';
import { validQuiz, QUIZ_FILE } from './make-lesson.mjs';
export { subjects };   // ở make-review.mjs để make-lesson.mjs dùng mà không vòng import
// Windows checkouts (git core.autocrlf) and files saved by Windows editors use CRLF; every parser below expects LF.
const lf = (s) => s.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

export { stuckPoints, STUCK };

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
// Đường dẫn in cho người đọc luôn dùng /, cả trên Windows (relative() ở đó trả về \).
const rel = (root, p) => relative(root, p).replace(/\\/g, '/');
const strip = (s) => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
const clip = (s, n = 200) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
const addDays = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);

// Hồ sơ nóng (docs/plans/2026-11-15-lean-learning.md): file môn là thứ AI đọc mỗi buổi, nên giữ kích thước cố định.
// Nhật ký cũ chuyển sang learning/<môn>/log.md, chỉ đọc khi cần xem lại một buổi cũ.
export const LOG = 'Nhật ký', KEEP_LOG = 3, MAX_STUCK = 6;
/** Chỗ AI chưa viết trong dòng nhật ký nháp. */
export const PLACEHOLDER = /<ý chính>|<tự nói lại[^>]*>/;

// Đường chảy cho góp ý (docs/plans/2026-11-17-action-gaps.md, đợt 2): từ mới của buổi phải vào bảng thuật ngữ,
// câu gu của buổi frontend vào hàng chờ, 2 tuần một lần gom thành một PR vào thienui docs/taste.md (thien duyệt từng dòng).
export const GLOSSARY = 'learning/glossary.md', TASTE_QUEUE = 'learning/frontend/taste-queue.md';
const NONE = /^(không có|không|chưa có|-)\.?$/i;

/** Dòng "Từ mới: a, b" trong file bài: null khi chưa có dòng, [] khi ghi "không có", còn lại là danh sách từ. */
export function newWords(md) {
  const m = lf(md || '').match(/^\s*(?:[-*]\s*)?(?:\*\*)?Từ mới:?(?:\*\*)?:?\s*(.*)$/m);
  if (!m) return null;
  // Bỏ dấu Markdown bao ngoài (`…`, **…**) mà giữ ký tự trong từ (`_blank` vẫn là _blank).
  const v = m[1].replace(/`/g, '').replace(/\*\*/g, '').trim();
  if (!v || NONE.test(v)) return [];
  // Tách ở dấu phẩy, chấm phẩy nằm ngoài ngoặc: "PR (pull request, yêu cầu gộp)" là một từ.
  const parts = [];
  let depth = 0, cur = '';
  for (const ch of v) {
    if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    if ((ch === ',' || ch === ';') && !depth) { parts.push(cur); cur = ''; } else cur += ch;
  }
  parts.push(cur);
  return parts.map((w) => w.trim().replace(/\.$/, '').replace(/\s*\(.*\)\s*$/, '').trim()).filter(Boolean);
}

/** Các từ trong cột đầu của bảng thuật ngữ, viết thường; "PR (pull request)" cho cả "pr" lẫn "pull request". */
export function glossaryTerms(md) {
  const out = new Set();
  for (const m of lf(md || '').matchAll(/^\| ([^|]+?) \|/gm)) {
    const cell = m[1].trim();
    if (/^(Từ|-+)$/.test(cell)) continue;
    const low = cell.toLowerCase();
    out.add(low.replace(/\s*\(.*\)\s*$/, ''));
    const inner = low.match(/\(([^)]+)\)/);
    if (inner) out.add(inner[1].trim());
  }
  return out;
}
// Một dòng nhật ký bắt đầu bằng số buổi: "| 4 |", cả "| 4, phần 2 |" (buổi học tiếp trong ngày khác).
const ROW = /^\| \d+(?:[^|\d][^|]*)? \|/;
const rowN = (l) => +((l.match(/^\| (\d+)/) || [])[1] ?? NaN);
const rowKey = (l) => (l.match(/^\|([^|]*)\|/) || [])[1]?.trim();

/** Vị trí mục "## Nhật ký" trong các dòng của file: { start, end } (end là dòng "## " kế tiếp hay cuối file), hoặc null. */
function logSection(lines) {
  const start = lines.findIndex((l) => new RegExp(`^## ${LOG}\\s*$`).test(l));
  if (start < 0) return null;
  let end = lines.findIndex((l, i) => i > start && /^## /.test(l));
  return { start, end: end < 0 ? lines.length : end };
}

/** Dòng nhật ký trong mục "## Nhật ký": [{ n, line }]. */
export function logRows(md) {
  const lines = md.split('\n'), sec = logSection(lines);
  return sec ? lines.slice(sec.start + 1, sec.end).filter((l) => ROW.test(l)).map((line) => ({ n: rowN(line), key: rowKey(line), line })) : [];
}

/** Thêm một dòng nhật ký vào cuối bảng (tạo mục trước "## Chỗ còn vướng" hay "## Buổi tiếp theo" nếu chưa có). Đã có buổi đó thì bỏ. */
export function addLogRow(md, row) {
  if (logRows(md).some((r) => r.key === rowKey(row))) return md;
  const lines = md.split('\n');
  let sec = logSection(lines);
  if (!sec) {
    let at = lines.findIndex((l) => new RegExp(`^## (${STUCK}|Buổi tiếp theo)`).test(l));
    if (at < 0) { while (lines.length && lines[lines.length - 1] === '') lines.pop(); lines.push(''); at = lines.length; }
    lines.splice(at, 0, `## ${LOG}`, '| Buổi | Ngày | Ý chính | Kết quả |', '|---|---|---|---|', '');
    sec = logSection(lines);
  }
  let last = -1;
  for (let i = sec.start + 1; i < sec.end; i++) if (/^\|/.test(lines[i])) last = i;
  if (last < 0) { lines.splice(sec.start + 1, 0, '| Buổi | Ngày | Ý chính | Kết quả |', '|---|---|---|---|'); last = sec.start + 2; }
  lines.splice(last + 1, 0, row);
  return lines.join('\n');
}

/** Link tương đối từ learning/ (file môn) đổi thành tương đối từ learning/<môn>/ (file log). */
const rebase = (line) => line.replace(/\]\((?![a-z][a-z0-9+.-]*:|#|\/)([^)\s]+)\)/gi, '](../$1)');

/**
 * Giữ `keep` dòng nhật ký mới nhất (số buổi lớn nhất) trong file môn, chuyển các dòng cũ hơn sang log.
 * dir: thư mục môn (frontend), name: tên môn (Frontend). Trả về { md, log, moved }.
 */
export function trimLog(md, log, { dir, name, keep = KEEP_LOG } = {}) {
  const rows = logRows(md);
  if (rows.length <= keep) return { md, log, moved: 0 };
  // Mới nhất là số buổi lớn nhất; cùng số buổi ("5", "5, phần 2") thì dòng nằm sau trong bảng là mới hơn.
  const newest = new Set(rows.map((r, i) => ({ r, i })).sort((a, b) => b.r.n - a.r.n || b.i - a.i).slice(0, keep).map((x) => x.r.line));
  const old = rows.filter((r) => !newest.has(r.line));
  const lines = md.split('\n'), sec = logSection(lines);
  const drop = new Set(old.map((r) => r.line));
  const head = lines.slice(sec.start + 1, sec.end).filter((l) => /^\|/.test(l) && !ROW.test(l)).slice(0, 2);
  let body = lines.slice(sec.start + 1, sec.end).filter((l) => !drop.has(l));
  const pointer = `Nhật ký cũ hơn ở [${dir}/log.md](${dir}/log.md).`;
  if (!body.some((l) => l.includes(`(${dir}/log.md)`))) body = [pointer, '', ...body.filter((l, i) => !(i === 0 && l === ''))];
  const out = [...lines.slice(0, sec.start + 1), ...body, ...lines.slice(sec.end)].join('\n');

  let L = lf(log || '');
  if (!logRows(L).length && !logSection(L.split('\n'))) {
    L = `# Nhật ký cũ: ${name || dir}\n\nCác buổi cũ, chuyển từ mục "${LOG}" của [${dir}.md](../${dir}.md) khi ở đó quá ${keep} dòng (\`artifacts/lesson/after-lesson.mjs\`). AI không đọc file này mỗi buổi; mở khi cần xem lại một buổi cũ.\n\n## ${LOG}\n${(head.length === 2 ? head : ['| Buổi | Ngày | Ý chính | Kết quả |', '|---|---|---|---|']).join('\n')}\n`;
  }
  for (const r of old) L = addLogRow(L, rebase(r.line));
  return { md: out, log: L.replace(/\n*$/, '\n'), moved: old.length };
}

/** Kiểm file môn gọn: tối đa KEEP_LOG dòng nhật ký, MAX_STUCK dòng chỗ còn vướng, không còn chỗ <…> chưa viết. */
export function subjectChecks(md, file) {
  const rows = logRows(md), stuck = stuckPoints(md, Infinity), todo = rows.filter((r) => PLACEHOLDER.test(r.line)).map((r) => r.n);
  return [
    { ok: rows.length <= KEEP_LOG, what: `tối đa ${KEEP_LOG} dòng nhật ký trong learning/${file} (đang có ${rows.length}; chạy after-lesson.mjs --trim-log)` },
    { ok: stuck.length <= MAX_STUCK, what: `tối đa ${MAX_STUCK} dòng "${STUCK}" trong learning/${file} (đang có ${stuck.length}; gộp hay xóa dòng thien đã làm đúng)` },
    { ok: !todo.length, what: `dòng nhật ký trong learning/${file} đã viết xong, không còn chỗ <…>${todo.length ? ` (buổi ${todo.join(', ')})` : ''}` },
  ];
}


/** Ngày học theo giờ Việt Nam từ R.start (ISO); không có thì null. */
export const lessonDay = (start) => (start && !isNaN(Date.parse(start)) ? new Date(start).toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }) : null);

/**
 * Kết quả bước ôn trên trang → { mã thẻ: 'nho' | 'quen' } cho applyReview. Chỉ khóa là mã thẻ có trong cards.md (bỏ "recall",
 * câu của bài) và thẻ đã đến hạn vào ngày học `day`: sau lần ghi đầu, hạn đã dời qua ngày học, nên chạy lại không lên hộp lần nữa.
 */
export function reviewResults(R, cardsText, day) {
  const cards = new Map(parseCards(cardsText).map((c) => [c.id, c]));
  const out = {};
  for (const [id, v] of Object.entries((R && R.review) || {})) {
    const c = cards.get(id);
    if (c && /^\d{4}-\d{2}-\d{2}$/.test(c.due) && c.due <= day) out[id] = v && v.ok ? 'nho' : 'quen';
  }
  return out;
}

/** "frontend-06" → { dir: "frontend", n: 6 }; "war-03-sandtable" → { dir: "war", n: 3 }. */
export function lessonOf(id) {
  const m = String(id || '').match(/^([a-z]+)-(\d+)/);
  return m ? { dir: m[1], n: +m[2] } : null;
}

/** Câu hỏi một lựa chọn trên trang: { khóa: { text, options, answer } }. Chữ câu hỏi là đoạn <p> ngay trước khối .q. */
export function pageQuestions(html) {
  const out = {};
  const re = /<div class="q" data-q="([^"]+)" data-a="(\d+)"[^>]*>([\s\S]*?)(?=<div class="q" |<\/section>)/g;
  let m;
  while ((m = re.exec(html))) {
    const before = html.slice(Math.max(0, m.index - 3000), m.index);
    const ps = [...before.matchAll(/<p(?: [^>]*)?>([\s\S]*?)<\/p>/g)].map((x) => strip(x[1])).filter(Boolean);
    const options = [...m[3].matchAll(/<button class="opt"[^>]*>([\s\S]*?)<\/button>/g)].map((x) => strip(x[1]));
    out[m[1]] = { text: (ps[ps.length - 1] || m[1]).replace(/^\d+\.\s+/, ''), options, answer: +m[2] };
  }
  return out;
}

/** Thêm dòng vào mục "Chỗ còn vướng" (tạo mục ngay trước "## Buổi tiếp theo" nếu chưa có). Dòng trùng thì bỏ. */
export function addStuck(md, lines) {
  const have = new Set(stuckPoints(md, Infinity));
  const add = lines.filter((l) => !have.has(l));
  if (!add.length) return md;
  const body = add.map((l) => '- ' + l).join('\n');
  const sec = new RegExp(`(^## ${STUCK}\\n[\\s\\S]*?)(\\n*)(?=^## |(?![\\s\\S]))`, 'm');
  if (sec.test(md)) return md.replace(sec, (all, s) => s.replace(/\n+$/, '') + '\n' + body + '\n\n');
  const intro = `## ${STUCK}\nAI ghi sau mỗi buổi (nháp từ \`artifacts/lesson/after-lesson.mjs\`), xóa dòng khi thien đã làm đúng ở buổi sau. Trang buổi tới đưa các dòng này cho Claude khi thien hỏi, và AI dùng chúng cho phần nhớ lại.\n\n${body}\n\n`;
  const next = md.search(/^## Buổi tiếp theo/m);
  return next < 0 ? md.replace(/\n*$/, '\n\n') + intro : md.slice(0, next) + intro + md.slice(next);
}

/**
 * Câu ôn đầu buổi theo mã thẻ: { mã: { text, options, answer } }, lấy từ learning/cards.md và cards-quiz.json như make-lesson.mjs.
 * Nguồn trang trong learning/<môn>/pages/ để trống bước ôn (data-auto="cards"), nên pageQuestions() không thấy các câu này.
 */
export function reviewQuestions(cardsText, quiz = {}) {
  const out = {};
  for (const c of parseCards(cardsText)) if (validQuiz(quiz?.[c.id])) out[c.id] = { text: c.question, options: quiz[c.id].opts, answer: quiz[c.id].a };
  return out;
}

/** Số liệu và nháp mọi thứ cần ghi sau một buổi. `quiz`: nội dung learning/cards-quiz.json, cho chữ của câu ôn đầu buổi. */
export function draft({ R, html = '', subject, lessonFile = '', cards = '', quiz = {}, today, all = {} }) {
  const lid = lessonOf(R.lesson) || { n: '?' };
  const date = today || String(R.end || R.start || '').slice(0, 10) || new Date().toISOString().slice(0, 10);
  const Q = { ...reviewQuestions(cards, quiz), ...pageQuestions(html) };
  const list = (o) => Object.entries(o || {});
  const right = (o) => list(o).filter(([, v]) => v.ok).length;
  const mins = R.start && R.end ? Math.round((Date.parse(R.end) - Date.parse(R.start)) / 6e4) : null;
  const ai = R.ai || [], asks = ai.filter((x) => x.kind === 'ask'), whys = ai.filter((x) => x.kind === 'why'), teachAi = ai.filter((x) => x.kind === 'teach');
  const demos = ai.filter((x) => x.kind === 'demo'), extra = R.extra || [];
  // Trang có sân khấu (bàn thử, bảng dán, sa bàn) thì mới có "Xem Claude làm"; bài chiến tranh không có tình huống thêm.
  const hasStage = !!(R.knobs || R.boards || R.choices), isWar = /^war-/.test(R.lesson || '');
  const fb = R.feedback || {};
  const fbText = Object.entries(fb).filter(([k]) => k !== 'note').map(([k, v]) => `${k} "${v}"`).join(', ');

  // Chỗ còn vướng: câu chọn sai (cả câu ôn), câu đã hỏi Claude.
  // Phần ôn trộn thẻ của mọi môn: câu ôn sai của thẻ môn khác (mã thẻ B2 khi đang học Frontend) là chỗ vướng của môn đó,
  // nên vào others[thư mục môn đó], không vào file của môn đang học (lỗi gặp ở buổi Frontend 6, thẻ B2 của BA).
  const stuck = [], others = {};
  const ownerOf = (k) => {
    const p = (String(k).match(/^([A-Z]+)\d+$/) || [])[1];
    if (!p || p === subject?.prefix) return null;
    return Object.entries(all).find(([, s]) => s.prefix === p)?.[0] || null;
  };
  const wrong = [...list(R.review).map(([k, v]) => [k, v, 'ôn']), ...list(R.quiz).map(([k, v]) => [k, v, 'bài'])].filter(([, v]) => !v.ok);
  for (const [k, v, part] of wrong) {
    const q = Q[k] || { text: k, options: [] };
    const pick = q.options[v.pick], ans = q.options[q.answer];
    const owner = part === 'ôn' ? ownerOf(k) : null;
    const where = owner ? `ôn ở buổi ${subject?.name || '?'} ${lid.n}` : `buổi ${lid.n}`;
    const line = clip(`${date}, ${where}: ${part === 'ôn' ? `câu ôn${owner ? ` ${k}` : ''}` : 'câu'} “${clip(q.text, 140)}” chọn “${clip(pick || '?', 80)}”${ans ? `, đúng là “${clip(ans, 80)}”` : ''}`, 360);
    if (owner) (others[owner] ||= []).push(line); else stuck.push(line);
  }
  for (const x of extra.filter((e) => !e.ok)) stuck.push(clip(`${date}, buổi ${lid.n}: tình huống thêm “${clip(x.question, 140)}” chọn “${clip(x.options?.[x.pick] || '?', 80)}”, đúng là “${clip(x.options?.[x.answer] || '?', 80)}”`, 360));
  for (const a of asks) stuck.push(clip(`${date}, buổi ${lid.n}: hỏi Claude ở bước “${a.step}”: “${clip(a.q, 160)}”`, 300));

  // Thẻ mới: mã kế tiếp của môn, gợi ý từ câu sai.
  const pre = subject?.prefix || '?';
  const nums = [...cards.matchAll(new RegExp(`^\\| ${pre}(\\d+) \\|`, 'gm'))].map((m) => +m[1]);
  let next = (nums.length ? Math.max(...nums) : 0) + 1;
  const link = lessonFile ? `[bài ${lid.n}](${lessonFile})` : `[bài ${lid.n}](<môn>/lessons/<NN>-<tên>.md)`;
  const cardRows = wrong.filter(([, , p]) => p === 'bài').map(([k]) => `| ${pre}${next++} | ${subject?.name || '?'} | ${clip((Q[k] || {}).text || k, 160)} | ${link} | 1 | ${addDays(date, 1)} |`);
  while (cardRows.length < 2) cardRows.push(`| ${pre}${next++} | ${subject?.name || '?'} | <câu hỏi từ ý chính của bài> | ${link} | 1 | ${addDays(date, 1)} |`);

  const teach = String(R.teach || '').trim();
  const facts = [
    mins != null ? `Thời gian trên trang: ${mins} phút${mins > 60 ? ' (trang mở lâu, có thể không sát; hỏi lại thien nếu cần)' : ''}` : 'Thời gian: trang chưa ghi lúc xong',
    list(R.review).length ? `Ôn: đúng ${right(R.review)}/${list(R.review).length}` : '',
    list(R.quiz).length ? `Câu hỏi trong bài: đúng ${right(R.quiz)}/${list(R.quiz).length}` : '',
    fbText ? `Góp ý: ${fbText}` : '',
    (fb.note || '').trim() ? `Ghi thêm: ${fb.note.trim()}` : '',
    teach ? `Tự nói lại${R.sawMineBeforeWriting ? ' (xem bản mẫu trước khi viết)' : ''}: "${teach}"` : 'Chưa tự nói lại',
    `Nhờ Claude: hỏi ${asks.length}, giải thích câu sai ${whys.length}, nhận xét bài tự nói lại ${teachAi.length}, xem làm mẫu ${demos.length}; nói thay gõ ${R.spoke || 0} lần, nghe đọc to ${R.listened || 0} lần`,
    extra.length ? `Tình huống thêm: đúng ${extra.filter((x) => x.ok).length}/${extra.length}` : '',
  ].filter(Boolean);
  const logRow = `| ${lid.n} | ${date} | <ý chính> (${lessonFile ? `[bài](${lessonFile})` : 'bài'}) | ${[mins != null ? `${mins} phút` : '', fbText, list(R.quiz).length ? `đúng ${right(R.quiz)}/${list(R.quiz).length}` : ''].filter(Boolean).join(', ')}. <tự nói lại có gì, thiếu gì; chỗ vướng; góp ý> |`;
  const usage = {
    // Giờ bắt đầu (giờ Việt Nam) nằm trong cột Trang: học lại cùng bài trong một ngày là một dòng riêng, không ghi đè.
    'Ngày': date, 'Trang': R.start ? `${R.lesson} lúc ${new Date(R.start).toLocaleTimeString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' })}` : R.lesson, 'Phút': mins ?? '-', 'Hỏi Claude': asks.length, 'Claude giải thích câu sai': whys.length,
    'Claude nhận xét, chấm': teachAi.length, 'Nói thay gõ': R.spoke || 0,
    'Xem Claude làm': hasStage ? demos.length : '-', 'Nghe': R.listened || 0, 'Tình huống thêm': isWar ? '-' : extra.length, 'Ghi chú': R.sawMineBeforeWriting ? 'xem bản mẫu trước khi viết' : '-',
  };
  // Góp ý của thien trong buổi: câu gu (buổi frontend) vào hàng chờ thienui, ghi thêm thì theo bảng trong profile/MAP.md.
  const said = (v) => (Array.isArray(v) ? v : [v]).map((x) => String(x || '').trim()).filter(Boolean);
  const taste = subject?.file === 'frontend.md' ? [...said(R.taste), ...said(R.notice)] : said(R.taste);
  const notes = said(fb.note);
  return { date, n: lid.n, facts, stuck, others, cardRows, logRow, usage, taste, notes, statusRow: `| ${subject?.name || '?'} ${lid.n} (<tên buổi>) | ${date} | ${subject?.name || '?'} | **<buổi kế tiếp theo vòng xoay>** |` };
}

export function draftText(d, { subjectFile = '' } = {}) {
  return [
    `# Sau buổi ${d.n} (${d.date})`, '',
    '## Số liệu', ...d.facts.map((f) => '- ' + f), '',
    `## Dòng nhật ký (nháp; --write đã thêm vào ${subjectFile || 'learning/<môn>.md'} và chuyển dòng cũ sang log.md, AI sửa phần <…>)`, d.logRow, '',
    `## ${STUCK} (thêm vào mục cùng tên của file môn; --write đã thêm sẵn)`, ...(d.stuck.length ? d.stuck.map((s) => '- ' + s) : ['- Không có câu sai hay câu hỏi nào. Xem bài tự nói lại để tìm chỗ còn thiếu.']), '',
    ...Object.entries(d.others || {}).flatMap(([dir, ls]) => [`## ${STUCK} của môn khác: learning/${dir}.md (câu ôn sai; --write đã thêm sẵn)`, ...ls.map((s) => '- ' + s), '']),
    '## Thẻ mới (nháp, viết lại thành câu tự trả lời được, 2–3 thẻ, thêm vào learning/cards.md)', ...d.cardRows, '',
    '## Dòng "Trạng thái" (learning/README.md)', d.statusRow, '',
    '## Góp ý của thien trong buổi (đi đâu: bảng "Góp ý của thien" trong profile/MAP.md)',
    ...(d.taste?.length ? [`Câu gu (chép câu nào là gu vào ${TASTE_QUEUE}; 2 tuần một lần gom thành một PR vào thienui docs/taste.md mục "Đang thử", thien duyệt từng dòng):`, ...d.taste.map((t) => '- ' + clip(t, 300))] : ['- Không có câu gu trong bản lưu.']),
    ...(d.notes?.length ? ['Ghi thêm của thien (lỗi trang, nhịp học, câu chữ: ghi vào file đích theo bảng):', ...d.notes.map((t) => '- ' + clip(t, 300))] : []),
    `- Từ mới: file bài cần dòng "Từ mới: a, b" (hay "Từ mới: không có"); từ nào chưa có thì thêm vào ${GLOSSARY}. --check kiểm cả hai.`, '',
    '## Còn phải làm', '- Viết phần <…> của dòng nhật ký, gọn mục "Chỗ còn vướng" (tối đa 6 dòng).',
    '- Lưu bài vào learning/<môn>/lessons/, tick chặng và thêm link trong learning/roadmap.md, viết mục "Buổi tiếp theo".',
    `- Kiểm: node artifacts/lesson/after-lesson.mjs --check <lesson-id>`, '',
  ].join('\n');
}

/** Kiểm đã ghi đủ mọi thứ sau buổi n của môn dir chưa. Trả về [{ ok, what }]. strict: thêm Trạng thái, usage, đủ 2 thẻ. */
export function checkAfter(root, dir, n, { strict = true } = {}) {
  const read = (p) => (existsSync(join(root, p)) ? lf(readFileSync(join(root, p), 'utf8')) : '');
  const readme = read('learning/README.md'), cards = read('learning/cards.md'), subj = subjects(readme, cards)[dir];
  if (!subj) return [{ ok: false, what: `môn "${dir}" không có trong bảng "Môn đang học" của learning/README.md` }];
  const md = read('learning/' + subj.file), old = read(`learning/${dir}/log.md`);
  const row = [...logRows(md), ...logRows(old)].find((x) => x.n === n);
  const nn = String(n).padStart(2, '0');
  const lessonDir = join(root, 'learning', dir, 'lessons');
  const lesson = existsSync(lessonDir) ? readdirSync(lessonDir).find((f) => f.startsWith(nn + '-') && f.endsWith('.md')) : null;
  const linked = lesson ? [...cards.matchAll(new RegExp(`\\(${dir}/lessons/${lesson.replace(/\./g, '\\.')}\\)`, 'g'))].length : 0;
  const road = (read('learning/roadmap.md').match(new RegExp(`^## ${subj.name}\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm')) || [])[1] || '';
  const r = [
    { ok: !!row && !PLACEHOLDER.test(row.line), what: `dòng nhật ký buổi ${n} trong learning/${subj.file} (hay learning/${dir}/log.md), đã viết xong phần <…>` },
    { ok: !!lesson, what: `file bài learning/${dir}/lessons/${nn}-<tên>.md` },
    { ok: linked >= (strict ? 2 : 1), what: `${strict ? 'ít nhất 2 thẻ' : 'thẻ'} trỏ tới bài này trong learning/cards.md (đang có ${linked})` },
    { ok: new RegExp(`buổi ${n}(?!\\d)`, 'i').test(road), what: `buổi ${n} trong phần ${subj.name} của learning/roadmap.md` },
  ];
  if (strict) {
    r.push({ ok: new RegExp(`\\| ${subj.name} ${n}(?!\\d)`).test(readme), what: `bảng "Trạng thái" của learning/README.md ghi ${subj.name} ${n}` });
    r.push({ ok: usageRows(read('learning/usage.md')).some((x) => lessonOf(x['Trang'])?.dir === dir && lessonOf(x['Trang'])?.n === n), what: 'dòng của buổi này trong learning/usage.md (after-lesson --write)' });
    r.push(...subjectChecks(md, subj.file));
    // Thẻ mới kèm câu trắc nghiệm, để buổi sau make-lesson.mjs tự sinh bước ôn (thien chọn giữ trắc nghiệm, 2026-11-17).
    let quiz = {};
    try { quiz = JSON.parse(read('learning/' + QUIZ_FILE) || '{}'); } catch (e) { quiz = null; }
    const own = lesson ? parseCards(cards).filter((c) => c.link === `${dir}/lessons/${lesson}`).map((c) => c.id) : [];
    const noQuiz = quiz ? own.filter((id) => !validQuiz(quiz[id])) : own;
    r.push({ ok: !!quiz && !noQuiz.length, what: quiz ? `câu trắc nghiệm trong learning/${QUIZ_FILE} cho mọi thẻ của bài này${noQuiz.length ? ` (thiếu ${noQuiz.join(', ')})` : ''}` : `learning/${QUIZ_FILE} là JSON hợp lệ` });
    const words = lesson ? newWords(read(`learning/${dir}/lessons/${lesson}`)) : null;
    const terms = glossaryTerms(read(GLOSSARY)), missing = (words || []).filter((w) => !terms.has(w.toLowerCase()));
    r.push({ ok: words !== null, what: `file bài có dòng "Từ mới:" (liệt kê từ, hay "Từ mới: không có")` });
    r.push({ ok: words !== null && !missing.length, what: `từ mới của bài đã có trong ${GLOSSARY}${missing.length ? ` (thiếu: ${missing.join(', ')})` : ''}` });
  }
  return r;
}

/** Mọi bài đã có file trong learning/<môn>/lessons/: kiểm phần cốt lõi (nhật ký, thẻ, roadmap). */
export function checkAll(root) {
  const read = (p) => (existsSync(join(root, p)) ? lf(readFileSync(join(root, p), 'utf8')) : '');
  const subs = subjects(read('learning/README.md'), read('learning/cards.md'));
  const out = [];
  for (const dir of Object.keys(subs)) {
    for (const c of subjectChecks(read('learning/' + subs[dir].file), subs[dir].file)) if (!c.ok) out.push(`${dir}: chưa đạt ${c.what}`);
    const ld = join(root, 'learning', dir, 'lessons');
    if (!existsSync(ld)) continue;
    for (const f of readdirSync(ld).filter((x) => /^\d+-.*\.md$/.test(x))) {
      for (const c of checkAfter(root, dir, parseInt(f, 10), { strict: false })) if (!c.ok) out.push(`${dir} buổi ${parseInt(f, 10)}: thiếu ${c.what}`);
    }
  }
  return out;
}

/** Chuyển nhật ký cũ của mọi môn (hay chỉ môn dirs) sang learning/<môn>/log.md. Trả về [{ dir, moved }]. */
export function trimAll(root, dirs) {
  const read = (p) => (existsSync(join(root, p)) ? lf(readFileSync(join(root, p), 'utf8')) : '');
  const subs = subjects(read('learning/README.md'), read('learning/cards.md'));
  const out = [];
  for (const dir of dirs || Object.keys(subs)) {
    const s = subs[dir]; if (!s || !existsSync(join(root, 'learning', s.file))) continue;
    const t = trimLog(read('learning/' + s.file), read(`learning/${dir}/log.md`), { dir, name: s.name });
    if (t.moved) {
      // Ghi log trước: lỗi giữa chừng thì dòng cũ còn ở file môn, không mất.
      mkdirSync(join(root, 'learning', dir), { recursive: true });
      writeFileSync(join(root, 'learning', dir, 'log.md'), t.log);
      writeFileSync(join(root, 'learning', s.file), t.md);
    }
    out.push({ dir, moved: t.moved });
  }
  return out;
}

/** Trang của bài: theo --page, hoặc trang trong learning/<môn>/pages/ có cùng id. */
function findPage(root, id, dir) {
  const pd = join(root, 'learning', dir, 'pages');
  if (!existsSync(pd)) return '';
  for (const f of readdirSync(pd).filter((x) => x.endsWith('.html'))) {
    const html = lf(readFileSync(join(pd, f), 'utf8'));
    const conf = html.match(/<script type="application\/json" id="lesson">([\s\S]*?)<\/script>/);
    let cid = ''; try { cid = conf ? JSON.parse(conf[1]).id : ''; } catch (e) {}
    if (cid === id || guessId(join(pd, f)) === id) return join(pd, f);
  }
  return '';
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  const opt = (n) => { const i = args.indexOf('--' + n); if (i < 0) return null; const v = args[i + 1]; if (!v || v.startsWith('--')) { console.error(`--${n} cần một giá trị`); process.exit(2); } return args.splice(i, 2)[1]; };
  const flag = (n) => { const i = args.indexOf('--' + n); return i < 0 ? false : (args.splice(i, 1), true); };
  const root = process.env.REPO_ROOT ? resolve(process.env.REPO_ROOT) : ROOT;
  if (flag('check-all')) {
    const bad = checkAll(root);
    for (const b of bad) console.error(b);
    if (bad.length) process.exit(1);
    console.log('after-lesson: mọi bài đã có nhật ký, thẻ và roadmap');
    process.exit(0);
  }
  if (flag('trim-log')) {
    for (const t of trimAll(root)) console.log(`${t.dir}: ${t.moved ? `chuyển ${t.moved} dòng sang learning/${t.dir}/log.md` : 'đã gọn'}`);
    process.exit(0);
  }
  const checkId = opt('check');
  if (checkId) {
    const l = lessonOf(checkId);
    if (!l) { console.error(`Không đọc được môn và số buổi từ "${checkId}" (dạng frontend-06)`); process.exit(2); }
    const res = checkAfter(root, l.dir, l.n);
    for (const c of res) console.log(`${c.ok ? '✓' : '✗'} ${c.what}`);
    process.exit(res.every((c) => c.ok) ? 0 : 1);
  }
  const page = opt('page'), today = opt('today'), write = flag('write');
  const [sessionFile] = args;
  if (!sessionFile) { console.error('Cách dùng: node artifacts/lesson/after-lesson.mjs <session.json> [--page <trang.html>] [--today YYYY-MM-DD] [--write] | --check <lesson-id> | --check-all'); process.exit(2); }
  const raw = JSON.parse(lf(readFileSync(sessionFile, 'utf8')));
  const R = raw && raw.data && raw.data.lesson ? raw.data : raw;
  const l = lessonOf(R.lesson);
  if (!l) { console.error(`Bản lưu không có "lesson" dạng frontend-06 (đang là ${JSON.stringify(R.lesson)})`); process.exit(2); }
  const read = (p) => (existsSync(join(root, p)) ? lf(readFileSync(join(root, p), 'utf8')) : '');
  const cards = read('learning/cards.md'), all = subjects(read('learning/README.md'), cards), subject = all[l.dir];
  if (!subject) { console.error(`Môn "${l.dir}" không có trong bảng "Môn đang học" của learning/README.md`); process.exit(2); }
  const pagePath = page || findPage(root, R.lesson, l.dir);
  const html = pagePath && existsSync(pagePath) ? lf(readFileSync(pagePath, 'utf8')) : '';
  const ld = join(root, 'learning', l.dir, 'lessons');
  const lessonName = existsSync(ld) ? readdirSync(ld).find((f) => f.startsWith(String(l.n).padStart(2, '0') + '-')) : null;
  let quiz = {};
  try { quiz = JSON.parse(read('learning/' + QUIZ_FILE) || '{}'); } catch { console.error(`learning/${QUIZ_FILE} không phải JSON hợp lệ: câu ôn sai chỉ ghi được mã thẻ.`); }
  const d = draft({ R, html, subject, lessonFile: lessonName ? `${l.dir}/lessons/${lessonName}` : '', cards, quiz, today, all });
  if (!html) console.error(`Không thấy trang của ${R.lesson}: câu sai chỉ ghi được khóa câu. Truyền --page <trang.html> để có chữ câu hỏi.`);
  console.log(draftText(d, { subjectFile: 'learning/' + subject.file }));
  if (write) {
    const sp = join(root, 'learning', subject.file);
    writeFileSync(sp, addLogRow(addStuck(lf(readFileSync(sp, 'utf8')), d.stuck), d.logRow));
    const [t] = trimAll(root, [l.dir]);
    const notes = [];
    for (const [dir, ls] of Object.entries(d.others)) {
      const op = join(root, 'learning', all[dir].file);
      if (existsSync(op)) { writeFileSync(op, addStuck(lf(readFileSync(op, 'utf8')), ls)); notes.push(`${ls.length} dòng vào "${STUCK}" của ${rel(root, op)}`); }
    }
    const up = join(root, 'learning/usage.md');
    writeFileSync(up, addUsage(lf(readFileSync(up, 'utf8')), d.usage));
    // Kết quả ôn đầu buổi vào cards.md, cùng luật hộp với trang ôn thẻ (artifacts/review/apply-review.mjs).
    const day = lessonDay(R.start) || today || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
    const cp = join(root, 'learning/cards.md'), cardsNow = lf(readFileSync(cp, 'utf8'));
    const applied = applyReview(cardsNow, reviewResults(R, cardsNow, day), day);
    if (applied.changed.length) writeFileSync(cp, applied.text);
    console.log(`Đã ghi: ${d.stuck.length} dòng vào "${STUCK}" của ${rel(root, sp)}, ${notes.length ? notes.join(', ') + ', ' : ''}dòng nhật ký nháp buổi ${d.n}${t?.moved ? ` (chuyển ${t.moved} dòng cũ sang learning/${l.dir}/log.md)` : ''}, một dòng vào ${rel(root, up)}.`);
    console.log(applied.changed.length ? `Thẻ ôn đầu buổi đã ghi vào learning/cards.md: ${applied.changed.join('; ')}.` : 'Thẻ ôn đầu buổi: không có thẻ nào cần ghi (đã ghi rồi, hay trang không có bước ôn).');
  }
}
