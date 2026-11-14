#!/usr/bin/env node
// Việc sau buổi học (đề xuất P1, T4, P3). Đọc kết quả buổi mà trang lưu trong db (sessions/<id>-<thời điểm>),
// soạn nháp mọi thứ cần ghi, và kiểm xem đã ghi đủ chưa.
//
//   node artifacts/lesson/after-lesson.mjs <session.json> [--page <trang.html>] [--today YYYY-MM-DD] [--write]
//       In nháp: số liệu, dòng nhật ký, chỗ còn vướng, thẻ mới, dòng "Trạng thái".
//       --write: ghi luôn hai phần máy làm được: thêm dòng vào mục "Chỗ còn vướng" của learning/<môn>.md
//       và một dòng vào learning/usage.md. Phần còn lại (nhật ký, thẻ, Trạng thái, roadmap) AI viết từ nháp.
//   node artifacts/lesson/after-lesson.mjs --check <lesson-id>
//       Kiểm đã ghi đủ chưa: dòng nhật ký, file bài, thẻ mới, Trạng thái, roadmap, dòng usage. Thiếu thì thoát mã 1.
//   node artifacts/lesson/after-lesson.mjs --check-all
//       CI: mọi bài trong learning/<môn>/lessons/ đều có dòng nhật ký, có thẻ, có trong roadmap.
//
// <session.json>: bản ArtifactData đọc được ở sessions/<id>-<thời điểm> (R của lesson.js), lưu ra file.
import { readFileSync, writeFileSync, readdirSync, existsSync, realpathSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { addUsage, usageRows } from '../kit/usage.mjs';
import { guessId, stuckPoints, STUCK } from './make-lesson.mjs';

export { stuckPoints, STUCK };

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const strip = (s) => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
const clip = (s, n = 200) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
const addDays = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);

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

/** Số liệu và nháp mọi thứ cần ghi sau một buổi. */
export function draft({ R, html = '', subject, lessonFile = '', cards = '', today }) {
  const lid = lessonOf(R.lesson) || { n: '?' };
  const date = today || String(R.end || R.start || '').slice(0, 10) || new Date().toISOString().slice(0, 10);
  const Q = pageQuestions(html);
  const list = (o) => Object.entries(o || {});
  const right = (o) => list(o).filter(([, v]) => v.ok).length;
  const mins = R.start && R.end ? Math.round((Date.parse(R.end) - Date.parse(R.start)) / 6e4) : null;
  const ai = R.ai || [], asks = ai.filter((x) => x.kind === 'ask'), whys = ai.filter((x) => x.kind === 'why'), teachAi = ai.filter((x) => x.kind === 'teach');
  const fb = R.feedback || {};
  const fbText = Object.entries(fb).filter(([k]) => k !== 'note').map(([k, v]) => `${k} "${v}"`).join(', ');

  // Chỗ còn vướng: câu chọn sai (cả câu ôn), câu đã hỏi Claude.
  const stuck = [];
  const wrong = [...list(R.review).map(([k, v]) => [k, v, 'ôn']), ...list(R.quiz).map(([k, v]) => [k, v, 'bài'])].filter(([, v]) => !v.ok);
  for (const [k, v, part] of wrong) {
    const q = Q[k] || { text: k, options: [] };
    const pick = q.options[v.pick], ans = q.options[q.answer];
    stuck.push(clip(`${date}, buổi ${lid.n}: ${part === 'ôn' ? 'câu ôn' : 'câu'} “${clip(q.text, 140)}” chọn “${clip(pick || '?', 80)}”${ans ? `, đúng là “${clip(ans, 80)}”` : ''}`, 360));
  }
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
    `Nhờ Claude: hỏi ${asks.length}, giải thích câu sai ${whys.length}, nhận xét bài tự nói lại ${teachAi.length}; nói thay gõ ${R.spoke || 0} lần`,
  ].filter(Boolean);
  const logRow = `| ${lid.n} | ${date} | <ý chính> (${lessonFile ? `[bài](${lessonFile})` : 'bài'}) | ${[mins != null ? `${mins} phút` : '', fbText, list(R.quiz).length ? `đúng ${right(R.quiz)}/${list(R.quiz).length}` : ''].filter(Boolean).join(', ')}. <tự nói lại có gì, thiếu gì; chỗ vướng; góp ý> |`;
  const usage = {
    'Ngày': date, 'Trang': R.lesson, 'Phút': mins ?? '-', 'Hỏi Claude': asks.length, 'Claude giải thích câu sai': whys.length,
    'Claude nhận xét, chấm': teachAi.length, 'Nói thay gõ': R.spoke || 0, 'Ghi chú': R.sawMineBeforeWriting ? 'xem bản mẫu trước khi viết' : '-',
  };
  return { date, n: lid.n, facts, stuck, cardRows, logRow, usage, statusRow: `| ${subject?.name || '?'} ${lid.n} (<tên buổi>) | ${date} | ${subject?.name || '?'} | **<buổi kế tiếp theo vòng xoay>** |` };
}

