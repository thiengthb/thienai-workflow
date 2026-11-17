#!/usr/bin/env node
// Liệt kê việc còn nằm trên nhánh chưa merge (thường là PR đang mở), để không làm trùng việc của phiên khác.
//
//   node templates/check-open-work.mjs [đường-dẫn ...] [--base <nhánh chính>] [--no-fetch]
//
// Tải nhánh mới nhất từ origin, rồi in mọi nhánh trên origin có commit chưa vào nhánh chính, kèm file nó sửa
// và PR của nhánh (đang mở, đã đóng hay chưa có), đọc từ refs/pull của GitHub: PR đóng thì nhánh chỉ là nhánh cũ
// cần xem lại hay xoá, không phải việc đang làm dở.
// Nhánh chính: --base nếu có; không thì nhánh mặc định của origin (origin/HEAD), rồi main, rồi master.
// Có đường dẫn (ví dụ learning/war.md learning/war/): chỉ báo nhánh sửa đúng những chỗ đó, và thoát mã 1 nếu có,
// để script khác (make-lesson.mjs) dừng lại. Nhánh đang đứng, và nhánh đã gộp hết vào nhánh đang đứng, không tính.
// Lý do: ngày 2026-11-13 một phiên dựng bài chiến tranh 4 từ main trong khi PR #44 của phiên khác đã có bài 4
// và thien đã học bài đó. Main chậm hơn các PR đang mở, nên phải nhìn cả nhánh chưa merge.
import { execFileSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

let CWD = process.cwd();
const git = (...a) => execFileSync('git', a, { cwd: CWD, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

/**
 * PRs of origin as GitHub keeps them under refs/pull: { byNumber: Map(n -> { head, open }), byHead: Map(sha -> n) }.
 * refs/pull/N/merge exists only while PR N is open and GitHub could build its merge commit, so "no merge ref" means
 * closed, merged, or open with a conflict. Returns null when origin cannot be read (offline, not GitHub).
 */
export function prRefs({ cwd = process.cwd() } = {}) {
  let out;
  try { out = execFileSync('git', ['ls-remote', 'origin', 'refs/pull/*/head', 'refs/pull/*/merge'], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 30000 }); } catch (e) { return null; }
  const byNumber = new Map(), byHead = new Map(), merge = new Set();
  for (const line of out.split('\n')) {
    const m = line.match(/^([0-9a-f]{40})\s+refs\/pull\/(\d+)\/(head|merge)$/);
    if (!m) continue;
    if (m[3] === 'merge') merge.add(Number(m[2]));
    else { byNumber.set(Number(m[2]), { head: m[1], open: false }); byHead.set(m[1], Number(m[2])); }
  }
  for (const n of merge) if (byNumber.has(n)) byNumber.get(n).open = true;
  return { byNumber, byHead };
}

/** Returns [{ branch, subject, date, files }] for origin branches with commits not on base, optionally only those touching paths.
    The array has .stale = true when the fetch failed and the answer comes from old refs. */
export function openWork({ base, paths = [], fetch = true, cwd = process.cwd() } = {}) {
  CWD = cwd;
  // Ghi rõ refspec: repo clone một nhánh (--single-branch) thì fetch thường chỉ tải main, sẽ không thấy nhánh nào khác.
  let stale = false;
  // Clone nông (phiên Claude Code clone --depth 1) không có merge base để so nhánh: tải thêm một đoạn lịch sử có giới hạn.
  // Không dùng --unshallow: có repo chặn, và lịch sử đầy đủ có thể rất nặng.
  // --depth không được nhỏ hơn lịch sử đang có (bản clone đã sâu 1000 thì --depth=300 sẽ cắt bớt và mất merge base).
  let depth = 0;
  try { if (git('rev-parse', '--is-shallow-repository') === 'true') depth = Math.max(300, Number(git('rev-list', '--count', '--all')) + 50); } catch (e) { /* not a repo */ }
  if (fetch) { try { git('fetch', '-q', '--prune', ...(depth ? [`--depth=${depth}`] : []), 'origin', '+refs/heads/*:refs/remotes/origin/*'); } catch (e) { stale = true; /* offline: dùng bản đã tải, nhưng báo cho bên gọi */ } }
  const has = (ref) => { try { git('rev-parse', '-q', '--verify', ref); return true; } catch (e) { return false; } };
  if (!base) {
    try { base = git('symbolic-ref', '--short', 'refs/remotes/origin/HEAD').replace(/^origin\//, ''); } catch (e) { /* clone không ghi origin/HEAD */ }
    if (!base || !has(`refs/remotes/origin/${base}`)) base = ['main', 'master'].find((b) => has(`refs/remotes/origin/${b}`)) || 'main';
  }
  // Không có nhánh chính trên origin thì không so được gì: báo chưa chắc, không ném lỗi.
  if (!has(`refs/remotes/origin/${base}`)) return Object.assign([], { stale: true, base, missingBase: true });
  let current = '';
  try { current = git('rev-parse', '--abbrev-ref', 'HEAD'); } catch (e) { /* not a repo */ }
  const branches = git('for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin').split('\n')
    // Nhánh handoff là sổ bàn giao, không bao giờ merge (profile/HANDOFF.md): không phải việc chưa merge.
    .filter((b) => b && b !== 'origin' && b !== 'origin/HEAD' && b !== 'origin/handoff' && b !== `origin/${base}` && b !== `origin/${current}`);
  const out = [];
  for (const b of branches) {
    const ahead = Number(git('rev-list', '--count', `origin/${base}..${b}`));
    if (!ahead) continue;
    try { git('merge-base', '--is-ancestor', b, 'HEAD'); continue; } catch (e) { /* chưa gộp vào nhánh đang đứng */ }
    // Clone nông (--depth) có thể thiếu merge base: không so được thì coi là chưa chắc, không bỏ qua im lặng.
    let files; try { files = git('diff', '--name-only', `origin/${base}...${b}`).split('\n').filter(Boolean); } catch (e) { stale = true; continue; }
    const hit = paths.length ? files.filter((f) => paths.some((p) => f === p || f.startsWith(p.endsWith('/') ? p : p + '/'))) : files;
    if (paths.length && !hit.length) continue;
    const [date, subject] = git('log', '-1', '--format=%cs%x09%s', b).split('\t');
    out.push({ branch: b.replace(/^origin\//, ''), subject, date, ahead, files: hit, sha: git('rev-parse', b) });
  }
  // PR of each branch (tip commit = PR head). Not readable: leave it out, the list still stands.
  const prs = out.length ? prRefs({ cwd }) : null;
  if (prs) for (const w of out) { const n = prs.byHead.get(w.sha); w.pr = n ? { number: n, open: prs.byNumber.get(n).open } : null; }
  out.stale = stale; out.base = base;
  return out;
}

/** ", PR #N đang mở" and the like; nothing when PRs were not read. */
const prNote = (w) => w.pr === undefined ? '' : !w.pr ? ', chưa có PR'
  : w.pr.open ? `, PR #${w.pr.number} đang mở` : `, PR #${w.pr.number} đã đóng hay đang conflict: nhánh cũ, xem PR rồi xoá nhánh nếu không cần`;

export function report(list, paths = []) {
  if (list.missingBase) return `Không thấy nhánh chính origin/${list.base}. Chạy lại với --base <tên nhánh chính>, hoặc tự xem trang Pull requests trước khi làm.`;
  if (list.stale) return [`Không tải hay không so được nhánh trên origin (mất mạng, không có origin, hay repo clone nông?), nên chưa biết chắc còn việc chưa merge.`,
    `Tự xem trang Pull requests trước khi làm.`, ...(list.length ? [report(Object.assign([...list], { stale: false }), paths)] : [])].join('\n');
  if (!list.length) return paths.length ? `Không có nhánh chưa merge nào sửa ${paths.join(', ')}.` : 'Không có nhánh chưa merge.';
  return [paths.length ? `Có ${list.length} nhánh chưa merge sửa ${paths.join(', ')}. Đọc trước khi làm, đừng làm trùng:` : `Có ${list.length} nhánh chưa merge:`,
    ...list.map((w) => `- ${w.branch} (${w.date}, ${w.ahead} commit${prNote(w)}): ${w.subject}\n    ${w.files.slice(0, 8).join(', ')}${w.files.length > 8 ? ', …' : ''}`)].join('\n');
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  const bi = args.indexOf('--base'), base = bi >= 0 ? args.splice(bi, 2)[1] : undefined;
  const ni = args.indexOf('--no-fetch'), fetch = ni < 0; if (ni >= 0) args.splice(ni, 1);
  const list = openWork({ base, paths: args, fetch });
  console.log(report(list, args));
  process.exit(args.length && (list.length || list.stale) ? 1 : 0);
}
