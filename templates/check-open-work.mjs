#!/usr/bin/env node
// Liệt kê việc còn nằm trên nhánh chưa merge (thường là PR đang mở), để không làm trùng việc của phiên khác.
//
//   node templates/check-open-work.mjs [đường-dẫn ...] [--base main] [--no-fetch]
//
// Tải nhánh mới nhất từ origin, rồi in mọi nhánh trên origin có commit chưa vào main, kèm file nó sửa.
// Có đường dẫn (ví dụ learning/war.md learning/war/): chỉ báo nhánh sửa đúng những chỗ đó, và thoát mã 1 nếu có,
// để script khác (make-lesson.mjs) dừng lại. Nhánh đang đứng, và nhánh đã gộp hết vào nhánh đang đứng, không tính.
// Lý do: ngày 2026-11-13 một phiên dựng bài chiến tranh 4 từ main trong khi PR #44 của phiên khác đã có bài 4
// và thien đã học bài đó. Main chậm hơn các PR đang mở, nên phải nhìn cả nhánh chưa merge.
import { execFileSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

let CWD = process.cwd();
const git = (...a) => execFileSync('git', a, { cwd: CWD, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

/** Returns [{ branch, subject, date, files }] for origin branches with commits not on base, optionally only those touching paths. */
export function openWork({ base = 'main', paths = [], fetch = true, cwd = process.cwd() } = {}) {
  CWD = cwd;
  if (fetch) { try { git('fetch', '-q', '--prune', 'origin'); } catch (e) { /* offline: dùng bản đã tải */ } }
  let current = '';
  try { current = git('rev-parse', '--abbrev-ref', 'HEAD'); } catch (e) { /* not a repo */ }
  const branches = git('for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin').split('\n')
    .filter((b) => b && b !== 'origin' && b !== 'origin/HEAD' && b !== `origin/${base}` && b !== `origin/${current}`);
  const out = [];
  for (const b of branches) {
    const ahead = Number(git('rev-list', '--count', `origin/${base}..${b}`));
    if (!ahead) continue;
    try { git('merge-base', '--is-ancestor', b, 'HEAD'); continue; } catch (e) { /* chưa gộp vào nhánh đang đứng */ }
    const files = git('diff', '--name-only', `origin/${base}...${b}`).split('\n').filter(Boolean);
    const hit = paths.length ? files.filter((f) => paths.some((p) => f === p || f.startsWith(p.endsWith('/') ? p : p + '/'))) : files;
    if (paths.length && !hit.length) continue;
    const [date, subject] = git('log', '-1', '--format=%cs%x09%s', b).split('\t');
    out.push({ branch: b.replace(/^origin\//, ''), subject, date, ahead, files: hit });
  }
  return out;
}

export function report(list, paths = []) {
  if (!list.length) return paths.length ? `Không có nhánh chưa merge nào sửa ${paths.join(', ')}.` : 'Không có nhánh chưa merge.';
  return [paths.length ? `Có ${list.length} nhánh chưa merge sửa ${paths.join(', ')}. Đọc trước khi làm, đừng làm trùng:` : `Có ${list.length} nhánh chưa merge:`,
    ...list.map((w) => `- ${w.branch} (${w.date}, ${w.ahead} commit): ${w.subject}\n    ${w.files.slice(0, 8).join(', ')}${w.files.length > 8 ? ', …' : ''}`)].join('\n');
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  const bi = args.indexOf('--base'), base = bi >= 0 ? args.splice(bi, 2)[1] : 'main';
  const ni = args.indexOf('--no-fetch'), fetch = ni < 0; if (ni >= 0) args.splice(ni, 1);
  const list = openWork({ base, paths: args, fetch });
  console.log(report(list, args));
  process.exit(args.length && list.length ? 1 : 0);
}
