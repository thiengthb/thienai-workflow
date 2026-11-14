// Runs the scripts that read Markdown on a copy of the repo where every text file has CRLF line endings, the way git
// on Windows (core.autocrlf=true) checks files out when .gitattributes is missing, or the way a handoff file from
// another repo, or a file AI wrote with a Windows editor, arrives. CI runs on Linux, so without this test a parser
// that looks for "\n" passes CI and fails on thien's laptop (found 2026-11-14: handoff list showed "Tiếp theo: ?",
// setup-check said SETUP.md was broken, after-lesson --check-all said no lesson was in the roadmap).
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkTask, summarize, readText } from '../../templates/handoff.mjs';
import { fill } from '../../artifacts/lesson/make-lesson.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const crlf = (s) => s.replace(/\r?\n/g, '\r\n');
const copy = mkdtempSync(join(tmpdir(), 'crlf-'));
// Every tracked file is copied; only text files get CRLF (fonts, images stay as they are).
const files = execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8' }).split('\0').filter(Boolean);
const TEXT = /\.(md|mjs|cjs|js|json|html|css|txt|csv|yml|yaml)$|(^|\/)\.git(ignore|attributes)$/;
for (const f of files) {
  mkdirSync(dirname(join(copy, f)), { recursive: true });
  const buf = readFileSync(join(ROOT, f));
  writeFileSync(join(copy, f), TEXT.test(f) ? crlf(buf.toString('utf8')) : buf);
}
const run = (args) => spawnSync(process.execPath, args, { cwd: copy, encoding: 'utf8' });

// 1. after-lesson --check-all finds every lesson in the CRLF roadmap, notes and cards.
let r = run(['artifacts/lesson/after-lesson.mjs', '--check-all']);
assert.equal(r.status, 0, 'after-lesson --check-all on CRLF files:\n' + r.stdout + r.stderr);

// 2. setup-check reads the CRLF SETUP.md and CRLF instructions pasted into a file.
const block = readFileSync(join(ROOT, 'profile/SETUP.md'), 'utf8').match(/```text\n([\s\S]*?)```/)[1].replace('<tên project>', 'Claude').replace('<tên nick>', 'tnt024');
// Skills as the session lists them, with the "(bản N)" number when SKILL.md has one (setup v2).
const skills = ['check-setup', 'start-project', 'make-slides'].map((n) => { const v = (readFileSync(join(ROOT, 'skills', n, 'SKILL.md'), 'utf8').match(/\(bản (\d+)\)\s*$/m) || [])[1]; return v ? `${n}@${v}` : n; }).join(',');
writeFileSync(join(copy, 'instr.txt'), crlf(block));
r = run(['templates/setup-check.mjs', '--project', 'Claude', '--instructions', 'instr.txt', '--repos', 'thiengthb/thienai-workflow', '--skills', skills, '--no-git']);
assert.equal(r.status, 0, 'setup-check on CRLF files:\n' + r.stdout + r.stderr);
assert.match(r.stdout, /ổn: project "Claude"/);

// 3. check-status reads the CRLF STATUS.md.
r = run(['templates/check-status.mjs', 'docs/STATUS.md']);
assert.equal(r.status, 0, 'check-status on CRLF STATUS.md:\n' + r.stdout + r.stderr);

// 4. handoff: a CRLF task file passes the format check and `list` still shows the next step and what waits for thien.
const task = crlf(`# Việc thử\n\nRepo: thiengthb/demo · Nhánh: x · PR: chưa có\nGhi bởi: Claude tnt024 · Cập nhật: 2026-11-14T10:00Z\n\n## thien muốn gì\nThử.\n\n## Đã xong\n- a\n\n## Bước tiếp theo\n1. Chạy lệnh b\n\n## Đang chờ thien\n- Chọn hướng 2\n`);
assert.deepEqual(checkTask(task, 'viec-thu.md'), []);
const sum = summarize('viec-thu.md', task);
assert.equal(sum.next, 'Chạy lệnh b');
assert.equal(sum.waiting, '- Chọn hướng 2');
// Windows PowerShell 5 `show ... > file` writes UTF-16LE with a BOM: readText still gets the same text.
writeFileSync(join(copy, 'u16.md'), Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(task, 'utf16le')]));
assert.equal(readText(join(copy, 'u16.md')), task.replace(/\r\n/g, '\n'));
r = run(['templates/handoff.mjs', 'check', 'u16.md']);
assert.equal(r.status, 0, r.stderr);
assert.ok(checkTask(task.replace('Thử.', 'token ghp_abcdefghijklmnopqrstuvwxyz0123'), 'viec-thu.md').some((p) => /token/.test(p)), 'secrets are refused');

// 5. make-lesson on a CRLF page: one kind of line ending out, and running it again changes nothing.
const tpl = crlf(readFileSync(join(ROOT, 'artifacts/lesson/template.html'), 'utf8')).replace('"__ID__"', '"frontend-06"');
const once = fill(tpl);
assert.ok(!once.includes('\r'), 'no mixed line endings');
assert.equal(fill(once), once);

// 6. Internal links still resolve when files are CRLF (the checker lists files with git, so the copy becomes a repo;
// core.autocrlf=false keeps the CRLF files as they are).
execFileSync('git', ['-c', 'core.autocrlf=false', 'init', '-q'], { cwd: copy });
execFileSync('git', ['-c', 'core.autocrlf=false', 'add', '-A'], { cwd: copy, stdio: 'ignore' });
r = spawnSync(process.execPath, [join(ROOT, '.github/scripts/check-links.mjs'), '--root', copy], { encoding: 'utf8' });
assert.equal(r.status, 0, r.stdout);
console.log('crlf: ok');
