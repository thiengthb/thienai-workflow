#!/usr/bin/env node
// Gói buổi (docs/plans/2026-11-15-lean-learning.md, đợt 2): khi thien nhắn "học", AI chạy lệnh này thay vì mở cả
// learning/README.md, file môn và learning/cards.md. Lệnh chỉ đọc, không ghi gì, và in một bản ngắn có kích thước gần như
// cố định dù đã học bao nhiêu buổi:
//   - buổi kế tiếp (bảng "Trạng thái"), luật TikTok, "Vòng xoay", phần "Khung một buổi" của learning/README.md (nguyên văn, trừ "Sau buổi");
//   - hồ sơ môn learning/<môn>.md nguyên văn, trừ nhật ký (chỉ dòng gần nhất) và chỗ còn vướng (6 dòng mới nhất);
//   - 3 thẻ đến hạn trong learning/cards.md, kèm đáp án tìm trong mục "Tự kiểm" của file bài;
//   - nhánh chưa merge đụng môn đó; đường dẫn các luật phải đọc nguyên văn (profile/TUTOR.md…), không tóm.
// Chỗ nào lệnh không chắc (không so được nhánh, thẻ không thấy đáp án) thì in "chưa kiểm", không đoán.
//
//   node artifacts/lesson/prepare-lesson.mjs [<môn>] [--today YYYY-MM-DD] [--no-fetch]
//       <môn> là thư mục môn (frontend, ba, war). Không ghi thì lấy buổi in đậm ở cột "Buổi kế tiếp" của bảng "Trạng thái".
//   node artifacts/lesson/prepare-lesson.mjs --reading-cost
//       In số byte của gói nặng nhất trong mọi môn (cho .github/scripts/reading-cost.mjs).
import { readFileSync, existsSync, realpathSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { subjects, logRows, MAX_STUCK } from './after-lesson.mjs';
import { stuckPoints, STUCK } from './make-lesson.mjs';
import { parseCards, dueCards, selfCheck, matchAnswer } from '../review/make-review.mjs';
import { openWork } from '../../templates/check-open-work.mjs';

const lf = (s) => s.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const REVIEW_CARDS = 3;
// Luật đọc nguyên văn mỗi buổi, không chép vào gói (gói chỉ trỏ tới): profile/MAP.md, hàng "học".
export const RULES = ['profile/TUTOR.md', 'artifacts/lesson/README.md'];

/** Các mục "## " của một file markdown: [{ head, body }] (head là cả dòng tiêu đề, body tới mục kế tiếp). Phần trước mục đầu có head ''. */
export function sections(md) {
  const out = [{ head: '', body: [] }];
  for (const l of lf(md).split('\n')) {
    if (/^## /.test(l)) out.push({ head: l, body: [] });
    else out[out.length - 1].body.push(l);
  }
  return out.map((s) => ({ head: s.head, body: s.body.join('\n').replace(/^\n+|\n+$/g, '') }));
}
const find = (md, start) => sections(md).find((s) => s.head.startsWith('## ' + start));

/** Buổi kế tiếp, từ chữ in đậm đầu tiên ở cột cuối bảng "Trạng thái": { dir, n, label } hay null. */
export function nextLesson(readme, subs) {
  const st = find(readme, 'Trạng thái');
  const row = st && st.body.split('\n').find((l) => /^\| /.test(l) && !/^\| Buổi gần nhất|^\|-/.test(l));
  const bold = row && (row.split('|').slice(1, -1).pop() || '').match(/\*\*([^*]+)\*\*/);
  if (!bold) return null;
  const label = bold[1].trim();
  for (const [dir, s] of Object.entries(subs)) {
    const m = label.match(new RegExp(`^${s.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+(\\d+)`, 'i'));
    if (m) return { dir, n: +m[1], label };
  }
  return null;
}

/** Phần "Khung một buổi" nguyên văn, bỏ khối "Sau buổi" (đọc lúc ghi buổi, không phải lúc dựng). */
export function frame(readme) {
  const s = find(readme, 'Khung một buổi');
  if (!s) return null;
  const paras = s.body.split(/\n{2,}/), out = [];
  let skip = false;
  for (const p of paras) {
    if (/^\*\*Sau buổi\*\*/.test(p)) { skip = true; continue; }
    if (skip && /^\*\*/.test(p)) skip = false;
    if (!skip) out.push(p);
  }
  return { head: s.head, body: out.join('\n\n') };
}

/** Hồ sơ môn: mọi mục nguyên văn, trừ nhật ký (chỉ dòng gần nhất) và chỗ còn vướng (MAX_STUCK dòng mới nhất). */
export function profile(md, { dir, file }) {
  const out = [];
  for (const s of sections(md)) {
    if (!s.head) { const intro = s.body.split('\n').filter((l) => !/^# /.test(l)).join('\n').trim(); if (intro) out.push(intro); continue; }
    if (s.head.startsWith('## Nhật ký')) {
      const rows = logRows(md), last = [...rows].sort((a, b) => a.n - b.n).pop();
      const head = s.body.split('\n').filter((l) => /^\|/.test(l) && !/^\| \d/.test(l)).slice(0, 2);
      out.push(`## Nhật ký: buổi gần nhất (${rows.length > 1 ? `${rows.length - 1} dòng trước đó ở learning/${file}, ` : ''}cũ hơn ở learning/${dir}/log.md)\n` +
        (last ? [...head, last.line].join('\n') : 'Chưa có buổi nào.'));
      continue;
    }
    if (s.head === `## ${STUCK}`) {
      const all = stuckPoints(md, Infinity), keep = all.slice(-MAX_STUCK);
      out.push(`## ${STUCK}${all.length > keep.length ? ` (${keep.length} dòng mới nhất trong ${all.length})` : ''}\n` + (keep.length ? keep.map((l) => '- ' + l).join('\n') : 'Không có.'));
      continue;
    }
    out.push(s.head + (s.body ? '\n' + s.body : ''));
  }
  return out.join('\n\n');
}

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

/** Chữ của gói buổi. open: kết quả openWork (hay null khi không kiểm). */
export function packet({ root, dir, n, label, today, open = null }) {
  const read = (p) => (existsSync(join(root, p)) ? lf(readFileSync(join(root, p), 'utf8')) : '');
  const readme = read('learning/README.md'), cardsText = read('learning/cards.md');
  const subs = subjects(readme, cardsText), s = subs[dir];
  if (!s) throw new Error(`môn "${dir}" không có trong bảng "Môn đang học" của learning/README.md`);
  const md = read('learning/' + s.file);
  const done = logRows(md).reduce((m, r) => Math.max(m, r.n), 0);
  const num = n || done + 1;
  const st = find(readme, 'Trạng thái'), statusRows = st ? st.body.split('\n').filter((l) => /^\|/.test(l)) : [];
  const tiktok = (find(readme, 'Môn đang học')?.body || '').split(/\n{2,}/).find((p) => /^\*\*TikTok/.test(p));
  const fr = frame(readme);
  const cards = reviewCards(cardsText, join(root, 'learning'), today, REVIEW_CARDS, s.name);

  const L = [];
  L.push(`# Gói buổi: ${label || `${s.name} ${num}`}`, '',
    `In bởi \`artifacts/lesson/prepare-lesson.mjs\` ngày ${today}, chỉ đọc. Phần nào chép từ file nào ghi ở tiêu đề; luật chép nguyên văn, không tóm. "chưa kiểm" là chỗ lệnh không chắc.`, '');
  L.push('## Buổi này', `- Môn: ${s.name}, buổi ${num} (hồ sơ: learning/${s.file}; nhật ký đã có tới buổi ${done || 'chưa có'}).`);
  if (statusRows.length) L.push('- Bảng "Trạng thái" (learning/README.md):', '', ...statusRows, '');
  if (tiktok) L.push('Luật TikTok (learning/README.md, mục "Môn đang học", nguyên văn):', '', tiktok, '');
  const rot = find(readme, 'Vòng xoay');
  if (rot) L.push(`${rot.head.replace(/^## /, '### ')} (learning/README.md, nguyên văn)`, '', rot.body, '');

  L.push('## Luật đọc nguyên văn (mở file, gói không chép)', ...RULES.map((r) => `- \`${r}\``),
    `- Mở khi cần: \`learning/teaching/README.md\` (chọn kiểu bài), \`learning/${dir}/log.md\` (nhật ký cũ), \`learning/roadmap.md\`. Sau buổi: mục "Sau buổi" của \`learning/README.md\`.`, '');

  if (fr) L.push(`${fr.head} (learning/README.md, nguyên văn, trừ khối "Sau buổi")`, '', fr.body, '');
  else L.push('## Khung một buổi', 'chưa kiểm: không thấy mục "Khung một buổi" trong learning/README.md; mở file đó.', '');

  L.push(`## Hồ sơ môn: learning/${s.file} (nguyên văn, trừ nhật ký cũ)`, '', profile(md, { dir, file: s.file }).replace(/^## /gm, '### '), '');

  L.push(`## ${REVIEW_CARDS} thẻ ôn đến hạn (learning/cards.md, hôm nay ${today})`);
  const nDue = cards.filter((c) => !c.filler).length;
  if (nDue < REVIEW_CARDS) L.push(`Chỉ có ${nDue} thẻ đến hạn${cards.length > nDue ? '; thêm thẻ hạn sớm nhất của môn khác (ghi "chưa đến hạn")' : ''}.`);
  if (!cards.length) L.push('Không có thẻ nào. Bỏ phần ôn trộn, hay hỏi thien muốn ôn thẻ nào.');
  for (const c of cards) {
    L.push(`- ${c.id} (${c.subject}, hộp ${c.box}, ${c.filler ? 'chưa đến hạn, ' : ''}hạn ${c.due}): ${c.question}`,
      c.answer ? `  Đáp án (mục "Tự kiểm" của ${c.linkText || c.link}): ${c.answer}` : `  Đáp án: chưa kiểm, không thấy trong mục "Tự kiểm" của ${c.link || 'bài'}; mở bài đó.`);
  }
  L.push('');

  L.push('## Nhánh chưa merge đụng môn này');
  if (!open) L.push('chưa kiểm (chạy không có --no-fetch, hay `node templates/check-open-work.mjs learning/' + dir + '.md learning/' + dir + '/`).');
  else {
    if (open.stale || open.missingBase) L.push('chưa kiểm: không tải hay không so được nhánh trên origin (mất mạng hay clone nông). Xem trang Pull requests trước khi dựng.');
    for (const w of open) L.push(`- ${w.branch} (${w.date}): ${w.subject}. Sửa ${w.files.join(', ')}`);
    if (!open.length && !open.stale && !open.missingBase) L.push('Không có.');
  }
  L.push('');
  return L.join('\n');
}

/** Số byte của gói nặng nhất trong mọi môn: thứ AI đọc mỗi buổi (reading-cost.mjs). Mọi thẻ coi như đến hạn. */
export function packetBytes(root) {
  const read = (p) => (existsSync(join(root, p)) ? lf(readFileSync(join(root, p), 'utf8')) : '');
  const subs = subjects(read('learning/README.md'), read('learning/cards.md'));
  const stale = Object.assign([], { stale: true });
  // Thẻ chọn ra đổi theo ngày (đến hạn, hay thẻ bù của môn khác): đo cả hôm nay lẫn ngày mọi thẻ đã đến hạn, lấy số lớn hơn.
  const days = ['9999-12-31', new Date().toISOString().slice(0, 10)];
  return Math.max(0, ...Object.keys(subs).filter((d) => existsSync(join(root, 'learning', subs[d].file)))
    .flatMap((dir) => days.map((today) => Buffer.byteLength(packet({ root, dir, today, open: stale })))));
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  const opt = (k) => { const i = args.indexOf('--' + k); if (i < 0) return null; const v = args[i + 1]; if (!v || v.startsWith('--')) { console.error(`--${k} cần một giá trị`); process.exit(2); } return args.splice(i, 2)[1]; };
  const flag = (k) => { const i = args.indexOf('--' + k); return i < 0 ? false : (args.splice(i, 1), true); };
  const root = process.env.REPO_ROOT ? resolve(process.env.REPO_ROOT) : ROOT;
  if (flag('reading-cost')) { console.log(packetBytes(root)); process.exit(0); }
  const today = opt('today') || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
  const noFetch = flag('no-fetch');
  const read = (p) => (existsSync(join(root, p)) ? lf(readFileSync(join(root, p), 'utf8')) : '');
  const subs = subjects(read('learning/README.md'), read('learning/cards.md'));
  let [dir] = args, next = nextLesson(read('learning/README.md'), subs);
  if (dir && !subs[dir]) { console.error(`Không có môn "${dir}". Các môn: ${Object.keys(subs).join(', ')}`); process.exit(2); }
  if (!dir && !next) { console.error('Không đọc được buổi kế tiếp (chữ in đậm ở cột cuối bảng "Trạng thái" của learning/README.md). Ghi tên môn: prepare-lesson.mjs <môn>'); process.exit(2); }
  if (!dir) dir = next.dir;
  const same = next && next.dir === dir ? next : {};
  let open = null;
  if (!noFetch) { try { open = openWork({ paths: [`learning/${dir}.md`, `learning/${dir}/`], cwd: root }); } catch (e) { open = Object.assign([], { stale: true }); } }
  process.stdout.write(packet({ root, dir, n: same.n, label: same.label, today, open }));
}
