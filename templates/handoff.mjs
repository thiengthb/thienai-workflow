#!/usr/bin/env node
// Handoff book shared by all of thien's Claude accounts (decision docs/decisions/001-account-handoff.md).
// Unfinished work lives on the `handoff` branch of thienai-workflow, one file per task: tasks/<repo>--<slug>.md.
// The branch is never merged into main; AI pushes to it directly, after every step, so an account that runs
// out of usage mid-task loses at most one step. Another account says "tiếp tục", runs `list`, and carries on.
//
//   node templates/handoff.mjs new <owner/repo> <slug> "<task title>"   print a filled-in skeleton to stdout
//   node templates/handoff.mjs save <file.md>                            check, then commit + push to tasks/<file name>
//   node templates/handoff.mjs list                                      open tasks, newest first, with next step
//   node templates/handoff.mjs show <name>                               print one task file
//   node templates/handoff.mjs done <name>                               remove a finished task
//   node templates/handoff.mjs check <file.md>                           only check the format
// Options: --remote <git url> (default: origin of this repo), --dir <path> (reuse a clone of the branch).
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync, mkdtempSync, realpathSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const BRANCH = 'handoff';
export const REQUIRED = ['## thien muốn gì', '## Đã xong', '## Bước tiếp theo', '## Đang chờ thien'];
const NAME = /^[a-z0-9._-]+--[a-z0-9._-]+\.md$/;

/** Skeleton for a new task file. */
export function skeleton(repo, slug, title, now = new Date()) {
  return `# ${title}

Repo: ${repo} · Nhánh: <nhánh làm việc> · PR: chưa có
Ghi bởi: Claude, <link thread> · Cập nhật: ${now.toISOString().slice(0, 16)}Z

## thien muốn gì
<một hai câu bằng lời của thien, kèm link tin nhắn hay quyết định nếu có>

## Đã xong
- <mỗi bước một dòng, kèm commit hay link>

## Bước tiếp theo
1. <cụ thể tới mức nick khác làm được ngay: lệnh nào, file nào>

## Đang chờ thien
Không.
<!-- Hoặc, khi dừng ở bước chọn trên trang:
- Trang: <link cũ, chỉ mở được ở nick cũ> · Hỏi gì: <câu hỏi>
- Đăng lại: \`<lệnh dựng trang>\` rồi gọi Artifact với publish.json; nguồn trang nằm ở <đường dẫn trong nhánh làm việc>
-->

## Lưu ý
- <điều nick sau dễ làm sai>
`;
}

