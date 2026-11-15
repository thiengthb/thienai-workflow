#!/usr/bin/env node
// Số liệu cho bảng học tuần (đề xuất N3): số buổi từng môn theo tuần, thẻ ôn và ngày hỏi lại,
// chỗ còn vướng, số lần hỏi Claude. Đọc thẳng các file trong learning/, ghi mỗi bộ số một file JSON
// { rows, meta } để tải lên trang bảng học (loại trang Data của claude.ai). meta mang luôn code này,
// nên trên trang ai cũng xem được số lấy từ đâu và tính thế nào.
//
//   node artifacts/lesson/learning-week.mjs [--out <thư-mục>]
//
// Chủ nhật: chạy lệnh này, tải 4 file lên trang (cách làm trong artifacts/lesson/README.md, mục "Bảng học tuần").
import { readFileSync, writeFileSync, mkdirSync, existsSync, realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
// Windows checkouts (git core.autocrlf) and files saved by Windows editors use CRLF; every parser below expects LF.
const lf = (s) => s.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const SUBJECTS = [['frontend', 'Frontend'], ['ba', 'BA'], ['war', 'Chiến tranh']];
const NAME = Object.fromEntries(SUBJECTS);

const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((s) => s.trim());
/** Rows, as { header: cell }, of the markdown table whose header line is lines[i]. */
function rowsFrom(lines, i) {
  if (i < 0 || !lines[i]?.startsWith('|')) return [];
  const head = cells(lines[i]), out = [];
  for (let k = i + 2; k < lines.length && lines[k].startsWith('|'); k++) out.push(Object.fromEntries(head.map((h, j) => [h, cells(lines[k])[j] ?? ''])));
  return out;
}
/** The first table under "## <title>". */
export function table(md, title) {
  const lines = md.split('\n');
  let i = lines.findIndex((l) => l.trim() === `## ${title}`);
  if (i < 0) return [];
  while (++i < lines.length && !lines[i].startsWith('|')) if (lines[i].startsWith('## ')) return [];
  return rowsFrom(lines, i);
}
/** The first table whose header line starts with `start`. */
export function tableAt(md, start) {
  const lines = md.split('\n');
  return rowsFrom(lines, lines.findIndex((l) => l.startsWith(start)));
}

/** The Monday (YYYY-MM-DD) of the week a date falls in. */
export function weekOf(date) {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

/** One row per session from the "Nhật ký" table of each subject file. */
export function sessions(files) {
  return SUBJECTS.flatMap(([id, subject]) => table(files[id] || '', 'Nhật ký').filter((r) => /^\d{4}-\d{2}-\d{2}$/.test(r['Ngày'])).map((r) => {
    const mins = /(\d+)\s*phút/.exec(r['Kết quả'] || '');
    return { subject, session: +r['Buổi'] || r['Buổi'], date: r['Ngày'], week: weekOf(r['Ngày']), minutes: mins ? +mins[1] : null, idea: plain(r['Ý chính'] || '') };
  }));
}

/** One row per review card in learning/cards.md. */
export const cards = (md) => tableAt(md, '| Thẻ |').map((r) => ({ card: r['Thẻ'], subject: r['Môn'], question: plain(r['Câu hỏi'] || ''), box: +r['Hộp'] || 0, due: r['Hỏi lại'] }));

/** Open stuck points ("Chỗ còn vướng"), with what kind of slip each is. */
export function stuck(files) {
  return SUBJECTS.flatMap(([id, subject]) => {
    const m = (files[id] || '').match(/^## Chỗ còn vướng\n([\s\S]*?)(?=^## |(?![\s\S]))/m);
    return (m ? m[1].split('\n').filter((l) => /^- /.test(l)) : []).map((l, k) => {
      const t = l.slice(2).trim(), h = /^(\d{4}-\d{2}-\d{2}), buổi (\d+):\s*/.exec(t);
      const text = h ? t.slice(h[0].length) : t;
      const kind = /^hỏi Claude/.test(text) ? 'Hỏi Claude' : /chọn “/.test(text) ? 'Chọn sai' : /tự nói lại/.test(text) ? 'Tự nói lại còn thiếu' : 'Làm còn sai';
      return { id: `${id}-${k + 1}`, subject, date: h ? h[1] : '', session: h ? +h[2] : null, kind, text: plain(text) };
    });
  });
}

/** Questions to Claude per session, from learning/usage.md ("-" = the page had no such button). */
export function asks(md) {
  return tableAt(md, '| Ngày |').map((r) => {
    const id = (/^([a-z]+)-?\d*/.exec(r['Trang'] || '') || [])[1] || '';
    const n = Number(r['Hỏi Claude']);
    return { date: r['Ngày'], week: /^\d{4}-\d{2}-\d{2}$/.test(r['Ngày']) ? weekOf(r['Ngày']) : '', page: r['Trang'], subject: NAME[id] || 'Ôn thẻ', asks: Number.isFinite(n) ? n : null };
  });
}

const plain = (s) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').trim();

/** The four data files, each { rows, meta }. */
export function build(dir = root, now = new Date()) {
  const read = (p) => (existsSync(join(dir, p)) ? lf(readFileSync(join(dir, p), 'utf8')) : '');
  const files = Object.fromEntries(SUBJECTS.map(([id]) => [id, read(`learning/${id}.md`)]));
  const code = lf(readFileSync(fileURLToPath(import.meta.url), 'utf8'));
  const meta = (input) => [
    { label: 'learning-week.mjs', value: code, type: 'code', lang: 'javascript' },
    { label: 'Đọc từ', value: input },
    { label: 'Lấy lúc', value: now.toISOString() },
  ];
  return {
    'sessions.json': { rows: sessions(files), meta: meta('learning/frontend.md, learning/ba.md, learning/war.md (bảng "Nhật ký")') },
    'cards.json': { rows: cards(read('learning/cards.md')), meta: meta('learning/cards.md') },
    'stuck.json': { rows: stuck(files), meta: meta('learning/frontend.md, learning/ba.md, learning/war.md (mục "Chỗ còn vướng")') },
    'asks.json': { rows: asks(read('learning/usage.md')), meta: meta('learning/usage.md (cột "Hỏi Claude")') },
  };
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const k = process.argv.indexOf('--out');
  const out = resolve(k > 0 ? process.argv[k + 1] : join(root, 'build/learning-week'));
  mkdirSync(out, { recursive: true });
  for (const [name, data] of Object.entries(build())) {
    writeFileSync(join(out, name), JSON.stringify(data));
    console.log(`${join(out, name)}: ${data.rows.length} dòng`);
  }
}
