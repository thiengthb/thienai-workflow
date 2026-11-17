#!/usr/bin/env node
// How much text an AI reads before it starts each kind of task, measured from profile/MAP.md itself:
// tier 1 (every session) plus the "Đọc" column of each row of the tier-2 table. The repo grows with every lesson
// (subject logs, cards), so CI runs this and fails when a task needs more than BUDGET_KB, the signal to split a file
// or move history out of it, instead of noticing months later that every session starts heavy.
//
//   node .github/scripts/reading-cost.mjs [--root <dir>] [--json]
//
// A script written in the "Đọc" column (prepare-lesson.mjs) is a packet the AI reads instead of whole files: it is run
// with --reading-cost and must print how many bytes it would print at most.
//
// Sizes are bytes of the files as they are in the repo. Tokens are an estimate (about 3 bytes per token for this
// mix of Vietnamese and code); no tokenizer is run, so treat them as a rough scale, not a count. This is document size,
// not usage: most usage is the system prompt read again every turn (docs/usage-log.md), so turns matter more than KB.
import { readFileSync, existsSync, statSync, readdirSync, realpathSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const BUDGET_KB = 120;     // one task, tier 1 included
export const WARN_KB = 100;
const BYTES_PER_TOKEN = 3;
const lf = (s) => s.replace(/^﻿/, '').replace(/\r\n?/g, '\n');

/** Markdown files written in backticks: what the AI reads. Scripts (`.mjs`) in the same cells are run, not read. */
const paths = (md) => [...md.matchAll(/`([^`\s]+)`/g)].map((m) => m[1].replace(/[),.:;]+$/, ''))
  .filter((p) => p.endsWith('.md') && (p.includes('/') || /^[A-Z]+\.md$/.test(p)));
/** Scripts in the "Đọc" column (a session packet such as prepare-lesson.mjs): the AI reads what they print. */
const scripts = (md) => [...md.matchAll(/`([^`\s]+\.mjs)`/g)].map((m) => m[1]);

/** { tier1: [paths], tasks: [{ task, files: [paths] }] } from the text of profile/MAP.md. */
export function parseMap(md) {
  md = lf(md);
  const part = (h) => (md.match(new RegExp(`^## ${h}[^\\n]*\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, 'm')) || [])[1] || '';
  const tier1 = paths(part('Tầng 1'));
  const tasks = [];
  for (const line of part('Tầng 2').split('\n')) {
    const cells = line.split('|').map((c) => c.trim());
    if (cells.length < 4 || /^-+$/.test(cells[1]) || cells[1] === 'thien nói hay việc là') continue;
    // "`a.md` hay `b.md`": the AI reads one of the two, so only the larger one counts (worst case, no double count).
    const alts = [...cells[2].matchAll(/`([^`\s]+\.md)` hay `([^`\s]+\.md)`/g)].map((m) => [m[1], m[2]]);
    const files = paths(cells[2]).filter((p) => !alts.some(([, second]) => second === p));
    const run = scripts(cells[2]);
    tasks.push({ task: cells[1].replace(/`/g, ''), files, alts: alts.map(([x, y]) => [x, y]), ...(run.length ? { scripts: run } : {}) });
  }
  return { tier1, tasks };
}

/** Bytes a script prints for the AI to read: `node <script> --reading-cost` prints that number (worst case over subjects). */
function printed(root, p) {
  root = resolve(root);
  const f = join(root, p);
  if (!existsSync(f)) return { path: p + ' (phần in ra)', bytes: 0, missing: true };
  const r = spawnSync(process.execPath, [f, '--reading-cost'], { cwd: root, encoding: 'utf8', env: { ...process.env, REPO_ROOT: root } });
  const n = Number(String(r.stdout).trim());
  if (r.status !== 0 || !Number.isFinite(n)) throw new Error(`${p} --reading-cost không in ra số byte: ${r.stderr || r.stdout}`);
  return { path: p + ' (phần in ra)', bytes: n };
}