/** Problems with a task file, in Vietnamese; empty when it is fine. */
export function checkTask(text, name = '') {
  const out = [];
  if (name && !NAME.test(name)) out.push(`tên file "${name}" phải dạng <repo>--<việc>.md, chữ thường, không dấu`);
  if (!/^# \S/m.test(text)) out.push('thiếu dòng tiêu đề "# <tên việc>"');
  if (!/^Repo: \S+/m.test(text)) out.push('thiếu dòng "Repo: ..."');
  if (!/Cập nhật: \d{4}-\d{2}-\d{2}/.test(text)) out.push('thiếu "Cập nhật: YYYY-MM-DD..."');
  for (const h of REQUIRED) if (!text.includes(h + '\n')) out.push(`thiếu mục "${h}"`);
  const next = section(text, '## Bước tiếp theo');
  if (!next || /^\s*1\.\s*<[^>]*>\s*$/m.test(next) || !next.replace(/<!--[\s\S]*?-->/g, '').trim()) out.push('mục "Bước tiếp theo" còn trống');
  return out;
}

/** Body of a "## " section, without the heading. */
export function section(text, heading) {
  const i = text.indexOf(heading + '\n');
  if (i < 0) return '';
  const rest = text.slice(i + heading.length + 1);
  const j = rest.search(/^## /m);
  return (j < 0 ? rest : rest.slice(0, j)).trim();
}

/** One-line summary used by `list`. */
export function summarize(name, text) {
  const title = (text.match(/^# (.+)$/m) || [])[1] || name;
  const repo = (text.match(/^Repo: ([^·\n]+)/m) || [])[1]?.trim() || '?';
  const updated = (text.match(/Cập nhật: ([0-9T:-]+Z?)/) || [])[1] || '';
  const next = (section(text, '## Bước tiếp theo').split('\n').find(l => l.trim() && !l.startsWith('<!--')) || '').replace(/^\d+\.\s*/, '');
  const waiting = section(text, '## Đang chờ thien').replace(/<!--[\s\S]*?-->/g, '').trim();
  return { name, title, repo, updated, next, waiting: waiting && !/^Không\.?$/i.test(waiting) ? waiting : '' };
}

function git(args, cwd, quiet = true) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (r.status !== 0 && !quiet) process.stderr.write(r.stderr);
  return r;
}

function defaultRemote() {
  const here = dirname(dirname(fileURLToPath(import.meta.url)));
  const r = git(['remote', 'get-url', 'origin'], here);
  return r.status === 0 ? r.stdout.trim() : 'https://github.com/thiengthb/thienai-workflow';
}

/** A fresh shallow clone of the handoff branch (or an empty orphan branch when it does not exist yet). */
export function checkout(remote, dir) {
  if (dir && existsSync(join(dir, '.git'))) {
    git(['fetch', '--depth', '1', 'origin', BRANCH], dir);
    git(['reset', '--hard', 'FETCH_HEAD'], dir);
    return dir;
  }
  dir = dir || mkdtempSync(join(tmpdir(), 'handoff-'));
  const c = git(['clone', '--depth', '1', '--branch', BRANCH, remote, dir]);
  if (c.status !== 0) {
    if (!/not found|Could not find remote branch/i.test(c.stderr)) throw new Error('không clone được nhánh handoff: ' + c.stderr.trim());
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    git(['init', '-q', '-b', BRANCH], dir);
    git(['remote', 'add', 'origin', remote], dir);
  }
  mkdirSync(join(dir, 'tasks'), { recursive: true });
  return dir;
}

/** Commits whatever changed and pushes, rebasing on the remote up to 4 times when another account pushed first. */
export function commitPush(dir, message) {
  git(['add', '-A'], dir);
  if (git(['diff', '--cached', '--quiet'], dir).status === 0) return 'không có gì đổi';
  const who = ['-c', 'user.name=' + (git(['config', 'user.name'], dir).stdout.trim() || 'Claude'),
    '-c', 'user.email=' + (git(['config', 'user.email'], dir).stdout.trim() || 'noreply@anthropic.com')];
  if (git([...who, 'commit', '-q', '-m', message], dir, false).status !== 0) throw new Error('commit lỗi');
  for (let i = 0; i < 4; i++) {
    if (git(['push', '-q', 'origin', 'HEAD:' + BRANCH], dir, i === 3).status === 0) return 'đã đẩy';
    git(['fetch', '-q', '--depth', '50', 'origin', BRANCH], dir);
    git([...who, 'rebase', '-q', 'FETCH_HEAD'], dir);
    spawnSync('sleep', [String(2 ** i)]);
  }
  throw new Error('đẩy lên nhánh handoff không được sau 4 lần');
}

function main(argv) {
  const opt = (k) => { const i = argv.indexOf(k); if (i < 0) return undefined; const v = argv[i + 1]; argv.splice(i, 2); return v; };
  const remote = opt('--remote') || defaultRemote();
  const dirOpt = opt('--dir');
  const [cmd, a, b, c] = argv;
  const fail = (msg) => { console.error(msg); process.exit(1); };

  if (cmd === 'new') {
    if (!a || !b) fail('dùng: new <owner/repo> <slug> "<tên việc>"');
    process.stdout.write(skeleton(a, b, c || b));
    console.error(`Lưu thành ${a.split('/').pop().toLowerCase()}--${b}.md, điền rồi chạy: node templates/handoff.mjs save <file>`);
    return;
  }
  if (cmd === 'check' || cmd === 'save') {
    if (!a || !existsSync(a)) fail('không thấy file ' + (a || ''));
    const probs = checkTask(readFileSync(a, 'utf8'), basename(a));
    if (probs.length) fail('Sổ bàn giao chưa đúng mẫu:\n- ' + probs.join('\n- '));
    if (cmd === 'check') return console.log('ổn');
    const dir = checkout(remote, dirOpt);
    writeFileSync(join(dir, 'tasks', basename(a)), readFileSync(a));
    console.log(commitPush(dir, `handoff: update ${basename(a, '.md')}`) + `: tasks/${basename(a)} (nhánh ${BRANCH})`);
    return;
  }
  if (cmd === 'list' || cmd === 'show' || cmd === 'done') {
    const dir = checkout(remote, dirOpt);
    const tasks = join(dir, 'tasks');
    if (cmd === 'list') {
      const rows = readdirSync(tasks).filter(f => f.endsWith('.md'))
        .map(f => summarize(f, readFileSync(join(tasks, f), 'utf8')))
        .sort((x, y) => y.updated.localeCompare(x.updated));
      if (!rows.length) return console.log('Không có việc dở nào trong sổ bàn giao.');
      for (const r of rows) {
        console.log(`- ${r.title} (${r.repo}, cập nhật ${r.updated || '?'}) · file ${r.name}`);
        console.log(`  Tiếp theo: ${r.next || '?'}`);
        if (r.waiting) console.log(`  Đang chờ thien: ${r.waiting.split('\n')[0]}`);
      }
      return;
    }
    const name = a && (a.endsWith('.md') ? a : a + '.md');
    if (!name || !existsSync(join(tasks, name))) fail('không có việc ' + (a || '') + ' trong sổ');
    if (cmd === 'show') return process.stdout.write(readFileSync(join(tasks, name), 'utf8'));
    rmSync(join(tasks, name));
    console.log(commitPush(dir, `handoff: done ${basename(name, '.md')}`) + `: đã xoá tasks/${name}`);
    return;
  }
  fail('lệnh: new | save | list | show | done | check (xem đầu file templates/handoff.mjs)');
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  try { main(process.argv.slice(2)); } catch (e) { console.error(e.message); process.exit(1); }
}
