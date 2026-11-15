// Tests for templates/start-session.mjs, run in CI by .github/workflows/test.yml.
// Uses local bare repos as remotes for the handoff book, so nothing touches GitHub.
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { statusParts, claimText, otherNickNote, branchOf } from '../../templates/start-session.mjs';
import { skeleton } from '../../templates/handoff.mjs';

// STATUS: only the parts a new session needs, history left out.
const status = '# Tiến độ\n\nCập nhật lần cuối: 2026-11-15 · x\n\n## Đang ở đâu\nlịch sử dài\n\n## Kế hoạch đang chạy\n| a |\n\n## Việc dở\n- v\n\n## Vừa xong\n- cũ\n\n## Đang chờ thien\n- c\n';
const parts = statusParts(status);
assert.match(parts, /^Cập nhật lần cuối/);
assert.match(parts, /## Kế hoạch đang chạy/); assert.match(parts, /## Việc dở/); assert.match(parts, /## Đang chờ thien/);
assert.doesNotMatch(parts, /lịch sử dài|## Vừa xong/, 'history parts are skipped');
assert.match(statusParts(status.replace(/\n/g, '\r\n')), /## Việc dở/, 'CRLF STATUS works');

// Claim: "Ghi bởi" changes, the rest of the file does not.
const task = skeleton('a/b', 'x', 'Việc X', new Date('2026-11-15T07:00:00Z')).replace('Claude <nick>, <link thread>', 'Claude tnt024, https://old')
  .replace('1. <cụ thể tới mức nick khác làm được ngay: lệnh nào, file nào>', '1. Làm bước 2');
const claimed = claimText(task, 'Claude tnt697, https://new');
assert.match(claimed, /^Ghi bởi: Claude tnt697, https:\/\/new · Cập nhật: 2026-11-15T07:00Z$/m);
assert.equal(claimed.replace(/^Ghi bởi:.*$/m, ''), task.replace(/^Ghi bởi:.*$/m, ''), 'only the author line changes');

// Another nick within 24 hours: said out loud; same nick or older: nothing.
const row = { nick: 'tnt024', updated: '2026-11-15T07:00Z' };
assert.match(otherNickNote(row, 'Claude tnt697, l', new Date('2026-11-15T10:00Z')), /tnt024/);
assert.equal(otherNickNote(row, 'Claude tnt024, l', new Date('2026-11-15T10:00Z')), '');
assert.equal(otherNickNote(row, 'Claude tnt697, l', new Date('2026-11-17T10:00Z')), '');

assert.equal(branchOf('Repo: a/b · Nhánh: feat/x · PR: #3'), 'feat/x');
assert.equal(branchOf('Repo: a/b · Nhánh: chưa có (tạo từ main) · PR: #82'), '');
assert.equal(branchOf('Repo: a/b · Nhánh: <nhánh làm việc> · PR: chưa có'), '');

// End to end: a book with two tasks in a local bare repo; --claim takes the newest and pushes the claim.
const root = mkdtempSync(join(tmpdir(), 'start-session-'));
const bare = join(root, 'b.git');
spawnSync('git', ['init', '-q', '--bare', bare]);
const env = { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' };
const handoff = fileURLToPath(new URL('../../templates/handoff.mjs', import.meta.url));
const cli = fileURLToPath(new URL('../../templates/start-session.mjs', import.meta.url));
const save = (name, text, at) => {
  writeFileSync(join(root, name), text);
  const r = spawnSync('node', [handoff, 'save', join(root, name), '--remote', bare], { encoding: 'utf8', env: { ...env, HANDOFF_NOW: at } });
  assert.equal(r.status, 0, r.stderr);
};
save('old.md', task.replace('# Việc X', '# Việc cũ'), '2026-11-14T01:00:00Z');
save('new.md', task.replace('Nhánh: <nhánh làm việc>', 'Nhánh: feat/gone'), '2026-11-15T08:00:00Z');
const work = mkdtempSync(join(root, 'work-'));
const start = (...a) => spawnSync('node', [cli, '--remote-map', 'a/b=' + bare, '--task-dir', work, '--no-fetch', ...a], { encoding: 'utf8', env });

let r = start();
assert.equal(r.status, 0, r.stderr);
assert.match(r.stdout, /Chưa kiểm \(không có --project\)/);
assert.ok(r.stdout.indexOf('Việc X') < r.stdout.indexOf('Việc cũ'), 'newest task first');
assert.doesNotMatch(r.stdout, /## Nhận việc/, 'no claim without --claim');
assert.match(r.stdout, /## STATUS/);
assert.match(r.stdout, /## AGENTS\.md/, 'AGENTS.md is printed, no extra turn to load it');
assert.doesNotMatch(start('--no-agents').stdout, /## AGENTS\.md/);

r = start('--claim', 'Claude tnt697, https://new');
assert.equal(r.status, 0, r.stdout + r.stderr);
assert.match(r.stdout, /đã đẩy: a\/b, nhánh handoff, tasks\/new\.md/);
assert.match(r.stdout, /nick tnt024 ghi lúc/, 'claim from another nick within 24 hours is said out loud');
assert.match(r.stdout, /sổ có 2 việc/);
assert.match(r.stdout, /Nhánh feat\/gone không còn trên origin/);
assert.match(readFileSync(join(work, 'new.md'), 'utf8'), /^Ghi bởi: Claude tnt697, https:\/\/new/m, 'working copy carries the claim');
const show = spawnSync('node', [handoff, 'show', 'a/b', 'new', '--remote', bare], { encoding: 'utf8', env });
assert.match(show.stdout, /^Ghi bởi: Claude tnt697, https:\/\/new/m, 'the book has the claim');

// --task picks another task; claiming it with a stale copy elsewhere is still guarded by save.
r = start('--claim', 'Claude tnt697, https://new', '--task', 'a/b:old');
assert.equal(r.status, 0, r.stdout + r.stderr);
assert.match(r.stdout, /tasks\/old\.md/);
r = start('--claim', 'Claude tnt697, https://new', '--task', 'a/b:missing');
assert.match(r.stdout, /Không thấy việc a\/b:missing/);

// Setup check runs first and its fixes make the exit code 1, but the rest is still printed.
r = start('--project', 'Claude', '--instructions', 'none', '--repos', 'thiengthb/thienai-workflow', '--no-git');
assert.equal(r.status, 1);
assert.match(r.stdout, /Thiếu setup/);
assert.match(r.stdout, /## Sổ bàn giao/);

rmSync(root, { recursive: true, force: true });
console.log('ok start-session');