/** Bytes of one path; "<môn>" means the largest subject file, so the number is the worst case. */
function size(root, p) {
  if (p.includes('<môn>')) {
    const dir = join(root, dirname(p));
    const opts = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => p.replace('<môn>', f.replace(/\.md$/, ''))) : [];
    const subjects = opts.filter((o) => existsSync(join(root, o.replace(/\.md$/, ''))) && statSync(join(root, o.replace(/\.md$/, ''))).isDirectory());
    return subjects.reduce((best, o) => { const b = size(root, o); return b.bytes > best.bytes ? b : best; }, { path: p, bytes: 0 });
  }
  const f = join(root, p);
  return { path: p, bytes: existsSync(f) && statSync(f).isFile() ? statSync(f).size : 0, missing: !existsSync(f) };
}

export function measure(root) {
  const { tier1, tasks } = parseMap(readFileSync(join(root, 'profile/MAP.md'), 'utf8'));
  const base = [...new Set(tier1)].map((p) => size(root, p));
  const baseBytes = base.reduce((n, f) => n + f.bytes, 0);
  return {
    tier1: { files: base, bytes: baseBytes },
    tasks: tasks.map(({ task, files, alts, scripts: run = [] }) => {
      const pick = (p) => { const alt = (alts || []).find(([x]) => x === p); if (!alt) return size(root, p); const [x, y] = alt.map((q) => size(root, q)); return x.bytes >= y.bytes ? x : y; };
      const own = [...[...new Set(files)].filter((p) => !tier1.includes(p)).map(pick), ...[...new Set(run)].map((p) => printed(root, p))];
      const bytes = baseBytes + own.reduce((n, f) => n + f.bytes, 0);
      return { task, files: own, bytes, biggest: [...own].sort((a, b) => b.bytes - a.bytes)[0] };
    }),
  };
}

const kb = (b) => (b / 1024).toFixed(1) + ' KB';
const tok = (b) => '~' + Math.round(b / BYTES_PER_TOKEN / 100) / 10 + 'k token';

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  const ri = args.indexOf('--root');
  const root = resolve(ri >= 0 ? args[ri + 1] : join(dirname(fileURLToPath(import.meta.url)), '../..'));
  const m = measure(root);
  if (args.includes('--json')) { console.log(JSON.stringify(m, null, 2)); process.exit(0); }
  console.log(`Tầng 1 (mọi phiên): ${kb(m.tier1.bytes)} ${tok(m.tier1.bytes)}`);
  let over = 0;
  for (const t of [...m.tasks].sort((a, b) => b.bytes - a.bytes)) {
    const flag = t.bytes > BUDGET_KB * 1024 ? '  QUÁ NGÂN SÁCH' : t.bytes > WARN_KB * 1024 ? '  sắp chạm ngân sách' : '';
    if (t.bytes > BUDGET_KB * 1024) over++;
    console.log(`- ${t.task}: ${kb(t.bytes)} ${tok(t.bytes)}${t.biggest ? `, nặng nhất ${t.biggest.path} ${kb(t.biggest.bytes)}` : ''}${flag}`);
  }
  const missing = [...m.tier1.files, ...m.tasks.flatMap((t) => t.files)].filter((f) => f.missing).map((f) => f.path);
  if (missing.length) console.log(`Không thấy (repo project hay chưa có): ${[...new Set(missing)].join(', ')}`);
  console.log(`Ngân sách mỗi việc: ${BUDGET_KB} KB. Token là ước tính (khoảng ${BYTES_PER_TOKEN} byte một token), chưa đếm bằng tokenizer. Đây là cỡ tài liệu AI đọc, không phải usage: usage thật xem ở Settings > Usage (project bản beta: Project settings > Usage, có số theo từng thread); phần lớn usage là lời nhắc hệ thống đọc lại mỗi lượt, nên số lượt mới là thứ đáng giảm.`);
  if (over) { console.log(`${over} việc quá ngân sách: tách file nặng nhất, hay chuyển phần lịch sử (nhật ký cũ) ra file riêng rồi sửa profile/MAP.md.`); process.exitCode = 1; }
}
