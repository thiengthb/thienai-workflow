#!/usr/bin/env node
// Handoff book shared by all of thien's Claude accounts (decision docs/decisions/001-account-handoff.md).
// Each project keeps its own unfinished work in its own repo, on a `handoff` branch, one file per task:
// tasks/<slug>.md. The branch is never merged into main; AI pushes to it directly, after every step, so an
// account that runs out of usage mid-task loses only what was done since its last pushed commit and `save`.
// Another account says "tiếp tục", runs `list` (which reads thienai-workflow and every repo in
// life/tracked-repos.md), checks the book against git and PRs, and carries on.
//
//   node templates/handoff.mjs new <owner/repo> <slug> "<task title>"   print a filled-in skeleton (or write it with --out)
//   node templates/handoff.mjs save <slug>.md                            check, then push to tasks/<slug>.md of the repo in its "Repo:" line
//   node templates/handoff.mjs list [owner/repo]                         open tasks of all repos (or one), newest first
//   node templates/handoff.mjs show <owner/repo> <slug>                  print one task file (or write it with --out)
//   node templates/handoff.mjs done <owner/repo> <slug>                  remove a finished task
//   node templates/handoff.mjs check <slug>.md                           only check the format
// Options: --remote <git url> (save/show/done: use this remote instead of github.com/<owner/repo>),
//          --remotes <url,url> (list: these remotes instead of the tracked repos),
//          --out <file> (new/show: write the file instead of printing; on Windows PowerShell `>` writes UTF-16).
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync, mkdtempSync, realpathSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

export const BRANCH = 'handoff';
export const REQUIRED = ['## thien muốn gì', '## Đã xong', '## Bước tiếp theo', '## Đang chờ thien'];
const NAME = /^[a-z0-9._-]+\.md$/;

/**
 * Text of a task file, whatever wrote it: strips a BOM, decodes UTF-16 (Windows PowerShell 5 `>` writes UTF-16LE),
 * and turns CRLF into LF. A Windows checkout (git core.autocrlf) gives CRLF and every check below expects LF.
 */
export function readText(path) {
  const b = readFileSync(path);
  const s = b[0] === 0xff && b[1] === 0xfe ? b.toString('utf16le') : b[0] === 0xfe && b[1] === 0xff ? Buffer.from(b).swap16().toString('utf16le') : b.toString('utf8');
  return normalize(s);
}
export const normalize = (s) => s.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

// The book is pushed to git and stays in its history even after `done`: no secrets in it.
const SECRET = /\b(gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16}|xox[abpr]-[A-Za-z0-9-]{10,})|-----BEGIN [A-Z ]*PRIVATE KEY-----/;

/** Skeleton for a new task file. */
export function skeleton(repo, slug, title, now = new Date()) {
  return `# ${title}

Repo: ${repo} · Nhánh: <nhánh làm việc> · PR: chưa có
Ghi bởi: Claude <nick>, <link thread> · Cập nhật: ${now.toISOString().slice(0, 16)}Z

## thien muốn gì
<một hai câu bằng lời của thien, kèm link tin nhắn hay quyết định nếu có>

## Đã xong
- <mỗi bước một dòng, kèm commit hay link>

## Bước tiếp theo
1. <cụ thể tới mức nick khác làm được ngay: lệnh nào, file nào>

## Đang chờ thien
Không.
<!-- Hoặc, khi dừng ở bước chọn trên trang:
- Trang: <link> (mở ở nick <nick>) · Hỏi gì: <câu hỏi>
- Đăng lại: \`<lệnh dựng trang>\` rồi gọi Artifact với publish.json; nguồn trang nằm ở <đường dẫn trong nhánh làm việc>
-->

## Lưu ý
- <điều nick sau dễ làm sai>
`;
}