export function draftText(d, { subjectFile = '' } = {}) {
  return [
    `# Sau buổi ${d.n} (${d.date})`, '',
    '## Số liệu', ...d.facts.map((f) => '- ' + f), '',
    `## Dòng nhật ký (nháp, sửa phần <…> rồi thêm vào ${subjectFile || 'learning/<môn>.md'})`, d.logRow, '',
    `## ${STUCK} (thêm vào mục cùng tên của file môn; --write đã thêm sẵn)`, ...(d.stuck.length ? d.stuck.map((s) => '- ' + s) : ['- Không có câu sai hay câu hỏi nào. Xem bài tự nói lại để tìm chỗ còn thiếu.']), '',
    '## Thẻ mới (nháp, viết lại thành câu tự trả lời được, 2–3 thẻ, thêm vào learning/cards.md)', ...d.cardRows, '',
    '## Dòng "Trạng thái" (learning/README.md)', d.statusRow, '',
    '## Còn phải làm', '- Lưu bài vào learning/<môn>/lessons/, tick chặng và thêm link trong learning/roadmap.md, viết mục "Buổi tiếp theo".',
    `- Kiểm: node artifacts/lesson/after-lesson.mjs --check <lesson-id>`, '',
  ].join('\n');
}

/** Kiểm đã ghi đủ mọi thứ sau buổi n của môn dir chưa. Trả về [{ ok, what }]. strict: thêm Trạng thái, usage, đủ 2 thẻ. */
export function checkAfter(root, dir, n, { strict = true } = {}) {
  const read = (p) => (existsSync(join(root, p)) ? readFileSync(join(root, p), 'utf8') : '');
  const readme = read('learning/README.md'), cards = read('learning/cards.md'), subj = subjects(readme, cards)[dir];
  if (!subj) return [{ ok: false, what: `môn "${dir}" không có trong bảng "Môn đang học" của learning/README.md` }];
  const md = read('learning/' + subj.file);
  const nn = String(n).padStart(2, '0');
  const lessonDir = join(root, 'learning', dir, 'lessons');
  const lesson = existsSync(lessonDir) ? readdirSync(lessonDir).find((f) => f.startsWith(nn + '-') && f.endsWith('.md')) : null;
  const linked = lesson ? [...cards.matchAll(new RegExp(`\\(${dir}/lessons/${lesson.replace(/\./g, '\\.')}\\)`, 'g'))].length : 0;
  const road = (read('learning/roadmap.md').match(new RegExp(`^## ${subj.name}\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm')) || [])[1] || '';
  const r = [
    { ok: new RegExp(`^\\| ${n} \\|`, 'm').test(md), what: `dòng nhật ký buổi ${n} trong learning/${subj.file}` },
    { ok: !!lesson, what: `file bài learning/${dir}/lessons/${nn}-<tên>.md` },
    { ok: linked >= (strict ? 2 : 1), what: `${strict ? 'ít nhất 2 thẻ' : 'thẻ'} trỏ tới bài này trong learning/cards.md (đang có ${linked})` },
    { ok: new RegExp(`buổi ${n}(?!\\d)`, 'i').test(road), what: `buổi ${n} trong phần ${subj.name} của learning/roadmap.md` },
  ];
  if (strict) {
    r.push({ ok: new RegExp(`\\| ${subj.name} ${n}(?!\\d)`).test(readme), what: `bảng "Trạng thái" của learning/README.md ghi ${subj.name} ${n}` });
    r.push({ ok: usageRows(read('learning/usage.md')).some((x) => lessonOf(x['Trang'])?.dir === dir && lessonOf(x['Trang'])?.n === n), what: 'dòng của buổi này trong learning/usage.md (after-lesson --write)' });
  }
  return r;
}

/** Mọi bài đã có file trong learning/<môn>/lessons/: kiểm phần cốt lõi (nhật ký, thẻ, roadmap). */
export function checkAll(root) {
  const read = (p) => (existsSync(join(root, p)) ? readFileSync(join(root, p), 'utf8') : '');
  const subs = subjects(read('learning/README.md'), read('learning/cards.md'));
  const out = [];
  for (const dir of Object.keys(subs)) {
    const ld = join(root, 'learning', dir, 'lessons');
    if (!existsSync(ld)) continue;
    for (const f of readdirSync(ld).filter((x) => /^\d+-.*\.md$/.test(x))) {
      for (const c of checkAfter(root, dir, parseInt(f, 10), { strict: false })) if (!c.ok) out.push(`${dir} buổi ${parseInt(f, 10)}: thiếu ${c.what}`);
    }
  }
  return out;
}

/** Trang của bài: theo --page, hoặc trang trong learning/<môn>/pages/ có cùng id. */
function findPage(root, id, dir) {
  const pd = join(root, 'learning', dir, 'pages');
  if (!existsSync(pd)) return '';
  for (const f of readdirSync(pd).filter((x) => x.endsWith('.html'))) {
    const html = readFileSync(join(pd, f), 'utf8');
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
  const raw = JSON.parse(readFileSync(sessionFile, 'utf8'));
  const R = raw && raw.data && raw.data.lesson ? raw.data : raw;
  const l = lessonOf(R.lesson);
  if (!l) { console.error(`Bản lưu không có "lesson" dạng frontend-06 (đang là ${JSON.stringify(R.lesson)})`); process.exit(2); }
  const read = (p) => (existsSync(join(root, p)) ? readFileSync(join(root, p), 'utf8') : '');
  const cards = read('learning/cards.md'), subject = subjects(read('learning/README.md'), cards)[l.dir];
  if (!subject) { console.error(`Môn "${l.dir}" không có trong bảng "Môn đang học" của learning/README.md`); process.exit(2); }
  const pagePath = page || findPage(root, R.lesson, l.dir);
  const html = pagePath && existsSync(pagePath) ? readFileSync(pagePath, 'utf8') : '';
  const ld = join(root, 'learning', l.dir, 'lessons');
  const lf = existsSync(ld) ? readdirSync(ld).find((f) => f.startsWith(String(l.n).padStart(2, '0') + '-')) : null;
  const d = draft({ R, html, subject, lessonFile: lf ? `${l.dir}/lessons/${lf}` : '', cards, today });
  if (!html) console.error(`Không thấy trang của ${R.lesson}: câu sai chỉ ghi được khóa câu. Truyền --page <trang.html> để có chữ câu hỏi.`);
  console.log(draftText(d, { subjectFile: 'learning/' + subject.file }));
  if (write) {
    const sp = join(root, 'learning', subject.file);
    writeFileSync(sp, addStuck(readFileSync(sp, 'utf8'), d.stuck));
    const up = join(root, 'learning/usage.md');
    writeFileSync(up, addUsage(readFileSync(up, 'utf8'), d.usage));
    console.log(`Đã ghi: ${d.stuck.length} dòng vào "${STUCK}" của ${relative(root, sp)}, một dòng vào ${relative(root, up)}.`);
  }
}