/** Problems with a task file, in Vietnamese; empty when it is fine. */
export function checkTask(text, name = '') {
  text = normalize(text);
  const out = [];
  if (name && !NAME.test(name)) out.push(`tên file "${name}" phải dạng <việc>.md, chữ thường, không dấu`);
  if (!/^# \S/m.test(text)) out.push('thiếu dòng tiêu đề "# <tên việc>"');
  if (!/^Repo: [\w.-]+\/[\w.-]+/m.test(text)) out.push('thiếu dòng "Repo: <owner/repo> · ..."');
  if (!/Cập nhật: \d{4}-\d{2}-\d{2}/.test(text)) out.push('thiếu "Cập nhật: YYYY-MM-DD..."');
  if (!/^Ghi bởi: Claude (tnt\d{2,}\b|nick chưa rõ)/m.test(text)) out.push('dòng "Ghi bởi" phải có tên nick: "Ghi bởi: Claude tntXXX, <link thread>" (lấy ở dòng "nick:" của project instructions; instructions chưa có tên nick thì ghi "Claude nick chưa rõ" và nhắc thien dán instructions bản mới)');
  for (const h of REQUIRED) if (!text.includes(h + '\n')) out.push(`thiếu mục "${h}"`);
  const next = section(text, '## Bước tiếp theo');
  if (!next || /^\s*1\.\s*<[^>]*>\s*$/m.test(next) || !next.replace(/<!--[\s\S]*?-->/g, '').trim()) out.push('mục "Bước tiếp theo" còn trống');
  if (SECRET.test(text)) out.push('có chuỗi giống token hay khoá bí mật: xoá đi, sổ nằm trong lịch sử git mãi mãi');
  return out;
}

/** Body of a "## " section, without the heading. */
export function section(text, heading) {
  text = normalize(text);
  const i = text.indexOf(heading + '\n');
  if (i < 0) return '';
  const rest = text.slice(i + heading.length + 1);
  const j = rest.search(/^## /m);
  return (j < 0 ? rest : rest.slice(0, j)).trim();
}

/** One-line summary used by `list`. */
export function summarize(name, text) {
  text = normalize(text);
  const title = (text.match(/^# (.+)$/m) || [])[1] || name;
  const repo = (text.match(/^Repo: ([^·\n]+)/m) || [])[1]?.trim() || '?';
  const updated = (text.match(/Cập nhật: ([0-9T:-]+Z?)/) || [])[1] || '';
  const nick = (text.match(/^Ghi bởi: Claude (tnt\d+|nick chưa rõ)/m) || [])[1] || '';
  const next = (section(text, '## Bước tiếp theo').split('\n').find(l => l.trim() && !l.startsWith('<!--')) || '').replace(/^\d+\.\s*/, '');
  const waiting = section(text, '## Đang chờ thien').replace(/<!--[\s\S]*?-->/g, '').trim();
  return { name, title, repo, updated, nick, next, waiting: waiting && !/^Không\.?$/i.test(waiting) ? waiting : '' };
}

function git(args, cwd, quiet = true) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (r.status !== 0 && !quiet) process.stderr.write(r.stderr);
  return r;
}

// Lost-update guard: a local copy carries "<!-- handoff-base: <hash> -->", the hash of the book's version it was
// based on (written by `show` and after each `save`). `save` refuses when the book changed since then.
const BASE = /\n?<!-- handoff-base: ([0-9a-f]+) -->\n?$/;
export const stripBase = (text) => text.replace(BASE, '\n').replace(/\n+$/, '\n');
export const baseOf = (text) => (text.match(BASE) || [])[1];
export const hashOf = (text) => createHash('sha1').update(stripBase(text)).digest('hex').slice(0, 12);
/** Sets "Cập nhật:" to now, so list order and the 24-hour claim rule use the save time. */
export const stamp = (text, now = new Date()) => normalize(text).replace(/Cập nhật: [0-9T:-]+Z?/, `Cập nhật: ${now.toISOString().slice(0, 16)}Z`);
export const withBase = (text) => stripBase(text) + `<!-- handoff-base: ${hashOf(text)} -->\n`;

export const repoOf = (text) => (text.match(/^Repo: ([\w.-]+\/[\w.-]+)/m) || [])[1];
const urlOf = (repo) => `https://github.com/${repo}`;
const here = dirname(dirname(fileURLToPath(import.meta.url)));

/** thienai-workflow plus every repo in life/tracked-repos.md. */
export function allRepos() {
  const md = existsSync(join(here, 'life/tracked-repos.md')) ? readFileSync(join(here, 'life/tracked-repos.md'), 'utf8') : '';
  const tracked = md.split('\n').map(l => l.match(/^\|\s*`([\w.-]+\/[\w.-]+)`\s*\|/)).filter(Boolean).map(m => m[1]);
  return ['thiengthb/thienai-workflow', ...tracked];
}

// Every clone this tool makes is a throwaway temp dir, removed when the command ends (see main).
const temps = [];
function tempDir() { const d = mkdtempSync(join(tmpdir(), 'handoff-')); temps.push(d); return d; }

/**
 * Clone of the handoff branch for reading. Returns the dir, 'none' when the repo has no handoff branch yet,
 * or null when the repo cannot be read (no access, network).
 */
export function readOnly(remote) {
  const dir = tempDir();
  if (git(['-c', 'core.autocrlf=false', 'clone', '-q', '--depth', '1', '--branch', BRANCH, remote, dir]).status === 0) {
    mkdirSync(join(dir, 'tasks'), { recursive: true }); // git keeps no empty dirs: an emptied book has no tasks/
    return dir;
  }
  // Exit code 2: the remote answered and has no handoff branch, so the book is simply empty.
  return git(['ls-remote', '--exit-code', remote, 'refs/heads/' + BRANCH]).status === 2 ? 'none' : null;
}

/** A fresh shallow clone of the handoff branch (or an empty orphan branch when it does not exist yet). */
export function checkout(remote) {
  const dir = tempDir();
  const c = git(['-c', 'core.autocrlf=false', 'clone', '-q', '--depth', '1', '--branch', BRANCH, remote, dir]);
  if (c.status !== 0) {
    if (git(['ls-remote', '--exit-code', remote, 'refs/heads/' + BRANCH]).status !== 2) throw new Error('không clone được nhánh handoff: ' + c.stderr.trim());
    git(['init', '-q', '-b', BRANCH], dir);
    git(['remote', 'add', 'origin', remote], dir);
  }
  mkdirSync(join(dir, 'tasks'), { recursive: true });
  return dir;
}

/**
 * Commits whatever changed and pushes. When another account pushed first, rebases and tries again (up to 4 times);
 * a failed fetch or a rebase conflict (two accounts editing the same task) stops with an error instead of pushing.
 */
export function commitPush(dir, message) {
  git(['add', '-A'], dir);
  if (git(['diff', '--cached', '--quiet'], dir).status === 0) return 'không có gì đổi';
  const who = ['-c', 'user.name=' + (git(['config', 'user.name'], dir).stdout.trim() || 'Claude'),
    '-c', 'user.email=' + (git(['config', 'user.email'], dir).stdout.trim() || 'noreply@anthropic.com')];
  if (git([...who, 'commit', '-q', '-m', message], dir, false).status !== 0) throw new Error('commit lỗi');
  for (let i = 0; i < 4; i++) {
    const push = git(['push', '-q', 'origin', 'HEAD:' + BRANCH], dir);
    if (push.status === 0) return 'đã đẩy';
    if (i === 3) break;
    const f = git(['fetch', '-q', '--depth', '50', 'origin', BRANCH], dir);
    if (f.status !== 0) throw new Error('đẩy bị từ chối và không fetch được nhánh handoff: ' + (f.stderr || push.stderr).trim());
    const r = git([...who, 'rebase', '-q', 'FETCH_HEAD'], dir);
    if (r.status !== 0) {
      git(['rebase', '--abort'], dir);
      throw new Error('nick khác vừa sửa cùng việc này trong sổ; chạy `show` để đọc bản mới, gộp tay rồi `save` lại. Chưa đẩy gì.');
    }
    spawnSync('sleep', [String(2 ** i)]);
  }
  throw new Error('đẩy lên nhánh handoff không được sau 4 lần');
}

function main(argv) {
  const opt = (k) => { const i = argv.indexOf(k); if (i < 0) return undefined; const v = argv[i + 1]; argv.splice(i, 2); return v; };
  const remoteOpt = opt('--remote');
  const remotesOpt = opt('--remotes');
  const outOpt = opt('--out');
  const emit = (text) => { if (outOpt) { writeFileSync(outOpt, text); console.error('Đã ghi ' + outOpt); } else process.stdout.write(text); };
  const [cmd, a, b, c] = argv;
  const fail = (msg) => { throw new Error(msg); };

  if (cmd === 'new') {
    if (!a || !b) fail('dùng: new <owner/repo> <slug> "<tên việc>"');
    emit(skeleton(a, b, c || b));
    console.error(`Lưu thành ${b}.md, điền rồi chạy: node templates/handoff.mjs save ${b}.md`);
    return;
  }
  if (cmd === 'check' || cmd === 'save') {
    if (!a || !existsSync(a)) fail('không thấy file ' + (a || ''));
    let text = readText(a);
    const probs = checkTask(text, basename(a));
    if (probs.length) fail('Sổ bàn giao chưa đúng mẫu:\n- ' + probs.join('\n- '));
    if (cmd === 'check') return console.log('ổn');
    const repo = repoOf(text);
    const dir = checkout(remoteOpt || urlOf(repo));
    const target = join(dir, 'tasks', basename(a));
    if (existsSync(target)) {
      const current = readText(target);
      if (hashOf(current) !== hashOf(text) && baseOf(text) !== hashOf(current)) {
        fail(`Trong sổ, việc ${basename(a, '.md')} đã được sửa từ lúc bạn đọc (có thể bởi nick khác). Chưa ghi gì. ` +
          `Chạy \`show ${repo} ${basename(a, '.md')} > ${basename(a, '.md')}.new.md\` để lấy bản mới vào file riêng (đừng ghi đè file đang sửa). ` +
          `Gộp phần của mình từ ${basename(a)} vào ${basename(a, '.md')}.new.md, đổi tên file đó thành ${basename(a)} rồi chạy \`save ${basename(a)}\`.`);
      }
    } else if (baseOf(text)) {
      fail(`Việc ${basename(a, '.md')} không còn trong sổ của ${repo} (đã \`done\` hay bị xoá từ lúc bạn đọc). Chưa ghi gì. ` +
        'Nếu việc vẫn còn dở, xoá dòng handoff-base ở cuối file rồi `save` lại để tạo lại việc.');
    }
    const saved = stamp(text, process.env.HANDOFF_NOW ? new Date(process.env.HANDOFF_NOW) : new Date()); // HANDOFF_NOW: fixed clock for tests
    writeFileSync(target, stripBase(saved));
    const out = commitPush(dir, `handoff: update ${basename(a, '.md')}`);
    writeFileSync(a, withBase(saved)); // the next save from this copy is based on what was just written
    console.log(out + `: ${repo}, nhánh ${BRANCH}, tasks/${basename(a)}`);
    return;
  }
  if (cmd === 'list') {
    const remotes = remotesOpt ? remotesOpt.split(',').map(r => [r, r]) : (a ? [a] : allRepos()).map(r => [r, urlOf(r)]);
    const rows = [];
    const unread = [];
    for (const [name, url] of remotes) {
      const dir = readOnly(url);
      if (dir === 'none') continue;
      if (!dir) { unread.push(name); continue; }
      for (const f of readdirSync(join(dir, 'tasks')).filter(f => f.endsWith('.md'))) rows.push(summarize(f, readText(join(dir, 'tasks', f))));
    }
    rows.sort((x, y) => y.updated.localeCompare(x.updated));
    if (!rows.length) console.log('Không có việc dở nào trong sổ bàn giao.');
    for (const r of rows) {
      console.log(`- ${r.title} (${r.repo}, nick ${r.nick || '?'}, cập nhật ${r.updated || '?'}) · show ${r.repo} ${r.name.replace(/\.md$/, '')}`);
      console.log(`  Tiếp theo: ${r.next || '?'}`);
      if (r.waiting) console.log(`  Đang chờ thien: ${r.waiting.split('\n')[0]}`);
    }
    if (unread.length) console.log(`Không đọc được: ${unread.join(', ')} (phiên chưa có quyền đọc repo đó; gắn repo vào phiên rồi chạy lại).`);
    return;
  }
  if (cmd === 'show' || cmd === 'done') {
    if (!a || !b) fail(`dùng: ${cmd} <owner/repo> <slug>`);
    const name = b.endsWith('.md') ? b : b + '.md';
    const dir = cmd === 'show' ? readOnly(remoteOpt || urlOf(a)) : checkout(remoteOpt || urlOf(a));
    if (!dir || dir === 'none' || !existsSync(join(dir, 'tasks', name))) fail(`không có việc ${b} trong sổ của ${a}`);
    if (cmd === 'show') return emit(withBase(readText(join(dir, 'tasks', name))));
    rmSync(join(dir, 'tasks', name));
    console.log(commitPush(dir, `handoff: done ${basename(name, '.md')}`) + `: đã xoá tasks/${name} ở ${a}`);
    return;
  }
  fail('lệnh: new | save | list | show | done | check (xem đầu file templates/handoff.mjs)');
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  let code = 0;
  try { main(process.argv.slice(2)); } catch (e) { console.error(e.message); code = 1; }
  finally { for (const d of temps) rmSync(d, { recursive: true, force: true }); }
  process.exitCode = code;
}
